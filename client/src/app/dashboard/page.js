"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { ActivityItem } from "../../components/ActivityItem";
import { NextStepCard } from "../../components/NextStepCard";
import {
  ShieldAlert,
  Target,
  Sparkles,
  Activity,
  Award,
  Coins,
  BarChart3,
} from "lucide-react";
import Image from "next/image";

const DEFAULT_RISK = [
  { label: "Phishing Awareness", value: 0 },
  { label: "Password Hygiene", value: 0 },
  { label: "Social Media Safety", value: 0 },
];

function MetricCard({ label, value, sublabel, Icon }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-lg font-semibold text-slate-50">{value}</p>
          {sublabel && (
            <p className="mt-0.5 text-[11px] text-slate-500">{sublabel}</p>
          )}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
            <Icon className="h-4 w-4 text-emerald-300" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const baseName =
    user?.displayName || user?.name || user?.username || user?.email || "Explorer";
  const displayName = baseName;

  const coins = user?.coins ?? 0;
  const xp = user?.xp ?? 0;
  const level = user?.level ?? 1;
  const role = user?.role || "Cyber Apprentice";

  const badges = Array.isArray(user?.badges) ? user.badges : [];
  const badgeCount = badges.length;

  const stats = user?.stats ?? {};
  const totalSessions = stats.totalSessions ?? 0;
  const averageScore = stats.averageScore ?? 0;
  const completedThisWeek = stats.completedThisWeek ?? 0;
  const targetThisWeek = stats.targetThisWeek ?? 3;

  const weeklyCompletion =
    targetThisWeek > 0
      ? Math.min(100, Math.round((completedThisWeek / targetThisWeek) * 100))
      : 0;

  const recentActivity = Array.isArray(user?.recentActivity)
    ? user.recentActivity
    : [];

  const riskBreakdown =
    Array.isArray(user?.riskProfile) && user.riskProfile.length
      ? user.riskProfile
      : DEFAULT_RISK;

  const nextSteps = [
    {
      title: "Play a new game",
      description:
        "Boost your score and earn coins by tackling a fresh cyber awareness challenge.",
      cta: "Go to games",
      onClick: () => router.push("/games"),
    },
    {
      title: "Review your weak topics",
      description:
        "Focus on areas where your risk score is highest to level up faster.",
      cta: "View breakdown",
      onClick: () => {
        const el = document.getElementById("risk-breakdown");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      },
    },
    {
      title: "Check your badges",
      description:
        "See what you’ve unlocked so far and what’s needed for the next badge.",
      cta: "View badges",
      onClick: () => router.push("/badges"),
    },
  ];

  const handleSignOut = () => {
    signOut();
    router.replace("/login");
  };

  return (
    <div className="space-y-6">

      {/* ---------------- HEADER ---------------- */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">

          {/* BIGGER LOGO (UPDATED) */}
          <div className="h-16 w-16 rounded-2xl overflow-hidden relative shadow-md shadow-emerald-500/20">
            <Image
              src="/logo.png"
              alt="TrustOrTrap Logo"
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-50">
              Welcome back, {displayName} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Track your cyber awareness progress at a glance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden text-right text-xs md:block">
            <p className="font-medium text-slate-200">
              Level {level} · {role}
            </p>
            <p className="text-slate-400">{xp} XP</p>
          </div>
          <button
            onClick={handleSignOut}
            className="rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-100 shadow-sm hover:border-slate-500 hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* ---------------- METRICS ---------------- */}
      <section className="grid gap-4 md:grid-cols-4">
        <MetricCard
          label="Total sessions"
          value={totalSessions}
          sublabel={
            totalSessions > 0
              ? "Keep your streak going"
              : "Play your first game to begin"
          }
          Icon={Activity}
        />
        <MetricCard
          label="Average score"
          value={`${averageScore}%`}
          sublabel={
            averageScore > 0 ? "Aim for 80% or higher" : "No results yet"
          }
          Icon={BarChart3}
        />
        <MetricCard
          label="Badges earned"
          value={badgeCount}
          sublabel={
            badgeCount > 0 ? "Nice collection so far" : "Your first badge awaits"
          }
          Icon={Award}
        />
        <MetricCard
          label="Coins"
          value={coins}
          sublabel={coins > 0 ? "Spend or save wisely" : "Earn coins by playing"}
          Icon={Coins}
        />
      </section>

      {/* ---------------- MAIN GRID ---------------- */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* LEFT: Activity + Risk */}
        <section className="space-y-4 lg:col-span-2">
          
          {/* Recent Activity */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-50">
                  Recent activity
                </h3>
                <p className="text-[11px] text-slate-400">
                  A quick look at what you&apos;ve been doing recently.
                </p>
              </div>
              <button className="text-[11px] text-emerald-300 hover:text-emerald-200">
                View full history
              </button>
            </div>

            {recentActivity.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                No activity yet. Play your first game to see your progress here.
              </p>
            ) : (
              <div className="space-y-2">
                {recentActivity.map((item, idx) => (
                  <ActivityItem key={item.id ?? idx} {...item} />
                ))}
              </div>
            )}
          </div>

          {/* Risk Breakdown */}
          <div
            id="risk-breakdown"
            className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4"
          >
            <div className="mb-4 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-emerald-400" />
              <div>
                <h3 className="text-sm font-semibold text-slate-50">
                  Risk breakdown
                </h3>
                <p className="text-[11px] text-slate-400">
                  The lower the bar, the more room you have to improve.
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {riskBreakdown.map((item, idx) => (
                <div key={item.label ?? idx}>
                  <div className="mb-1 flex items-center justify-between text-[11px] text-slate-300">
                    <span>{item.label}</span>
                    <span className="text-slate-400">{item.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-500"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* RIGHT: Next Steps */}
        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="mb-3 flex items-start gap-3">
              <div className="rounded-xl bg-emerald-500/15 p-1.5">
                <Target className="h-4 w-4 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-50">
                  Focus for this week
                </h3>
                <p className="text-[11px] text-slate-400">
                  Aim to complete at least {targetThisWeek} games and keep your
                  average score above{" "}
                  <span className="text-emerald-300">80%</span>.
                </p>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
              <div className="flex flex-col">
                <span>Weekly completion</span>
                <span className="mt-0.5 text-slate-400">
                  {completedThisWeek} / {targetThisWeek} games completed
                </span>
              </div>
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-[11px] font-semibold text-emerald-300">
                {weeklyCompletion}%
                <span className="pointer-events-none absolute inset-0 rounded-full border border-emerald-400/60" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <h3 className="text-sm font-semibold text-slate-50">
                Smart next steps
              </h3>
            </div>
            <div className="space-y-3">
              {nextSteps.map((step) => (
                <NextStepCard key={step.title} {...step} />
              ))}
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
