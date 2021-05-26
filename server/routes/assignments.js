const router = require("express").Router();
const db = require("../db");
const assignmentSchema = require("../schemas/assignment");
const { validateRequestBody, validateRequestID } = require("../middlewares");

router.param("id", validateRequestID);

router.post("/", validateRequestBody(assignmentSchema), async (req, res) => {
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

router.put("/:id", validateRequestBody(assignmentSchema), async (req, res) => {
  const id = req.params.id;
  let assignment;
  try {
    assignment = await db.findAssignment(id);
    if (!assignment) {
      assignment = await db.createAssignment(req.body, id);
      return res.status(201).json(assignment);
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
