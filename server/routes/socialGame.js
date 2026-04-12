import express from "express";
import User from "../models/User.js";
import SocialAiImage from "../models/SocialAiImage.js";
import SocialCommentScenario from "../models/SocialCommentScenario.js";
import SocialSetting from "../models/SocialSetting.js";
import authMiddleware from "../middleware/auth.js";
import { applyMasteryResult } from "../lib/progress.js";
import { applyXpReward } from "../lib/xp.js";

const router = express.Router();

/**
 * GET /api/social/questions
 * Returns all game content for all three acts, sorted by order.
 */
router.get("/questions", authMiddleware, async (req, res) => {
  try {
    const [aiImages, commentScenarios, settings] = await Promise.all([
      SocialAiImage.find().sort({ order: 1 }).lean(),
      SocialCommentScenario.find().sort({ order: 1 }).lean(),
      SocialSetting.find().sort({ order: 1 }).lean(),
    ]);

    return res.json({ success: true, aiImages, commentScenarios, settings });
  } catch (err) {
    console.error("Load social questions error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/social/complete
 * Body: { totalScore }
 * - Awards 10 coins per correct answer + 20 coin completion bonus
 * - Updates user.socialStats
 */
router.post("/complete", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { totalScore = 0, breakdown = {} } = req.body;

    const numericScore = Number(totalScore) || 0;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.socialStats) user.socialStats = {};

    const stats = user.socialStats;
    stats.totalGames      = (stats.totalGames || 0) + 1;
    stats.lastScore       = numericScore;
    stats.lastCompletedAt = new Date();
    if (numericScore > (stats.bestScore || 0)) stats.bestScore = numericScore;

    const coinsEarned     = numericScore * 10;
    const completionBonus = 20;
    user.coins = (user.coins || 0) + coinsEarned + completionBonus;
    const xpReward = 18 + numericScore * 2;
    const xpInfo = applyXpReward(user, xpReward);

    const aiAnswered = Number(breakdown.aiImages?.answered || 0);
    const aiCorrect = Number(breakdown.aiImages?.correct || 0);
    const commentAnswered = Number(breakdown.commentScenarios?.answered || 0);
    const commentCorrect = Number(breakdown.commentScenarios?.correct || 0);
    const privacyAnswered = Number(breakdown.privacy?.answered || 0);
    const privacyCorrect = Number(breakdown.privacy?.correct || 0);

    if (aiAnswered > 0) {
      applyMasteryResult(user, "aiSafety", {
        answered: aiAnswered,
        correct: aiCorrect,
      });
    }

    if (commentAnswered > 0) {
      applyMasteryResult(user, "socialScams", {
        answered: commentAnswered,
        correct: commentCorrect,
      });
    }

    if (privacyAnswered > 0) {
      applyMasteryResult(user, "privacy", {
        answered: privacyAnswered,
        correct: privacyCorrect,
      });
    }

    user.markModified("mastery"); // tell Mongoose the nested mastery object changed
    await user.save();

    return res.json({
      success: true,
      coinsEarned,
      completionBonus,
      xpAwarded: xpReward,
      level: xpInfo.level,
      totalXp: user.xp,
      totalCoins: user.coins,
      stats,
    });
  } catch (err) {
    console.error("Complete social game error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
