// ── PROGRESIÓN: rangos, XP y racha ──────────────────────────────
import type { ModuleLives } from '../types';

/** Vidas Dark Souls iniciales por módulo. */
export const DEFAULT_LIVES: ModuleLives = {
  m1: 3,
  m2: 3,
  m3: 3,
  m4: 3,
  m5: 3,
  m6: 3,
  m7: 3,
  m8: 3,
};


export interface Rank {
  /** Nombre del rango (cinturón). */
  l: string;
  /** XP mínima para alcanzarlo. */
  min: number;
  /** Nombre del siguiente rango. */
  next: string;
  /** XP a la que se alcanza el siguiente. */
  nXp: number;
}

// Tabla extendida a la economía real de XP (sílabo completo ≈ 10-12k):
// antes el rango máximo se alcanzaba al ~25% del contenido, y "Cha-obi"
// se anunciaba como siguiente rango pero no existía en la tabla.
export const RANKS: Rank[] = [
  { l: 'Mukyu', min: 0, next: 'Shiro-obi', nXp: 200 },
  { l: 'Shiro-obi', min: 200, next: 'Ao-obi', nXp: 500 },
  { l: 'Ao-obi', min: 500, next: 'Midori-obi', nXp: 900 },
  { l: 'Midori-obi', min: 900, next: 'Cha-obi', nXp: 1400 },
  { l: 'Cha-obi', min: 1400, next: 'Kuro-obi', nXp: 2200 },
  { l: 'Kuro-obi', min: 2200, next: 'Shodan', nXp: 3400 },
  { l: 'Shodan', min: 3400, next: 'Nidan', nXp: 5000 },
  { l: 'Nidan', min: 5000, next: 'Sandan', nXp: 7200 },
  { l: 'Sandan', min: 7200, next: 'Yondan', nXp: 10000 },
  { l: 'Yondan', min: 10000, next: 'Godan', nXp: 14000 },
  { l: 'Godan', min: 14000, next: 'Rokudan', nXp: 20000 },
];

/** Devuelve el rango actual según la XP. */
export const getRank = (xp: number): Rank =>
  [...RANKS].reverse().find((r) => xp >= r.min) || RANKS[0];

/** Aciertos mínimos para aprobar una lección/examen. */
export const MIN_PASS = 4;

/**
 * Umbral real de aciertos para aprobar una lección, según su número
 * total de ejercicios. Nunca exige más de MIN_PASS, y siempre deja al
 * menos 1 margen de error cuando hay 2+ ejercicios (si solo hay 1
 * ejercicio, no queda margen posible). Sin este tope, una lección con
 * pocos ítems (3-4) exigiría el 100% correcto — cero tolerancia.
 */
export function dynamicPassThreshold(totalExercises: number): number {
  if (!totalExercises) return MIN_PASS;
  return Math.min(MIN_PASS, Math.max(1, totalExercises - 1));
}

// ── RACHA (streak) ──────────────────────────────────────────────

/** Fecha local en formato YYYY-MM-DD. */
export function todayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Diferencia en días entre dos claves YYYY-MM-DD (b - a). */
function dayDiff(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

/**
 * Calcula la racha tras entrenar hoy.
 * - Si ya se entrenó hoy: la racha no cambia.
 * - Si la última sesión fue ayer: +1.
 * - Si fue hace más de un día (o nunca): se reinicia a 1.
 */
export function bumpStreak(
  currentStreak: number,
  lastTrainedOn: string | null | undefined,
  today: string = todayKey()
): { streak: number; lastTrainedOn: string } {
  if (!lastTrainedOn) return { streak: 1, lastTrainedOn: today };
  const diff = dayDiff(lastTrainedOn, today);
  if (diff <= 0) return { streak: Math.max(1, currentStreak), lastTrainedOn: today };
  if (diff === 1) return { streak: currentStreak + 1, lastTrainedOn: today };
  return { streak: 1, lastTrainedOn: today };
}

/**
 * Racha "de visualización" al cargar la app, sin contar una sesión nueva.
 * Si la última sesión fue hoy o ayer, la racha sigue viva; si no, es 0.
 */
export function displayStreak(
  storedStreak: number,
  lastTrainedOn: string | null | undefined,
  today: string = todayKey()
): number {
  if (!lastTrainedOn) return 0;
  const diff = dayDiff(lastTrainedOn, today);
  if (diff <= 1) return storedStreak;
  return 0;
}

// ── TIEMPO DE ESTUDIO ────────────────────────────────────────────

/** Formatea segundos acumulados como "Xh Ym" (o "Ym" / "Zs" si es corto). */
export function formatStudyTime(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}
