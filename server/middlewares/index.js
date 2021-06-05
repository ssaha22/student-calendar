const validateRequestBody = require("./validateRequestBody");
const validateRequestID = require("./validateRequestID");
const find = require("./find");
const checkExists = require("./checkExists");
const authorizeUser = require("./authorizeUser");
const verifyUser = require("./verifyUser");

module.exports = {
  validateRequestBody,
  validateRequestID,
  ...find,
  ...checkExists,
  authorizeUser,
  ...verifyUser,
};
