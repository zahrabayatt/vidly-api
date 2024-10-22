require("express-async-errors");
const winston = require("winston");
require("winston-mongodb");

module.exports = () => {
  winston.exceptions.handle(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.prettyPrint(),
        winston.format.align()
      ),
    }),
    new winston.transports.File({ filename: "uncaughtExceptions.log" })
  );

  winston.add(new winston.transports.File({ filename: "logfile.log" }));
  winston.add(
    new winston.transports.MongoDB({
      db: "mongodb://127.0.0.1:27017/vidly",
    })
  );
};
