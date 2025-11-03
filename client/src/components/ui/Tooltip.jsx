"use client";
import { useState } from "react";

export default function Tooltip({ content, children }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block"
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      {open && (
        <span className="absolute left-1/2 -translate-x-1/2 -top-8 whitespace-nowrap text-xs px-2 py-1 rounded bg-black text-white dark:bg-white dark:text-black shadow">
          {content}
        </span>
      )}
    </span>
  );
}
