"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpenText, Dog, ScanFace, ShieldAlert, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    title: "Phishing Drills",
    description: "Practice reading suspicious emails, texts, and login screens before they catch you off guard.",
    icon: ShieldAlert,
    accent: "from-sky-400/25 via-cyan-400/12 to-transparent",
    iconClass: "text-sky-300",
  },
  {
    title: "Social Safety",
    description: "Work through realistic social media choices, scam signals, and AI-generated manipulation.",
    icon: ScanFace,
    accent: "from-rose-400/25 via-orange-400/12 to-transparent",
    iconClass: "text-rose-300",
  },
  {
    title: "Cyber Pet Habit",
    description: "Keep a daily streak alive with a light-touch challenge that rewards consistency over cramming.",
    icon: Dog,
    accent: "from-emerald-400/25 via-lime-300/12 to-transparent",
    iconClass: "text-emerald-300",
  },
  {
    title: "Story Mode",
    description: "Read short story chapters that explain scams, passwords, and online pressure without jargon.",
    icon: BookOpenText,
    accent: "from-amber-300/25 via-yellow-300/12 to-transparent",
    iconClass: "text-amber-200",
  },
];

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="public-grid pointer-events-none absolute inset-0 opacity-70" />

      <div className="glow-orb absolute left-[-8rem] top-12 h-64 w-64 rounded-full bg-emerald-400/18 blur-3xl" />
      <div className="glow-orb-reverse absolute right-[-6rem] top-28 h-72 w-72 rounded-full bg-cyan-400/18 blur-3xl" />
      <div className="glow-orb absolute bottom-[-6rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-yellow-300/10 blur-3xl" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="hero-reveal max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              Cyber awareness without the lecture
            </div>

            <h1 className="font-display mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              Learn to spot the trap before it lands.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              TrustOrTrap turns online safety into short challenges, story-driven lessons,
              and repeatable habits so beginners can build judgment that actually sticks.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {isAuthenticated && !loading ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                  >
                    Open Dashboard
                  </Link>
                  <Link
                    href="/games"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
                  >
                    Jump Into Training
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-2xl bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                  >
                    Start Learning
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900/70 px-6 py-3 text-sm font-semibold text-white transition hover:border-slate-500 hover:bg-slate-800"
                  >
                    I Have an Account
                  </Link>
                </>
              )}
            </div>

            <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/65 px-4 py-4">
                <p className="text-2xl font-black text-white">4</p>
                <p className="mt-1 text-slate-400">training paths that teach by doing</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/65 px-4 py-4">
                <p className="text-2xl font-black text-white">5 min</p>
                <p className="mt-1 text-slate-400">sessions built for quick repeat use</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/65 px-4 py-4">
                <p className="text-2xl font-black text-white">Daily</p>
                <p className="mt-1 text-slate-400">habit loop through the cyber pet mode</p>
              </div>
            </div>
          </div>

          <div className="hero-reveal-delay">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-[var(--tt-panel)] p-5 shadow-[0_20px_80px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-6">
              <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />

              <div className="flex items-center gap-4 rounded-[1.5rem] border border-slate-800 bg-slate-950/80 p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-emerald-400/20 bg-slate-900">
                  <Image
                    src="/logo.png"
                    alt="TrustOrTrap logo"
                    fill
                    className="object-contain p-2"
                    priority
                    sizes="64px"
                  />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
                    Welcome screen
                  </p>
                  <h2 className="font-display mt-1 text-2xl font-black text-white">
                    TrustOrTrap
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    A beginner-friendly cyber awareness hub built around action, not theory.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {features.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.title}
                      className={`relative overflow-hidden rounded-[1.5rem] border border-slate-800 bg-gradient-to-r ${feature.accent} p-[1px]`}
                    >
                      <div className="flex items-start gap-4 rounded-[1.45rem] bg-[var(--tt-panel-strong)] px-4 py-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/80">
                          <Icon className={`h-5 w-5 ${feature.iconClass}`} />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-white">{feature.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-slate-400">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-cyan-400/20 bg-cyan-400/8 px-4 py-4 text-sm text-slate-300">
                <p className="font-semibold text-white">Why this works</p>
                <p className="mt-1 leading-6 text-slate-400">
                  Short feedback loops make it easier to remember scam signals than reading long blocks of advice once and forgetting them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
