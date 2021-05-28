const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUNDS)
    );
    await db.createUser(email, hashedPassword);
    return res.status(201).json({ message: "User created successfully" });
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
    const token = jwt.sign(userID, process.env.JWT_SECRET);
    return res.status(200).json({ userID, token });
  } catch (err) {
    console.error(err);
    return res.sendStatus(500);
  }
});

module.exports = router;
