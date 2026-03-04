import { clamp } from "./risk.service.js";

export function applyDailyDecay(petDoc) {
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

export function ensurePetStatusDefaults(petDoc) {
  if (!petDoc.pet || typeof petDoc.pet !== "object") {
    petDoc.pet = { mood: 70, health: 75, energy: 70 };
  }

  petDoc.pet.mood = clamp(petDoc.pet.mood ?? 70);
  petDoc.pet.health = clamp(petDoc.pet.health ?? 75);
  petDoc.pet.energy = clamp(petDoc.pet.energy ?? 70);
}
