"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authFetch } from "@/lib/api";
import { getStoryChapterByTopic } from "@/lib/storyChapters";
import { getXpProgress } from "@/lib/xp";
import {
  ArrowRight,
  BarChart3,
  Coins,
  Dog,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

const DAILY_QUESTION_TARGET = 5;
const TOPIC_LABELS = {
  phishing: "Phishing",
  passwords: "Passwords",
  privacy: "Privacy",
  aiSafety: "AI Safety",
  socialScams: "Social Scams",
};

function StatCard({ label, value, note, Icon }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          <p className="mt-1 text-sm leading-6 text-slate-400">{note}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function getDashboardRecommendation({
  averageScore,
  phishingGames,
  socialGames,
  dailyQuestionsDone,
  pet,
  learningInterest,
}) {
  const activeIncident = pet?.activeIncident?.status === "active";
  const petHealth = Number(pet?.pet?.health ?? 0);
  const interest = String(learningInterest || "").toLowerCase();

  if (activeIncident) {
    return {
      eyebrow: "Urgent next step",
      title: "Resolve your cyber pet incident.",
      description:
        "Your cyber pet currently has an active security incident. Handle that first before starting another challenge.",
      primaryHref: "/games/cyberpet",
      primaryLabel: "Open Cyber Pet",
      secondaryHref: "/stories/passwords",
      secondaryLabel: "Review the password story",
      storySlug: "passwords",
    };
  }

  if (pet && dailyQuestionsDone < DAILY_QUESTION_TARGET) {
    return {
      eyebrow: "Today's focus",
      title: "Finish today's cyber pet check-in.",
      description:
        "Your daily cyber pet questions are the clearest live habit in the app right now. Finish them to keep momentum up.",
      primaryHref: "/games/cyberpet",
      primaryLabel: "Continue daily quiz",
      secondaryHref: "/stories/passwords",
      secondaryLabel: "Read the password story",
      storySlug: "passwords",
    };
  }

  if (phishingGames === 0 || averageScore < 80) {
    return {
      eyebrow: "Recommended next step",
      title: "Sharpen your phishing judgment.",
      description:
        phishingGames === 0
          ? "You do not have a phishing baseline yet. One short run will give the dashboard real signal."
          : "Your phishing accuracy is still below the current target. One more run is the quickest improvement.",
      primaryHref: "/games/phishing",
      primaryLabel: phishingGames === 0 ? "Start phishing challenge" : "Practice phishing",
      secondaryHref: "/stories/phishing",
      secondaryLabel: "Read the phishing story",
      storySlug: "phishing",
    };
  }

  if (socialGames === 0 || interest.includes("social")) {
    return {
      eyebrow: "Recommended next step",
      title: "Run the social scam challenge next.",
      description:
        socialGames === 0
          ? "The social challenge is not represented in your progress yet. Add one run so the dashboard covers more than phishing."
          : "Your learning interest points toward social safety, so that is the best next area to reinforce.",
      primaryHref: "/games/social",
      primaryLabel: "Open social challenge",
      secondaryHref: "/stories/social-ai",
      secondaryLabel: "Read the AI fraud story",
      storySlug: "social-ai",
    };
  }

  if (pet && petHealth < 70) {
    return {
      eyebrow: "Recommended next step",
      title: "Stabilize your cyber pet.",
      description:
        "Your pet health has dipped. A quick cyber pet session will keep the daily habit healthy while your other stats stay solid.",
      primaryHref: "/games/cyberpet",
      primaryLabel: "Check on Byte",
      secondaryHref: "/stories/passwords",
      secondaryLabel: "Review the password story",
      storySlug: "passwords",
    };
  }

  return {
    eyebrow: "Keep momentum",
    title: "Continue learning with a short story.",
    description:
      "Your current training stats are in a good place. A story chapter is the fastest way to keep learning without grinding another score.",
    primaryHref: "/stories",
    primaryLabel: "Browse stories",
    secondaryHref: "/games",
    secondaryLabel: "Open training",
    storySlug: "scam-mix",
  };
}

function getTopicEntries(mastery) {
  return Object.entries(mastery || {}).map(([key, value]) => ({
    key,
    label: TOPIC_LABELS[key] || key,
    accuracy: Number(value?.accuracy || 0),
    answered: Number(value?.answered || 0),
    level: value?.level || "new",
  }));
}

function getPracticePlan(topicKey) {
  if (topicKey === "phishing") {
    return {
      gameHref: "/games/phishing",
      gameLabel: "Practice phishing",
    };
  }

  if (topicKey === "passwords" || topicKey === "privacy") {
    return {
      gameHref: "/games/cyberpet",
      gameLabel: "Open cyber pet",
    };
  }

  if (topicKey === "aiSafety" || topicKey === "socialScams") {
    return {
      gameHref: "/games/social",
      gameLabel: "Open social challenge",
    };
  }

  return {
    gameHref: "/games",
    gameLabel: "Open training",
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, refreshUser } = useAuth();
  const [pet, setPet] = useState(null);
  const [petLoading, setPetLoading] = useState(true);
  const [petError, setPetError] = useState("");

  const loadPetSnapshot = useCallback(async () => {
    if (!token) {
      setPet(null);
      setPetLoading(false);
      return;
    }

    setPetLoading(true);
    setPetError("");

    try {
      const res = await authFetch("/api/cyberpet", {}, token);
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setPet(null);
        setPetError(data?.message || "Could not load live cyber pet status.");
        return;
      }

      setPet(data.pet || null);
    } catch {
      setPet(null);
      setPetError("Could not load live cyber pet status.");
    } finally {
      setPetLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    loadPetSnapshot();
  }, [loadPetSnapshot]);

  const displayName = user?.displayName || user?.email || "Explorer";
  const coins = Number(user?.coins ?? 0);
  const xp = Number(user?.xp ?? 0);
  const level = Number(user?.level ?? 1);
  const learningInterest = user?.learningInterest || "";
  const xpProgress = getXpProgress(xp);

  const phishingStats = user?.phishingStats ?? {};
  const socialStats = user?.socialStats ?? {};

  const phishingGames = Number(phishingStats.totalGames ?? 0);
  const totalAnswered = Number(phishingStats.totalQuestionsAnswered ?? 0);
  const totalCorrect = Number(phishingStats.totalCorrect ?? 0);
  const averageScore =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  const socialGames = Number(socialStats.totalGames ?? 0);
  const trainingRuns = phishingGames + socialGames;

  const petHealth = Number(pet?.pet?.health ?? 0);
  const petRiskScore = Number(pet?.risk?.score ?? 0);
  const petRiskLevel = pet?.risk?.level || "unknown";
  const dailyQuestionsDone = Number(pet?.dailyProgress?.answeredCount ?? 0);
  const dailyQuestionsCorrect = Number(pet?.dailyProgress?.correctCount ?? 0);
  const actionsUsed = Number(pet?.daily?.actionsUsed ?? 0);
  const maxActions = Number(pet?.daily?.maxActions ?? 3);
  const actionsLeft = Math.max(0, maxActions - actionsUsed);
  const currentStreak = Number(pet?.streak?.current ?? 0);
  const activeIncident = pet?.activeIncident?.status === "active";
  const mastery = user?.mastery || {};
  const storyProgress = user?.storyProgress || {};
  const topicEntries = getTopicEntries(mastery).filter((topic) => topic.answered > 0);
  const strongestTopic = [...topicEntries].sort((a, b) => b.accuracy - a.accuracy)[0] || null;
  const weakestTopic = [...topicEntries].sort((a, b) => a.accuracy - b.accuracy)[0] || null;
  const storiesCompleted = Number(storyProgress?.completedCount ?? 0);
  const weakestStory = weakestTopic ? getStoryChapterByTopic(weakestTopic.key) : null;
  const weakestPracticePlan = weakestTopic ? getPracticePlan(weakestTopic.key) : null;

  const recommendation = useMemo(
    () =>
      getDashboardRecommendation({
        averageScore,
        phishingGames,
        socialGames,
        dailyQuestionsDone,
        pet,
        learningInterest,
      }),
    [averageScore, dailyQuestionsDone, learningInterest, pet, phishingGames, socialGames]
  );

  const hasMeaningfulProgress =
    trainingRuns > 0 ||
    dailyQuestionsDone > 0 ||
    currentStreak > 0 ||
    Boolean(phishingStats.lastCompletedAt) ||
    Boolean(socialStats.lastCompletedAt);

  const isFirstRun =
    !hasMeaningfulProgress &&
    totalAnswered === 0 &&
    socialGames === 0 &&
    !activeIncident;

  const heroEyebrow = isFirstRun ? "New account" : recommendation.eyebrow;
  const heroTitle = isFirstRun
    ? "Build your first safety baseline."
    : recommendation.title;
  const heroDescription = isFirstRun
    ? "Start with one short challenge so the dashboard has real activity to work with. One completed run is enough to make the next recommendations more useful."
    : recommendation.description;

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-8 md:py-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/95">
        <div className="grid gap-5 p-6 lg:grid-cols-[1.3fr_0.7fr] lg:p-7">
          <div>
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-emerald-400/15 bg-slate-950 shadow-md shadow-emerald-500/10">
                <Image
                  src="/logo.png"
                  alt="TrustOrTrap Logo"
                  fill
                  className="object-contain p-2"
                  sizes="56px"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-300">
                  {heroEyebrow}
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
                  Welcome back, {displayName}.
                </h1>
              </div>
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-white">
              {heroTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              {heroDescription}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    isFirstRun ? "/games/phishing" : recommendation.primaryHref
                  )
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                {isFirstRun
                  ? "Start first challenge"
                  : recommendation.primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  router.push(isFirstRun ? "/stories" : recommendation.secondaryHref)
                }
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                {isFirstRun ? "Browse stories" : recommendation.secondaryLabel}
              </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5 text-sm">
              <div className="rounded-full border border-slate-800 bg-slate-950/80 px-4 py-2 text-slate-300">
                {trainingRuns} run{trainingRuns === 1 ? "" : "s"}
              </div>
              <div className="rounded-full border border-slate-800 bg-slate-950/80 px-4 py-2 text-slate-300">
                {coins} coin{coins === 1 ? "" : "s"}
              </div>
              <div className="rounded-full border border-slate-800 bg-slate-950/80 px-4 py-2 text-slate-300">
                {currentStreak} day{currentStreak === 1 ? "" : "s"} streak
              </div>
              <div className="rounded-full border border-slate-800 bg-slate-950/80 px-4 py-2 text-slate-300">
                {storiesCompleted} stor{storiesCompleted === 1 ? "y" : "ies"} completed
              </div>
              <div className="rounded-full border border-slate-800 bg-slate-950/80 px-4 py-2 text-slate-300">
                Level {level}
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-5">
            {isFirstRun ? (
              <>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Quick start
                </p>
                <h3 className="mt-2 text-lg font-bold text-white">
                  Start here
                </h3>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                    <p className="text-sm font-semibold text-white">
                      1. Run phishing once
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      One completed phishing session gives the dashboard a real baseline.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                    <p className="text-sm font-semibold text-white">
                      2. Read a short story
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Stories give quick context before more practice.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                    <p className="text-sm font-semibold text-white">
                      3. Check in on Byte
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      The cyber pet works best as a short daily habit.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  Today
                </p>
                <div className="mt-4 space-y-4">
                  <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <p className="text-sm font-semibold text-white">Cyber pet</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {petLoading
                          ? "Loading live status..."
                          : petError
                            ? petError
                            : `Risk ${petRiskLevel} · ${petRiskScore}/100`}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-white">
                      {petLoading ? "--" : `${petHealth}/100`}
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <p className="text-sm font-semibold text-white">Quiz</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {dailyQuestionsCorrect} correct today
                      </p>
                    </div>
                    <p className="text-xl font-bold text-white">
                      {dailyQuestionsDone}/{DAILY_QUESTION_TARGET}
                    </p>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Actions left
                      </p>
                      <p className="mt-1 text-sm text-slate-400">
                        {currentStreak} day{currentStreak === 1 ? "" : "s"} streak
                      </p>
                    </div>
                    <p className="text-xl font-bold text-white">{actionsLeft}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Level"
          value={`Lv ${level}`}
          note={`${xpProgress.xpToNextLevel} XP to next level`}
          Icon={Sparkles}
        />
        <StatCard
          label="Accuracy"
          value={totalAnswered > 0 ? `${averageScore}%` : "--"}
          note={
            totalAnswered > 0
              ? `${totalCorrect}/${totalAnswered} correct answers`
              : "Play one phishing run to set a baseline"
          }
          Icon={BarChart3}
        />
        <StatCard
          label="Daily Quiz"
          value={`${dailyQuestionsDone}/${DAILY_QUESTION_TARGET}`}
          note={
            dailyQuestionsDone > 0
              ? `${dailyQuestionsCorrect} correct today`
              : "No questions answered yet"
          }
          Icon={Dog}
        />
        <StatCard
          label="Coins"
          value={`${coins}`}
          note={`${currentStreak} day${currentStreak === 1 ? "" : "s"} streak`}
          Icon={Coins}
        />
      </section>

      <section className="rounded-[1.75rem] border border-slate-800 bg-slate-900/90 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              XP progress
            </p>
            <h3 className="mt-2 text-xl font-bold text-white">Level {level}</h3>
            <p className="mt-2 text-sm text-slate-400">
              {xpProgress.xpToNextLevel} XP until the next level unlock.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Total XP</p>
            <p className="mt-2 text-2xl font-bold text-white">{xp}</p>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs text-slate-400">
            <span>{xpProgress.progressPercent}% through this level</span>
            <span>{xpProgress.xpToNextLevel} XP left</span>
          </div>
          <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400"
              style={{ width: `${xpProgress.progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/90 p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Learning mastery
          </p>
          {topicEntries.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {topicEntries.map((topic) => (
                <div
                  key={topic.key}
                  className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{topic.label}</p>
                      <p className="mt-1 text-sm text-slate-400">
                        {topic.answered} practice item{topic.answered === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                      {topic.level}
                    </span>
                  </div>
                  <p className="mt-4 text-2xl font-bold text-white">{topic.accuracy}%</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-400">
              Complete a game or finish a story chapter to start building topic mastery.
            </p>
          )}
        </div>

        <div className="rounded-[1.75rem] border border-slate-800 bg-slate-900/90 p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Progress snapshot
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-sm font-semibold text-white">Strongest area</p>
              <p className="mt-2 text-sm text-slate-400">
                {strongestTopic
                  ? `${strongestTopic.label} at ${strongestTopic.accuracy}% accuracy.`
                  : "No strongest area yet. You need more completed practice first."}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-sm font-semibold text-white">Best area to revisit</p>
              <p className="mt-2 text-sm text-slate-400">
                {weakestTopic
                  ? `${weakestTopic.label} is your current weakest topic.`
                  : "Once you complete more activities, the dashboard will point out weaker topics here."}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-sm font-semibold text-white">Story progress</p>
              <p className="mt-2 text-sm text-slate-400">
                {storiesCompleted > 0
                  ? `You have completed ${storiesCompleted} story chapter${storiesCompleted === 1 ? "" : "s"}.`
                  : "You have not completed a story chapter yet."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {weakestTopic && weakestPracticePlan && (
        <section className="rounded-[1.75rem] border border-slate-800 bg-slate-900/90 p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Practice weakest topic
          </p>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-sm font-semibold text-white">{weakestTopic.label}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                This is your lowest mastery area right now at {weakestTopic.accuracy}% accuracy.
                The fastest improvement is one short practice run followed by a quick story refresh.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => router.push(weakestPracticePlan.gameHref)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  {weakestPracticePlan.gameLabel}
                  <ArrowRight className="h-4 w-4" />
                </button>
                {weakestStory && (
                  <Link
                    href={`/stories/${weakestStory.slug}`}
                    className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
                  >
                    Read {weakestStory.title}
                  </Link>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-sm font-semibold text-white">Suggested plan</p>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <p className="text-sm font-semibold text-white">1. Read the warning signs</p>
                  <p className="mt-1 text-sm text-slate-400">
                    {weakestStory
                      ? `Start with ${weakestStory.title} to refresh the basic clues.`
                      : "Start with a short story to refresh the basic clues."}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                  <p className="text-sm font-semibold text-white">2. Run one short practice</p>
                  <p className="mt-1 text-sm text-slate-400">
                    One focused run is enough to move this topic forward if you pay attention to the feedback.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
