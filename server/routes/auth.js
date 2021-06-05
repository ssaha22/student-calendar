const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("../utils/promisifyJWT");
const db = require("../db");
const userSchema = require("../schemas/user");
const { validateRequestBody } = require("../middlewares");

router.post("/register", validateRequestBody(userSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    let user = await db.findUserByEmail(email);
    if (user) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user = await db.createUser(email, hashedPassword);
    const userID = user.id;
    const authToken = await jwt.sign({ userID }, process.env.JWT_SECRET);
    return res.status(200).json({ userID, authToken });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

router.post("/login", validateRequestBody(userSchema), async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(400).json({ message: "Incorrect password" });
    }
    const userID = user.id;
    const authToken = await jwt.sign({ userID }, process.env.JWT_SECRET);
    return res.status(200).json({ userID, authToken });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
