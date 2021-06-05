const router = require("express").Router();
const bcrypt = require("bcrypt");
const db = require("../db");
const userSchema = require("../schemas/user");
const {
  validateRequestBody,
  validateRequestID,
  findUser,
  verifyUser,
} = require("../middlewares");

router.param("id", validateRequestID);

router.param("id", verifyUser);

router.param("id", findUser);

router.put("/:id", validateRequestBody(userSchema), async (req, res) => {
  const id = req.params.id;
  const { email, password } = req.body;
  let user;
  try {
    if (!req.user) {
      return res.status(404).json({
        message:
          "User not found. To create a new user send a POST request to /register.",
      });
    }
    user = await db.findUserByEmail(email);
    if (user && user.id != id) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.updateUser(id, email, hashedPassword);
    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await db.deleteUser(req.params.id);
    return res.sendStatus(204);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.get("/:id/courses", async (req, res) => {
  try {
    const courses = await db.findCoursesForUser(req.params.id);
    return res.status(200).json({ courses });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.get("/:id/assignments", async (req, res) => {
  try {
    const assignments = await db.findAssignmentsForUser(req.params.id);
    return res.status(200).json({ assignments });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.get("/:id/exams", async (req, res) => {
  try {
    const exams = await db.findExamsForUser(req.params.id);
    return res.status(200).json({ exams });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
