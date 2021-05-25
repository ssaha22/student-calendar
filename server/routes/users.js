const router = require("express").Router();
const db = require("../db");

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    let user = await db.findUserByEmail(email);
    if (user) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    user = await db.createUser(req.body);
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

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  let user;
  try {
    user = await db.findUserByID(id);
    if (!user) {
      user = await db.createUser(req.body, id);
      return res.status(201).json(user);
    }
    user = await db.updateUser(id, req.body);
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
