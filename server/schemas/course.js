const Joi = require("joi");
const idSchema = require("./id");
const { timeSchema } = require("./patterns");

const courseSchema = Joi.object({
  userID: idSchema.required(),
  name: Joi.string().required(),
  section: Joi.string(),
  startDate: Joi.string().isoDate().required(),
  endTime: Joi.string().isoDate().required(),
  times: Joi.array().items(daySchema),
  links: Joi.array().items(linkSchema),
  additionalSections: Joi.array().items(sectionSchema),
});

const daySchema = Joi.object({
  day: Joi.string().required(),
  startTime: timeSchema.required(),
  endTime: timeSchema.required(),
});

const linkSchema = Joi.object({
  name: Joi.string().required(),
  url: Joi.string().domain().required(),
});

const sectionSchema = Joi.object({
  type: Joi.string().required(),
  section: Joi.string(),
  times: Joi.array().items(daySchema),
});

module.exports = courseSchema;
