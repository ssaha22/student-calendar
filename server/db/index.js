const users = require("./users");
const courses = require("./courses");
const assignments = require("./assignments");
const exams = require("./exams");

module.exports = {
  ...users,
  ...courses,
  ...assignments,
  ...exams,
};
