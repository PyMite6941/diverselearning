# IncludAI 2026 — Submission Working Doc

Hackathon: **IncludAI — The Neurodiversity Hackathon** (in partnership with Stanford NNEA)
Build window: **Aug 1 – Aug 8, 2026**, submissions close **Aug 8, 11:59 PM PT**
Track: **AI for Learners Who Think Differently** (K–12 neurodivergent students)

> This file is the working doc for the Devpost submission. Anything marked **`TODO`**
> is not true yet and must not be pasted into the submission until it is.

---

## 1. Submission checklist

| # | Requirement | Status |
|---|---|---|
| 1 | Public GitHub repository | ✅ **public** — https://github.com/PyMite6941/diverselearning |
| 2 | Demo video, **3:00 max**, YouTube/Vimeo, English (or EN subtitles) | 🟡 `videos/demo-includai-3min-narrated.mp4` — **2:47, narrated** — still needs uploading to YouTube |
| 3 | Written project description (problem, users, AI use, ND involvement) | 🟡 drafted below |
| 4 | **Evidence** real neurodivergent users were involved in design/testing | ❌ **not done** — hard requirement, see §4 |
| 5 | "Substantially built during the hackathon period" + disclose pre-existing code | 🟡 disclosure drafted in §5; build work must happen Aug 1–8 |
| 6 | Third-party assets credited + license-compliant | 🟡 see §6 |
| 7 | Live deployment reachable | ✅ https://diverselearning.vercel.app (200 OK) |
| 8 | Parent/guardian permission (participant is under 18) | ❌ get it in writing |

## 2. Judging criteria → what to optimise

| Weight | Criterion | Where this project stands |
|---|---|---|
| 30% | Impact on neurodivergent youth | Strong premise, but needs the co-design evidence in §4 to be credible |
| 25% | Innovation in AI application | AI generates a *3D model spec*, not just text — this is the differentiator, lead with it |
| 25% | Usability & accessibility | Already the deepest area: OpenDyslexic, roomy text, recolorable theme, line reader, TTS, text stats |
| 10% | Technical execution | Next.js 14 + R3F, data-driven `ModelSpec`, provider failover, RLS-locked storage |
| 10% | Presentation quality | Depends entirely on the 3-minute video |

Note the weighting: **55% of the score is impact + accessibility**, only 10% is technical
execution. The video and the write-up should spend their time on *who this helps and how
we know*, not on the stack.

## 3. Devpost field drafts

### Elevator pitch (one line)
> Describe anything you want to learn and DiverseLearning builds you a course you can
> take apart with your hands — every concept rendered as an interactive 3D model, wrapped
> in reading supports you control.

### Inspiration
When I learn something, I don't read it — I take it apart. I break a concept into its
pieces in my head, then slowly put it back together, and when I hit a piece that won't
break down any further, that's when I go research. That's my actual process, and no
learning tool I've used is shaped like it. Textbooks hand you the assembled thing as a
wall of paragraphs and expect the taking-apart to happen invisibly, in your head, while
you're also fighting to hold your place on the line.

DiverseLearning is that process turned into software. The lesson *is* the model. You
rotate it, you hit **Break apart**, the pieces fan out labeled, and you click the one you
don't understand — which is exactly the "hard-to-break-down spot" where I'd normally stop
and go looking. Text is the supporting material, not the main event, and every part of
how it reads is something you can change.

I'm an undiagnosed, self-identifying neurodivergent builder — testing was never something
available to me — so this is built out of how my own head works, not out of a spec sheet
about how neurodivergent people are supposed to learn.

`TODO` — extend with what the ND tester(s) in §4 said, once that session has happened.

### What it does
- **AI generates the course *and* its 3D models.** Ask for any topic; a free-model chain
  (Groq → OpenRouter failover) writes a multi-lesson course where each lesson emits a
  `ModelSpec` — a list of labeled 3D parts with position, rotation, scale, finish. The
  viewer renders it with no code change, so the AI can invent visuals it was never
  programmed for.
- **Break apart.** Any model explodes into its labeled parts; click a part to get a
  plain-language explanation of just that part. Concepts get decomposed physically
  instead of described in a paragraph.
- **Realistic models when a diagram isn't enough.** Looks up real glTF/GLB models from
  free libraries (NASA 3D, NIH 3D, Smithsonian, Poly Pizza) through a CORS-safe proxy.
- **Reading supports the learner controls** — one-tap OpenDyslexic, roomy text, a fully
  recolorable theme (not just dark mode — every channel), a lesson reader with line
  numbers and a line-reader highlight, and text-to-speech.
- **An on-screen text counter** — words, characters, letters, repeated letters, counting
  only what's actually visible as you scroll.
- **A public concept library** — hand-authored, ready-to-open courses (electronics,
  physics, chemistry) that need no account and no API key, so the tool is usable the
  second it loads.

### How we built it
Next.js 14 (App Router) + React 18, React Three Fiber / drei on Three.js for the 3D
stage, Zustand for state, Tailwind for styling with CSS-variable theming so the palette
is fully recolorable at runtime. Auth is Clerk; course storage is Supabase Postgres,
reached only server-side through a Clerk-gated API route using the service-role key
scoped to the signed-in user's id — the browser never touches the database. AI runs on a
free-model chain with automatic failover (`lib/provider.ts`). Deployed on Vercel.

The core design decision: **courses are plain JSON**. A lesson's 3D model is data
(`lib/types.ts`), not code, so the model the AI invents renders through the same viewer
as the hand-authored ones.

### Challenges we ran into
- **Groq's free tier reserves `input + max_tokens` up front against an 8000 TPM budget**,
  so a generous `max_tokens` made *every* generation 413 before it started. Fixed by
  capping `maxTokens` around 5000, trimming the system prompt, and adding OpenRouter as
  a failover to absorb 429s.
- **Reasoning models under-produce structured output.** `gpt-oss-120b` kept returning 3
  lessons with empty models. Fixed by forcing the lesson count and a "6–14 parts per
  model" floor in *both* the system and user prompts.
- **AI-invented asset URLs are always broken** (hallucinated or CORS-blocked). Real
  models now come only from the lookup registry behind a host allow-list.
- **Arbitrary model coordinates.** The AI picks whatever scale it likes, so the viewer
  auto-centers and uniform-fit-scales every model before rendering.
- **The text counter counted itself.** The on-screen scraper re-measured its own output
  in a loop until a `data-text-stats-ignore` subtree marker excluded it.

### Accomplishments we're proud of
The moment a model for a topic nobody hand-authored showed up correctly on screen, fully
labeled and explodable — that's the proof the data-driven `ModelSpec` approach works and
the app isn't limited to a fixed catalog.

### What we learned
`TODO` — the most valuable version of this section is what the neurodivergent
tester(s) changed about the product. Write it after §4.

### What's next
`TODO` — write after the co-design session; the roadmap should be their asks, not ours.
Current roadmap lives in [`TODO.md`](TODO.md).

### Built with
`next.js` `react` `typescript` `three.js` `react-three-fiber` `drei` `zustand`
`tailwindcss` `clerk` `supabase` `postgresql` `groq` `openrouter` `vercel`

### Try it out
- Live app: https://diverselearning.vercel.app
- Repo: https://github.com/PyMite6941/diverselearning *(must be public before submitting)*

---

## 4. Neurodivergent co-design — REQUIRED, NOT YET DONE

The rules: *"Every project must involve at least one real neurodivergent user in its
design or testing"* and the submission must *"demonstrate, with evidence"* that this
happened. A submission without this is incomplete regardless of how good the build is.

**What counts as evidence:** naming who participated (first name / role / relationship
is enough — no diagnosis disclosure required), what was tested, what they said, and
which specific commits or changes came out of it.

### Session protocol (30–45 min, do it early in the week — Aug 1 or 2)
1. Ask the participant to open https://diverselearning.vercel.app cold, with no
   explanation from you. Watch where they hesitate.
2. Tasks: (a) open a library course from `/learn`; (b) read one lesson; (c) use Break
   apart and click two parts; (d) open the accessibility menu and change *anything*;
   (e) generate a course on a topic they actually care about.
3. Ask, don't lead: *What was the most annoying part? What did you expect to happen that
   didn't? Would you use this instead of reading a textbook page — why or why not?*
4. Write every quote down verbatim, then pick 2–3 to fix during the build week.
5. Log it in §4 of this file and ship the fixes as commits that reference it, so the
   evidence trail is visible in the repo.

### Log
| Date | Participant (first name / role) | What they tested | What they said | What changed (commit) |
|---|---|---|---|---|
| `TODO` | | | | |

---

## 5. Pre-existing work disclosure (required)

The rules require pre-existing code to be *"clearly disclosed"* and the project to be
*"substantially built during the hackathon period."* DiverseLearning's first commits
predate the hackathon (June 2026). Paste this verbatim into the Devpost description:

> **Disclosure of pre-existing work.** DiverseLearning began as a personal project in
> June 2026. Work that existed before the Aug 1 kickoff: the Next.js app shell, the
> React Three Fiber viewer with auto-fit and Break-apart explode, the data-driven
> `ModelSpec` course schema, AI course generation over a Groq → OpenRouter failover
> chain, Clerk auth with Supabase storage, the accessibility menu (OpenDyslexic, roomy
> text, recolorable theme, line reader, TTS), the public concept library, and the
> on-screen text counter. Everything committed between Aug 1–8, 2026 is hackathon work
> and is visible in the public commit history: `TODO — list it here`.

**This means the week's build has to be substantial and ND-informed**, not polish.
Candidates that serve the 30%-impact and 25%-accessibility criteria:
- Task-initiation support — break a lesson into a first 60-second step, since "starting"
  is the named barrier in the track description.
- Keyboard + switch navigation for the 3D viewer (currently mouse/touch only) — this is
  a genuine accessibility gap, already in `TODO.md`.
- Reading-load controls: adjustable text density per lesson, or an AI "say this in fewer
  words" rewrite of any paragraph.
- Whatever the §4 session surfaces — **this should outrank everything above.**

## 6. Third-party assets & licenses

| Asset | Source | License | Credited where |
|---|---|---|---|
| OpenDyslexic font | self-hosted, `public/fonts/` | `TODO — confirm and state (OFL)` | `TODO` |
| 3D models (realistic mode) | Poly Pizza, NASA 3D, NIH 3D, Smithsonian, Wikimedia | per-source, mostly CC / public domain | `lib/modelSources.ts` |
| Demo video music | Schumann, *Kinderszenen* Op. 15 No. 7 ("Träumerei") — Musopen recording via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Robert_Schumann_-_scenes_from_childhood,_op._15_-_vii._dreaming.ogg) | **Public domain** (`Copyrighted: False`) — no attribution or share-alike obligation | credited anyway in the YouTube description |

The old 6:40 cut used a *Gymnopédie No.1* recording whose license was never verified —
the composition is public domain but the recording usually isn't, which risks a YouTube
Content ID claim. The new cut replaces it with a Musopen public-domain recording, so
there is nothing to clear. Kinderszenen also happens to mean "Scenes from Childhood",
which is a better fit for a K–12 learning tool.

**Suggested YouTube description credit:**
> Music: Robert Schumann, *Kinderszenen* Op. 15 No. 7 ("Träumerei"). Public-domain
> recording from Musopen, via Wikimedia Commons.

## 6b. The 2:47 cut — what it contains

`videos/demo-includai-3min.mp4` (2:47, 1440×900). Rebuild it with
`videos/build-includai-cut.sh` (needs ffmpeg + the source `videos/demo.mp4`).

| Time | Scene |
|---|---|
| 0:00 | Title card |
| 0:04 | Empty board — "start with any topic you're curious about" |
| 0:16 | Ask for a topic; pick a learning style |
| 0:42 | Course built |
| 0:49 | Open the course — the lesson *is* the model |
| 1:11 | **Break apart** — labeled pieces, click one to inspect it |
| 1:47 | Accessibility — recolor the theme, dyslexia font, roomier text |
| 2:29 | Courses saved to the account |
| 2:41 | End card with links |

Notes on the cut:
- The raw recording's dead time (the blank intro, the tile-dragging stretch, long idle
  holds) is gone; nothing is sped up, so nothing looks rushed.
- On-screen captions carry the narrative, since the recording has no voiceover — this
  also satisfies the English-language requirement without needing subtitles.
- **The app header's "Signed in as \<personal email\>" is blurred** on every dashboard
  shot. It was plainly legible in the raw recording and this video goes on YouTube.
**Two cuts exist:**
- `demo-includai-3min-narrated.mp4` — **upload this one.** Narration over a quiet music
  bed, loudness-normalised to about -16 LUFS.
- `demo-includai-3min.mp4` — the same picture, music only. Keep it as the base for
  re-recording the voiceover.

**The narration is currently a Windows TTS voice, and re-recording it in your own voice
is the single best remaining improvement.** The whole script is a first-person account of
how you learn — a synthetic voice actively works against that, and it is the one thing
tying the demo to the Neurodivergent Innovator claim in §7. The timed script is in
[`videos/NARRATION.md`](videos/NARRATION.md); reading it aloud takes about three minutes,
and `videos/mix-narration.sh` will drop your recordings in without re-cutting the video.

## 7. Neurodivergent Innovator Award ($500)

*"Best project led by a neurodivergent individual or team, honoring 'nothing about us
without us.'"*

Claiming this category, on self-identification.

**Phrasing to use** — accurate, no overclaim:
> I'm a self-identifying neurodivergent builder. I've never been formally assessed —
> testing wasn't something I had access to — but executive function and reading load are
> the daily reality I built this around, and the 3D-first structure is a direct copy of
> how I actually process a concept.

**Do not write** any named condition ("I have ADHD", "I'm dyslexic", "I was diagnosed
with…"). Self-identification is the accepted standard for this award and needs no
diagnosis disclosure; a named-condition claim is the one version that could be
challenged.

**This does not satisfy §4.** The co-design requirement reads as involving someone other
than the builder, and the 30%-impact criterion is scored on evidence of real users.
Self-identification wins award eligibility; external testers win the score. Do both.

*(Personal detail behind this position is in `NOTES-private.md`, which is gitignored.)*
