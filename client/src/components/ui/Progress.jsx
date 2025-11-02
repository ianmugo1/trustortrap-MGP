export default function Progress({ value = 0, max = 100, label }) {
    const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
    return (
      <div>
        {label && <div className="mb-1 text-sm text-[color:var(--muted)]">{label}</div>}
        <div className="h-2 w-full rounded bg-black/10 dark:bg-white/10 overflow-hidden">
          <div className="h-full bg-brand-500" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 text-xs text-[color:var(--muted)]">{pct}%</div>
      </div>
    );
  }
  