const courses = require("./courses");
const assignments = require("./assignments");
const exams = require("./exams");

module.exports = {
  ...courses,
  ...assignments,
  ...exams,
};
