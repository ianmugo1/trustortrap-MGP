import Container from "@/src/components/Container";
import Link from "next/link";

export default function HomePage() {
  return (
    <Container className="py-10">
      <section className="card p-8">
        <h1 className="text-3xl font-semibold mb-2">Welcome to TrustOrTrap</h1>
        <p className="text-[color:var(--muted)] mb-6">
          Learn cyber awareness through interactive scenarios. Earn coins, unlock badges, and climb the leaderboard.
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard" className="px-4 py-2 rounded bg-brand-500 text-white hover:opacity-90">
            Go to Dashboard
          </Link>
          <Link href="/games" className="px-4 py-2 rounded border hover:bg-black/5 dark:hover:bg-white/10">
            Explore Games
          </Link>
        </div>
      </section>
    </Container>
  );
}
