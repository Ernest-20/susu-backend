const express = require("express");
const cors = require("cors");

const config = require("./config/config");
const connectDB = require("./database/connectDB");
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

config.validateEnv();

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

connectDB();

app.get("/", (req, res) => {
  res.json({ message: "Susu API is running 🚀" });
});

app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`🚀 Server is listening on port ${config.PORT}`);
});