function getCorrectAnswerText(question) {
  const options = Array.isArray(question?.options) ? question.options : [];

  if (options.length > 0) {
    if (typeof question?.correctOption === "number") {
      return options[question.correctOption] || "Correct answer unavailable";
    }

    if (question?.correct) {
      return question.correct;
    }
  }

  if (question?.phishingSide === "left") return "Left is phishing";
  if (question?.phishingSide === "right") return "Right is phishing";
  if (typeof question?.isPhishing === "boolean") {
    return question.isPhishing ? "Phishing" : "Safe";
  }

  return "Correct answer unavailable";
}

function getUserAnswerText(question, userAnswer) {
  const options = Array.isArray(question?.options) ? question.options : [];

  if (options.length > 0 && Number.isInteger(userAnswer)) {
    return options[userAnswer] || "No answer";
  }

  if (userAnswer === "left") return "Left";
  if (userAnswer === "right") return "Right";

  return userAnswer || "No answer";
}

export default function ReviewScreen({ answers, onBack, onPlayAgain }) {
  const wrongAnswers = answers.filter((item) => !item.isCorrect);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
          <p className="text-sm font-medium text-cyan-300">Review your run</p>
          <h1 className="mt-2 text-3xl font-black text-white">Look at the ones you missed</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
            Review mode shows your answer, the correct answer, and the key clue to remember next time.
          </p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <div className="rounded-full border border-slate-700 bg-slate-950/80 px-4 py-2 text-slate-300">
              {wrongAnswers.length} missed
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-950/80 px-4 py-2 text-slate-300">
              {answers.length - wrongAnswers.length} correct
            </div>
          </div>
        </section>

        {wrongAnswers.length === 0 ? (
          <section className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
            <h2 className="text-2xl font-bold text-emerald-200">Perfect run</h2>
            <p className="mt-2 text-sm text-emerald-100/90">
              You did not miss any phishing questions this time.
            </p>
          </section>
        ) : (
          wrongAnswers.map((item, index) => (
            <section
              key={`${item.question?._id || index}-${index}`}
              className="rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-xl"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Review {index + 1}
              </p>
              <p className="mt-3 text-lg font-semibold text-white">{item.question?.text}</p>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-300">
                    Your answer
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {getUserAnswerText(item.question, item.userAnswer)}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300">
                    Correct answer
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {getCorrectAnswerText(item.question)}
                  </p>
                </div>
              </div>

              {item.question?.explanation && (
                <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Why this mattered
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.question.explanation}</p>
                </div>
              )}
            </section>
          ))
        )}

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
            onClick={onPlayAgain}
            className="rounded-2xl bg-gradient-to-r from-cyan-300 to-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Play again
          </button>
        </section>
      </div>
    </main>
  );
}
