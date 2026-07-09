-- ════════════════════════════════════════════════════════════════
-- Migración 000 — Esquema base (tablas núcleo)
-- Ejecutar PRIMERO en Supabase → SQL Editor. Idempotente: en un
-- proyecto donde las tablas ya existen (creadas a mano en su día),
-- no hace nada. Hace el despliegue reproducible en cualquier
-- proyecto/staging nuevo — sin esto, la migración 001 falla con
-- "relation user_progress does not exist".
-- ════════════════════════════════════════════════════════════════

create table if not exists public.user_progress (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  xp           integer not null default 0,
  streak       integer not null default 0,
  done_lessons jsonb   not null default '[]'::jsonb,
  passed_exams jsonb   not null default '[]'::jsonb,
  module_lives jsonb   not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

create table if not exists public.mastery (
  user_id     uuid not null references auth.users(id) on delete cascade,
  kana        text not null,
  score       integer not null default 0,
  attempts    integer not null default 0,
  last_result text not null default '',
  next_review timestamptz
);
-- (box, unique(user_id,kana), last_trained_on y RLS los añade la 001.)
