// schema/savingsPlanSchema.js

const Joi = require("joi");

const createPlanSchema = Joi.object({
  frequency: Joi.string().valid("daily", "weekly", "monthly").required(),
  amount: Joi.number().positive().required(),
  goal: Joi.string().allow(null, "").optional(),
});

const updatePlanSchema = Joi.object({
  frequency: Joi.string().valid("daily", "weekly", "monthly").optional(),
  amount: Joi.number().positive().optional(),
  goal: Joi.string().allow(null, "").optional(),
  status: Joi.string().valid("active", "paused", "completed").optional(),
});

module.exports = { createPlanSchema, updatePlanSchema };