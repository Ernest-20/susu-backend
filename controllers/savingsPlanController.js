// controllers/savingsPlanController.js

const SavingsPlan = require("../models/SavingsPlan");

// CREATE — POST /api/plans
async function createPlan(req, res, next) {
  try {
    const { frequency, amount, goal } = req.body;

    const newPlan = await SavingsPlan.create({
      user: req.user.id, // comes from the requireAuth middleware
      frequency,
      amount,
      goal: goal || null,
    });

    res.status(201).json({ success: true, data: newPlan });
  } catch (error) {
    next(error);
  }
}

// READ ALL — GET /api/plans
// Returns only the plans belonging to the logged-in user.
async function getPlans(req, res, next) {
  try {
    const plans = await SavingsPlan.find({ user: req.user.id }).sort({
      createdAt: -1, // newest first
    });

    res.status(200).json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
}

// READ ONE — GET /api/plans/:id
async function getPlanById(req, res, next) {
  try {
    const plan = await SavingsPlan.findOne({
      _id: req.params.id,
      user: req.user.id, // ensures users can only view THEIR OWN plans
    });

    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
}

// UPDATE — PUT /api/plans/:id
async function updatePlan(req, res, next) {
  try {
    const plan = await SavingsPlan.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true } // return the UPDATED document, and re-check schema rules
    );

    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    res.status(200).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
}

// DELETE — DELETE /api/plans/:id
async function deletePlan(req, res, next) {
  try {
    const plan = await SavingsPlan.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    res.status(200).json({ success: true, message: "Plan deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = { createPlan, getPlans, getPlanById, updatePlan, deletePlan };