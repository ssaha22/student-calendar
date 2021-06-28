const router = require("express").Router();
const db = require("../db");
const calendar = require("../calendar");
const assignmentSchema = require("../schemas/assignment");
const {
  validateRequestBody,
  validateRequestID,
  findAssignment,
  checkCourseExists,
  verifyAssignmentUser,
} = require("../middlewares");

router.param("id", validateRequestID);

router.param("id", findAssignment);

router.post(
  "/",
  validateRequestBody(assignmentSchema),
  checkCourseExists,
  verifyAssignmentUser,
  async (req, res) => {
    try {
      const assignment = await db.createAssignment(req.body);
      res.status(201).json(assignment);
      return await calendar.addAssignment(assignment);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);

router.get("/:id", verifyAssignmentUser, (req, res) => {
  return res.status(200).json(req.assignment);
});

router.put(
  "/:id",
  validateRequestBody(assignmentSchema),
  checkCourseExists,
  verifyAssignmentUser,
  async (req, res) => {
    const id = req.params.id;
    let assignment;
    try {
      if (!req.assignment) {
        assignment = await db.createAssignment(req.body, id);
        res.status(201).json(assignment);
        return await calendar.addAssignment(assignment);
      }
      assignment = await db.updateAssignment(id, req.body);
      res.status(200).json(assignment);
      return await calendar.updateAssignment(assignment);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);

router.delete("/:id", verifyAssignmentUser, async (req, res) => {
  try {
    await db.deleteAssignment(req.params.id);
    res.sendStatus(204);
    await calendar.removeAssignment(req.assignment);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
