import express from "express";
import PhishingQuestion from "../models/PhishingQuestion.js";
import User from "../models/User.js";
import authMiddleware from "../middleware/auth.js"; // must set req.user.id from JWT
import { applyMasteryResult } from "../lib/progress.js";
import { applyXpReward } from "../lib/xp.js";

const router = express.Router();

function isValidSubmittedAnswer(question, answerGiven) {
  const hasOptions = Array.isArray(question.options) && question.options.length > 0;
  const isDual = Boolean(question.imageLeft && question.imageRight);

  if (hasOptions) {
    const selectedIndex = Number(answerGiven);
    if (Number.isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= question.options.length) {
      return false;
    }

    if (typeof question.correctOption === "number") {
      return selectedIndex === question.correctOption;
    }

    if (question.correct) {
      const correctIndex = question.options.findIndex(
        (option) =>
          option === question.correct ||
          option.toLowerCase().includes(question.correct.toLowerCase().substring(0, 20))
      );

      return selectedIndex === correctIndex;
    }

    return false;
  }

  if (isDual) {
    return (answerGiven === "left" || answerGiven === "right") && answerGiven === question.phishingSide;
  }

  if (answerGiven !== "Phishing" && answerGiven !== "Safe") {
    return false;
  }

  return question.isPhishing ? answerGiven === "Phishing" : answerGiven === "Safe";
}

/**
 * GET /api/phishing/questions
 * - Returns all phishing questions
 * - Protected by auth so we know which user is playing
 */
router.get("/questions", authMiddleware, async (req, res) => {
  try {
    // Only return MCQ questions (ones with options array that has at least 1 item)
    const questions = await PhishingQuestion.find({
      "options.0": { $exists: true },
    }).lean();

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

    const hasOptions = Array.isArray(question.options) && question.options.length > 0;
    if (hasOptions) {
      const selectedIndex = Number(answerGiven);
      if (Number.isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= question.options.length) {
        return res.status(400).json({
          success: false,
          message: "Invalid answer format - expected valid option index",
        });
      }
    } else {
      if (
        answerGiven !== "left" &&
        answerGiven !== "right" &&
        answerGiven !== "Phishing" &&
        answerGiven !== "Safe"
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid answer format",
        });
      }
    }

    const isCorrect = isValidSubmittedAnswer(question, answerGiven);

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

    applyMasteryResult(user, "phishing", {
      answered: 1,
      correct: isCorrect ? 1 : 0,
    });
    applyXpReward(user, isCorrect ? 8 : 3);

    user.markModified("mastery"); // tell Mongoose the nested mastery object changed
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
 * Body: { answers }
 * - Called once when the user finishes the game
 * - Updates phishingStats.totalGames, bestScore, lastScore, lastCompletedAt
 * - Awards a completion bonus in coins
 */
router.post("/complete", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { answers = [] } = req.body || {};
    const normalizedAnswers = Array.isArray(answers) ? answers : [];
    const questionIds = [
      ...new Set(
        normalizedAnswers.map((entry) => String(entry?.questionId || "")).filter(Boolean)
      ),
    ];
    const questions = await PhishingQuestion.find({ _id: { $in: questionIds } }).lean();
    const questionMap = new Map(questions.map((question) => [String(question._id), question]));

    let correctAnswers = 0;
    for (const entry of normalizedAnswers) {
      const question = questionMap.get(String(entry?.questionId || ""));
      if (!question) continue;

      if (isValidSubmittedAnswer(question, entry?.answerGiven)) {
        correctAnswers += 1;
      }
    }

    const numericScore = correctAnswers * 10;

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
    const xpReward = numericScore >= 50 ? 25 : 15;
    const xpInfo = applyXpReward(user, xpReward);

    await user.save();

    return res.json({
      success: true,
      verifiedCorrectAnswers: correctAnswers,
      completionBonus,
      xpAwarded: xpReward,
      level: xpInfo.level,
      totalXp: user.xp,
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
