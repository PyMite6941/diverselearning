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
| `POLY_PIZZA_API_KEY` | Auto-lookup of real CC-licensed GLB models per lesson |
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

## TODO

Features and infrastructure improvements that would meaningfully extend the app.
Items are roughly ordered by impact.

### Modeling & 3D

- **Populate `lib/modelSources.ts` CURATED list** — add verified public-domain
  GLB URLs from NASA 3D, NIH 3D, and Smithsonian 3D for common topics (solar
  system, anatomy, molecules). Each entry is just `{ keywords, model }`.
- **Poly Pizza dynamic lookup** — set `POLY_PIZZA_API_KEY` (free at
  https://poly.pizza/api) and real CC-BY models are fetched automatically for
  every lesson via `/api/find-model`. Currently only the curated list is tried.
- **HDRI lighting** — swap the hand-coded three-light rig in `ModelViewer.tsx`
  for `@react-three/drei`'s `<Environment preset="studio">` on a per-course
  toggle. Trades a ~600 KB EXR download for far better reflections on metal
  and glass parts; worth it for "realistic view" mode.
- **LOD / instancing** — for courses with many identical parts (crystal
  lattices, DNA base-pairs) use `<Instances>` from drei to batch draw calls and
  keep the frame rate smooth on mobile.
- **Offline GLB cache** — proxy fetched GLBs to Vercel Blob (or R2) so
  `/api/model-proxy` serves from the same edge as the app instead of going back
  upstream on every request.

### Performance & Vercel

- **Vercel Analytics + Speed Insights** — add `@vercel/analytics` and
  `@vercel/speed-insights` to `app/layout.tsx`. Both are free on the Hobby plan
  and give real-user performance data without a separate analytics account.
  ```tsx
  import { Analytics } from "@vercel/analytics/react";
  import { SpeedInsights } from "@vercel/speed-insights/next";
  // add <Analytics /> and <SpeedInsights /> inside <body>
  ```
- **Dynamic OG images** — add `app/course/[id]/opengraph-image.tsx` using
  `next/og` (`ImageResponse`) to generate a course-specific social card (title,
  accent color, lesson count). Makes shared links preview nicely on all
  platforms.
- **Rate limiting on `/api/generate-course`** — use Upstash Redis
  (`@upstash/ratelimit`) or Vercel KV to cap generation requests per IP / per
  user (e.g. 5 courses/hour). Currently the only gate is the optional invite
  code, so a leaked key can drain the AI quota.
- **Streaming generation response** — switch `/api/generate-course` to a
  `ReadableStream` response and stream the AI output token-by-token into the
  UI. Cuts perceived latency from ~8 s to < 1 s for the first visible lesson
  content, without changing the AI provider chain.
- **`next/font` for OpenDyslexic** — the font is already self-hosted in
  `public/fonts/`; wrap it with `next/font/local` in `app/layout.tsx` so
  Next.js preloads and caches it with optimal headers automatically.

### Accessibility & UX

- **Audio narration** — add a TTS button to `LessonReader.tsx` using the Web
  Speech API (`window.speechSynthesis`) or a server-side TTS route (e.g.
  OpenAI TTS, Groq audio). Narration + dyslexia font together make the app
  genuinely screen-reader-adjacent.
- **Keyboard navigation for 3D** — expose arrow-key rotation and part
  selection in `ModelViewer.tsx` so learners who can't use a mouse can still
  explore every model.
- **Reduced-motion support** — read `prefers-reduced-motion` and disable
  the `<Float>` animation and `autoRotate` in `ModelViewer.tsx` for users who
  have that setting on.

### Content & Collaboration

- **Course export** — "Save as PDF" button that server-side renders each lesson
  (text + a static screenshot of the 3D model) using `puppeteer-core` + a
  Vercel function. Lets learners keep a course offline.
- **Share link** — generate a read-only deep-link (`/course/[id]?shared=1`)
  that bypasses the auth check so the owner can share a course with anyone.
  The existing `/api/model-proxy` SSRF allow-list already prevents abusing
  the proxy; the main change is a Supabase RLS policy that allows reads on
  `shared = true` rows.
- **Supabase Realtime collaboration** — subscribe to the `courses` table in
  `store.ts` with `supabase.channel()` so two users on the same course page
  see each other's part selections live (good for tutoring use cases).

### Auth & Access Control

- **Magic-link / OAuth sign-in** — enable Supabase's magic-link (passwordless)
  or Google OAuth provider so users don't need to remember a password. Zero
  extra server code; just a config toggle in Supabase → Authentication →
  Providers.
- **Vercel Edge Config for invite codes** — move `DL_INVITE_CODES` from an env
  var to Vercel Edge Config so codes can be rotated without a redeploy.
  `@vercel/edge-config` reads the value at request time on the edge.
