import express from "express";
import User from "../models/User.js";
import SocialAiImage from "../models/SocialAiImage.js";
import SocialCommentScenario from "../models/SocialCommentScenario.js";
import SocialSetting from "../models/SocialSetting.js";
import authMiddleware from "../middleware/auth.js";

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
    const { totalScore = 0 } = req.body;

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

    await user.save();

    return res.json({ success: true, coinsEarned, completionBonus, totalCoins: user.coins, stats });
  } catch (err) {
    console.error("Complete social game error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
