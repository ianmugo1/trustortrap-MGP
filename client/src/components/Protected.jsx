"use client";
import { useEffect } from "react";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Protected({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!user) return null;
  return children;
}
