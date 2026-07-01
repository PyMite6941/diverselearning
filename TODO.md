# DiverseLearning — Roadmap

Status of the live app (https://diverselearning.vercel.app) and what's next.

## Done
- [x] AI course generation (Groq → OpenRouter failover), data-driven 3D models
- [x] Interactive 3D viewer: normalize/fit, edge outlines, **Break apart** explode, click-to-inspect
- [x] Realistic glTF/GLB models via `/api/find-model` + CORS-safe `/api/model-proxy`
- [x] **Clerk** email auth; **Supabase** storage server-side via Clerk-gated `/api/courses`
- [x] Accessibility: OpenDyslexic, roomy text, recolorable theme, lesson reader (line numbers + TTS)
- [x] Deployed to Vercel with **auto-deploy on push**; public landing

## Launch blockers
- [ ] **Swap Clerk test keys → production instance** before real users (create a
      production instance in the Clerk dashboard, update the Vercel env keys).
- [ ] **Groq free-tier rate limits (8000 TPM).** `max_tokens` is capped at 5000
      so a single generation fits, but simultaneous generations can 429. Add an
      `OPENROUTER_API_KEY` so the failover chain can absorb Groq rate limits, or
      upgrade the Groq tier.

## Nice to have
- [ ] **Streaming generation** — stream `/api/generate-course` so the first
      lesson appears in <1s instead of waiting ~5s for the whole course.
- [ ] **Populate `lib/modelSources.ts` CURATED** with verified public-domain GLB
      URLs (NASA 3D, NIH 3D, Smithsonian) for common topics.
- [ ] **Rate limit `/api/generate-course`** per user (Upstash/Vercel KV) to cap
      AI spend.
- [ ] **Dynamic OG images** (`opengraph-image.tsx`) so shared course links preview well.
- [ ] **Vercel Analytics + Speed Insights** (free) for real-user performance data.
- [ ] **`next/font/local` for OpenDyslexic** so Next preloads it optimally.
- [ ] **LOD / `<Instances>`** for models with many repeated parts (lattices, DNA).
- [ ] Keyboard navigation for the 3D viewer (arrow-key rotate + part select).
