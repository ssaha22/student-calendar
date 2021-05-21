const router = require("express").Router();

router.get("/", (req, res) => res.send("hello"));

router.post("/");

router.get("/:id");

router.put("/:id");

router.delete("/:id");

router.get("/:id/assignments");

router.get("/:id/exams");

module.exports = router;
