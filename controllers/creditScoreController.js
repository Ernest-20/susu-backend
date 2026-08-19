const { calculateCreditScore } = require("../services/creditScoreService");
const User = require("../models/User");

// GET /api/credit- score
// Calculate the logged-in user's CURRENT socre, saves it onto their
// User document (so other parts of the app - like Group member lists-
// can read it without recalculating every time), and returns it.
async function getMyCreditScore(req, res, next) {
    try {
        const { score, breakdown } = await calculateCreditScore(req.user.id);

        // persist the freshly calculated score onto the user's record.
        await User.findByIdAndUpdate(req.user.id, { creditScore: score });

        res.status(200).json({
            success: true,
            data: { score, breakdown },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = { getMyCreditScore};