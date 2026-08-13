// middlewares/errorHandler.js
//
// Centralized error handler — the LAST middleware in app.js. Every error
// from anywhere in the app (thrown AppErrors, Mongoose errors, unexpected
// bugs) ends up here, so the response format is always consistent.

function errorHandler(err, req, res, next) {
  console.error(err.stack);

  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred!";

  // Mongoose "CastError" happens when an ID in the URL isn't a valid
  // MongoDB ObjectId format (e.g. someone typed a random string instead
  // of a real ID) — we turn this into a clean 400 instead of a raw 500.
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Mongoose "duplicate key" error — happens if something marked
  // `unique: true` (like phone number) already exists.
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `An account with this ${field} already exists.`;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = errorHandler;