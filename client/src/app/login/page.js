"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthAPI } from "../../lib/auth";
import { useAuth } from "../../context/AuthContext";
import Image from "next/image";


export default function LoginPage() {
  const router = useRouter();
  const { signIn, isAuthenticated, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

if (loading)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 gap-4">
      
      {/* LOGO */}
      <div className="relative h-90 w-200">
        <Image
          src="/logo.png"
          alt="TrustOrTrap Logo"
          fill
          className="object-contain"
          priority
        />
      </div>

      <p className="text-slate-300 text-sm">
        Checking session...
      </p>

    </div>
  );


  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-50">Please sign in</h1>
        <p className="text-sm text-slate-400 mb-6">
          Access your personalised cyber awareness dashboard.
        </p>

        {msg && (
          <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500/60"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500/60"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400">
          No account yet?{" "}
          <a href="/register" className="text-emerald-300 hover:text-emerald-200">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
