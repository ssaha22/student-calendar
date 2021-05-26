const Joi = require("joi");
const idSchema = require("./id");
const { timeSchema } = require("./patterns");

const examSchema = Joi.object({
  courseID: idSchema.required(),
  name: Joi.string().required(),
  description: Joi.string(),
  date: Joi.string().isoDate().required(),
  startTime: timeSchema,
  endTime: timeSchema,
});

module.exports = examSchema;
