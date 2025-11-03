export default function Badge({ children, className = "" }) {
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
        bg-black/5 text-[color:var(--fg)] dark:bg-white/10 ${className}`}>
        {children}
      </span>
    );
  }
  