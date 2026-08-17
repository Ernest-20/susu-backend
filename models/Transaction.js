// Represents a single entry in a user's financial history — either a
// deposit into a savings plan, or a credit request against the marketplace.
// Matches the frontend's TransactionHistory screen exactly: type, amount,
// date, and status.

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // Whose transaction this is.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which savings plan this deposit belongs to. Only required for
    // "deposit" type transactions — a credit request isn't tied to a plan.
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SavingsPlan",
      default: null,
    },

    // Matches the frontend's two transaction categories.
    type: {
      type: String,
      enum: ["deposit", "credit"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    // A short human-readable label, e.g. "Deposit" or the product name
    // for a credit request — matches what TransactionHistory.jsx displays.
    label: {
      type: String,
      required: true,
      trim: true,
    },

    // Deposits are usually instantly "done"; credit requests start
    // "pending" until an admin approves or rejects them (Day 24).
    status: {
      type: String,
      enum: ["done", "pending", "approved", "rejected"],
      default: "done",
    },
  },
  {
    timestamps: true, // gives us createdAt — used as the transaction "date"
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);