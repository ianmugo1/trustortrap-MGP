"use client";

// Red flag hunt: read an email, tap every part that looks wrong, then see what you missed.
// The server holds the answers and does the scoring.
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Flag, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";
import { Confetti, CountUp, ProgressBar } from "@/components/motion";

async function postJson(path, body, token) {
  const res = await authFetch(path, { method: "POST", body: JSON.stringify(body) }, token);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.success) throw new Error(data?.message || "Something went wrong.");
  return data;
}

export default function RedFlagHuntPage() {
  const { token, refreshUser } = useAuth();

  const [emails, setEmails] = useState([]);
  const [index, setIndex] = useState(0);
  const [tapped, setTapped] = useState([]); // segment ids tapped on the current email
  const [checked, setChecked] = useState(null); // server marking for the current email
  const [submissions, setSubmissions] = useState([]);
  const [result, setResult] = useState(null);
  const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadRun = useCallback(async () => {
    if (!token) return;
    setError("");
    setEmails([]);
    setIndex(0);
    setTapped([]);
    setChecked(null);
    setSubmissions([]);
    setResult(null);

    try {
      const res = await authFetch("/api/phishing/hunt", {}, token);
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.message || "Could not load the emails.");
      setEmails(data.emails || []);
    } catch (err) {
      setError(err.message || "Could not load the emails.");
    }
  }, [token]);

  useEffect(() => {
    loadRun();
  }, [loadRun]);

  const email = emails[index];

  const toggle = (segmentId) => {
    if (checked) return;
    setTapped((prev) =>
      prev.includes(segmentId) ? prev.filter((id) => id !== segmentId) : [...prev, segmentId]
    );
  };

  // Ask the server to mark this email
  const finishEmail = async () => {
    if (busy || !email) return;
    setBusy(true);
    setError("");
    try {
      const data = await postJson("/api/phishing/hunt/check", { emailId: email.id, tapped }, token);
      setChecked(data.email);
      setSubmissions((prev) => [...prev, { emailId: email.id, tapped }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Move to the next email, or finish the run and collect rewards
  const next = async () => {
    if (index + 1 < emails.length) {
      setIndex((value) => value + 1);
      setTapped([]);
      setChecked(null);
      return;
    }

    setBusy(true);
    try {
      const data = await postJson("/api/phishing/hunt/complete", { submissions }, token);
      setResult(data);
      if (typeof refreshUser === "function") await refreshUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // ---------- Screens ----------

  if (error && !emails.length) {
    return (
      <main className="flex min-h-full items-center justify-center px-4 py-10 text-white">
        <div className="tt-card max-w-md p-6 text-center">
          <p className="mb-4 text-rose-300">{error}</p>
          <button onClick={loadRun} className="tt-btn">Retry</button>
        </div>
      </main>
    );
  }

  if (!emails.length) {
    return (
      <main className="flex min-h-full items-center justify-center px-4 py-10 text-slate-400">
        Loading emails...
      </main>
    );
  }

  if (!started) {
    return (
      <main className="flex min-h-full items-center justify-center px-4 py-10 text-white">
        <div className="tt-card max-w-lg p-8 text-center">
          <div className="tt-float mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-amber-300 text-slate-900">
            <Flag className="h-8 w-8" />
          </div>
          <h1 className="tt-gradient-text mb-3 text-3xl font-black md:text-4xl">Red flag hunt</h1>
          <p className="mb-6 text-slate-200">
            You get {emails.length} emails. Tap every part that looks wrong, then press
            &quot;I&apos;m done&quot;. Careful: one email is real, and the right move is to tap nothing.
          </p>
          <div className="mb-6 space-y-1 text-sm text-sky-100/90">
            <p>+10 points for each red flag you find</p>
            <p>-5 points for tapping something that is fine</p>
            <p>+20 coins and XP when you finish</p>
          </div>
          <button onClick={() => setStarted(true)} className="tt-btn px-9 text-lg">Start hunting</button>
        </div>
      </main>
    );
  }

  if (result) {
    return (
      <main className="flex min-h-full items-center justify-center px-4 py-10 text-white">
        <Confetti fire={result.perfect || result.leveledUp} />
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="tt-card w-full max-w-md p-8 text-center"
        >
          <h1 className="tt-gradient-text mb-3 text-3xl font-black">
            {result.perfect ? "Perfect hunt!" : "Hunt complete"}
          </h1>
          <p className="text-6xl font-black"><CountUp value={result.score} /></p>
          <p className="mb-5 text-sm text-slate-400">out of {result.maxScore}</p>

          <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3">
              <p className="text-2xl font-black text-emerald-300">{result.flagsFound}/{result.flagsTotal}</p>
              <p className="text-slate-300">flags found</p>
            </div>
            <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 p-3">
              <p className="text-2xl font-black text-rose-300">{result.wrongTaps}</p>
              <p className="text-slate-300">wrong taps</p>
            </div>
          </div>

          <div className="mb-6 flex justify-center gap-3 text-sm font-semibold">
            <span className="rounded-full bg-amber-400/15 px-3 py-1 text-amber-300">+{result.completionBonus} coins</span>
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-emerald-300">+{result.xpAwarded} XP</span>
            {result.leveledUp && (
              <span className="rounded-full bg-violet-400/15 px-3 py-1 text-violet-300">Level {result.level}!</span>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => { setStarted(true); loadRun(); }} className="tt-btn">Hunt again</button>
            <Link href="/games" className="tt-btn tt-btn-ghost">Back to training</Link>
          </div>
        </motion.div>
      </main>
    );
  }

  // Look up the server's marking for one segment
  const mark = (segmentId) => checked?.segments.find((item) => item.id === segmentId);

  const segmentStyle = (segmentId) => {
    const m = mark(segmentId);
    if (!m) {
      return tapped.includes(segmentId)
        ? "border-cyan-300 bg-cyan-400/15"
        : "border-transparent hover:border-slate-600 hover:bg-slate-800/60";
    }
    if (m.flag && m.tapped) return "border-emerald-400 bg-emerald-500/15"; // found
    if (m.flag) return "border-amber-400 bg-amber-400/10"; // missed
    if (m.tapped) return "border-rose-400 bg-rose-500/15"; // wrong tap
    return "border-transparent opacity-60";
  };

  const flagsOnThisEmail = checked ? checked.flagsTotal : null;

  return (
    <main className="min-h-full px-3 py-4 text-white sm:px-4 md:px-6 md:py-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h1 className="tt-gradient-text text-xl font-black md:text-2xl">Red flag hunt</h1>
          <p className="text-sm font-bold text-cyan-100">Email {index + 1} / {emails.length}</p>
        </div>
        <ProgressBar percent={(index / emails.length) * 100} className="mb-5" />

        <AnimatePresence mode="wait">
          <motion.section
            key={email.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22 }}
            className="tt-card overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b border-slate-700/70 bg-slate-900/60 px-4 py-2 text-xs text-slate-400">
              <Mail className="h-4 w-4" /> Inbox
            </div>

            <div className="space-y-1 p-3 sm:p-5">
              {email.segments.map((segment) => {
                const m = mark(segment.id);
                const label =
                  segment.id === "from" ? "From" : segment.id === "subject" ? "Subject" : null;

                return (
                  <div key={segment.id}>
                    <button
                      type="button"
                      disabled={Boolean(checked)}
                      aria-pressed={tapped.includes(segment.id)}
                      onClick={() => toggle(segment.id)}
                      className={`block min-h-[44px] w-full rounded-xl border px-3 py-2 text-left text-sm sm:text-base ${segmentStyle(segment.id)}`}
                    >
                      {label && <span className="mr-2 text-xs uppercase tracking-wide text-slate-500">{label}</span>}
                      <span className={label ? "font-semibold text-slate-100" : "text-slate-200"}>{segment.text}</span>
                    </button>

                    {/* After marking, each red flag shows why it is one */}
                    {m?.flag && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className={`px-3 pb-2 pt-1 text-xs sm:text-sm ${m.tapped ? "text-emerald-200" : "text-amber-200"}`}
                      >
                        <Flag className="mr-1 inline h-3.5 w-3.5" />
                        {m.tapped ? "Found: " : "Missed: "}
                        {m.reason}
                      </motion.p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.section>
        </AnimatePresence>

        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}

        <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          {!checked ? (
            <>
              <p className="text-sm text-slate-400">
                {tapped.length === 0 ? "Tap anything that looks wrong." : `${tapped.length} marked`}
              </p>
              <button onClick={finishEmail} disabled={busy} className="tt-btn disabled:opacity-50">
                I&apos;m done
              </button>
            </>
          ) : (
            <>
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                {flagsOnThisEmail === 0 ? (
                  <>
                    <ShieldCheck className="h-5 w-5 text-emerald-300" />
                    {checked.wrong === 0 ? "Right call. This email was real." : "This email was real. Nothing here was a red flag."}
                  </>
                ) : (
                  <>Found {checked.found} of {checked.flagsTotal} flags</>
                )}
                <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-amber-300">+{checked.score}</span>
              </p>
              <button onClick={next} disabled={busy} autoFocus className="tt-btn disabled:opacity-50">
                {index + 1 === emails.length ? "See results" : "Next email"}
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
