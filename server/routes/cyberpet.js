import express from "express";
import authMiddleware from "../middleware/auth.js";
import CyberPet from "../models/CyberPet.js";
import CyberPetQuestion from "../models/CyberPetQuestion.js";
import cyberPetQuestions from "../data/cyberPetQuestions.js";
import passwordIncidents from "../data/passwordIncidents.js";

const router = express.Router();
const DAILY_QUESTION_COUNT = 5;
const INCIDENT_TRIGGER_CAP = 0.85;

function clamp(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

function getRiskLevel(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function calculateRisk(posture = {}) {
  const strengthScore = clamp(posture.strengthScore ?? 45);
  const reusedPassword = Boolean(posture.reusedPassword);
  const twoFactorEnabled = Boolean(posture.twoFactorEnabled);
  const breachMonitoringEnabled = Boolean(posture.breachMonitoringEnabled);

  let score = 25;
  score += Math.round((100 - strengthScore) * 0.45);
  if (reusedPassword) score += 20;
  if (!twoFactorEnabled) score += 20;
  if (!breachMonitoringEnabled) score += 10;

  const normalizedScore = clamp(score);
  return {
    score: normalizedScore,
    level: getRiskLevel(normalizedScore),
  };
}

function resolveIncidentSeverity(riskScore, severityRules = {}) {
  const score = clamp(riskScore);
  const levels = ["low", "medium", "high"];

  for (const level of levels) {
    const maxRisk = Number(severityRules?.[level]?.maxRisk);
    if (Number.isFinite(maxRisk) && score <= maxRisk) {
      return level;
    }
  }

  return "high";
}

function calculateIncidentProbability(incident, posture = {}, riskScore = 0) {
  const modifiers = incident?.postureModifiers || {};
  const strengthScore = clamp(posture.strengthScore ?? 45);
  const reusedPassword = Boolean(posture.reusedPassword);
  const twoFactorEnabled = Boolean(posture.twoFactorEnabled);
  const breachMonitoringEnabled = Boolean(posture.breachMonitoringEnabled);

  let probability = Number(incident?.baseProbability) || 0;

  if (reusedPassword && Number.isFinite(modifiers.reusedPassword)) {
    probability += modifiers.reusedPassword;
  }

  if (
    Number.isFinite(modifiers.weakStrengthThreshold) &&
    Number.isFinite(modifiers.weakStrengthPenalty) &&
    strengthScore < modifiers.weakStrengthThreshold
  ) {
    probability += modifiers.weakStrengthPenalty;
  }

  if (twoFactorEnabled && Number.isFinite(modifiers.twoFactorEnabled)) {
    probability += modifiers.twoFactorEnabled;
  }

  if (
    breachMonitoringEnabled &&
    Number.isFinite(modifiers.breachMonitoringEnabled)
  ) {
    probability += modifiers.breachMonitoringEnabled;
  }

  if (
    !breachMonitoringEnabled &&
    Number.isFinite(modifiers.monitoringOffDelayedPenalty)
  ) {
    probability += modifiers.monitoringOffDelayedPenalty;
  }

  if (
    Number.isFinite(modifiers.highRiskThreshold) &&
    Number.isFinite(modifiers.highRiskPenalty) &&
    riskScore >= modifiers.highRiskThreshold
  ) {
    probability += modifiers.highRiskPenalty;
  }

  return Math.max(0, Math.min(INCIDENT_TRIGGER_CAP, probability));
}

function rollIncident(riskState = {}, posture = {}, incidentDeck = passwordIncidents) {
  const incidents = Array.isArray(incidentDeck) ? incidentDeck : [];
  if (!incidents.length) return null;

  const riskScore = clamp(riskState.score ?? 0);

  const weightedCandidates = incidents
    .map((incident) => {
      const probability = calculateIncidentProbability(incident, posture, riskScore);
      return { incident, probability };
    })
    .filter((entry) => entry.probability > 0);

  if (!weightedCandidates.length) return null;

  const roll = Math.random();
  let running = 0;

  for (const entry of weightedCandidates) {
    running += entry.probability;
    if (roll <= running) {
      const severity = resolveIncidentSeverity(
        riskScore,
        entry.incident?.severityRules
      );

      return {
        type: entry.incident.id,
        label: entry.incident.label,
        severity,
        status: "active",
        createdAt: new Date(),
      };
    }
  }

  return null;
}

function applyDailyDecay(petDoc) {
  if (!petDoc) return petDoc;

  if (petDoc.pet && typeof petDoc.pet === "object") {
    petDoc.pet.energy = clamp((petDoc.pet.energy ?? 70) - 10);
    petDoc.pet.mood = clamp((petDoc.pet.mood ?? 70) - 6);
    petDoc.pet.health = clamp((petDoc.pet.health ?? 75) - 4);
  } else {
    petDoc.health = clamp((petDoc.health ?? 75) - 4);
    petDoc.happiness = clamp((petDoc.happiness ?? 70) - 6);
  }

  return petDoc;
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
