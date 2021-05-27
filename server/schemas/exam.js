const Joi = require("joi");
const idSchema = require("./id");
const { dateSchema, timeSchema } = require("./custom");

const examSchema = Joi.object({
  id: idSchema,
  courseID: idSchema.required(),
  name: Joi.string().required(),
  description: Joi.string(),
  date: dateSchema.required(),
  startTime: timeSchema,
  endTime: timeSchema,
});

module.exports = examSchema;
