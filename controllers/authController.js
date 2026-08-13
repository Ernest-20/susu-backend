// controllers/authController.js
//
// Handles the actual work for register/login: hashing passwords,
// checking the database, and issuing JWT tokens.

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config/config");

// How many "rounds" bcrypt uses to hash passwords — higher is more secure
// but slower. 10 is a solid, commonly used default.
const SALT_ROUNDS = 10;

async function register(req, res, next) {
  try {
    const { fullName, phone, password, accountType, groupName } = req.body;

    // Check if a user with this phone number already exists —
    // prevents duplicate accounts.
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this phone number already exists.",
      });
    }

    // Hash the password BEFORE saving — we never store the raw password.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create the new user document in MongoDB.
    const newUser = await User.create({
      fullName,
      phone,
      password: hashedPassword,
      accountType,
      groupName: accountType === "group" ? groupName : null,
    });

    // Create a JWT token — this is what the frontend stores and sends
    // back on future requests to prove "I'm logged in as this user."
    const token = jwt.sign(
      { userId: newUser._id },
      config.JWT_SECRET,
      { expiresIn: "7d" } // token stays valid for 7 days
    );

    // Respond with the user's public info (never send the password back,
    // even the hashed version) plus the token.
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        phone: newUser.phone,
        accountType: newUser.accountType,
        groupName: newUser.groupName,
        verificationStatus: newUser.verificationStatus,
      },
    });
  } catch (error) {
    // Pass the error along to the global error handler in app.js
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { phone, password } = req.body;

    // Find the user by phone number.
    const user = await User.findOne({ phone });
    if (!user) {
      // Deliberately vague message — don't reveal whether the phone
      // number or the password was wrong, as a basic security practice.
      return res.status(400).json({
        success: false,
        message: "Invalid phone number or password.",
      });
    }

    // bcrypt.compare checks the plain-text password against the stored hash.
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number or password.",
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      config.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        accountType: user.accountType,
        groupName: user.groupName,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login };