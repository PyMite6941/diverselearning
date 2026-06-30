"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/useAuth";
import { fetchCloudCourses } from "@/lib/db";
import CourseTile from "@/components/CourseTile";
import GenerateModal from "@/components/GenerateModal";
import AuthModal from "@/components/AuthModal";
import AccessibilityMenu from "@/components/AccessibilityMenu";

export default function Dashboard() {
  const router = useRouter();
  const cards = useStore((s) => s.cards);
  const loadAll = useStore((s) => s.loadAll);
  const reset = useStore((s) => s.reset);

  const auth = useAuth();
  const [gen, setGen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => setMounted(true), []);

  // Sign-in is required: pull the user's courses from the cloud once in.
  useEffect(() => {
    if (!mounted || auth.loading) return;
    if (!auth.user) {
      reset();
      setLoadingCourses(false);
      return;
    }
    setLoadingCourses(true);
    fetchCloudCourses()
      .then((res) => {
        if (res) loadAll(res.courses, res.cards);
      })
      .catch(() => {})
      .finally(() => setLoadingCourses(false));
  }, [mounted, auth.loading, auth.user, loadAll, reset]);

  if (!mounted || auth.loading) {
    return (
      <main className="grid-bg flex min-h-screen items-center justify-center">
        <div className="animate-float text-4xl">🧠</div>
      </main>
    );
  }

  // Backend misconfiguration guard (shouldn't happen in a normal deploy).
  if (!auth.cloudEnabled) {
    return (
      <main className="grid-bg flex min-h-screen items-center justify-center px-6">
        <div className="glass-strong max-w-md rounded-2xl p-7 text-center">
          <h1 className="text-xl font-bold">Backend not configured</h1>
          <p className="mt-2 text-sm text-white/60">
            This deployment is missing its Supabase keys
            (<code>NEXT_PUBLIC_SUPABASE_URL</code> /{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>). Accounts are required to
            use DiverseLearning.
          </p>
          <Link href="/" className="mt-5 inline-block text-accent underline">
            ← Back home
          </Link>
        </div>
      </main>
    );
  }

  // Required sign-in gate.
  if (!auth.user) {
    return (
      <main className="grid-bg flex min-h-screen items-center justify-center">
        <AuthModal auth={auth} onClose={() => router.push("/")} />
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
          <p className="text-xs text-white/40">Signed in as {auth.user.email}</p>
        </div>

        <div className="flex items-center gap-3">
          <AccessibilityMenu />
          <button
            onClick={() => setGen(true)}
            className="rounded-2xl bg-gradient-to-r from-accent to-glow px-5 py-2.5 text-sm font-semibold shadow-lg shadow-accent/20 transition hover:scale-[1.03] hover:shadow-accent/40"
          >
            + New course
          </button>

          <div className="relative">
            <button
              onClick={() => setMenu((m) => !m)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold uppercase ring-1 ring-white/15 transition hover:bg-white/20"
              title={auth.user.email ?? "Account"}
            >
              {(auth.user.email ?? "?")[0]}
            </button>
            {menu && (
              <div className="glass-strong absolute right-0 mt-2 w-44 rounded-xl p-1.5 text-sm">
                <div className="truncate px-3 py-2 text-xs text-white/40">
                  {auth.user.email}
                </div>
                <button
                  onClick={async () => {
                    setMenu(false);
                    await auth.signOut();
                    reset();
                  }}
                  className="w-full rounded-lg px-3 py-2 text-left transition hover:bg-white/10"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
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
