const router = require("express").Router();
const db = require("../db");
const assignmentSchema = require("../schemas/assignment");
const {
  validateRequestBody,
  validateRequestID,
  find,
} = require("../middlewares");

router.post("/", validateRequestBody(assignmentSchema), async (req, res) => {
  try {
    const assignment = await db.createAssignment(req.body);
    return res.status(201).json(assignment);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.param("id", validateRequestID);

router.param("id", find("assignment"));

router.get("/:id", async (req, res) => {
  return res.status(200).json(req.assignment);
});

router.put("/:id", validateRequestBody(assignmentSchema), async (req, res) => {
  const id = req.params.id;
  let assignment;
  try {
    if (!req.assignment) {
      assignment = await db.createAssignment(req.body, id);
      return res.status(201).json(assignment);
    }
    assignment = await db.updateAssignment(id, req.body);
    return res.status(200).json(assignment);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.deleteAssignment(req.params.id);
    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
