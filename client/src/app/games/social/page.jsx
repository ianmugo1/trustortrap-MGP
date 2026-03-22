"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";

import IntroScreen from "./_IntroScreen";
import ActAiImage from "./_ActAiImage";
import ActComments from "./_ActComments";
import ActPrivacy from "./_ActPrivacy";
import ResultsScreen from "./_ResultsScreen";

export default function SocialGamePage() {
  const { token, refreshUser } = useAuth();

  // Game content from MongoDB
  const [gameData, setGameData] = useState({ aiImages: [], commentScenarios: [], settings: [], loaded: false, error: false });

  // Game phase + coins
  const [phase, setPhase]             = useState("intro");
  const [coinsEarned, setCoinsEarned] = useState(null);

  // Act 1 state
  const [storyStep, setStoryStep]     = useState(0);
  const [storyAnswer, setStoryAnswer] = useState(null);
  const [act1Correct, setAct1Correct] = useState(0);

  // Act 2 state
  const [act2Step, setAct2Step]                 = useState(0);
  const [selectedComments, setSelectedComments] = useState(new Set());
  const [act2Submitted, setAct2Submitted]       = useState(false);
  const [act2TotalCorrect, setAct2TotalCorrect] = useState(0);

  // Act 3 state
  const [toggles, setToggles]             = useState({});
  const [act3Submitted, setAct3Submitted] = useState(false);

  // Fetch questions on mount
  useEffect(() => {
    async function load() {
      try {
        const res  = await authFetch("/api/social/questions", {}, token);
        const data = await res.json();
        if (!data.success) throw new Error("Failed to load");
        setGameData({ ...data, loaded: true, error: false });
        setToggles(Object.fromEntries(data.settings.map((s) => [s._id, false])));
      } catch {
        setGameData((prev) => ({ ...prev, loaded: true, error: true }));
      }
    }
    if (token) load();
    else setGameData((prev) => ({ ...prev, loaded: true }));
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
    setStoryStep(0); setStoryAnswer(null); setAct1Correct(0);
    setAct2Step(0); setSelectedComments(new Set()); setAct2Submitted(false); setAct2TotalCorrect(0);
    setToggles(Object.fromEntries(settings.map((s) => [s._id, false])));
    setAct3Submitted(false);
  }

  async function submitGame(score) {
    if (!token) return;
    try {
      const res  = await authFetch("/api/social/complete", { method: "POST", body: JSON.stringify({ totalScore: score }) }, token);
      const data = await res.json();
      if (data.success) { setCoinsEarned(data.coinsEarned + data.completionBonus); await refreshUser(); }
    } catch (err) { console.error("Social game submit error:", err); }
  }

  // ── Render ────────────────────────────────────────────────────────────

  // Loading
  if (!gameData.loaded) return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-slate-400 text-sm">Loading game...</p>
    </main>
  );

  // Error
  if (gameData.error) return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-rose-400 font-semibold mb-2">Could not load game content.</p>
        <p className="text-slate-500 text-sm">Please refresh the page and try again.</p>
      </div>
    </main>
  );

  // Intro
  if (phase === "intro") return <IntroScreen onStart={() => setPhase("act1")} hasContent={aiImages.length > 0} />;

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
      onSave={() => setAct3Submitted(true)}
      onViewResults={() => { submitGame(totalScore); setPhase("results"); }}
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
      onRestart={handleRestart}
    />
  );

  return null;
}
