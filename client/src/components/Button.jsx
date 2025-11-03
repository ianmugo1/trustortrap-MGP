"use client";
export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`w-full bg-black text-white rounded px-4 py-2 hover:opacity-90 disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
