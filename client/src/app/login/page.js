"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthAPI } from "../../lib/auth";
import { useAuth } from "../../context/AuthContext";
import PublicAuthShell from "../../components/PublicAuthShell";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isAuthenticated, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const sessionExpired = searchParams.get("expired") === "1";

  useEffect(() => {
    if (!loading && isAuthenticated) router.replace("/dashboard");
  }, [loading, isAuthenticated, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");

    try {
      const { token, user } = await AuthAPI.login({ email, password });

      if (!token || !user) {
        throw new Error("Invalid response from server");
      }

     
      signIn(token, user);

      router.replace("/dashboard");
    } catch (err) {
      setMsg(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <PublicAuthShell
        eyebrow="Session check"
        title="Checking your session"
        description="We are confirming whether you already have an active TrustOrTrap session."
      >
        <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/80 px-4 py-6 text-center text-sm text-slate-300">
          Checking session...
        </div>
      </PublicAuthShell>
    );
  }

  if (isAuthenticated) return null;

  return (
    <PublicAuthShell
      eyebrow="Sign in"
      title="Welcome back"
      description="Sign in to continue your training, track your progress, and check in on your cyber pet."
      footer={
        <p className="text-sm text-slate-400">
          No account yet?{" "}
          <Link href="/register" className="font-medium text-emerald-300 hover:text-emerald-200">
            Create one
          </Link>
        </p>
      }
    >
      <div className="space-y-5">
        {sessionExpired && !msg && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Your session expired. Sign in again to continue.
          </div>
        )}

        {msg && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-emerald-400 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </PublicAuthShell>
  );
}
