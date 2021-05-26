const Joi = require("joi");

// matches a time in 24 hour format (HH:MM) or 12 hour format (HH:MM AM/PM)
const timeSchema = Joi.string().pattern(
  /^((1[0-2]|0?[1-9]):([0-5][0-9]) ([AP]M))|(([0-1]?[0-9]|2[0-3]):[0-5][0-9])$/
);

// matches a string at least 8 characters long with at least
// 1 number, 1 lowercase letter, and 1 uppercase letter
const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/);

module.exports = {
  timeSchema,
  passwordSchema,
};
