import { chat, hasAnyProvider } from "./provider";
import type { Course } from "./types";

const SYSTEM = `You are a curriculum designer for an interactive 3D learning site.
You generate a single course tailored to ONE learner's stated interest.
Every course must include lessons, and AT LEAST half the lessons must contain a
3D "model" so the concept can be visualized and broken down part-by-part in the browser.

Return STRICT JSON only (no markdown, no commentary) matching this shape:

{
  "title": string,
  "subtitle": string,
  "level": "beginner" | "intermediate" | "advanced",
  "accent": string (a hex color like "#7c5cff" that fits the topic),
  "lessons": [
    {
      "title": string,
      "body": [string, string, ...],   // 2-4 short teaching paragraphs
      "model": {                        // optional but encouraged
        "caption": string,
        "parts": [
          {
            "label": string,
            "shape": "box" | "sphere" | "cylinder" | "cone" | "torus",
            "position": [number, number, number],  // keep within -3..3
            "scale": [number, number, number],      // optional, ~0.3..2
            "color": string (hex),
            "explanation": string   // what this part is / does
          }
        ]
      },
      "check": { "question": string, "answer": string }
    }
  ]
}

Rules:
- 4 to 6 lessons.
- Models should be a sensible spatial breakdown of a real thing (e.g. a cell,
  an engine, the solar system, a neural net layer, a guitar). Use 3-7 parts,
  arranged so they read as a coherent assembly.
- Positions must keep parts visible and roughly centered around origin.
- Keep teaching text concrete and friendly. No fluff.`;

function slug(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Build a Course from raw AI JSON, filling ids + metadata. */
function hydrate(raw: any, topic: string): Course {
  const id = slug();
  const lessons = (raw.lessons || []).map((l: any, i: number) => ({
    id: `${id}-l${i}`,
    title: l.title ?? `Lesson ${i + 1}`,
    body: Array.isArray(l.body) ? l.body : [String(l.body ?? "")],
    model: l.model
      ? {
          caption: l.model.caption ?? "",
          parts: (l.model.parts || []).map((p: any, j: number) => ({
            id: `${id}-l${i}-p${j}`,
            label: p.label ?? `Part ${j + 1}`,
            shape: p.shape ?? "box",
            position: p.position ?? [0, 0, 0],
            scale: p.scale,
            color: p.color ?? "#7c5cff",
            explanation: p.explanation ?? "",
          })),
        }
      : undefined,
    check: l.check,
  }));

  return {
    id,
    title: raw.title ?? `A Course on ${topic}`,
    subtitle: raw.subtitle ?? "Generated just for you",
    topic,
    level: raw.level ?? "beginner",
    accent: raw.accent ?? "#7c5cff",
    lessons,
    createdAt: Date.now(),
  };
}

export async function generateCourse(
  topic: string,
  level = "beginner"
): Promise<Course> {
  if (!hasAnyProvider()) {
    return sampleCourse(topic);
  }

  try {
    const content = await chat(
      [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Learner interest: "${topic}". Target level: ${level}. Generate the course JSON.`,
        },
      ],
      { json: true, temperature: 0.8 }
    );

    // Models occasionally wrap JSON in fences despite instructions.
    const cleaned = content.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const raw = JSON.parse(cleaned);
    const course = hydrate(raw, topic);
    if (course.lessons.length === 0) return sampleCourse(topic);
    return course;
  } catch {
    return sampleCourse(topic);
  }
}

/** Built-in fallback so the UI is fully functional with zero API keys. */
export function sampleCourse(topic = "The Animal Cell"): Course {
  const id = slug();
  return {
    id,
    title: "Inside the Animal Cell",
    subtitle: "A hands-on, 3D tour of the cell's machinery",
    topic,
    level: "beginner",
    accent: "#16d9c9",
    createdAt: Date.now(),
    lessons: [
      {
        id: `${id}-l0`,
        title: "The Big Picture",
        body: [
          "Every animal is built from trillions of tiny factories called cells.",
          "Each cell has specialized parts — organelles — that keep it alive, just like rooms in a house each have a job.",
          "Rotate the model and click any part to learn what it does.",
        ],
        model: {
          caption: "A simplified animal cell with its core organelles",
          parts: [
            { id: `${id}-l0-p0`, label: "Cell Membrane", shape: "sphere", position: [0, 0, 0], scale: [2.4, 2.4, 2.4], color: "#16d9c9", explanation: "The flexible outer boundary that controls what enters and leaves the cell." },
            { id: `${id}-l0-p1`, label: "Nucleus", shape: "sphere", position: [0, 0, 0], scale: [0.8, 0.8, 0.8], color: "#7c5cff", explanation: "The control center that holds DNA — the cell's instruction manual." },
            { id: `${id}-l0-p2`, label: "Mitochondrion", shape: "cylinder", position: [1.1, 0.6, 0.4], scale: [0.3, 0.6, 0.3], color: "#ff7c5c", explanation: "The powerhouse — it converts food into usable energy (ATP)." },
            { id: `${id}-l0-p3`, label: "Ribosome", shape: "sphere", position: [-1, -0.7, 0.6], scale: [0.18, 0.18, 0.18], color: "#ffd166", explanation: "Tiny machines that build proteins from amino acids." },
            { id: `${id}-l0-p4`, label: "Vacuole", shape: "sphere", position: [-0.9, 0.9, -0.5], scale: [0.5, 0.5, 0.5], color: "#a78bfa", explanation: "A storage bubble for water, nutrients, and waste." },
          ],
        },
        check: { question: "Which organelle stores the cell's DNA?", answer: "The nucleus." },
      },
      {
        id: `${id}-l1`,
        title: "Powering the Cell",
        body: [
          "Mitochondria turn the sugar from your food into ATP, the energy currency every cell spends.",
          "Cells that work hard — like muscle cells — pack in thousands of mitochondria.",
        ],
        model: {
          caption: "A mitochondrion, broken into its working parts",
          parts: [
            { id: `${id}-l1-p0`, label: "Outer Membrane", shape: "cylinder", position: [0, 0, 0], scale: [1.4, 1.6, 1.4], color: "#ff7c5c", explanation: "A smooth wall enclosing the whole organelle." },
            { id: `${id}-l1-p1`, label: "Cristae (inner folds)", shape: "torus", position: [0, 0, 0], scale: [0.9, 0.9, 0.9], color: "#ffd166", explanation: "Folded inner membranes that pack in surface area for energy reactions." },
            { id: `${id}-l1-p2`, label: "Matrix", shape: "sphere", position: [0, 0, 0], scale: [0.7, 0.7, 0.7], color: "#7c5cff", explanation: "The gel-like core where the energy-making reactions happen." },
          ],
        },
        check: { question: "What molecule do mitochondria produce?", answer: "ATP (energy)." },
      },
      {
        id: `${id}-l2`,
        title: "The Instruction Center",
        body: [
          "The nucleus guards the cell's DNA and decides which genes to switch on.",
          "Messages copied from DNA travel out to ribosomes, which build the proteins the cell needs.",
        ],
        check: { question: "Where are proteins assembled?", answer: "At the ribosomes." },
      },
    ],
  };
}
