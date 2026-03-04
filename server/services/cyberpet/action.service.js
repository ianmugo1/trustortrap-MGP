import { calculateRisk, clamp } from "./risk.service.js";
import { ensurePetStatusDefaults } from "./pet-state.service.js";

export const ACTIONS_PER_DAY_DEFAULT = 3;
export const ALLOWED_ACTIONS = new Set([
  "changePassword",
  "enable2FA",
  "turnOnMonitoring",
  "lockDownSessions",
]);

export function applyAction(petDoc, actionType, payload = {}) {
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
