"use client";

import Link from "next/link";
import { ShieldAlert, Dog, ScanFace, BookOpenText } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getStoryChapterByGameHref } from "@/lib/storyChapters";

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
  {
    href: "/stories",
    icon: BookOpenText,
    title: "Story Mode",
    description: "Learn phishing, AI fraud, and passwords through short stories.",
    colour: "from-emerald-500 to-teal-500",
    iconColour: "text-emerald-400",
    border: "hover:border-emerald-500/50",
  },
];

export default function GamesPage() {
  const { user } = useAuth();
  const completedStories = user?.storyProgress?.completedSlugs || [];

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-6 py-12">
      {/* page heading */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 text-center">
        Choose a Training Scenario
      </h1>
      <p className="text-slate-400 text-lg mb-12 text-center max-w-md">
        Pick a scenario below to sharpen your cyber safety skills!
      </p>

      {/* game cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 w-full max-w-6xl">
        {games.map((game) => (
          (() => {
            const relatedStory = getStoryChapterByGameHref(game.href);
            const storyCompleted = relatedStory
              ? completedStories.includes(relatedStory.slug)
              : true;

            return (
              <div
                key={game.href}
                className={`group relative bg-slate-900 rounded-2xl border border-slate-800 p-8
                  text-center transition-all duration-300 hover:-translate-y-1
                  hover:shadow-2xl ${game.border}`}
              >
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

                {relatedStory && (
                  <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 text-left">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                      Read first
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {relatedStory.title}
                    </p>
                    <p className="mt-2 text-sm text-slate-400">
                      {storyCompleted
                        ? "You already finished the matching story. Start training now."
                        : "Read the matching story first for a quick warm-up before the game."}
                    </p>
                    <div className="mt-4 flex gap-2">
                      {!storyCompleted && (
                        <Link
                          href={`/stories/${relatedStory.slug}`}
                          className="rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
                        >
                          Read story
                        </Link>
                      )}
                      <Link
                        href={
                          relatedStory
                            ? `${game.href}?fromStory=${relatedStory.slug}`
                            : game.href
                        }
                        className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                      >
                        Start game
                      </Link>
                    </div>
                  </div>
                )}

                {!relatedStory && (
                  <Link
                    href={game.href}
                    className="mt-5 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
                  >
                    Open
                  </Link>
                )}

                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl bg-gradient-to-r
                    ${game.colour} opacity-0 group-hover:opacity-100 transition-opacity`}
                />
              </div>
            );
          })()
        ))}
      </div>
    </main>
  );
}
