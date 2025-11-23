"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthAPI } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setMsg("");
    setSubmitting(true);

    try {
      const { token, user } = await AuthAPI.register({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
      });

      if (token && user) {
        signIn(token, user);
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    } catch (err) {
      setMsg(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-50">Create an account</h1>
        <p className="text-sm text-slate-400 mb-6">
          Join TrustOrTrap and start building your cyber-awareness score.
        </p>

        {msg && (
          <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {msg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Name
            </label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500/60"
              placeholder="Alex Cyber"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email
            </label>
            <input
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500/60"
              placeholder="you@example.com"
              type="email"
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
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500/60"
              type="password"
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
            {submitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400">
          Already have an account?{" "}
          <a href="/login" className="text-emerald-300 hover:text-emerald-200">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
