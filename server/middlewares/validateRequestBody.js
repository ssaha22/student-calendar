const removeEmptyValues = require("../utils/removeEmptyValues");
const options = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

function validateRequestBody(schema) {
  return async (req, res, next) => {
    let body = removeEmptyValues(req.body);
    try {
      body = await schema.validateAsync(body, options);
      req.body = body;
      next();
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };
}

module.exports = validateRequestBody;
