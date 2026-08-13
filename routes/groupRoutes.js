// routes/groupRoutes.js

const express = require("express");
const router = express.Router();

const {
  createGroup,
  getMyGroups,
  getGroupById,
  addMember,
  removeMember,
} = require("../controllers/groupController");

const requireAuth = require("../middlewares/auth");
const validate = require("../middlewares/validator");
const { createGroupSchema, addMemberSchema } = require("../schema/groupSchema");

// Every group route requires the user to be logged in.
router.post("/", requireAuth, validate(createGroupSchema), createGroup);
router.get("/", requireAuth, getMyGroups);
router.get("/:id", requireAuth, getGroupById);
router.post("/:id/members", requireAuth, validate(addMemberSchema), addMember);
router.delete("/:id/members/:memberId", requireAuth, removeMember);

module.exports = router;