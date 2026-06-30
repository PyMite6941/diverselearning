"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Course } from "@/lib/types";

const SUGGESTIONS = [
  "How a jet engine works",
  "The basics of music theory",
  "Neural networks, visually",
  "The solar system",
  "How a guitar makes sound",
  "Photosynthesis",
];

export default function GenerateModal({ onClose }: { onClose: () => void }) {
  const addCourse = useStore((s) => s.addCourse);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("beginner");
  const [invite, setInvite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (topic.trim().length < 2) {
      setError("Tell us what you'd like to learn.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, level, invite }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      addCourse(data.course as Course);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-strong w-full max-w-lg rounded-3xl p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold">
          What do you want to <span className="grad-text">learn?</span>
        </h2>
        <p className="mt-1 text-sm text-white/55">
          We&apos;ll build a personal, interactive 3D course around it.
        </p>

        <textarea
          autoFocus
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate();
          }}
          placeholder="e.g. how rockets reach orbit, the parts of a cell, jazz chords…"
          rows={3}
          className="mt-5 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-4 text-sm outline-none transition focus:border-accent/60"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setTopic(s)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 transition hover:border-accent/50 hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <label className="text-xs text-white/50">Level</label>
          <div className="flex gap-1 rounded-lg bg-black/30 p-1">
            {["beginner", "intermediate", "advanced"].map((l) => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className={`rounded-md px-3 py-1 text-xs capitalize transition ${
                  level === l
                    ? "bg-accent text-white"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <input
          value={invite}
          onChange={(e) => setInvite(e.target.value)}
          placeholder="Invite code (if required)"
          className="mt-4 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs outline-none focus:border-accent/50"
        />

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-white/60 transition hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={generate}
            disabled={loading}
            className="relative overflow-hidden rounded-xl bg-gradient-to-r from-accent to-glow px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Building your course…" : "Generate course ✨"}
          </button>
        </div>
      </div>
    </div>
  );
}
