import { chat, hasAnyProvider } from "./provider";
import type { Course } from "./types";

const SYSTEM = `You are a curriculum designer AND a technical 3D modeler for an
interactive learning site. You generate ONE course tailored precisely to the
learner's stated interest. The course MUST be about exactly that topic — never
substitute a different subject.

EVERY lesson MUST contain a 3D "model" — no lesson may omit it. The model is
the centerpiece: it must be the MOST ACCURATE representation of the real thing
that is achievable from labeled primitive parts. Treat it like building an
exploded engineering/anatomical diagram.

Return STRICT JSON only (no markdown, no commentary) matching this shape:

{
  "title": string,
  "subtitle": string,
  "level": "beginner" | "intermediate" | "advanced",
  "accent": string (hex color fitting the topic),
  "lessons": [
    {
      "title": string,
      "body": [string, string, ...],   // 2-4 short teaching paragraphs
      "model": {                          // REQUIRED for every lesson
        "caption": string,
        "parts": [
          {
            "label": string,            // correct technical/anatomical name
            "shape": "box" | "sphere" | "cylinder" | "cone" | "torus"
                     | "capsule" | "tetrahedron" | "octahedron" | "ring"
                     | "plane" | "torusKnot",
            "position": [x, y, z],       // within -3..3
            "scale": [x, y, z],          // reflect TRUE relative proportions
            "rotation": [x, y, z],       // DEGREES; orient parts realistically
            "color": string (hex),       // realistic, distinct per part
            "opacity": number,           // 0..1; < 1 for outer shells/membranes
            "finish": "matte" | "metal" | "glass" | "glow",
            "explanation": string
          }
        ]
      },
      "check": { "question": string, "answer": string }
    }
  ]
}

Accuracy rules (critical):
- Use 6 to 14 parts per model — enough to capture the real structure, not a
  cartoon. Include the parts that actually exist in the real object.
- Get PROPORTIONS right: scale parts relative to each other as they truly are.
- Get the SPATIAL LAYOUT right: position and rotate parts so their arrangement
  matches reality (e.g. planets in order from the sun; engine stages in line;
  organelles inside the membrane).
- Pick the closest shape for each part and use "rotation" to align it.
- Use a translucent "glass" outer shell (low opacity) when the real object has a
  casing/membrane/body, so inner parts remain visible.
- Use "metal" finish for hardware/mechanical parts, "glow" for light/energy.
- Labels must use the correct real-world terminology.
- Produce EXACTLY 4 to 6 lessons — never fewer than 4 — and EVERY one of them
  must have a fully populated "model" with 6-14 parts.
- Teaching text concrete and friendly. No fluff.`;

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
            rotation: p.rotation,
            color: p.color ?? "#7c5cff",
            opacity: typeof p.opacity === "number" ? p.opacity : undefined,
            finish: p.finish,
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

export class CourseGenError extends Error {
  code: "no_provider" | "failed";
  constructor(code: "no_provider" | "failed", message: string) {
    super(message);
    this.code = code;
  }
}

/** Pull the JSON object out of a model response even if it wrapped it in prose
 *  or fences. Returns null if no parseable object is found. */
function extractJson(text: string): any | null {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * Generate the course the learner actually asked for. Requires an AI key —
 * if none is configured (or generation keeps failing) this THROWS rather than
 * returning an unrelated sample, so the button never produces the wrong course.
 */
export async function generateCourse(
  topic: string,
  level = "beginner"
): Promise<Course> {
  if (!hasAnyProvider()) {
    throw new CourseGenError(
      "no_provider",
      "AI course generation isn't configured yet. Add a GROQ_API_KEY or OPENROUTER_API_KEY to create real courses."
    );
  }

  const messages = [
    { role: "system" as const, content: SYSTEM },
    {
      role: "user" as const,
      content: `Learner interest: "${topic}". Target level: ${level}.
The course MUST be about "${topic}" specifically.
Create exactly 5 lessons, and EVERY lesson must include a fully populated 3D
"model" with 6-14 accurately-arranged parts. Generate the course JSON now.`,
    },
  ];

  // Two attempts: the second nudges harder for valid, on-topic JSON.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const content = await chat(messages, {
        json: true,
        temperature: attempt === 0 ? 0.7 : 0.4,
      });
      const raw = extractJson(content);
      if (!raw) continue;
      const course = hydrate(raw, topic);
      if (course.lessons.length > 0) return course;
    } catch {
      // try the next attempt / model
    }
  }

  throw new CourseGenError(
    "failed",
    `Couldn't generate a course for "${topic}". Please try again or rephrase.`
  );
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
          caption: "An animal cell — translucent membrane with its organelles inside",
          parts: [
            { id: `${id}-l0-p0`, label: "Cell Membrane", shape: "sphere", position: [0, 0, 0], scale: [2.6, 2.6, 2.6], color: "#16d9c9", opacity: 0.16, finish: "glass", explanation: "The flexible outer boundary that controls what enters and leaves the cell." },
            { id: `${id}-l0-p1`, label: "Cytoplasm", shape: "sphere", position: [0, 0, 0], scale: [2.3, 2.3, 2.3], color: "#0e7c74", opacity: 0.05, finish: "glass", explanation: "The jelly-like fluid that fills the cell and suspends the organelles." },
            { id: `${id}-l0-p2`, label: "Nucleus", shape: "sphere", position: [0.2, 0.1, 0], scale: [0.85, 0.85, 0.85], color: "#7c5cff", finish: "matte", explanation: "The control center that holds DNA — the cell's instruction manual." },
            { id: `${id}-l0-p3`, label: "Nucleolus", shape: "sphere", position: [0.35, 0.25, 0.15], scale: [0.32, 0.32, 0.32], color: "#5b3fd6", finish: "matte", explanation: "A dense spot inside the nucleus that builds ribosomes." },
            { id: `${id}-l0-p4`, label: "Mitochondrion", shape: "capsule", position: [1.3, 0.5, 0.3], scale: [0.55, 0.55, 0.55], rotation: [0, 0, 35], color: "#ff7c5c", finish: "matte", explanation: "The powerhouse — converts food into usable energy (ATP)." },
            { id: `${id}-l0-p5`, label: "Mitochondrion", shape: "capsule", position: [-1.2, -0.9, 0.4], scale: [0.5, 0.5, 0.5], rotation: [10, 0, -60], color: "#ff7c5c", finish: "matte", explanation: "Cells that work hard pack in many mitochondria." },
            { id: `${id}-l0-p6`, label: "Rough ER", shape: "torus", position: [-0.7, 0.6, 0.2], scale: [1.1, 1.1, 0.7], rotation: [70, 20, 0], color: "#ffd166", finish: "matte", explanation: "Folded membranes studded with ribosomes that fold and ship proteins." },
            { id: `${id}-l0-p7`, label: "Golgi Apparatus", shape: "torus", position: [1.0, -0.9, -0.4], scale: [0.7, 0.7, 0.5], rotation: [80, 0, 10], color: "#4cc9f0", finish: "matte", explanation: "Packages and labels proteins for delivery, like a post office." },
            { id: `${id}-l0-p8`, label: "Ribosome", shape: "sphere", position: [-1.4, 0.2, 0.9], scale: [0.14, 0.14, 0.14], color: "#fff3b0", finish: "matte", explanation: "Tiny machines that build proteins from amino acids." },
            { id: `${id}-l0-p9`, label: "Lysosome", shape: "sphere", position: [0.4, -1.4, 0.6], scale: [0.32, 0.32, 0.32], color: "#f15bb5", finish: "matte", explanation: "Contains enzymes that break down waste and worn-out parts." },
            { id: `${id}-l0-p10`, label: "Vacuole", shape: "sphere", position: [-0.5, 1.3, -0.6], scale: [0.5, 0.5, 0.5], color: "#a78bfa", opacity: 0.6, finish: "glass", explanation: "A storage bubble for water, nutrients, and waste." },
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
          caption: "A mitochondrion — translucent outer membrane, inner cristae exposed",
          parts: [
            { id: `${id}-l1-p0`, label: "Outer Membrane", shape: "capsule", position: [0, 0, 0], scale: [1.7, 1.7, 1.7], rotation: [0, 0, 90], color: "#ff7c5c", opacity: 0.18, finish: "glass", explanation: "A smooth outer wall enclosing the whole organelle." },
            { id: `${id}-l1-p1`, label: "Inner Membrane", shape: "capsule", position: [0, 0, 0], scale: [1.45, 1.45, 1.45], rotation: [0, 0, 90], color: "#ffb35c", opacity: 0.3, finish: "glass", explanation: "A second membrane just inside the first, holding the energy machinery." },
            { id: `${id}-l1-p2`, label: "Crista", shape: "torus", position: [-0.55, 0, 0], scale: [0.55, 0.55, 0.55], rotation: [0, 90, 0], color: "#ffd166", finish: "matte", explanation: "Folds of the inner membrane that pack in surface area for ATP reactions." },
            { id: `${id}-l1-p3`, label: "Crista", shape: "torus", position: [0.1, 0, 0], scale: [0.55, 0.55, 0.55], rotation: [0, 90, 0], color: "#ffd166", finish: "matte", explanation: "More cristae — the more there are, the more energy the cell can make." },
            { id: `${id}-l1-p4`, label: "Crista", shape: "torus", position: [0.75, 0, 0], scale: [0.55, 0.55, 0.55], rotation: [0, 90, 0], color: "#ffd166", finish: "matte", explanation: "Each fold carries the proteins of the electron transport chain." },
            { id: `${id}-l1-p5`, label: "Matrix", shape: "capsule", position: [0, 0, 0], scale: [1.2, 1.2, 1.2], rotation: [0, 0, 90], color: "#7c5cff", opacity: 0.5, finish: "glow", explanation: "The gel-like core where the citric-acid (Krebs) cycle runs." },
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
