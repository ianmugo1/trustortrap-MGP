const GAME_LABELS = {
  trueFalse: "True / False",
  passwordStrengthener: "Password Rater",
  fillBlanks: "Fill the Blank",
};

function getAnswerText(gameType, question, answer) {
  if (answer === null || typeof answer === "undefined") {
    return "See explanation";
  }

  if (gameType === "trueFalse") {
    return answer ? "True" : "False";
  }

  if (gameType === "passwordStrengthener") {
    return ["Weak", "OK", "Strong"][answer] || "No answer";
  }

  return Array.isArray(question?.options) ? question.options[answer] || "No answer" : "No answer";
}

export default function ReviewScreen({ reviewHistory, onClose }) {
  const entries = Object.entries(reviewHistory || {}).filter(([, items]) => items.length > 0);

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-cyan-300">Review today</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Look at the questions you answered</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Review mode shows your answer, the correct answer, and the explanation from each mini-game.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Close review
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-400">
          Answer a few questions first, then review will appear here.
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          {entries.map(([gameType, items]) => (
            <section key={gameType} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
              <h3 className="text-lg font-semibold text-white">{GAME_LABELS[gameType] || gameType}</h3>
              <div className="mt-4 space-y-4">
                {items.map((item, index) => (
                  <div key={`${item.question.id}-${index}`} className="rounded-2xl border border-slate-700 bg-slate-900 p-4">
                    <p className="text-sm font-semibold text-white">{item.question.prompt}</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className={`rounded-xl border p-4 ${item.isCorrect ? "border-emerald-500/30 bg-emerald-500/10" : "border-rose-500/30 bg-rose-500/10"}`}>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                          Your answer
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {getAnswerText(gameType, item.question, item.userAnswer)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                          Better answer
                        </p>
                        <p className="mt-2 text-sm text-white">
                          {getAnswerText(gameType, item.question, item.correctAnswer)}
                        </p>
                      </div>
                    </div>
                    {item.explanation && (
                      <div className="mt-3 rounded-xl border border-slate-700 bg-slate-950/70 p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Explanation
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{item.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
