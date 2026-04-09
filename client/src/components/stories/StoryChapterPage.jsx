"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Dog,
  KeyRound,
  MessageSquareWarning,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { STORY_CHAPTERS } from "@/lib/storyChapters";
import { useAuth } from "@/context/AuthContext";
import { authFetch } from "@/lib/api";

const ICON_MAP = {
  message: MessageSquareWarning,
  bot: Bot,
  dog: Dog,
};

export default function StoryChapterPage({ chapter }) {
  const { token, user, refreshUser } = useAuth();
  const [slideIndex, setSlideIndex] = useState(0);
  const [completionState, setCompletionState] = useState({
    saving: false,
    completed: false,
    error: "",
  });

  const Icon = ICON_MAP[chapter.icon] || Sparkles;
  const slide = chapter.slides[slideIndex];
  const chapterIndex = STORY_CHAPTERS.findIndex((item) => item.slug === chapter.slug);
  const previousChapter = chapterIndex > 0 ? STORY_CHAPTERS[chapterIndex - 1] : null;
  const nextChapter =
    chapterIndex < STORY_CHAPTERS.length - 1 ? STORY_CHAPTERS[chapterIndex + 1] : null;

  const progress = useMemo(() => {
    return Math.round(((slideIndex + 1) / chapter.slides.length) * 100);
  }, [chapter.slides.length, slideIndex]);

  const isFinalSlide = slideIndex === chapter.slides.length - 1;
  const alreadyCompleted = Boolean(
    user?.storyProgress?.completedSlugs?.includes(chapter.slug)
  );

  useEffect(() => {
    setCompletionState((prev) => ({
      ...prev,
      completed: alreadyCompleted,
      error: "",
    }));
  }, [alreadyCompleted]);

  useEffect(() => {
    if (!token || !isFinalSlide || alreadyCompleted || completionState.saving) {
      return;
    }

    let cancelled = false;

    async function saveCompletion() {
      setCompletionState((prev) => ({ ...prev, saving: true, error: "" }));

      try {
        const res = await authFetch(
          "/api/users/me/story-progress",
          {
            method: "POST",
            body: JSON.stringify({
              slug: chapter.slug,
              relatedTopic: chapter.relatedTopic,
            }),
          },
          token
        );
        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Could not save story progress.");
        }

        if (!cancelled) {
          setCompletionState({ saving: false, completed: true, error: "" });
        }

        if (typeof refreshUser === "function") {
          await refreshUser();
        }
      } catch (err) {
        if (!cancelled) {
          setCompletionState({
            saving: false,
            completed: alreadyCompleted,
            error: err?.message || "Could not save story progress.",
          });
        }
      }
    }

    saveCompletion();

    return () => {
      cancelled = true;
    };
  }, [
    alreadyCompleted,
    chapter.relatedTopic,
    chapter.slug,
    completionState.saving,
    isFinalSlide,
    refreshUser,
    token,
  ]);

  return (
    <main className="min-h-screen bg-transparent px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_30px_90px_-55px_rgba(15,23,42,0.35)] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-orange-600">
                Story Chapter {chapter.chapterNumber}
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                {chapter.title}
              </h1>
              <p className="mt-3 text-base text-slate-600 sm:text-lg">
                {chapter.subtitle}
              </p>
            </div>

            <Link
              href="/stories"
              className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back to stories
            </Link>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_90px_-55px_rgba(15,23,42,0.35)]">
          <div className={`bg-gradient-to-r ${chapter.accent} px-5 py-5 text-white sm:px-6`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                    {chapter.subtitle}
                  </p>
                </div>
                <h2 className="mt-3 text-3xl font-black">{chapter.title}</h2>
              </div>
              <div className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                Scene {slideIndex + 1} of {chapter.slides.length}
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/20">
              <div
                className="h-2 rounded-full bg-white transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
            <div className={`min-h-[340px] bg-gradient-to-br ${chapter.accent} p-6 text-white sm:p-8`}>
              <div className="rounded-[1.8rem] border border-white/20 bg-black/15 p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                  {slide.scene}
                </p>
                <h3 className="mt-3 text-2xl font-black">{slide.title}</h3>
                <p className="mt-4 max-w-md text-base text-white/90">{slide.body}</p>
              </div>

              <div className="mt-5 rounded-[1.6rem] border border-white/20 bg-white/10 p-4 text-sm text-white/85 backdrop-blur">
                <p className="font-semibold text-white">Picture it like this</p>
                <p className="mt-2">{slide.visual}</p>
              </div>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className={`rounded-[1.5rem] border p-4 ${chapter.softAccent}`}>
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                  {chapter.definitionTitle}
                </p>
                <p className="mt-3 text-sm font-medium">{chapter.definition}</p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">Why it matters</p>
                <p className="mt-2 text-sm text-slate-700">{chapter.whyItMatters}</p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-950">{chapter.clueTitle}</p>
                <div className="mt-3 space-y-2">
                  {chapter.clues.map((clue) => (
                    <p
                      key={clue}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      {clue}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setSlideIndex((current) => Math.max(0, current - 1))}
                  disabled={slideIndex === 0}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSlideIndex((current) =>
                      Math.min(chapter.slides.length - 1, current + 1)
                    )
                  }
                  disabled={slideIndex === chapter.slides.length - 1}
                  className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
                {completionState.completed && (
                  <span className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                    Story saved
                  </span>
                )}
              </div>
              {isFinalSlide && completionState.saving && (
                <p className="text-sm text-slate-500">Saving your story progress...</p>
              )}
              {completionState.error && (
                <p className="text-sm text-rose-500">{completionState.error}</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.28)] sm:p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-slate-900" />
              <h3 className="text-lg font-semibold text-slate-950">Remember this</h3>
            </div>
            <div className="mt-4 grid gap-3">
              {chapter.safetyRules.map((rule) => (
                <div
                  key={rule}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                >
                  {rule}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.28)] sm:p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-lg font-semibold text-slate-950">Practice next</h3>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Ready to try what this story taught you?
            </p>
            <Link
              href={chapter.relatedGame.href}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
            >
              {chapter.relatedGame.label}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <KeyRound className="h-4 w-4" />
                Big idea
              </div>
              <p className="mt-2 text-sm text-slate-700">
                Online safety is about slowing down, checking what is real, and keeping your
                secrets safe.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-56px_rgba(15,23,42,0.22)]">
          {previousChapter ? (
            <Link
              href={`/stories/${previousChapter.slug}`}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              {previousChapter.title}
            </Link>
          ) : (
            <span className="text-sm text-slate-400">First chapter</span>
          )}

          {nextChapter ? (
            <Link
              href={`/stories/${nextChapter.slug}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
            >
              {nextChapter.title}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/stories"
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
            >
              Back to hub
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}
