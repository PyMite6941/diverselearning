"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSettings } from "@/lib/settings";
import {
  computeTextStats,
  EMPTY_STATS,
  joinFragments,
  statsEqual,
  type TextStats,
} from "@/lib/textStats";
import { IGNORE_ATTR, scrapeText } from "@/lib/visibleText";

/** Bottom-left reading counter: words, characters and repeated letters.
 *  Off by default; switched on (and scoped) from the Appearance menu.
 *
 *  By default it measures only what's on screen, so the numbers change as you
 *  scroll — set the scope to "Whole page" in settings to count everything. */
export default function TextStatsOverlay() {
  const enabled = useSettings((s) => s.textStats);
  const scope = useSettings((s) => s.textStatsScope);
  const showRepeats = useSettings((s) => s.textStatsRepeatDetail);

  const [stats, setStats] = useState<TextStats>(EMPTY_STATS);
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  const measure = useCallback(() => {
    const next = computeTextStats(joinFragments(scrapeText(scope)));
    // Keeping the old object when nothing changed stops the render → DOM
    // change → observer → render loop.
    setStats((prev) => (statsEqual(prev, next) ? prev : next));
  }, [scope]);

  /** Measuring reads layout, so never more than once per frame. */
  const scheduleMeasure = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      measure();
    });
  }, [measure]);

  useEffect(() => {
    if (!enabled) return;

    scheduleMeasure();

    // Capture phase so scrolling inside the lesson column counts too, not just
    // the window.
    window.addEventListener("scroll", scheduleMeasure, { capture: true, passive: true });
    window.addEventListener("resize", scheduleMeasure);

    // The overlay writes its own numbers into the DOM; reacting to that would
    // measure forever, so its own mutations are filtered out.
    const observer = new MutationObserver((records) => {
      const outside = records.some((r) => {
        const el = r.target instanceof Element ? r.target : r.target.parentElement;
        return !el || !el.closest(`[${IGNORE_ATTR}]`);
      });
      if (outside) scheduleMeasure();
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    return () => {
      window.removeEventListener("scroll", scheduleMeasure, { capture: true });
      window.removeEventListener("resize", scheduleMeasure);
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [enabled, scheduleMeasure]);

  if (!mounted || !enabled) return null;

  const scopeLabel = scope === "screen" ? "On screen" : "Whole page";

  return (
    <div
      data-text-stats-ignore /* IGNORE_ATTR — keeps the counter out of its own count */
      role="group"
      // Not a live region on purpose: the numbers change on every scroll, and
      // announcing each update would bury the lesson in chatter.
      aria-live="off"
      aria-label={`Text stats, ${scopeLabel.toLowerCase()}`}
      className="glass-strong fixed bottom-4 left-4 z-[80] w-52 select-none rounded-2xl p-3 text-xs text-white/80 shadow-xl"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-wider text-white/40">{scopeLabel}</span>
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          title={collapsed ? "Show text stats" : "Hide text stats"}
          className="text-white/40 transition hover:text-white"
        >
          {collapsed ? "▲" : "▼"}
        </button>
      </div>

      {!collapsed && (
        <>
          <dl className="mt-2 space-y-1">
            <Row label="Words" value={stats.words} />
            <Row label="Characters" value={stats.characters} />
            <Row label="No spaces" value={stats.charactersNoSpaces} />
            <Row label="Letters" value={stats.letters} />
            <Row label="Repeated" value={stats.repeatedCharacters} hint="distinct letters/digits appearing more than once" />
            <Row label="Doubles" value={stats.doubledPairs} hint="letters repeated back-to-back, like the ll in hello" />
          </dl>

          {showRepeats && stats.repeats.length > 0 && (
            <div className="mt-2 border-t border-white/10 pt-2">
              <p className="text-[10px] uppercase tracking-wider text-white/40">Most repeated</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {stats.repeats.slice(0, 12).map((r) => (
                  <span
                    key={r.char}
                    className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/75"
                  >
                    {r.char}
                    <span className="text-white/40">×{r.count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Row({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2" title={hint}>
      <dt className="text-white/50">{label}</dt>
      <dd className="font-mono tabular-nums text-white">{value.toLocaleString()}</dd>
    </div>
  );
}
