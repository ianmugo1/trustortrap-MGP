"use client";
import { useEffect, useState } from "react";
import SectionTitle from "@/src/components/ui/SectionTitle";
import Button from "@/src/components/Button";
import { useToast } from "@/src/components/ui/ToastProvider";

export default function SettingsPage() {
  const { toast } = useToast();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleDark() {
    const el = document.documentElement;
    const isDark = el.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    setDark(isDark);
    toast({ title: isDark ? "Dark mode enabled" : "Light mode enabled" });
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <SectionTitle title="Settings" subtitle="Personalise your TrustOrTrap experience" />

      <div className="mt-6 space-y-6">
        <div className="rounded-2xl border p-4 dark:border-neutral-800">
          <div className="mb-2 font-medium">Appearance</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">Theme</div>
              <div className="text-xs opacity-70">Switch between light and dark</div>
            </div>
            <Button onClick={toggleDark}>{dark ? "Use light" : "Use dark"}</Button>
          </div>
        </div>

        <div className="rounded-2xl border p-4 dark:border-neutral-800">
          <div className="mb-2 font-medium">Account</div>
          <div className="text-sm opacity-80">Email, password & security coming soon.</div>
        </div>
      </div>
    </div>
  );
}
