-- DiverseLearning — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- Stores each user's generated courses, protected by row-level security so a
-- user can only ever see and edit their own.

create table if not exists public.courses (
  id          text primary key,                 -- course slug (from the app)
  user_id     uuid not null references auth.users (id) on delete cascade,
  data        jsonb not null,                   -- full Course JSON
  layout      jsonb,                            -- draggable tile position
  created_at  timestamptz not null default now()
);

create index if not exists courses_user_idx
  on public.courses (user_id, created_at desc);

alter table public.courses enable row level security;

-- A user may only read/write their own rows.
drop policy if exists "courses_select_own" on public.courses;
create policy "courses_select_own"
  on public.courses for select
  using (auth.uid() = user_id);

drop policy if exists "courses_insert_own" on public.courses;
create policy "courses_insert_own"
  on public.courses for insert
  with check (auth.uid() = user_id);

drop policy if exists "courses_update_own" on public.courses;
create policy "courses_update_own"
  on public.courses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "courses_delete_own" on public.courses;
create policy "courses_delete_own"
  on public.courses for delete
  using (auth.uid() = user_id);

-- ── Hosting for "a few people" ────────────────────────────────────────────
-- To keep the app private to a handful of users, the simplest control is to
-- turn OFF public sign-ups and invite users by hand:
--   Dashboard → Authentication → Providers → Email → disable "Allow new users
--   to sign up", then add each person via Authentication → Users → Add user.
-- (Email confirmation can be left on or off depending on whether you've
--  configured SMTP.)
