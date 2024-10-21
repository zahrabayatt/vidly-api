const asyncMiddleware = require("../middlewares/async");
const authorization = require("../middlewares/authorization");
const admin = require("../middlewares/admin");
const { Genre, validate } = require("../models/genre");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const genres = await Genre.find().sort("name");
  res.send(genres);
});

router.get("/:id", async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre) {
    res.status(404).send("The genre with the given ID was not found!");
    return;
  }

  res.send(genre);
});

router.post(
  "/",
  authorization,
  asyncMiddleware(async (req, res, next) => {
    const { error } = validate(req.body);
    if (error) {
      res.status(400).send(error.message);
      return;
    }
    throw new Error("errorrrrr");

    const genre = new Genre({ name: req.body.name });
    await genre.save();

    res.send(genre);
  })
);

router.put("/:id", authorization, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400).send(error.message);
    return;
  }

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
});

router.delete("/:id", [authorization, admin], async (req, res) => {
  const genre = await Genre.findByIdAndDelete(req.params.id);

  if (!genre) {
    res.status(404).send("The genre with the given ID was not found!");
    return;
  }

  res.send(genre);
});

module.exports = router;
