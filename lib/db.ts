"use client";

import { supabase, currentUserId, isCloudActive } from "./supabase";
import type { Course, CourseCard } from "./types";

/** Row shape in the `courses` table. The full Course lives in `data` (jsonb);
 *  `layout` holds the draggable tile position so the board persists per user. */
interface Row {
  id: string;
  user_id: string;
  data: Course;
  layout: CourseCard["layout"] | null;
  created_at: string;
}

function rowToCard(r: Row): CourseCard {
  const c = r.data;
  return {
    id: c.id,
    title: c.title,
    subtitle: c.subtitle,
    topic: c.topic,
    level: c.level,
    accent: c.accent,
    lessonCount: c.lessons.length,
    createdAt: c.createdAt,
    layout: r.layout ?? undefined,
  };
}

/** Load every course for the signed-in user. Returns null in local-only mode. */
export async function fetchCloudCourses(): Promise<{
  courses: Course[];
  cards: CourseCard[];
} | null> {
  if (!supabase || !isCloudActive()) return null;
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  const rows = (data ?? []) as Row[];
  return {
    courses: rows.map((r) => r.data),
    cards: rows.map(rowToCard),
  };
}

/** Fetch a single course (used for deep-links on a fresh device). */
export async function fetchCloudCourse(id: string): Promise<Course | null> {
  if (!supabase || !isCloudActive()) return null;
  const { data, error } = await supabase
    .from("courses")
    .select("data")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return (data as { data: Course }).data;
}

export async function saveCloudCourse(
  course: Course,
  layout: CourseCard["layout"]
): Promise<void> {
  if (!supabase || !isCloudActive()) return;
  const uid = currentUserId();
  if (!uid) return;
  const { error } = await supabase
    .from("courses")
    .upsert({ id: course.id, user_id: uid, data: course, layout });
  if (error) throw error;
}

export async function deleteCloudCourse(id: string): Promise<void> {
  if (!supabase || !isCloudActive()) return;
  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw error;
}

export async function saveCloudLayout(
  id: string,
  layout: CourseCard["layout"]
): Promise<void> {
  if (!supabase || !isCloudActive()) return;
  const { error } = await supabase.from("courses").update({ layout }).eq("id", id);
  if (error) throw error;
}
