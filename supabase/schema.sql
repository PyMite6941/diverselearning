-- DiverseLearning — Supabase schema (Clerk-authenticated)
-- Auth is handled by Clerk; course storage is Supabase. Access goes through
-- the Clerk-gated /api/courses route using the Supabase SERVICE ROLE key
-- (server-only), scoped to the Clerk user id. RLS is enabled with no public
-- policies, so the anon key can't read/write anything — only the service role
-- (which bypasses RLS) can, and only from the authenticated server route.
--
-- Run in the Supabase SQL editor (Dashboard → SQL → New query).

create table if not exists public.courses (
  id          text primary key,           -- course slug (from the app)
  user_id     text not null,              -- Clerk user id (e.g. "user_...")
  data        jsonb not null,             -- full Course JSON
  layout      jsonb,                       -- draggable tile position
  created_at  timestamptz not null default now()
);

create index if not exists courses_user_idx
  on public.courses (user_id, created_at desc);

-- Lock the table down: RLS on, and no anon/authenticated policies. Only the
-- service role (used server-side by the Clerk-gated API) can touch rows.
alter table public.courses enable row level security;
