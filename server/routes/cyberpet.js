import express from "express";
import authMiddleware from "../middleware/auth.js";
import { getDateKey } from "../services/cyberpet/daily.service.js";
import {
  applyMiniGameReward,
  ensureMiniGamesState,
  getMiniGameConfig,
  isValidMiniGameType,
  pickDailyMiniGameQuestions,
} from "../services/cyberpet/minigame.service.js";
import {
  getOrCreatePet,
  getUserWithCyberPetStats,
} from "../services/cyberpet/pet.repository.js";
import { applyDailyDecay } from "../services/cyberpet/pet-state.service.js";
import { calculateRisk, clamp } from "../services/cyberpet/risk.service.js";
import {
  syncAdoptionDates,
  updateAverageRisk,
} from "../services/cyberpet/stats.service.js";
import { applyMasteryResult } from "../lib/progress.js";
import { applyXpReward } from "../lib/xp.js";

const router = express.Router();

function getMiniGameTopic(type) {
  if (type === "passwordStrengthener") return "passwords";
  if (type === "fillBlanks") return "privacy";
  return "socialScams";
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const pet = await getOrCreatePet(req.user.id);

    return res.json({
      success: true,
      pet,
    });
  } catch (err) {
    console.error("Get cyber pet error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/tick", authMiddleware, async (req, res) => {
  try {
    const pet = await getOrCreatePet(req.user.id);
    const now = new Date();
    const todayKey = getDateKey(now);
    const yesterdayKey = getDateKey(new Date(now - 86400000));

    if (pet.daily?.dateKey === todayKey && pet.daily?.tickApplied) {
      return res.json({
        success: true,
        alreadyApplied: true,
        pet,
      });
    }

    if (!pet.daily || pet.daily.dateKey !== todayKey) {
      pet.daily = {
        dateKey: todayKey,
        actionsUsed: 0,
        maxActions: pet.daily?.maxActions || 3,
        tickApplied: false,
      };
    } else {
      pet.daily.actionsUsed = pet.daily.actionsUsed || 0;
      pet.daily.maxActions = pet.daily.maxActions || 3;
    }

    applyDailyDecay(pet);

    pet.risk = calculateRisk(pet.posture || {});

    const lastCheckIn = pet.streak?.lastCheckInDateKey || "";
    if (lastCheckIn !== todayKey) {
      if (lastCheckIn === yesterdayKey) {
        pet.streak.current = (pet.streak?.current || 0) + 1;
      } else {
        pet.streak.current = 1;
      }
    }

    pet.streak.best = Math.max(pet.streak?.best || 0, pet.streak?.current || 0);
    pet.streak.lastCheckInDateKey = todayKey;

    pet.daily.tickApplied = true;
    pet.lastUpdated = now;

    await pet.save();

    const user = await getUserWithCyberPetStats(req.user.id);
    if (user) {
      applyXpReward(user, 10);
      const stats = user.cyberPetStats;
      updateAverageRisk(stats, pet.risk?.score || 0);
      syncAdoptionDates(stats, pet.posture, now);
      await user.save();
    }

    return res.json({
      success: true,
      alreadyApplied: false,
      pet,
    });
  } catch (err) {
    console.error("Tick cyber pet error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/minigame/:type", authMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    if (!isValidMiniGameType(type)) {
      return res.status(400).json({ success: false, message: "Invalid mini-game type" });
    }

    const config = getMiniGameConfig(type);
    if (!config || !Array.isArray(config.questions) || !config.questions.length) {
      return res.status(501).json({
        success: false,
        message: `${type} is not implemented yet`,
      });
    }

    const pet = await getOrCreatePet(req.user.id);
    const todayKey = getDateKey();
    ensureMiniGamesState(pet);

    const state = pet.miniGames[type];

    if (state.dateKey !== todayKey) {
      const questionIds = pickDailyMiniGameQuestions(type, String(req.user.id), todayKey);
      state.dateKey = todayKey;
      state.dailyQuestionIds = questionIds;
      state.answeredIds = [];
      state.correctIds = [];
      state.lastPlayedAt = null;
      pet.markModified("miniGames");
      await pet.save();
    }

    const allQuestions = config.questions || [];
    const dailyQuestions = state.dailyQuestionIds.map((qId) => {
      const q = allQuestions.find((item) => item.id === qId);
      if (!q) return null;

      const base = { id: q.id, prompt: q.prompt };

      if (type === "fillBlanks" && Array.isArray(q.options)) {
        base.options = q.options;
      }

      return base;
    }).filter(Boolean);

    return res.json({
      success: true,
      miniGame: {
        type,
        label: config.label,
        totalCount: dailyQuestions.length,
        answeredCount: state.answeredIds.length,
        correctCount: state.correctIds.length,
        answeredIds: state.answeredIds,
      },
      questions: dailyQuestions,
    });
  } catch (err) {
    console.error("Get cyber pet mini-game error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/minigame/:type/submit", authMiddleware, async (req, res) => {
  try {
    const { type } = req.params;
    if (!isValidMiniGameType(type)) {
      return res.status(400).json({ success: false, message: "Invalid mini-game type" });
    }

    const config = getMiniGameConfig(type);
    if (!config || !Array.isArray(config.questions) || !config.questions.length) {
      return res.status(501).json({
        success: false,
        message: `${type} is not implemented yet`,
      });
    }

    const { questionId, answer: userAnswer } = req.body || {};

    if (!questionId || typeof questionId !== "string") {
      return res.status(400).json({ success: false, message: "questionId is required" });
    }

    const pet = await getOrCreatePet(req.user.id);
    const todayKey = getDateKey();
    ensureMiniGamesState(pet);
    const state = pet.miniGames[type];

    if (state.dateKey !== todayKey || !state.dailyQuestionIds.length) {
      const questionIds = pickDailyMiniGameQuestions(type, String(req.user.id), todayKey);
      state.dateKey = todayKey;
      state.dailyQuestionIds = questionIds;
      state.answeredIds = [];
      state.correctIds = [];
      state.lastPlayedAt = null;
    }

    if (!state.dailyQuestionIds.includes(questionId)) {
      return res.status(400).json({ success: false, message: "Question not in today's set" });
    }

    if (state.answeredIds.includes(questionId)) {
      return res.status(400).json({ success: false, message: "Question already answered" });
    }

    const question = (config.questions || []).find((q) => q.id === questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    if (type === "trueFalse") {
      if (typeof userAnswer !== "boolean") {
        return res.status(400).json({ success: false, message: "answer must be boolean for trueFalse" });
      }
    } else if (type === "passwordStrengthener") {
      if (!Number.isInteger(userAnswer) || userAnswer < 0 || userAnswer > 2) {
        return res.status(400).json({ success: false, message: "answer must be 0 (Weak), 1 (OK), or 2 (Strong)" });
      }
    } else if (type === "fillBlanks") {
      const maxIndex = Array.isArray(question.options) ? question.options.length - 1 : 0;
      if (!Number.isInteger(userAnswer) || userAnswer < 0 || userAnswer > maxIndex) {
        return res.status(400).json({ success: false, message: "answer must be a valid option index" });
      }
    }

    const isCorrect = userAnswer === question.answer;
    const reward = isCorrect ? config.reward?.correct : config.reward?.incorrect;

    applyMiniGameReward(pet, reward || {});

    state.answeredIds.push(questionId);
    if (isCorrect) {
      state.correctIds.push(questionId);
    }
    state.lastPlayedAt = new Date();
    pet.lastUpdated = new Date();

    pet.markModified("miniGames");
    await pet.save();

    const user = await getUserWithCyberPetStats(req.user.id);
    if (user) {
      applyMasteryResult(user, getMiniGameTopic(type), {
        answered: 1,
        correct: isCorrect ? 1 : 0,
      });
      applyXpReward(user, isCorrect ? 6 : 2);

      const stats = user.cyberPetStats;
      updateAverageRisk(stats, pet.risk?.score || 0);
      syncAdoptionDates(stats, pet.posture, new Date());
      await user.save();
    }

    return res.json({
      success: true,
      result: {
        isCorrect,
        explanation: question.explanation || "",
      },
      miniGame: {
        type,
        totalCount: state.dailyQuestionIds.length,
        answeredCount: state.answeredIds.length,
        correctCount: state.correctIds.length,
        answeredIds: state.answeredIds,
      },
      pet,
    });
  } catch (err) {
    console.error("Submit cyber pet mini-game error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/name", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body || {};

    if (!name || typeof name !== "string") {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const trimmed = name.trim();
    if (trimmed.length === 0 || trimmed.length > 20) {
      return res.status(400).json({ success: false, message: "Name must be 1-20 characters" });
    }

    const pet = await getOrCreatePet(req.user.id);
    pet.name = trimmed;
    pet.lastUpdated = new Date();
    await pet.save();

    return res.json({ success: true, pet });
  } catch (err) {
    console.error("Rename cyber pet error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
