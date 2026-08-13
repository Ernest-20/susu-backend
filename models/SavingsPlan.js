// models/SavingsPlan.js
//
// Represents one savings plan a user has created — matches the
// frequency/amount/goal fields from the frontend's CreatePlan screen.

const mongoose = require("mongoose");

const savingsPlanSchema = new mongoose.Schema(
  {
    // Links this plan to the user who owns it. "ref: User" lets us
    // later call .populate("user") to get the full user details
    // instead of just this ID.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    // Optional — matches the "Goal (optional)" field from CreatePlan.jsx
    goal: {
      type: String,
      trim: true,
      default: null,
    },

    // Running total saved under THIS plan specifically.
    // Starts at 0, increases as deposits come in (Day 20 will handle that).
    totalSaved: {
      type: Number,
      default: 0,
    },

    // Lets a user (or the system) mark a plan as no longer active,
    // without deleting its history.
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SavingsPlan", savingsPlanSchema);