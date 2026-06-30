"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/lib/useAuth";
import { fetchCloudCourses } from "@/lib/db";
import CourseTile from "@/components/CourseTile";
import GenerateModal from "@/components/GenerateModal";
import AuthModal from "@/components/AuthModal";

export default function Dashboard() {
  const cards = useStore((s) => s.cards);
  const courses = useStore((s) => s.courses);
  const addCourse = useStore((s) => s.addCourse);
  const loadAll = useStore((s) => s.loadAll);
  const reset = useStore((s) => s.reset);

  const auth = useAuth();
  const [gen, setGen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // When a user signs in, pull their courses from the cloud and show them.
  useEffect(() => {
    if (!mounted || auth.loading) return;
    if (auth.user) {
      fetchCloudCourses()
        .then((res) => {
          if (res) loadAll(res.courses, res.cards);
        })
        .catch(() => {});
    }
  }, [mounted, auth.loading, auth.user, loadAll]);

  // First-run seed (local-only mode, signed-out): don't leave the board empty.
  useEffect(() => {
    if (!mounted || auth.loading) return;
    if (
      !auth.cloudEnabled &&
      courses.length === 0 &&
      !localStorage.getItem("dl-seeded")
    ) {
      import("@/lib/courseGen").then(({ sampleCourse }) => {
        addCourse(sampleCourse());
        localStorage.setItem("dl-seeded", "1");
      });
    }
  }, [mounted, auth.loading, auth.cloudEnabled, courses.length, addCourse]);

  if (!mounted) return null;

  const signedIn = !!auth.user;
  const needsAccount = auth.cloudEnabled && !signedIn;

  return (
    <main className="grid-bg relative min-h-screen overflow-hidden">
      {/* Header */}
      <header className="pointer-events-none sticky top-0 z-40 flex items-center justify-between px-8 py-6">
        <div className="pointer-events-auto">
          <h1 className="text-2xl font-bold tracking-tight">
            Diverse<span className="grad-text">Learning</span>
          </h1>
          <p className="text-xs text-white/40">
            {signedIn
              ? `Signed in as ${auth.user!.email}`
              : "Your personal, interactive 3D classroom"}
          </p>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={() => setGen(true)}
            className="rounded-2xl bg-gradient-to-r from-accent to-glow px-5 py-2.5 text-sm font-semibold shadow-lg shadow-accent/20 transition hover:scale-[1.03] hover:shadow-accent/40"
          >
            + New course
          </button>

          {auth.cloudEnabled &&
            (signedIn ? (
              <div className="relative">
                <button
                  onClick={() => setMenu((m) => !m)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-sm font-bold uppercase ring-1 ring-white/15 transition hover:bg-white/20"
                  title={auth.user!.email ?? "Account"}
                >
                  {(auth.user!.email ?? "?")[0]}
                </button>
                {menu && (
                  <div className="glass-strong absolute right-0 mt-2 w-44 rounded-xl p-1.5 text-sm">
                    <div className="truncate px-3 py-2 text-xs text-white/40">
                      {auth.user!.email}
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
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="rounded-2xl border border-white/15 px-5 py-2.5 text-sm font-medium transition hover:bg-white/10"
              >
                Sign in
              </button>
            ))}
        </div>
      </header>

      {/* Sign-in nudge banner for cloud mode */}
      {needsAccount && (
        <div className="pointer-events-auto mx-8 mb-2 flex items-center justify-between rounded-2xl border border-accent/20 bg-accent/10 px-5 py-3 text-sm">
          <span className="text-white/80">
            Sign in to save your courses to your account and open them on any device.
          </span>
          <button
            onClick={() => setAuthOpen(true)}
            className="ml-4 shrink-0 rounded-xl bg-white/10 px-4 py-1.5 font-medium transition hover:bg-white/20"
          >
            Sign in
          </button>
        </div>
      )}

      {/* Draggable canvas */}
      <section className="relative h-[calc(100vh-96px)] w-full">
        {cards.length === 0 ? (
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

        {cards.length > 0 && (
          <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 text-xs text-white/40 backdrop-blur">
            Tip: drag cards to rearrange your board · click to open
          </div>
        )}
      </section>

      {gen && <GenerateModal onClose={() => setGen(false)} />}
      {authOpen && <AuthModal auth={auth} onClose={() => setAuthOpen(false)} />}
    </main>
  );
}
