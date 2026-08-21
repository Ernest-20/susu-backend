const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const Group = require("../models/Group");
const User = require("../models/User");

// A member request soft credit on a specific product, through a
// credit on a product, and their group's admin approves or rejects it.
async function createCreditRequest(req, res, next) {
    try {
        const { productId, groupId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success:false, message: "Product not found"});
        }

        const group = await Group.findById(groupId);
        if(!group) {
            return res.status(404).json({ success: false, message: "Group not found"});
        }

        // Confirm the requester actually belongs to this group
        const isMember =
        group.admin.toString() ===req.user.id ||
        group.members.some((m) => m.toString() === req.user.id);
        if(!isMember) {
            return res.status(403).json({
                success: false,
                message: "You must be a member of this grouup to request credit through it.",
            });
        }

        //Re-check eligibilty server-side-never trust that the frontend
        // already checked this; a user could call this endpoint directly.
        const user = await User.findById(req.user.id);
        const userScore = user.creditScore || 0;
        if (userScore < product.minCreditScore) {
            return res.status(403).json({
                success: false,
                message: "Your credit score doesn't yet qulify for this product.",
            });
        }

        const creditRequest = await Transaction.create({
            user: req.user.id,
            group: group._id,
            product: product._id,
            type: "credit",
            amount: product.price,
            label: `Credit request - ${product.name}`,
            status: "pending",
        });

        res.status(201).json({ success: true, data: creditRequest });
    } catch (error) {
        next(error);
    }
}

// get pending for a group - GET/api/credit-requests/group/:groupId
// Only the group's admin can view this - matches AdminApproval,jsx
// which only shows this screen to an admin.
async function getPendingRequestsForGroup(req, res, next) {
   try {
    const group = await Group.findById(req.params.groupId);
    if(!group) {
        return res.status(404).json({ success: false, message: "Group not found"});
    }
    if (group.admin.toString() !== req.user.id) {
        return res.status(403).json ({
            success: false,
            message: "Only the group admin can view pending requests.",
        });
    }

    // .populate() pulls in the requesting member's name ans credit score
    // (matches the AdminApproval.jsx card whcih shows both).
 const requests = await Transaction.find({
    group: group._id,
    type: "credit",
    status: "pending",
})
.populate("user", "fullName creditScore")
.populate("product", "name price shop")
.sort({ createdAt: -1 });

res.status(200).json({ success: true, data: requests });
} catch (error) {
    next(error);
}
}

// APPROVE OR REJECT - PATCH /api/credit-request/:id/decison
async function decideCreditRequest(req, res, next) {
    try {
        const { decision } = req.body; // approve or rejected

        const request = await Transaction.findById(req.params.id);
        if (!request || request.type !== "credit") {
            return res.status(404).json({ success: false, message: "Credit request not found" });
        }
        if(request.status !== "pending"){
            return res.status(404).json ({
                success: false,
                message: "This request has already been decided.",
            });
        }

        // Confirm the person making this decison is really the admin of
        // the group this request belongs to.
        const group = await Group.findById(request.group);
        if (!group || group.admin.toString() !== req.user.id) {
            return res.status(403).json ({
                success: false,
                message: "Only the group admin can approve or reject this request. ",
            });
        }

        request.status = decision;
        await request.save();

        res.status(200).json({ success: true, data: request });
    } catch(error) {
        next(error);
    }
}

module.exports = {
  createCreditRequest,
  getPendingRequestsForGroup,
  decideCreditRequest,
};