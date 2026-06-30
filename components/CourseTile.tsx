"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { CourseCard } from "@/lib/types";
import { useStore } from "@/lib/store";

/** A draggable, glassy course tile on the dashboard canvas. */
export default function CourseTile({ card }: { card: CourseCard }) {
  const router = useRouter();
  const updateLayout = useStore((s) => s.updateLayout);
  const commitLayout = useStore((s) => s.commitLayout);
  const removeCourse = useStore((s) => s.removeCourse);
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const moved = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const layout = card.layout ?? { x: 40, y: 40, w: 340, h: 200 };

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // ignore drags that start on a button
      if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
      moved.current = false;
      setDragging(true);
      offset.current = { x: e.clientX - layout.x, y: e.clientY - layout.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      document.body.classList.add("dragging");
    },
    [layout.x, layout.y]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      moved.current = true;
      const x = Math.max(0, e.clientX - offset.current.x);
      const y = Math.max(0, e.clientY - offset.current.y);
      updateLayout(card.id, { ...layout, x, y });
    },
    [dragging, card.id, layout, updateLayout]
  );

  const onPointerUp = useCallback(() => {
    setDragging(false);
    document.body.classList.remove("dragging");
    // persist the final position to the cloud (no-op in local-only mode)
    if (moved.current) commitLayout(card.id);
  }, [card.id, commitLayout]);

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={() => {
        if (!moved.current) router.push(`/course/${card.id}`);
      }}
      className={`glass group absolute select-none rounded-2xl p-5 transition-shadow ${
        dragging ? "z-50 cursor-grabbing shadow-2xl" : "cursor-grab hover:shadow-xl"
      }`}
      style={{
        left: layout.x,
        top: layout.y,
        width: layout.w,
        minHeight: layout.h,
        boxShadow: dragging
          ? `0 24px 60px -12px ${card.accent}55`
          : undefined,
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

      <h3 className="text-lg font-semibold leading-tight">{card.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-white/55">{card.subtitle}</p>

      <div className="mt-4 flex items-center justify-between text-xs text-white/40">
        <span>{card.lessonCount} lessons</span>
        <span className="font-medium text-white/60 transition group-hover:text-white">
          Open →
        </span>
      </div>
    </div>
  );
}
