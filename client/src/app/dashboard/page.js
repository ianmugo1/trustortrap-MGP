"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ActivityItem } from "../../components/ActivityItem";
import { authFetch } from "@/lib/api";
import { STORY_CHAPTERS } from "@/lib/storyChapters";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpenText,
  Coins,
  Dog,
  ScanFace,
  ShieldAlert,
} from "lucide-react";

const DAILY_QUESTION_TARGET = 5;

function formatShortDate(value) {
  if (!value) return "No recent run";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No recent run";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function StatCard({ label, value, note, Icon }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-2xl font-bold text-white">{value}</p>
          <p className="mt-1 text-sm text-slate-400">{note}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function Card({ title, children, action }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-800 bg-slate-900/90 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function FocusRow({ title, value, hint, href, cta, Icon }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Icon className="h-4 w-4 text-emerald-300" />
            <span>{title}</span>
          </div>
          <p className="mt-2 text-xl font-bold text-white">{value}</p>
          <p className="mt-1 text-sm text-slate-400">{hint}</p>
        </div>
        <Link
          href={href}
          className="shrink-0 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
        >
          {cta}
        </Link>
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
  const learningInterest = user?.learningInterest || "";

  const phishingStats = user?.phishingStats ?? {};
  const socialStats = user?.socialStats ?? {};
  const cyberPetStats = user?.cyberPetStats ?? {};

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

  const activityFeed = useMemo(() => {
    const items = [];

    if (activeIncident) {
      items.push({
        title: "Active cyber pet incident needs attention",
        time: "Open Cyber Pet to respond",
        tag: "Cyber Pet",
      });
    } else if (pet && dailyQuestionsDone > 0) {
      items.push({
        title: `Answered ${dailyQuestionsDone}/${DAILY_QUESTION_TARGET} cyber pet questions today`,
        time: `${actionsLeft} actions left today`,
        tag: "Cyber Pet",
      });
    }

    if (phishingStats.lastCompletedAt) {
      items.push({
        title: `Finished phishing challenge with ${phishingStats.lastScore ?? 0} points`,
        time: formatShortDate(phishingStats.lastCompletedAt),
        tag: "Phishing",
      });
    }

    if (socialStats.lastCompletedAt) {
      items.push({
        title: `Finished social challenge with ${socialStats.lastScore ?? 0} points`,
        time: formatShortDate(socialStats.lastCompletedAt),
        tag: "Social",
      });
    }

    return items;
  }, [
    actionsLeft,
    activeIncident,
    dailyQuestionsDone,
    pet,
    phishingStats.lastCompletedAt,
    phishingStats.lastScore,
    socialStats.lastCompletedAt,
    socialStats.lastScore,
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:px-8 md:py-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/95">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr] lg:p-8">
          <div>
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl shadow-md shadow-emerald-500/20">
                <Image
                  src="/logo.png"
                  alt="TrustOrTrap Logo"
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-300">
                  {recommendation.eyebrow}
                </p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-white">
                  Welcome back, {displayName}.
                </h1>
              </div>
            </div>

            <h2 className="mt-5 text-2xl font-bold text-white">
              {recommendation.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              {recommendation.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push(recommendation.primaryHref)}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                {recommendation.primaryLabel}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => router.push(recommendation.secondaryHref)}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
              >
                {recommendation.secondaryLabel}
              </button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-800 bg-slate-950/80 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Snapshot
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                <p className="text-sm font-semibold text-white">Live cyber pet</p>
                {petLoading ? (
                  <p className="mt-2 text-sm text-slate-400">Loading live status...</p>
                ) : petError ? (
                  <p className="mt-2 text-sm text-amber-300">{petError}</p>
                ) : (
                  <>
                    <p className="mt-2 text-2xl font-bold text-white">{petHealth}/100</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Risk {petRiskLevel} - {petRiskScore}/100
                    </p>
                  </>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                  <p className="text-sm font-semibold text-white">Daily progress</p>
                  <p className="mt-2 text-xl font-bold text-white">
                    {dailyQuestionsDone}/{DAILY_QUESTION_TARGET}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">Questions answered</p>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
                  <p className="text-sm font-semibold text-white">Current streak</p>
                  <p className="mt-2 text-xl font-bold text-white">{currentStreak} day{currentStreak === 1 ? "" : "s"}</p>
                  <p className="mt-1 text-sm text-slate-400">Daily cyber pet check-ins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Training Runs"
          value={trainingRuns}
          note="Completed phishing and social challenges"
          Icon={Activity}
        />
        <StatCard
          label="Phishing Accuracy"
          value={totalAnswered > 0 ? `${averageScore}%` : "--"}
          note={
            totalAnswered > 0
              ? `${totalCorrect}/${totalAnswered} correct answers`
              : "Play one phishing run to set a baseline"
          }
          Icon={BarChart3}
        />
        <StatCard
          label="Social Runs"
          value={socialGames}
          note={
            socialGames > 0
              ? `Best score ${socialStats.bestScore ?? 0}`
              : "The social challenge has not been played yet"
          }
          Icon={ScanFace}
        />
        <StatCard
          label="Coins"
          value={coins}
          note="Earned through successful practice"
          Icon={Coins}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card
          title="Today's Security Check"
          action={
            <Link
              href="/games/cyberpet"
              className="text-sm font-medium text-emerald-300 transition hover:text-emerald-200"
            >
              Open Cyber Pet
            </Link>
          }
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-sm font-semibold text-white">What to do today</p>
              <p className="mt-2 text-sm text-slate-300">
                {activeIncident
                  ? "Respond to the active incident first. That is the highest-signal security task on your dashboard."
                  : dailyQuestionsDone < DAILY_QUESTION_TARGET
                    ? `You have ${DAILY_QUESTION_TARGET - dailyQuestionsDone} daily cyber pet questions left.`
                    : "Your daily questions are complete. Use any remaining actions to improve your pet posture."}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Dog className="h-4 w-4 text-violet-300" />
                  Health
                </div>
                <p className="mt-2 text-2xl font-bold text-white">
                  {petLoading && !pet ? "--" : `${petHealth}/100`}
                </p>
                <p className="mt-1 text-xs text-slate-400">Live cyber pet status</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldAlert className="h-4 w-4 text-emerald-300" />
                  Quiz
                </div>
                <p className="mt-2 text-2xl font-bold text-white">
                  {dailyQuestionsDone}/{DAILY_QUESTION_TARGET}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {dailyQuestionsCorrect} correct today
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <Activity className="h-4 w-4 text-sky-300" />
                  Actions
                </div>
                <p className="mt-2 text-2xl font-bold text-white">{actionsLeft}</p>
                <p className="mt-1 text-xs text-slate-400">Remaining for today</p>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Progress by Area">
          <div className="space-y-3">
            <FocusRow
              title="Phishing Detection"
              value={totalAnswered > 0 ? `${averageScore}% accuracy` : "Not started"}
              hint={
                phishingGames > 0
                  ? `Last run ${phishingStats.lastScore ?? 0} points on ${formatShortDate(phishingStats.lastCompletedAt)}`
                  : "Run the phishing challenge to establish a real baseline."
              }
              href="/games/phishing"
              cta="Practice"
              Icon={ShieldAlert}
            />
            <FocusRow
              title="Social Scam Awareness"
              value={socialGames > 0 ? `${socialGames} completed run${socialGames === 1 ? "" : "s"}` : "Not started"}
              hint={
                socialGames > 0
                  ? `Best score ${socialStats.bestScore ?? 0} - last played ${formatShortDate(
                      socialStats.lastCompletedAt
                    )}`
                  : "Complete one social challenge run to add this area to your dashboard."
              }
              href="/games/social"
              cta="Open"
              Icon={ScanFace}
            />
            <FocusRow
              title="Cyber Pet Security"
              value={
                petLoading && !pet
                  ? "Loading live status"
                  : activeIncident
                    ? "Incident active"
                    : `Risk ${petRiskLevel}`
              }
              hint={
                petError
                  ? petError
                  : `Resolved incidents ${cyberPetStats.resolvedIncidents ?? 0} - average risk ${
                      cyberPetStats.avgRiskScore ?? 0
                    }`
              }
              href="/games/cyberpet"
              cta="Check"
              Icon={Dog}
            />
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card
          title="Story Library"
          action={
            <Link
              href="/stories"
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-300 transition hover:text-emerald-200"
            >
              All stories
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {STORY_CHAPTERS.map((chapter) => {
              const isRecommended = chapter.slug === recommendation.storySlug;

              return (
                <Link
                  key={chapter.slug}
                  href={`/stories/${chapter.slug}`}
                  className={`rounded-2xl border p-4 transition ${
                    isRecommended
                      ? "border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/15"
                      : "border-slate-800 bg-slate-950/80 hover:bg-slate-950"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                        Chapter {chapter.chapterNumber}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {chapter.title}
                      </p>
                    </div>
                    {isRecommended && (
                      <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-slate-950">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-slate-400">{chapter.subtitle}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-slate-200">
                    <BookOpenText className="h-3.5 w-3.5 text-emerald-300" />
                    <span>{chapter.relatedGame.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </Card>

        <Card title="Recent Activity">
          {activityFeed.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/70 px-4 py-6 text-sm text-slate-400">
              No completed activity yet. Start with one short challenge so the dashboard has real progress to summarize.
            </div>
          ) : (
            <div className="space-y-3">
              {activityFeed.map((item, index) => (
                <ActivityItem key={`${item.tag}-${index}`} {...item} />
              ))}
            </div>
          )}
        </Card>
      </section>
    </div>
  );
}
