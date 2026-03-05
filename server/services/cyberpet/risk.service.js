export function clamp(value) {
  return Math.max(0, Math.min(100, Number(value) || 0));
}

export function getRiskLevel(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function calculateRisk(posture = {}) {
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
