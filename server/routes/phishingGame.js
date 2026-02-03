import express from "express";
import PhishingQuestion from "../models/PhishingQuestion.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js"; // must set req.user.id from JWT

const router = express.Router();

/**
 * GET /api/phishing/questions
 * - Returns all phishing questions
 * - Protected by auth so we know which user is playing
 */
router.get("/questions", authMiddleware, async (req, res) => {
  try {
    const questions = await PhishingQuestion.find().lean();

    return res.json({
      success: true,
      questions,
    });
  } catch (err) {
    console.error("Load phishing questions error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/phishing/submit
 * Body: { questionId, answerGiven }
 * - Checks if answer is correct (based on isPhishing / phishingSide)
 * - Awards coins for correct answers
 * - Updates phishingStats on the User (totalQuestionsAnswered, totalCorrect)
 */
router.post("/submit", authMiddleware, async (req, res) => {
  try {
    const { questionId, answerGiven } = req.body;
    const userId = req.user.id; // set by auth middleware

    if (!questionId || !answerGiven) {
      return res.status(400).json({
        success: false,
        message: "questionId and answerGiven are required",
      });
    }

    const question = await PhishingQuestion.findById(questionId);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    let isCorrect = false;
    const hasOptions = Array.isArray(question.options) && question.options.length > 0;
    const isDual = Boolean(question.imageLeft && question.imageRight);

    if (hasOptions) {
      // Multiple choice question - answerGiven should be the option index (0-3)
      const selectedIndex = Number(answerGiven);
      if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex > 3) {
        return res.status(400).json({
          success: false,
          message: "Invalid answer format - expected option index 0-3",
        });
      }
      isCorrect = selectedIndex === question.correctOption;
    } else if (isDual) {
      if (!question.phishingSide) {
        return res.status(422).json({
          success: false,
          message: "Question is missing phishingSide",
        });
      }
      if (answerGiven !== "left" && answerGiven !== "right") {
        return res.status(400).json({
          success: false,
          message: "Invalid answer format",
        });
      }
      isCorrect = answerGiven === question.phishingSide;
    } else {
      if (answerGiven !== "Phishing" && answerGiven !== "Safe") {
        return res.status(400).json({
          success: false,
          message: "Invalid answer format",
        });
      }
      isCorrect = question.isPhishing
        ? answerGiven === "Phishing"
        : answerGiven === "Safe";
    }

    // Scoring rule for each correct answer
    const pointsForCorrect = 10;
    const pointsAwarded = isCorrect ? pointsForCorrect : 0;

    // Load user
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Update coins if correct
    if (pointsAwarded > 0) {
      user.coins = (user.coins || 0) + pointsAwarded;
    }

    // Ensure phishingStats object exists
    if (!user.phishingStats) {
      user.phishingStats = {};
    }

    // Update aggregate stats
    user.phishingStats.totalQuestionsAnswered =
      (user.phishingStats.totalQuestionsAnswered || 0) + 1;

    if (isCorrect) {
      user.phishingStats.totalCorrect =
        (user.phishingStats.totalCorrect || 0) + 1;
    }

    await user.save();

    return res.json({
      success: true,
      correct: isCorrect,
      pointsAwarded,
      totalCoins: user.coins,
      stats: user.phishingStats,
    });
  } catch (err) {
    console.error("Submit phishing answer error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
});

/**
 * POST /api/phishing/complete
 * Body: { scoreForThisRun }
 * - Called once when the user finishes the game
 * - Updates phishingStats.totalGames, bestScore, lastScore, lastCompletedAt
 * - Awards a completion bonus in coins
 */
router.post("/complete", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { scoreForThisRun } = req.body;

    const numericScore = Number(scoreForThisRun) || 0;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Ensure phishingStats exists
    if (!user.phishingStats) {
      user.phishingStats = {};
    }

    const stats = user.phishingStats;

    // Update game-level stats
    stats.totalGames = (stats.totalGames || 0) + 1;
    stats.lastScore = numericScore;
    stats.lastCompletedAt = new Date();

    if (numericScore > (stats.bestScore || 0)) {
      stats.bestScore = numericScore;
    }

    // Completion bonus (on top of per-question rewards)
    const completionBonus = 20;
    user.coins = (user.coins || 0) + completionBonus;

    await user.save();

    return res.json({
      success: true,
      completionBonus,
      totalCoins: user.coins,
      stats,
    });
  } catch (err) {
    console.error("Complete phishing game error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
});

export default router;
