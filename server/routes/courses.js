const router = require("express").Router();
const db = require("../db");
const courseSchema = require("../schemas/course");
const {
  validateRequestBody,
  validateRequestID,
  findByID,
  checkExists,
} = require("../middlewares");

router.post(
  "/",
  validateRequestBody(courseSchema),
  checkExists("user"),
  async (req, res) => {
    try {
      const course = await db.createCourse(req.body);
      return res.status(201).json(course);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);

router.param("id", validateRequestID);

router.param("id", findByID("course"));

router.get("/:id", async (req, res) => {
  return res.status(200).json(req.course);
});

router.put(
  "/:id",
  validateRequestBody(courseSchema),
  checkExists("user"),
  async (req, res) => {
    let course;
    try {
      if (!req.course) {
        course = await db.createCourse(req.body, id);
        return res.status(201).json(course);
      }
      course = await db.updateCourse(id, req.body);
      return res.status(200).json(course);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);

router.delete("/:id", async (req, res) => {
  try {
    await db.deleteCourse(req.params.id);
    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.get("/:id/assignments", async (req, res) => {
  try {
    const assignments = await db.findAssignmentsForCourse(req.params.id);
    return res.status(200).json({ assignments });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.get("/:id/exams", async (req, res) => {
  try {
    const exams = await db.findExamsForCourse(req.params.id);
    return res.status(200).json({ exams });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
