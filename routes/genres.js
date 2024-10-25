const validate = require("../middlewares/validate");
const validationObjectId = require("../middlewares/validateObjectId");
const authorization = require("../middlewares/authorization");
const admin = require("../middlewares/admin");
const { Genre, validateGenre } = require("../models/genre");
const express = require("express");
const { valid } = require("joi");
const router = express.Router();

router.get("/", async (req, res) => {
  const genres = await Genre.find().sort("name");
  res.send(genres);
});

router.get("/:id", validationObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre) {
    res.status(404).send("The genre with the given ID was not found!");
    return;
  }

  res.send(genre);
});

router.post(
  "/",
  [authorization, validate(validateGenre)],
  async (req, res, next) => {
    const genre = new Genre({ name: req.body.name });
    await genre.save();

    res.send(genre);
  }
);

router.put(
  "/:id",
  [authorization, validationObjectId, validate(validateGenre)],
  async (req, res) => {
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );

    if (!genre) {
      res.status(404).send("The genre with the given ID was not found!");
      return;
    }

    res.send(genre);
  }
);

router.delete(
  "/:id",
  [authorization, admin, validationObjectId],
  async (req, res) => {
    const genre = await Genre.findByIdAndDelete(req.params.id);

    if (!genre) {
      res.status(404).send("The genre with the given ID was not found!");
      return;
    }

    res.send(genre);
  }
);

module.exports = router;
