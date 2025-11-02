"use client";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

export default function Modal({ open, onClose, title, children, footer }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          aria-modal="true" role="dialog"
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="pointer-events-none flex min-h-full items-center justify-center p-4">
            <motion.div
              className="pointer-events-auto w-full max-w-lg rounded-xl border border-black/10 dark:border-white/10 bg-[color:var(--bg)]"
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="px-5 py-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                <h3 className="text-lg font-semibold">{title}</h3>
                <Button variant="ghost" size="sm" onClick={onClose} aria-label="Close">✕</Button>
              </div>
              <div className="px-5 py-4">{children}</div>
              {footer && <div className="px-5 py-4 border-t border-black/10 dark:border-white/10">{footer}</div>}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
