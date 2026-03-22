// Results screen shown after all 3 acts are complete
import { ActBar } from "./_components";

// Pick a grade based on percentage score
function getGrade(pct) {
  if (pct === 100) return { label: "Outstanding",     msg: "You did not miss a single thing. You are well prepared to stay safe online." };
  if (pct >= 70)   return { label: "Well done",       msg: "You caught most of the risks. Review the ones you missed and you will be even more prepared." };
  if (pct >= 40)   return { label: "Good effort",     msg: "There are a few things to brush up on. Try again and see if you can improve your score." };
  return                   { label: "Keep practising", msg: "The more you practise, the easier it gets to spot these risks online." };
}

export default function ResultsScreen({ breakdown, totalScore, totalMax, coinsEarned, onRestart }) {
  const pct   = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
  const grade = getGrade(pct);

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 p-8 text-center">
        <ActBar current={3} />

        <h1 className="text-3xl font-black text-white mb-1">{grade.label}</h1>
        <p className="text-slate-400 text-base mb-4 leading-relaxed">{grade.msg}</p>

        {/* Coins earned badge */}
        {coinsEarned !== null && (
          <div className="rounded-2xl bg-amber-500/15 border border-amber-500/30 px-4 py-3 mb-5 flex items-center justify-center gap-2">
            <span className="text-amber-300 font-black text-xl">+{coinsEarned}</span>
            <span className="text-amber-400 font-semibold text-sm">coins earned</span>
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
            <span className="font-bold text-white">{totalScore} / {totalMax}</span>
          </div>
          <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <p className="text-slate-500 text-xs mb-6">
          If you ever see something suspicious online, tell a parent or teacher straight away.
        </p>

        <button
          onClick={onRestart}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-base transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          Play Again
        </button>
      </div>
    </main>
  );
}
