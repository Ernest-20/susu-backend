const Joi = require("joi");

const createCreditRequestSchema = Joi.object({
    productId: Joi.string().required(),
    groupId: Joi.string().required(),
});

const decisionSchema = Joi.object({
    decision: Joi.string().valid("approved", "repected").required(),
});

module.exports = { createCreditRequestSchema, decisionSchema };