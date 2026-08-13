// routes/savingsPlanRoutes.js

const express = require("express");
const router = express.Router();

const {
  createPlan,
  getPlans,
  getPlanById,
  updatePlan,
  deletePlan,
} = require("../controllers/savingsPlanController");

const requireAuth = require("../middlewares/auth");
const validate = require("../middlewares/validator");
const { createPlanSchema, updatePlanSchema } = require("../schema/savingsPlanSchema");

// requireAuth runs on EVERY route below — a user must be logged in
// to create, view, update, or delete any savings plan.
router.post("/", requireAuth, validate(createPlanSchema), createPlan);
router.get("/", requireAuth, getPlans);
router.get("/:id", requireAuth, getPlanById);
router.put("/:id", requireAuth, validate(updatePlanSchema), updatePlan);
router.delete("/:id", requireAuth, deletePlan);

module.exports = router;