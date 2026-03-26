"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthAPI } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";
import PublicAuthShell from "@/components/PublicAuthShell";

const inputClass =
  "w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20";

const labelClass =
  "mb-2 block text-xs font-medium uppercase tracking-[0.12em] text-slate-400";

const secondaryButtonClass =
  "flex-1 rounded-2xl border border-slate-700 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800";

const primaryButtonClass =
  "flex-1 rounded-2xl bg-emerald-400 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-40";

const interests = [
  { value: "phishing", label: "Spotting fake emails & messages" },
  { value: "passwords", label: "Creating strong passwords" },
  { value: "social", label: "Staying safe on social media" },
  { value: "privacy", label: "Protecting personal information" },
];

function StepDots({ current }) {
  return (
    <div className="mb-6 flex justify-center gap-2">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-2.5 w-6 rounded-full transition ${
            s === current
              ? "bg-emerald-400"
              : s < current
                ? "bg-emerald-700"
                : "bg-slate-700"
          }`}
        />
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { signIn, isAuthenticated, loading } = useAuth();

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [interest, setInterest] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pwChecks = {
    length: password.length >= 8,
    number: /\d/.test(password),
    upper: /[A-Z]/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };
  const allPwValid = pwChecks.length && pwChecks.number && pwChecks.upper && pwChecks.match;

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

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

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

  const footer = (
    <p className="text-sm text-slate-400">
      Already have an account?{" "}
      <Link href="/login" className="font-medium text-emerald-300 hover:text-emerald-200">
        Sign in
      </Link>
    </p>
  );

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
      eyebrow={`Create account ${step}/3`}
      title="Start your TrustOrTrap profile"
      description="Set up your account in three short steps, then head straight into the app."
      footer={footer}
    >
      <StepDots current={step} />

      {msg && (
        <div className="mb-5 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {msg}
        </div>
      )}

      {step === 1 && (
        <>
          <h2 className="mb-2 text-2xl font-bold text-slate-50">Create your account</h2>
          <p className="mb-6 text-sm leading-6 text-slate-400">
            Start with your name and email address.
          </p>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                className={inputClass}
                placeholder="Alex Cyber"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input
                className={inputClass}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button onClick={nextStep} className="w-full rounded-2xl bg-emerald-400 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
              Next
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="mb-2 text-2xl font-bold text-slate-50">Choose a password</h2>
          <p className="mb-6 text-sm leading-6 text-slate-400">
            Use a password that meets the basic security checks below.
          </p>

          <div className="space-y-4">
            <div>
              <label className={labelClass}>Password</label>
              <input
                className={inputClass}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Confirm Password</label>
              <input
                className={inputClass}
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <ul className="space-y-2 text-sm">
              {[
                { ok: pwChecks.length, text: "At least 8 characters" },
                { ok: pwChecks.number, text: "Contains a number" },
                { ok: pwChecks.upper, text: "Contains an uppercase letter" },
                { ok: pwChecks.match, text: "Passwords match" },
              ].map(({ ok, text }) => (
                <li key={text} className="flex items-center gap-2">
                  <span className={ok ? "text-emerald-400" : "text-slate-600"}>
                    {ok ? "✓" : "○"}
                  </span>
                  <span className={ok ? "text-emerald-300" : "text-slate-400"}>
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex gap-3">
              <button onClick={prevStep} className={secondaryButtonClass}>
                Back
              </button>
              <button onClick={nextStep} disabled={!allPwValid} className={primaryButtonClass}>
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="mb-2 text-2xl font-bold text-slate-50">Choose your focus</h2>
          <p className="mb-6 text-sm leading-6 text-slate-400">
            Pick the area you want the app to emphasize first.
          </p>

          <div className="mb-6 space-y-3">
            {interests.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setInterest(opt.value)}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
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
            <button onClick={prevStep} className={secondaryButtonClass}>
              Back
            </button>
            <button
              onClick={handleRegister}
              disabled={submitting || !interest}
              className={primaryButtonClass}
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </div>
        </>
      )}
    </PublicAuthShell>
  );
}
