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
    if (req.method !== "POST" && req.method !== "PUT") {
      return next();
    }
    let body = removeEmptyValues(req.body);
    try {
      body = await schema.validateAsync(body, options);
      req.body = body;
      return next();
    } catch (err) {
      return res
        .status(400)
        .json({
          message: err.message[0].toUpperCase() + err.message.substring(1),
        });
    }
  };
}

module.exports = validateRequestBody;
