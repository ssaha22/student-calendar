const Joi = require("joi");
const idSchema = require("./id");
const { passwordSchema } = require("./custom");

const userSchema = Joi.object({
  id: idSchema,
  email: Joi.string().email().required(),
  password: passwordSchema.required(),
});

module.exports = userSchema;
