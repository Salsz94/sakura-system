// ════════════════════════════════════════════════════════════════
// SRS — Sistema de cajas de Leitner
// Funciones puras: sin React ni Supabase. Fáciles de testear.
// ════════════════════════════════════════════════════════════════
import type { MasteryCard } from '../types';

/**
 * Intervalo (en días) hasta el próximo repaso según la caja.
 * Caja 0 = nueva (vence ya). Cajas 1..5 con intervalos crecientes.
 */
export const LEITNER_INTERVALS_DAYS: Record<number, number> = {
  0: 0,
  1: 1,
  2: 3,
  3: 7,
  4: 14,
  5: 30,
};

export const MAX_BOX = 5;
const MS_PER_DAY = 86_400_000;

/** Caja tras un acierto: sube una, tope en MAX_BOX. */
export function promote(box: number): number {
  return Math.min(MAX_BOX, box + 1);
}

/** Caja tras un fallo: vuelve a la caja 0 — vence DE INMEDIATO.
 * Antes devolvía 1 (repaso en 1 día): un carácter nuevo fallado
 * desaparecía hasta mañana, y acierto y fallo eran indistinguibles
 * para el scheduler en tarjetas nuevas (0→1 en ambos casos). */
export function demote(): number {
  return 0;
}

/** ISO de la próxima fecha de repaso para una caja, desde `now`. */
export function nextReviewISO(box: number, now: Date = new Date()): string {
  const days = LEITNER_INTERVALS_DAYS[box] ?? 0;
  return new Date(now.getTime() + days * MS_PER_DAY).toISOString();
}

/** ¿La tarjeta está vencida (toca repasar) en `now`? */
export function isDue(card: Pick<MasteryCard, 'nextReview'>, now: Date = new Date()): boolean {
  if (!card.nextReview) return true;
  return new Date(card.nextReview).getTime() <= now.getTime();
}

/** Tarjeta nueva, vencida de inmediato (caja 0). */
export function newCard(now: Date = new Date()): MasteryCard {
  return {
    score: 0,
    attempts: 0,
    lastResult: '',
    box: 0,
    nextReview: nextReviewISO(0, now),
  };
}

/**
 * Aplica una respuesta a una tarjeta y devuelve la tarjeta actualizada.
 * Acierto → sube de caja y suma score; fallo → caja 1 y resta score.
 */
export function reviewCard(
  card: MasteryCard | undefined,
  correct: boolean,
  now: Date = new Date()
): MasteryCard {
  const base = card ?? newCard(now);
  const box = correct ? promote(base.box ?? 0) : demote();
  const score = Math.max(0, Math.min(100, (base.score || 0) + (correct ? 15 : -10)));
  return {
    score,
    attempts: (base.attempts || 0) + 1,
    lastResult: correct ? 'correct' : 'incorrect',
    box,
    nextReview: nextReviewISO(box, now),
  };
}

/** Filtra los caracteres con tarjeta vencida, priorizando los más atrasados. */
export function dueChars(
  mastery: Record<string, MasteryCard>,
  now: Date = new Date()
): string[] {
  return Object.entries(mastery)
    .filter(([, card]) => isDue(card, now))
    .sort((a, b) => {
      const ta = a[1].nextReview ? new Date(a[1].nextReview).getTime() : 0;
      const tb = b[1].nextReview ? new Date(b[1].nextReview).getTime() : 0;
      return ta - tb; // más vencido primero
    })
    .map(([ch]) => ch);
}
