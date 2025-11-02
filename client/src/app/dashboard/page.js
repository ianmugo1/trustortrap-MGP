"use client";
import Protected from "@/src/components/Protected";
import { useAuth } from "@/src/context/AuthContext";
import Container from "@/src/components/Container";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import SectionTitle from "@/src/components/ui/SectionTitle";
import Progress from "@/src/components/ui/Progress";
import Stat from "@/src/components/ui/Stat";

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  // Simple progression model (tweak as you like)
  const coins = user?.coins ?? 0;
  const nextTarget = coins < 100 ? 100 : coins < 250 ? 250 : 500;
  const badges = user?.badges ?? [];

  return (
    <Protected>
      <Container className="py-8 space-y-6">
        <div className="flex items-center justify-between">
          <SectionTitle title="Dashboard" subtitle="Your current progress and profile" />
          <button className="text-sm px-3 py-1.5 rounded border hover:bg-black/5 dark:hover:bg-white/10" onClick={signOut}>
            Sign out
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>Wallet</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Stat label="Coins" value={coins} hint={`Next goal: ${nextTarget}`} />
              <Progress value={coins} max={nextTarget} label="Progress to next goal" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {badges.length ? (
                <div className="flex flex-wrap gap-2">
                  {badges.map((b, i) => <Badge key={i}>{b}</Badge>)}
                </div>
              ) : (
                <p className="text-sm text-[color:var(--muted)]">No badges yet — complete scenarios to earn some.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div><span className="text-[color:var(--muted)]">Name:</span> {user?.displayName}</div>
              <div><span className="text-[color:var(--muted)]">Email:</span> {user?.email}</div>
              <div><span className="text-[color:var(--muted)]">Member since:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming activity / placeholder for game feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
            <CardContent className="text-sm text-[color:var(--muted)]">
              No recent activity yet. Play a game to see your history here.
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Quick Start</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>Ready to earn coins?</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>Try the Phishing scenario (coming soon)</li>
                <li>Invite a teammate to compete</li>
                <li>Check the leaderboard</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Protected>
  );
}
