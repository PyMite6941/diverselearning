// Shared data model. Courses are generated as plain JSON so they can be
// produced by the AI chain, cached, and rendered without code changes.

export type PartShape =
  | "box"
  | "sphere"
  | "cylinder"
  | "cone"
  | "torus"
  | "capsule"
  | "tetrahedron"
  | "octahedron"
  | "ring"
  | "plane"
  | "torusKnot";

export type PartFinish = "matte" | "metal" | "glass" | "glow";

/** One labeled part of a 3D model. The viewer renders these primitives and
 *  lets the learner click each to break it down. Rotation, opacity and finish
 *  let assemblies approximate real geometry far more faithfully. */
export interface ModelPart {
  id: string;
  label: string;
  shape: PartShape;
  /** world position [x, y, z] */
  position: [number, number, number];
  /** scale [x, y, z] (defaults to 1,1,1) */
  scale?: [number, number, number];
  /** rotation in DEGREES [x, y, z] (defaults to 0,0,0) */
  rotation?: [number, number, number];
  color: string;
  /** 0..1 — use < 1 for transparent shells/membranes so inner parts show. */
  opacity?: number;
  /** surface look; "glass" for casings/membranes, "metal" for hardware. */
  finish?: PartFinish;
  /**
   * PBR metalness override (0..1). Supersedes the finish preset when set.
   * 0 = fully dielectric (plastic/organic), 1 = fully metallic.
   */
  metalness?: number;
  /**
   * PBR roughness override (0..1). Supersedes the finish preset when set.
   * 0 = mirror-smooth, 1 = completely diffuse.
   */
  roughness?: number;
  /**
   * Extra emissive brightness for "glow" parts (0..1, stacks on finish base).
   * Use for plasma, laser beams, bioluminescent tissue, LEDs, etc.
   */
  emissiveIntensity?: number;
  /** Plain-language explanation of what this part is / does. */
  explanation: string;
}

/** A complete 3D model that visualizes a lesson concept. */
export interface ModelSpec {
  /** Short caption describing the whole assembled model. */
  caption: string;
  parts: ModelPart[];
  /**
   * Suggested initial camera position [x, y, z] for the best viewing angle of
   * this specific model. When omitted the viewer uses its default [4.5, 3, 6].
   * Use when the model is flat/wide (top-down view) or very tall (front-on).
   */
  cameraPosition?: [number, number, number];
}

/** Non-model content for conceptual topics (languages, programming, theory,
 *  history…) where a 3D model doesn't make sense. A lesson has EITHER a `model`
 *  or `concept` content. */
export interface ConceptContent {
  /** Short bulleted takeaways. */
  keyPoints?: string[];
  /** Code examples (for programming / technical topics). */
  code?: { language: string; caption?: string; snippet: string }[];
  /** Term/meaning pairs — vocabulary (languages) or a glossary. */
  vocab?: { term: string; meaning: string }[];
  /** A worked example or a concrete analogy. */
  example?: string;
}

export interface Lesson {
  id: string;
  title: string;
  /** 2-4 short paragraphs of teaching text. */
  body: string[];
  /** Optional 3D model that visualizes this lesson (physical/structural topics). */
  model?: ModelSpec;
  /** Optional concept content (abstract topics — languages, code, theory). */
  concept?: ConceptContent;
  /** Optional real glTF/GLB model (looked up from a free source) shown as a
   *  "Realistic" view alongside the breakable diagram. */
  asset?: { url: string; name?: string; credit?: string };
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
