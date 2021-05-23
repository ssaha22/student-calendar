const router = require("express").Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const { courseID, name, dueDate } = req.body;
  if (!courseID || !name || !dueDate) {
    return res.status(400).json({
      message: "courseID, name, and dueDate must be included in request body",
    });
  }
  try {
    const assignment = await db.createAssignment(req.body);
    return res.status(201).json(assignment);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const assignment = await db.findAssignment(id);
    if (!assignment) {
      return res.sendStatus(404);
    }
    return res.status(200).json(assignment);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { courseID, name, dueDate, isCompleted } = req.body;
  let assignment;
  try {
    assignment = await db.findAssignment(id);
    if (!assignment) {
      if (!courseID || !name || !dueDate) {
        return res.status(400).json({
          message:
            "courseID, name, and dueDate must be included in request body",
        });
      }
      assignment = await db.createAssignment(req.body, id);
      return res.status(201).json(assignment);
    }
    if (!name || !dueDate || !isCompleted) {
      return res.status(400).json({
        message:
          "name, dueDate, and isCompleted must be included in request body",
      });
    }
    assignment = await db.updateAssignment(id, req.body);
    return res.status(200).json(assignment);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const assignment = await db.findAssignment(id);
    if (!assignment) {
      return res.sendStatus(404);
    }
    await db.deleteAssignment(id);
    return res.sendStatus(204);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
