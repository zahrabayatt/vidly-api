const mongoose = require("mongoose");
const winston = require("winston");

module.exports = () => {
  mongoose
    .connect("mongodb://127.0.0.1:27017/vidly")
    .then(() => winston.info("Connected to MongoDB..."));
};
