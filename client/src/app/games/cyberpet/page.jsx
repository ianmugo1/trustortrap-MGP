"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";

function toPercent(value) {
  return `${Math.max(0, Math.min(100, Number(value) || 0))}%`;
}

// Mood tiers decide the robot's colour + face
function getMoodTier(mood) {
  const m = Number(mood) || 0;
  if (m >= 60) return "happy";
  if (m >= 30) return "neutral";
  return "sad";
}

const MOOD_COLOURS = {
  happy: { body: "#34d399", eye: "#064e3b", mouth: "#064e3b" },   // emerald
  neutral: { body: "#fbbf24", eye: "#78350f", mouth: "#78350f" }, // amber
  sad: { body: "#f87171", eye: "#7f1d1d", mouth: "#7f1d1d" },    // rose
};

// Simple inline SVG robot pet
function PetCharacter({ mood }) {
  const tier = getMoodTier(mood);
  const c = MOOD_COLOURS[tier];

  return (
    <svg viewBox="0 0 120 140" width="120" height="140" aria-label="Cyber pet robot">
      {/* Antenna */}
      <line x1="60" y1="8" x2="60" y2="28" stroke={c.body} strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="6" r="5" fill={c.body} />

      {/* Head */}
      <rect x="25" y="28" width="70" height="52" rx="14" fill={c.body} />

      {/* Eyes */}
      <circle cx="44" cy="52" r="8" fill="white" />
      <circle cx="76" cy="52" r="8" fill="white" />
      <circle cx={tier === "sad" ? "42" : "46"} cy={tier === "sad" ? "54" : "52"} r="4" fill={c.eye} />
      <circle cx={tier === "sad" ? "74" : "78"} cy={tier === "sad" ? "54" : "52"} r="4" fill={c.eye} />

      {/* Mouth */}
      {tier === "happy" && (
        <path d="M44 66 Q60 78 76 66" fill="none" stroke={c.mouth} strokeWidth="3" strokeLinecap="round" />
      )}
      {tier === "neutral" && (
        <line x1="46" y1="68" x2="74" y2="68" stroke={c.mouth} strokeWidth="3" strokeLinecap="round" />
      )}
      {tier === "sad" && (
        <path d="M44 72 Q60 62 76 72" fill="none" stroke={c.mouth} strokeWidth="3" strokeLinecap="round" />
      )}

      {/* Body */}
      <rect x="30" y="86" width="60" height="36" rx="10" fill={c.body} />

      {/* Chest light */}
      <circle cx="60" cy="104" r="6" fill="white" opacity="0.6" />

      {/* Arms */}
      <rect x="10" y="90" width="16" height="8" rx="4" fill={c.body} />
      <rect x="94" y="90" width="16" height="8" rx="4" fill={c.body} />

      {/* Feet */}
      <rect x="34" y="122" width="18" height="10" rx="5" fill={c.body} />
      <rect x="68" y="122" width="18" height="10" rx="5" fill={c.body} />
    </svg>
  );
}

export default function CyberPetPage() {
  const { token } = useAuth();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);
  // Mini-games: { trueFalse: { info, questions }, passwordStrengthener: ..., fillBlanks: ... }
  const [miniGames, setMiniGames] = useState({});
  const [activeGame, setActiveGame] = useState("trueFalse");
  const [mgFeedback, setMgFeedback] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameError, setNameError] = useState("");

  const petStatus = pet?.pet || {};
  const petName = pet?.name || "Byte";

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

  // Load all 3 mini-games one at a time (avoids DB race conditions)
  const loadAllMiniGames = useCallback(async () => {
    const types = ["trueFalse", "passwordStrengthener", "fillBlanks"];
    const results = {};

    for (const type of types) {
      try {
        const res = await authFetch(`/api/cyberpet/minigame/${type}`, {}, token);
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.success) {
          results[type] = { info: data.miniGame, questions: data.questions || [] };
        }
      } catch (err) {
        console.error(`Failed to load ${type}:`, err);
      }
    }

    return results;
  }, [token]);

  const loadAndSync = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setLoadError("");
    setMgFeedback(null);

    try {
      await loadPetSnapshot();
      const ticked = await runTick();
      setPet(ticked);

      const games = await loadAllMiniGames();
      setMiniGames(games);
    } catch (err) {
      console.error(err);
      setPet(null);
      setLoadError(err?.message || "Could not reach the API. Is the server running?");
    } finally {
      setLoading(false);
    }
  }, [loadPetSnapshot, runTick, loadAllMiniGames, token]);

  useEffect(() => {
    loadAndSync();
  }, [loadAndSync]);

  // Save a new pet name
  const handleRenamePet = useCallback(
    async (newName) => {
      if (!token || busy) return;
      const trimmed = (newName || "").trim();
      if (!trimmed || trimmed.length > 20) {
        setNameError("Name must be 1-20 characters");
        return;
      }

      setBusy(true);
      setNameError("");
      try {
        const res = await authFetch(
          "/api/cyberpet/name",
          { method: "POST", body: JSON.stringify({ name: trimmed }) },
          token
        );
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.success) {
          setPet(data.pet);
          setEditingName(false);
        } else {
          setNameError(data?.message || "Failed to save name");
        }
      } catch (err) {
        console.error("Rename error:", err);
        setNameError("Network error — is the server running?");
      } finally {
        setBusy(false);
      }
    },
    [busy, token]
  );

  // Generic submit handler for all mini-game types
  const handleMiniGameSubmit = useCallback(
    async (gameType, questionId, answer) => {
      if (!token || busy) return;
      setBusy(true);
      setMgFeedback(null);

      try {
        const res = await authFetch(
          `/api/cyberpet/minigame/${gameType}/submit`,
          {
            method: "POST",
            body: JSON.stringify({ questionId, answer }),
          },
          token
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
          setMgFeedback({ isCorrect: false, explanation: data?.message || "Submit failed", isError: true });
          return;
        }

        setPet(data.pet);

        // Update the mini-game info with new progress from server
        setMiniGames((prev) => ({
          ...prev,
          [gameType]: {
            ...prev[gameType],
            info: data.miniGame || prev[gameType]?.info,
          },
        }));

        setMgFeedback({
          isCorrect: !!data.result?.isCorrect,
          explanation: data.result?.explanation || "",
          isError: false,
        });

        // Auto-clear feedback after 1.5s so next question appears
        setTimeout(() => setMgFeedback(null), 1500);
      } catch (err) {
        console.error(err);
        setMgFeedback({ isCorrect: false, explanation: "Network error.", isError: true });
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

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-5">

        {/* Pet status */}
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-wide text-emerald-300">Cyber Pet</p>

          {/* Pet character + name */}
          <div className="mt-3 flex items-center gap-5">
            <PetCharacter mood={petStatus.mood} />

            <div>
              {editingName ? (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleRenamePet(nameInput); }}
                  className="flex items-center gap-2"
                >
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Escape") setEditingName(false); }}
                    maxLength={20}
                    className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-xl font-bold text-white outline-none focus:border-emerald-500 w-40"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="text-emerald-400 hover:text-emerald-300 text-sm font-medium disabled:opacity-60"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingName(false)}
                    className="text-slate-400 hover:text-slate-300 text-sm"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{petName}</h1>
                  <button
                    onClick={() => { setNameInput(petName); setNameError(""); setEditingName(true); }}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                    title="Rename pet"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 00.65.65l3.155-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                    </svg>
                  </button>
                </div>
              )}
              {nameError && (
                <p className="text-xs text-rose-400 mt-1">{nameError}</p>
              )}
              <p className="text-sm text-slate-400 mt-1">
                {getMoodTier(petStatus.mood) === "happy" ? "Feeling great!" :
                 getMoodTier(petStatus.mood) === "neutral" ? "Doing okay" : "Needs attention"}
              </p>
            </div>
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

        {/* Mini Games */}
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold">Mini Games</h2>
            <p className="text-xs text-slate-400">7 questions each · daily</p>
          </div>

          {/* Game type tabs */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { key: "trueFalse", label: "True / False", active: "border-emerald-500/50 bg-emerald-500/10", activeText: "text-emerald-200" },
              { key: "passwordStrengthener", label: "Password Rater", active: "border-amber-500/50 bg-amber-500/10", activeText: "text-amber-200" },
              { key: "fillBlanks", label: "Fill the Blank", active: "border-cyan-500/50 bg-cyan-500/10", activeText: "text-cyan-200" },
            ].map((tab) => {
              const isActive = activeGame === tab.key;
              const info = miniGames[tab.key]?.info;
              const done = info ? info.answeredCount >= info.totalCount : false;
              const progress = info ? `${info.answeredCount || 0}/${info.totalCount || 7}` : "–";

              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveGame(tab.key); setMgFeedback(null); }}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    isActive ? tab.active : "border-slate-700 bg-slate-800 hover:bg-slate-700/80"
                  }`}
                >
                  <p className={`text-sm font-semibold ${isActive ? tab.activeText : "text-slate-200"}`}>
                    {tab.label}
                  </p>
                  <p className={`text-xs mt-1 ${done ? "text-emerald-400" : "text-slate-400"}`}>
                    {done ? "Complete" : progress}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active mini-game questions */}
          {(() => {
            const game = miniGames[activeGame];
            if (!game || !game.questions?.length) {
              return <p className="text-sm text-slate-400">Loading questions...</p>;
            }

            const info = game.info || {};
            const answeredIds = info.answeredIds || [];
            const totalCount = info.totalCount || game.questions.length;
            const answeredCount = info.answeredCount || 0;
            const correctCount = info.correctCount || 0;
            const allDone = answeredCount >= totalCount;

            // Find the first unanswered question
            const currentQ = game.questions.find((q) => !answeredIds.includes(q.id));

            if (allDone) {
              return (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
                  <p className="text-lg font-semibold text-emerald-200">All done for today!</p>
                  <p className="text-sm text-slate-300 mt-1">
                    Score: {correctCount}/{totalCount} correct
                  </p>
                  <p className="text-xs text-slate-400 mt-2">Come back tomorrow for new questions.</p>
                </div>
              );
            }

            if (!currentQ) {
              return <p className="text-sm text-slate-400">No questions available.</p>;
            }

            return (
              <div className="space-y-4">
                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Q{answeredCount + 1} of {totalCount}</span>
                    <span>{correctCount} correct</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${(answeredCount / totalCount) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question prompt */}
                <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
                  {activeGame === "passwordStrengthener" ? (
                    <>
                      <p className="text-sm text-slate-400 mb-2">How strong is this password?</p>
                      <div className="rounded-lg bg-slate-900 border border-slate-600 px-4 py-3 text-center">
                        <p className="font-mono text-xl text-yellow-300 tracking-wide">{currentQ.prompt}</p>
                      </div>
                    </>
                  ) : activeGame === "fillBlanks" ? (
                    <p className="text-base md:text-lg">
                      {currentQ.prompt.split("_____").map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className="inline-block mx-1 px-3 py-0.5 rounded bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 font-semibold text-sm">
                              ?????
                            </span>
                          )}
                        </span>
                      ))}
                    </p>
                  ) : (
                    <p className="text-base md:text-lg">{currentQ.prompt}</p>
                  )}
                </div>

                {/* Answer buttons per game type */}
                {activeGame === "trueFalse" ? (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleMiniGameSubmit("trueFalse", currentQ.id, true)}
                      disabled={busy}
                      className="py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      True
                    </button>
                    <button
                      onClick={() => handleMiniGameSubmit("trueFalse", currentQ.id, false)}
                      disabled={busy}
                      className="py-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      False
                    </button>
                  </div>
                ) : activeGame === "passwordStrengthener" ? (
                  <div className="grid grid-cols-3 gap-3">
                    {["Weak", "OK", "Strong"].map((label, idx) => {
                      const colors = [
                        "bg-rose-600 hover:bg-rose-500 text-white",
                        "bg-amber-500 hover:bg-amber-400 text-slate-900",
                        "bg-emerald-600 hover:bg-emerald-500 text-white",
                      ];
                      return (
                        <button
                          key={idx}
                          onClick={() => handleMiniGameSubmit("passwordStrengthener", currentQ.id, idx)}
                          disabled={busy}
                          className={`py-4 rounded-xl font-bold text-base transition-all ${colors[idx]} disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(currentQ.options || []).map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleMiniGameSubmit("fillBlanks", currentQ.id, idx)}
                        disabled={busy}
                        className="w-full text-left rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm hover:bg-slate-700/80 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-600 text-white text-xs font-bold mr-3">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {/* Feedback after answering */}
                {mgFeedback && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      mgFeedback.isError
                        ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                        : mgFeedback.isCorrect
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                        : "border-rose-500/40 bg-rose-500/10 text-rose-200"
                    }`}
                  >
                    <p className="font-semibold">
                      {mgFeedback.isError ? "Error" : mgFeedback.isCorrect ? "Correct!" : "Incorrect!"}
                    </p>
                    {mgFeedback.explanation && (
                      <p className="mt-1 text-xs opacity-80">{mgFeedback.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </section>

      </div>
    </main>
  );
}
