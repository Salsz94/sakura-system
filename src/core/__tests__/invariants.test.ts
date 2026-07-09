// ════════════════════════════════════════════════════════════════
// INVARIANTES DE CONTENIDO Y MOTOR — suite permanente.
// Estos checks nacieron de la auditoría 2026-07-06: los bugs A1-A4
// (opciones duplicadas, respuestas ambiguas, pares indistinguibles)
// habrían sido atrapados por estas ~10 aserciones. Correr con:
//   npm test
// ════════════════════════════════════════════════════════════════
import { describe, it, expect } from 'vitest';
import { genExercises, uniqueBy } from '../engine/exerciseEngine';
import { MODULES, CHAR_READS, ALL_CHARS, ALL_READS } from '../content';
import { dynamicPassThreshold, RANKS, getRank } from '../progression';
import { reviewCard, demote, newCard, isDue } from '../srs/leitner';

const SEEDS = [1, 7, 42, 123, 999, 2026, 31337, 55555, 77777, 99999];

/** Genera los ejercicios de una lección con el pool de su módulo (como openLesson). */
function genForLesson(mod: (typeof MODULES)[number], lesson: (typeof MODULES)[number]['lessons'][number], seed: number) {
  const allC = mod.lessons.flatMap((l) => l.chars || []);
  const allR = mod.lessons.flatMap((l) => l.reads || []);
  return genExercises(lesson.chars || [], lesson.reads || [], seed, allC, allR, lesson.id, lesson.vocab || []);
}

describe('contenido: paralelismo chars/reads', () => {
  it('toda lección tiene chars y reads del mismo largo', () => {
    for (const mod of MODULES) {
      for (const l of mod.lessons) {
        expect((l.chars || []).length, `${l.id}`).toBe((l.reads || []).length);
      }
    }
  });
});

describe('motor: sin opciones duplicadas ni respuestas ausentes', () => {
  it('kana_hero/pick_kana: opciones únicas, respuesta presente, sin ambigüedad de lectura', () => {
    for (const mod of MODULES) {
      for (const lesson of mod.lessons) {
        for (const seed of SEEDS) {
          const exs = genForLesson(mod, lesson, seed);
          for (const ex of exs) {
            if (ex.type !== 'kana_hero' && ex.type !== 'pick_kana' && ex.type !== 'listen')
              continue;
            const opts = ex.opts || [];
            const ctx = `${lesson.id} seed=${seed} ${ex.type}`;
            // Sin duplicados idénticos (dos botones iguales, uno "error").
            expect(new Set(opts).size, `${ctx}: opts duplicadas ${opts}`).toBe(opts.length);
            // La respuesta correcta está entre las opciones.
            expect(ex.ans, `${ctx}: ans -1`).not.toBe(-1);
            // pick_kana/listen: ninguna otra opción comparte la lectura pedida
            // (dos respuestas "objetivamente correctas" donde solo una puntúa).
            if (ex.type === 'pick_kana' || ex.type === 'listen') {
              const sameReading = opts.filter((o) => CHAR_READS[o] === ex.romaji);
              expect(sameReading.length, `${ctx}: ${sameReading} comparten lectura "${ex.romaji}"`).toBeLessThanOrEqual(1);
            }
            // listen: solo kana suelto (el TTS pronuncia un caracter).
            if (ex.type === 'listen') {
              expect((ex.kana || '').length, `${ctx}: listen con palabra larga`).toBe(1);
            }
          }
        }
      }
    }
  });

  it('pair_match: pares únicos por ambos lados', () => {
    for (const mod of MODULES) {
      for (const lesson of mod.lessons) {
        for (const seed of SEEDS) {
          const exs = genForLesson(mod, lesson, seed);
          for (const ex of exs) {
            if (ex.type !== 'pair_match') continue;
            const pairs = ex.pairs || [];
            const lefts = pairs.map((p) => p.left);
            const rights = pairs.map((p) => p.right);
            expect(new Set(lefts).size, `${lesson.id}: lefts duplicados`).toBe(lefts.length);
            expect(new Set(rights).size, `${lesson.id}: rights duplicados`).toBe(rights.length);
          }
        }
      }
    }
  });

  it('build_sentence: respuesta contenida en items, sin tiles duplicados', () => {
    for (const mod of MODULES) {
      for (const lesson of mod.lessons) {
        if (!lesson.vocab?.length) continue;
        for (const seed of SEEDS) {
          const exs = genForLesson(mod, lesson, seed);
          for (const ex of exs) {
            if (ex.type !== 'build_sentence') continue;
            const ans = ex.ans as string[];
            const items = ex.items || [];
            expect(ans.every((t) => items.includes(t)), `${lesson.id}: token fuera del banco`).toBe(true);
            expect(new Set(items).size, `${lesson.id}: tiles duplicados`).toBe(items.length);
          }
        }
      }
    }
  });

  it('repaso global (pool ALL_CHARS): pick_kana sin ambigüedad hiragana/katakana', () => {
    const chars = ALL_CHARS.slice(0, 12);
    const reads = chars.map((c) => CHAR_READS[c]);
    for (const seed of SEEDS) {
      const exs = genExercises(chars, reads, seed, ALL_CHARS, ALL_READS, 'review');
      for (const ex of exs) {
        if (ex.type !== 'pick_kana') continue;
        const sameReading = (ex.opts || []).filter((o) => CHAR_READS[o] === ex.romaji);
        expect(sameReading.length, `review seed=${seed}: ambigua "${ex.romaji}"`).toBeLessThanOrEqual(1);
      }
    }
  });

  it('ninguna lección crashea generando (todas las semillas)', () => {
    for (const mod of MODULES) {
      for (const lesson of mod.lessons) {
        for (const seed of SEEDS) {
          expect(() => genForLesson(mod, lesson, seed)).not.toThrow();
        }
      }
    }
  });
});

describe('progresión', () => {
  it('umbral de aprobado deja siempre 1 de margen con 2+ ejercicios', () => {
    expect(dynamicPassThreshold(0)).toBe(4);
    expect(dynamicPassThreshold(1)).toBe(1);
    expect(dynamicPassThreshold(3)).toBe(2);
    expect(dynamicPassThreshold(4)).toBe(3);
    expect(dynamicPassThreshold(6)).toBe(4);
    expect(dynamicPassThreshold(12)).toBe(4);
  });

  it('RANKS: cada "next" existe como rango y los min son crecientes (sin rangos fantasma)', () => {
    const names = new Set(RANKS.map((r) => r.l));
    for (let i = 0; i < RANKS.length; i++) {
      if (i < RANKS.length - 1) {
        expect(names.has(RANKS[i].next), `"${RANKS[i].next}" prometido pero inexistente`).toBe(true);
        expect(RANKS[i + 1].min).toBeGreaterThan(RANKS[i].min);
        // El siguiente rango arranca exactamente donde este promete.
        expect(RANKS[i + 1].min).toBe(RANKS[i].nXp);
      }
    }
    expect(getRank(0).l).toBe('Mukyu');
    expect(getRank(1500).l).toBe('Cha-obi');
  });
});

describe('SRS Leitner', () => {
  it('fallar una tarjeta la deja vencida YA (caja 0), no en 1 día', () => {
    expect(demote()).toBe(0);
    const failed = reviewCard(newCard(), false);
    expect(failed.box).toBe(0);
    expect(isDue(failed)).toBe(true);
  });
  it('acertar sube de caja y agenda a futuro', () => {
    const passed = reviewCard(newCard(), true);
    expect(passed.box).toBe(1);
    expect(isDue(passed)).toBe(false);
  });
});

describe('uniqueBy', () => {
  it('conserva la primera aparición por clave', () => {
    const arr = [{ k: 'a', v: 1 }, { k: 'b', v: 2 }, { k: 'a', v: 3 }];
    expect(uniqueBy(arr, (x) => x.k)).toEqual([{ k: 'a', v: 1 }, { k: 'b', v: 2 }]);
  });
});
