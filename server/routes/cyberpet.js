import express from "express";
import authMiddleware from "../middleware/auth.js";
import CyberPet from "../models/CyberPet.js";
import CyberPetQuestion from "../models/CyberPetQuestion.js";
import User from "../models/User.js";
import cyberPetQuestions from "../data/cyberPetQuestions.js";
import passwordIncidents from "../data/passwordIncidents.js";

const router = express.Router();
const DAILY_QUESTION_COUNT = 5;
const INCIDENT_TRIGGER_CAP = 0.85;
const ACTIONS_PER_DAY_DEFAULT = 3;
const ALLOWED_ACTIONS = new Set([
  "changePassword",
  "enable2FA",
  "turnOnMonitoring",
  "lockDownSessions",
]);

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

function ensurePetStatusDefaults(petDoc) {
  if (!petDoc.pet || typeof petDoc.pet !== "object") {
    petDoc.pet = { mood: 70, health: 75, energy: 70 };
  }

  petDoc.pet.mood = clamp(petDoc.pet.mood ?? 70);
  petDoc.pet.health = clamp(petDoc.pet.health ?? 75);
  petDoc.pet.energy = clamp(petDoc.pet.energy ?? 70);
}

function applyAction(petDoc, actionType, payload = {}) {
  ensurePetStatusDefaults(petDoc);

  const posture = petDoc.posture || {};
  const result = { actionType, notes: [] };

  switch (actionType) {
    case "changePassword": {
      const requestedStrength = Number(payload.strengthScore);
      const fallbackStrength = clamp((posture.strengthScore ?? 45) + 20);
      posture.strengthScore = Number.isFinite(requestedStrength)
        ? clamp(requestedStrength)
        : fallbackStrength;
      posture.reusedPassword = false;
      petDoc.pet.energy = clamp(petDoc.pet.energy - 15);
      petDoc.pet.mood = clamp(petDoc.pet.mood + 4);
      result.notes.push("Password updated and reuse removed.");
      break;
    }
    case "enable2FA": {
      posture.twoFactorEnabled = true;
      petDoc.pet.energy = clamp(petDoc.pet.energy - 8);
      petDoc.pet.health = clamp(petDoc.pet.health + 3);
      result.notes.push("2FA enabled for stronger login protection.");
      break;
    }
    case "turnOnMonitoring": {
      posture.breachMonitoringEnabled = true;
      petDoc.pet.energy = clamp(petDoc.pet.energy - 6);
      petDoc.pet.mood = clamp(petDoc.pet.mood + 2);
      result.notes.push("Breach monitoring enabled for earlier alerts.");
      break;
    }
    case "lockDownSessions": {
      petDoc.pet.energy = clamp(petDoc.pet.energy - 10);
      petDoc.pet.health = clamp(petDoc.pet.health + 2);
      result.notes.push("Suspicious sessions logged out.");
      break;
    }
    default:
      return null;
  }

  petDoc.posture = posture;
  petDoc.risk = calculateRisk(posture);

  return result;
}

function findIncidentDefinition(type) {
  return passwordIncidents.find((incident) => incident.id === type) || null;
}

function applyIncidentResponse(petDoc, responseId) {
  const activeIncident = petDoc.activeIncident || {};
  if (activeIncident.status !== "active" || !activeIncident.type) {
    return { ok: false, message: "No active incident to resolve" };
  }

  const incidentDef = findIncidentDefinition(activeIncident.type);
  if (!incidentDef) {
    return { ok: false, message: "Incident definition not found" };
  }

  const responseDef = (incidentDef.responses || []).find(
    (response) => response.id === responseId
  );
  if (!responseDef) {
    return { ok: false, message: "Invalid response option" };
  }

  ensurePetStatusDefaults(petDoc);
  const posture = petDoc.posture || {};
  const effects = responseDef.effects || {};

  petDoc.risk = {
    score: clamp((petDoc.risk?.score ?? 0) + Number(effects.riskDelta || 0)),
    level: getRiskLevel(clamp((petDoc.risk?.score ?? 0) + Number(effects.riskDelta || 0))),
  };

  petDoc.pet.mood = clamp((petDoc.pet.mood ?? 70) + Number(effects.moodDelta || 0));
  petDoc.pet.health = clamp(
    (petDoc.pet.health ?? 75) + Number(effects.healthDelta || 0)
  );
  petDoc.pet.energy = clamp(
    (petDoc.pet.energy ?? 70) - Number(responseDef.costs?.energy || 0)
  );

  const coinCost = Number(responseDef.costs?.coins || 0);

  const resolvedAt = new Date();
  const historyEntry = {
    type: activeIncident.type,
    severity: activeIncident.severity || "medium",
    outcome: responseDef.label,
    createdAt: activeIncident.createdAt || resolvedAt,
    resolvedAt,
  };

  petDoc.incidentHistory = Array.isArray(petDoc.incidentHistory)
    ? [...petDoc.incidentHistory, historyEntry]
    : [historyEntry];

  petDoc.activeIncident = {
    type: "",
    severity: "",
    status: "",
    createdAt: null,
  };

  // Recalculate final risk level from posture baseline + incident response delta.
  const baselineRisk = calculateRisk(posture);
  const adjustedScore = clamp(
    baselineRisk.score + Number(effects.riskDelta || 0)
  );
  petDoc.risk = {
    score: adjustedScore,
    level: getRiskLevel(adjustedScore),
  };

  return {
    ok: true,
    incidentType: incidentDef.id,
    responseId: responseDef.id,
    responseLabel: responseDef.label,
    coinCost,
  };
}

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function getYesterdayDateKey(date = new Date()) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() - 1);
  return getDateKey(d);
}

async function getUserWithCyberPetStats(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  if (!user.cyberPetStats) {
    user.cyberPetStats = {};
  }

  return user;
}

function updateAverageRisk(stats, riskScore) {
  const currentAvg = Number(stats.avgRiskScore) || 0;
  const currentSamples = Number(stats.riskSamples) || 0;
  const nextSamples = currentSamples + 1;
  const nextAvg = Math.round(
    (currentAvg * currentSamples + (Number(riskScore) || 0)) / nextSamples
  );

  stats.riskSamples = nextSamples;
  stats.avgRiskScore = nextAvg;
}

function syncAdoptionDates(stats, posture, now = new Date()) {
  if (posture?.twoFactorEnabled && !stats.twoFactorAdoptionDate) {
    stats.twoFactorAdoptionDate = now;
  }

  if (
    posture?.breachMonitoringEnabled &&
    !stats.breachMonitoringAdoptionDate
  ) {
    stats.breachMonitoringAdoptionDate = now;
  }
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

router.post("/tick", authMiddleware, async (req, res) => {
  try {
    const pet = await getOrCreatePet(req.user.id);
    const now = new Date();
    const todayKey = getDateKey(now);
    const yesterdayKey = getYesterdayDateKey(now);

    if (pet.daily?.dateKey === todayKey && pet.daily?.tickApplied) {
      return res.json({
        success: true,
        alreadyApplied: true,
        incidentTriggered: false,
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

    const riskState = calculateRisk(pet.posture || {});
    pet.risk = riskState;

    const hasActiveIncident = pet.activeIncident?.status === "active";
    let rolledIncident = null;

    if (!hasActiveIncident) {
      rolledIncident = rollIncident(riskState, pet.posture || {});
      if (rolledIncident) {
        pet.activeIncident = rolledIncident;
      }
    }

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
      const stats = user.cyberPetStats;
      if (rolledIncident) {
        stats.totalIncidents = (Number(stats.totalIncidents) || 0) + 1;
      }
      updateAverageRisk(stats, pet.risk?.score || 0);
      syncAdoptionDates(stats, pet.posture, now);
      await user.save();
    }

    return res.json({
      success: true,
      alreadyApplied: false,
      incidentTriggered: Boolean(rolledIncident),
      pet,
    });
  } catch (err) {
    console.error("Tick cyber pet error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/action", authMiddleware, async (req, res) => {
  try {
    const { actionType, payload } = req.body || {};
    if (!ALLOWED_ACTIONS.has(actionType)) {
      return res.status(400).json({ success: false, message: "Invalid actionType" });
    }

    const pet = await getOrCreatePet(req.user.id);
    const todayKey = getDateKey();

    if (pet.daily?.dateKey !== todayKey || !pet.daily?.tickApplied) {
      return res.status(409).json({
        success: false,
        message: "Daily tick required before taking actions",
      });
    }

    pet.daily.actionsUsed = Number(pet.daily.actionsUsed) || 0;
    pet.daily.maxActions = Number(pet.daily.maxActions) || ACTIONS_PER_DAY_DEFAULT;

    if (pet.daily.actionsUsed >= pet.daily.maxActions) {
      return res.status(400).json({
        success: false,
        message: "No actions left for today",
      });
    }

    const actionResult = applyAction(pet, actionType, payload || {});
    if (!actionResult) {
      return res.status(400).json({ success: false, message: "Failed to apply action" });
    }

    pet.daily.actionsUsed += 1;
    const now = new Date();
    pet.lastUpdated = now;

    await pet.save();

    const user = await getUserWithCyberPetStats(req.user.id);
    if (user) {
      const stats = user.cyberPetStats;
      updateAverageRisk(stats, pet.risk?.score || 0);
      syncAdoptionDates(stats, pet.posture, now);
      await user.save();
    }

    return res.json({
      success: true,
      actionResult,
      remainingActions: Math.max(0, pet.daily.maxActions - pet.daily.actionsUsed),
      pet,
    });
  } catch (err) {
    console.error("Action cyber pet error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/incident/respond", authMiddleware, async (req, res) => {
  try {
    const { responseId } = req.body || {};
    if (!responseId || typeof responseId !== "string") {
      return res.status(400).json({
        success: false,
        message: "responseId is required",
      });
    }

    const pet = await getOrCreatePet(req.user.id);
    const result = applyIncidentResponse(pet, responseId);
    if (!result.ok) {
      return res.status(400).json({ success: false, message: result.message });
    }

    const now = new Date();
    pet.lastUpdated = now;
    await pet.save();

    const user = await getUserWithCyberPetStats(req.user.id);
    if (user) {
      const stats = user.cyberPetStats;
      stats.resolvedIncidents = (Number(stats.resolvedIncidents) || 0) + 1;
      if (
        result.incidentType === "account_takeover" &&
        result.responseId !== "minimal_response"
      ) {
        stats.takeoversPrevented =
          (Number(stats.takeoversPrevented) || 0) + 1;
      }
      updateAverageRisk(stats, pet.risk?.score || 0);
      syncAdoptionDates(stats, pet.posture, now);
      await user.save();
    }

    return res.json({
      success: true,
      result,
      pet,
    });
  } catch (err) {
    console.error("Respond cyber pet incident error:", err);
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
