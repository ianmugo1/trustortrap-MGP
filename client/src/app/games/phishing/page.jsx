"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PhishingPage() {
  const { token, refreshUser } = useAuth();

  const API_URL = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050",
    []
  );

  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);

  const [completionInfo, setCompletionInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const total = questions.length;
  const isFinished = total > 0 && step >= total;

  const resetLocal = useCallback(() => {
    setStep(0);
    setScore(0);
    setCompletionInfo(null);
    setSubmitting(false);
    setLoadError("");
  }, []);

  const loadQuestions = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setLoadError("");

    try {
      const res = await fetch(`${API_URL}/api/phishing/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setQuestions([]);
        setLoadError(data?.message || "Failed to load questions");
        return;
      }

      const list = Array.isArray(data.questions) ? data.questions : [];
      setQuestions(list);
      setStep(0);
      setScore(0);
      setCompletionInfo(null);
    } catch (err) {
      console.error(err);
      setQuestions([]);
      setLoadError("Could not reach the API. Is the server running?");
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  // Initial load
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Complete game once
  useEffect(() => {
    if (!token) return;
    if (!isFinished) return;
    if (completionInfo) return;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/phishing/complete`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ scoreForThisRun: score }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data?.success) {
          setCompletionInfo(data);

          if (typeof refreshUser === "function") {
            await refreshUser();
          }
        } else {
          setCompletionInfo({
            success: false,
            message: data?.message || "Failed to complete run",
          });
        }
      } catch (err) {
        console.error(err);
        setCompletionInfo({
          success: false,
          message: "Could not complete game (API unreachable)",
        });
      }
    })();
  }, [API_URL, completionInfo, isFinished, refreshUser, score, token]);

  const submitAnswer = useCallback(
    async (choice) => {
      if (submitting) return;

      const q = questions[step];
      if (!q?._id) {
        setStep((s) => s + 1);
        return;
      }

      setSubmitting(true);

      try {
        const res = await fetch(`${API_URL}/api/phishing/submit`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionId: q._id,
            answerGiven: choice,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data?.success && data?.correct) {
          setScore((prev) => prev + (data.pointsAwarded || 0));
        }
      } catch (err) {
        console.error(err);
      } finally {
        // move on
        setTimeout(() => {
          setStep((s) => s + 1);
          setSubmitting(false);
        }, 250);
      }
    },
    [API_URL, questions, step, submitting, token]
  );

  // ====== UI states ======

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
        <p className="text-slate-300 text-sm">Loading questions...</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
        <div className="max-w-md w-full rounded-2xl border border-slate-700 bg-slate-900 p-6 text-center">
          <h1 className="text-xl font-semibold mb-2">Couldn’t load the game</h1>
          <p className="text-slate-300 text-sm mb-4">{loadError}</p>
          <button
            onClick={() => {
              resetLocal();
              loadQuestions();
            }}
            className="px-5 py-2 rounded-lg bg-emerald-500 text-black font-medium"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!questions.length) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
        <p className="text-slate-300 text-sm">No questions found.</p>
      </main>
    );
  }

  if (isFinished) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
        <div className="bg-slate-900 p-8 rounded-2xl text-center border border-slate-700 max-w-md w-full">
          <h1 className="text-3xl font-bold mb-3">Training Complete</h1>

          <p className="mb-2 text-slate-200">Score: {score}</p>

          {completionInfo?.success ? (
            <>
              <p className="text-emerald-400 font-semibold">
                +{completionInfo.completionBonus} coins
              </p>
              <p className="text-slate-300 mb-6">
                Total coins: {completionInfo.totalCoins}
              </p>
            </>
          ) : (
            <p className="text-slate-400 mb-6">Finalising rewards…</p>
          )}

          {completionInfo?.success === false && completionInfo?.message && (
            <p className="text-rose-300 text-sm mb-4">
              {completionInfo.message}
            </p>
          )}

          <button
            onClick={() => {
              resetLocal();
              loadQuestions();
            }}
            className="px-6 py-3 bg-emerald-500 text-black rounded-lg font-medium"
          >
            Play again
          </button>
        </div>
      </main>
    );
  }

  // ====== Game render ======
  const q = questions[step];
  const isDual = Boolean(q?.imageLeft && q?.imageRight);
  const progress = total ? Math.round(((step + 1) / total) * 100) : 0;

  // Image presence checks (prevents blank cards)
  const hasSingle = Boolean(q?.image);
  const hasDual = Boolean(q?.imageLeft && q?.imageRight);

  return (
  <main className="h-[100dvh] bg-slate-950 text-white p-3 md:p-4 overflow-hidden">
    <div className="mx-auto h-full w-full max-w-6xl bg-slate-900 rounded-2xl border border-slate-700 p-4 md:p-6 flex flex-col min-h-0">

      {/* Header (fixed height) */}
      <div className="shrink-0 mb-3">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-bold">Phishing Awareness</h1>
          <p className="text-xs text-slate-400">
            {step + 1} / {total}
          </p>
        </div>

        <div className="w-full h-2 bg-slate-800 rounded mt-2 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question (fixed-ish) */}
      <div className="shrink-0 mb-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
        <p className="text-sm md:text-base line-clamp-2">{q?.text}</p>
      </div>

      {/* Images (takes remaining height, no page scroll) */}
      <div className="flex-1 min-h-0 mb-3">
        {isDual ? (
          <div className="h-full grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-full bg-slate-950/40 rounded-xl border border-slate-700 p-2 flex items-center justify-center overflow-hidden">
              <img
                src={q.imageLeft}
                alt="Version A"
                className="max-h-full max-w-full object-contain"
                draggable={false}
              />
            </div>

            <div className="h-full bg-slate-950/40 rounded-xl border border-slate-700 p-2 flex items-center justify-center overflow-hidden">
              <img
                src={q.imageRight}
                alt="Version B"
                className="max-h-full max-w-full object-contain"
                draggable={false}
              />
            </div>
          </div>
        ) : (
          <div className="h-full bg-slate-950/40 rounded-xl border border-slate-700 p-2 flex items-center justify-center overflow-hidden">
            <img
              src={q.image}
              alt="Email example"
              className="max-h-full max-w-full object-contain"
              draggable={false}
            />
          </div>
        )}
      </div>

      {/* Buttons (fixed height) */}
      <div className="shrink-0 grid grid-cols-2 gap-3">
        {isDual ? (
          <>
            <button
              disabled={submitting}
              onClick={() => submitAnswer("left")}
              className="py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50"
            >
              Version A is phishing
            </button>
            <button
              disabled={submitting}
              onClick={() => submitAnswer("right")}
              className="py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50"
            >
              Version B is phishing
            </button>
          </>
        ) : (
          <>
            <button
              disabled={submitting}
              onClick={() => submitAnswer("Safe")}
              className="py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-medium disabled:opacity-50"
            >
              Safe
            </button>
            <button
              disabled={submitting}
              onClick={() => submitAnswer("Phishing")}
              className="py-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium disabled:opacity-50"
            >
              Phishing
            </button>
          </>
        )}
      </div>

    </div>
  </main>
);

}
