const Joi = require("joi");
const authorization = require("../middlewares/authorization");
const express = require("express");
const { Rental } = require("../models/rental");
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
  // or
  //   let rental = await Rental.findOne({
  //     movie: { _id: req.body.movieId },
  //     customer: { _id: req.body.customerId },
  //   });

  if (!rental) {
    res.status(404).send("Rental not found!");
    return;
  }
});

function validate(param) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });

  return schema.validate(param);
}

module.exports = router;
