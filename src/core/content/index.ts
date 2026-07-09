export { MN } from './mnemonics';
export { FACTS } from './facts';
export { MODULES } from './modules';

import { MODULES } from './modules';

// ── Índice derivado: caracter → lectura ─────────────────────────
// Útil para el repaso diario (reconstruir ejercicios a partir de
// los caracteres vencidos en el SRS).
export const CHAR_READS: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const mod of MODULES) {
    for (const lesson of mod.lessons) {
      (lesson.chars || []).forEach((c, i) => {
        const r = (lesson.reads || [])[i];
        if (c && r && !map[c]) map[c] = r;
      });
    }
  }
  return map;
})();

/** Todos los caracteres conocidos (para distractores del repaso). */
export const ALL_CHARS: string[] = Object.keys(CHAR_READS);
export const ALL_READS: string[] = ALL_CHARS.map((c) => CHAR_READS[c]);

// ── Pool para Repaso Cronometrado ────────────────────────────────
// m1 = hiragana, m2 = katakana. Solo caracteres sueltos (1 kana) de
// lecciones ya completadas por el usuario — nunca palabras de varios
// caracteres, para que el repaso mezclado sea kana puro comparable.
const SPEED_REVIEW_MODULE: Record<'hiragana' | 'katakana', string> = {
  hiragana: 'm1',
  katakana: 'm2',
};

export function getSpeedReviewPool(
  kanaSet: 'hiragana' | 'katakana',
  doneLessonIds: string[]
): { chars: string[]; reads: string[] } {
  const mod = MODULES.find((m) => m.id === SPEED_REVIEW_MODULE[kanaSet]);
  if (!mod) return { chars: [], reads: [] };
  const seen = new Set<string>();
  const chars: string[] = [];
  const reads: string[] = [];
  for (const lesson of mod.lessons) {
    if (!doneLessonIds.includes(lesson.id)) continue;
    (lesson.chars || []).forEach((c, i) => {
      const r = (lesson.reads || [])[i];
      if (c && r && c.length === 1 && !seen.has(c)) {
        seen.add(c);
        chars.push(c);
        reads.push(r);
      }
    });
  }
  return { chars, reads };
}
