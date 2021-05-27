const Joi = require("joi");
const idSchema = require("./id");
const { dateSchema, timeSchema } = require("./custom");

const assignmentSchema = Joi.object({
  id: idSchema,
  courseID: idSchema.required(),
  name: Joi.string().required(),
  description: Joi.string(),
  dueDate: dateSchema.required(),
  dueTime: timeSchema,
  isCompleted: Joi.boolean(),
});

module.exports = assignmentSchema;
