import { ActBar } from "./_components";

function LockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Toggle({ on, onChange, disabled }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
        on ? "bg-yellow-400" : "bg-slate-600"
      } ${disabled ? "cursor-default opacity-70" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function ActPrivacy({ settings, toggles, submitted, onToggle, onSave, onViewResults }) {
  const dangerous  = settings.filter((s) => s.dangerous);
  const safe       = settings.filter((s) => !s.dangerous);
  const fixedCount = dangerous.filter((s) => toggles[s._id]).length;

  return (
    <main className="min-h-screen bg-slate-950 text-white px-4 py-6">
      <div className="max-w-xl mx-auto">
        <ActBar current={2} />

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-yellow-400/20 flex items-center justify-center text-yellow-400 shrink-0">
            <LockIcon />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Fix the Settings</h2>
            <p className="text-slate-400 text-sm">
              {submitted
                ? `You fixed ${fixedCount} of ${dangerous.length} unsafe settings.`
                : "A stranger tried to view your profile! Find the unsafe settings and turn them off."}
            </p>
          </div>
        </div>

        {/* Dangerous settings */}
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">Settings to check</p>
        <div className="space-y-2 mb-4">
          {dangerous.map((setting) => {
            const isFixed = toggles[setting._id];
            let border = "border-slate-700/50";
            let bg     = "bg-slate-900/80";

            if (submitted) {
              border = isFixed ? "border-emerald-500/40" : "border-rose-500/40";
              bg     = isFixed ? "bg-emerald-500/10"     : "bg-rose-500/10";
            } else if (isFixed) {
              border = "border-yellow-400/50";
              bg     = "bg-yellow-400/5";
            }

            return (
              <div key={setting._id} className={`rounded-xl border p-4 transition-colors ${bg} ${border}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white text-sm">{setting.label}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{setting.desc}</p>
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold">
                      {submitted && isFixed ? (
                        <span className="flex items-center gap-1 text-emerald-400"><CheckIcon /> Changed to: {setting.safe}</span>
                      ) : submitted && !isFixed ? (
                        <span className="flex items-center gap-1 text-rose-400"><WarnIcon /> Still set to: {setting.current}</span>
                      ) : (
                        <span className={isFixed ? "text-yellow-400 line-through" : "text-slate-500"}>
                          Currently: {setting.current}
                        </span>
                      )}
                    </div>
                  </div>
                  <Toggle on={isFixed} onChange={() => onToggle(setting._id)} disabled={submitted} />
                </div>

                {/* Tip shown after submit if not fixed */}
                {submitted && !isFixed && (
                  <p className="text-rose-300/80 text-xs mt-2 leading-relaxed border-t border-rose-500/20 pt-2">
                    {setting.tip}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Safe settings */}
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">These ones are fine</p>
        <div className="space-y-2 mb-5">
          {safe.map((setting) => (
            <div key={setting._id} className="rounded-xl border border-slate-700/40 bg-slate-900/50 px-4 py-3 flex items-center justify-between gap-3 opacity-60">
              <div>
                <p className="font-semibold text-slate-300 text-sm">{setting.label}</p>
                <p className="text-slate-500 text-xs">{setting.desc}</p>
              </div>
              <span className="text-xs text-slate-600 italic shrink-0">No change needed</span>
            </div>
          ))}
        </div>

        {/* Button */}
        {!submitted ? (
          <button
            onClick={onSave}
            className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl font-bold text-base transition-colors"
          >
            Save Settings
          </button>
        ) : (
          <div className="space-y-3">
            {fixedCount === dangerous.length && (
              <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-4 py-3 flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <CheckIcon /> All unsafe settings fixed — your account is much safer!
              </div>
            )}
            <button
              onClick={onViewResults}
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 text-slate-900 rounded-xl font-bold text-base transition-colors"
            >
              See Your Results
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
