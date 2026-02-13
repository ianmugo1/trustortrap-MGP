"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";

function barWidth(value) {
  return `${Math.max(0, Math.min(100, Number(value) || 0))}%`;
}

function getFirstUnansweredIndex(questions) {
  const idx = questions.findIndex((q) => q.userAnswerIndex === null || q.userAnswerIndex === undefined);
  return idx === -1 ? 0 : idx;
}

export default function CyberPetPage() {
  const { token } = useAuth();

  const [pet, setPet] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const questions = useMemo(() => (Array.isArray(pet?.dailyQuestions) ? pet.dailyQuestions : []), [pet]);
  const question = questions[currentIndex];

  const loadPet = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setLoadError("");

    try {
      const res = await authFetch("/api/cyberpet", {}, token);
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setLoadError(data?.message || "Failed to load cyber pet");
        setPet(null);
        return;
      }

      const nextPet = data.pet;
      setPet(nextPet);
      setCurrentIndex(getFirstUnansweredIndex(nextPet.dailyQuestions || []));
      setFeedback(null);
    } catch (err) {
      console.error(err);
      setLoadError("Could not reach the API. Is the server running?");
      setPet(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPet();
  }, [loadPet]);

  const handleAnswer = useCallback(
    async (answerIndex) => {
      if (!token || !question || submitting) return;
      if (question.userAnswerIndex !== null && question.userAnswerIndex !== undefined) return;

      setSubmitting(true);
      setFeedback(null);

      try {
        const res = await authFetch(
          "/api/cyberpet/answer",
          {
            method: "POST",
            body: JSON.stringify({
              questionIndex: currentIndex,
              answerIndex,
            }),
          },
          token
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.success) {
          setFeedback({
            isCorrect: false,
            explanation: data?.message || "Failed to submit answer",
            isError: true,
          });
          return;
        }

        setPet(data.pet);
        setFeedback({
          isCorrect: !!data?.result?.isCorrect,
          explanation: data?.result?.explanation || "",
          isError: false,
        });
      } catch (err) {
        console.error(err);
        setFeedback({
          isCorrect: false,
          explanation: "Network error. Please try again.",
          isError: true,
        });
      } finally {
        setSubmitting(false);
      }
    },
    [currentIndex, question, submitting, token]
  );

  const answeredCount = pet?.dailyProgress?.answeredCount || 0;
  const correctCount = pet?.dailyProgress?.correctCount || 0;
  const finishedAll = answeredCount >= 5;

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
            onClick={loadPet}
            className="px-5 py-2 rounded-lg bg-emerald-500 text-black font-medium"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!pet || !question) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-4">
        <p className="text-slate-300 text-sm">No daily questions available.</p>
      </main>
    );
  }

  const selectedIndex = question.userAnswerIndex;
  const isQuestionLocked = selectedIndex !== null && selectedIndex !== undefined;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="mx-auto w-full max-w-3xl space-y-5">
        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-sm uppercase tracking-wide text-emerald-300">Cyber Pet</p>
          <h1 className="mt-1 text-3xl font-bold">Byte</h1>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <p>Health</p>
                <p>{pet.health}/100</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full bg-emerald-400" style={{ width: barWidth(pet.health) }} />
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <p>Happiness</p>
                <p>{pet.happiness}/100</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-700 overflow-hidden">
                <div className="h-full bg-cyan-400" style={{ width: barWidth(pet.happiness) }} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold">Daily Questions (5)</h2>
            <p className="text-xs text-slate-400">
              Progress: {answeredCount}/5 answered · {correctCount} correct
            </p>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded overflow-hidden mb-5">
            <div className="h-full bg-emerald-500" style={{ width: `${(answeredCount / 5) * 100}%` }} />
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4 mb-4">
            <p className="text-xs text-slate-400 mb-2">Q{currentIndex + 1} of 5</p>
            <p className="text-base md:text-lg">{question.text}</p>
          </div>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedIndex === index;
              const correctOption = question.correctIndex === index;

              let stateClass = "border-slate-700 bg-slate-800 hover:bg-slate-700";
              if (isQuestionLocked && correctOption) {
                stateClass = "border-emerald-500 bg-emerald-500/10";
              } else if (isQuestionLocked && isSelected && !correctOption) {
                stateClass = "border-rose-500 bg-rose-500/10";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  disabled={isQuestionLocked || submitting}
                  className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition ${stateClass} disabled:opacity-80 disabled:cursor-not-allowed`}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {feedback && (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                feedback.isError
                  ? "border-rose-500/40 bg-rose-500/10 text-rose-200"
                  : feedback.isCorrect
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-100"
              }`}
            >
              <p className="font-semibold">
                {feedback.isError ? "Could not submit" : feedback.isCorrect ? "Correct" : "Incorrect"}
              </p>
              {feedback.explanation && <p className="mt-1">{feedback.explanation}</p>}
            </div>
          )}

          {isQuestionLocked && !finishedAll && (
            <button
              onClick={() => {
                const next = Math.min(currentIndex + 1, 4);
                setCurrentIndex(next);
                setFeedback(null);
              }}
              className="mt-4 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Next Question
            </button>
          )}

          {finishedAll && (
            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-200">
              Daily session complete. Come back tomorrow for a new set of 5 questions.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
