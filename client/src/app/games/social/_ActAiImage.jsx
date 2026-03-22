import { ActBar } from "./_components";

export default function ActAiImage({ image, storyStep, totalImages, storyAnswer, onAnswer, onNext }) {
  if (!image) return null;
  const isSideBySide = image.type === "side-by-side";

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-6 flex flex-col">
      <div className="max-w-4xl w-full mx-auto flex-1 flex flex-col">
        <ActBar current={0} />

        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-black text-white">Real or AI?</h2>
            <p className="text-slate-400 text-base mt-1">
              {isSideBySide
                ? "One side is a real photo. One was made by AI. Which side is real?"
                : "Is this a real photo or was it made by AI?"}
            </p>
          </div>
          <span className="text-slate-500 font-bold text-sm shrink-0 ml-3">
            {storyStep + 1} / {totalImages}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-800 rounded-full mb-5 overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all duration-300"
            style={{ width: `${((storyStep + (storyAnswer ? 1 : 0)) / totalImages) * 100}%` }}
          />
        </div>

        {/* Image */}
        <div className="rounded-xl overflow-hidden border-2 border-slate-700 mb-4">
          <div className="bg-slate-800 px-4 py-2.5 text-base font-semibold text-slate-300 border-b border-slate-700">
            {image.subject}
          </div>
          <div className="relative">
            <img
              src={image.imgSrc}
              alt={image.subject}
              className="w-full object-cover"
              style={{ maxHeight: 550 }}
            />
            {isSideBySide && (
              <>
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">LEFT</div>
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">RIGHT</div>
                <div className="absolute inset-y-0 left-1/2 w-px bg-white/40" />
              </>
            )}
          </div>
        </div>

        {/* Explanation box — always visible once submitted */}
        {storyAnswer !== null && (
          <div className="bg-slate-800 border border-slate-600 rounded-xl p-4 mb-4">
            <p className="font-bold text-white text-sm mb-2">
              {storyAnswer === "correct" ? "Correct!" : "Not quite!"}
            </p>
            <ul className="space-y-1.5">
              {image.tell.split(". ").filter(Boolean).map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-yellow-400 font-bold mt-0.5 shrink-0">-</span>
                  {point.endsWith(".") ? point : point + "."}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Buttons */}
        {storyAnswer === null ? (
          <div className="grid grid-cols-2 gap-4">
            {isSideBySide ? (
              <>
                <button
                  onClick={() => onAnswer("left")}
                  className="py-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-lg transition-colors"
                >
                  Left is Real
                </button>
                <button
                  onClick={() => onAnswer("right")}
                  className="py-5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-lg transition-colors"
                >
                  Right is Real
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onAnswer("real")}
                  className="py-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg transition-colors"
                >
                  Real Photo
                </button>
                <button
                  onClick={() => onAnswer("ai")}
                  className="py-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-lg transition-colors"
                >
                  AI Made It
                </button>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={onNext}
            className="w-full py-5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl font-bold text-lg transition-colors"
          >
            {storyStep + 1 < totalImages ? "Next Image" : "Continue to Act 2"}
          </button>
        )}
      </div>
    </main>
  );
}
