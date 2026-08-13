// routes/authRoutes.js
//
// Defines the actual API endpoints for authentication, e.g.:
//   POST /api/auth/register
//   POST /api/auth/login

const express = require("express");
const router = express.Router();

const { register, login } = require("../controllers/authController");
const validate = require("../middlewares/validator");
const { registerSchema, loginSchema } = require("../schema/authSchema");

// validate(registerSchema) runs FIRST — if the request body is invalid,
// it responds with an error immediately and register() never even runs.
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

module.exports = router;