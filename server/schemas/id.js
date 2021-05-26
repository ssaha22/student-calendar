const Joi = require("joi");

const idSchema = Joi.number().integer().positive();

module.exports = idSchema;
