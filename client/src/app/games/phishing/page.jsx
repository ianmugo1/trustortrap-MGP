"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";

export default function PhishingPage() {
  const { token } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Load questions from backend
  useEffect(() => {
    async function loadQuestions() {
      if (!token) return;

      try {
        const res = await fetch("http://localhost:5050/api/phishing/questions", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        if (data.success) setQuestions(data.questions);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }
    loadQuestions();
  }, [token]);

  // No token – gate the page
  if (!token) {
    return (
      <main className="h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p className="px-4 py-2 rounded-md bg-slate-800/70 border border-slate-700">
          Please log in to play the game.
        </p>
      </main>
    );
  }

  // Still loading
  if (questions.length === 0) {
    return (
      <main className="h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p className="px-4 py-2 rounded-md bg-slate-800/70 border border-slate-700">
          Loading questions...
        </p>
      </main>
    );
  }

  const total = questions.length;

  // End of game guard BEFORE we read questions[step]
  if (step >= total) {
    return (
      <main className="h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="max-w-md w-full mx-4 rounded-2xl bg-slate-900/80 border border-slate-700 shadow-xl p-8 text-center backdrop-blur">
          <h1 className="text-3xl font-semibold mb-4">Training complete</h1>
          <p className="mb-4 text-slate-300">
            You’ve finished all phishing scenarios.
          </p>
          <p className="mb-6 text-sm text-slate-400">
            CONGRADULATIONS ON COMPLETING THE GAME.
          </p>
          <button
            onClick={() => {
              setStep(0);
              setAnswer(null);
            }}
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold transition"
          >
            Play again
          </button>
        </div>
      </main>
    );
  }

  // Safe to read current question now
  const q = questions[step];
  const progress = ((step + 1) / total) * 100;

  const isDualImage = q.imageLeft && q.imageRight;
  const isSingleImage = q.image && !isDualImage;

  async function submitAnswer(choice) {
    if (answer) return;
    setAnswer(choice);
    setFeedback(null);

    try {
      const res = await authFetch("/api/phishing/submit", {
        method: "POST",
        body: JSON.stringify({
          questionId: q._id,
          answerGiven: choice,
        }),
      }, token);
      const data = await res.json();
      if (data?.success) {
        setFeedback({
          isCorrect: data.isCorrect,
          explanation: q.explanation || "",
        });
      } else {
        setFeedback({
          isCorrect: false,
          explanation: data?.message || "Submission failed.",
        });
      }
    } catch (err) {
      console.error("Submission error:", err);
      setFeedback({
        isCorrect: false,
        explanation: "Network error. Please try again.",
      });
    }

    setTimeout(() => {
      setAnswer(null);
      setFeedback(null);
      setStep((s) => s + 1);
    }, 1200);
  }

  return (
    <main className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-6xl rounded-3xl bg-slate-900/80 border border-slate-700 shadow-2xl backdrop-blur flex flex-col gap-6 p-6 md:p-8 lg:p-10">
        {/* Top bar: title + progress */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">
              Phishing Awareness Game
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Decide which messages are safe and which ones are traps.
            </p>
          </div>

          <div className="w-full md:w-64">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Progress
              </span>
              <span className="text-xs text-slate-300">
                Question {step + 1} of {total}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        {/* Question text */}
        <section className="rounded-2xl bg-slate-900/70 border border-slate-800 px-4 py-3 md:px-6 md:py-4">
          <p className="text-base md:text-lg text-slate-100">{q.text}</p>
        </section>

        {/* Image area */}
        <section className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6">
          {isDualImage && (
            <div className="flex flex-col md:flex-row gap-6 w-full">
              {/* Left */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full h-[240px] md:h-[320px] lg:h-[380px] rounded-2xl bg-slate-900 border border-slate-800 shadow-inner flex items-center justify-center overflow-hidden">
                  <img
                    src={q.imageLeft}
                    alt="Left version"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Left
                </span>
              </div>

              {/* Right */}
              <div className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full h-[240px] md:h-[320px] lg:h-[380px] rounded-2xl bg-slate-900 border border-slate-800 shadow-inner flex items-center justify-center overflow-hidden">
                  <img
                    src={q.imageRight}
                    alt="Right version"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Right
                </span>
              </div>
            </div>
          )}

          {isSingleImage && (
            <div className="w-full md:w-3/4 lg:w-2/3 flex flex-col items-center gap-2">
              <div className="w-full h-[260px] md:h-[360px] lg:h-[420px] rounded-2xl bg-slate-900 border border-slate-800 shadow-inner flex items-center justify-center overflow-hidden">
                <img
                  src={q.image}
                  alt="Scenario"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Scenario
              </span>
            </div>
          )}
        </section>

        {/* Answer buttons */}
        <footer className="mt-2 flex flex-col items-center gap-3">
          {isDualImage ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
              <button
                onClick={() => submitAnswer("left")}
                disabled={!!answer}
                className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/70 hover:bg-slate-800 text-slate-100 font-semibold text-base md:text-lg transition"
              >
                Left is phishing
              </button>
              <button
                onClick={() => submitAnswer("right")}
                disabled={!!answer}
                className="w-full px-4 py-3 rounded-2xl border border-slate-700 bg-slate-900/70 hover:bg-slate-800 text-slate-100 font-semibold text-base md:text-lg transition"
              >
                Right is phishing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
              <button
                onClick={() => submitAnswer("Safe")}
                disabled={!!answer}
                className="w-full px-4 py-3 rounded-2xl border border-emerald-500/60 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold text-base md:text-lg transition"
              >
                Safe
              </button>
              <button
                onClick={() => submitAnswer("Phishing")}
                disabled={!!answer}
                className="w-full px-4 py-3 rounded-2xl border border-rose-500/70 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold text-base md:text-lg transition"
              >
                Phishing
              </button>
            </div>
          )}

          {feedback && (
            <div
              className={`w-full max-w-xl rounded-2xl border px-4 py-3 text-sm ${
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
        </footer>
      </div>
    </main>
  );
}
