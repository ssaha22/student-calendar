const Joi = require("joi");
const idSchema = require("./id");
const { timeSchema, dateSchema } = require("./custom");
const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const daySchema = Joi.object({
  day: Joi.string()
    .valid(...daysOfWeek)
    .required(),
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

const courseSchema = Joi.object({
  id: idSchema,
  userID: idSchema.required(),
  name: Joi.string().required(),
  section: Joi.string(),
  startDate: dateSchema,
  endDate: dateSchema,
  times: Joi.array().items(daySchema),
  links: Joi.array().items(linkSchema),
  additionalSections: Joi.array().items(sectionSchema),
});

module.exports = courseSchema;
