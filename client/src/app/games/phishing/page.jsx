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
  const [gameStarted, setGameStarted] = useState(false);

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
    setGameStarted(false);
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
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-950 text-white px-4">
        <p className="rounded-2xl border border-sky-400/30 bg-slate-900/70 px-6 py-4 backdrop-blur">
          Please log in to play.
        </p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-950 text-white px-4">
        <p className="rounded-2xl border border-cyan-400/30 bg-slate-900/70 px-6 py-4 text-cyan-100 text-sm backdrop-blur">
          Loading questions...
        </p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-950 text-white px-4">
        <div className="max-w-md w-full rounded-3xl border border-rose-400/30 bg-slate-900/85 p-6 text-center shadow-2xl shadow-rose-900/20 backdrop-blur">
          <h1 className="text-xl font-semibold mb-2 text-rose-100">Couldn’t load the game</h1>
          <p className="text-slate-200 text-sm mb-4">{loadError}</p>
          <button
            onClick={() => {
              resetLocal();
              loadQuestions();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-900 font-semibold"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!questions.length) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-950 text-white px-4">
        <p className="rounded-2xl border border-amber-400/30 bg-slate-900/70 px-6 py-4 text-amber-100 text-sm backdrop-blur">
          No questions found.
        </p>
      </main>
    );
  }

  if (!gameStarted) {
    return (
      <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-950 text-white px-4">
        <div className="absolute -top-20 -left-16 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative max-w-lg w-full rounded-3xl border border-sky-400/30 bg-slate-900/85 p-8 text-center shadow-2xl shadow-sky-900/30 backdrop-blur">
          <h1 className="text-3xl md:text-4xl font-black mb-4 bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-200 bg-clip-text text-transparent">
            Phishing Awareness
          </h1>
          <p className="text-slate-200 mb-6">
            Test your ability to spot phishing attempts. You'll be presented with {total} scenarios
            and asked to identify the safest response.
          </p>
          <div className="text-sky-100/90 text-sm mb-6 space-y-1">
            <p>{total} questions</p>
            <p>+10 coins per correct answer</p>
            <p>+20 bonus coins on completion</p>
          </div>
          <button
            onClick={() => setGameStarted(true)}
            className="px-9 py-3 bg-gradient-to-r from-cyan-300 via-emerald-300 to-lime-300 text-slate-900 rounded-xl font-bold text-lg hover:scale-[1.02] transition-transform"
          >
            Start
          </button>
        </div>
      </main>
    );
  }

  if (isFinished) {
    return (
      <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-950 text-white px-4">
        <div className="absolute top-8 left-10 h-48 w-48 rounded-full bg-lime-500/20 blur-3xl" />
        <div className="absolute bottom-4 right-10 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="bg-slate-900/85 p-8 rounded-3xl text-center border border-sky-400/25 max-w-md w-full shadow-2xl shadow-sky-950/40 backdrop-blur">
          <h1 className="text-3xl font-black mb-3 bg-gradient-to-r from-cyan-200 to-lime-200 bg-clip-text text-transparent">
            Training Complete
          </h1>

          <p className="mb-2 text-slate-100">Score: {score}</p>

          {completionInfo?.success ? (
            <>
              <p className="text-lime-300 font-semibold">
                +{completionInfo.completionBonus} coins
              </p>
              <p className="text-slate-200 mb-6">
                Total coins: {completionInfo.totalCoins}
              </p>
            </>
          ) : (
            <p className="text-slate-300 mb-6">Finalising rewards…</p>
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
            className="px-6 py-3 bg-gradient-to-r from-cyan-300 to-emerald-300 text-slate-900 rounded-xl font-semibold"
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
  const optionBadgeColors = [
    "bg-cyan-400 text-slate-900",
    "bg-emerald-400 text-slate-900",
    "bg-amber-300 text-slate-900",
    "bg-fuchsia-400 text-slate-900",
  ];

  const isLocked = submitting || answer !== null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-950 text-white">
      <div className="absolute -top-20 left-10 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="absolute top-1/2 -right-20 h-64 w-64 rounded-full bg-fuchsia-500/15 blur-3xl" />
      <div className="w-full grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4 md:gap-6 pl-0 pr-3 sm:pr-4 md:pr-6 py-3 sm:py-4 md:py-6">
        <section className="bg-slate-900/80 rounded-3xl border border-sky-400/20 p-4 sm:p-6 md:p-8 shadow-2xl backdrop-blur">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="text-xl md:text-3xl font-black bg-gradient-to-r from-cyan-100 via-sky-200 to-indigo-100 bg-clip-text text-transparent">
                  Phishing Awareness
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-sky-100/80">
                  Spot the scam before it catches you.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-slate-300">Progress</p>
                <p className="text-sm font-bold text-cyan-100">
                  {step + 1} / {total}
                </p>
              </div>
            </div>

            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-6 bg-slate-800/70 p-4 sm:p-5 rounded-2xl border border-slate-700/70">
            <p className="text-base md:text-lg leading-relaxed text-slate-100">{q?.text}</p>
          </div>

          {/* Answer Options */}
          {options.length > 0 ? (
            <div className="space-y-3 mb-4">
              {options.map((option, index) => (
                <button
                  key={index}
                  disabled={isLocked}
                  onClick={() => submitAnswer(index)}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border transition-all duration-200
                    ${
                      answer === index
                        ? "border-cyan-300 bg-cyan-500/15 shadow-[0_0_0_1px_rgba(103,232,249,0.2)]"
                        : "border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 hover:border-sky-400/40"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold mr-3 ${
                      optionBadgeColors[index % optionBadgeColors.length]
                    }`}
                  >
                    {optionLabels[index]}
                  </span>
                  <span className="text-sm sm:text-base text-slate-100">{option}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                disabled={isLocked}
                onClick={() => submitAnswer("Safe")}
                className="py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-emerald-400 to-lime-300 hover:brightness-105 text-slate-900 font-bold text-base sm:text-lg disabled:opacity-50"
              >
                Safe
              </button>
              <button
                disabled={isLocked}
                onClick={() => submitAnswer("Phishing")}
                className="py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-rose-500 to-orange-400 hover:brightness-105 text-white font-bold text-base sm:text-lg disabled:opacity-50"
              >
                Phishing
              </button>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                feedback.isCorrect
                  ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-100"
                  : "border-rose-300/40 bg-rose-400/10 text-rose-100"
              }`}
            >
              <p className="font-semibold">{feedback.isCorrect ? "Correct!" : "Not quite."}</p>
              {feedback.explanation && (
                <p className="mt-1 text-xs text-slate-100/85">{feedback.explanation}</p>
              )}
            </div>
          )}
        </section>

        <aside className="bg-slate-900/75 rounded-3xl border border-indigo-300/20 p-4 sm:p-6 shadow-xl backdrop-blur h-fit">
          <h2 className="text-lg font-extrabold text-indigo-100 mb-4">Game Stats</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-slate-800/80 border border-slate-700 p-3">
              <p className="text-slate-300 text-xs uppercase tracking-wide">Coins</p>
              <p className="text-2xl font-black text-amber-300">{score}</p>
            </div>
            <div className="rounded-xl bg-slate-800/80 border border-slate-700 p-3">
              <p className="text-slate-300 text-xs uppercase tracking-wide">Current Step</p>
              <p className="text-base font-semibold text-cyan-100">
                Question {step + 1} of {total}
              </p>
            </div>
            <div className="rounded-xl bg-slate-800/80 border border-slate-700 p-3">
              <p className="text-slate-300 text-xs uppercase tracking-wide">Pro Tip</p>
              <p className="text-slate-100">Check sender details and avoid urgent links.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );

}
