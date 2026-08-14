// Represents a single entry in a user's financial history - either a
// deposit into a savings plan, or a credit request against the marketplace.
// matches the frontend's transactionHistory screen exactly: type, amont,
// date, and status.

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
    {
     // Where transaction this is
     user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
     },

     // Which savings plan this deposit belongs to. Only required for
     // "deposit" type trnasaction - a credit request isn't tied to a plan
     plan: {
        type: mongoosse.Schema.Types.ObjectId,
        ref: "SavingsPlan",
        required: null,
     },

     // Matches the frontend's two transcation categories.
     type: {
        type: String,
        enum: ["deposit", "credit"],
        required: true,
     },

     anount: {
        type: Number,
        required: true,
        mine: 1,
     },

     // A short human - readables label, e.g. "Deposit" or the project name
     // for a credit request - matches what TransactionHistroy.jsx displays.
     label: {
        typr: String,
        required: true,
        trim: true,
     },

     // Depoaits are usually instantly "done"; credit request start
     // "pending" until an admin approves or rejects them (Day 24).
     status: {
        type: String,
        enum: ["done", "pennding", "approved", "rejected"],
        default: "done",
     },
    },
    {
        timestamps: true,  // gives us createdAt - used the transaction "date"
    }
);

module.exports = mongoose.model("transaction", transactionSchema);

