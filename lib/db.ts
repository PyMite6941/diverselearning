"use client";

import type { Course, CourseCard } from "./types";

// Client-side data layer. All persistence goes through the Clerk-gated
// /api/courses route (auth via the Clerk session cookie on same-origin fetch),
// which talks to Supabase with the server-only service key. These helpers
// fail soft: if the user isn't signed in the API returns 401 and we no-op.

export async function fetchCloudCourses(): Promise<{
  courses: Course[];
  cards: CourseCard[];
} | null> {
  const res = await fetch("/api/courses", { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return { courses: data.courses ?? [], cards: data.cards ?? [] };
}

export async function fetchCloudCourse(id: string): Promise<Course | null> {
  const res = await fetch(`/api/courses?id=${encodeURIComponent(id)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.course as Course) ?? null;
}

export async function saveCloudCourse(
  course: Course,
  layout: CourseCard["layout"]
): Promise<void> {
  await fetch("/api/courses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ course, layout }),
  });
}

export async function deleteCloudCourse(id: string): Promise<void> {
  await fetch(`/api/courses?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function saveCloudLayout(
  id: string,
  layout: CourseCard["layout"]
): Promise<void> {
  await fetch("/api/courses", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, layout }),
  });
}

export async function updateCloudCourseData(course: Course): Promise<void> {
  await fetch("/api/courses", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: course.id, data: course }),
  });
}
