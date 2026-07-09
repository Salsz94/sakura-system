-- ════════════════════════════════════════════════════════════════
-- Migración 002 — Registro de tiempo de estudio
-- Ejecutar en Supabase → SQL Editor.
-- ════════════════════════════════════════════════════════════════

-- Segundos totales acumulados entrenando (todas las sesiones sumadas).
alter table public.user_progress
  add column if not exists study_seconds integer not null default 0;
