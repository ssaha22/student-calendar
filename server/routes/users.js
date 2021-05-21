const router = require("express").Router();

router.get("/", (req, res) => res.send("hello"));

router.post("/register");

router.post("/login");

router.put("/:id");

router.get("/:id/courses");

router.get("/:id/assignments");

router.get("/:id/exams");

module.exports = router;
