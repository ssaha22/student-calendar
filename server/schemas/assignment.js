const Joi = require("joi");
const idSchema = require("./id");
const { timeSchema } = require("./patterns");

const assignmentSchema = Joi.object({
  courseID: idSchema.required(),
  name: Joi.string().required(),
  description: Joi.string(),
  dueDate: Joi.string().isoDate().required(),
  dueTime: timeSchema,
  isCompleted: Joi.boolean(),
});

module.exports = assignmentSchema;
