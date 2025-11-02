"use client";
import Protected from "@/src/components/Protected";
import { useAuth } from "@/src/context/AuthContext";
import Container from "@/src/components/Container";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import SectionTitle from "@/src/components/ui/SectionTitle";
import Progress from "@/src/components/ui/Progress";
import Stat from "@/src/components/ui/Stat";
import Button from "@/src/components/ui/Button";
import Avatar from "@/src/components/ui/Avatar";
import EmptyState from "@/src/components/ui/EmptyState";
import CardGrid from "@/src/components/ui/CardGrid";
import { motion } from "framer-motion";
import { riseIn } from "@/src/components/ui/motion";
import { Coins, Medal, User2 } from "lucide-react";
import LeaderboardPreview from "@/src/components/LeaderboardPreview";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const coins = user?.coins ?? 0;
  const nextTarget = coins < 100 ? 100 : coins < 250 ? 250 : 500;
  const badges = user?.badges ?? [];

  return (
    <Protected>
      <Container className="py-8 space-y-6">
        <div className="flex items-center justify-between">
          <SectionTitle title="Dashboard" subtitle="Your current progress and profile" />
          <div className="flex gap-2">
            <Button variant="outline" onClick={signOut}>Sign out</Button>
            <Button variant="primary">Play (soon)</Button>
          </div>
        </div>

        {/* Profile header */}
        <motion.div {...riseIn}>
          <Card>
            <CardContent className="flex items-center gap-4">
              <Avatar name={user?.displayName} size={48} />
              <div className="flex-1">
                <div className="font-semibold">{user?.displayName}</div>
                <div className="text-sm text-[color:var(--muted)]">{user?.email}</div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <Badge><User2 className="h-3.5 w-3.5 mr-1" /> Member</Badge>
                <Badge><Medal className="h-3.5 w-3.5 mr-1" /> {badges.length} badges</Badge>
                <Badge><Coins className="h-3.5 w-3.5 mr-1" /> {coins} coins</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <CardGrid>
          <motion.div {...riseIn}>
            <Card>
              <CardHeader><CardTitle>Wallet</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  <Stat label="Coins" value={coins} hint={`Next goal: ${nextTarget}`} />
                </div>
                <Progress value={coins} max={nextTarget} label="Progress to next goal" />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...riseIn}>
            <Card>
              <CardHeader><CardTitle>Badges</CardTitle></CardHeader>
              <CardContent>
                {badges.length ? (
                  <div className="flex flex-wrap gap-2">
                    {badges.map((b, i) => <Badge key={i}>{b}</Badge>)}
                  </div>
                ) : (
                  <EmptyState title="No badges yet" subtitle="Complete scenarios to earn badges." />
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div {...riseIn}>
            <Card>
              <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
              <CardContent className="space-y-1 text-sm">
                <div><span className="text-[color:var(--muted)]">Name:</span> {user?.displayName}</div>
                <div><span className="text-[color:var(--muted)]">Email:</span> {user?.email}</div>
                <div><span className="text-[color:var(--muted)]">Member since:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</div>
              </CardContent>
            </Card>
          </motion.div>
        </CardGrid>

        {/* Activity & Quick start */}
        <CardGrid cols={{ base:1, md:1, lg:2 }}>
          <motion.div {...riseIn}>
            <Card>
              <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
              <CardContent>
                <EmptyState title="No activity yet" subtitle="Play a scenario to see your history here." />
              </CardContent>
            </Card>
          </motion.div>

          <div className="col-span-12 lg:col-span-4">
  <LeaderboardPreview />
</div>

          <motion.div {...riseIn}>
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
          </motion.div>
        </CardGrid>
      </Container>
    </Protected>
  );
}
