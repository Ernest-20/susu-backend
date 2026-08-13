// models/User.js
//
// Defines the shape of a "user" document in MongoDB — matches the
// Individual/Group account types from the frontend's Register screen.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Every account has a full name (or group representative's name, for groups)
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    // Phone number is how users log in — must be unique so no two
    // accounts can register with the same number.
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Never store plain-text passwords — this field holds the HASHED
    // version, created by bcrypt in the controller before saving.
    password: {
      type: String,
      required: true,
    },

    // Matches the Individual/Group toggle from the frontend Register screen.
    accountType: {
      type: String,
      enum: ["individual", "group"], // only these two values are allowed
      required: true,
    },

    // Only relevant when accountType is "group" — optional otherwise.
    groupName: {
      type: String,
      trim: true,
      default: null,
    },

    // Matches the KYC flow — starts unverified, updates after document review.
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified"],
      default: "unverified",
    },

    // Used later for the credit-scoring engine (Week 4).
    creditScore: {
      type: Number,
      default: 0,
    },
  },
  {
    // Automatically adds createdAt and updatedAt fields to every document —
    // useful for showing "member since" or sorting by join date later.
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);