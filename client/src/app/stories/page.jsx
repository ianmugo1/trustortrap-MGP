import Link from "next/link";
import { Bot, Dog, MessageSquareWarning, ShieldCheck, Stars } from "lucide-react";
import { STORY_CHAPTERS } from "@/lib/storyChapters";

const ICON_MAP = {
  message: MessageSquareWarning,
  bot: Bot,
  dog: Dog,
};

export default function StoriesHubPage() {
  return (
    <main className="min-h-screen bg-transparent px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.35)] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-600">
                Story Mode
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                The Online Safety Adventures
              </h1>
              <p className="mt-3 text-base text-slate-600 sm:text-lg">
                Short story chapters that explain cyber dangers to younger kids in a fun,
                simple way before they try the training games.
              </p>
            </div>

            <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <div className="flex items-center gap-2 font-semibold text-slate-950">
                <Stars className="h-4 w-4 text-amber-500" />
                Best flow
              </div>
              <p className="mt-2">Read a chapter, learn the meaning, then play the matching game.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {STORY_CHAPTERS.map((chapter) => {
            const Icon = ICON_MAP[chapter.icon] || ShieldCheck;

            return (
              <Link
                key={chapter.slug}
                href={`/stories/${chapter.slug}`}
                className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.28)] transition hover:-translate-y-1 hover:border-slate-300"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${chapter.accent} text-white`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Chapter {chapter.chapterNumber}
                </p>
                <h2 className="mt-2 text-xl font-black text-slate-950">{chapter.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{chapter.subtitle}</p>

                <div className={`mt-4 rounded-2xl border p-4 ${chapter.softAccent}`}>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                    {chapter.definitionTitle}
                  </p>
                  <p className="mt-2 text-sm">{chapter.definition}</p>
                </div>

                <div className="mt-4 space-y-2">
                  {chapter.clues.slice(0, 2).map((clue) => (
                    <p
                      key={clue}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      {clue}
                    </p>
                  ))}
                </div>

                <div className="mt-5 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white">
                  Open story
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
