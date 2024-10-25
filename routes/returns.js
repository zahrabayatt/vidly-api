const authorization = require("../middlewares/authorization");
const express = require("express");
const router = express.Router();

router.post("/", authorization, (req, res) => {});

module.exports = router;
