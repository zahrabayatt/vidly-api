const mongoose = require("mongoose");

module.exports = (req, res, next) => {
  const validObjectId = mongoose.Types.ObjectId.isValid(req.params.id);

  if (!validObjectId) {
    return res.status(404).send("Invalid ID.");
  }

  next();
};
