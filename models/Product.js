// This represent the product partner shop is offering
// Marketplace.jsx frontend exactly: name, price, shop, category.

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },

        // The partner shop's display name: - e.g. "TechMart", "HomePlus"

// we keep it simple for now
// Since we don't yet need shops to log or manage their own
//inventory - that would be a bigger feature for later.
shop: {
    type: String,
    required: true,
    trim: true,
},
category: {
    type: String,
    enum: ["electronics", "appliances", "furniture"],
},

// the MINIMUM credit score a user needs to qualify for soft credit
// on this specific product , HIGHER -value items should require a
// higher score - e.g. a GHS 50 blender needs less trust than a
// GHS 2,800 Tv.
minCreditScore: {
    type: Number,
    default: 50,
},
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Product", productSchema);