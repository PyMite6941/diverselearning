"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Course, CourseCard } from "./types";
import {
  saveCloudCourse,
  deleteCloudCourse,
  saveCloudLayout,
} from "./db";

interface DLState {
  courses: Course[];
  cards: CourseCard[];
  addCourse: (course: Course) => void;
  removeCourse: (id: string) => void;
  getCourse: (id: string) => Course | undefined;
  cacheCourse: (course: Course) => void;
  updateLayout: (id: string, layout: CourseCard["layout"]) => void;
  commitLayout: (id: string) => void;
  /** Replace the whole board from cloud (on sign-in / initial load). */
  loadAll: (courses: Course[], cards: CourseCard[]) => void;
  /** Drop local state (on sign-out we return to a clean local board). */
  reset: () => void;
}

function cardFor(course: Course, index: number): CourseCard {
  const col = index % 2;
  const row = Math.floor(index / 2);
  return {
    id: course.id,
    title: course.title,
    subtitle: course.subtitle,
    topic: course.topic,
    level: course.level,
    accent: course.accent,
    lessonCount: course.lessons.length,
    createdAt: course.createdAt,
    layout: { x: 40 + col * 380, y: 40 + row * 240, w: 340, h: 200 },
  };
}

export const useStore = create<DLState>()(
  persist(
    (set, get) => ({
      courses: [],
      cards: [],

      addCourse: (course) => {
        const card = cardFor(course, 0);
        set((s) => ({ courses: [course, ...s.courses], cards: [card, ...s.cards] }));
        // write-through to cloud (no-op in local-only mode)
        void saveCloudCourse(course, card.layout).catch(() => {});
      },

      removeCourse: (id) => {
        set((s) => ({
          courses: s.courses.filter((c) => c.id !== id),
          cards: s.cards.filter((c) => c.id !== id),
        }));
        void deleteCloudCourse(id).catch(() => {});
      },

      getCourse: (id) => get().courses.find((c) => c.id === id),

      // Insert a course into memory without re-saving to cloud (used after a
      // deep-link fetch so the viewer has the data).
      cacheCourse: (course) =>
        set((s) =>
          s.courses.some((c) => c.id === course.id)
            ? s
            : { courses: [...s.courses, course] }
        ),

      // Local-only positional update (fires on every drag move — cheap).
      updateLayout: (id, layout) =>
        set((s) => ({
          cards: s.cards.map((c) => (c.id === id ? { ...c, layout } : c)),
        })),

      // Persist the final position to cloud once (called on drag end).
      commitLayout: (id) => {
        const card = get().cards.find((c) => c.id === id);
        if (card) void saveCloudLayout(id, card.layout).catch(() => {});
      },

      loadAll: (courses, cards) => set({ courses, cards }),

      reset: () => set({ courses: [], cards: [] }),
    }),
    { name: "diverselearning-v1" }
  )
);
