const validationObjectId = require("../middlewares/validateObjectId");
const authorization = require("../middlewares/authorization");
const { Customer, validate } = require("../models/customer");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const customers = await Customer.find().sort("name");
  res.send(customers);
});

router.get("/:id", validationObjectId, async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer) {
    res.status(404).send("The customer with the given ID was not found!");
    return;
  }

  res.send(customer);
});

router.post("/", authorization, async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400).send(error.message);
    return;
  }

  const customer = new Customer(req.body);
  customer.save();

  res.send(customer);
});

router.put("/:id", [authorization, validationObjectId], async (req, res) => {
  const { error } = validate(req.body);
  if (error) {
    res.status(400).send(error.message);
    return;
  }

  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!customer) {
    res.status(404).send("The genre with the given ID was not found!");
    return;
  }

  res.send(customer);
});

router.delete("/:id", [authorization, validationObjectId], async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);

  if (!customer) {
    res.status(404).send("The customer with the given ID was not found!");
    return;
  }

  res.send(customer);
});

module.exports = router;
