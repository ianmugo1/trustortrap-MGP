function ChoiceCard({ title, value, tone = "neutral" }) {
  const styles =
    tone === "good"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
      : tone === "bad"
        ? "border-rose-500/30 bg-rose-500/10 text-rose-100"
        : "border-slate-700 bg-slate-950/70 text-slate-200";

  return (
    <div className={`rounded-2xl border p-4 ${styles}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-80">{title}</p>
      <p className="mt-2 text-sm leading-6">{value}</p>
    </div>
  );
}

export default function ReviewScreen({ review, onBack, onRestart }) {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-sm font-medium text-blue-300">Review your run</p>
          <h1 className="mt-2 text-3xl font-black text-white">Look back at each act</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            This review shows what you chose in each act and the signal you should look for next time.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Act 1
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Spot the AI Image</h2>
          <div className="mt-4 space-y-4">
            {review.aiImages.map((item, index) => (
              <div key={`${item.subject}-${index}`} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                <p className="text-sm font-semibold text-white">{item.subject}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <ChoiceCard title="Your answer" value={item.userAnswer} tone={item.isCorrect ? "good" : "bad"} />
                  <ChoiceCard title="Correct answer" value={item.correctAnswer} tone="good" />
                </div>
                <ChoiceCard title="What to notice" value={item.tell} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Act 2
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Spot the Bots</h2>
          <div className="mt-4 space-y-4">
            {review.commentScenarios.map((item, index) => (
              <div key={`${index}-${item.postText}`} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                <p className="text-sm font-semibold text-white">{item.postText}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <ChoiceCard title="You flagged" value={item.selected.join(", ") || "Nothing selected"} tone="bad" />
                  <ChoiceCard title="Bot accounts" value={item.correct.join(", ")} tone="good" />
                </div>
                <ChoiceCard title="Tip" value={item.tip} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Act 3
          </p>
          <h2 className="mt-2 text-xl font-bold text-white">Fix the Settings</h2>
          <div className="mt-4 space-y-4">
            {review.privacy.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <ChoiceCard
                    title="Your choice"
                    value={item.fixed ? `Changed from ${item.current}` : `Left as ${item.current}`}
                    tone={item.fixed ? "good" : "bad"}
                  />
                  <ChoiceCard title="Safer choice" value={item.safe} tone="good" />
                </div>
                {!item.fixed && <ChoiceCard title="Why change it" value={item.tip} />}
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to results
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            Play again
          </button>
        </section>
      </div>
    </main>
  );
}
