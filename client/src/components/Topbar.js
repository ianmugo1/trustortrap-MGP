"use client";

import { Menu, Bell, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  // Safely extract user info
  const displayName =
    user?.displayName || user?.name || user?.username || "Explorer";

  const level = user?.level ?? 1;
  const role = user?.role || "Cyber Scout"; // fallback title
  const notifications = user?.notifications?.length ?? 0;

  // Generate initials for avatar
  const initials = (displayName || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="flex items-center justify-between px-4 py-3 md:px-6 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          
          {/* Mobile Hamburger */}
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 md:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            <Menu className="w-4 h-4 text-slate-100" />
          </button>

          {/* Mobile Logo */}
          <div className="flex items-center gap-2 md:hidden">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-slate-100">
              TrustOrTrap
            </span>
          </div>

          {/* Desktop Welcome Text */}
          <div className="hidden md:block">
            <h2 className="text-sm font-semibold text-slate-100">
              Welcome back, {displayName} 👋
            </h2>
            <p className="text-xs text-slate-400">
              Track your cyber awareness progress at a glance.
            </p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
            <Bell className="w-4 h-4 text-slate-100" />
            {notifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-semibold text-slate-950">
                {notifications}
              </span>
            )}
          </button>

          {/* Avatar + Info (Desktop) */}
          <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1.5">
            <div className="h-7 w-7 flex items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 text-[11px] font-semibold text-slate-900">
              {initials}
            </div>
            <div className="text-xs leading-tight">
              <p className="font-medium text-slate-100">{displayName}</p>
              <p className="text-[11px] text-slate-400">
                Level {level} · {role}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-200">
          <p className="mb-2 text-slate-400">Quick links</p>
          <div className="flex flex-wrap gap-2">
            <a
              href="/dashboard"
              className="rounded-full border border-slate-700 px-3 py-1"
            >
              Dashboard
            </a>
            <a
              href="/games"
              className="rounded-full border border-slate-700 px-3 py-1"
            >
              Games
            </a>
            <a
              href="/badges"
              className="rounded-full border border-slate-700 px-3 py-1"
            >
              Badges
            </a>
            <a
              href="/settings"
              className="rounded-full border border-slate-700 px-3 py-1"
            >
              Settings
            </a>
          </div>
        </div>
      )}
    </>
  );
}
