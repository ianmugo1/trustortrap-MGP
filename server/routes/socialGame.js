import express from "express";
import User from "../models/User.js";
import SocialAiImage from "../models/SocialAiImage.js";
import SocialCommentScenario from "../models/SocialCommentScenario.js";
import SocialSetting from "../models/SocialSetting.js";
import authMiddleware from "../middleware/auth.js";
import { applyMasteryResult } from "../lib/progress.js";
import { applyXpReward } from "../lib/xp.js";

const router = express.Router();

function normalizeAiChoice(choice) {
  return choice === "ai" || choice === "real" || choice === "left" || choice === "right"
    ? choice
    : "";
}

function normalizeNumberList(values) {
  if (!Array.isArray(values)) return [];

  return [...new Set(values.map((value) => Number(value)).filter(Number.isInteger))];
}

function normalizeBoolean(value) {
  return typeof value === "boolean" ? value : null;
}

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
 * Body: { aiAnswers, commentAnswers, privacyAnswers }
 * - Awards 10 coins per correct answer + 20 coin completion bonus
 * - Updates user.socialStats
 */
router.post("/complete", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      aiAnswers = [],
      commentAnswers = [],
      privacyAnswers = [],
    } = req.body || {};

    const [aiImages, commentScenarios, settings] = await Promise.all([
      SocialAiImage.find().sort({ order: 1 }).lean(),
      SocialCommentScenario.find().sort({ order: 1 }).lean(),
      SocialSetting.find().sort({ order: 1 }).lean(),
    ]);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const aiMap = new Map(aiImages.map((item) => [String(item._id), item]));
    const commentMap = new Map(commentScenarios.map((item) => [String(item._id), item]));
    const settingMap = new Map(settings.map((item) => [String(item._id), item]));

    let aiCorrect = 0;
    let commentCorrect = 0;
    let privacyCorrect = 0;

    const normalizedAiAnswers = Array.isArray(aiAnswers) ? aiAnswers : [];
    for (const entry of normalizedAiAnswers) {
      const image = aiMap.get(String(entry?.id || ""));
      const choice = normalizeAiChoice(entry?.choice);

      if (!image || !choice) continue;

      const isCorrect = image.type === "side-by-side"
        ? choice === image.realSide
        : (choice === "ai") === Boolean(image.isAI);

      if (isCorrect) {
        aiCorrect += 1;
      }
    }

    const normalizedCommentAnswers = Array.isArray(commentAnswers) ? commentAnswers : [];
    for (const entry of normalizedCommentAnswers) {
      const scenario = commentMap.get(String(entry?.id || ""));
      if (!scenario) continue;

      const selectedIndexes = normalizeNumberList(entry?.selectedIndexes);
      const botIndexes = scenario.comments
        .map((comment, index) => (comment.isBot ? index : -1))
        .filter((index) => index >= 0);

      const botIndexSet = new Set(botIndexes);
      commentCorrect += selectedIndexes.filter((index) => botIndexSet.has(index)).length;
    }

    const normalizedPrivacyAnswers = Array.isArray(privacyAnswers) ? privacyAnswers : [];
    for (const entry of normalizedPrivacyAnswers) {
      const setting = settingMap.get(String(entry?.id || ""));
      const enabled = normalizeBoolean(entry?.enabled);

      if (!setting || enabled === null) continue;
      if (setting.dangerous && enabled) {
        privacyCorrect += 1;
      }
    }

    const aiAnswered = Math.min(normalizedAiAnswers.length, aiImages.length);
    const commentAnswered = Math.min(
      normalizedCommentAnswers.length,
      commentScenarios.length
    );
    const privacyAnswered = Math.min(normalizedPrivacyAnswers.length, settings.length);
    const numericScore = aiCorrect + commentCorrect + privacyCorrect;

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
      totalScore: numericScore,
      breakdown: {
        aiImages: { answered: aiAnswered, correct: aiCorrect },
        commentScenarios: { answered: commentAnswered, correct: commentCorrect },
        privacy: { answered: privacyAnswered, correct: privacyCorrect },
      },
      stats,
    });
  } catch (err) {
    console.error("Complete social game error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
