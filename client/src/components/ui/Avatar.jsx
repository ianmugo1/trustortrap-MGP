export default function Avatar({ name = "", src, size = 36, className = "" }) {
    const initials = name.split(" ").slice(0,2).map(s=>s[0]||"").join("").toUpperCase() || "U";
    const style = { width: size, height: size };
    return src ? (
      <img src={src} alt={name} className={`rounded-full object-cover ${className}`} style={style} />
    ) : (
      <div className={`rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 flex items-center justify-center font-semibold ${className}`} style={style}>
        {initials}
      </div>
    );
  }
  