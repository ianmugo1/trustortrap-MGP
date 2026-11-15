// Shared UI components for the social media game
import { motion } from "motion/react";

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
      {/* The knob springs across when switched. Fixed colour so it stays white in the bright theme. */}
      <motion.span
        className="inline-block h-4 w-4 rounded-full shadow"
        style={{ backgroundColor: "#ffffff" }}
        animate={{ x: on ? 24 : 4 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

export function ActBar({ current }) {
  const labels = ["Spot the AI Image", "Comment Section", "Privacy Settings"];
  return (
    <div className="flex gap-2 mb-6">
      {labels.map((label, i) => (
        <motion.div
          key={i}
          animate={{ scale: i === current ? 1.04 : 1 }}
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
        </motion.div>
      ))}
    </div>
  );
}
