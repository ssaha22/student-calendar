const { Pool } = require("pg");
const assignments = require("./assignments");
const exams = require("./exams");

const pool = new Pool();

module.exports = {
  ...assignments,
  ...exams,
};
