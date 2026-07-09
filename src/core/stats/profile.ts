// ════════════════════════════════════════════════════════════════
// ESTADÍSTICAS DE PERFIL — derivadas del estado real del dominio.
// Funciones puras: sin React ni Supabase.
// ════════════════════════════════════════════════════════════════
import type { MasteryMap, Module } from '../types';
import { isDue, MAX_BOX } from '../srs/leitner';

/** ¿El caracter contiene al menos un ideograma (kanji)? */
export function isKanji(ch: string): boolean {
  // Rango CJK Unified Ideographs (kanji). Kana queda fuera.
  return /[㐀-䶿一-鿿]/.test(ch);
}

export interface ProfileStats {
  /** Caracteres con al menos un intento registrado. */
  charsSeen: number;
  /** Dominados: caja Leitner alta (>= 4). */
  charsMastered: number;
  /** En aprendizaje: cajas 1–3. */
  charsLearning: number;
  /** Nuevos / sin acierto sólido: caja 0. */
  charsNew: number;
  /** Vencidos hoy (tocan repaso). */
  charsDue: number;
  /** Kana dominados (>= caja 4). */
  kanaMastered: number;
  /** Kanji dominados (>= caja 4). */
  kanjiMastered: number;
  /** Dominio medio (promedio de score 0–100). */
  avgScore: number;
  /** Total de respuestas registradas (suma de attempts). */
  totalAttempts: number;
  /** Lecciones completadas y total disponible. */
  lessonsDone: number;
  lessonsTotal: number;
  /** Exámenes (módulos) aprobados y total. */
  examsPassed: number;
  examsTotal: number;
  /** Conteo de tarjetas por caja Leitner (índice 0..MAX_BOX). */
  boxDistribution: number[];
}

const MASTERED_BOX = 4;

export function computeProfileStats(
  mastery: MasteryMap,
  doneLs: string[],
  passedEx: string[],
  modules: Module[],
  now: Date = new Date()
): ProfileStats {
  const entries = Object.entries(mastery);
  const boxDistribution = Array<number>(MAX_BOX + 1).fill(0);

  let charsMastered = 0;
  let charsLearning = 0;
  let charsNew = 0;
  let charsDue = 0;
  let kanaMastered = 0;
  let kanjiMastered = 0;
  let scoreSum = 0;
  let totalAttempts = 0;

  for (const [ch, card] of entries) {
    const box = card.box ?? 0;
    if (box >= 0 && box <= MAX_BOX) boxDistribution[box]++;
    if (box >= MASTERED_BOX) {
      charsMastered++;
      if (isKanji(ch)) kanjiMastered++;
      else kanaMastered++;
    } else if (box >= 1) {
      charsLearning++;
    } else {
      charsNew++;
    }
    if (isDue(card, now)) charsDue++;
    scoreSum += card.score || 0;
    totalAttempts += card.attempts || 0;
  }

  const lessonsTotal = modules.reduce((a, m) => a + m.lessons.length, 0);
  const examsTotal = modules.filter((m) => m.lessons.length > 0).length;

  return {
    charsSeen: entries.length,
    charsMastered,
    charsLearning,
    charsNew,
    charsDue,
    kanaMastered,
    kanjiMastered,
    avgScore: entries.length ? Math.round(scoreSum / entries.length) : 0,
    totalAttempts,
    lessonsDone: doneLs.length,
    lessonsTotal,
    examsPassed: passedEx.length,
    examsTotal,
    boxDistribution,
  };
}
