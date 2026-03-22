// Shared UI components for the social media game

export function Toggle({ on, onChange, disabled }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
        on ? "bg-blue-600" : "bg-slate-600"
      } ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export function ActBar({ current }) {
  const labels = ["Spot the AI Image", "Comment Section", "Privacy Settings"];
  return (
    <div className="flex gap-2 mb-6">
      {labels.map((label, i) => (
        <div
          key={i}
          className={`flex-1 rounded-lg py-2 text-xs font-semibold text-center transition-colors ${
            i === current
              ? "bg-blue-600 text-white"
              : i < current
              ? "bg-emerald-600 text-white"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          {i < current ? "✓ " : `${i + 1}. `}
          {label}
        </div>
      ))}
    </div>
  );
}
