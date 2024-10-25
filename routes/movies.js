const validate = require("../middlewares/validate");
const validationObjectId = require("../middlewares/validateObjectId");
const authorization = require("../middlewares/authorization");
const { Movie, validateMovie } = require("../models/movie");
const { Genre } = require("../models/genre");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const movies = await Movie.find().sort("title");
  res.send(movies);
});

router.get("/:id", validationObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie) {
    res.status(404).send("The movie with the given ID was not found!");
    return;
  }

  res.send(movie);
});

router.post("/", [authorization, validate(validateMovie)], async (req, res) => {
  const genre = await Genre.findById(req.body.genreId);
  if (!genre) {
    res.status(400).send("Invalid genre.");
    return;
  }

  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
  });
  await movie.save();

  res.send(movie);
});

router.put(
  "/:id",
  [authorization, validationObjectId, validate(validateMovie)],
  async (req, res) => {
    const genre = await Genre.findById(req.body.genreId);
    if (!genre) {
      res.status(400).send("Invalid genre.");
      return;
    }

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
      },
      { new: true }
    );

    if (!movie) {
      res.status(404).send("The movie with the given ID was not found!");
      return;
    }

    res.send(movie);
  }
);

router.delete("/:id", [authorization, validationObjectId], async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);

  if (!movie) {
    res.status(404).send("The movie with the given ID was not found!");
    return;
  }

  res.send(movie);
});

module.exports = router;
