const moment = require("moment");
const request = require("supertest");
const { Rental } = require("../../models/rental");
const mongoose = require("mongoose");
const { User } = require("../../models/user");
const { Movie } = require("../../models/movie");

describe("/api/returns", () => {
  let server;
  let movie;
  let rental;
  let customerId;
  let movieId;

  beforeEach(async () => {
    server = require("../../index");
    customerId = new mongoose.Types.ObjectId();
    movieId = new mongoose.Types.ObjectId();

    movie = new Movie({
      _id: movieId,
      title: "12345",
      genre: {
        name: "12345",
      },
      numberInStock: 10,
      dailyRentalRate: 2,
    });
    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "12345",
        phone: "12345",
      },
      movie: {
        _id: movie._id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate,
      },
    });
    await rental.save();
  });

  afterEach(async () => {
    await server.close();
    await Rental.deleteMany();
    await Movie.deleteMany();
  });

  describe("POST /", () => {
    let token;

    const exec = () => {
      return request(server)
        .post("/api/returns")
        .set("x-auth-token", token)
        .send({ customerId, movieId });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if customerId is not provided", async () => {
      customerId = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if movieId is not provided", async () => {
      movieId = "";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 if no rental found for this customer/movie", async () => {
      await Rental.deleteMany();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 400 if rental already processed", async () => {
      rental.dateReturned = new Date();
      await rental.save();

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 200 if valid request", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should set the returnData if input is valid", async () => {
      const res = await exec();
      const rentalIndDb = await Rental.findById(rental._id);
      const diff = new Date() - rentalIndDb.dateReturned;

      expect(diff).toBeLessThan(10 * 1000);
    });

    it("should set the rentalFee if input is valid", async () => {
      const rentalDays = 7;
      rental.dateOut = moment().add(-rentalDays, "days").toDate();
      await rental.save();

      await exec();

      const rentalIndDb = await Rental.findById(rental._id);

      expect(rentalIndDb.rentalFee).toBe(
        rentalDays * rentalIndDb.movie.dailyRentalRate
      );
    });

    it("should increase the movie stock if input is valid", async () => {
      await exec();

      const movieInDb = await Movie.findById(movieId);

      expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
    });

    it("should return the rental if input is valid", async () => {
      const res = await exec();

      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining([
          "dateOut",
          "dateReturned",
          "rentalFee",
          "customer",
          "movie",
        ])
      );
    });
  });
});
