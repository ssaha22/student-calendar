const db = require("../db");

const options = ["user", "course"];

function checkExists(option) {
  if (!options.includes(option)) {
    throw Error(`option must be one of ${options}`);
  }
  return async (req, res, next) => {
    if (req.method !== "POST" && req.method !== "PUT") {
      return next();
    }
    const id = req.body[`${option}ID`];
    let value;
    try {
      switch (option) {
        case "user":
          value = await db.findUserByID(id);
          break;
        case "course":
          value = await db.findCourse(id);
          value && (req.courseUserID = value.userID);
          break;
      }
      if (!value) {
        return res
          .status(400)
          .json({ message: `${option} with id = ${id} not found` });
      }
      return next();
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };
}

module.exports = {
  checkUserExists: checkExists("user"),
  checkCourseExists: checkExists("course"),
};
