const authorization = require("../middlewares/authorization");
const { Rental, validate } = require("../models/rental");
const { Movie } = require("../models/movie");
const { Customer } = require("../models/customer");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const rentals = await Rental.find().sort("-dateOut");
  res.send(rentals);
});

router.get("/:id", async (req, res) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental) {
    res.status(404).send("The rental with the given ID was not found!");
    return;
  }

  res.send(rental);
});

router.post("/", authorization, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400).send(error.message);
    return;
  }

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) {
    res.status(400).send("Invalid customer.");
    return;
  }

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) {
    res.status(400).send("Invalid movie.");
    return;
  }

  if (movie.numberInStock === 0) {
    res.status(400).send("Movie not in stock.");
    return;
  }

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const resultRental = await rental.save({ session: session });
      await movie.updateOne(
        { $inc: { numberInStock: -1 } },
        { session: session }
      );
      res.send(rental);
    });
  } finally {
    await session.endSession();
  }
});

module.exports = router;
