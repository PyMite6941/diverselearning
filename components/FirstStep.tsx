"use client";

import { useMemo, useState } from "react";
import type { Lesson } from "@/lib/types";

/**
 * Task initiation support.
 *
 * A lesson arrives all at once — several paragraphs, a model, a quiz — and
 * "start" is its own barrier, separate from difficulty. This shows exactly ONE
 * small action at a time, small enough that it costs nothing to say yes to,
 * and never reveals the next one until the current one is done.
 *
 * The steps are derived from the lesson's own data, so this costs no AI call
 * and works with no API key.
 */
function buildSteps(lesson: Lesson): string[] {
  const steps: string[] = [];
  const firstPart = lesson.model?.parts?.[0];

  if (firstPart) {
    steps.push(
      `Find the piece labelled “${firstPart.label}” in the model above. Just look at it — that is the whole step.`
    );
  }
  if (lesson.body?.length) {
    steps.push("Read the first paragraph. Only the first one, then stop.");
  }
  if (lesson.model?.parts?.length) {
    steps.push(
      "Press Break apart, then click one piece you do not recognise and read what it says."
    );
  }
  if ((lesson.body?.length ?? 0) > 1) {
    steps.push("Read the rest whenever you are ready. There is no timer.");
  }
  if (lesson.check) {
    steps.push("Try the quick check at the bottom. A guess counts as an answer.");
  }

  return steps.length ? steps : ["Read the first paragraph, then stop."];
}

export default function FirstStep({
  lesson,
  accent,
}: {
  lesson: Lesson;
  accent: string;
}) {
  const steps = useMemo(() => buildSteps(lesson), [lesson]);
  const [index, setIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const finished = index >= steps.length;

  return (
    <aside
      aria-label="A place to start"
      className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: accent }}
        >
          {finished ? "That was the hard part" : "Start here"}
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="flex-none text-[11px] text-white/35 transition hover:text-white/70"
        >
          Hide
        </button>
      </div>

      {finished ? (
        <p className="mt-2 text-white/70">
          You started. Everything after this is just reading at your own pace.
        </p>
      ) : (
        <>
          <p aria-live="polite" className="mt-2 text-lg leading-relaxed text-white/90">
            {steps[index]}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setIndex((i) => i + 1)}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90"
              style={{ background: accent }}
            >
              {index === steps.length - 1 ? "Done" : "Done — what's next?"}
            </button>
            <span className="text-[11px] text-white/35">
              Step {index + 1} of {steps.length}
            </span>
          </div>
        </>
      )}
    </aside>
  );
}
