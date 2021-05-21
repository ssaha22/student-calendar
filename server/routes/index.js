const router = require("express").Router();

const usersRoute = require("./users");
const coursesRoute = require("./courses");
const assignmentsRoute = require("./assignments");
const examsRoute = require("./exams");

router.use("/users", usersRoute);
router.use("/courses", coursesRoute);
router.use("/assignments", assignmentsRoute);
router.use("/exams", examsRoute);

module.exports = router;
