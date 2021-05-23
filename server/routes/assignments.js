const router = require("express").Router();
const db = require("../db");

router.post("/", async (req, res) => {
  const { courseID, name, description, dueDate, dueTime } = req.body;
  if (!courseID || !name || !dueDate) {
    return res.sendStatus(400);
  }
  try {
    const assignment = await db.createAssignment(
      courseID,
      name,
      description,
      dueDate,
      dueTime
    );
    return res.status(201).json(assignment);
  } catch {
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
  } catch {
    return res.sendStatus(500);
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { courseID, name, description, dueDate, dueTime, isCompleted } =
    req.body;
  if (!courseID || !name || !dueDate) {
    return res.sendStatus(400);
  }
  let assignment;
  try {
    assignment = await db.findAssignment(id);
    if (!assignment) {
      assignment = await db.createAssignment(
        courseID,
        name,
        description,
        dueDate,
        dueTime,
        id
      );
      return res.status(201).json(assignment);
    }
    assignment = await db.updateAssignment(
      id,
      name,
      description,
      dueDate,
      dueTime,
      isCompleted
    );
    return res.status(200).json(assignment);
  } catch {
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
  } catch {
    return res.sendStatus(500);
  }
});

module.exports = router;
