require("express-async-errors");
const winston = require("winston");
require("winston-mongodb");
const error = require("./middlewares/error");
const config = require("config");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
const mongoose = require("mongoose");
const genres = require("./routes/genres");
const customers = require("./routes/customers");
const movies = require("./routes/movies");
const rentals = require("./routes/rentals");
const users = require("./routes/users");
const auth = require("./routes/authentication");
const express = require("express");
const app = express();

// this approach works with synchronous error and unhandled promise rejections
// process.on("uncaughtException", (ex) => {
//   console.log("WE GOT AN UNCAUGHT EXCEPTION");
//   winston.error(ex.message, ex);
//   process.exit(1);
// });

// Or you can use a helper method in winston to handle both uncaught exceptions and promise rejections:
winston.exceptions.handle(
  new winston.transports.File({ filename: "uncaughtExceptions.log" })
);

winston.add(new winston.transports.File({ filename: "logfile.log" }));
winston.add(
  new winston.transports.MongoDB({
    db: "mongodb://127.0.0.1:27017/vidly",
  })
);

// Unhandled error outside express:
throw new Error("Something failed in Startup.");

// Unhandled rejection outside express:
const p = Promise.reject(new Error("Something failed miserably!"));
p.then(() => console.log("Done"));

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined.");
  process.exit(1);
}

mongoose
  .connect("mongodb://127.0.0.1:27017/vidly")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Couldn't connect to MongoDB...", err));

app.use(express.json());
app.use("/api/genres", genres);
app.use("/api/customers", customers);
app.use("/api/movies", movies);
app.use("/api/rentals", rentals);
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use(error);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));
