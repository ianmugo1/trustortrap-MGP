"use client";

import { useEffect, useState } from "react";
import { Trophy, Star, Zap, Medal } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";

export default function LeaderboardPage() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Top 3 get a special medal icon and colour
  const rankStyle = [
    { icon: Trophy, color: "text-amber-400",  bg: "bg-amber-400/10 border-amber-400/30" },
    { icon: Medal,  color: "text-slate-300",  bg: "bg-slate-300/10 border-slate-300/20" },
    { icon: Medal,  color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/30" },
  ];

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">

      {/* Header */}
      <section className="rounded-[2rem] border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800">
            <Trophy className="h-5 w-5 text-amber-400" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Rankings</p>
            <h1 className="text-2xl font-black text-white">Leaderboard</h1>
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-400">
          Ranked by total XP earned across all games. Keep playing to climb the board!
        </p>
      </section>

      {/* Player list */}
      <section className="rounded-[2rem] border border-slate-800 bg-slate-900 p-4">

        {loading && (
          <p className="py-8 text-center text-sm text-slate-500">Loading...</p>
        )}
        {error && (
          <p className="py-8 text-center text-sm text-rose-400">{error}</p>
        )}
        {!loading && !error && users.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-500">No players yet. Be the first!</p>
        )}

        {!loading && !error && users.length > 0 && (
          <ul className="space-y-2">
            {users.map((u, i) => {
              const rank = i + 1;
              const isMe = String(u._id) === String(user?.id);
              const top = rankStyle[i]; // only defined for top 3

              return (
                <li
                  key={u._id}
                  className={`flex items-center gap-4 rounded-2xl border px-4 py-3 transition ${
                    isMe
                      ? "border-emerald-700/50 bg-emerald-500/10"
                      : top
                      ? `${top.bg}`
                      : "border-slate-800 bg-slate-800/40"
                  }`}
                >
                  {/* Rank icon or number */}
                  <div className="flex w-8 items-center justify-center">
                    {top ? (
                      <top.icon className={`h-5 w-5 ${top.color}`} />
                    ) : (
                      <span className="text-sm font-bold text-slate-500">{rank}</span>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className={`truncate text-sm font-semibold ${isMe ? "text-emerald-300" : "text-white"}`}>
                      {u.displayName}
                      {isMe && <span className="ml-2 text-xs font-normal text-emerald-400">(you)</span>}
                    </p>
                  </div>

                  {/* Level badge */}
                  <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1">
                    <Star className="h-3 w-3 text-slate-400" />
                    <span className="text-xs font-semibold text-slate-300">Lv {u.level ?? 1}</span>
                  </div>

                  {/* XP */}
                  <div className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-sm font-bold text-white">{u.xp ?? 0}</span>
                    <span className="text-xs text-slate-500">XP</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
