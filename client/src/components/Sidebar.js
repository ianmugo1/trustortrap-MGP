"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpenText,
  Coins,
  LayoutDashboard,
  ListCheckIcon,
  LogOut,
  Settings,
  Trophy,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/games",       label: "Training",    icon: ListCheckIcon },
  { href: "/stories",     label: "Stories",     icon: BookOpenText },
  { href: "/shop",        label: "Shop",        icon: Coins },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const displayName =
    user?.displayName || user?.name || user?.username || "Explorer";
  const secondaryLabel = user?.email || "Signed in";

  const handleSignOut = () => {
    signOut();
    router.replace("/");
  };

  return (
    <aside className="hidden w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-50 md:flex">
      <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
        <div className="relative h-10 w-10 overflow-hidden rounded-2xl">
          <Image
            src="/logo.png"
            alt="TrustOrTrap Logo"
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>

        <div>
          <h1 className="text-sm font-semibold tracking-tight">TrustOrTrap</h1>
          <p className="text-xs text-slate-400">Cyber Awareness Hub</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all ${
                active
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-900 shadow-md shadow-emerald-500/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-slate-800 px-4 pb-4 pt-3">
        <div className="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-100">
              {displayName}
            </p>
            <p className="truncate text-[11px] text-slate-400">
              {secondaryLabel}
            </p>
          </div>

          <Link
            href="/settings"
            className="rounded-lg p-1 text-slate-300 transition hover:bg-slate-800 hover:text-white"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}
