const db = require("../db");

const options = ["user", "course", "assignment", "exam"];

function find(option) {
  if (!options.includes(option)) {
    throw Error(`option must be one of ${options}`);
  }
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
      }
      if (!value && req.method !== "PUT") {
        return res.status(404).json({ message: `${option} not found` });
      }
      req[option] = value;
      return next();
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };
}

module.exports = {
  findUser: find("user"),
  findCourse: find("course"),
  findAssignment: find("assignment"),
  findExam: find("exam"),
};
