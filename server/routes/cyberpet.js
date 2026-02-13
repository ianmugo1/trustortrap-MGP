import express from "express";
import authMiddleware from "../middleware/auth.js";
import CyberPet from "../models/CyberPet.js";
import CyberPetQuestion from "../models/CyberPetQuestion.js";
import cyberPetQuestions from "../data/cyberPetQuestions.js";

const router = express.Router();
const DAILY_QUESTION_COUNT = 5;

function clamp(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

async function ensureQuestionBank() {
  const count = await CyberPetQuestion.countDocuments();

  if (count === 0) {
    await CyberPetQuestion.insertMany(cyberPetQuestions);
  }
}

async function getOrCreatePet(userId) {
  let pet = await CyberPet.findOne({ userId });

  if (!pet) {
    pet = await CyberPet.create({ userId });
  }

  return pet;
}

async function ensureDailyQuestions(pet) {
  const todayKey = getDateKey();

  const hasValidDailySet =
    Array.isArray(pet.dailyQuestions) &&
    pet.dailyQuestions.length === DAILY_QUESTION_COUNT;

  if (pet.dailyProgress?.dateKey === todayKey && hasValidDailySet) {
    return pet;
  }

  await ensureQuestionBank();

  const questions = await CyberPetQuestion.aggregate([
    { $sample: { size: DAILY_QUESTION_COUNT } },
  ]);

  if (questions.length < DAILY_QUESTION_COUNT) {
    throw new Error("Not enough cyber pet questions configured");
  }

  pet.dailyQuestions = questions.map((q) => ({
    questionId: String(q._id),
    text: q.text,
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation,
    userAnswerIndex: null,
    isCorrect: null,
  }));

  pet.dailyProgress = {
    dateKey: todayKey,
    answeredCount: 0,
    correctCount: 0,
  };

  pet.lastDailyReset = new Date();
  pet.lastUpdated = new Date();

  await pet.save();

  return pet;
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const pet = await getOrCreatePet(req.user.id);
    await ensureDailyQuestions(pet);

    return res.json({
      success: true,
      pet,
    });
  } catch (err) {
    console.error("Get cyber pet error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/answer", authMiddleware, async (req, res) => {
  try {
    const { questionIndex, answerIndex } = req.body || {};

    const qIndex = Number(questionIndex);
    const aIndex = Number(answerIndex);

    if (!Number.isInteger(qIndex) || qIndex < 0 || qIndex >= DAILY_QUESTION_COUNT) {
      return res.status(400).json({ success: false, message: "Invalid questionIndex" });
    }

    if (!Number.isInteger(aIndex) || aIndex < 0 || aIndex > 3) {
      return res.status(400).json({ success: false, message: "Invalid answerIndex" });
    }

    const pet = await getOrCreatePet(req.user.id);
    await ensureDailyQuestions(pet);

    const question = pet.dailyQuestions[qIndex];

    if (!question) {
      return res.status(400).json({ success: false, message: "Question not found" });
    }

    if (question.userAnswerIndex !== null && question.userAnswerIndex !== undefined) {
      return res.status(400).json({ success: false, message: "Question already answered" });
    }

    const isCorrect = aIndex === question.correctIndex;

    question.userAnswerIndex = aIndex;
    question.isCorrect = isCorrect;

    const answeredCount = pet.dailyQuestions.filter(
      (item) => item.userAnswerIndex !== null && item.userAnswerIndex !== undefined
    ).length;
    const correctCount = pet.dailyQuestions.filter((item) => item.isCorrect === true).length;

    pet.dailyProgress.answeredCount = answeredCount;
    pet.dailyProgress.correctCount = correctCount;

    pet.health = isCorrect ? clamp(pet.health + 5) : clamp(pet.health - 7);
    pet.lastUpdated = new Date();

    await pet.save();

    return res.json({
      success: true,
      pet,
      result: {
        isCorrect,
        explanation: question.explanation,
      },
    });
  } catch (err) {
    console.error("Answer cyber pet question error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/update", authMiddleware, async (req, res) => {
  try {
    const { health, happiness } = req.body || {};

    const pet = await getOrCreatePet(req.user.id);

    if (health !== undefined) {
      pet.health = clamp(health);
    }

    if (happiness !== undefined) {
      pet.happiness = clamp(happiness);
    }

    pet.lastUpdated = new Date();
    await pet.save();

    return res.json({
      success: true,
      pet,
    });
  } catch (err) {
    console.error("Update cyber pet error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
