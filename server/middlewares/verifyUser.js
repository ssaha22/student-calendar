const options = ["user", "course", "assignment", "exam"];

function verifyUser(option) {
  if (!options.includes(option)) {
    throw Error(`option must be one of ${options}`);
  }
  if (option === "user") {
    return (req, res, next, id) => {
      if (req.userID != id) {
        return res.sendStatus(403);
      }
      return next();
    };
  }
  return (req, res, next) => {
    if (req[option] && req.userID !== req[option].userID) {
      return res.sendStatus(403);
    }
    if (!req[option]) {
      switch (option) {
        case "course":
          if (req.body.userID !== req.userID) {
            return res.sendStatus(403);
          }
          break;
        case "assignment":
        case "exam":
          if (req.courseUserID !== req.userID) {
            return res.sendStatus(403);
          }
          break;
      }
    }
    return next();
  };
}

module.exports = {
  verifyUser: verifyUser("user"),
  verifyCourseUser: verifyUser("course"),
  verifyAssignmentUser: verifyUser("assignment"),
  verifyExamUser: verifyUser("exam"),
};
