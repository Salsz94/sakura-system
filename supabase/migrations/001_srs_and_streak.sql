-- ════════════════════════════════════════════════════════════════
-- Migración 001 — SRS (Leitner) + racha real
-- Ejecutar en Supabase → SQL Editor.
-- ════════════════════════════════════════════════════════════════

-- 1) Caja de Leitner por caracter (0 = nuevo, 1..5).
--    next_review ya existía; añadimos la caja.
alter table public.mastery
  add column if not exists box integer not null default 0;

-- Asegurar que next_review existe y es timestamptz (por si la tabla es vieja).
alter table public.mastery
  add column if not exists next_review timestamptz;

-- Deduplicar filas (user_id, kana) que puedan existir de antes de esta
-- migración (el upsert original no especificaba conflict target). Se
-- conserva una fila arbitraria por par y se descartan las demás.
-- Es un no-op si no hay duplicados.
delete from public.mastery m
using public.mastery m2
where m.user_id = m2.user_id
  and m.kana = m2.kana
  and m.ctid < m2.ctid;

-- Clave única para que el upsert por (user_id, kana) funcione.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'mastery_user_kana_key'
  ) then
    alter table public.mastery
      add constraint mastery_user_kana_key unique (user_id, kana);
  end if;
end $$;

-- Índice para consultar lo vencido rápido.
create index if not exists mastery_due_idx
  on public.mastery (user_id, next_review);

-- 2) Fecha de la última sesión de entrenamiento (para calcular la racha).
alter table public.user_progress
  add column if not exists last_trained_on date;

-- ════════════════════════════════════════════════════════════════
-- 3) Row Level Security — cada usuario solo ve y edita SUS filas.
--    (Idempotente: se puede re-ejecutar.)
-- ════════════════════════════════════════════════════════════════
alter table public.user_progress enable row level security;
alter table public.mastery        enable row level security;

drop policy if exists "own progress" on public.user_progress;
create policy "own progress" on public.user_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own mastery" on public.mastery;
create policy "own mastery" on public.mastery
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
