const Joi = require("joi");
const authorization = require("../middlewares/authorization");
const express = require("express");
const router = express.Router();

router.post("/", authorization, (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400).send(error.message);
    return;
  }
});

function validate(param) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });

  return schema.valid(param);
}

module.exports = router;
