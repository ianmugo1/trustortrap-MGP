"use client";
import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";

const ToastCtx = createContext(null);
export function useToast() { return useContext(ToastCtx); }

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = "default" }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, title, description, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      {typeof window !== "undefined" && createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto w-[92%] max-w-sm rounded-xl border p-3 shadow-md backdrop-blur-md ${
                t.variant === "error"
                  ? "border-red-300/50 bg-red-50/70 dark:border-red-900/50 dark:bg-red-900/30"
                  : "border-neutral-200/60 bg-white/70 dark:border-neutral-800/60 dark:bg-neutral-900/60"
              }`}
            >
              <div className="text-sm font-semibold">{t.title}</div>
              {t.description && <div className="text-xs opacity-80">{t.description}</div>}
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  );
}
