// transactionSchema.js

const Joi = require("joi");

const createDepositSchema = Joi.object({
    planId: Joi.string().required(), // which savings plan this deposit goes to
    amount: Joi.number().positive().required(),
});

module.exports = { createdDepositSchema};