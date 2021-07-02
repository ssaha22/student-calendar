const { Pool } = require("pg");
const pool = new Pool();
const convertKeysToCamelCase = require("../utils/convertKeysToCamelCase");

async function createCourse(course, id) {
  const {
    userID,
    name,
    section,
    startDate,
    endDate,
    times,
    links,
    additionalSections,
  } = course;
  if (id) {
    await pool.query(
      `INSERT INTO courses (id, user_id, name, section, start_date, end_date) 
      VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, userID, name, section, startDate, endDate]
    );
  } else {
    const res = await pool.query(
      `INSERT INTO courses (user_id, name, section, start_date, end_date) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [userID, name, section, startDate, endDate]
    );
    id = res.rows[0].id;
  }
  await addTimes(id, times);
  await addLinks(id, links);
  await addAdditionalSections(id, additionalSections);
  return await findCourse(id);
}

async function addTimes(courseID, times) {
  if (!times) {
    return;
  }
  for (const time of times) {
    const { day, startTime, endTime } = time;
    await pool.query(
      `INSERT INTO course_times (course_id, day, start_time, end_time)
      VALUES ($1, $2, $3, $4)`,
      [courseID, day, startTime, endTime]
    );
  }
}

async function addLinks(courseID, links) {
  if (!links) {
    return;
  }
  for (const link of links) {
    const { name, url } = link;
    await pool.query(
      "INSERT INTO links (course_id, name, url) VALUES ($1, $2, $3)",
      [courseID, name, url]
    );
  }
}

async function addAdditionalSections(courseID, additionalSections) {
  if (!additionalSections) {
    return;
  }
  for (const additionalSection of additionalSections) {
    const { type, section, times } = additionalSection;
    const res = await pool.query(
      `INSERT INTO additional_sections (course_id, type, section)
      VALUES ($1, $2, $3)
      RETURNING id`,
      [courseID, type, section]
    );
    const sectionID = res.rows[0].id;
    if (!times) {
      continue;
    }
    for (const time of times) {
      const { day, startTime, endTime } = time;
      await pool.query(
        `INSERT INTO additional_section_times (section_id, day, start_time, end_time)
        VALUES ($1, $2, $3, $4)`,
        [sectionID, day, startTime, endTime]
      );
    }
  }
}

async function findCourse(id) {
  let res = await pool.query(`SELECT * FROM courses WHERE id = $1`, [id]);
  const course = res.rows[0];
  if (!course) {
    return;
  }
  res = await pool.query("SELECT * FROM course_times WHERE course_id = $1", [
    id,
  ]);
  course.times = res.rows;
  res = await pool.query("SELECT * FROM links WHERE course_id = $1", [id]);
  course.links = res.rows;
  res = await pool.query(
    "SELECT * FROM additional_sections WHERE course_id = $1",
    [id]
  );
  for (const section of res.rows) {
    const { rows } = await pool.query(
      "SELECT * FROM additional_section_times WHERE section_id = $1",
      [section.id]
    );
    section.times = rows;
    delete section.id;
  }
  course.additionalSections = res.rows;
  return convertKeysToCamelCase(course);
}

async function updateCourse(id, newCourse) {
  const {
    name,
    section,
    startDate,
    endDate,
    times,
    links,
    additionalSections,
  } = newCourse;
  await pool.query("DELETE FROM course_times WHERE course_id = $1", [id]);
  await pool.query("DELETE FROM links WHERE course_id = $1", [id]);
  await pool.query("DELETE FROM additional_sections WHERE course_id = $1", [
    id,
  ]);
  await pool.query(
    `UPDATE courses 
    SET name = $1, section = $2, start_date = $3, end_date = $4 
    WHERE id = $5`,
    [name, section, startDate, endDate, id]
  );
  await addTimes(id, times);
  await addLinks(id, links);
  await addAdditionalSections(id, additionalSections);
  return await findCourse(id);
}

async function deleteCourse(id) {
  await pool.query("DELETE FROM courses WHERE id = $1", [id]);
}

async function findCoursesForUser(userID) {
  let courses = [];
  const res = await pool.query("SELECT id FROM courses WHERE user_id = $1", [
    userID,
  ]);
  for (const row of res.rows) {
    const course = await findCourse(row.id);
    courses.push(course);
  }
  return convertKeysToCamelCase(courses);
}

module.exports = {
  createCourse,
  findCourse,
  updateCourse,
  deleteCourse,
  findCoursesForUser,
};
