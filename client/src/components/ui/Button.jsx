"use client";
import clsx from "classnames";

const base = "inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";
const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};
const variants = {
  primary: "bg-brand-500 text-white hover:opacity-90 focus:ring-brand-500",
  secondary: "bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[color:var(--fg)] focus:ring-brand-500",
  outline: "border border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10 text-[color:var(--fg)] focus:ring-brand-500",
  ghost: "hover:bg-black/5 dark:hover:bg-white/10",
  danger: "bg-red-600 text-white hover:opacity-90 focus:ring-red-600",
};

export default function Button({ as:Comp="button", variant="primary", size="md", className="", ...props }) {
  return <Comp className={clsx(base, sizes[size], variants[variant], className)} {...props} />;
}
