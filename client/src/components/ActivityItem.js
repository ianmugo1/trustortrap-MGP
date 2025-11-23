export function ActivityItem({ title, time, tag }) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5 text-xs text-slate-200">
        <div className="flex flex-col">
          <span className="font-medium text-[13px]">{title}</span>
          <span className="text-[11px] text-slate-400">{time}</span>
        </div>
        {tag && (
          <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
            {tag}
          </span>
        )}
      </div>
    );
  }
  