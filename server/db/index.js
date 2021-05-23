const { Pool } = require("pg");

const pool = new Pool();

async function createAssignment(
  courseID,
  name,
  description,
  dueDate,
  dueTime,
  id = null
) {
  let res;
  if (!id) {
    res = await pool.query(
      `INSERT INTO assignments (course_id, name, description, due_date, due_time) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [courseID, name, description, dueDate, dueTime]
    );
    id = res.rows[0].id;
  } else {
    await pool.query(
      `INSERT INTO assignments (id, course_id, name, description, due_date, due_time) 
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [id, courseID, name, description, dueDate, dueTime]
    );
  }
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

async function updateAssignment(
  id,
  name,
  description,
  dueDate,
  dueTime,
  isCompleted
) {
  await pool.query(
    `UPDATE assignments 
    SET name = $1, description = $2, due_date = $3, due_time = $4, is_completed = $5
    WHERE id = $6
    RETURNING *`,
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
