"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { useStore } from "@/lib/store";
import { fetchCloudCourses } from "@/lib/db";
import CourseTile from "@/components/CourseTile";
import GenerateModal from "@/components/GenerateModal";
import AccessibilityMenu from "@/components/AccessibilityMenu";

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const cards = useStore((s) => s.cards);
  const loadAll = useStore((s) => s.loadAll);
  const [gen, setGen] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);

  // The dashboard is Clerk-protected (middleware), so the user is signed in
  // here — load their courses from the cloud.
  useEffect(() => {
    if (!isLoaded || !user) return;
    setLoadingCourses(true);
    fetchCloudCourses()
      .then((res) => {
        if (res) loadAll(res.courses, res.cards);
      })
      .catch(() => {})
      .finally(() => setLoadingCourses(false));
  }, [isLoaded, user, loadAll]);

  if (!isLoaded) {
    return (
      <main className="grid-bg flex min-h-screen items-center justify-center">
        <div className="animate-float text-4xl">🧠</div>
      </main>
    );
  }

  return (
    <main className="grid-bg relative flex h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="z-40 flex shrink-0 items-center justify-between px-8 py-6">
        <div>
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold tracking-tight transition hover:opacity-80">
              Diverse<span className="grad-text">Learning</span>
            </h1>
          </Link>
          <p className="text-xs text-white/40">
            Signed in as {user?.primaryEmailAddress?.emailAddress ?? "you"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/learn"
            className="hidden rounded-xl px-3 py-2 text-sm font-medium text-white/70 transition hover:text-white sm:inline-block"
          >
            Library
          </Link>
          <AccessibilityMenu />
          <button
            onClick={() => setGen(true)}
            className="rounded-2xl bg-gradient-to-r from-accent to-glow px-5 py-2.5 text-sm font-semibold shadow-lg shadow-accent/20 transition hover:scale-[1.03] hover:shadow-accent/40"
          >
            + New course
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      {/* Draggable canvas */}
      <section className="relative min-h-0 w-full flex-1 overflow-hidden">
        {loadingCourses ? (
          <div className="flex h-full items-center justify-center text-sm text-white/40">
            Loading your courses…
          </div>
        ) : cards.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="animate-float text-6xl">🧠</div>
            <h2 className="mt-6 text-xl font-semibold text-white/80">
              No courses yet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-white/40">
              Tell us anything you&apos;re curious about and we&apos;ll build a 3D
              course around it — drag the cards anywhere you like.
            </p>
            <button
              onClick={() => setGen(true)}
              className="mt-6 rounded-2xl bg-gradient-to-r from-accent to-glow px-6 py-3 text-sm font-semibold transition hover:scale-105"
            >
              Create your first course ✨
            </button>
          </div>
        ) : (
          cards.map((card) => <CourseTile key={card.id} card={card} />)
        )}
      </section>

      {/* Footer */}
      <footer className="glass z-30 flex shrink-0 items-center justify-between gap-4 border-t border-white/10 px-8 py-3 text-xs text-white/50">
        <span className="flex items-center gap-2">
          <span className="font-semibold text-white/70">
            Diverse<span className="text-accent">Learning</span>
          </span>
          <span className="hidden text-white/30 sm:inline">
            · interactive 3D courses
          </span>
        </span>

        <span className="hidden text-white/40 md:inline">
          Drag cards to rearrange · click to open
        </span>

        <span className="flex items-center gap-2">
          <span>
            {cards.length} course{cards.length === 1 ? "" : "s"}
          </span>
          <span className="text-white/20">|</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Synced
          </span>
        </span>
      </footer>

      {gen && <GenerateModal onClose={() => setGen(false)} />}
    </main>
  );
}
