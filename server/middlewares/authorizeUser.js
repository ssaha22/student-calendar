const jwt = require("../utils/promisifyJWT");

async function authorizeUser(req, res, next) {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({
      message: "Request must include authorization header",
    });
  }
  const [bearer, authToken] = authHeader.split(" ");
  if (bearer !== "Bearer" || !authToken) {
    return res.status(401).json({
      message: "Authorization header must include bearer token",
    });
  }
  try {
    const decoded = await jwt.verify(authToken, process.env.JWT_SECRET);
    const userID = decoded.userID;
    if (!userID) {
      return res.status(401).json({ message: "Invalid authorization token" });
    }
    req.userID = userID;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid authorization token" });
  }
}

module.exports = authorizeUser;
