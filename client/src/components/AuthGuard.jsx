// client/src/components/AuthGuard.jsx
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const PUBLIC_ROUTES = ["/", "/login", "/register"];

export function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!isPublic && !loading && !user) {
      router.replace("/login");
    }
  }, [isPublic, loading, user, router]);

  // While checking auth for private pages, show a full-screen loader
  if (!isPublic && (loading || !user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">
        Checking your session…
      </div>
    );
  }

  return children;
}
