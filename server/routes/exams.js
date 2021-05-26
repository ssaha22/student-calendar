const router = require("express").Router();
const db = require("../db");
const examSchema = require("../schemas/exam");
const { validateRequestBody, validateRequestID } = require("../middlewares");

router.param("id", validateRequestID);

router.post("/", validateRequestBody(examSchema), async (req, res) => {
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

router.put("/:id", validateRequestBody(examSchema), async (req, res) => {
  const id = req.params.id;
  let exam;
  try {
    exam = await db.findExam(id);
    if (!exam) {
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
