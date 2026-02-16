"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";

function toPercent(value) {
  return `${Math.max(0, Math.min(100, Number(value) || 0))}%`;
}

const INCIDENT_RESPONSES = {
  credential_stuffing: [
    { id: "reset_password", label: "Reset password" },
    { id: "enable_2fa_now", label: "Enable 2FA now" },
    { id: "ignore", label: "Ignore for now" },
  ],
  breach_alert: [
    { id: "rotate_passwords", label: "Rotate passwords" },
    { id: "lock_sessions", label: "Log out sessions" },
    { id: "delay_action", label: "Delay until tomorrow" },
  ],
  brute_force_attempt: [
    { id: "strengthen_password", label: "Strengthen password" },
    { id: "activate_2fa", label: "Add 2FA" },
    { id: "do_nothing", label: "Do nothing" },
  ],
  account_takeover: [
    { id: "full_lockdown", label: "Full lockdown" },
    { id: "recover_and_rotate", label: "Recover + rotate credentials" },
    { id: "minimal_response", label: "Minimal response" },
  ],
};

function riskBadgeClass(level) {
  if (level === "low") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  if (level === "medium") return "bg-amber-500/15 text-amber-200 border-amber-500/30";
  return "bg-rose-500/15 text-rose-200 border-rose-500/30";
}

export default function CyberPetPage() {
  const { token } = useAuth();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [incidentMessage, setIncidentMessage] = useState("");

  const petStatus = pet?.pet || {};
  const posture = pet?.posture || {};
  const daily = pet?.daily || {};
  const risk = pet?.risk || {};
  const activeIncident = pet?.activeIncident || null;
  const incidentHistory = Array.isArray(pet?.incidentHistory) ? pet.incidentHistory : [];

  const remainingActions = Math.max(
    0,
    (Number(daily.maxActions) || 0) - (Number(daily.actionsUsed) || 0)
  );
  const hasActiveIncident = activeIncident?.status === "active" && !!activeIncident?.type;

  const loadPetSnapshot = useCallback(async () => {
    if (!token) return;
    const res = await authFetch("/api/cyberpet", {}, token);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) {
      throw new Error(data?.message || "Failed to load cyber pet");
    }
    return data.pet;
  }, [token]);

  const runTick = useCallback(async () => {
    const res = await authFetch(
      "/api/cyberpet/tick",
      { method: "POST", body: JSON.stringify({}) },
      token
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) {
      throw new Error(data?.message || "Failed to run daily tick");
    }
    return data.pet;
  }, [token]);

  const loadAndSync = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setLoadError("");
    setActionMessage("");
    setIncidentMessage("");

    try {
      await loadPetSnapshot();
      const ticked = await runTick();
      setPet(ticked);
    } catch (err) {
      console.error(err);
      setPet(null);
      setLoadError(err?.message || "Could not reach the API. Is the server running?");
    } finally {
      setLoading(false);
    }
  }, [loadPetSnapshot, runTick, token]);

  useEffect(() => {
    loadAndSync();
  }, [loadAndSync]);

  const handleAction = useCallback(
    async (actionType, payload = {}) => {
      if (!token || busy) return;
      setBusy(true);
      setActionMessage("");
      setIncidentMessage("");

      try {
        const res = await authFetch(
          "/api/cyberpet/action",
          {
            method: "POST",
            body: JSON.stringify({ actionType, payload }),
          },
          token
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
          setActionMessage(data?.message || "Action failed");
          return;
        }
        setPet(data.pet);
        setActionMessage(
          `${actionType} applied. ${data.remainingActions} actions left today.`
        );
      } catch (err) {
        console.error(err);
        setActionMessage("Network error while applying action.");
      } finally {
        setBusy(false);
      }
    },
    [busy, token]
  );

  const handleIncidentResponse = useCallback(
    async (responseId) => {
      if (!token || busy) return;
      setBusy(true);
      setIncidentMessage("");
      setActionMessage("");

      try {
        const res = await authFetch(
          "/api/cyberpet/incident/respond",
          {
            method: "POST",
            body: JSON.stringify({ responseId }),
          },
          token
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
          setIncidentMessage(data?.message || "Could not resolve incident");
          return;
        }
        setPet(data.pet);
        setIncidentMessage(`Resolved: ${data?.result?.responseLabel || "Incident handled"}`);
      } catch (err) {
        console.error(err);
        setIncidentMessage("Network error while resolving incident.");
      } finally {
        setBusy(false);
      }
    },
    [busy, token]
  );

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
        <p>Please log in to play.</p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
        <p className="text-slate-300 text-sm">Loading cyber pet...</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
        <div className="max-w-md w-full rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center">
          <h1 className="text-xl font-semibold mb-2">Could not load Cyber Pet</h1>
          <p className="text-slate-300 text-sm mb-4">{loadError}</p>
          <button
            onClick={loadAndSync}
            className="px-5 py-2 rounded-lg bg-emerald-500 text-black font-medium"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!pet) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
        <p className="text-slate-300 text-sm">No cyber pet data available.</p>
      </main>
    );
  }

  const incidentOptions = hasActiveIncident
    ? INCIDENT_RESPONSES[activeIncident.type] || []
    : [];

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-wide text-emerald-300">Cyber Pet Security Sim</p>
          <h1 className="mt-1 text-3xl font-bold">Byte</h1>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide ${riskBadgeClass(
                risk.level
              )}`}
            >
              Risk: {risk.level || "high"}
            </span>
            <span className="text-xs text-slate-400">Score: {risk.score ?? 0}/100</span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <p>Health</p>
                <p>{petStatus.health ?? 0}/100</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: toPercent(petStatus.health) }} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <p>Mood</p>
                <p>{petStatus.mood ?? 0}/100</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: toPercent(petStatus.mood) }} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <p>Energy</p>
                <p>{petStatus.energy ?? 0}/100</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full bg-violet-400" style={{ width: toPercent(petStatus.energy) }} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="text-xl font-semibold">Password Security Posture</h2>
            <p className="text-xs text-slate-400">Actions left: {remainingActions}</p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 mb-4">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <p>Password Strength</p>
              <p>{posture.strengthScore ?? 0}/100</p>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
              <div className="h-full bg-emerald-400" style={{ width: toPercent(posture.strengthScore) }} />
            </div>
            <div className="mt-3 grid gap-2 text-xs text-slate-300 md:grid-cols-2">
              <p>
                Password reuse:{" "}
                <span className={posture.reusedPassword ? "text-rose-300" : "text-emerald-300"}>
                  {posture.reusedPassword ? "Reused" : "Unique"}
                </span>
              </p>
              <p>
                2FA:{" "}
                <span className={posture.twoFactorEnabled ? "text-emerald-300" : "text-amber-300"}>
                  {posture.twoFactorEnabled ? "Enabled" : "Off"}
                </span>
              </p>
              <p className="md:col-span-2">
                Breach monitoring:{" "}
                <span
                  className={
                    posture.breachMonitoringEnabled ? "text-emerald-300" : "text-amber-300"
                  }
                >
                  {posture.breachMonitoringEnabled ? "Enabled" : "Off"}
                </span>
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <button
              onClick={() =>
                handleAction("changePassword", {
                  strengthScore: Math.min(100, (Number(posture.strengthScore) || 45) + 20),
                })
              }
              disabled={busy || remainingActions <= 0}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm hover:bg-slate-700 disabled:opacity-60"
            >
              Change Password
            </button>
            <button
              onClick={() => handleAction("enable2FA")}
              disabled={busy || remainingActions <= 0}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm hover:bg-slate-700 disabled:opacity-60"
            >
              Enable 2FA
            </button>
            <button
              onClick={() => handleAction("turnOnMonitoring")}
              disabled={busy || remainingActions <= 0}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm hover:bg-slate-700 disabled:opacity-60"
            >
              Turn on Breach Monitoring
            </button>
            <button
              onClick={() => handleAction("lockDownSessions")}
              disabled={busy || remainingActions <= 0}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm hover:bg-slate-700 disabled:opacity-60"
            >
              Lock Down Sessions
            </button>
          </div>

          {actionMessage ? (
            <p className="mt-4 text-xs text-emerald-300">{actionMessage}</p>
          ) : null}
          {incidentMessage ? (
            <p className="mt-2 text-xs text-cyan-300">{incidentMessage}</p>
          ) : null}

          <div className="mt-5">
            <button
              onClick={loadAndSync}
              disabled={busy}
              className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
            >
              Run Daily Check-In
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold mb-4">Incident Center</h2>
          {hasActiveIncident ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-sm text-amber-200 uppercase tracking-wide">{activeIncident.severity} risk incident</p>
              <h3 className="mt-1 text-lg font-semibold">{activeIncident.label || activeIncident.type}</h3>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {incidentOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleIncidentResponse(option.id)}
                    disabled={busy}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-left text-sm hover:bg-slate-700 disabled:opacity-60"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No active incident right now.</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold mb-4">Security Timeline</h2>
          {incidentHistory.length ? (
            <div className="space-y-2">
              {incidentHistory
                .slice()
                .reverse()
                .slice(0, 8)
                .map((entry, idx) => (
                  <div key={`${entry.type}-${entry.createdAt}-${idx}`} className="rounded-lg border border-slate-700 bg-slate-800 p-3">
                    <p className="text-sm font-medium">{entry.type}</p>
                    <p className="text-xs text-slate-400">
                      Severity: {entry.severity} · Outcome: {entry.outcome || "N/A"}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No incidents logged yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
