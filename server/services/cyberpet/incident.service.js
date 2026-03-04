import passwordIncidents from "../../data/passwordIncidents.js";
import { calculateRisk, clamp, getRiskLevel } from "./risk.service.js";
import { ensurePetStatusDefaults } from "./pet-state.service.js";

const INCIDENT_TRIGGER_CAP = 0.85;

export function resolveIncidentSeverity(riskScore, severityRules = {}) {
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

export function calculateIncidentProbability(incident, posture = {}, riskScore = 0) {
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

export function rollIncident(riskState = {}, posture = {}, incidentDeck = passwordIncidents) {
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

export function findIncidentDefinition(type) {
  return passwordIncidents.find((incident) => incident.id === type) || null;
}

export function applyIncidentResponse(petDoc, responseId) {
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
