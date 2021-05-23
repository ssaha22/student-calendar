const router = require("express").Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const { courseID, name, description, date, startTime, endTime } = req.body;
  if (!courseID || !name || !date) {
    return res.sendStatus(400);
  }
  try {
    const exam = await db.createExam(
      courseID,
      name,
      description,
      date,
      startTime,
      endTime
    );
    return res.status(201).json(exam);
  } catch {
    return res.sendStatus(500);
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const exam = await db.findExam(id);
    if (!exam) {
      return res.sendStatus(404);
    }
    return res.status(200).json(exam);
  } catch {
    return res.sendStatus(500);
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { courseID, name, description, date, startTime, endTime } = req.body;
  if (!courseID || !name || !date) {
    return res.sendStatus(400);
  }
  let exam;
  try {
    exam = await db.findExam(id);
    if (!exam) {
      exam = await db.createExam(
        courseID,
        name,
        description,
        date,
        startTime,
        endTime,
        id
      );
      return res.status(201).json(exam);
    }
    exam = await db.updateExam(id, name, description, date, startTime, endTime);
    return res.status(200).json(exam);
  } catch {
    return res.sendStatus(500);
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const exam = await db.findExam(id);
    if (!exam) {
      return res.sendStatus(404);
    }
    await db.deleteExam(id);
    return res.sendStatus(204);
  } catch {
    return res.sendStatus(500);
  }
});

module.exports = router;
