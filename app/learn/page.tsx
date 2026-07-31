"use client";

import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { CATALOG } from "@/lib/catalog";
import AccessibilityMenu from "@/components/AccessibilityMenu";
import type { Course } from "@/lib/types";

/**
 * The public concept library — browse ready-made, bite-sized courses and open
 * any of them instantly (no sign-in, no generation). SmartyMe-style learning
 * built on the same 3D-capable course viewer.
 */
export default function LearnPage() {
  return (
    <main className="grid-bg min-h-screen">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link href="/" className="text-xl font-bold tracking-tight transition hover:opacity-80">
          Diverse<span className="grad-text">Learning</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <AccessibilityMenu />
          <SignedOut>
            <Link
              href="/sign-in"
              className="rounded-xl border border-white/15 px-4 py-2 font-medium text-white/80 transition hover:bg-white/10"
            >
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-xl bg-gradient-to-r from-accent to-glow px-4 py-2 font-semibold shadow-lg shadow-accent/20 transition hover:scale-[1.03]"
            >
              My dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </header>

      {/* Intro */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-6 sm:px-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-accent2" />
          The concept library
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-5xl">
          Learn a concept in <span className="grad-text">minutes.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60">
          Short, hands-on courses on how things actually work — from Ohm&apos;s law
          to logic gates to the atom. Tap any card to start. No account needed.
        </p>
      </section>

      {/* Categories */}
      <section className="mx-auto w-full max-w-6xl space-y-12 px-6 py-12 sm:px-10">
        {CATALOG.map((cat) => (
          <div key={cat.id}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{cat.icon}</span>
              <div>
                <h2 className="text-xl font-bold">{cat.name}</h2>
                <p className="text-sm text-white/50">{cat.blurb}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cat.courses.map((course) => (
                <CatalogCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-16 sm:px-10">
        <div className="glass flex flex-col items-start gap-4 rounded-3xl p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Want a course on something else?</h3>
            <p className="mt-1 text-sm text-white/55">
              Sign in and generate an interactive 3D course on any topic you like.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="rounded-2xl bg-gradient-to-r from-accent to-glow px-6 py-3 text-sm font-semibold shadow-lg shadow-accent/25 transition hover:scale-[1.03]"
          >
            Build your own →
          </Link>
        </div>
      </section>
    </main>
  );
}

function CatalogCard({ course }: { course: Course }) {
  const has3D = course.lessons.some((l) => l.model);
  return (
    <Link
      href={`/course/${course.id}`}
      className="glass group flex flex-col rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
      style={{ boxShadow: `0 0 0 1px ${course.accent}22` }}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold leading-tight text-white/90 group-hover:text-white">
          {course.title}
        </h3>
        <span
          className="mt-0.5 h-2.5 w-2.5 flex-none rounded-full"
          style={{ background: course.accent }}
        />
      </div>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-white/55">
        {course.subtitle}
      </p>
      <div className="mt-4 flex items-center gap-2 text-[11px] text-white/40">
        <span
          className="rounded-full px-2 py-0.5 font-semibold uppercase tracking-wider"
          style={{ background: `${course.accent}22`, color: course.accent }}
        >
          {course.level}
        </span>
        <span>{course.lessons.length} lessons</span>
        {has3D && (
          <span className="rounded-full bg-white/10 px-2 py-0.5 font-medium text-white/60">
            3D
          </span>
        )}
      </div>
    </Link>
  );
}
