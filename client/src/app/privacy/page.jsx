import Link from "next/link";

export const metadata = { title: "Privacy policy | TrustOrTrap" };

// TODO: replace with the contact email shown on the App Store listing
const CONTACT_EMAIL = "you@example.com";

const sections = [
  {
    heading: "What we collect",
    body: "When you create an account we store your username, email address and a hashed version of your password. We never see or store your password in plain text. As you play, we store your game progress: XP, coins, levels, streaks, Cyber Pet status, game results and shop items.",
  },
  {
    heading: "Why we collect it",
    body: "We use this data only to run the app: signing you in, saving your progress and showing the leaderboard. Your username, level, XP and coins appear on the leaderboard. Your email does not.",
  },
  {
    heading: "What we don't do",
    body: "We don't sell your data, show ads, or use tracking or analytics tools. We don't share your data with third parties except the services that host the app (Vercel for the website and API, MongoDB Atlas for the database).",
  },
  {
    heading: "Notifications",
    body: "The iOS app can send a daily Cyber Pet reminder. It is scheduled on your device and can be turned off under Settings > App notifications or in your phone's settings.",
  },
  {
    heading: "Deleting your data",
    body: "You can delete your account at any time from Settings > Delete account. This permanently removes your account, progress and Cyber Pet.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <h1 className="text-2xl font-bold">Privacy policy</h1>
      <p className="text-sm text-slate-400">Last updated: 20 October 2026</p>
      {sections.map((s) => (
        <section key={s.heading}>
          <h2 className="mb-2 font-semibold text-emerald-300">{s.heading}</h2>
          <p className="text-slate-300">{s.body}</p>
        </section>
      ))}
      <section>
        <h2 className="mb-2 font-semibold text-emerald-300">Contact</h2>
        <p className="text-slate-300">
          Questions about your data: <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </section>
      <Link href="/" className="inline-block text-cyan-300 underline">
        Back to TrustOrTrap
      </Link>
    </main>
  );
}
