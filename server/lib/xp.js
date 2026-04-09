const LEVEL_STEPS = [0, 100, 225, 375, 550, 750, 975, 1225, 1500, 1800];

function getThresholdForLevel(level) {
  if (level <= LEVEL_STEPS.length) {
    return LEVEL_STEPS[level - 1];
  }

  const lastThreshold = LEVEL_STEPS[LEVEL_STEPS.length - 1];
  const extraLevels = level - LEVEL_STEPS.length;
  return lastThreshold + extraLevels * 350;
}

export function getLevelFromXp(xp = 0) {
  const value = Math.max(0, Number(xp) || 0);
  let level = 1;

  while (value >= getThresholdForLevel(level + 1)) {
    level += 1;
  }

  return level;
}

export function getXpProgress(xp = 0) {
  const value = Math.max(0, Number(xp) || 0);
  const level = getLevelFromXp(value);
  const currentLevelXp = getThresholdForLevel(level);
  const nextLevelXp = getThresholdForLevel(level + 1);
  const progressWithinLevel = value - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;

  return {
    xp: value,
    level,
    currentLevelXp,
    nextLevelXp,
    progressWithinLevel,
    xpNeeded,
    xpToNextLevel: Math.max(0, nextLevelXp - value),
    progressPercent: xpNeeded > 0 ? Math.round((progressWithinLevel / xpNeeded) * 100) : 100,
  };
}

export function applyXpReward(user, amount = 0) {
  if (!user) return { gained: 0, leveledUp: false, level: 1 };

  const gained = Math.max(0, Number(amount) || 0);
  const currentXp = Math.max(0, Number(user.xp) || 0);
  const beforeLevel = Math.max(1, Number(user.level) || getLevelFromXp(currentXp));
  const nextXp = currentXp + gained;
  const nextLevel = getLevelFromXp(nextXp);

  user.xp = nextXp;
  user.level = nextLevel;

  return {
    gained,
    leveledUp: nextLevel > beforeLevel,
    level: nextLevel,
    xp: nextXp,
  };
}
