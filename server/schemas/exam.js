const Joi = require("joi");
const idSchema = require("./id");
const { dateSchema, timeSchema } = require("./custom");

const examSchema = Joi.object({
  id: idSchema,
  courseID: idSchema.required(),
  userID: idSchema,
  name: Joi.string().required(),
  courseName: Joi.string(),
  description: Joi.string(),
  date: dateSchema.required(),
  startTime: timeSchema,
  endTime: timeSchema,
});

module.exports = examSchema;
