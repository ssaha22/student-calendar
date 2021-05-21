require("dotenv").config();

const express = require("express");
const app = express();

const routes = require("./routes");

app.use("/api/v1", routes);

app.listen(process.env.PORT || 8000);
