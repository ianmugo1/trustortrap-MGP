export function updateAverageRisk(stats, riskScore) {
  const currentAvg = Number(stats.avgRiskScore) || 0;
  const currentSamples = Number(stats.riskSamples) || 0;
  const nextSamples = currentSamples + 1;
  const nextAvg = Math.round(
    (currentAvg * currentSamples + (Number(riskScore) || 0)) / nextSamples
  );

  stats.riskSamples = nextSamples;
  stats.avgRiskScore = nextAvg;
}

export function syncAdoptionDates(stats, posture, now = new Date()) {
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
