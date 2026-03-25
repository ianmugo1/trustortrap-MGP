"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const quickLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/games", label: "Training" },
  { href: "/stories", label: "Stories" },
  { href: "/settings", label: "Settings" },
];

const PAGE_META = {
  dashboard: {
    title: "Dashboard",
    description: "Live progress across training, stories, and your cyber pet.",
  },
  games: {
    title: "Training",
    description: "Short challenges that build safer online habits.",
  },
  stories: {
    title: "Stories",
    description: "Short lessons that prepare you before practice.",
  },
  settings: {
    title: "Settings",
    description: "Account, notifications, and app behavior.",
  },
};

export default function Topbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  const displayName =
    user?.displayName || user?.name || user?.username || "Explorer";
  const secondaryLabel = user?.email || "Signed in";

  const initials = displayName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const rootSegment = pathname?.split("/")[1] || "dashboard";
  const pageMeta =
    PAGE_META[rootSegment] || {
      title: "TrustOrTrap",
      description: "Cyber awareness practice for beginners.",
    };

  return (
    <>
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
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
              {pageMeta.title}
            </h2>
            <p className="text-xs text-slate-400">{pageMeta.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/settings"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-100 transition hover:bg-slate-700"
            aria-label="Open settings"
          >
            <Settings className="h-4 w-4" />
          </Link>

          <div className="hidden items-center gap-2 rounded-full bg-slate-800 px-3 py-1.5 md:flex">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-400 to-cyan-500 text-[11px] font-semibold text-slate-900">
              {initials}
            </div>
            <div className="text-xs leading-tight">
              <p className="max-w-[160px] truncate font-medium text-slate-100">
                {displayName}
              </p>
              <p className="max-w-[180px] truncate text-[11px] text-slate-400">
                {secondaryLabel}
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
