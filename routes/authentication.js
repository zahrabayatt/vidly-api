const validate = require("../middlewares/validate");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User } = require("../models/user");
const express = require("express");
const router = express.Router();

router.post("/", [validate(validateAuth)], async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(400).send("Invalid email or password!");
    return;
  }

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    res.status(400).send("Invalid email or password!");
    return;
  }

  const token = user.generateAuthToken();
  res.send(token);
});

function validateAuth(user) {
  const schema = Joi.object({
    email: Joi.string().required().min(5).max(255).email(),
    password: Joi.string().required(),
  });

  return schema.validate(user);
}

module.exports = router;
