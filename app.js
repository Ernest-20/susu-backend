const express = require("express");
const cors = require("cors");

const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");
const authRoutes = require("./routes/authRoutes");
const savingsPlanRoutes = require("./routes/savingsPlanRoutes");
const groupRoutes = require("./routes/groupRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const creditScoreRoutes = require("./routes/creditScoreRoutes");
const productRoutes = require("./routes/productRoutes");
const creditRequestRoutes = require("./routes/creditRequestRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/plans", savingsPlanRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/credit-score", creditScoreRoutes);
app.use("/api/products", productRoutes);
app.use("/api/credit-requests",creditRequestRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Susu API is running 🚀" });
});

// Must come after all real routes, but before errorHandler.
app.use(notFound);

// Must be the very last app.use() call.
app.use(errorHandler);

// Export the app itself (not started yet) — server.js starts it for
// real use, and tests import app.js directly without starting a server
// or connecting to the real database.
module.exports = app;