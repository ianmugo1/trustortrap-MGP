export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-50">
          TrustOrTrap
        </h1>

        <p className="text-slate-600 dark:text-slate-400 text-sm">
          A smarter way to improve your cyber awareness.
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          <a
            href="/login"
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition"
          >
            Login
          </a>

          <a
            href="/register"
            className="rounded-lg border border-slate-400 dark:border-slate-600 px-5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
}
