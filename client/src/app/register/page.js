"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthAPI } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

// ── shared input style ──
const inputClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:ring-2 focus:ring-emerald-500/60";

// ── interest options for step 3 ──
const interests = [
  { value: "phishing", label: "Spotting fake emails & messages" },
  { value: "passwords", label: "Creating strong passwords" },
  { value: "social", label: "Staying safe on social media" },
  { value: "privacy", label: "Protecting personal information" },
];

// ── step indicator dots ──
function StepDots({ current }) {
  return (
    <div className="flex justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-2 w-2 rounded-full transition ${
            s === current ? "bg-emerald-400 scale-125" : s < current ? "bg-emerald-700" : "bg-slate-600"
          }`}
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  // step tracker (1, 2, or 3)
  const [step, setStep] = useState(1);

  // field values
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [interest, setInterest] = useState("");

  // ui state
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── password requirement checks ──
  const pwChecks = {
    length: password.length >= 8,
    number: /\d/.test(password),
    upper: /[A-Z]/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };
  const allPwValid = pwChecks.length && pwChecks.number && pwChecks.upper && pwChecks.match;

  // ── step navigation ──
  function nextStep() {
    setMsg("");
    if (step === 1) {
      if (!name.trim() || !email.trim()) {
        setMsg("Please fill in both fields.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!allPwValid) {
        setMsg("Please meet all password requirements.");
        return;
      }
      setStep(3);
    }
  }

  function prevStep() {
    setMsg("");
    setStep((s) => s - 1);
  }

  // ── final submit ──
  async function handleRegister() {
    setMsg("");
    if (!interest) {
      setMsg("Pick one option to continue.");
      return;
    }
    setSubmitting(true);

    try {
      const { token, user } = await AuthAPI.register({
        name: name.trim(),
        email: email.trim(),
        password: password.trim(),
        learningInterest: interest,
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
        <StepDots current={step} />

        {/* ── error banner ── */}
        {msg && (
          <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
            {msg}
          </div>
        )}

        {/* ════════════ STEP 1 ════════════ */}
        {step === 1 && (
          <>
            <h1 className="text-2xl font-bold text-slate-50">Create an account</h1>
            <p className="text-sm text-slate-400 mb-6">
              Let's start with your name and email.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  className={inputClass}
                  placeholder="Alex Cyber"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email
                </label>
                <input
                  className={inputClass}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                onClick={nextStep}
                className="w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition"
              >
                Next
              </button>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              Already have an account?{" "}
              <a href="/login" className="text-emerald-300 hover:text-emerald-200">
                Sign in
              </a>
            </p>
          </>
        )}

        {/* ════════════ STEP 2 ════════════ */}
        {step === 2 && (
          <>
            <h1 className="text-2xl font-bold text-slate-50">Choose a password</h1>
            <p className="text-sm text-slate-400 mb-6">
              Make it strong to keep your account safe.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Password
                </label>
                <input
                  className={inputClass}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Confirm Password
                </label>
                <input
                  className={inputClass}
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {/* ── requirements checklist ── */}
              <ul className="space-y-1 text-xs">
                {[
                  { ok: pwChecks.length, text: "At least 8 characters" },
                  { ok: pwChecks.number, text: "Contains a number" },
                  { ok: pwChecks.upper, text: "Contains an uppercase letter" },
                  { ok: pwChecks.match, text: "Passwords match" },
                ].map(({ ok, text }) => (
                  <li key={text} className="flex items-center gap-2">
                    <span className={ok ? "text-emerald-400" : "text-slate-500"}>
                      {ok ? "✓" : "○"}
                    </span>
                    <span className={ok ? "text-emerald-300" : "text-slate-400"}>
                      {text}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-3">
                <button
                  onClick={prevStep}
                  className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!allPwValid}
                  className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {/* ════════════ STEP 3 ════════════ */}
        {step === 3 && (
          <>
            <h1 className="text-2xl font-bold text-slate-50">One last thing!</h1>
            <p className="text-sm text-slate-400 mb-6">
              What interests you most about staying safe online?
            </p>

            <div className="space-y-3 mb-6">
              {interests.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setInterest(opt.value)}
                  className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition ${
                    interest === opt.value
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-200"
                      : "border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={prevStep}
                className="flex-1 rounded-xl border border-slate-700 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800 transition"
              >
                Back
              </button>
              <button
                onClick={handleRegister}
                disabled={submitting || !interest}
                className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition disabled:opacity-40"
              >
                {submitting ? "Creating account..." : "Create account"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
