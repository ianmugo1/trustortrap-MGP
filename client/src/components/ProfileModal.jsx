"use client";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { useToast } from "@/src/components/ui/ToastProvider";
import { updateProfile } from "@/src/utils/api";
// NEW: refresh user after save so Navbar/avatar update immediately
import { useAuth } from "@/src/context/AuthContext";

function isHttpUrl(str) {
  if (!str) return true; // empty is allowed (means use initials)
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ProfileModal({ open, onClose, user }) {
  const { toast } = useToast();
  const { refreshUser } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Keep initial values to compute "dirty" state
  const initial = useMemo(
    () => ({
      displayName: user?.displayName || user?.name || "",
      avatarUrl: user?.avatarUrl || "",
    }),
    [user]
  );

  useEffect(() => {
    if (open) {
      setDisplayName(initial.displayName);
      setAvatarUrl(initial.avatarUrl);
      setErrors({});
    }
  }, [open, initial]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const isDirty =
    displayName.trim() !== initial.displayName.trim() ||
    (avatarUrl || "") !== (initial.avatarUrl || "");

  function validate() {
    const next = {};
    if (displayName.trim().length > 60) next.displayName = "Max 60 characters.";
    if (avatarUrl && !isHttpUrl(avatarUrl)) next.avatarUrl = "Must be a valid http/https URL.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSave() {
    if (!validate()) return;
    try {
      setSaving(true);
      await updateProfile({ displayName: displayName.trim(), avatarUrl: avatarUrl.trim() });
      // Sync auth state so UI updates instantly
      await refreshUser();
      toast({ title: "Profile updated", description: "Your changes were saved." });
      onClose?.();
    } catch (e) {
      toast({
        title: "Update failed",
        description: e?.message || "Try again.",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
            className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="profile-modal-title" className="text-lg font-semibold">
                Edit Profile
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block" htmlFor="displayName">
                <span className="text-sm text-neutral-600 dark:text-neutral-300">Display name</span>
                <input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900"
                  placeholder="e.g. Ian"
                />
                {errors.displayName && (
                  <p className="mt-1 text-xs text-red-600">{errors.displayName}</p>
                )}
              </label>

              <label className="block" htmlFor="avatarUrl">
                <span className="text-sm text-neutral-600 dark:text-neutral-300">Avatar URL (optional)</span>
                <input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900"
                  placeholder="https://.../avatar.png"
                />
                <p className="mt-1 text-xs text-neutral-500">
                  Leave blank to use initials.
                </p>
                {errors.avatarUrl && (
                  <p className="mt-1 text-xs text-red-600">{errors.avatarUrl}</p>
                )}
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={onSave}
                disabled={saving || !isDirty || Object.keys(errors).length > 0}
              >
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
