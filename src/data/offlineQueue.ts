// ════════════════════════════════════════════════════════════════
// OFFLINE QUEUE — resiliencia básica (nivel 1).
// Si un guardado falla por falta de red, se guarda en localStorage
// (solo el ÚLTIMO estado pendiente, no un historial — progress/mastery
// son "estado actual", no eventos incrementales) y se reintenta al
// reconectar. Nunca lanza: si localStorage falla (modo privado, etc.)
// simplemente no hay cola, sin romper la app.
// ════════════════════════════════════════════════════════════════
import type { Progress, MasteryMap } from '../core/types';
import { saveProgress, saveMastery } from './repositories';

const PENDING_PROGRESS_KEY = 'sakura_pending_progress';
const PENDING_MASTERY_KEY = 'sakura_pending_mastery';

interface PendingProgress {
  userId: string;
  state: Progress;
}
interface PendingMastery {
  userId: string;
  mastery: MasteryMap;
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage no disponible (modo privado, cuota llena) — no es crítico.
  }
}
function safeGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}
function safeClear(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // No-op.
  }
}

export function queueProgress(userId: string, state: Progress): void {
  safeSet(PENDING_PROGRESS_KEY, { userId, state } as PendingProgress);
}
export function queueMastery(userId: string, mastery: MasteryMap): void {
  safeSet(PENDING_MASTERY_KEY, { userId, mastery } as PendingMastery);
}

// ── SNAPSHOT LOCAL (offline nivel 2) ─────────────────────────────
// Espejo del último estado conocido, actualizado en CADA guardado (no
// solo cuando falla). Permite abrir la app sin red — en el tren, en el
// parque — y ver el progreso real en vez de una cuenta vacía. La cola
// de arriba cubre "guardar sin red"; el snapshot cubre "LEER sin red".
const SNAPSHOT_PROGRESS_KEY = 'sakura_snapshot_progress';
const SNAPSHOT_MASTERY_KEY = 'sakura_snapshot_mastery';

export function snapshotProgress(userId: string, state: Progress): void {
  safeSet(SNAPSHOT_PROGRESS_KEY, { userId, state } as PendingProgress);
}
export function snapshotMastery(userId: string, mastery: MasteryMap): void {
  safeSet(SNAPSHOT_MASTERY_KEY, { userId, mastery } as PendingMastery);
}

/** Último estado conocido para este usuario, o null si no hay (o es de otro usuario). */
export function loadSnapshot(userId: string): {
  progress: Progress | null;
  mastery: MasteryMap | null;
} {
  const p = safeGet<PendingProgress>(SNAPSHOT_PROGRESS_KEY);
  const m = safeGet<PendingMastery>(SNAPSHOT_MASTERY_KEY);
  return {
    progress: p && p.userId === userId ? p.state : null,
    mastery: m && m.userId === userId ? m.mastery : null,
  };
}

/** ¿Hay cambios sin sincronizar esperando conexión? */
export function hasPendingSync(): boolean {
  return (
    safeGet<PendingProgress>(PENDING_PROGRESS_KEY) !== null ||
    safeGet<PendingMastery>(PENDING_MASTERY_KEY) !== null
  );
}

/**
 * Reintenta guardar lo pendiente. Se llama al reconectar y al abrir la app.
 * Silencioso: si vuelve a fallar (aún sin red), se deja en cola para el
 * próximo intento.
 */
export async function flushOfflineQueue(): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return;

  // Los repos NUNCA lanzan: devuelven boolean. La cola solo se limpia
  // cuando el guardado realmente llegó — si no, queda para el próximo
  // intento. (Antes se limpiaba siempre: pérdida silenciosa de progreso.)
  const pendingProgress = safeGet<PendingProgress>(PENDING_PROGRESS_KEY);
  if (pendingProgress) {
    const ok = await saveProgress(pendingProgress.userId, pendingProgress.state);
    if (ok) safeClear(PENDING_PROGRESS_KEY);
  }

  const pendingMastery = safeGet<PendingMastery>(PENDING_MASTERY_KEY);
  if (pendingMastery) {
    const ok = await saveMastery(pendingMastery.userId, pendingMastery.mastery);
    if (ok) safeClear(PENDING_MASTERY_KEY);
  }
}
