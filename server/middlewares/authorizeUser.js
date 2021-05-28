const jwt = require("jsonwebtoken");

function authorizeUser(req, res, next) {
  const authToken = req.header("Authorization");
  if (!authToken) {
    return res
      .status(401)
      .json({ message: "Request header must include authorization token" });
  }
  try {
    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const userID = decoded.userID;
    if (!userID) {
      return res.status(401).json({ message: "Invalid authorization token" });
    }
    req.userID = userID;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid authorization token" });
  }
}

module.exports = authorizeUser;
