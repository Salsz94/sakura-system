# Despliegue de Sakura System

Pasos manuales (los que requieren tus credenciales/cuentas). El código ya está listo.

## 1. Base de datos (Supabase) — OBLIGATORIO antes de usar

Entra a tu proyecto en [supabase.com](https://supabase.com) → **SQL Editor** y ejecuta EN ORDEN las 5 migraciones de `supabase/migrations/`:

0. `000_base_schema.sql`
   - Crea las tablas base `user_progress` y `mastery` (`create table if not exists`,
     no hace nada si ya existen). Hace el despliegue reproducible en proyectos nuevos.
1. `001_srs_and_streak.sql`
   - Añade `mastery.box`, asegura `mastery.next_review`, `user_progress.last_trained_on`.
   - Crea la clave única `(user_id, kana)` y activa **RLS** (cada usuario solo ve sus datos).
2. `002_study_time.sql`
   - Añade `user_progress.study_seconds` (horas entrenadas, mostrado en Perfil).
3. `003_speed_review.sql`
   - Añade `user_progress.display_name` (alias público del jugador).
   - Crea la tabla `speed_review_scores` (mejores tiempos del Repaso Cronometrado)
     con RLS: cada usuario escribe solo su fila, pero el leaderboard es legible
     por cualquier usuario autenticado.
4. `004_leaderboard_integrity.sql`
   - Anti-trampa server-side: CHECKs de tiempo/errores/alias plausibles, trigger
     "solo si mejora" (un cliente modificado ya no puede subir time_ms=1), y
     policy DELETE para que cada usuario pueda borrar su propia marca.

Verifica en **Table Editor** que `mastery` tiene `box`, `user_progress` tiene
`last_trained_on`, `study_seconds` y `display_name`, y que existe la tabla
`speed_review_scores`.

> Sin estas migraciones, guardar progreso/maestría/tiempos falla en modo degradado
> (la app no crashea, pero no persiste).

## 2. Subir el código a GitHub

Este proyecto aún no es un repo git. Desde la carpeta `Sakura System`:

```bash
git init
git add .
git commit -m "Sakura System: arquitectura core/data + SRS + perfil + settings"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/sakura-system.git
git push -u origin main
```

> El `.gitignore` ya excluye `.env` y `node_modules`. Las credenciales NO se suben.

## 3. Deploy en Vercel

1. [vercel.com](https://vercel.com) → **Add New… → Project** → importa el repo.
2. **Root Directory**: si subiste solo la carpeta `Sakura System`, déjalo en `.`.
   Si subiste todo el monorepo, ponlo en `Sakura System`.
3. Framework: **Vite** (autodetectado). Build: `npm run build`. Output: `dist`.
4. En **Environment Variables**, añade (de tu `.env`):
   - `VITE_SUPABASE_URL` = (la URL de tu proyecto, la misma de tu `.env`)
   - `VITE_SUPABASE_ANON_KEY` = (tu anon key)
5. **Deploy**.

## 4. Auth en producción (Supabase)

Para que la confirmación de email y el login funcionen en el dominio de Vercel:

1. Supabase → **Authentication → URL Configuration**.
2. **Site URL**: `https://TU-APP.vercel.app`.
3. **Redirect URLs**: añade `https://TU-APP.vercel.app/**`.

> Si quieres saltarte la confirmación por email mientras pruebas:
> Authentication → Providers → Email → desactiva "Confirm email".

## Checklist rápido

- [ ] Migraciones SQL 000-004 ejecutadas en Supabase (en orden)
- [ ] RLS activo (lo hacen las migraciones)
- [ ] Repo en GitHub (sin `.env`)
- [ ] Variables `VITE_*` configuradas en Vercel
- [ ] Site URL + Redirect URLs en Supabase Auth
- [ ] Deploy verde y login funcionando
