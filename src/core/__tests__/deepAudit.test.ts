import { describe, it, expect } from 'vitest';
import { MODULES, CHAR_READS, ALL_CHARS, ALL_READS } from '../content';
import { VOCAB_DICTIONARY, getVocabEntry } from '../content/vocabDictionary';
import { genExercises, uniqueBy } from '../engine/exerciseEngine';
import { dynamicPassThreshold, RANKS, getRank } from '../progression';
import { reviewCard, demote, newCard, isDue, dueChars } from '../srs/leitner';

const SEEDS_AUDIT = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946];

describe('AUDITORÍA PROFUNDA DE LÍNEA POR LÍNEA: Contenido & Diccionario', () => {
  it('Verifica que los 8 módulos existen y tienen lecciones válidas', () => {
    expect(MODULES.length).toBe(8);
    const modIds = MODULES.map((m) => m.id);
    expect(modIds).toEqual(['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8']);

    let totalLessons = 0;
    for (const m of MODULES) {
      expect(m.title).toBeTruthy();
      expect(m.lessons.length).toBeGreaterThan(0);
      totalLessons += m.lessons.length;
    }
    expect(totalLessons).toBe(71);
  });

  it('Verifica consistencia en todas y cada una de las 69 lecciones (chars vs reads)', () => {
    for (const mod of MODULES) {
      for (const l of mod.lessons) {
        expect(l.id, `Lección sin ID en módulo ${mod.id}`).toBeTruthy();
        expect(l.t, `Lección ${l.id} sin título`).toBeTruthy();
        const chars = l.chars || [];
        const reads = l.reads || [];
        expect(chars.length, `Lección ${l.id}: chars.length !== reads.length`).toBe(reads.length);

        if (l.vocab) {
          expect(Array.isArray(l.vocab)).toBe(true);
          for (const v of l.vocab) {
            expect(typeof v.jp).toBe('string');
            expect(v.jp.trim().length).toBeGreaterThan(0);
            expect(typeof v.es).toBe('string');
            expect(v.es.trim().length).toBeGreaterThan(0);
          }
        }
      }
    }
  });

  it('Verifica que cada entrada en VOCAB_DICTIONARY esté bien formada', () => {
    const keys = Object.keys(VOCAB_DICTIONARY);
    expect(keys.length).toBeGreaterThanOrEqual(400);

    for (const key of keys) {
      const entry = VOCAB_DICTIONARY[key];
      expect(entry, `Entrada nula para key: ${key}`).toBeDefined();
      expect(entry.jp, `jp ausente en ${key}`).toBeTruthy();
      expect(entry.romaji, `romaji ausente en ${key}`).toBeTruthy();
      expect(entry.es, `es ausente en ${key}`).toBeTruthy();
      expect(['kana', 'vocab', 'kanji']).toContain(entry.type);
    }
  });

  it('Verifica que getVocabEntry resuelve correctamente con fallbacks', () => {
    const neko = getVocabEntry('ねこ');
    expect(neko).toBeDefined();
    expect(neko?.romaji).toBe('neko');

    const fallback = getVocabEntry('palabra_imposible_12345');
    expect(fallback).toBeDefined();
    expect(fallback.jp).toBe('palabra_imposible_12345');
    expect(fallback.type).toBe('vocab');
  });
});

describe('AUDITORÍA PROFUNDA DE MOTOR: Generación exhaustiva de ejercicios', () => {
  it('Ejecuta genExercises en TODAS las 69 lecciones a través de 20 semillas distintas sin errores', () => {
    let exercisesGenerated = 0;

    for (const mod of MODULES) {
      const allC = mod.lessons.flatMap((l) => l.chars || []);
      const allR = mod.lessons.flatMap((l) => l.reads || []);

      for (const l of mod.lessons) {
        for (const seed of SEEDS_AUDIT) {
          const exs = genExercises(l.chars || [], l.reads || [], seed, allC, allR, l.id, l.vocab || []);
          expect(exs.length).toBeGreaterThanOrEqual(3);
          exercisesGenerated += exs.length;

          for (const ex of exs) {
            expect(ex.type, `Tipo no definido en lección ${l.id}`).toBeTruthy();
            expect(ex.q, `Pregunta vacía en lección ${l.id}`).toBeTruthy();

            if (ex.type === 'kana_hero') {
              expect(ex.opts).toBeDefined();
              expect(ex.opts?.length).toBe(4);
              expect(typeof ex.ans).toBe('number');
              expect(ex.ans).toBeGreaterThanOrEqual(0);
              expect(ex.ans).toBeLessThan(4);
              const uniqueOpts = new Set(ex.opts);
              expect(uniqueOpts.size).toBe(4);
            }

            if (ex.type === 'pick_kana') {
              expect(ex.opts).toBeDefined();
              expect(ex.opts?.length).toBe(4);
              expect(typeof ex.ans).toBe('number');
              expect(ex.ans).toBeGreaterThanOrEqual(0);
              expect(ex.ans).toBeLessThan(4);
              const uniqueOpts = new Set(ex.opts);
              expect(uniqueOpts.size).toBe(4);
            }

            if (ex.type === 'pair_match') {
              expect(ex.pairs).toBeDefined();
              expect(ex.pairs?.length).toBeGreaterThanOrEqual(3);
              expect(ex.pairs?.length).toBeLessThanOrEqual(4);
              const lefts = (ex.pairs || []).map((p) => p.left);
              const rights = (ex.pairs || []).map((p) => p.right);
              expect(new Set(lefts).size).toBe(ex.pairs?.length);
              expect(new Set(rights).size).toBe(ex.pairs?.length);
            }

            if (ex.type === 'build_sentence') {
              const ansTokens = ex.ans as string[];
              expect(Array.isArray(ansTokens)).toBe(true);
              expect(ansTokens.length).toBeGreaterThan(0);
              const items = ex.items || [];
              expect(items.length).toBeGreaterThanOrEqual(ansTokens.length);
              for (const token of ansTokens) {
                expect(items).toContain(token);
              }
            }

            if (ex.type === 'true_false') {
              expect(ex.kana).toBeTruthy();
              expect(ex.claim).toBeTruthy();
              expect(typeof ex.ans).toBe('boolean');
            }

            if (ex.type === 'digit_to_kana' || ex.type === 'kana_to_digit') {
              expect(ex.opts).toBeDefined();
              expect(ex.opts?.length).toBe(4);
              expect(typeof ex.ans).toBe('number');
              expect(ex.ans).toBeGreaterThanOrEqual(0);
              expect(ex.ans).toBeLessThan(4);
            }
          }
        }
      }
    }

    expect(exercisesGenerated).toBeGreaterThanOrEqual(5000);
  });
});

describe('AUDITORÍA PROFUNDA DE SRS & PROGRESIÓN', () => {
  it('Verifica flujo completo del sistema Leitner', () => {
    let card = newCard();
    expect(card.box).toBe(0);
    expect(isDue(card)).toBe(true);

    card = reviewCard(card, true);
    expect(card.box).toBe(1);
    expect(isDue(card)).toBe(false);

    card = reviewCard(card, true);
    expect(card.box).toBe(2);

    card = reviewCard(card, false);
    expect(card.box).toBe(0);
    expect(isDue(card)).toBe(true);
  });

  it('Verifica que dueChars filtra y ordena tarjetas más vencidas primero', () => {
    const mockMastery: Record<string, any> = {
      'a': { box: 0, nextReview: Date.now() - 1000 },
      'i': { box: 1, nextReview: Date.now() + 100000 },
      'u': { box: 0, nextReview: Date.now() - 5000 },
    };
    const due = dueChars(mockMastery);
    expect(due).toEqual(['u', 'a']);
  });

  it('Verifica progresión de rangos ninja sin huecos de XP', () => {
    for (let i = 0; i < RANKS.length; i++) {
      const r = RANKS[i];
      const res = getRank(r.min);
      expect(res.l).toBe(r.l);
    }
    expect(getRank(250).l).toBe('Shiro-obi');
    expect(getRank(99999).l).toBe('Godan');
  });
});
