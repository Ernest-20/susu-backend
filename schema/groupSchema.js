// schema/groupSchema.js

const Joi = require("joi");

const createGroupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
});

const addMemberSchema = Joi.object({
  // The phone number of the person being added — simpler for an admin
  // to type than asking them for a raw MongoDB ID.
  phone: Joi.string().min(9).required(),
});

module.exports = { createGroupSchema, addMemberSchema };