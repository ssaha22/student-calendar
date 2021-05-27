const idSchema = require("../schemas/id");

async function validateRequestID(req, res, next, id) {
  try {
    await idSchema.validateAsync(id);
  } catch (err) {
    return res
      .status(400)
      .json({ message: "request id must be a positive integer" });
  }
  next();
}

module.exports = validateRequestID;
