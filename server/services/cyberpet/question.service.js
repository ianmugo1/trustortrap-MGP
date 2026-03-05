import CyberPetQuestion from "../../models/CyberPetQuestion.js";
import cyberPetQuestions from "../../data/cyberPetQuestions.js";
import { getDateKey } from "./daily.service.js";

export const DAILY_QUESTION_COUNT = 5;

export async function ensureQuestionBank() {
  const count = await CyberPetQuestion.countDocuments();

  if (count === 0) {
    await CyberPetQuestion.insertMany(cyberPetQuestions);
  }
}

export async function ensureDailyQuestions(pet) {
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
