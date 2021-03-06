const router = require("express").Router();
const bcrypt = require("bcrypt");
const db = require("../db");
const calendar = require("../calendar");
const userSchema = require("../schemas/user");
const { dateSchema } = require("../schemas/custom");
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
    const userID = req.params.id;
    const googleAPIInfo = await calendar.getGoogleAPIInfo(userID);
    await db.deleteUser(req.params.id);
    res.sendStatus(204);
    return await calendar.deleteCalendars(googleAPIInfo);
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

router.get("/:id/schedule", async (req, res) => {
  try {
    const date = req.query.date;
    if (!date) {
      return res
        .status(400)
        .json({ message: "Request must contain date query parameter" });
    }
    const { error } = dateSchema.validate(date);
    if (error) {
      return res
        .status(400)
        .json({ message: "Date query parameter must be in YYYY-MM-DD format" });
    }
    const schedule = await db.findScheduleOnDate(req.params.id, date);
    return res.status(200).json(schedule);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.post("/:id/calendar", async (req, res) => {
  try {
    const userID = req.params.id;
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ message: "Request body must include valid refresh token" });
    }
    const googleAPIInfo = await calendar.getGoogleAPIInfo(userID);
    if (googleAPIInfo) {
      return res.status(400).json({
        message: "Google Calendar information for user already exists",
      });
    }
    await calendar.saveRefreshToken(userID, refreshToken);
    res.sendStatus(204);
    await calendar.createCalendars(userID);
    return await calendar.addAll(userID);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.delete("/:id/calendar", async (req, res) => {
  try {
    const userID = req.params.id;
    const googleAPIInfo = await calendar.getGoogleAPIInfo(userID);
    await calendar.deleteGoogleAPIInfo(userID);
    res.sendStatus(204);
    return await calendar.deleteCalendars(googleAPIInfo);
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
