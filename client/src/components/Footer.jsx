import Container from "@/src/components/Container";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-black/10 dark:border-white/10">
      <Container className="py-6 text-sm text-[color:var(--muted)] flex items-center justify-between">
        <span>© {new Date().getFullYear()} TrustOrTrap</span>
        <a href="mailto:itsupport@example.com" className="hover:underline">Contact</a>
      </Container>
    </footer>
  );
}
