// Shared data model. Courses are generated as plain JSON so they can be
// produced by the AI chain, cached, and rendered without code changes.

export type PartShape = "box" | "sphere" | "cylinder" | "cone" | "torus";

/** One labeled part of a 3D model. The viewer renders these primitives and
 *  lets the learner click each to break it down. */
export interface ModelPart {
  id: string;
  label: string;
  shape: PartShape;
  /** world position [x, y, z] */
  position: [number, number, number];
  /** scale [x, y, z] (defaults to 1,1,1) */
  scale?: [number, number, number];
  color: string;
  /** Plain-language explanation of what this part is / does. */
  explanation: string;
}

/** A complete 3D model that visualizes a lesson concept. */
export interface ModelSpec {
  /** Short caption describing the whole assembled model. */
  caption: string;
  parts: ModelPart[];
}

export interface Lesson {
  id: string;
  title: string;
  /** 2-4 short paragraphs of teaching text. */
  body: string[];
  /** Optional 3D model that visualizes this lesson. */
  model?: ModelSpec;
  /** Quick check question + answer for self-test. */
  check?: { question: string; answer: string };
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  /** The interest/topic the learner asked for. */
  topic: string;
  /** Difficulty: beginner | intermediate | advanced */
  level: string;
  /** Accent color theme for the course card / 3D lighting. */
  accent: string;
  lessons: Lesson[];
  createdAt: number;
}

/** Lightweight card for the dashboard grid. */
export interface CourseCard {
  id: string;
  title: string;
  subtitle: string;
  topic: string;
  level: string;
  accent: string;
  lessonCount: number;
  createdAt: number;
  /** dashboard layout: position + size of the draggable tile */
  layout?: { x: number; y: number; w: number; h: number };
}
