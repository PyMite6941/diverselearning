"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { fetchCloudCourse } from "@/lib/db";
import AccessibilityMenu from "@/components/AccessibilityMenu";
import LessonReader from "@/components/LessonReader";
import ConceptView from "@/components/ConceptView";
import type { Course } from "@/lib/types";

// 3D viewers must be client-only (no SSR for WebGL).
const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-white/40">
      Loading 3D model…
    </div>
  ),
});
const GLBViewer = dynamic(() => import("@/components/GLBViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-white/40">
      Loading model…
    </div>
  ),
});

type Asset = { url: string; name?: string; credit?: string };

export default function CoursePage() {
  const params = useParams();
  const id = params.id as string;
  const getCourse = useStore((s) => s.getCourse);
  const cacheCourse = useStore((s) => s.cacheCourse);
  const setLessonAsset = useStore((s) => s.setLessonAsset);
  const [course, setCourse] = useState<Course | undefined>();
  const [active, setActive] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loadingCloud, setLoadingCloud] = useState(false);

  // Realistic-model state, keyed per lesson index.
  const [assets, setAssets] = useState<Record<number, Asset>>({});
  const [view, setView] = useState<"diagram" | "realistic">("diagram");
  const [finding, setFinding] = useState(false);
  const [findMsg, setFindMsg] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!mounted) return;
    const local = getCourse(id);
    if (local) {
      setCourse(local);
      return;
    }
    // Not in local memory — try the cloud (deep-link on a fresh device).
    setLoadingCloud(true);
    fetchCloudCourse(id)
      .then((c) => {
        if (c) {
          cacheCourse(c);
          setCourse(c);
        }
      })
      .finally(() => setLoadingCloud(false));
  }, [mounted, id, getCourse, cacheCourse]);

  useEffect(() => {
    setShowAnswer(false);
    setView("diagram");
    setFindMsg(null);
  }, [active]);

  if (!mounted) return null;

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-white/60">
          {loadingCloud ? "Loading course…" : "Course not found, or sign in to access it."}
        </p>
        <Link href="/dashboard" className="text-accent underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const lesson = course.lessons[active];
  const currentAsset: Asset | undefined = assets[active] ?? lesson.asset;

  async function findRealistic() {
    setFinding(true);
    setFindMsg(null);
    try {
      const q = `${lesson.title} ${course!.topic}`;
      const res = await fetch(`/api/find-model?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.model?.url) {
        const found = data.model as Asset;
        setAssets((a) => ({ ...a, [active]: found }));
        // Persist the realistic model into the course so it's saved + reappears.
        setLessonAsset(course!.id, active, found);
        setView("realistic");
      } else {
        setFindMsg("No free realistic model found — showing the diagram instead.");
      }
    } catch {
      setFindMsg("Couldn't search for a model right now.");
    } finally {
      setFinding(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col lg:flex-row">
      {/* Sidebar: lesson list */}
      <aside className="glass-strong z-10 flex w-full flex-col border-r border-white/5 lg:h-screen lg:w-80">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="text-xs text-white/40 transition hover:text-white"
            >
              ← Dashboard
            </Link>
            <AccessibilityMenu />
          </div>
          <h1 className="mt-3 text-xl font-bold leading-tight">{course.title}</h1>
          <p className="mt-1 text-sm text-white/50">{course.subtitle}</p>
          <span
            className="mt-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ background: `${course.accent}22`, color: course.accent }}
          >
            {course.level} · {course.topic}
          </span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 pb-6">
          {course.lessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => setActive(i)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                i === active
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className="flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-bold"
                style={{
                  background: i === active ? course.accent : "rgba(255,255,255,0.08)",
                  color: i === active ? "#000" : "rgba(255,255,255,0.6)",
                }}
              >
                {i + 1}
              </span>
              <span className="flex-1 leading-tight">{l.title}</span>
              {l.model && <span className="text-[10px] text-white/30">3D</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main: lesson content + 3D */}
      <section className="flex flex-1 flex-col">
        {/* 3D stage — only for lessons that have a model. Conceptual lessons
            (languages, code, theory) skip it and use the content area below. */}
        {lesson.model && (
          <div className="relative h-[45vh] w-full overflow-hidden border-b border-white/5 lg:h-[55vh]">
            {/* Diagram / Realistic toggle */}
            <div className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/55 p-1 text-xs shadow-lg ring-1 ring-white/10 backdrop-blur">
              <button
                onClick={() => setView("diagram")}
                className={`rounded-full px-3 py-1 font-medium transition ${
                  view === "diagram"
                    ? "bg-white text-black"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Diagram
              </button>
              {currentAsset ? (
                <button
                  onClick={() => setView("realistic")}
                  className={`rounded-full px-3 py-1 font-medium transition ${
                    view === "realistic"
                      ? "bg-white text-black"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  Realistic
                </button>
              ) : (
                <button
                  onClick={findRealistic}
                  disabled={finding}
                  className="rounded-full px-3 py-1 font-medium text-white/70 transition hover:text-white disabled:opacity-50"
                >
                  {finding ? "Searching…" : "Find realistic ✦"}
                </button>
              )}
            </div>

            {view === "realistic" && currentAsset ? (
              <GLBViewer url={currentAsset.url} accent={course.accent} />
            ) : (
              <ModelViewer model={lesson.model} accent={course.accent} />
            )}

            {view === "realistic" && currentAsset?.credit && (
              <div className="pointer-events-none absolute bottom-2 right-3 z-20 max-w-[60%] truncate text-[10px] text-white/40">
                {currentAsset.credit}
              </div>
            )}
            {findMsg && (
              <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/65 px-3 py-1 text-[11px] text-white/70 ring-1 ring-white/10">
                {findMsg}
              </div>
            )}
          </div>
        )}

        {/* Teaching text */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-white/30">
              Lesson {active + 1} of {course.lessons.length}
            </p>
            <h2 className="mt-2 text-3xl font-bold">{lesson.title}</h2>

            <div className="mt-5">
              <LessonReader key={lesson.id} body={lesson.body} accent={course.accent} />
            </div>

            {lesson.concept && (
              <ConceptView concept={lesson.concept} accent={course.accent} />
            )}

            {lesson.check && (
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent2">
                  Quick check
                </p>
                <p className="mt-2 text-white/85">{lesson.check.question}</p>
                {showAnswer ? (
                  <p className="mt-3 text-white/60">
                    <span className="font-semibold text-white/80">Answer: </span>
                    {lesson.check.answer}
                  </p>
                ) : (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="mt-3 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 transition hover:bg-white/10"
                  >
                    Reveal answer
                  </button>
                )}
              </div>
            )}

            {/* nav */}
            <div className="mt-10 flex items-center justify-between">
              <button
                disabled={active === 0}
                onClick={() => setActive((a) => Math.max(0, a - 1))}
                className="rounded-xl px-4 py-2 text-sm text-white/60 transition hover:text-white disabled:opacity-30"
              >
                ← Previous
              </button>
              <button
                disabled={active === course.lessons.length - 1}
                onClick={() =>
                  setActive((a) => Math.min(course.lessons.length - 1, a + 1))
                }
                className="rounded-xl bg-gradient-to-r from-accent to-glow px-5 py-2 text-sm font-semibold transition hover:opacity-90 disabled:opacity-30"
              >
                Next lesson →
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
