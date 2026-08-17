// This is the actual score credit logic.
// It separate froom the controller. Keeping this in own "service" file,
// Rather than inside the controller means the same calculation can be resused elsewhere later.
// e.g. when checking marketplace eligibility
// duplicating the formula in multiple places.

const SavingsPlan = require("../models/SavingsPlan");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// How many deposits we'd expect by now, based on a plan's frequency
// and how many days it's existed.  E.g. a "weekly" plan created 21 days
// ago should have -3 expected despoits.

function getExpectedDeposits(plan) {
    const daysSinceCreated = Math.floor(
        (Date.now() - plan.creditedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const intervalDays = { daily: 1, weekly: 7, monthly: 30 };
    const interval = intervalDays[plan.frequency];

    // +1 beacuse the day the plan was created usually counts as deposit 1
    const expected = Math.floor(daysSinceCreated / interval) + 1;

    return Math.max(expected, 1); // never divide by 0 later
}

// The main function - calculated and returns a 0 - 100 credit score
// for a given user, based on their real savings data.

async function calculateCreditScore(userId) {
    const plans = await SavingsPlan.find({ user: userId, status: "active" });
    const user = await User.findById(userId);

    // No active plan yet? Start at a neutral baseline score.
    if (plans.length === 0) {
        return {
            score: 0,
            breakdown: {
                consistency: 0,
                savingsAmount: 0,
                verification: 0,
            },
        };
    }

    // --- 1. CONSISTENCY SCORE (worth 60 of 100 points) ---
    let totalExpected = 0;
    let totalActual = 0;

    for (const plan of plans) {
        const expected = getExpectedDeposits(plan);
        const actualCount = await Transaction.countDocuments({
            plan: plan._id,
            type: "deposit",
            status: "done",
        });
        totalExpected += expected;
        totalActual += actualCount;
    }

    // Ratio of deposits made vs deposits expected, capped at 1.0 (100%) -
    // someone depositing MORE often than expected shouldn't overflow the score.
    const consistencyRatio = Math.min(totalActual / totalExpected, 1);
    const consistencyScore = consistencyRatio * 60;

    // --- 2. Savings amount score (worth 25 of 100 points) ---
    const totalSaved = plan.reduce((sum, plan) => sum + (plan.totalSaved || 0), 0);

    // Math.log() gives DIMINISHING RETURN - going from GHS 0 to GHS 1,000
    // matters a lot more to the score than going from GHS 1,000 to GHS 11,000.
    // We cap the score contribution at 25 regardless of how much someone saves.
    const savingsAmountScore = Math.min(
        (Math.log10(totalSaved + 1) / Math.log10(10000)) * 25,
        25
    );

    // --- 3. VERIFICATION BONUS (worth 15 of 100 points) ---
    const verificationScore = user && user.verificationStatus === "verified" ? 15 : 0;

    // --- FINAL SCORE ---
    const finalScore = Math.round(consistencyScore + savingsAmountScore + verificationScore);

    return {
        score: finalScore,
        breakdown: {
            consistency: Math.round(consistencyScore),
            savingsAmount: Math.round(savingsAmountScore),
            verification: verificationScore,
        },
    };
}

module.exports = { calculateCreditScore };