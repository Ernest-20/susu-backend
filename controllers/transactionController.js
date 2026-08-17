const Transaction = require("../models/Transaction");
const SavingsPlan = require("../models/SavingsPlan");

// CREATE DEPOSIT - POST /api/transactions/deposit
// This does TWO things at once: records the transaction, AND increases
// the savings plan's running total - matches the frontend's "+ Add funds"
// button on the Dashboard.
async function createDeposit(req, res, next) {
  try {
    const { planId, amount } = req.body;

    // Confirm the plan exists AND belongs to the logged-in user -
    // same ownership check pattern from Day 17.
    const plan = await SavingsPlan.findOne({ _id: planId, user: req.user.id });
    if (!plan) {
      return res.status(404).json({ success: false, message: "Savings plan not found" });
    }

    // Create the transaction record.
    const transaction = await Transaction.create({
      user: req.user.id,
      plan: plan._id,
      type: "deposit",
      amount,
      label: "Deposit",
      status: "done",
    });

    // Update the plan's running total - this is what makes the
    // Dashboard's "Total saved" figure accurate.
    plan.totalSaved += amount;
    await plan.save();

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
}

// READ ALL - GET /api/transactions
// Supports an optional ?type=deposit or ?type=credit query, matching
// the frontend's filter tabs (All / Deposits / Credit requests).
async function getTransactions(req, res, next) {
  try {
    const { type } = req.query;

    // Build the filter object dynamically - always scoped to the
    // logged-in user, and ONLY add the type filter if one was requested.
    const filter = { user: req.user.id };
    if (type && (type === "deposit" || type === "credit")) {
      filter.type = type;
    }

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: transactions });
  } catch (error) {
    next(error);
  }
}

// GET TOTAL DEPOSITED - GET /api/transactions/summary
// Matches the "Total deposited" summary card at the top of
// TransactionHistory.jsx - calculated on the backend instead of the
// frontend guessing from a partial list.
async function getSummary(req, res, next) {
  try {
    // Mongoose's aggregate() lets us do database-side math instead of
    // pulling every transaction into JavaScript and summing manually -
    // much faster once a user has hundreds of transactions.
    const result = await Transaction.aggregate([
      {
        $match: {
          user: req.user.id,
          type: "deposit",
          status: "done",
        },
      },
      {
        $group: {
          _id: null,
          totalDeposited: { $sum: "$amount" },
        },
      },
    ]);

    // aggregate() returns an array - if the user has NO deposits yet,
    // it'll be empty, so we default to 0 instead of crashing.
    const totalDeposited = result.length > 0 ? result[0].totalDeposited : 0;

    res.status(200).json({ success: true, data: { totalDeposited } });
  } catch (error) {
    next(error);
  }
}

module.exports = { createDeposit, getTransactions, getSummary };