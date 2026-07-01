"use client";

import type { ConceptContent } from "@/lib/types";

/** Renders non-model lesson content for conceptual topics: key points, code
 *  samples, vocabulary pairs, and a worked example. */
export default function ConceptView({
  concept,
  accent = "#7c5cff",
}: {
  concept: ConceptContent;
  accent?: string;
}) {
  const { keyPoints, code, vocab, example } = concept;

  return (
    <div className="mt-6 space-y-6">
      {keyPoints && keyPoints.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
            Key points
          </p>
          <ul className="space-y-1.5">
            {keyPoints.map((k, i) => (
              <li key={i} className="flex gap-2.5 text-white/80">
                <span
                  className="mt-2 h-1.5 w-1.5 flex-none rounded-full"
                  style={{ background: accent }}
                />
                <span className="leading-relaxed">{k}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {code && code.length > 0 && (
        <div className="space-y-3">
          {code.map((c, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-xl border border-white/10 bg-black/40"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-[11px] text-white/40">
                <span className="uppercase tracking-wider">{c.language}</span>
                {c.caption && <span className="text-white/50">{c.caption}</span>}
              </div>
              <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
                <code className="font-mono text-white/85">{c.snippet}</code>
              </pre>
            </div>
          ))}
        </div>
      )}

      {vocab && vocab.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
            Vocabulary
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {vocab.map((v, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5"
              >
                <div className="font-semibold" style={{ color: accent }}>
                  {v.term}
                </div>
                <div className="text-sm text-white/70">{v.meaning}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {example && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent2">
            Example
          </p>
          <p className="mt-2 whitespace-pre-wrap leading-relaxed text-white/80">
            {example}
          </p>
        </div>
      )}
    </div>
  );
}
