const router = require("express").Router();
const db = require("../db");
const calendar = require("../calendar");
const courseSchema = require("../schemas/course");
const {
  validateRequestBody,
  validateRequestID,
  findCourse,
  checkUserExists,
  verifyCourseUser,
} = require("../middlewares");

router.param("id", validateRequestID);

router.param("id", findCourse);

router.post(
  "/",
  validateRequestBody(courseSchema),
  checkUserExists,
  verifyCourseUser,
  async (req, res) => {
    try {
      const course = await db.createCourse(req.body);
      res.status(201).json(course);
      return await calendar.addCourse(course);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);

router.get("/:id", verifyCourseUser, async (req, res) => {
  try {
    const assignments = await db.findAssignmentsForCourse(req.params.id);
    const exams = await db.findExamsForCourse(req.params.id);
    return res.status(200).json({ ...req.course, assignments, exams });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.put(
  "/:id",
  validateRequestBody(courseSchema),
  checkUserExists,
  verifyCourseUser,
  async (req, res) => {
    const id = req.params.id;
    let course;
    try {
      if (!req.course) {
        course = await db.createCourse(req.body, id);
        res.status(201).json(course);
        return await calendar.addCourse(course);
      }
      course = await db.updateCourse(id, req.body);
      res.status(200).json(course);
      return await calendar.updateCourse(req.course, course);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);

router.delete("/:id", verifyCourseUser, async (req, res) => {
  try {
    const courseID = req.params.id;
    const assignments = await db.findAssignmentsForCourse(courseID);
    const exams = await db.findExamsForCourse(courseID);
    await db.deleteCourse(courseID);
    res.sendStatus(204);
    return await calendar.removeCourse(req.course, assignments, exams);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.get("/:id/assignments", verifyCourseUser, async (req, res) => {
  try {
    const assignments = await db.findAssignmentsForCourse(req.params.id);
    return res.status(200).json({ assignments });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.get("/:id/exams", verifyCourseUser, async (req, res) => {
  try {
    const exams = await db.findExamsForCourse(req.params.id);
    return res.status(200).json({ exams });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
