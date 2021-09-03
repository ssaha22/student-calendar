const Joi = require("joi");
const idSchema = require("./id");
const { dateSchema, timeSchema } = require("./custom");

const assignmentSchema = Joi.object({
  id: idSchema,
  courseID: idSchema.required(),
  userID: idSchema,
  name: Joi.string().required(),
  courseName: Joi.string(),
  description: Joi.string(),
  dueDate: dateSchema.required(),
  dueTime: timeSchema,
  isCompleted: Joi.boolean(),
});

module.exports = assignmentSchema;
