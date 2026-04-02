"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, KeyRound, Shield, SlidersHorizontal, UserRound } from "lucide-react";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const DEFAULT_SETTINGS = {
  notifications: {
    app: true,
    email: true,
  },
  app: {
    theme: "system",
    language: "en",
    soundEffects: true,
  },
  system: {
    biometrics: false,
    autoLockMinutes: 5,
  },
};

function SectionCard({ title, description, icon: Icon, children }) {
  return (
    <section className="rounded-[1.75rem] border border-slate-800 bg-slate-900/90 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function formatSettingsError(message, fallback) {
  const raw = String(message || "").trim();

  if (!raw) return fallback;

  if (raw.includes("Unable to reach the API server")) {
    return raw;
  }

  const normalized = raw.toLowerCase();

  if (normalized.includes("username and email are required")) {
    return "Enter both your name and email address.";
  }

  if (normalized.includes("please provide a valid email")) {
    return "Enter a valid email address.";
  }

  if (normalized.includes("email is already in use")) {
    return "That email is already linked to another account.";
  }

  if (normalized.includes("current password is incorrect")) {
    return "Your current password is incorrect.";
  }

  if (normalized.includes("new password must be at least 6 characters")) {
    return "Your new password must be at least 6 characters long.";
  }

  return raw;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, signOut, refreshUser } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [appNotifications, setAppNotifications] = useState(
    DEFAULT_SETTINGS.notifications.app
  );
  const [emailNotifications, setEmailNotifications] = useState(
    DEFAULT_SETTINGS.notifications.email
  );

  const [theme, setTheme] = useState(DEFAULT_SETTINGS.app.theme);
  const [language, setLanguage] = useState(DEFAULT_SETTINGS.app.language);
  const [soundEffects, setSoundEffects] = useState(
    DEFAULT_SETTINGS.app.soundEffects
  );

  const [biometrics, setBiometrics] = useState(DEFAULT_SETTINGS.system.biometrics);
  const [autoLockMinutes, setAutoLockMinutes] = useState(
    DEFAULT_SETTINGS.system.autoLockMinutes
  );

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loadingSection, setLoadingSection] = useState("");

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (!user) return;

    setDisplayName(user.displayName || "");
    setEmail(user.email || "");

    setAppNotifications(
      user.settings?.notifications?.app ?? DEFAULT_SETTINGS.notifications.app
    );
    setEmailNotifications(
      user.settings?.notifications?.email ?? DEFAULT_SETTINGS.notifications.email
    );

    setTheme(user.settings?.app?.theme ?? DEFAULT_SETTINGS.app.theme);
    setLanguage(user.settings?.app?.language ?? DEFAULT_SETTINGS.app.language);
    setSoundEffects(
      user.settings?.app?.soundEffects ?? DEFAULT_SETTINGS.app.soundEffects
    );

    setBiometrics(
      user.settings?.system?.biometrics ?? DEFAULT_SETTINGS.system.biometrics
    );
    setAutoLockMinutes(
      user.settings?.system?.autoLockMinutes ??
        DEFAULT_SETTINGS.system.autoLockMinutes
    );
  }, [user]);

  const settingsPayload = useMemo(
    () => ({
      notifications: {
        app: appNotifications,
        email: emailNotifications,
      },
      app: {
        theme,
        language,
        soundEffects,
      },
      system: {
        biometrics,
        autoLockMinutes,
      },
    }),
    [
      appNotifications,
      emailNotifications,
      theme,
      language,
      soundEffects,
      biometrics,
      autoLockMinutes,
    ]
  );

  const clearMessages = () => {
    setStatus("");
    setError("");
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    clearMessages();

    const nextDisplayName = displayName.trim();
    const nextEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!nextDisplayName || !nextEmail) {
      setError("Enter both your name and email address.");
      return;
    }

    if (!emailRegex.test(nextEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setLoadingSection("profile");

    try {
      const res = await authFetch(
        "/api/users/me/profile",
        {
          method: "PATCH",
          body: JSON.stringify({ displayName: nextDisplayName, email: nextEmail }),
        },
        token
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update profile");
      }

      await refreshUser();
      setStatus("Profile updated.");
    } catch (err) {
      setError(formatSettingsError(err.message, "Could not update profile."));
    } finally {
      setLoadingSection("");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Fill in all password fields before saving.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Your new password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Your new password must be at least 6 characters long.");
      return;
    }

    setLoadingSection("password");

    try {
      const res = await authFetch(
        "/api/users/me/password",
        {
          method: "PATCH",
          body: JSON.stringify({ currentPassword, newPassword }),
        },
        token
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update password");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatus("Password updated.");
    } catch (err) {
      setError(formatSettingsError(err.message, "Could not update password."));
    } finally {
      setLoadingSection("");
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoadingSection("settings");

    try {
      const res = await authFetch(
        "/api/users/me/settings",
        {
          method: "PATCH",
          body: JSON.stringify(settingsPayload),
        },
        token
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to save settings");
      }

      await refreshUser();
      setStatus("Settings saved.");
    } catch (err) {
      setError(formatSettingsError(err.message, "Could not save settings."));
    } finally {
      setLoadingSection("");
    }
  };

  const clearAppCache = async () => {
    clearMessages();
    setLoadingSection("cache");

    try {
      let cleared = 0;

      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
        cleared = keys.length;
      }

      sessionStorage.clear();
      setStatus(
        cleared > 0
          ? `Cleared ${cleared} cache entr${cleared === 1 ? "y" : "ies"}.`
          : "Cache cleared."
      );
    } catch {
      setError("Could not clear cache on this device.");
    } finally {
      setLoadingSection("");
    }
  };

  const handleSignOut = () => {
    signOut();
    router.replace("/");
  };

  const deleteAccount = async () => {
    clearMessages();

    const confirmed = window.confirm(
      "Delete your account permanently? This cannot be undone."
    );

    if (!confirmed) return;

    setLoadingSection("delete");

    try {
      const res = await authFetch(
        "/api/users/me",
        { method: "DELETE" },
        token
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete account");
      }

      signOut();
      router.replace("/register");
    } catch (err) {
      setError(formatSettingsError(err.message, "Could not delete your account."));
    } finally {
      setLoadingSection("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900/95">
        <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div>
            <p className="text-sm font-medium text-emerald-300">Settings</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
              Manage account details, app preferences, and security controls.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
              This first pass improves the settings layout so each group is easier
              to scan and use without changing the underlying save flows.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Account
              </p>
              <p className="mt-3 text-lg font-semibold text-white">
                {user?.displayName || "Explorer"}
              </p>
              <p className="mt-1 text-sm text-slate-400">{user?.email || "No email found"}</p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Sections
              </p>
              <p className="mt-3 text-lg font-semibold text-white">Profile, app, account</p>
              <p className="mt-1 text-sm text-slate-400">
                Settings are still saved through the same existing backend endpoints.
              </p>
            </div>
          </div>
        </div>
      </section>

      {status && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {status}
        </div>
      )}
      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <SectionCard
        title="Profile"
        description="Keep the basic account details tied to your login up to date."
        icon={UserRound}
      >
        <form className="mt-4 grid gap-4" onSubmit={saveProfile}>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="text-sm font-medium text-white">Public account details</p>
            <p className="mt-1 text-sm text-slate-400">
              These are the visible identity fields currently stored on your account.
            </p>
          </div>

          <label className="grid gap-1 text-sm md:grid-cols-1">
            <span className="text-slate-300">Username</span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400"
              required
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-slate-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400"
              required
            />
          </label>

          <div className="flex justify-start">
            <button
              type="submit"
              disabled={loadingSection === "profile"}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingSection === "profile" ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-800 text-slate-300">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Change password</h3>
              <p className="mt-1 text-sm text-slate-400">
                Update your account password using the existing password endpoint.
              </p>
            </div>
          </div>

        <form className="mt-4 grid gap-4" onSubmit={changePassword}>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-300">Current password</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400"
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-300">New password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400"
              minLength={6}
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-slate-300">Confirm new password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400"
              minLength={6}
              required
            />
          </label>
          <div>
            <button
              type="submit"
              disabled={loadingSection === "password"}
              className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingSection === "password"
                ? "Updating..."
                : "Update password"}
            </button>
          </div>
        </form>
        </div>
      </SectionCard>

      <div className="space-y-6">
      <SectionCard
        title="Preferences"
        description="Notification, appearance, and device-related options stored in your account settings."
        icon={SlidersHorizontal}
      >
      <form
        className="space-y-6"
        onSubmit={saveSettings}
      >
        <div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Bell className="h-4 w-4 text-emerald-300" />
          Notifications
        </div>
        <div className="mt-4 grid gap-3 text-sm">
          <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
            <span className="text-slate-300">App notifications</span>
            <input
              type="checkbox"
              checked={appNotifications}
              onChange={(e) => setAppNotifications(e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-2">
            <span className="text-slate-300">Email notifications</span>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
          </label>
        </div>
        </div>

        <div>
        <h2 className="text-base font-semibold text-slate-100">App Settings</h2>
        <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-slate-300">Theme</span>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-slate-300">Language</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </label>

          <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 md:col-span-2">
            <span className="text-slate-300">Sound effects</span>
            <input
              type="checkbox"
              checked={soundEffects}
              onChange={(e) => setSoundEffects(e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
          </label>
        </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-800 text-slate-300">
            <KeyRound className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">System Settings</h2>
            <p className="mt-1 text-sm text-slate-400">
              Device-level preferences and quick maintenance tools.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
          <label className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 md:col-span-2">
            <span className="text-slate-300">Biometrics</span>
            <input
              type="checkbox"
              checked={biometrics}
              onChange={(e) => setBiometrics(e.target.checked)}
              className="h-4 w-4 accent-emerald-500"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-slate-300">Auto-lock timeout</span>
            <select
              value={autoLockMinutes}
              onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-emerald-400"
            >
              <option value={1}>1 minute</option>
              <option value={5}>5 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={clearAppCache}
              disabled={loadingSection === "cache"}
              className="w-full rounded-xl border border-slate-600 px-4 py-2 font-medium text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingSection === "cache" ? "Clearing..." : "Clear app cache"}
            </button>
          </div>
        </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loadingSection === "settings"}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingSection === "settings" ? "Saving..." : "Save settings"}
          </button>
        </div>
      </form>
      </SectionCard>

      <SectionCard
        title="Account"
        description="Session and deletion actions that affect your whole account."
        icon={Shield}
      >
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800"
          >
            Log out
          </button>
          <button
            type="button"
            onClick={deleteAccount}
            disabled={loadingSection === "delete"}
            className="rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-200 hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingSection === "delete" ? "Deleting..." : "Delete account"}
          </button>
        </div>
      </SectionCard>
      </div>
      </div>
    </div>
  );
}
