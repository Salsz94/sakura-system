-- ════════════════════════════════════════════════════════════════
-- Migración 004 — Integridad del leaderboard (anti-trampa server-side)
-- Ejecutar en Supabase → SQL Editor, después de la 003.
-- Antes de esto, la única validación de tiempos vivía en el cliente:
-- cualquiera con la anon key podía subir time_ms=1 y quedar #1.
-- ════════════════════════════════════════════════════════════════

-- 1) Constraints de sanidad (idempotentes).
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'srs_time_plausible') then
    alter table public.speed_review_scores
      -- 15 preguntas: por debajo de 1s por pregunta es físicamente implausible;
      -- por encima de 1 hora, basura.
      add constraint srs_time_plausible check (time_ms >= 15000 and time_ms <= 3600000);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'srs_errors_plausible') then
    alter table public.speed_review_scores
      add constraint srs_errors_plausible check (errors >= 0 and errors <= 200);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'srs_name_length') then
    alter table public.speed_review_scores
      add constraint srs_name_length check (char_length(display_name) between 1 and 18);
  end if;
end $$;

-- 2) "Solo si mejora", aplicado en el servidor (el cliente ya lo intenta,
-- pero un UPDATE directo podía pisar un tiempo mejor con uno peor — TOCTOU).
create or replace function public.keep_best_speed_score()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.time_ms > old.time_ms then
    -- El intento nuevo es peor: se ignora (la fila queda como estaba).
    return null;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_keep_best_speed_score on public.speed_review_scores;
create trigger trg_keep_best_speed_score
  before update on public.speed_review_scores
  for each row execute function public.keep_best_speed_score();

-- 3) Derecho a borrar la marca propia (privacidad; también lo usa
-- "Reiniciar progreso" en Ajustes).
drop policy if exists "delete own score" on public.speed_review_scores;
create policy "delete own score" on public.speed_review_scores
  for delete using (auth.uid() = user_id);
