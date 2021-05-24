const { Pool } = require("pg");

const pool = new Pool();

async function createCourse(course, id = null) {
  const {
    userID,
    name,
    section,
    startDate,
    endDate,
    times,
    additionalSections,
  } = course;
  if (!id) {
    const res = await pool.query(
      `INSERT INTO courses (user_id, name, section, start_date, end_date) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [userID, name, section, startDate, endDate]
    );
    id = res.rows[0].id;
  } else {
    await pool.query(
      `INSERT INTO courses (id, user_id, name, section, start_date, end_date) 
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, userID, name, section, startDate, endDate]
    );
  }
  if (times) {
    for (const day of times) {
      await pool.query(
        `INSERT INTO course_times (course_id, day, start_time, end_time)
        VALUES ($1, $2, $3, $4)`,
        [id, day.day, day.startTime, day.endTime]
      );
    }
  }
  if (additionalSections) {
    for (const additionalSection of additionalSections) {
      await createAdditionalSection(id, additionalSection);
    }
  }
  return findCourse(id);
}

async function createAdditionalSection(courseID, additionalSection) {
  try {
    const { type, section, times } = additionalSection;
    const res = await pool.query(
      `INSERT INTO additional_sections (course_id, type, section)
      VALUES ($1, $2, $3)
      RETURNING id`,
      [courseID, type, section]
    );
    const id = res.rows[0].id;
    if (times) {
      for (const day of times) {
        await pool.query(
          `INSERT INTO additional_section_times (section_id, day, start_time, end_time)
          VALUES ($1, $2, $3, $4)`,
          [id, day.day, day.startTime, day.endTime]
        );
      }
    }
  } catch (err) {
    console.log(err);
  }
}

async function findCourse(id) {
  let res = await pool.query(`SELECT * FROM courses WHERE id = $1`, [id]);
  const course = res.rows[0];
  if (!course) {
    return;
  }
  res = await pool.query(
    `SELECT day, start_time, end_time FROM course_times WHERE course_id = $1`,
    [id]
  );
  course.times = res.rows;
  res = await pool.query(
    `SELECT id, type, section FROM additional_sections WHERE course_id = $1`,
    [id]
  );
  for (const section of res.rows) {
    const { rows } = await pool.query(
      `SELECT day, start_time, end_time FROM additional_section_times WHERE section_id = $1`,
      [section.id]
    );
    section.times = rows;
    delete section.id;
  }
  course.additionalSections = res.rows;
  return course;
}

async function updateCourse(id, newCourse) {
  await deleteCourse(id);
  return createCourse(newCourse, id);
}

async function deleteCourse(id) {
  await pool.query("DELETE FROM courses WHERE id = $1", [id]);
}

module.exports = {
  createCourse,
  findCourse,
  updateCourse,
  deleteCourse,
};
