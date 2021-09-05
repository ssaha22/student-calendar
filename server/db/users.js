const { Pool } = require("pg");
const pool = new Pool();
const { format, parseISO } = require("date-fns");
const { findAssignmentsForUser } = require("./assignments");
const { findExamsForUser } = require("./exams");
const convertKeysToCamelCase = require("../utils/convertKeysToCamelCase");

async function createUser(email, password) {
  const res = await pool.query(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
    [email, password]
  );
  return res.rows[0];
}

async function findUserByID(id) {
  const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return res.rows[0];
}

async function findUserByEmail(email) {
  const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return res.rows[0];
}

async function updateUser(id, newEmail, newPassword) {
  const res = await pool.query(
    "UPDATE users SET email = $1, password = $2 WHERE id = $3 RETURNING *",
    [newEmail, newPassword, id]
  );
  return res.rows[0];
}

async function deleteUser(id) {
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
}

async function findScheduleOnDate(id, date) {
  const dayOfWeek = format(parseISO(date), "EEEE");
  let res = await pool.query(
    `SELECT course_times.start_time, course_times.end_time, courses.*
    FROM course_times
    INNER JOIN courses
    ON course_times.course_id = courses.id
    WHERE course_times.day = $1
    AND courses.user_id = $2
    ORDER BY course_times.start_time`,
    [dayOfWeek, id]
  );
  const courses = convertKeysToCamelCase(res.rows);
  res = await pool.query(
    `SELECT additional_section_times.start_time, additional_section_times.end_time, 
    additional_sections.*, courses.name
    FROM additional_section_times
    INNER JOIN additional_sections
    ON additional_section_times.section_id = additional_sections.id
    INNER JOIN courses
    ON additional_sections.course_id = courses.id
    WHERE additional_section_times.day = $1
    AND additional_sections.course_id IN (
      SELECT id
      FROM courses
      WHERE user_id = $2
    )
    ORDER BY additional_section_times.start_time`,
    [dayOfWeek, id]
  );
  const additionalSections = convertKeysToCamelCase(res.rows);
  const assignments = await findAssignmentsForUser(id, date);
  const exams = await findExamsForUser(id, date);
  return { courses, additionalSections, assignments, exams };
}

module.exports = {
  createUser,
  findUserByID,
  findUserByEmail,
  updateUser,
  deleteUser,
  findScheduleOnDate,
};
