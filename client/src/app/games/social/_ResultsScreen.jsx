// Results screen shown after all 3 acts are complete
import { ActBar } from "./_components";
import { motion } from "motion/react";
import { Confetti, CountUp, ProgressBar } from "@/components/motion";

// Pick a grade based on percentage score
function getGrade(pct) {
  if (pct === 100) return { label: "Outstanding",     msg: "You did not miss a single thing. You are well prepared to stay safe online." };
  if (pct >= 70)   return { label: "Well done",       msg: "You caught most of the risks. Review the ones you missed and you will be even more prepared." };
  if (pct >= 40)   return { label: "Good effort",     msg: "There are a few things to brush up on. Try again and see if you can improve your score." };
  return                   { label: "Keep practising", msg: "The more you practise, the easier it gets to spot these risks online." };
}

export default function ResultsScreen({
  breakdown,
  totalScore,
  totalMax,
  coinsEarned,
  rewardMessage = "",
  rewardMessageTone = "info",
  onReview,
  onRestart,
}) {
  const pct   = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  const grade = getGrade(pct);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <Confetti fire={pct >= 70} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="tt-card max-w-md w-full p-8 text-center"
      >
        <ActBar current={3} />

        <h1 className="text-3xl font-black text-white mb-1">{grade.label}</h1>
        <p className="text-slate-400 text-base mb-4 leading-relaxed">{grade.msg}</p>

        {/* Coins earned badge */}
        {coinsEarned !== null && (
          <div className="rounded-2xl bg-amber-500/15 border border-amber-500/30 px-4 py-3 mb-5 flex items-center justify-center gap-2">
            <span className="text-amber-300 font-black text-xl">+<CountUp value={coinsEarned} /></span>
            <span className="text-amber-400 font-semibold text-sm">coins earned</span>
          </div>
        )}

        {rewardMessage && (
          <div
            className={`mb-5 rounded-2xl border px-4 py-3 text-sm ${
              rewardMessageTone === "warning"
                ? "border-amber-500/30 bg-amber-500/10 text-amber-100"
                : "border-slate-700 bg-slate-800 text-slate-200"
            }`}
          >
            {rewardMessage}
          </div>
        )}

        {/* Per-act breakdown */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {breakdown.map((act) => (
            <div key={act.label} className="rounded-xl bg-slate-800 border border-slate-700 p-3 text-left">
              <p className="text-2xl font-black text-blue-400 leading-none">
                {act.score}<span className="text-base text-slate-500 font-normal">/{act.max}</span>
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-tight">{act.label}</p>
            </div>
          ))}
        </div>

        {/* Overall progress bar */}
        <div className="rounded-xl bg-slate-800 border border-slate-700 p-4 mb-5 text-left">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">Overall score</span>
            <span className="font-bold text-white"><CountUp value={totalScore} /> / {totalMax}</span>
          </div>
          <ProgressBar percent={pct} />
        </div>

        <p className="text-slate-500 text-xs mb-6">
          If you ever see something suspicious online, tell a parent or teacher straight away.
        </p>

        <div className="space-y-3">
          <button
            onClick={onReview}
            className="w-full rounded-2xl border border-slate-600 bg-slate-950 py-3.5 text-base font-bold text-white transition-colors hover:bg-slate-800"
          >
            Review answers
          </button>
          <button
            onClick={onRestart}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-base transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
          >
            Play Again
          </button>
        </div>
      </motion.div>
    </main>
  );
}
