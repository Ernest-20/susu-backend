const express = require("express");
const router = express.Router();

const {
    createProduct,
    getProducts,
    getProductById,
} = require("../controllers/productController");

const requireAuth = require("../middlewares/auth");
const validate = require("../middlewares/validator");
const { createProductSchema } = require("../schema/productSchema");

router.post("/", requireAuth, validate(createProductSchema), createProduct);
router.get("/", requireAuth, getProducts);
router.get("/:id", requireAuth, getProductById);

module.exports = router;