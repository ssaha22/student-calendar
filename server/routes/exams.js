const router = require("express").Router();
const db = require("../db");
const calendar = require("../calendar");
const examSchema = require("../schemas/exam");
const {
  validateRequestBody,
  validateRequestID,
  findExam,
  checkCourseExists,
  verifyExamUser,
} = require("../middlewares");

router.param("id", validateRequestID);

router.param("id", findExam);

router.post(
  "/",
  validateRequestBody(examSchema),
  checkCourseExists,
  verifyExamUser,
  async (req, res) => {
    try {
      const exam = await db.createExam(req.body);
      res.status(201).json(exam);
      return await calendar.addExam(exam);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);

router.get("/:id", verifyExamUser, (req, res) => {
  return res.status(200).json(req.exam);
});

router.put(
  "/:id",
  validateRequestBody(examSchema),
  checkCourseExists,
  verifyExamUser,
  async (req, res) => {
    const id = req.params.id;
    let exam;
    try {
      if (!req.exam) {
        exam = await db.createExam(req.body, id);
        res.status(201).json(exam);
        return await calendar.addExam(exam);
      }
      exam = await db.updateExam(id, req.body);
      res.status(200).json(exam);
      return await calendar.updateExam(exam);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);

router.delete("/:id", verifyExamUser, async (req, res) => {
  try {
    await db.deleteExam(req.params.id);
    res.sendStatus(204);
    return await calendar.removeExam(req.exam);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
