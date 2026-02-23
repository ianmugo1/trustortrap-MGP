"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
    setLoadingSection("profile");

    try {
      const res = await authFetch(
        "/api/users/me/profile",
        {
          method: "PATCH",
          body: JSON.stringify({ displayName, email }),
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
      setError(err.message || "Could not update profile");
    } finally {
      setLoadingSection("");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    clearMessages();

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
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
      setError(err.message || "Could not update password");
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
      setError(err.message || "Could not save settings");
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
    router.replace("/login");
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
      setError(err.message || "Could not delete account");
    } finally {
      setLoadingSection("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-50">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Manage your profile, notifications, app behavior, and account actions.
        </p>
      </div>

      {status && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {status}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
        <h2 className="text-base font-semibold text-slate-100">Profile</h2>
        <form className="mt-4 grid gap-4" onSubmit={saveProfile}>
          <label className="grid gap-1 text-sm">
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

          <div>
            <button
              type="submit"
              disabled={loadingSection === "profile"}
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingSection === "profile" ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>

        <form className="mt-6 grid gap-4" onSubmit={changePassword}>
          <h3 className="text-sm font-semibold text-slate-200">Change password</h3>
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
      </section>

      <form
        className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5"
        onSubmit={saveSettings}
      >
        <h2 className="text-base font-semibold text-slate-100">Notifications</h2>
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

        <h2 className="mt-6 text-base font-semibold text-slate-100">App Settings</h2>
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

        <h2 className="mt-6 text-base font-semibold text-slate-100">System Settings</h2>
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

      <section className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
        <h2 className="text-base font-semibold text-slate-100">Account</h2>
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
      </section>
    </div>
  );
}
