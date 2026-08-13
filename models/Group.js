// models/Group.js
//
// Represents a susu group — matches the GroupDashboard screen on the
// frontend (group name, total balance, and a list of members).

const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
    },

    // The user who created/manages this group. Only this person can
    // add or remove members, or approve credit requests later.
    // NOTE: one admin can own MULTIPLE groups — nothing here limits
    // a user to a single group, matching what you asked for on Day 6.
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // An array of User IDs — everyone who belongs to this group.
    // The admin does NOT need to be listed here separately, but we
    // include them for convenience so member lists are complete.
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Running total of everything saved by this group's members,
    // combined. Updated later (Day 20) whenever a deposit happens.
    totalSaved: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Group", groupSchema);