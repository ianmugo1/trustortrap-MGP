import { ActBar } from "./_components";

function BotIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <circle cx="8" cy="16" r="1" />
      <circle cx="16" cy="16" r="1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6" /><path d="M10 22h4" />
      <path d="M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" />
    </svg>
  );
}

const AVATAR_COLORS = [
  "bg-sky-500", "bg-pink-500", "bg-teal-500", "bg-orange-500", "bg-purple-500",
];

export default function ActComments({ scenario, step, totalScenarios, selectedComments, submitted, onToggle, onSubmit, onNext, isLast }) {
  const botCount   = scenario.comments.filter((c) => c.isBot).length;
  const botIndices = new Set(scenario.comments.map((c, i) => c.isBot ? i : -1).filter((i) => i !== -1));
  const foundCount = [...selectedComments].filter((i) => botIndices.has(i)).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-6">
      <div className="max-w-xl mx-auto">
        <ActBar current={1} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-yellow-400/20 flex items-center justify-center text-yellow-400 shrink-0">
            <BotIcon />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-white">Spot the Bots</h2>
            <p className="text-slate-400 text-sm">
              {submitted
                ? "Here are the results!"
                : `There are ${botCount} fake account${botCount !== 1 ? "s" : ""} in these comments. Can you find them?`}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full shrink-0">
            {step + 1}/{totalScenarios}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-800 rounded-full mb-5 overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all duration-500"
            style={{ width: `${((step + (submitted ? 1 : 0)) / totalScenarios) * 100}%` }}
          />
        </div>

        {/* Post card */}
        <div className="bg-slate-800 border-l-4 border-yellow-400 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-slate-900 font-black text-base shrink-0">
              U
            </div>
            <div>
              <p className="font-bold text-white text-sm">User</p>
              <p className="text-slate-500 text-xs">{scenario.post.time}</p>
            </div>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed">{scenario.post.text}</p>
        </div>

        {/* Comments */}
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Comments — tap the fake ones</p>
        <div className="space-y-2 mb-5">
          {scenario.comments.map((comment, index) => {
            const selected = selectedComments.has(index);
            let bg = "bg-slate-800/60";
            let border = "border-l-4 border-slate-700";
            let badge = null;

            if (submitted) {
              if (comment.isBot && selected)  { bg = "bg-emerald-500/10"; border = "border-l-4 border-emerald-500"; badge = <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><CheckIcon /> Bot!</span>; }
              else if (comment.isBot)         { bg = "bg-amber-500/10";   border = "border-l-4 border-amber-400";   badge = <span className="flex items-center gap-1 text-xs font-bold text-amber-400"><BotIcon /> Missed</span>; }
              else if (selected)              { bg = "bg-rose-500/10";    border = "border-l-4 border-rose-500";    badge = <span className="flex items-center gap-1 text-xs font-bold text-rose-400"><XIcon /> Real person</span>; }
            } else if (selected) {
              bg = "bg-yellow-400/10"; border = "border-l-4 border-yellow-400";
              badge = <span className="flex items-center gap-1 text-xs font-bold text-yellow-400"><FlagIcon /> Flagged</span>;
            }

            return (
              <button
                key={index}
                onClick={() => onToggle(index)}
                disabled={submitted}
                aria-pressed={selected}
                className={`w-full text-left rounded-xl ${border} ${bg} px-4 py-3 transition-colors ${
                  !submitted ? "hover:bg-slate-700/50 cursor-pointer" : "cursor-default"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full ${AVATAR_COLORS[index % AVATAR_COLORS.length]} flex items-center justify-center text-white font-black text-sm shrink-0`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-white text-sm">User{index + 1}</span>
                      {badge}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit / results */}
        {!submitted ? (
          <button
            onClick={onSubmit}
            disabled={selectedComments.size === 0}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 rounded-xl font-bold text-base transition-colors"
          >
            Lock In Answer
          </button>
        ) : (
          <div className="space-y-3">
            <div className={`rounded-xl px-4 py-3 font-bold text-sm border flex items-center gap-2 ${
              foundCount === botCount
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : "bg-amber-500/15 border-amber-500/40 text-amber-300"
            }`}>
              {foundCount === botCount ? <CheckIcon /> : <BotIcon />}
              {foundCount === botCount
                ? `You caught all ${botCount} bot${botCount !== 1 ? "s" : ""}!`
                : `You got ${foundCount} of ${botCount}. The orange ones are the ones you missed.`}
            </div>

            <div className="bg-slate-800 border border-slate-700/40 rounded-xl p-4 flex gap-3">
              <div className="text-yellow-400 shrink-0 mt-0.5"><LightbulbIcon /></div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-yellow-400 mb-1">Tip</p>
                <p className="text-slate-300 text-sm leading-relaxed">{scenario.tip}</p>
              </div>
            </div>

            <button
              onClick={onNext}
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl font-bold text-base transition-colors"
            >
              {isLast ? "Continue to Act 3" : "Next Post"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
