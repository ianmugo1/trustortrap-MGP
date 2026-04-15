"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";
import { getStoryChapter } from "@/lib/storyChapters";

import IntroScreen from "./_IntroScreen";
import ActAiImage from "./_ActAiImage";
import ActComments from "./_ActComments";
import ActPrivacy from "./_ActPrivacy";
import ResultsScreen from "./_ResultsScreen";
import ReviewScreen from "./_ReviewScreen";

function formatSocialMessage(message, fallback) {
  const raw = String(message || "").trim();
  if (!raw) return fallback;

  if (raw.includes("Unable to reach the API server")) {
    return raw;
  }

  const normalized = raw.toLowerCase();
  if (normalized.includes("failed to load")) {
    return "The social game content could not be loaded right now.";
  }

  return raw;
}

export default function SocialGamePage() {
  const { token, refreshUser } = useAuth();

  // Game content from MongoDB
  const [gameData, setGameData] = useState({
    aiImages: [],
    commentScenarios: [],
    settings: [],
    loaded: false,
    error: "",
  });
  const [rewardStatus, setRewardStatus] = useState({ message: "", tone: "info" });
  const [storyPrompt, setStoryPrompt] = useState("");

  // Game phase + coins
  const [phase, setPhase]             = useState("intro");
  const [coinsEarned, setCoinsEarned] = useState(null);

  // Act 1 state
  const [storyStep, setStoryStep]     = useState(0);
  const [storyAnswer, setStoryAnswer] = useState(null);
  const [act1Correct, setAct1Correct] = useState(0);
  const [act1Review, setAct1Review]   = useState([]);
  const [act1Answers, setAct1Answers] = useState([]);

  // Act 2 state
  const [act2Step, setAct2Step]                 = useState(0);
  const [selectedComments, setSelectedComments] = useState(new Set());
  const [act2Submitted, setAct2Submitted]       = useState(false);
  const [act2TotalCorrect, setAct2TotalCorrect] = useState(0);
  const [act2Review, setAct2Review]             = useState([]);
  const [act2Answers, setAct2Answers]           = useState([]);

  // Act 3 state
  const [toggles, setToggles]             = useState({});
  const [act3Submitted, setAct3Submitted] = useState(false);
  const [act3Review, setAct3Review]       = useState([]);

  // Fetch questions on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("fromStory");
    if (!slug) return;

    const story = getStoryChapter(slug);
    if (!story) return;

    setStoryPrompt(`You came from "${story.title}". Use this challenge to practice what that story just taught.`);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res  = await authFetch("/api/social/questions", {}, token);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Failed to load");
        }
        setGameData({ ...data, loaded: true, error: "" });
        setToggles(Object.fromEntries(data.settings.map((s) => [s._id, false])));
      } catch (err) {
        setGameData((prev) => ({
          ...prev,
          loaded: true,
          error: formatSocialMessage(err?.message, "The social game content could not be loaded right now."),
        }));
      }
    }
    if (token) load();
    else setGameData((prev) => ({ ...prev, loaded: true, error: "" }));
  }, [token]);

  // Derived scores
  const { aiImages, commentScenarios, settings } = gameData;
  const act2Max    = commentScenarios.reduce((sum, s) => sum + s.comments.filter((c) => c.isBot).length, 0);
  const act3Max    = settings.filter((s) => s.dangerous).length;
  const totalMax   = aiImages.length + act2Max + act3Max;
  const act3Score  = settings.filter((s) => s.dangerous && toggles[s._id]).length;
  const totalScore = act1Correct + act2TotalCorrect + act3Score;

  // ── Handlers ──────────────────────────────────────────────────────────

  function handleStoryAnswer(choice) {
    if (storyAnswer !== null) return;
    const img     = aiImages[storyStep];
    const correct = img.type === "side-by-side" ? choice === img.realSide : (choice === "ai") === img.isAI;
    setStoryAnswer(correct ? "correct" : "wrong");
    if (correct) setAct1Correct((n) => n + 1);
    setAct1Answers((prev) => [...prev, { id: img._id, choice }]);

    const correctAnswer = img.type === "side-by-side"
      ? `${img.realSide === "left" ? "Left" : "Right"} is real`
      : img.isAI
        ? "AI made it"
        : "Real photo";
    const userAnswer = img.type === "side-by-side"
      ? `${choice === "left" ? "Left" : "Right"} is real`
      : choice === "ai"
        ? "AI made it"
        : "Real photo";

    setAct1Review((prev) => [
      ...prev,
      {
        subject: img.subject,
        userAnswer,
        correctAnswer,
        tell: img.tell,
        isCorrect: correct,
      },
    ]);
  }

  function handleStoryNext() {
    if (storyStep + 1 >= aiImages.length) setPhase("act2");
    else { setStoryStep((s) => s + 1); setStoryAnswer(null); }
  }

  function toggleComment(id) {
    if (act2Submitted) return;
    setSelectedComments((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleAct2Submit() {
    const bots    = new Set(commentScenarios[act2Step].comments.map((c, i) => c.isBot ? i : -1).filter((i) => i !== -1));
    const correct = [...selectedComments].filter((i) => bots.has(i)).length;
    const scenario = commentScenarios[act2Step];

    setAct2Review((prev) => [
      ...prev,
      {
        postText: scenario.post.text,
        selected: [...selectedComments].map((i) => `User${i + 1}`),
        correct: [...bots].map((i) => `User${i + 1}`),
        tip: scenario.tip,
      },
    ]);
    setAct2Answers((prev) => [
      ...prev,
      { id: scenario._id, selectedIndexes: [...selectedComments] },
    ]);
    setAct2TotalCorrect((n) => n + correct);
    setAct2Submitted(true);
  }

  function handleAct2Next() {
    if (act2Step + 1 >= commentScenarios.length) setPhase("act3");
    else { setAct2Step((s) => s + 1); setSelectedComments(new Set()); setAct2Submitted(false); }
  }

  function handleRestart() {
    setPhase("intro");
    setCoinsEarned(null);
    setRewardStatus({ message: "", tone: "info" });
    setStoryStep(0); setStoryAnswer(null); setAct1Correct(0);
    setAct1Review([]);
    setAct1Answers([]);
    setAct2Step(0); setSelectedComments(new Set()); setAct2Submitted(false); setAct2TotalCorrect(0);
    setAct2Review([]);
    setAct2Answers([]);
    setToggles(Object.fromEntries(settings.map((s) => [s._id, false])));
    setAct3Submitted(false);
    setAct3Review([]);
  }

  async function submitGame(score) {
    if (!token) return;
    try {
      const res  = await authFetch(
        "/api/social/complete",
        {
          method: "POST",
          body: JSON.stringify({
            aiAnswers: act1Answers,
            commentAnswers: act2Answers,
            privacyAnswers: settings.map((setting) => ({
              id: setting._id,
              enabled: Boolean(toggles[setting._id]),
            })),
          }),
        },
        token
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        setCoinsEarned(data.coinsEarned + data.completionBonus);
        setRewardStatus({ message: "Rewards saved successfully.", tone: "info" });
        await refreshUser();
        return;
      }

      setRewardStatus({
        message: formatSocialMessage(
          data?.message,
          "Your score was shown, but the reward could not be saved."
        ),
        tone: "warning",
      });
    } catch (err) {
      console.error("Social game submit error:", err);
      setRewardStatus({
        message: formatSocialMessage(
          err?.message,
          "Your score was shown, but the reward could not be saved."
        ),
        tone: "warning",
      });
    }
  }

  // ── Render ────────────────────────────────────────────────────────────

  // Loading
  if (!gameData.loaded) return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-slate-400 text-sm">Loading game...</p>
    </main>
  );

  if (!token) return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 text-center">
        <p className="text-lg font-semibold text-white">Please sign in to play.</p>
        <p className="mt-2 text-sm text-slate-400">
          The social challenge needs an active account so it can save your progress.
        </p>
      </div>
    </main>
  );

  // Error
  if (gameData.error) return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 text-center">
        <p className="text-rose-400 font-semibold mb-2">Could not load game content.</p>
        <p className="text-slate-400 text-sm mb-4">{gameData.error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
        >
          Retry
        </button>
      </div>
    </main>
  );

  // Intro
  if (phase === "intro") return (
    <IntroScreen
      onStart={() => setPhase("act1")}
      hasContent={aiImages.length > 0}
      storyPrompt={storyPrompt}
      message={
        aiImages.length > 0
          ? ""
          : "The game needs seeded social content before it can start."
      }
      onRetry={() => window.location.reload()}
    />
  );

  // Act 1 — Spot the AI image
  if (phase === "act1") return (
    <ActAiImage image={aiImages[storyStep]} storyStep={storyStep} totalImages={aiImages.length} storyAnswer={storyAnswer} onAnswer={handleStoryAnswer} onNext={handleStoryNext} />
  );

  // Act 2 — Comment section
  if (phase === "act2") return (
    <ActComments scenario={commentScenarios[act2Step]} step={act2Step} totalScenarios={commentScenarios.length} selectedComments={selectedComments} submitted={act2Submitted} onToggle={toggleComment} onSubmit={handleAct2Submit} onNext={handleAct2Next} isLast={act2Step + 1 >= commentScenarios.length} />
  );

  // Act 3 — Privacy settings
  if (phase === "act3") return (
    <ActPrivacy
      settings={settings}
      toggles={toggles}
      submitted={act3Submitted}
      onToggle={(id) => { if (!act3Submitted) setToggles((prev) => ({ ...prev, [id]: !prev[id] })); }}
      onSave={() => {
        setAct3Review(
          settings
            .filter((setting) => setting.dangerous)
            .map((setting) => ({
              label: setting.label,
              current: setting.current,
              safe: setting.safe,
              fixed: !!toggles[setting._id],
              tip: setting.tip,
            }))
        );
        setAct3Submitted(true);
      }}
      onViewResults={() => { submitGame(totalScore); setPhase("results"); }}
    />
  );

  if (phase === "review") return (
    <ReviewScreen
      review={{
        aiImages: act1Review,
        commentScenarios: act2Review,
        privacy: act3Review,
      }}
      onBack={() => setPhase("results")}
      onRestart={handleRestart}
    />
  );

  // Results
  if (phase === "results") return (
    <ResultsScreen
      breakdown={[
        { label: "Spot the AI Image", score: act1Correct,      max: aiImages.length },
        { label: "Comment Section",   score: act2TotalCorrect, max: act2Max },
        { label: "Privacy Settings",  score: act3Score,        max: act3Max },
      ]}
      totalScore={totalScore}
      totalMax={totalMax}
      coinsEarned={coinsEarned}
      rewardMessage={rewardStatus.message}
      rewardMessageTone={rewardStatus.tone}
      onReview={() => setPhase("review")}
      onRestart={handleRestart}
    />
  );

  return null;
}
