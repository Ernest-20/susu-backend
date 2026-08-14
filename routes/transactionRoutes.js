const express = require("express");
const router = express.Router();

const {
    createDeposit,
    getTransactions,
    getSummary,
} = require("../controllers/transactionController");

const requireAuth = require("../middlewares/auth");
const validate = require("../middlewares/validator");
const { createDepositSchema } = require("../schema/transactionSchema");

router.post("/deposit", requireAuth, validate(createDepositSchema), createDeposit);
router.get("/", requireAuth, getTransactions);
router.get("/summary", requireAuth, getSummary);

module.exports = router;