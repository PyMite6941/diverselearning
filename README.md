# DiverseLearning

Your personal, interactive **3D classroom**. Tell it anything you're curious about and it generates a course built just for you — concepts rendered as 3D models you can rotate and take apart, part by part.

![status](https://img.shields.io/badge/stage-scaffold-7c5cff)

## What it does

- **Draggable dashboard** — every course is a glass tile on an infinite board you can rearrange freely (positions persist).
- **AI-generated courses** — describe an interest; a free-model chain (Groq → OpenRouter, with failover) writes a 4–6 lesson course tailored to you.
- **Interactive 3D lessons** — at least half of each course's lessons include a model. Drag to rotate; click any part to break it down with a plain-language explanation.
- **Zero-key fallback** — with no API keys set, the app serves a built-in sample course so the whole UI still works.
- **Made for a few people** — optional invite-code gate + per-device storage; deploy on Vercel and share the link.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| 3D | React Three Fiber + drei (Three.js) |
| State | Zustand (localStorage-persisted) |
| Styling | Tailwind CSS (glassmorphism) |
| AI | Groq → OpenRouter free-model failover (`lib/provider.ts`) |
| Host | Vercel |

## Run locally

```bash
npm install
cp .env.example .env.local   # add keys (optional — works without them)
npm run dev
# http://localhost:3000
```

## Environment

All keys are **server-only** and optional. See `.env.example`.

| Var | Purpose |
|---|---|
| `GROQ_API_KEY` | Fast free generation (primary) |
| `OPENROUTER_API_KEY` | Free-model failover |
| `OPENROUTER_ALLOW_PAID` | `true` to allow paid models (default free-only) |
| `DL_INVITE_CODES` | Comma-separated invite codes; empty = open access |

## Architecture

```
app/
  page.tsx                  Draggable dashboard
  course/[id]/page.tsx      Lesson viewer + 3D stage
  api/generate-course/      POST → AI course JSON
components/
  CourseTile.tsx            Draggable glass tile (pointer events)
  GenerateModal.tsx         "What do you want to learn?" prompt
  ModelViewer.tsx           R3F scene; click parts to break down
lib/
  provider.ts               Groq→OpenRouter chat with failover
  courseGen.ts              Prompt + JSON hydrate + sample fallback
  types.ts                  Course / Lesson / ModelSpec schema
  store.ts                  Zustand persisted store
```

Courses are plain JSON (`lib/types.ts`), so the AI can produce them and the
viewer renders them with no code changes. The 3D model is described as a list of
labeled primitive **parts** (`box`/`sphere`/`cylinder`/`cone`/`torus`) with
positions and explanations — that's what makes "the whole thing modeled and
broken down" data-driven.

## Deploy (host for a few people)

```bash
vercel            # preview
vercel --prod     # production
```

Set `GROQ_API_KEY` / `OPENROUTER_API_KEY` in the Vercel project, optionally set
`DL_INVITE_CODES`, and share the URL.
