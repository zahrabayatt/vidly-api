const validate = require("../middlewares/validate");
const moment = require("moment");
const Joi = require("joi");
const authorization = require("../middlewares/authorization");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();

router.post(
  "/",
  [authorization, validate(validateReturn)],
  async (req, res) => {
    let rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    if (!rental) {
      res.status(404).send("Rental not found!");
      return;
    }

    if (rental.dateReturned) {
      res.status(400).send("Rental is already processed!");
      return;
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        rental.dateReturned = new Date();
        const rentalDays = moment().diff(rental.dateOut, "days");
        rental.rentalFee = rentalDays * rental.movie.dailyRentalRate;

        await rental.save();
        await Movie.updateOne(
          { _id: rental.movie._id },
          { $inc: { numberInStock: 1 } },
          { session: session }
        );

        res.status(200).send(rental);
      });
    } finally {
      await session.endSession();
    }
  }
);

function validateReturn(param) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });

  return schema.validate(param);
}

module.exports = router;
