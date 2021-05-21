require("dotenv").config();

const express = require("express");
const app = express();
const db = require("./db/config");

app.listen(process.env.PORT || 8000, async () => {
  const res = await db.query("SELECT * FROM users");
  const user = res.rows[0];
  console.log(user);
});
