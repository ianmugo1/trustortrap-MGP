export default function Stat({ label, value, hint }) {
    return (
      <div>
        <div className="text-2xl font-semibold">{value}</div>
        <div className="text-sm text-[color:var(--muted)]">{label}</div>
        {hint && <div className="mt-1 text-xs text-[color:var(--muted)]">{hint}</div>}
      </div>
    );
  }
  