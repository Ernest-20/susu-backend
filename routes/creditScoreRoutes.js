const express = require("express");
const router = express.Router();

const { getMyCreditScore } = require("../controllers/creditScoreController");
const requireAuth = require("../middlewares/auth");

router.get("/", requireAuth, getMyCreditScore);

module.exports = router;