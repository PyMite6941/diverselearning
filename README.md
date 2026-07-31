# DiverseLearning

## Inspiration

For this project I was told to think with how other people who are neurodiverse would want to learn and I realized that modeled learning is best because it reduces unnecessary words and shows what each part does.

## What it does

There is AI creating a 3D model when a course is created that is then saved for the user to see at a later time, and the courses involve some writing that can be listened to as desired.

## How we built it

I built this with React Vite as the frontend and the backend is a Groq API key and a Supabase DB to store the user's preferences and their json model data.

## Challenges we ran into

A challenge I had was not getting rate limited, we are still solving that issue because free AI models aren't the best as of now on creating good 3D models.

## Accomplishments that we're proud of

The models showing up was super great since that made the proof of concept a reality.

## What we learned

I learned how valuable 3D modeling is in learning and I hope that it continues to be apart of learning for everyone.

## What's next for Diverse Learning

I plan to keep expanding on it as much as possible and making it so much better to include AI-created videos and etc, I intend to make sure everyone's most successful learning method is used.

Your personal, interactive **3D classroom**. Tell it anything you're curious about and it generates a course built just for you — concepts rendered as 3D models you can rotate, explode, and take apart, part by part.

**Live:** https://diverselearning.vercel.app

![status](https://img.shields.io/badge/stage-live-16d9c9)

## What it does (technical)

- **AI-generated courses** — describe an interest and a free-model chain (Groq → OpenRouter failover) writes a 4-lesson course tailored to you, each lesson with its own 3D model.
- **Interactive 3D lessons** — every lesson is a model you can rotate and zoom; hit **Break apart** to explode it into its parts and click each one for a plain-language explanation.
- **Realistic models** — pull real glTF/GLB models from free, open libraries (Poly Pizza, NASA 3D, NIH 3D…) when a diagram isn't enough; found models are saved into the course.
- **Accounts + cloud sync** — sign in with email (Clerk); your courses save to your account and follow you to any device. Board positions persist too.
- **Built for every reader** — one-tap OpenDyslexic font, roomier text, a fully recolorable theme, and a lesson reader with line numbers + text-to-speech.
- **Text stats** — an optional bottom-left counter (words, characters, letters, repeated letters) that measures only what's on screen as you scroll, or the whole page if you switch the scope in Appearance.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| 3D | React Three Fiber + drei (Three.js) |
| State | Zustand |
| Auth | **Clerk** (email sign-in) |
| Storage | **Supabase** (Postgres), server-only via a Clerk-gated API |
| Styling | Tailwind CSS (glassmorphism, CSS-variable theming) |
| AI | Groq → OpenRouter free-model failover (`lib/provider.ts`) |
| Host | Vercel (auto-deploy on push) |

## Architecture

Auth is **Clerk**; data is **Supabase**, but the browser never talks to Supabase
directly. All course storage goes through a Clerk-gated API route that uses the
Supabase **service-role** key server-side, scoped to the Clerk user id.

```
middleware.ts               Clerk — protects everything except /, /sign-in, /sign-up
app/
  page.tsx                  Public landing (live 3D hero)
  dashboard/page.tsx        Draggable course board (Clerk-protected)
  course/[id]/page.tsx      Lesson viewer + 3D stage + Diagram/Realistic toggle
  sign-in|sign-up/          Clerk auth pages
  api/
    generate-course/        POST → AI course JSON
    courses/                GET/POST/PATCH/DELETE → Supabase (service role, per Clerk user)
    find-model/             Look up a real glTF/GLB (curated + Poly Pizza)
    model-proxy/            CORS-safe streaming of an allow-listed model
components/
  ModelViewer.tsx           R3F scene: normalize/fit, edges, explode, click-to-inspect
  GLBViewer.tsx             Loads real glTF/GLB models
  CourseTile.tsx            Draggable glass tile
  GenerateModal.tsx         "What do you want to learn?" prompt
  LessonReader.tsx          Line numbers + line reader + text-to-speech
  AccessibilityMenu.tsx     Theme colors + dyslexia font + roomy text + text stats
  TextStatsOverlay.tsx      Bottom-left word/character/repeat counter
lib/
  textStats.ts              Word, character and repeated-letter counting (pure)
  visibleText.ts            Scrapes on-screen (or whole-page) text from the DOM
  provider.ts               Groq→OpenRouter chat with failover
  courseGen.ts              Prompt + JSON hydrate (+ sample used only for the hero)
  types.ts                  Course / Lesson / ModelSpec schema (data-driven models)
  store.ts                  Zustand store with cloud write-through
  db.ts                     Client → /api/courses
  supabaseAdmin.ts          Server-only Supabase service-role client
  modelSources.ts           Free model libraries + curated registry + host allow-list
supabase/schema.sql         courses table (user_id = Clerk id, RLS locked to service role)
```

Courses are plain JSON (`lib/types.ts`); the AI produces them and the viewer
renders them with no code changes. A model is a list of labeled primitive
**parts** (box/sphere/cylinder/capsule/…) with position, rotation, scale,
opacity, finish, and PBR overrides — that's what makes "the whole thing modeled
and broken down" data-driven.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the keys below
npm run dev                  # http://localhost:3000
```

## Environment

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | Auth (Clerk) — **required** |
| `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` | Course storage — **required** |
| `GROQ_API_KEY` | AI generation (primary) — **required for real courses** |
| `OPENROUTER_API_KEY` | AI failover (optional) |
| `POLY_PIZZA_API_KEY` | Auto-lookup of real CC-licensed models (optional) |

One-time backend setup: create a Supabase project, run [`supabase/schema.sql`](supabase/schema.sql), and put its URL + service-role key in the env. Create a Clerk app and paste its keys.

## Deploy

Connected to Vercel with **auto-deploy on push to `master`**. Manual deploy:

```bash
vercel --prod
```

Set every env var above in the Vercel project (Production/Preview/Development).

See [`TODO.md`](TODO.md) for the roadmap.
