import { MN } from '../content';
import type { Exercise, VocabItem } from '../types';

// ── EXERCISE GENERATOR ───────────────────────────────────────────
/** Generador pseudoaleatorio determinista por semilla (Park-Miller). */
export function rng(seed: number): () => number {
  let s = seed + 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
/** Baraja una copia de `arr` usando el RNG `r`. */
export function shuffle<T>(arr: T[], r: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Lista de PERMISO (no de exclusión): el ejercicio "ordenar" solo tiene
// sentido pedagógico cuando los caracteres de la lección forman una
// secuencia natural real y única (fila fonética a-i-u-e-o, números en
// orden, días de la semana en orden calendario). En cualquier otra
// lección — gramática, vocabulario, kanji sueltos, combinaciones de
// varias filas, o el Repaso diario (SRS, que mezcla caracteres de
// distintas lecciones) — "ordenar" no tiene una respuesta lógica y
// confunde al usuario; ahí se usa pair_match en su lugar.
// Por defecto (lección no listada aquí) NO se genera 'order'.
export const ORDER_SAFE_LESSONS = [
  // Hiragana — filas gojuon puras (m1l11 en adelante combinan varias filas o
  // no tienen secuencia, se excluyen a propósito).
  'm1l1', 'm1l2', 'm1l3', 'm1l4', 'm1l5',
  'm1l6', 'm1l7', 'm1l8', 'm1l9', 'm1l10',
  // Katakana — mismas filas puras.
  'm2l1', 'm2l2', 'm2l3', 'm2l4', 'm2l5',
  'm2l6', 'm2l7', 'm2l8', 'm2l9', 'm2l10',
  // Números 1–10 y días de la semana: secuencia natural real.
  'm4l1', 'm4l3',
];

// Grupos de kana visualmente confusos — usados para sesgar los
// distractores hacia opciones genuinamente tentadoras en vez de
// puramente aleatorias (integridad de dificultad real, no al azar).
const CONFUSABLE_GROUPS: string[][] = [
  ['ぬ', 'め', 'わ', 'ね'],
  ['る', 'ろ'],
  ['は', 'ほ'],
  ['き', 'さ'],
  ['し', 'つ', 'ひ'],
  ['く', 'へ'],
  ['ま', 'も'],
  ['シ', 'ツ'],
  ['ソ', 'ン'],
  ['ク', 'ワ'],
  ['チ', 'テ'],
  ['ウ', 'ラ'],
  ['ノ', 'メ'],
];

function confusablesFor(ch: string): Set<string> {
  const group = CONFUSABLE_GROUPS.find((g) => g.includes(ch));
  return new Set(group ? group.filter((c) => c !== ch) : []);
}

/** Elige `count` distractores priorizando los "confusos" antes que el resto. */
function pickDistractors<T>(
  candidates: T[],
  keyFn: (x: T) => string,
  preferred: Set<string>,
  count: number,
  r: () => number
): T[] {
  const inGroup = shuffle(candidates.filter((c) => preferred.has(keyFn(c))), r);
  const rest = shuffle(candidates.filter((c) => !preferred.has(keyFn(c))), r);
  return [...inGroup, ...rest].slice(0, count);
}

/** Primera aparición por clave — los pools de módulo repiten caracteres
 * entre lecciones (は en m3l1 y m3l2), lo que generaba OPCIONES
 * DUPLICADAS idénticas donde tocar "la copia equivocada" contaba error. */
export function uniqueBy<T>(arr: T[], keyFn: (x: T) => string): T[] {
  const seen = new Set<string>();
  return arr.filter((x) => {
    const k = keyFn(x);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// Antes había un tope fijo de 6 ejercicios por lección sin importar
// cuántos caracteres tuviera — lecciones de gramática/kanji con 8-10
// ítems dejaban 2-4 sin practicar en la primera pasada. Ahora escala
// con el tamaño real de la lección, con un techo razonable de sesión.
const MAX_EXERCISES = 10;

export function genExercises(
  chars: string[],
  reads: string[],
  seed?: number,
  poolChars: string[] = [],
  poolReads: string[] = [],
  lessonId: string = '',
  vocab: VocabItem[] = []
): Exercise[] {
  // Seed SIEMPRE aleatorio — nunca memorizable
  const s = seed !== undefined ? seed : Date.now() % 999999;
  const r = rng(s);
  const sh = <T,>(a: T[]): T[] => shuffle(a, r);
  const local = chars.map((c, i) => ({ ch: c, rd: reads[i] }));
  const pool = poolChars.length
    ? poolChars.map((c, i) => ({ ch: c, rd: poolReads[i] }))
    : local;
  const shLocal = sh([...local]); // siempre shuffleado
  const exs = [];

  // Construir pool de ejercicios posibles y mezclar tipos
  const targets = shLocal.slice(0, Math.min(MAX_EXERCISES, chars.length));

  targets.forEach((item, i) => {
    // RNG decide el tipo de ejercicio para cada ítem
    const typeRoll = r();
    let type;
    if (typeRoll < 0.28) type = 'kana_hero';
    else if (typeRoll < 0.5) type = 'type_romaji';
    else if (typeRoll < 0.66) type = 'pick_kana';
    else if (typeRoll < 0.78) type = 'listen';
    else if (typeRoll < 0.88) type = 'true_false';
    else type = 'order';

    // 'listen' (escucha la pronunciación, elige el kana) solo tiene
    // sentido para kana suelto — palabras largas o gramática usan los
    // otros formatos. Fallback: pick_kana (mismo esquema de opciones).
    if (type === 'listen' && item.ch.length !== 1) type = 'pick_kana';

    // Forzar variedad mínima
    if (
      i === 1 &&
      !exs.find((e) => e.type === 'type_romaji') &&
      local.length >= 2
    ) {
      type = 'type_romaji';
    }
    if (
      i === 2 &&
      !exs.find((e) => e.type === 'pick_kana') &&
      local.length >= 3
    ) {
      type = 'pick_kana';
    }
    // 'order' solo si la lección tiene una secuencia natural real
    // (ver ORDER_SAFE_LESSONS). Cualquier otro caso usa pair_match.
    const canOrder = ORDER_SAFE_LESSONS.includes(lessonId);
    if (
      i === targets.length - 1 &&
      !exs.find((e) => e.type === 'order' || e.type === 'pair_match') &&
      chars.length >= 3
    ) {
      type = canOrder ? 'order' : 'pair_match';
    }
    // Fuera de la lista de permiso, convertir cualquier 'order' a pair_match.
    if (type === 'order' && !canOrder) type = 'pair_match';

    if (type === 'kana_hero') {
      // Opciones = LECTURAS: dedupe por lectura (dos kana distintos
      // pueden compartir lectura y generarían botones idénticos).
      const wrong = pickDistractors(
        uniqueBy(pool.filter((p) => p.rd !== item.rd), (p) => p.rd),
        (p) => p.ch,
        confusablesFor(item.ch),
        3,
        r
      ).map((p) => p.rd);
      const opts = sh([item.rd, ...wrong]).slice(0, 4);
      exs.push({
        id: i + 1,
        type: 'kana_hero',
        q: '¿Cómo se lee?',
        kana: item.ch,
        opts,
        ans: opts.indexOf(item.rd),
        hint: MN[item.ch] || `${item.ch} = "${item.rd}"`,
        char: item.ch,
      });
    } else if (type === 'type_romaji') {
      exs.push({
        id: i + 1,
        type: 'type_romaji',
        q: 'Escribe la lectura en romaji:',
        kana: item.ch,
        ans: item.rd,
        hint: MN[item.ch] || `${item.ch} = "${item.rd}"`,
        char: item.ch,
      });
    } else if (type === 'pick_kana') {
      // Romaji arriba, elige el kana correcto abajo.
      // Filtro por LECTURA además de por carácter: "ka" tiene varios
      // kana/kanji válidos (か/カ/火) — sin esto, dos opciones eran
      // objetivamente correctas pero solo una puntuaba.
      const wrong = pickDistractors(
        uniqueBy(
          pool.filter((p) => p.ch !== item.ch && p.rd !== item.rd),
          (p) => p.ch
        ),
        (p) => p.ch,
        confusablesFor(item.ch),
        3,
        r
      ).map((p) => p.ch);
      const opts = sh([item.ch, ...wrong]).slice(0, 4);
      exs.push({
        id: i + 1,
        type: 'pick_kana',
        q: '¿Cuál es el kana correcto?',
        romaji: item.rd,
        opts,
        ans: opts.indexOf(item.ch),
        hint: MN[item.ch] || `"${item.rd}" se escribe ${item.ch}`,
        char: item.ch,
      });
    } else if (type === 'listen') {
      // Escucha la pronunciación (TTS ja del navegador), elige el kana.
      // Mismo esquema anti-ambigüedad que pick_kana: opciones únicas y
      // sin otra opción que comparta la lectura pedida.
      const wrong = pickDistractors(
        uniqueBy(
          pool.filter((p) => p.ch !== item.ch && p.rd !== item.rd),
          (p) => p.ch
        ),
        (p) => p.ch,
        confusablesFor(item.ch),
        3,
        r
      ).map((p) => p.ch);
      const opts = sh([item.ch, ...wrong]).slice(0, 4);
      exs.push({
        id: i + 1,
        type: 'listen',
        q: 'Escucha y elige el kana',
        kana: item.ch,
        romaji: item.rd,
        opts,
        ans: opts.indexOf(item.ch),
        hint: MN[item.ch] || `"${item.rd}" se escribe ${item.ch}`,
        char: item.ch,
      });
    } else if (type === 'true_false') {
      const isTrue = r() > 0.5;
      const fakeRead = sh(pool.filter((p) => p.rd !== item.rd))[0]?.rd || 'x';
      const displayRead = isTrue ? item.rd : fakeRead;
      exs.push({
        id: i + 1,
        type: 'true_false',
        q: '¿Es correcto?',
        kana: item.ch,
        claim: displayRead,
        ans: isTrue,
        hint: MN[item.ch] || `${item.ch} = "${item.rd}"`,
        char: item.ch,
      });
    } else if (type === 'order') {
      const toOrder = sh([...local]).slice(0, Math.min(5, chars.length));
      const correctOrder = chars
        .filter((c) => toOrder.find((t) => t.ch === c))
        .map((c) => c);
      exs.push({
        id: i + 1,
        type: 'order',
        q: 'Ordena en secuencia correcta:',
        items: sh([...correctOrder]),
        ans: correctOrder,
        hint: `Orden: ${correctOrder.join(' · ')}  (${correctOrder
          .map((c) => reads[chars.indexOf(c)])
          .join(' · ')})`,
      });
    } else if (type === 'pair_match') {
      // Encuentra la pareja: romaji izquierda, kana derecha.
      // Dedupe por AMBOS lados: dos tarjetas con la misma lectura o el
      // mismo kana hacen que la corrección posicional marque error a
      // un emparejado visualmente correcto.
      const uniqueLocal = uniqueBy(uniqueBy([...local], (p) => p.ch), (p) => p.rd);
      const picked = sh(uniqueLocal).slice(0, Math.min(4, uniqueLocal.length));
      const pairs = picked.map((p) => ({ left: p.rd, right: p.ch }));
      exs.push({
        id: i + 1,
        type: 'pair_match',
        q: 'Encuentra la pareja correcta:',
        pairs,
        hint: `Conecta cada lectura con su kana correspondiente.`,
      });
    }
  });

  // Construir oración (estilo Duolingo) — solo si la lección trae
  // vocabulario contextual (gramática/oraciones). Las lecciones de kana
  // puro no tienen `vocab`, así que no se ven afectadas: sin esto, una
  // lección de gramática usaba el MISMO tratamiento de memorización de
  // kana suelto que una lección de alfabeto, y se sentía repetitiva.
  const sentenceCount = Math.min(vocab.length, 3);
  if (sentenceCount > 0) {
    const chosenVocab = sh([...vocab]).slice(0, sentenceCount);
    chosenVocab.forEach((v, vi) => {
      const tokens = v.jp.split(/\s+/).filter(Boolean);
      // Set: una misma palabra (ej. "です") puede repetirse en varias
      // oraciones del banco — sin dedupe, el mismo distractor podía
      // elegirse dos veces y generar un tile duplicado.
      const otherTokens = [
        ...new Set(
          chosenVocab
            .filter((_, oi) => oi !== vi)
            .flatMap((o) => o.jp.split(/\s+/).filter(Boolean))
            .filter((t) => !tokens.includes(t))
        ),
      ];
      const distractors = sh(otherTokens).slice(0, Math.min(2, otherTokens.length));
      exs.push({
        id: exs.length + vi + 1,
        type: 'build_sentence',
        q: v.es,
        items: sh([...tokens, ...distractors]),
        ans: tokens,
        hint: `"${v.jp}" = "${v.es}"`,
      });
    });
  }

  // Mezclar el orden final para que las oraciones no queden todas al
  // final ni siempre en la misma posición.
  return sh(exs);
}
