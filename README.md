# Sakura System

Plataforma de aprendizaje de japonés gamificada, camuflada de videojuego (estilo dojo
cyberpunk, pensada para gamers). React + Vite + TypeScript + Supabase.

> El producto se define en `../Documentos Importantes` (Product Bible + Sílabo). El
> principio rector: **la lógica de dominio debe sobrevivir a un rewrite** — por eso el
> núcleo (`core/`) no depende de React ni de Supabase.

## Setup

```bash
npm install
cp .env.example .env      # rellena tus credenciales de Supabase
npm run dev
```

### Variables de entorno (`.env`)

```
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### Base de datos

Ejecuta EN ORDEN las 3 migraciones en **Supabase → SQL Editor**:

```
supabase/migrations/001_srs_and_streak.sql   # SRS Leitner + racha + RLS
supabase/migrations/002_study_time.sql       # tiempo de estudio acumulado
supabase/migrations/003_speed_review.sql     # alias + leaderboard global
```

Sin ellas, el guardado falla en modo degradado (la app no crashea, pero no persiste).

## Arquitectura

```
src/
├── core/              # Dominio puro — sin React ni Supabase (testeable)
│   ├── types.ts       # Module, Lesson, Exercise, MasteryCard, Progress…
│   ├── content/       # MODULES (8 módulos · 53 lecciones), MN, FACTS,
│   │                  # índice char→lectura, pool del Repaso Cronometrado
│   ├── engine/        # rng, shuffle, genExercises (ORDER_SAFE_LESSONS)
│   ├── progression/   # rangos, XP, dynamicPassThreshold, racha, tiempo
│   ├── srs/           # SRS por cajas de Leitner (1·3·7·14·30 días)
│   └── stats/         # stats derivadas para el Perfil
├── data/              # Infraestructura — único punto que habla con Supabase
│   ├── supabaseClient.ts
│   ├── offlineQueue.ts        # cola localStorage + reintento al reconectar
│   └── repositories/          # progressRepo, masteryRepo, leaderboardRepo
├── screens/           # 15 pantallas tipadas (Home, Map, ModuleLessons,
│   │                  # Intro, Battle, Summary, Fail, ExamPhase + 3 fases,
│   │                  # ExamRes, SpeedReview, Leaderboard, Profile, Settings)
├── components/        # Btn, Ghost, TypeRomajiInput, PairMatch, LevelUpOverlay
├── audio/             # soundManager (archivos en /public/sounds)
├── styles/tokens.ts   # paleta cyberpunk C (lima #8CF244 sobre #04000D)
└── App.tsx            # estado global + navegación + wiring
```

## Sistemas de juego

- **Mapa mundial**: roadmap tipo circuito (trazos ortogonales, nodos con chaflán).
  Cada nodo abre solo las lecciones de su módulo; al completarlas aparece el
  nodo **boss** (examen de 3 fases: Rapid Combo → Kana Match → Mini Boss).
- **Vidas Dark Souls**: 3 por módulo; al perderlas todas el módulo se resetea.
- **SRS Leitner**: 5 cajas (1·3·7·14·30 días). El Repaso diario (Home) ofrece
  los caracteres vencidos.
- **Repaso Cronometrado**: kana mezclado contra el reloj + **leaderboard global**
  entre usuarios (alias, nunca el email; solo se guarda tu mejor tiempo).
- **Progresión**: XP, rangos de cinturón (Mukyu → Shodan), overlay de subida de
  rango, racha diaria real y horas entrenadas en el Perfil.
- **Integridad de dificultad**: las mnemotecnias solo aparecen DESPUÉS de
  responder; el umbral de aprobado (`dynamicPassThreshold`) deja siempre 1 punto
  de margen sin regalar el resultado.
- **Offline nivel 2 (PWA)**: la app es instalable y funciona sin señal (tren,
  parque). El service worker precachea el shell completo (código, sonidos,
  íconos) y las fuentes se cachean al primer uso con red. El progreso se lee
  desde un espejo local (`localStorage`) cuando no hay conexión y los guardados
  se encolan hasta reconectar. Requiere haber abierto la app al menos una vez
  con red (para instalar el SW y poblar el espejo). Solo funciona en build de
  producción (`npm run build` + serve), no en `npm run dev`.

## Scripts

- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción (incluye service worker PWA)
- `npm run preview` — sirve el build
- `npm test` — suite de invariantes (vitest): contenido, motor de
  ejercicios, rangos y SRS. Correr SIEMPRE antes de tocar `core/`.

## Despliegue

Ver [DEPLOY.md](./DEPLOY.md) — migraciones SQL, GitHub, Vercel y Auth en producción.

## Pendiente / ideas

- Repaso Cronometrado de katakana ya soportado por el motor (usa el pool de m2).
- Audio de pronunciación / shadowing por caracter.
- Resolución de conflictos multi-dispositivo (offline nivel 3): hoy el último
  guardado gana; si juegas offline en dos dispositivos a la vez, uno pisa al otro.
