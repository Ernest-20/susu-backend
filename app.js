const express = require("express");
const cors = require("cors");

const config = require("./config/config");
const connectDB = require("./database/connectDB");
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");
const authRoutes = require("./routes/authRoutes");
const savingsPlanRoutes = require("./routes/savingsPlanRoutes");
const groupRoutes = require("./routes/groupRoutes");

config.validateEnv();

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

connectDB();

// --= Routes ---
app.use("/api/auth", authRoutes); // wires in register and login
app.use("/api/plans", savingsPlanRoutes);
app.use("/api/groups", groupRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Susu API is running 🚀" });
});


// must come after all real routes, but before errorHandler.
// Catches anything that didn't match a route above.
app.use(notFound);

// Must be the Very LAst app.use() call.
app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`🚀 Server is listening on port ${config.PORT}`);
});