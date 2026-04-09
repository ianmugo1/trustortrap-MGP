// Intro screen for the social media game
export default function IntroScreen({
  onStart,
  hasContent,
  message = "",
  onRetry,
  storyPrompt = "",
}) {
  const acts = [
    { num: "01", title: "Spot the AI Image", desc: "Real photo or AI generated?" },
    { num: "02", title: "Comment Section",   desc: "Find the bot accounts" },
    { num: "03", title: "Privacy Settings",  desc: "Fix your account security" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 p-8 text-center">
        {/* Shield icon */}
        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-5" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <h1 className="text-3xl font-black text-white mb-2">Your Morning Feed</h1>
        <p className="text-slate-400 text-base mb-7 leading-relaxed">
          Every day, fake posts AI generated videos, and bot accounts spread across social media.
          Can you tell us what is real and what is not?
        </p>

        {storyPrompt && (
          <div className="mb-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
            {storyPrompt}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {message}
          </div>
        )}

        {/* Act cards */}
        <div className="grid grid-cols-3 gap-3 mb-8 text-left">
          {acts.map((act) => (
            <div key={act.num} className="rounded-xl bg-slate-800 border border-slate-700 p-3">
              <p className="text-blue-400 font-black text-xl leading-none mb-1">{act.num}</p>
              <p className="font-bold text-slate-200 text-xs mb-0.5">{act.title}</p>
              <p className="text-slate-500 text-xs leading-snug">{act.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onStart}
          disabled={!hasContent}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg transition-colors shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        >
          {hasContent ? "Start" : "No content loaded"}
        </button>

        {!hasContent && onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 w-full rounded-2xl border border-slate-700 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800"
          >
            Retry loading
          </button>
        )}
      </div>
    </main>
  );
}
