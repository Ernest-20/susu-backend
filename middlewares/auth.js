// middlewares/auth.js
//
// Protects routes that require a logged-in user. Checks for a valid JWT
// in the request header, and if valid, attaches the user's ID to req.user
// so controllers know WHO is making the request.
//
// Without this, anyone could create a savings plan and claim it belongs
// to any user ID they want — this middleware is what makes that impossible.

const jwt = require("jsonwebtoken");
const config = require("../config/config");

function requireAuth(req, res, next) {
  // Frontend sends the token as: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided. Please log in.",
    });
  }

  // Strip off "Bearer " to get just the token itself.
  const token = authHeader.split(" ")[1];

  try {
    // Verifies the token was signed with OUR secret and hasn't expired.
    // If valid, decoded contains whatever we put in jwt.sign() back in
    // authController.js — in our case, { userId: ... }.
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
}

module.exports = requireAuth;