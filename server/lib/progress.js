const MASTERY_TOPICS = ["phishing", "passwords", "privacy", "aiSafety", "socialScams"];

function getLevel(accuracy, answered) {
  if (answered < 3) return "new";
  if (accuracy < 60) return "building";
  if (accuracy < 85) return "steady";
  return "strong";
}

export function getDefaultMasteryTopic(topic = {}) {
  const answered = Number(topic.answered || 0);
  const correct = Number(topic.correct || 0);
  const accuracy =
    answered > 0 ? Math.round((correct / answered) * 100) : Number(topic.accuracy || 0);

  return {
    answered,
    correct,
    accuracy,
    level: topic.level || getLevel(accuracy, answered),
    lastPracticedAt: topic.lastPracticedAt || null,
  };
}

export function getDefaultMastery(mastery = {}) {
  return Object.fromEntries(
    MASTERY_TOPICS.map((key) => [key, getDefaultMasteryTopic(mastery?.[key])])
  );
}

export function applyMasteryResult(user, topicKey, { answered = 0, correct = 0, when = new Date() } = {}) {
  if (!user || !MASTERY_TOPICS.includes(topicKey)) return;

  user.mastery = user.mastery || {};
  const current = getDefaultMasteryTopic(user.mastery?.[topicKey]);
  const nextAnswered = current.answered + Math.max(0, Number(answered) || 0);
  const nextCorrect = current.correct + Math.max(0, Number(correct) || 0);
  const nextAccuracy = nextAnswered > 0 ? Math.round((nextCorrect / nextAnswered) * 100) : 0;

  user.mastery[topicKey] = {
    answered: nextAnswered,
    correct: nextCorrect,
    accuracy: nextAccuracy,
    level: getLevel(nextAccuracy, nextAnswered),
    lastPracticedAt: when,
  };
}

export function getDefaultStoryProgress(storyProgress = {}) {
  const completedSlugs = Array.isArray(storyProgress.completedSlugs)
    ? [...new Set(storyProgress.completedSlugs.filter(Boolean))]
    : [];

  const chapters = Array.isArray(storyProgress.chapters)
    ? storyProgress.chapters.map((chapter) => ({
        slug: chapter.slug,
        completedAt: chapter.completedAt || null,
        relatedTopic: chapter.relatedTopic || "",
      }))
    : [];

  return {
    completedSlugs,
    completedCount: Number(storyProgress.completedCount || completedSlugs.length || 0),
    lastCompletedSlug: storyProgress.lastCompletedSlug || "",
    lastCompletedAt: storyProgress.lastCompletedAt || null,
    chapters,
  };
}

export function markStoryComplete(user, { slug, relatedTopic = "", when = new Date() } = {}) {
  if (!user || !slug) return false;

  user.storyProgress = getDefaultStoryProgress(user.storyProgress);
  const alreadyCompleted = user.storyProgress.completedSlugs.includes(slug);

  if (alreadyCompleted) {
    user.storyProgress.lastCompletedSlug = slug;
    user.storyProgress.lastCompletedAt = when;
    return false;
  }

  user.storyProgress.completedSlugs.push(slug);
  user.storyProgress.completedCount = user.storyProgress.completedSlugs.length;
  user.storyProgress.lastCompletedSlug = slug;
  user.storyProgress.lastCompletedAt = when;
  user.storyProgress.chapters.push({
    slug,
    completedAt: when,
    relatedTopic,
  });

  return true;
}
