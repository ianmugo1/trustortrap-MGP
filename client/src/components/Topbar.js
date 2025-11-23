"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Bell, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const quickLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/games", label: "Games" },
  { href: "/badges", label: "Badges" },
  { href: "/settings", label: "Settings" },
];

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const displayName =
    user?.displayName || user?.name || user?.username || "Explorer";
  const level = user?.level ?? 1;
  const role = user?.role || "Cyber Scout";
  const notifications = user?.notifications?.length ?? 0;

  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle navigation"
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 md:hidden"
          >
            <Menu className="h-4 w-4 text-slate-100" />
          </button>

          <div className="flex items-center gap-2 md:hidden">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span className="text-sm font-semibold text-slate-100">
              TrustOrTrap
            </span>
          </div>

          <div className="hidden md:block">
            <h2 className="text-sm font-semibold text-slate-100">
              Welcome back, {displayName} 👋
            </h2>
            <p className="text-xs text-slate-400">
              Track your cyber awareness progress at a glance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-slate-100" />
            {notifications > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-semibold text-slate-950">
                {notifications}
              </span>
            )}
          </button>

          <div className="hidden items-center gap-2 rounded-full bg-slate-800 px-3 py-1.5 md:flex">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 text-[11px] font-semibold text-slate-900">
              {initials}
            </div>
            <div className="text-xs leading-tight">
              <p className="max-w-[140px] truncate font-medium text-slate-100">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-400">
                Level {level} · {role}
              </p>
            </div>
          </div>
        </div>
      </header>

      {open && (
        <div className="border-b border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-200 md:hidden">
          <p className="mb-2 text-slate-400">Quick links</p>
          <div className="flex flex-wrap gap-2">
            {quickLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded-full border border-slate-700 px-3 py-1 hover:bg-slate-800"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
