const express = require("express");
const router = express.Router();

const {
    createCreditRequest,
    getPendingRequestsForGroup,
    decideCreditRequest,
} = require("../controllers/creditRequestController");

const requireAuth = require ("../middlewares/auth");
const validate = require("../middlewares/validator");
const {
    createCreditRequestSchema,
    decisionSchema,
} = require("../schema/creditRequestSchema");

router.post("/", requireAuth, validate(createCreditRequestSchema), createCreditRequest);
router.get("/group/:groupId", requireAuth, getPendingRequestsForGroup);
router.patch("/:id/decision", requireAuth, validate(decisionSchema), decideCreditRequest);

module.exports = router;
