"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";

export default function PhishingPage() {
  const { token, refreshUser } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [completionInfo, setCompletionInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const total = questions.length;
  const isFinished = total > 0 && step >= total;

  const resetLocal = useCallback(() => {
    setStep(0);
    setScore(0);
    setAnswer(null);
    setFeedback(null);
    setCompletionInfo(null);
    setSubmitting(false);
    setLoadError("");
  }, []);

  const loadQuestions = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setLoadError("");

    try {
      const res = await authFetch("/api/phishing/questions", {}, token);
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
      setAnswer(null);
      setFeedback(null);
      setCompletionInfo(null);
    } catch (err) {
      console.error(err);
      setQuestions([]);
      setLoadError("Could not reach the API. Is the server running?");
    } finally {
      setLoading(false);
    }
  }, [token]);

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
        const res = await authFetch(
          "/api/phishing/complete",
          {
            method: "POST",
            body: JSON.stringify({ scoreForThisRun: score }),
          },
          token
        );

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
  }, [completionInfo, isFinished, refreshUser, score, token]);

  const submitAnswer = useCallback(
    async (choice) => {
      if (submitting || answer !== null) return;

      const q = questions[step];
      if (!q?._id) {
        setStep((s) => s + 1);
        return;
      }

      setSubmitting(true);
      setAnswer(choice);
      setFeedback(null);

      try {
        const res = await authFetch(
          "/api/phishing/submit",
          {
            method: "POST",
            body: JSON.stringify({
              questionId: q._id,
              answerGiven: choice,
            }),
          },
          token
        );

        const data = await res.json().catch(() => ({}));

        if (res.ok && data?.success) {
          if (data.correct) {
            setScore((prev) => prev + (data.pointsAwarded || 0));
          }
          setFeedback({
            isCorrect: !!data.correct,
            explanation: q.explanation || "",
          });
        } else {
          setFeedback({
            isCorrect: false,
            explanation: data?.message || "Submission failed.",
          });
        }
      } catch (err) {
        console.error(err);
        setFeedback({
          isCorrect: false,
          explanation: "Network error. Please try again.",
        });
      } finally {
        // move on
        setTimeout(() => {
          setStep((s) => s + 1);
          setAnswer(null);
          setFeedback(null);
          setSubmitting(false);
        }, 1200);
      }
    },
    [answer, questions, step, submitting, token]
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
  const progress = total ? Math.round(((step + 1) / total) * 100) : 0;
  const options = q?.options || [];
  const optionLabels = ["A", "B", "C", "D"];

  const isLocked = submitting || answer !== null;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="mx-auto w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-700 p-6 md:p-8">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h1 className="text-xl md:text-2xl font-bold">Phishing Awareness</h1>
            <p className="text-sm text-slate-400">
              {step + 1} / {total}
            </p>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-6 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
          <p className="text-base md:text-lg">{q?.text}</p>
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-3 mb-4">
          {options.map((option, index) => (
            <button
              key={index}
              disabled={isLocked}
              onClick={() => submitAnswer(index)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200
                ${answer === index
                  ? "border-emerald-500 bg-emerald-500/20"
                  : "border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-slate-600"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700 text-sm font-bold mr-3">
                {optionLabels[index]}
              </span>
              <span className="text-sm md:text-base">{option}</span>
            </button>
          ))}
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              feedback.isCorrect
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                : "border-rose-500/40 bg-rose-500/10 text-rose-200"
            }`}
          >
            <p className="font-semibold">
              {feedback.isCorrect ? "Correct!" : "Not quite."}
            </p>
            {feedback.explanation && (
              <p className="mt-1 text-xs text-slate-200/80">
                {feedback.explanation}
              </p>
            )}
          </div>
        )}

      </div>
    </main>
  );

}
