const router = require("express").Router();
const db = require("../db");
const examSchema = require("../schemas/exam");
const {
  validateRequestBody,
  validateRequestID,
  findByID,
  checkExists,
} = require("../middlewares");

router.post(
  "/",
  validateRequestBody(examSchema),
  checkExists("course"),
  async (req, res) => {
    try {
      if (req.courseUserID !== req.userID) {
        res.sendStatus(403);
      }
      const exam = await db.createExam(req.body);
      return res.status(201).json(exam);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);

router.param("id", validateRequestID);

router.param("id", findByID("exam"));

router.use((req, res, next) => {
  if (req.exam && req.userID !== req.exam.userID) {
    res.sendStatus(403);
  }
  next();
});

router.get("/:id", async (req, res) => {
  return res.status(200).json(req.exam);
});

router.put(
  "/:id",
  validateRequestBody(examSchema),
  checkExists("course"),
  async (req, res) => {
    let exam;
    try {
      if (!req.exam) {
        if (req.courseUserID !== req.userID) {
          res.sendStatus(403);
        }
        exam = await db.createExam(req.body, id);
        return res.status(201).json(exam);
      }
      exam = await db.updateExam(id, req.body);
      return res.status(200).json(exam);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);

router.delete("/:id", async (req, res) => {
  try {
    await db.deleteExam(req.params.id);
    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
