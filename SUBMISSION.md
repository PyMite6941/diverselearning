# Devpost submission — paste-ready

Everything below goes straight into the Devpost form. Only two things are still blank,
and both are marked **`FILL`**: the co-design evidence (from [`CODESIGN.md`](CODESIGN.md))
and the video URL.

---

## Project name
DiverseLearning

## Elevator pitch *(200 char limit)*
> Describe anything you want to learn and DiverseLearning builds a course you can take
> apart with your hands — every concept as an interactive 3D model, wrapped in reading
> controls you own.

## Track
**Track 1** — shown as *"AI for Learners Who Think Differently"* on the overview page and
*"AI for K–12 Learning"* in the prize table. Same track; pick whichever label the form shows.

## Deadline
**Aug 8, 11:45 PM Pacific** = **Sun Aug 9, 1:45 PM Bangkok time**. It is 11:45, not 11:59.

## Try it out
- https://diverselearning.vercel.app
- https://github.com/PyMite6941/diverselearning

## Built with
`next.js` `react` `typescript` `three.js` `react-three-fiber` `drei` `zustand`
`tailwindcss` `clerk` `supabase` `postgresql` `groq` `openrouter` `vercel`

---

# Project story

## Inspiration

When I learn something, I don't read it — I take it apart. I break a concept into its
pieces in my head, put it back together, and when I hit a piece that won't break down any
further, that's when I go and research. That's my actual process, and no learning tool
I've used is shaped like it. Textbooks hand you the assembled thing as a wall of
paragraphs and expect the taking-apart to happen invisibly, in your head, while you're
also fighting to hold your place on the line.

Here is the specific version. Individual words cost me something to read. The story lands
fine once I have it — I visualize easily and in detail — but getting it off the page is
work, and after a while that effort reads as boredom even when the book isn't boring. I
once spent two hours on fifty pages of a novel I was enjoying. What I'm good at is the
part after the words: holding a structure in my head and turning it around.

So I built the thing I actually wanted. Put the model first and let the text support it,
instead of the other way round.

I'm a self-identifying neurodivergent builder — I've never been formally assessed,
because testing was never something available to me. DiverseLearning is my own process
turned into software, not a spec sheet about how neurodivergent people are supposed to
learn.

## What it does

**The lesson is a 3D model, not a wall of text.**

- **The AI writes the course *and* its models.** Describe any topic and a free-model
  chain (Groq → OpenRouter failover) writes a multi-lesson course where every lesson
  emits a `ModelSpec` — labeled 3D parts with position, rotation, scale and finish. The
  viewer renders it with no code change, so the AI can invent visuals it was never
  programmed for. The models are *data*, not code. That's the whole trick.
- **Break apart.** Any model explodes into its labeled pieces; click one to get a
  plain-language explanation of just that piece. Concepts get decomposed physically
  instead of described in a paragraph.
- **Task initiation support.** A lesson arrives all at once — paragraphs, a model, a
  quiz — and *starting* is its own barrier, separate from difficulty. The **Start here**
  card shows one small action at a time ("find the piece labelled X, just look at it")
  and won't show the next until the current one is done.
- **Fully keyboard operable.** Step through every part of a model with the arrow keys,
  break it apart with `B`, rotate with `Shift`+arrows, zoom with `Z`/`X`. The selected
  part's label and explanation are mirrored into a live region, because a 3D canvas is
  opaque to a screen reader.
- **Reading controls the learner owns.** One-tap OpenDyslexic, roomier text, a fully
  recolorable theme (not a dark mode — every colour channel), line numbers, a line-reader
  highlight, and text-to-speech. One button, always in reach.
- **Realistic models** pulled from free libraries (NASA 3D, NIH 3D, Smithsonian, Poly
  Pizza) when a diagram isn't enough.
- **A public concept library** — hand-authored courses that need no account and no API
  key, so it's usable the second it loads.

## Who it's for

Neurodivergent K–12 learners, and specifically the ones failed by text-first material for
reasons that have nothing to do with ability: people who lose the line they were on, who
read slowly but reason fast, who need to see how parts fit together before words mean
anything, or who stall at *starting* rather than at the work itself.

## How we built it

Next.js 14 (App Router) + React 18, React Three Fiber / drei on Three.js for the 3D
stage, Zustand for state, Tailwind with CSS-variable theming so the palette is
recolorable at runtime. Auth is Clerk; storage is Supabase Postgres, reached only
server-side through a Clerk-gated API route using a service-role key scoped to the
signed-in user — the browser never touches the database. AI runs on a free-model chain
with automatic failover. Deployed on Vercel.

The core decision: **courses are plain JSON**. A lesson's model is data (`lib/types.ts`),
so an AI-invented model renders through the same viewer as a hand-authored one.

## Challenges we ran into

- **Groq's free tier reserves `input + max_tokens` up front against an 8000 TPM budget**,
  so a generous `max_tokens` made *every* generation 413 before it started. Fixed by
  capping `maxTokens` near 5000, trimming the system prompt, and adding OpenRouter
  failover to absorb 429s.
- **Reasoning models under-produce structured output.** `gpt-oss-120b` kept returning 3
  lessons with empty models, so the lesson count and a "6–14 parts per model" floor are
  forced in *both* the system and user prompts.
- **AI-invented asset URLs are always broken** — hallucinated or CORS-blocked. Real
  models now come only from a lookup registry behind a host allow-list.
- **Arbitrary model coordinates.** The AI picks whatever scale it likes, so the viewer
  auto-centers and uniform-fit-scales every model before rendering.
- **Making a 3D canvas accessible at all.** WebGL is a black box to assistive tech —
  there is no DOM to read. The fix was to stop treating the canvas as the interface and
  mirror its state into text.

## Accomplishments that we're proud of

The moment a model for a topic nobody hand-authored appeared correctly on screen, fully
labeled and explodable. That's the proof the data-driven approach works and the app isn't
limited to a fixed catalog.

And getting the 3D viewer off the mouse. An interactive model that only works if you can
point at it is a strange thing to put in front of learners with motor and attention
differences, and fixing it was the change I'd have been embarrassed to skip.

## Neurodivergent involvement in design and testing

**`FILL` — from [`CODESIGN.md`](CODESIGN.md) §5, after the session. Include: who took
part (first name or "Participant A"), what they tested, at least one verbatim quote, what
you learned, and which commits came out of it.**

## What we learned

**`FILL` after the session — the strongest version of this section is what the tester
changed your mind about, not what you already believed.**

## What's next for DiverseLearning

**`FILL` after the session — the roadmap should lead with what they asked for.**
Standing items: streaming generation so the first lesson appears in under a second,
verified public-domain GLB models for common topics, and switch-device support building
on the new keyboard layer.

---

## Disclosure of pre-existing work

*(Required by the rules. Paste as-is, and complete the commit list.)*

> DiverseLearning began as a personal project in June 2026. Work that existed before the
> August 1 kickoff: the Next.js app shell, the React Three Fiber viewer with auto-fit and
> Break-apart explode, the data-driven `ModelSpec` course schema, AI course generation
> over a Groq → OpenRouter failover chain, Clerk auth with Supabase storage, the
> accessibility menu (OpenDyslexic, roomy text, recolorable theme, line reader, TTS), the
> public concept library, and the on-screen text counter.
>
> Built during the hackathon week (Aug 1–8, 2026), visible in the public commit history:
> full keyboard and screen-reader operation of the 3D viewer (`598a202`), task-initiation
> "Start here" steps (`598a202`), **`FILL` — the changes that came out of the co-design
> session**.

## Third-party assets

> 3D models are pulled from free libraries (Poly Pizza, NASA 3D, NIH 3D, Smithsonian,
> Wikimedia) under their respective licenses; sources are listed in
> `lib/modelSources.ts`. The demo video's music is Robert Schumann's *Kinderszenen*
> Op. 15 No. 7, a public-domain recording from Musopen via Wikimedia Commons.

## Demo video
**`FILL` — YouTube URL.** Upload `videos/demo-includai-3min-narrated.mp4` (2:47).
Suggested video description:

> DiverseLearning — AI-generated 3D courses for learners who think differently. Built for
> IncludAI 2026. Live: https://diverselearning.vercel.app · Code:
> https://github.com/PyMite6941/diverselearning
>
> Music: Robert Schumann, Kinderszenen Op. 15 No. 7 ("Träumerei"). Public-domain
> recording from Musopen, via Wikimedia Commons.
