// schema/authSchema.js
//
// Validates incoming request data BEFORE it reaches the controller.
// Mirrors the Zod validation already used on the frontend, but this is
// the backend's own independent check — never trust data from the client
// alone, since requests can come from anywhere, not just your React app.

const Joi = require("joi");

const registerSchema = Joi.object({
  fullName: Joi.string().min(2).max(100).required(),
  phone: Joi.string().min(9).required(),
  password: Joi.string().min(8).required(),
  accountType: Joi.string().valid("individual", "group").required(),
  // groupName is only required when accountType is "group" —
  // Joi's .when() lets us express that conditional rule directly.
  groupName: Joi.when("accountType", {
    is: "group",
    then: Joi.string().min(2).required(),
    otherwise: Joi.string().allow(null, "").optional(),
  }),
});

const loginSchema = Joi.object({
  phone: Joi.string().min(9).required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };