const winston = require("winston");
const express = require("express");
const app = express();

require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();

const port = process.env.PORT || 3000;
app.listen(port, () => winston.info(`Listening on port ${port}...`));

// to run application in test environment, run these command in cmd:
// set vidly_jwtPrivateKey=[Your_Key]
// set NODE_ENV=test
// node index.js
