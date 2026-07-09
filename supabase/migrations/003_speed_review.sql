-- ════════════════════════════════════════════════════════════════
-- Migración 003 — Repaso cronometrado + leaderboard global
-- Ejecutar en Supabase → SQL Editor.
-- ════════════════════════════════════════════════════════════════

-- Alias público del jugador (nunca se expone el email en el leaderboard).
alter table public.user_progress
  add column if not exists display_name text;

-- Mejor tiempo por usuario y por set de kana (hiragana/katakana).
-- Una sola fila por (user_id, kana_set): siempre el mejor tiempo logrado.
create table if not exists public.speed_review_scores (
  user_id      uuid not null references auth.users(id) on delete cascade,
  kana_set     text not null check (kana_set in ('hiragana', 'katakana')),
  time_ms      integer not null,
  errors       integer not null default 0,
  display_name text not null default 'Anónimo',
  updated_at   timestamptz not null default now(),
  primary key (user_id, kana_set)
);

create index if not exists speed_review_scores_leaderboard_idx
  on public.speed_review_scores (kana_set, time_ms, errors);

-- ════════════════════════════════════════════════════════════════
-- Row Level Security
-- Cada usuario solo inserta/actualiza SU fila; cualquier usuario
-- autenticado puede LEER todas las filas (el leaderboard es público
-- entre los usuarios logueados de la app, no hay acceso anónimo).
-- ════════════════════════════════════════════════════════════════
alter table public.speed_review_scores enable row level security;

drop policy if exists "read all scores" on public.speed_review_scores;
create policy "read all scores" on public.speed_review_scores
  for select using (auth.role() = 'authenticated');

drop policy if exists "insert own score" on public.speed_review_scores;
create policy "insert own score" on public.speed_review_scores
  for insert with check (auth.uid() = user_id);

drop policy if exists "update own score" on public.speed_review_scores;
create policy "update own score" on public.speed_review_scores
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
