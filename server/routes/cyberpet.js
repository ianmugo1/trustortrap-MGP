import express from "express";
import authMiddleware from "../middleware/auth.js";
import CyberPet from "../models/CyberPet.js";
import CyberPetQuestion from "../models/CyberPetQuestion.js";
import User from "../models/User.js";
import cyberPetQuestions from "../data/cyberPetQuestions.js";
import passwordIncidents from "../data/passwordIncidents.js";
import cyberPetMiniGames from "../data/cyberPetMiniGames.js";

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

function isValidMiniGameType(type) {
  return Object.prototype.hasOwnProperty.call(cyberPetMiniGames, type);
}

function getMiniGameConfig(type) {
  if (!isValidMiniGameType(type)) return null;
  return cyberPetMiniGames[type];
}

function hashStringToIndex(seed, length) {
  if (!length) return 0;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % length;
}

function ensureMiniGamesState(petDoc) {
  if (!petDoc.miniGames || typeof petDoc.miniGames !== "object") {
    petDoc.miniGames = {};
  }

  const types = ["trueFalse", "passwordStrengthener", "fillBlanks"];
  for (const type of types) {
    if (!petDoc.miniGames[type] || typeof petDoc.miniGames[type] !== "object") {
      petDoc.miniGames[type] = {};
    }

    const state = petDoc.miniGames[type];
    if (typeof state.dateKey !== "string") state.dateKey = "";
    if (!Array.isArray(state.dailyQuestionIds)) state.dailyQuestionIds = [];
    if (!Array.isArray(state.answeredIds)) state.answeredIds = [];
    if (!Array.isArray(state.correctIds)) state.correctIds = [];
    if (!state.lastPlayedAt) state.lastPlayedAt = null;
  }
}

// Pick N random questions for today using a seeded shuffle
function pickDailyMiniGameQuestions(type, userId, dateKey) {
  const config = getMiniGameConfig(type);
  if (!config) return [];

  const questions = Array.isArray(config.questions) ? config.questions : [];
  if (!questions.length) return [];

  const count = config.dailyCount || 7;

  // Seeded shuffle so the same user gets the same set each day
  const seed = `${userId}:${type}:${dateKey}`;
  const indices = questions.map((_, i) => i);

  // Fisher-Yates shuffle with seeded hash
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }

  for (let i = indices.length - 1; i > 0; i -= 1) {
    hash = (hash * 1103515245 + 12345) >>> 0;
    const j = hash % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices.slice(0, Math.min(count, questions.length)).map((i) => questions[i].id);
}

function applyMiniGameReward(petDoc, reward = {}) {
  ensurePetStatusDefaults(petDoc);

  const baseline = calculateRisk(petDoc.posture || {});
  const nextRiskScore = clamp((baseline.score ?? 0) + Number(reward.riskDelta || 0));

  petDoc.risk = {
    score: nextRiskScore,
    level: getRiskLevel(nextRiskScore),
  };

  petDoc.pet.mood = clamp((petDoc.pet.mood ?? 70) + Number(reward.moodDelta || 0));
  petDoc.pet.health = clamp(
    (petDoc.pet.health ?? 75) + Number(reward.healthDelta || 0)
  );
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

    // Pick fresh daily questions if it's a new day
    if (state.dateKey !== todayKey) {
      const questionIds = pickDailyMiniGameQuestions(type, String(req.user.id), todayKey);
      state.dateKey = todayKey;
      state.dailyQuestionIds = questionIds;
      state.answeredIds = [];
      state.correctIds = [];
      state.lastPlayedAt = null;
      // Tell Mongoose nested subdoc changed
      pet.markModified("miniGames");
      await pet.save();
    }

    // Build the list of questions to send to the frontend
    // Include prompt + options (for fillBlanks) but not the answer
    const allQuestions = config.questions || [];
    const dailyQuestions = state.dailyQuestionIds.map((qId) => {
      const q = allQuestions.find((item) => item.id === qId);
      if (!q) return null;

      const base = { id: q.id, prompt: q.prompt };

      // Include options for fillBlanks
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

    // Reset if it's a new day
    if (state.dateKey !== todayKey || !state.dailyQuestionIds.length) {
      const questionIds = pickDailyMiniGameQuestions(type, String(req.user.id), todayKey);
      state.dateKey = todayKey;
      state.dailyQuestionIds = questionIds;
      state.answeredIds = [];
      state.correctIds = [];
      state.lastPlayedAt = null;
    }

    // Check the question is part of today's set
    if (!state.dailyQuestionIds.includes(questionId)) {
      return res.status(400).json({ success: false, message: "Question not in today's set" });
    }

    // Check it hasn't been answered already
    if (state.answeredIds.includes(questionId)) {
      return res.status(400).json({ success: false, message: "Question already answered" });
    }

    const question = (config.questions || []).find((q) => q.id === questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    // Validate answer format per game type
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

    // Track this answer
    state.answeredIds.push(questionId);
    if (isCorrect) {
      state.correctIds.push(questionId);
    }
    state.lastPlayedAt = new Date();
    pet.lastUpdated = new Date();

    // Tell Mongoose nested subdoc changed
    pet.markModified("miniGames");
    await pet.save();

    const user = await getUserWithCyberPetStats(req.user.id);
    if (user) {
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

// Rename the pet
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
