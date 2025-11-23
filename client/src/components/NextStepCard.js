export function NextStepCard({ title, description, cta }) {
    return (
      <div className="rounded-2xl border border-dashed border-emerald-400/40 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-slate-900 px-4 py-4 text-xs text-slate-100">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-[11px] text-slate-300">{description}</p>
        <button className="mt-3 inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-[11px] font-semibold text-slate-950 hover:bg-emerald-400">
          {cta}
        </button>
      </div>
    );
  }
  