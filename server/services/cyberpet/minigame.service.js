import cyberPetMiniGames from "../../data/cyberPetMiniGames.js";
import { calculateRisk, clamp, getRiskLevel } from "./risk.service.js";
import { ensurePetStatusDefaults } from "./pet-state.service.js";

export function isValidMiniGameType(type) {
  return Object.prototype.hasOwnProperty.call(cyberPetMiniGames, type);
}

export function getMiniGameConfig(type) {
  if (!isValidMiniGameType(type)) return null;
  return cyberPetMiniGames[type];
}

export function ensureMiniGamesState(petDoc) {
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

export function pickDailyMiniGameQuestions(type, userId, dateKey) {
  const config = getMiniGameConfig(type);
  if (!config) return [];

  const questions = Array.isArray(config.questions) ? config.questions : [];
  if (!questions.length) return [];

  const count = config.dailyCount || 7;

  const seed = `${userId}:${type}:${dateKey}`;
  const indices = questions.map((_, i) => i);

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

export function applyMiniGameReward(petDoc, reward = {}) {
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
