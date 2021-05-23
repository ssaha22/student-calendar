const { Pool } = require("pg");

const pool = new Pool();

async function createAssignment(assignment, id = null) {
  const {
    courseID,
    name,
    description,
    dueDate,
    dueTime,
    isCompleted = false,
  } = assignment;
  if (!courseID || !name || !dueDate) {
    throw new Error("assignment must contain courseID, name, and dueDate");
  }
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
  return res.rows[0];
}

async function updateAssignment(id, newAssignment) {
  const { name, description, dueDate, dueTime, isCompleted } = newAssignment;
  if (!name || !dueDate || !isCompleted) {
    throw new Error("assignment must contain name, dueDate, and isCompleted");
  }
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

module.exports = {
  createAssignment,
  findAssignment,
  updateAssignment,
  deleteAssignment,
};
