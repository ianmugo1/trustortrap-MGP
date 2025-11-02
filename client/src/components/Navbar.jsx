"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/src/context/AuthContext";
import Container from "@/src/components/Container";
import ThemeToggle from "@/src/components/ThemeToggle";

// NEW:
import ProfileModal from "@/src/components/ProfileModal";
import { Avatar } from "@/src/components/ui/Avatar";

function NavLink({ href, label, onClick }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`text-sm px-3 py-2 rounded-md transition ${
        active ? "bg-brand-500 text-white" : "hover:bg-black/5 dark:hover:bg-white/10"
      }`}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);          // mobile menu
  const [profileOpen, setProfileOpen] = useState(false); // profile modal

  const close = () => setOpen(false);

  return (
    <nav className="border-b border-black/10 dark:border-white/10 sticky top-0 z-20 backdrop-blur bg-[color:var(--bg)]/90">
      <Container className="flex h-14 items-center justify-between">
        {/* Left: Brand + Desktop links */}
        <div className="flex items-center gap-3">
          <Link href="/" className="font-semibold tracking-tight">
            TrustOrTrap
          </Link>
          <div className="hidden sm:flex items-center">
            <NavLink href="/" label="Home" />
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/games" label="Games" />
            {/* NEW: Settings link */}
            <NavLink href="/settings" label="Settings" />
          </div>
        </div>

        {/* Right: Controls (desktop) */}
        <div className="hidden sm:flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <span className="text-sm text-[color:var(--muted)] hidden md:inline">
                Hi, {user.displayName || user.name}
              </span>
              {/* NEW: Avatar opens Profile Modal */}
              <button
                onClick={() => setProfileOpen(true)}
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Edit profile"
              >
                <Avatar
                  name={user.displayName || user.name}
                  src={user.avatarUrl}
                  size={32}
                />
              </button>
              <button
                onClick={signOut}
                className="text-sm px-3 py-1.5 rounded border hover:bg-black/5 dark:hover:bg-white/10"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <NavLink href="/login" label="Login" />
              <NavLink href="/register" label="Register" />
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden inline-flex items-center justify-center h-9 w-9 rounded hover:bg-black/5 dark:hover:bg-white/10"
          onClick={() => setOpen(v => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-current"></span>
            <span className="block h-0.5 w-5 bg-current"></span>
            <span className="block h-0.5 w-5 bg-current"></span>
          </div>
        </button>
      </Container>

      {/* Mobile sheet */}
      {open && (
        <div className="sm:hidden border-t border-black/10 dark:border-white/10">
          <Container className="py-2 flex flex-col gap-1">
            <NavLink href="/" label="Home" onClick={close} />
            <NavLink href="/dashboard" label="Dashboard" onClick={close} />
            <NavLink href="/games" label="Games" onClick={close} />
            {/* NEW: Settings in mobile */}
            <NavLink href="/settings" label="Settings" onClick={close} />

            <div className="flex items-center gap-2 pt-2">
              <ThemeToggle />
              {user ? (
                <>
                  {/* NEW: Edit Profile quick action (mobile) */}
                  <button
                    onClick={() => { setProfileOpen(true); close(); }}
                    className="text-sm px-3 py-1.5 rounded border hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    Edit profile
                  </button>
                  <button
                    onClick={() => { signOut(); close(); }}
                    className="text-sm px-3 py-1.5 rounded border hover:bg-black/5 dark:hover:bg-white/10"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <NavLink href="/login" label="Login" onClick={close} />
                  <NavLink href="/register" label="Register" onClick={close} />
                </>
              )}
            </div>
          </Container>
        </div>
      )}

      {/* NEW: Profile Modal */}
      {user && (
        <ProfileModal
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={user}
        />
      )}
    </nav>
  );
}
