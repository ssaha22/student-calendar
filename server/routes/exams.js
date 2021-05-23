const router = require("express").Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const { courseID, name, date } = req.body;
  if (!courseID || !name || !date) {
    return res.status(400).json({
      message: "courseID, name, and date must be included in request body",
    });
  }
  try {
    const exam = await db.createExam(req.body);
    return res.status(201).json(exam);
  } catch (err) {
    console.log(err);
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
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { courseID, name, date } = req.body;
  if (!name || !date) {
    return res.status(400).json({
      message: "name and date must be included in request body",
    });
  }
  let exam;
  try {
    exam = await db.findExam(id);
    if (!exam) {
      if (!courseID) {
        return res.status(400).json({
          message: "courseID must be included in request body",
        });
      }
      exam = await db.createExam(req.body, id);
      return res.status(201).json(exam);
    }
    exam = await db.updateExam(id, req.body);
    return res.status(200).json(exam);
  } catch (err) {
    console.log(err);
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
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
