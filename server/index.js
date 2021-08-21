require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

const routes = require("./routes");
app.use("/api/v1", routes);

app.listen(PORT, console.log(`Server running on port ${PORT}`));
