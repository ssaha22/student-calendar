const { Pool } = require("pg");
const pool = new Pool();
const convertKeysToCamelCase = require("../utils/convertKeysToCamelCase");

async function createExam(exam, id) {
  const { courseID, name, description, date, startTime, endTime } = exam;
  if (!id) {
    const res = await pool.query(
      `INSERT INTO exams (course_id, name, description, date, start_time, end_time) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [courseID, name, description, date, startTime, endTime]
    );
    return findExam(res.rows[0].id);
  }
  await pool.query(
    `INSERT INTO exams (id, course_id, name, description, date, start_time, end_time) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, courseID, name, description, date, startTime, endTime]
  );
  return findExam(id);
}

async function findExam(id) {
  const res = await pool.query(
    `SELECT exams.*, courses.user_id, courses.name AS course_name 
    FROM exams
    INNER JOIN courses
    ON exams.course_id = courses.id
    WHERE exams.id = $1`,
    [id]
  );
  return convertKeysToCamelCase(res.rows[0]);
}

async function updateExam(id, newExam) {
  const { name, description, date, startTime, endTime } = newExam;
  await pool.query(
    `UPDATE exams 
    SET name = $1, description = $2, date = $3, start_time = $4, end_time = $5
    WHERE id = $6`,
    [name, description, date, startTime, endTime, id]
  );
  return findExam(id);
}

async function deleteExam(id) {
  await pool.query("DELETE FROM exams WHERE id = $1", [id]);
}

async function findExamsForCourse(courseID) {
  const { rows } = await pool.query(
    `SELECT exams.*, courses.user_id, courses.name AS course_name 
    FROM exams
    INNER JOIN courses
    ON exams.course_id = courses.id
    WHERE exams.course_id = $1
    ORDER BY date, start_time`,
    [courseID]
  );
  return convertKeysToCamelCase(rows);
}

async function findExamsForUser(userID, date) {
  let res;
  if (date) {
    res = await pool.query(
      `SELECT exams.*, courses.user_id, courses.name AS course_name 
      FROM exams
      INNER JOIN courses
      ON exams.course_id = courses.id
      WHERE exams.course_id IN (
        SELECT id
        FROM courses
        WHERE courses.user_id = $1
        )
      AND date = $2
      ORDER BY date, start_time`,
      [userID, date]
    );
  } else {
    res = await pool.query(
      `SELECT exams.*, courses.user_id, courses.name AS course_name 
      FROM exams
      INNER JOIN courses
      ON exams.course_id = courses.id
      WHERE exams.course_id IN (
        SELECT id
        FROM courses
        WHERE courses.user_id = $1
        )
      ORDER BY date, start_time`,
      [userID]
    );
  }
  return convertKeysToCamelCase(res.rows);
}

module.exports = {
  createExam,
  findExam,
  updateExam,
  deleteExam,
  findExamsForCourse,
  findExamsForUser,
};
