const db = require("../db");

function findByID(option) {
  return async (req, res, next, id) => {
    let value;
    try {
      switch (option) {
        case "user":
          value = await db.findUserByID(id);
          break;
        case "course":
          value = await db.findCourse(id);
          break;
        case "assignment":
          value = await db.findAssignment(id);
          break;
        case "exam":
          value = await db.findExam(id);
          break;
        default:
          throw Error(
            "option must be one of user, course, assignment, or exam"
          );
      }
      if (!value && req.method !== "PUT") {
        return res.status(404).json({ message: `${option} not found` });
      }
      req[option] = value;
      next();
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };
}

module.exports = findByID;
