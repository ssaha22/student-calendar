const { Pool } = require("pg");
const pool = new Pool();
const convertKeysToCamelCase = require("../utils/convertKeysToCamelCase");

async function createAssignment(assignment, id) {
  const {
    courseID,
    name,
    description,
    dueDate,
    dueTime,
    isCompleted = false,
  } = assignment;
  if (!id) {
    const res = await pool.query(
      `INSERT INTO assignments (course_id, name, description, due_date, due_time, is_completed) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id`,
      [courseID, name, description, dueDate, dueTime, isCompleted]
    );
    return findAssignment(res.rows[0].id);
  }
  await pool.query(
    `INSERT INTO assignments (id, course_id, name, description, due_date, due_time, is_completed) 
    VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [id, courseID, name, description, dueDate, dueTime, isCompleted]
  );
  return findAssignment(id);
}

async function findAssignment(id) {
  const res = await pool.query(
    `SELECT assignments.*, courses.user_id, courses.name AS course_name 
    FROM assignments
    INNER JOIN courses
    ON assignments.course_id = courses.id
    WHERE assignments.id = $1`,
    [id]
  );
  return convertKeysToCamelCase(res.rows[0]);
}

async function updateAssignment(id, newAssignment) {
  const {
    name,
    description,
    dueDate,
    dueTime,
    isCompleted = false,
  } = newAssignment;
  await pool.query(
    `UPDATE assignments 
    SET name = $1, description = $2, due_date = $3, due_time = $4, is_completed = $5
    WHERE id = $6`,
    [name, description, dueDate, dueTime, isCompleted, id]
  );
  return findAssignment(id);
}

async function deleteAssignment(id) {
  await pool.query("DELETE FROM assignments WHERE id = $1", [id]);
}

async function findAssignmentsForCourse(courseID) {
  const { rows } = await pool.query(
    `SELECT assignments.*, courses.user_id, courses.name AS course_name 
    FROM assignments
    INNER JOIN courses
    ON assignments.course_id = courses.id
    WHERE assignments.course_id = $1
    ORDER BY due_date, due_time`,
    [courseID]
  );
  return convertKeysToCamelCase(rows);
}

async function findAssignmentsForUser(userID, date) {
  let res;
  if (date) {
    res = await pool.query(
      `SELECT assignments.*, courses.user_id, courses.name AS course_name 
      FROM assignments
      INNER JOIN courses
      ON assignments.course_id = courses.id
      WHERE assignments.course_id IN (
        SELECT id
        FROM courses
        WHERE courses.user_id = $1
        )
      AND due_date = $2
      ORDER BY due_date, due_time`,
      [userID, date]
    );
  } else {
    res = await pool.query(
      `SELECT assignments.*, courses.user_id, courses.name AS course_name 
      FROM assignments
      INNER JOIN courses
      ON assignments.course_id = courses.id
      WHERE assignments.course_id IN (
        SELECT id
        FROM courses
        WHERE courses.user_id = $1
        )
      ORDER BY due_date, due_time`,
      [userID]
    );
  }
  return convertKeysToCamelCase(res.rows);
}

module.exports = {
  createAssignment,
  findAssignment,
  updateAssignment,
  deleteAssignment,
  findAssignmentsForCourse,
  findAssignmentsForUser,
};
