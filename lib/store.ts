"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Course, CourseCard } from "./types";

interface DLState {
  courses: Course[];
  cards: CourseCard[];
  addCourse: (course: Course) => void;
  removeCourse: (id: string) => void;
  getCourse: (id: string) => Course | undefined;
  updateLayout: (id: string, layout: CourseCard["layout"]) => void;
}

function cardFor(course: Course, index: number): CourseCard {
  // Default tile grid: 2 columns, auto-flow.
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
      addCourse: (course) =>
        set((s) => {
          const courses = [course, ...s.courses];
          const cards = [cardFor(course, 0), ...s.cards];
          return { courses, cards };
        }),
      removeCourse: (id) =>
        set((s) => ({
          courses: s.courses.filter((c) => c.id !== id),
          cards: s.cards.filter((c) => c.id !== id),
        })),
      getCourse: (id) => get().courses.find((c) => c.id === id),
      updateLayout: (id, layout) =>
        set((s) => ({
          cards: s.cards.map((c) => (c.id === id ? { ...c, layout } : c)),
        })),
    }),
    { name: "diverselearning-v1" }
  )
);
