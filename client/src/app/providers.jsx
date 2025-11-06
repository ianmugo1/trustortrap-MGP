"use client";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/src/context/AuthContext"; 
export default function Providers({ children }) {
  const [mounted, setMounted] = useState(false);

  // Ensure browser-only rendering happens after hydration
  useEffect(() => setMounted(true), []);

  if (!mounted) return null; 
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
