// utils/AppError.js
//
// A custom Error class that carries an HTTP status code along with the
// message. This lets controllers throw meaningful errors like:
//   throw new AppError("Note not found", 404);
// instead of manually writing res.status(404).json(...) everywhere,
// and the errorHandler middleware knows exactly what status to send back.

class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // passes the message to the built-in Error class
    this.statusCode = statusCode;
    this.isOperational = true; // marks this as a "known/expected" error,
    // as opposed to a genuine bug — useful for logging differently later
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;