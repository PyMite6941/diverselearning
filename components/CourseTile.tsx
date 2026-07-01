"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { CourseCard } from "@/lib/types";
import { useStore } from "@/lib/store";

// Only treat a pointer gesture as a drag once it moves past this many pixels —
// below it, it's a click that opens the course. This is the key to making
// tiles easy to open (tiny jitter no longer swallows the click).
const DRAG_THRESHOLD = 6;

/** A draggable, glassy course tile on the dashboard canvas. */
export default function CourseTile({ card }: { card: CourseCard }) {
  const router = useRouter();
  const updateLayout = useStore((s) => s.updateLayout);
  const commitLayout = useStore((s) => s.commitLayout);
  const removeCourse = useStore((s) => s.removeCourse);

  const [dragging, setDragging] = useState(false);
  const active = useRef(false); // pointer is down on this tile
  const didDrag = useRef(false); // moved past the threshold
  const start = useRef({ x: 0, y: 0 });
  const offset = useRef({ x: 0, y: 0 });

  const layout = card.layout ?? { x: 40, y: 40, w: 340, h: 200 };

  const open = useCallback(
    () => router.push(`/course/${card.id}`),
    [router, card.id]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
      active.current = true;
      didDrag.current = false;
      start.current = { x: e.clientX, y: e.clientY };
      offset.current = { x: e.clientX - layout.x, y: e.clientY - layout.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [layout.x, layout.y]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!active.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      if (!didDrag.current && dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD)
        return; // still within click tolerance
      if (!didDrag.current) {
        didDrag.current = true;
        setDragging(true);
        document.body.classList.add("dragging");
      }
      updateLayout(card.id, {
        ...layout,
        x: Math.max(0, e.clientX - offset.current.x),
        y: Math.max(0, e.clientY - offset.current.y),
      });
    },
    [card.id, layout, updateLayout]
  );

  const onPointerUp = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    if (didDrag.current) {
      setDragging(false);
      document.body.classList.remove("dragging");
      commitLayout(card.id);
    } else {
      // a tap, not a drag → open the course
      open();
    }
  }, [card.id, commitLayout, open]);

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={`glass group absolute select-none rounded-2xl p-5 transition-shadow ${
        dragging
          ? "z-50 cursor-grabbing shadow-2xl"
          : "cursor-pointer hover:shadow-xl hover:ring-1 hover:ring-white/15"
      }`}
      style={{
        left: layout.x,
        top: layout.y,
        width: layout.w,
        minHeight: layout.h,
        touchAction: "none",
        boxShadow: dragging ? `0 24px 60px -12px ${card.accent}55` : undefined,
      }}
    >
      {/* accent bar */}
      <div
        className="absolute left-0 top-5 h-10 w-1 rounded-r-full"
        style={{ background: card.accent }}
      />

      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: `${card.accent}22`, color: card.accent }}
        >
          {card.level}
        </span>
        <div className="flex items-center gap-1">
          <span
            className="hidden select-none rounded-md px-1.5 py-0.5 text-[10px] text-white/25 sm:inline"
            title="Drag to move"
          >
            ⠿
          </span>
          <button
            data-no-drag
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Delete "${card.title}"?`)) removeCourse(card.id);
            }}
            className="rounded-md px-2 py-0.5 text-xs text-white/30 opacity-0 transition hover:bg-white/10 hover:text-white/80 group-hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>

      <h3 className="text-lg font-semibold leading-tight">{card.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-white/55">{card.subtitle}</p>

      <div className="mt-4 flex items-center justify-between gap-2 text-xs">
        <span className="text-white/40">{card.lessonCount} lessons</span>
        <button
          data-no-drag
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
          className="rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow transition hover:scale-[1.04]"
          style={{ background: `${card.accent}` }}
        >
          Open →
        </button>
      </div>
    </div>
  );
}
