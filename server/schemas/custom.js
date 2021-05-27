const Joi = require("joi");

const timeSchema = Joi.string()
  .pattern(
    /^((1[0-2]|0?[1-9]):([0-5][0-9]) ?([aApP][mM]))|(([0-1]?[0-9]|2[0-3]):[0-5][0-9])$/
  )
  .message(
    "{#label} must be in 24 hour format (HH:MM) or 12 hour format (HH:MM AM/PM)"
  );

const passwordSchema = Joi.string()
  .min(8)
  .pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/)
  .message(
    "{#label} must contain at least 1 number, 1 lowercase letter, and 1 uppercase letter"
  );

const dateSchema = Joi.string()
  .isoDate()
  .message("{#label} must be in YYYY-MM-DD format");

module.exports = {
  timeSchema,
  passwordSchema,
  dateSchema,
};
