"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";
import { getStoryChapter } from "@/lib/storyChapters";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, Flame, Search, X } from "lucide-react";
import { AnswerFeedback, Confetti, CountUp, ProgressBar } from "@/components/motion";
import ReviewScreen from "./_ReviewScreen";

function formatGameMessage(message, fallback) {
  const raw = String(message || "").trim();
  if (!raw) return fallback;

  if (raw.includes("Unable to reach the API server")) {
    return raw;
  }

  const normalized = raw.toLowerCase();
  if (normalized.includes("failed to load questions")) {
    return "The phishing questions could not be loaded right now.";
  }
  if (normalized.includes("failed to complete run")) {
    return "Your score was shown, but the reward could not be saved.";
  }

  return raw;
}

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
  const [storyPrompt, setStoryPrompt] = useState("");
  const [showReview, setShowReview] = useState(false);
  const [answerHistory, setAnswerHistory] = useState([]);
  const [combo, setCombo] = useState(0);

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
    setShowReview(false);
    setAnswerHistory([]);
    setCombo(0);
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
        setLoadError(
          formatGameMessage(data?.message, "The phishing questions could not be loaded right now.")
        );
        return;
      }

      const list = Array.isArray(data.questions) ? data.questions : [];
      setQuestions(list);
      setStep(0);
      setScore(0);
      setAnswer(null);
      setFeedback(null);
      setCompletionInfo(null);
      setShowReview(false);
      setAnswerHistory([]);
    } catch (err) {
      console.error(err);
      setQuestions([]);
      setLoadError(formatGameMessage(err?.message, "Could not reach the API."));
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("fromStory");
    if (!slug) return;

    const story = getStoryChapter(slug);
    if (!story) return;

    setStoryPrompt(`You came from "${story.title}". Look for the same warning signs in this practice round.`);
  }, []);

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
            body: JSON.stringify({
              answers: answerHistory.map((entry) => ({
                questionId: entry.question?._id,
                answerGiven: entry.userAnswer,
              })),
            }),
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
            message: formatGameMessage(
              data?.message,
              "Your score was shown, but the reward could not be saved."
            ),
          });
        }
      } catch (err) {
        console.error(err);
        setCompletionInfo({
          success: false,
          message: formatGameMessage(
            err?.message,
            "Your score was shown, but the reward could not be saved."
          ),
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
          const isCorrect = !!data.correct;

          setAnswerHistory((prev) => [
            ...prev,
            {
              question: q,
              userAnswer: choice,
              isCorrect,
            },
          ]);

          if (data.correct) {
            setScore((prev) => prev + (data.pointsAwarded || 0));
          }
          setCombo((prev) => (isCorrect ? prev + 1 : 0));
          setFeedback({
            isCorrect,
            explanation: q.explanation || "",
          });
        } else {
          setAnswerHistory((prev) => [
            ...prev,
            {
              question: q,
              userAnswer: choice,
              isCorrect: false,
            },
          ]);
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
        setSubmitting(false);
      }
    },
    [answer, questions, step, submitting, token]
  );

  // The player reads the explanation, then moves on when ready
  const nextQuestion = useCallback(() => {
    setStep((s) => s + 1);
    setAnswer(null);
    setFeedback(null);
  }, []);

  if (showReview) {
    return (
      <ReviewScreen
        answers={answerHistory}
        onBack={() => setShowReview(false)}
        onPlayAgain={() => {
          resetLocal();
          loadQuestions();
        }}
      />
    );
  }

  // ====== UI states ======

  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white px-4">
        <p className="rounded-2xl border border-slate-700 bg-slate-900 px-6 py-4">
          Please log in to play.
        </p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white px-4">
        <p className="rounded-2xl border border-slate-700 bg-slate-900 px-6 py-4 text-slate-400 text-sm">
          Loading questions...
        </p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white px-4">
        <div className="max-w-md w-full rounded-3xl border border-slate-700 bg-slate-900 p-6 text-center shadow-2xl">
          <h1 className="text-xl font-semibold mb-2 text-rose-400">Couldn’t load the game</h1>
          <p className="text-slate-400 text-sm mb-4">{loadError}</p>
          <button
            onClick={() => {
              resetLocal();
              loadQuestions();
            }}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  if (!questions.length) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white px-4">
        <p className="rounded-2xl border border-slate-700 bg-slate-900 px-6 py-4 text-slate-400 text-sm">
          No questions found.
        </p>
      </main>
    );
  }

  if (!gameStarted) {
    return (
      <main className="min-h-full flex items-center justify-center text-white px-4 py-10">
        <div className="tt-card max-w-lg w-full p-8 text-center">
          <h1 className="tt-gradient-text text-3xl md:text-4xl font-black mb-4">
            Phishing Awareness
          </h1>
          <p className="text-slate-200 mb-6">
            Test your ability to spot phishing attempts. You get {total} scenarios and pick the
            safest response for each one.
          </p>
          {storyPrompt && (
            <div className="mb-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
              {storyPrompt}
            </div>
          )}
          <div className="text-sky-100/90 text-sm mb-6 space-y-1">
            <p>{total} questions, picked fresh each run</p>
            <p>+10 coins per correct answer</p>
            <p>+20 bonus coins on completion</p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <button onClick={() => setGameStarted(true)} className="tt-btn px-9 text-lg">
              Start
            </button>
            <Link href="/games/phishing/hunt" className="tt-btn tt-btn-ghost text-sm">
              <Search className="h-4 w-4" /> Try red flag hunt
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (isFinished) {
    const perfect = score === total * 10;

    return (
      <main className="min-h-full flex items-center justify-center text-white px-4 py-10">
        <Confetti fire={perfect} />
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="tt-card p-8 text-center max-w-md w-full"
        >
          <h1 className="tt-gradient-text text-3xl font-black mb-3">
            {perfect ? "Perfect run!" : "Training complete"}
          </h1>

          <p className="text-6xl font-black text-white">
            <CountUp value={score} />
          </p>
          <p className="mb-4 text-sm text-slate-400">out of {total * 10}</p>

          {completionInfo?.success ? (
            <div className="mb-6 flex justify-center gap-3 text-sm font-semibold">
              <span className="rounded-full bg-amber-400/15 px-3 py-1 text-amber-300">
                +{completionInfo.completionBonus} coins
              </span>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-300">
                +{completionInfo.xpAwarded} XP
              </span>
            </div>
          ) : (
            <p className="text-slate-300 mb-6">Finalising your rewards...</p>
          )}

          {completionInfo?.success === false && completionInfo?.message && (
            <p className="text-rose-300 text-sm mb-4">{completionInfo.message}</p>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={() => setShowReview(true)} className="tt-btn tt-btn-ghost">
              Review answers
            </button>
            <button
              onClick={() => {
                resetLocal();
                loadQuestions();
              }}
              className="tt-btn"
            >
              Play again
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  // ====== Game render ======
  const q = questions[step];
  const progress = total ? Math.round((step / total) * 100) : 0;
  const options = q?.options || [];
  const optionLabels = ["A", "B", "C", "D"];
  const isLocked = submitting || answer !== null;
  const correctIndex = typeof q?.correctOption === "number" ? q.correctOption : null;

  // Colour each option once the answer is in
  const optionStyle = (index) => {
    if (!feedback) {
      return answer === index
        ? "border-cyan-300 bg-cyan-500/15"
        : "border-slate-700 bg-slate-800/70 hover:border-cyan-400/50 hover:bg-slate-700/70";
    }
    if (index === correctIndex || (feedback.isCorrect && index === answer)) {
      return "border-emerald-400 bg-emerald-500/15";
    }
    if (index === answer) return "border-rose-400 bg-rose-500/15";
    return "border-slate-800 bg-slate-800/40 opacity-50";
  };

  return (
    <main className="min-h-full text-white">
      <div className="mx-auto w-full max-w-5xl grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4 md:gap-6 px-3 sm:px-4 md:px-6 py-4 md:py-6">
        <section className="tt-card p-4 sm:p-6 md:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h1 className="tt-gradient-text text-xl md:text-3xl font-black">
                  Phishing Awareness
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-sky-100/80">
                  Spot the scam before it catches you.
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-slate-300">Question</p>
                <p className="text-sm font-bold text-cyan-100">
                  {step + 1} / {total}
                </p>
              </div>
            </div>
            <ProgressBar percent={progress} />
          </div>

          {/* The question slides out and the next one slides in */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.22 }}
            >
              <div className="mb-6 bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-700/70">
                <p className="text-base md:text-lg leading-relaxed text-slate-100">{q?.text}</p>
              </div>

              <AnswerFeedback
                state={feedback ? (feedback.isCorrect ? "correct" : "wrong") : null}
                className="space-y-3 mb-4"
              >
                {options.map((option, index) => (
                  <button
                    key={index}
                    disabled={isLocked}
                    onClick={() => submitAnswer(index)}
                    className={`flex w-full min-h-[52px] items-center text-left p-3.5 sm:p-4 rounded-2xl border ${optionStyle(index)}`}
                  >
                    <span className="inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-lg text-sm font-bold mr-3 bg-slate-950/70 text-cyan-200">
                      {optionLabels[index]}
                    </span>
                    <span className="flex-1 text-sm sm:text-base text-slate-100">{option}</span>
                    {feedback && (index === correctIndex || (feedback.isCorrect && index === answer)) && (
                      <Check className="h-5 w-5 text-emerald-300" />
                    )}
                    {feedback && !feedback.isCorrect && index === answer && (
                      <X className="h-5 w-5 text-rose-300" />
                    )}
                  </button>
                ))}
              </AnswerFeedback>

              {/* Feedback, with the reason, then the player chooses when to go on */}
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border px-4 py-3 text-sm ${
                    feedback.isCorrect
                      ? "border-emerald-300/40 bg-emerald-400/10 text-emerald-100"
                      : "border-rose-300/40 bg-rose-400/10 text-rose-100"
                  }`}
                >
                  <p className="font-semibold">{feedback.isCorrect ? "Correct! +10 coins" : "Not quite."}</p>
                  {feedback.explanation && (
                    <p className="mt-1 text-sm text-slate-100/90">{feedback.explanation}</p>
                  )}
                  <button onClick={nextQuestion} autoFocus className="tt-btn mt-3 w-full sm:w-auto">
                    {step + 1 === total ? "See results" : "Next question"}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </section>

        <aside className="tt-card p-4 sm:p-6 h-fit">
          <h2 className="text-lg font-extrabold text-indigo-100 mb-4">This run</h2>
          <div className="space-y-3 text-sm">
            <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-3">
              <p className="text-slate-300 text-xs uppercase tracking-wide">Coins</p>
              <p className="text-2xl font-black text-amber-300">
                <CountUp value={score} duration={0.4} />
              </p>
            </div>
            <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-3">
              <p className="text-slate-300 text-xs uppercase tracking-wide">Streak</p>
              <p className="flex items-center gap-2 text-2xl font-black text-orange-300">
                <Flame className={`h-6 w-6 ${combo >= 2 ? "tt-flame" : "opacity-40"}`} />
                {combo}
                <span className="text-xs font-semibold text-slate-400">in a row</span>
              </p>
            </div>
            <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-3">
              <p className="text-slate-300 text-xs uppercase tracking-wide">Tip</p>
              <p className="text-slate-100">Check who sent it, and never rush because a message says so.</p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
