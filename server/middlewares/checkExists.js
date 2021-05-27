const db = require("../db");

function checkExists(option) {
  return async (req, res, next) => {
    const id = req.body[`${option}ID`];
    let value;
    try {
      switch (option) {
        case "user":
          value = await db.findUserByID(id);
          break;
        case "course":
          value = await db.findCourse(id);
          break;
        default:
          throw Error("option must be one of user or course");
      }
      if (!value) {
        return res
          .status(400)
          .json({ message: `${option} with id = ${id} not found` });
      }
      next();
    } catch (err) {
      console.error(err);
      return res.sendStatus(500);
    }
  };
}

module.exports = checkExists;
