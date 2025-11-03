import Container from "@/src/components/Container";

export const metadata = { title: "Games • TrustOrTrap" };

export default function GamesIndex() {
  return (
    <Container className="py-10">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-2">Games</h2>
        <p className="text-[color:var(--muted)]">
          Phishing, Cyber Pet, and Scam scenarios coming soon.
        </p>
      </div>
    </Container>
  );
}
