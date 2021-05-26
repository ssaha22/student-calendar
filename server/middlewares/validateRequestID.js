let idSchema = require("../schemas/id");
idSchema = idSchema.error(new Error("request id must be a positive integer"));

async function validateRequestID(req, res, next, id) {
  try {
    await idSchema.validateAsync(id);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
}

module.exports = validateRequestID;
