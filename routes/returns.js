const moment = require("moment");
const Joi = require("joi");
const authorization = require("../middlewares/authorization");
const express = require("express");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const router = express.Router();

router.post("/", authorization, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400).send(error.message);
    return;
  }

  let rental = await Rental.findOne({
    "customer._id": req.body.customerId,
    "movie._id": req.body.movieId,
  });

  if (!rental) {
    res.status(404).send("Rental not found!");
    return;
  }

  if (rental.dateReturned) {
    res.status(400).send("Rental is already processed!");
    return;
  }

  rental.dateReturned = new Date();
  const rentalDays = moment().diff(rental.dateOut, "days");
  rental.rentalFee = rentalDays * rental.movie.dailyRentalRate;

  await rental.save();

  await Movie.updateOne(
    { _id: rental.movie._id },
    { $inc: { numberInStock: 1 } }
  );

  res.status(200).send();
});

function validate(param) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });

  return schema.validate(param);
}

module.exports = router;
