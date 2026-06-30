# DiverseLearning

Your personal, interactive **3D classroom**. Tell it anything you're curious about and it generates a course built just for you — concepts rendered as 3D models you can rotate and take apart, part by part.

![status](https://img.shields.io/badge/stage-scaffold-7c5cff)

## What it does

- **Draggable dashboard** — every course is a glass tile on an infinite board you can rearrange freely (positions persist).
- **AI-generated courses** — describe an interest; a free-model chain (Groq → OpenRouter, with failover) writes a 4–6 lesson course tailored to you.
- **Interactive 3D lessons** — at least half of each course's lessons include a model. Drag to rotate; click any part to break it down with a plain-language explanation.
- **Per-user accounts + cloud courses** — sign in (Supabase) and your generated courses are saved to your account with row-level security, syncing across any device. Board positions persist too.
- **Dyslexia-friendly reading** — one-tap toggle for the self-hosted **OpenDyslexic** typeface plus a roomier text mode; the choice is saved and applied across every page.
- **Zero-key / zero-config fallback** — with no API keys the app serves a built-in sample course; with no Supabase it runs local-only (per-browser). Fully usable out of the box.
- **Made for a few people** — disable public sign-ups in Supabase and invite a handful of users; optional invite-code gate on generation.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| 3D | React Three Fiber + drei (Three.js) |
| State | Zustand (localStorage cache + cloud sync) |
| Accounts + storage | Supabase Auth + Postgres (RLS) |
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
| `NEXT_PUBLIC_SUPABASE_URL` | Enables accounts + cloud course storage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public, RLS-protected) |

### Enabling accounts (one-time)

1. Create a Supabase project → copy the URL + anon key into `.env.local`.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor (creates the `courses` table + row-level-security policies).
3. To keep it private to a few people: Authentication → Providers → Email → turn off "Allow new users to sign up", then add each person under Authentication → Users.

## Architecture

```
app/
  page.tsx                  Draggable dashboard
  course/[id]/page.tsx      Lesson viewer + 3D stage
  api/generate-course/      POST → AI course JSON
components/
  CourseTile.tsx            Draggable glass tile (pointer events)
  GenerateModal.tsx         "What do you want to learn?" prompt
  AuthModal.tsx             Email/password sign in + sign up
  ModelViewer.tsx           R3F scene; click parts to break down
lib/
  provider.ts               Groq→OpenRouter chat with failover
  courseGen.ts              Prompt + JSON hydrate + sample fallback
  types.ts                  Course / Lesson / ModelSpec schema
  store.ts                  Zustand store with cloud write-through
  supabase.ts               Browser client + session cache (null if unset)
  useAuth.ts                Session hook
  db.ts                     Cloud course CRUD (RLS-scoped)
supabase/
  schema.sql                Table + row-level-security policies
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
