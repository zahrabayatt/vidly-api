const authorization = require("../middlewares/authorization");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const express = require("express");
const router = express.Router();

router.get("/me", authorization, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.send(user);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400).send(error.message);
    return;
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    res.status(400).send("User already registered.");
    return;
  }

  user = new User(req.body, ["name", "email", "password"]);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();

  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .send(_.pick(user, ["_id", "name", "email"]));
});

module.exports = router;
