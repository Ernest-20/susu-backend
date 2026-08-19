// controllers/productController.js

const Product = require("../models/Product");
const User = require("../models/User");

// CREATE — POST /api/products
// For now, ANY logged-in user can technically create a product — this
// is a placeholder until Day 26 (role-based access control) restricts
// this to actual platform admins. Flagged as a TODO so it's not forgotten.
async function createProduct(req, res, next) {
  try {
    // TODO (Day 26): restrict this to admin-only accounts once roles exist.
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

// READ ALL — GET /api/products
// Supports optional ?category= and ?search= query params, matching the
// frontend Marketplace's category pills and search box. Also calculates
// creditEligible PER PRODUCT, specific to the logged-in user's current
// credit score — this is the key piece tying Day 22 and Day 23 together.
async function getProducts(req, res, next) {
  try {
    const { category, search } = req.query;

    const filter = {};
    if (category && category !== "all") {
      filter.category = category;
    }
    if (search) {
      // $regex with "i" option = case-insensitive partial text match,
      // e.g. "fan" matches "Standing Fan".
      filter.name = { $regex: search, $options: "i" };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    // Get the logged-in user's CURRENT stored credit score (already
    // calculated and saved by Day 22's GET /api/credit-score endpoint).
    const user = await User.findById(req.user.id);
    const userScore = user.creditScore || 0;

    // .map() transforms each product, ADDING a creditEligible field —
    // true if the user's score meets or exceeds this product's threshold.
    const productsWithEligibility = products.map((product) => ({
      ...product.toObject(), // spreads all the product's real fields
      creditEligible: userScore >= product.minCreditScore,
    }));

    res.status(200).json({ success: true, data: productsWithEligibility });
  } catch (error) {
    next(error);
  }
}

// READ ONE — GET /api/products/:id
async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const user = await User.findById(req.user.id);
    const userScore = user.creditScore || 0;

    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        creditEligible: userScore >= product.minCreditScore,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { createProduct, getProducts, getProductById };