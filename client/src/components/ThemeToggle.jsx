"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }) {
  const [ready, setReady] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // initial load: read localStorage or system preference
    const stored = typeof window !== "undefined" ? localStorage.getItem("tt_theme") : null;
    const prefersDark = typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored ? stored === "dark" : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
    setReady(true);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("tt_theme", next ? "dark" : "light");
  }

  // Avoid hydration mismatch
  if (!ready) return <button className={`text-sm ${className}`} aria-hidden>…</button>;

  return (
    <button
      onClick={toggle}
      className={`text-sm px-3 py-1.5 rounded border hover:bg-black/5 dark:hover:bg-white/10 ${className}`}
      title="Toggle theme"
    >
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
