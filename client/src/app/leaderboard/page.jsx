"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch leaderboard on load
  useEffect(() => {
    async function load() {
      try {
        const res = await authFetch("/api/leaderboard", {}, token);
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) {
          setError(data.message || "Could not load leaderboard.");
          return;
        }
        setUsers(data.users || []);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">

      {/* Header */}
      <section className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-yellow-400" />
          <h1 className="text-2xl font-black text-white">Leaderboard</h1>
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Ranked by total XP earned across all games.
        </p>
      </section>

      {/* Player list */}
      <section className="rounded-[2rem] border border-slate-800 bg-slate-900 p-4">

        {loading && <p className="py-6 text-center text-sm text-slate-500">Loading...</p>}
        {error && <p className="py-6 text-center text-sm text-rose-400">{error}</p>}
        {!loading && !error && users.length === 0 && (
          <p className="py-6 text-center text-sm text-slate-500">No players yet. Be the first!</p>
        )}

        {!loading && !error && users.length > 0 && (
          <ul className="divide-y divide-slate-800">
            {users.map((u, i) => {
              const rank = i + 1;
              const isMe = String(u._id) === String(user?.id);
              const medal = rank <= 3 ? MEDALS[rank - 1] : rank;

              return (
                <li
                  key={u._id}
                  className={`flex items-center gap-4 px-3 py-3.5 ${isMe ? "rounded-2xl bg-emerald-500/10" : ""}`}
                >
                  {/* Position */}
                  <span className="w-6 text-center text-sm font-bold text-slate-400">
                    {medal}
                  </span>

                  {/* Name */}
                  <span className={`flex-1 text-sm font-semibold ${isMe ? "text-emerald-300" : "text-white"}`}>
                    {u.displayName}
                    {isMe && <span className="ml-2 text-xs text-emerald-400">(you)</span>}
                  </span>

                  {/* Level */}
                  <span className="text-xs text-slate-500">Lv {u.level ?? 1}</span>

                  {/* XP */}
                  <span className="text-sm font-bold text-white">
                    {u.xp ?? 0} <span className="text-xs font-normal text-slate-500">XP</span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
