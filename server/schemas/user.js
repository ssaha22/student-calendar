const Joi = require("joi");
const { passwordSchema } = require("./patterns");

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: passwordSchema.required(),
});

module.exports = userSchema;
