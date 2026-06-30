"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import CourseTile from "@/components/CourseTile";
import GenerateModal from "@/components/GenerateModal";

export default function Dashboard() {
  const cards = useStore((s) => s.cards);
  const courses = useStore((s) => s.courses);
  const addCourse = useStore((s) => s.addCourse);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Seed a sample course the very first time so the canvas isn't empty.
  useEffect(() => {
    if (!mounted) return;
    if (courses.length === 0 && !localStorage.getItem("dl-seeded")) {
      import("@/lib/courseGen").then(({ sampleCourse }) => {
        addCourse(sampleCourse());
        localStorage.setItem("dl-seeded", "1");
      });
    }
  }, [mounted, courses.length, addCourse]);

  if (!mounted) return null;

  return (
    <main className="grid-bg relative min-h-screen overflow-hidden">
      {/* Header */}
      <header className="pointer-events-none sticky top-0 z-40 flex items-center justify-between px-8 py-6">
        <div className="pointer-events-auto">
          <h1 className="text-2xl font-bold tracking-tight">
            Diverse<span className="grad-text">Learning</span>
          </h1>
          <p className="text-xs text-white/40">
            Your personal, interactive 3D classroom
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="pointer-events-auto rounded-2xl bg-gradient-to-r from-accent to-glow px-5 py-2.5 text-sm font-semibold shadow-lg shadow-accent/20 transition hover:scale-[1.03] hover:shadow-accent/40"
        >
          + New course
        </button>
      </header>

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
              onClick={() => setOpen(true)}
              className="mt-6 rounded-2xl bg-gradient-to-r from-accent to-glow px-6 py-3 text-sm font-semibold transition hover:scale-105"
            >
              Create your first course ✨
            </button>
          </div>
        ) : (
          cards.map((card) => <CourseTile key={card.id} card={card} />)
        )}

        {/* hint */}
        {cards.length > 0 && (
          <div className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-4 py-1.5 text-xs text-white/40 backdrop-blur">
            Tip: drag cards to rearrange your board · click to open
          </div>
        )}
      </section>

      {open && <GenerateModal onClose={() => setOpen(false)} />}
    </main>
  );
}
