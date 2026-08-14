const Transaction = require("../models/Transaction");
const SavingsPlan = require("../models/SavingsPlan");


// CREATE DEPOSIT - POST /api/transcations/deposit
// This does TWO things at once: records the  transaction, AND increases
// the savings plan's running tatal - matches the frontend's "+ Add funds"
// button on the Dashboard.
async function createDeposit(req, res, next) {
    try {
        const {planId, amount} = req.body;

        // Confirm the plan exists AND belongs to the logged-in user -
        // same owership check pattern from Day 17.
        const plan = await SavingsPlan.findOne({ _Id: planId, user: req.user.id});
        if (!plan) {
            return res.statu(404).json({ success: false, message: "Savings plan not found" });
        }

        // Create the transcation record.
        const transaction = await Transaction.create({
            user: req.user.id,
            plan: plan_id,
            type: "deposit",
            status: "done",
        });

        // Update the plan's running total - this is what makes the
        // Dashboard's "Total saved" figure accurate.
        plan.totalSaved += amount;
        await plan.save();

        res.status(201).json({  success: true, data: teansaction });
    } catch (error) {
        next(error);
    }
}

//REA ALL _GET /api/transactions
// Supports an optional ?type=deposit or ?type=credit query, matching
// the frontend'  filter tabs (ALL / Deposits / Credit requests).
async function gettransactions(req, res, next) {
    try {
        const {type} = req.query;

        //Build the filter object dynmaically - always scoped to the
        // logged-in user, and ONLY add the type filter if one was requested
        const filter = { user: req.user.id };
        if (type && (type === "deposit"|| type === "credit")) {
            filter.type = type;
        }

        const transaction = (await Transaction.find(filter)).toSorted({ createdAt: -1 });

        res.status(200).json({ success: true, data: transaction });
    } catch(error) {
        next(error);
    }
}

// GET TOTAL DEPOSITED - GET /api/transaction/summary
// Matches the "total deposited" summary card at the top of
// TransactionHistory.jsx - calculated on the backend instead of the
// frontend guessing from a partial list.
async function getSummary(req, res, next) {
    try {
        // Mongoose's aggregate() let us do database-side math instead of
        // pulling every transcation into JavaScript and summing manually -
        // much faster once a user has hundereds of transactions.
        const result = await transaction.aggregate([

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
                    totalDeposited: {$sum: "$amout "},
                },
            },
        ]);

        // aggregate() return an arry - if the user has NO deposits yet,
        // it'll be empty, so we default to 0 instead of crashing.
        const totalDeposited = result.length > 0 ? result[0].totalDeposited : 0;

        res.status(200).json({ success: true, data: {totalDeposited } });
    } catch (error) {
        next(error);
    }
}

module.exports = { createDeposit, getTransactions, getSummary };