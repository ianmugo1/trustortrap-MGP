"use client";

import Image from "next/image";
import Link from "next/link";

export default function PublicAuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 sm:px-6">
      <div className="public-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="glow-orb absolute left-[-7rem] top-14 h-56 w-56 rounded-full bg-emerald-400/14 blur-3xl" />
      <div className="glow-orb-reverse absolute right-[-6rem] top-24 h-64 w-64 rounded-full bg-cyan-400/14 blur-3xl" />
      <div className="glow-orb absolute bottom-[-7rem] left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-yellow-300/8 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center">
        <section className="relative w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/88 p-6 shadow-[0_20px_60px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-8">
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/50 to-transparent" />

          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-3 text-sm text-slate-200 transition hover:text-white"
          >
            <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-emerald-400/20 bg-slate-950 shadow-[0_0_24px_rgba(52,211,153,0.08)]">
              <Image
                src="/logo.png"
                alt="TrustOrTrap logo"
                fill
                className="object-contain p-2.5"
                sizes="56px"
                priority
              />
            </div>
            <div>
              <span className="font-display block text-lg font-bold text-white">
                TrustOrTrap
              </span>
              <span className="block text-xs text-slate-400">
                Cyber Awareness Hub
              </span>
            </div>
          </Link>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
              {title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {description}
            </p>
          </div>

          <div className="mt-8">{children}</div>

          {footer ? <div className="mt-6">{footer}</div> : null}
        </section>
      </div>
    </main>
  );
}
