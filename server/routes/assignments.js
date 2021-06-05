const router = require("express").Router();
const db = require("../db");
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
      return res.status(201).json(assignment);
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
        return res.status(201).json(assignment);
      }
      assignment = await db.updateAssignment(id, req.body);
      return res.status(200).json(assignment);
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  }
);

router.delete("/:id", verifyAssignmentUser, async (req, res) => {
  try {
    await db.deleteAssignment(req.params.id);
    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
