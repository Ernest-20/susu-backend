// controllers/groupController.js

const Group = require("../models/Group");
const User = require("../models/User");

// CREATE — POST /api/groups
// The logged-in user becomes the admin of this new group automatically.
async function createGroup(req, res, next) {
  try {
    const { name } = req.body;

    const newGroup = await Group.create({
      name,
      admin: req.user.id,
      members: [req.user.id], // admin is automatically a member too
    });

    res.status(201).json({ success: true, data: newGroup });
  } catch (error) {
    next(error);
  }
}

// READ ALL — GET /api/groups
// Returns every group where the logged-in user is EITHER the admin
// OR a regular member — matches the frontend's group-switcher pills,
// which should show all groups a user belongs to, not just ones they run.
async function getMyGroups(req, res, next) {
  try {
    const groups = await Group.find({
      $or: [{ admin: req.user.id }, { members: req.user.id }],
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: groups });
  } catch (error) {
    next(error);
  }
}

// READ ONE — GET /api/groups/:id
// .populate() replaces the raw member IDs with their actual user details
// (name, credit score, etc.) — exactly what the frontend member list needs.
async function getGroupById(req, res, next) {
  try {
    const group = await Group.findById(req.params.id).populate(
      "members",
      "fullName phone creditScore verificationStatus" // only these fields, not password
    );

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Confirm the requester actually belongs to this group before showing it.
    const isMember =
      group.admin.toString() === req.user.id ||
      group.members.some((m) => m._id.toString() === req.user.id);

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this group.",
      });
    }

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
}

// ADD MEMBER — POST /api/groups/:id/members
// Only the group's admin is allowed to add members.
async function addMember(req, res, next) {
  try {
    const { phone } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Only the admin can modify membership — this is the check that
    // protects the group from randoms adding themselves or others.
    if (group.admin.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the group admin can add members.",
      });
    }

    // Find the user being added by their phone number.
    const userToAdd = await User.findOne({ phone });
    if (!userToAdd) {
      return res.status(404).json({
        success: false,
        message: "No account found with that phone number.",
      });
    }

    // Prevent adding the same person twice.
    const alreadyMember = group.members.some(
      (memberId) => memberId.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({
        success: false,
        message: "This user is already a member of the group.",
      });
    }

    group.members.push(userToAdd._id);
    await group.save();

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
}

// REMOVE MEMBER — DELETE /api/groups/:id/members/:memberId
async function removeMember(req, res, next) {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (group.admin.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the group admin can remove members.",
      });
    }

    // .filter() rebuilds the members array WITHOUT the removed member's ID.
    group.members = group.members.filter(
      (memberId) => memberId.toString() !== req.params.memberId
    );
    await group.save();

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  addMember,
  removeMember,
};