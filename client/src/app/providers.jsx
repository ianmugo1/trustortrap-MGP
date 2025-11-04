"use client";

import { AuthProvider } from "@/src/context/AuthContext";
import { ToastProvider } from "@/src/components/ui/ToastProvider";
// add other client-side providers here later (e.g. ThemeProvider)

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}
