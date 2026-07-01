"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import { sampleCourse } from "@/lib/courseGen";

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-white/40">
      Loading 3D preview…
    </div>
  ),
});

const FEATURES = [
  {
    icon: "✨",
    title: "Courses built for you",
    body: "Tell it any topic or interest. It writes a personal course — lesson by lesson — just for you.",
  },
  {
    icon: "🧊",
    title: "Interactive 3D models",
    body: "Every concept becomes a model you can rotate, zoom, and explore right in the page.",
  },
  {
    icon: "⤢",
    title: "Break everything down",
    body: "Explode any model into its parts and click each one to learn exactly what it does.",
  },
  {
    icon: "🌐",
    title: "Realistic models",
    body: "Pull in real 3D models from free, open libraries when a diagram isn't enough.",
  },
  {
    icon: "🔤",
    title: "Built for every reader",
    body: "One tap for a dyslexia-friendly font, roomier text, and fully recolorable themes.",
  },
  {
    icon: "☁️",
    title: "Saved to your account",
    body: "Sign in and your courses follow you to any device, right where you left off.",
  },
];

export default function Home() {
  const { isSignedIn } = useUser();
  const [mounted, setMounted] = useState(false);
  // Mount the heavy 3D hero only once the page is interactive, so the landing
  // paints and becomes usable immediately instead of waiting on three.js.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMounted(true);
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = (window as any).requestIdleCallback(() => setReady(true));
    } else {
      timeoutId = setTimeout(() => setReady(true), 200);
    }
    return () => {
      if (idleId !== undefined) (window as any).cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  // A real, interactive model as the hero — the product, live, on first sight.
  const heroModel = useMemo(() => sampleCourse().lessons[0].model, []);

  const signedIn = mounted && !!isSignedIn;

  return (
    <main className="grid-bg flex min-h-screen flex-col">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <span className="text-xl font-bold tracking-tight">
          Diverse<span className="grad-text">Learning</span>
        </span>
        <nav className="flex items-center gap-3 text-sm">
          <SignedOut>
            <Link
              href="/sign-in"
              className="rounded-xl border border-white/15 px-4 py-2 font-medium text-white/80 transition hover:bg-white/10"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-xl bg-gradient-to-r from-accent to-glow px-4 py-2 font-semibold shadow-lg shadow-accent/20 transition hover:scale-[1.03]"
            >
              Get started
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

      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-6 py-10 sm:px-10 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-accent2" />
            Learn anything, in 3D
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Understand it by <span className="grad-text">taking it apart.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-white/65">
            DiverseLearning turns whatever you&apos;re curious about into an
            interactive 3D course — built for you, broken down piece by piece.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={signedIn ? "/dashboard" : "/sign-up"}
              className="rounded-2xl bg-gradient-to-r from-accent to-glow px-6 py-3 text-sm font-semibold shadow-lg shadow-accent/25 transition hover:scale-[1.03]"
            >
              {signedIn ? "Go to your dashboard →" : "Start learning — free"}
            </Link>
            <span className="text-xs text-white/40">
              No setup · works right in your browser
            </span>
          </div>
        </div>

        {/* Live 3D preview */}
        <div className="relative">
          <div className="glass h-[340px] overflow-hidden rounded-3xl sm:h-[420px]">
            {mounted && ready && heroModel ? (
              <ModelViewer model={heroModel} accent="#16d9c9" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <div className="animate-float text-5xl">🧬</div>
                <span className="text-sm text-white/40">Loading 3D preview…</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-5 transition hover:-translate-y-0.5"
            >
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                {f.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Pick something you&apos;ve always wanted to understand.
          </h2>
          <Link
            href={signedIn ? "/dashboard" : "/sign-up"}
            className="rounded-2xl bg-gradient-to-r from-accent to-glow px-7 py-3 text-sm font-semibold shadow-lg shadow-accent/25 transition hover:scale-[1.03]"
          >
            {signedIn ? "Go to your dashboard →" : "Create your first course →"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto flex flex-col items-center justify-between gap-2 border-t border-white/10 px-6 py-6 text-xs text-white/40 sm:flex-row sm:px-10">
        <span>
          Diverse<span className="text-accent">Learning</span> · interactive 3D
          courses
        </span>
        <span>Made for curious people.</span>
      </footer>
    </main>
  );
}
