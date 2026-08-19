const Joi = require("joi");

const createProductSchema = Joi.object({
    name: Joi.string().min(2).max(150).required(),
    price: Joi.number().positive().required(),
    shop: Joi.string().min(2).max(100).required(),
    category: Joi.string().valid("electronics", "appliances", "furniture").required(),
    minCreditScore: Joi.number().min(0).max(100).optional(),
});

module.exports = { createProductSchema };