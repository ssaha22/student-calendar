const options = {
  errors: {
    wrap: {
      label: "",
    },
  },
};

function validateRequestBody(schema) {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body, options);
      next();
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  };
}

module.exports = validateRequestBody;
