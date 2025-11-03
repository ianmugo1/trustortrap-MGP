"use client";
import { Trophy } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/src/components/ui/Card";

export default function LeaderboardPreview({ top = [] }) {
  const sample = top.length ? top : [
    { name: "Ian", coins: 820 },
    { name: "Dylan", coins: 740 },
    { name: "Josip", coins: 690 },
  ];
  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="opacity-70" />
          <h3 className="font-semibold">Leaderboard (Top 3)</h3>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3">
          {sample.map((u, i) => (
            <li key={u.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-neutral-100 text-sm font-semibold dark:bg-neutral-800">
                  {i + 1}
                </span>
                <span className="font-medium">{u.name}</span>
              </div>
              <span className="text-sm opacity-80">{u.coins} coins</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
