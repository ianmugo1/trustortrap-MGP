"use client";

import Link from "next/link";
import { ShieldAlert, Dog, ScanFace } from "lucide-react";

// game card data for each training scenario
const games = [
  {
    href: "/games/phishing",
    icon: ShieldAlert,
    title: "Phishing Detection",
    description: "Identify fake emails and dangerous messages.",
    colour: "from-blue-500 to-cyan-500",
    iconColour: "text-blue-400",
    border: "hover:border-blue-500/50",
  },
  {
    href: "/games/cyberpet",
    icon: Dog,
    title: "Protect Your Cyber Pet",
    description: "Complete the daily objective to protect your cyber pet.",
    colour: "from-violet-500 to-fuchsia-500",
    iconColour: "text-violet-400",
    border: "hover:border-violet-500/50",
  },
  {
    href: "/games/social",
    icon: ScanFace,
    title: "Social Media Safety",
    description: "Make the safest choice in online scenarios.",
    colour: "from-rose-500 to-orange-500",
    iconColour: "text-rose-400",
    border: "hover:border-rose-500/50",
  },
];

export default function GamesPage() {
  return (
    <main className="relative min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
      {/* yellow and blue polkadot background overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #facc15 8px, transparent 8px), radial-gradient(circle, #3b82f6 8px, transparent 8px)",
          backgroundSize: "60px 60px",
          backgroundPosition: "0 0, 30px 30px",
        }}
      />

      {/* page heading */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 text-center">
        Choose a Training Scenario
      </h1>
      <p className="text-slate-400 text-lg mb-12 text-center max-w-md">
        Pick a scenario below to sharpen your cyber safety skills!
      </p>

      {/* game cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {games.map((game) => (
          <Link
            key={game.href}
            href={game.href}
            className={`group relative bg-slate-900 rounded-2xl border border-slate-800 p-8
              text-center transition-all duration-300 hover:scale-105 hover:-translate-y-1
              hover:shadow-2xl ${game.border}`}
          >
            {/* gradient glow behind icon */}
            <div
              className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${game.colour}
                p-[2px] mb-6 shadow-lg group-hover:shadow-xl transition-shadow`}
            >
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <game.icon className={`w-10 h-10 ${game.iconColour}`} />
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-2">{game.title}</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              {game.description}
            </p>

            {/* subtle bottom gradient bar */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r
                ${game.colour} opacity-0 group-hover:opacity-100 transition-opacity`}
            />
          </Link>
        ))}
      </div>
    </main>
  );
}
