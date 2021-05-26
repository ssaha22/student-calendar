const router = require("express").Router();
const db = require("../db");
const courseSchema = require("../schemas/course");
const { validateRequestBody, validateRequestID } = require("../middlewares");

router.param("id", validateRequestID);

router.post("/", validateRequestBody(courseSchema), async (req, res) => {
  try {
    const course = await db.createCourse(req.body);
    return res.status(201).json(course);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const course = await db.findCourse(id);
    if (!course) {
      return res.sendStatus(404);
    }
    return res.status(200).json(course);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.put("/:id", validateRequestBody(courseSchema), async (req, res) => {
  const id = req.params.id;
  let course;
  try {
    course = await db.findCourse(id);
    if (!course) {
      course = await db.createCourse(req.body, id);
      return res.status(201).json(course);
    }
    course = await db.updateCourse(id, req.body);
    return res.status(200).json(course);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const course = await db.findCourse(id);
    if (!course) {
      return res.sendStatus(404);
    }
    await db.deleteCourse(id);
    return res.sendStatus(204);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get("/:id/assignments", async (req, res) => {
  const id = req.params.id;
  try {
    const course = await db.findCourse(id);
    if (!course) {
      return res.sendStatus(404);
    }
    const assignments = await db.findAssignmentsForCourse(id);
    return res.status(200).json({ assignments });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get("/:id/exams", async (req, res) => {
  const id = req.params.id;
  try {
    const course = await db.findCourse(id);
    if (!course) {
      return res.sendStatus(404);
    }
    const exams = await db.findExamsForCourse(id);
    return res.status(200).json({ exams });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
