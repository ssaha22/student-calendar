const router = require("express").Router();
const bcrypt = require("bcrypt");
const db = require("../db");
const userSchema = require("../schemas/user");
const { validateRequestBody, validateRequestID } = require("../middlewares");
const saltRounds = 10;

router.param("id", validateRequestID);

router.post("/", validateRequestBody(userSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await db.findUserByEmail(email);
    if (user) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user = await db.createUser(email, hashedPassword);
    return res.status(201).json(user);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await db.findUserByID(id);
    if (!user) {
      return res.sendStatus(404);
    }
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.put("/:id", validateRequestBody(userSchema), async (req, res) => {
  const id = req.params.id;
  const { email, password } = req.body;
  let user;
  try {
    user = await db.findUserByID(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user = await db.findUserByEmail(email);
    if (user && user.id != id) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    user = await db.updateUser(id, email, hashedPassword);
    return res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await db.findUserByID(id);
    if (!user) {
      return res.sendStatus(404);
    }
    await db.deleteUser(id);
    return res.sendStatus(204);
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get("/:id/courses", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await db.findUserByID(id);
    if (!user) {
      return res.sendStatus(404);
    }
    const courses = await db.findCoursesForUser(id);
    return res.status(200).json({ courses });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get("/:id/assignments", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await db.findUserByID(id);
    if (!user) {
      return res.sendStatus(404);
    }
    const assignments = await db.findAssignmentsForUser(id);
    return res.status(200).json({ assignments });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

router.get("/:id/exams", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await db.findUserByID(id);
    if (!user) {
      return res.sendStatus(404);
    }
    const exams = await db.findExamsForUser(id);
    return res.status(200).json({ exams });
  } catch (err) {
    console.log(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
