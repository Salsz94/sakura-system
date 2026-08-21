import { MN } from '../content';
import { VOCAB_DICTIONARY } from '../content/vocabDictionary';
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
  'm4l1', 'm4l7',
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

// Mapeo completo de números japoneses (0 a 10.000) a dígitos occidentales para la Calculadora Cyberpunk.
export const JAPANESE_NUMBERS_MAP: Record<string, { digit: string; es: string }> = {
  // Unidades (1 - 10)
  'いち': { digit: '1', es: 'Uno (1)' },
  'に': { digit: '2', es: 'Dos (2)' },
  'さん': { digit: '3', es: 'Tres (3)' },
  'よん': { digit: '4', es: 'Cuatro (4)' },
  'ご': { digit: '5', es: 'Cinco (5)' },
  'ろく': { digit: '6', es: 'Seis (6)' },
  'なな': { digit: '7', es: 'Siete (7)' },
  'はち': { digit: '8', es: 'Ocho (8)' },
  'きゅう': { digit: '9', es: 'Nueve (9)' },
  'じゅう': { digit: '10', es: 'Diez (10)' },
  // Decenas y Compuestos (11 - 99)
  'じゅういち': { digit: '11', es: 'Once (11)' },
  'じゅうご': { digit: '15', es: 'Quince (15)' },
  'にじゅう': { digit: '20', es: 'Veinte (20)' },
  'にじゅうご': { digit: '25', es: 'Veinticinco (25)' },
  'さんじゅう': { digit: '30', es: 'Treinta (30)' },
  'さんじゅうはち': { digit: '38', es: 'Treinta y ocho (38)' },
  'よんじゅう': { digit: '40', es: 'Cuarenta (40)' },
  'ごじゅう': { digit: '50', es: 'Cincuenta (50)' },
  'ごじゅうろく': { digit: '56', es: 'Cincuenta y seis (56)' },
  'ろくじゅう': { digit: '60', es: 'Sesenta (60)' },
  'ななじゅう': { digit: '70', es: 'Setenta (70)' },
  'はちじゅう': { digit: '80', es: 'Ochenta (80)' },
  'きゅうじゅう': { digit: '90', es: 'Noventa (90)' },
  'きゅうじゅうきゅう': { digit: '99', es: 'Noventa y nueve (99)' },
  // Centenas e Irregulares (100 - 900)
  'ひゃく': { digit: '100', es: 'Cien (100)' },
  'ひゃくごじゅう': { digit: '150', es: 'Ciento cincuenta (150)' },
  'にひゃく': { digit: '200', es: 'Doscientos (200)' },
  'さんびゃく': { digit: '300', es: 'Trescientos (300 - Irregular)' },
  'よんひゃく': { digit: '400', es: 'Cuatrocientos (400)' },
  'ごひゃく': { digit: '500', es: 'Quinientos (500)' },
  'ろっぴゃく': { digit: '600', es: 'Seiscientos (600 - Irregular)' },
  'ななひゃく': { digit: '700', es: 'Setecientos (700)' },
  'はっぴゃく': { digit: '800', es: 'Ochocientos (800 - Irregular)' },
  'きゅうひゃく': { digit: '900', es: 'Novecientos (900)' },
  // Miles e Irregulares (1.000 - 9.900)
  'せん': { digit: '1000', es: 'Mil (1.000)' },
  'にせん': { digit: '2000', es: 'Dos mil (2.000)' },
  'さんぜん': { digit: '3000', es: 'Tres mil (3.000 - Irregular)' },
  'よんせん': { digit: '4000', es: 'Cuatro mil (4.000)' },
  'ごせん': { digit: '5000', es: 'Cinco mil (5.000)' },
  'ろくせん': { digit: '6000', es: 'Seis mil (6.000)' },
  'ななせん': { digit: '7000', es: 'Siete mil (7.000)' },
  'はっせん': { digit: '8000', es: 'Ocho mil (8.000 - Irregular)' },
  'きゅうせん': { digit: '9000', es: 'Nueve mil (9.000)' },
  'きゅうせんきゅうひゃく': { digit: '9900', es: 'Nueve mil novecientos (9.900)' },
  // Diez mil (10.000 - Unidad Man)
  'いちまん': { digit: '10000', es: 'Diez mil (10.000 - 1 Man)' },
};

export function genExercises(
  chars: string[],
  reads: string[],
  seed?: number,
  poolChars: string[] = [],
  poolReads: string[] = [],
  lessonId: string = '',
  vocab: VocabItem[] = []
): Exercise[] {
  const s = seed !== undefined ? seed : Date.now() % 999999;
  const r = rng(s);
  const sh = <T>(arr: T[]) => shuffle(arr, r);

  const local = chars.map((ch, i) => ({ ch, rd: reads[i] }));
  const pool = poolChars.length
    ? poolChars.map((ch, i) => ({ ch, rd: poolReads[i] }))
    : local;
  const shLocal = sh([...local]);

  const exs: Exercise[] = [];
  const targets = shLocal.slice(0, Math.min(MAX_EXERCISES, chars.length));

  // Detectar si la lección es de números (solo M4 contiene lecciones numéricas).
  // FIX: 'に' como partícula (M3) no debe disparar ejercicios de número.
  const isNumberLesson = lessonId.startsWith('m4');
  // Detectar si la lección es post-kana (M3+): los ejercicios deben
  // evaluar SIGNIFICADO, no reconocimiento de kana.
  const isVocabLesson = !lessonId.startsWith('m1') && !lessonId.startsWith('m2') && lessonId !== '';

  targets.forEach((item, i) => {
    const isNum = isNumberLesson && !!JAPANESE_NUMBERS_MAP[item.ch];
    const vocabEntry = isVocabLesson ? VOCAB_DICTIONARY[item.ch] : null;
    const hasVocabMeaning = !!(vocabEntry && vocabEntry.es && vocabEntry.type === 'vocab');
    const typeRoll = r();
    let type: string;

    if (isNum && typeRoll < 0.6) {
      if (typeRoll < 0.2) type = 'digit_to_kana';
      else if (typeRoll < 0.4) type = 'kana_to_digit';
      else type = 'type_digit';
    } else if (isVocabLesson) {
      // En módulos M3+ el estudiante ya domina el alfabeto fonético:
      // NO se genera 'type_romaji' fonético; se prioriza significado y gramática.
      if (typeRoll < 0.35) type = 'kana_hero';
      else if (typeRoll < 0.65) type = 'pick_kana';
      else if (typeRoll < 0.85) type = 'true_false';
      else type = 'order';
    } else if (typeRoll < 0.28) type = 'kana_hero';
    else if (typeRoll < 0.5) type = 'type_romaji';
    else if (typeRoll < 0.66) type = 'pick_kana';
    else if (typeRoll < 0.78) type = 'listen';
    else if (typeRoll < 0.88) type = 'true_false';
    else type = 'order';

    // 'listen' solo tiene sentido para kana suelto en M1/M2
    if (type === 'listen' && item.ch.length !== 1) type = 'pick_kana';

    // Forzar variedad mínima en M1/M2 (fonética)
    if (
      !isVocabLesson &&
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
    const canOrder = ORDER_SAFE_LESSONS.includes(lessonId);
    if (
      i === targets.length - 1 &&
      !exs.find((e) => e.type === 'order' || e.type === 'pair_match') &&
      chars.length >= 3
    ) {
      type = canOrder ? 'order' : 'pair_match';
    }
    if (type === 'order' && !canOrder) type = 'pair_match';

    const isParticle = ['は', 'も', 'の', 'か', 'に', 'で', 'へ', 'を', 'が', 'と', 'から', 'まで'].includes(item.ch);
    const isKanji = vocabEntry?.type === 'kanji';

    if (type === 'kana_hero') {
      if (hasVocabMeaning || isVocabLesson) {
        const meaningText = vocabEntry?.es || item.rd;
        // SIGNIFICADO: muestra palabra/partícula japonesa, pide significado/función en español
        const wrongMeanings = sh(
          pool
            .filter((p) => p.ch !== item.ch && VOCAB_DICTIONARY[p.ch]?.es)
            .map((p) => VOCAB_DICTIONARY[p.ch]!.es)
            .filter((es, idx, arr) => arr.indexOf(es) === idx && es !== meaningText)
        ).slice(0, 3);
        const opts = sh([meaningText, ...wrongMeanings]).slice(0, 4);
        
        let qTitle = '¿Qué significa?';
        if (isParticle) qTitle = '¿Qué función cumple la partícula?';
        else if (isKanji) qTitle = '¿Qué significa este Kanji?';

        exs.push({
          id: i + 1,
          type: 'kana_hero',
          q: qTitle,
          kana: item.ch,
          opts,
          ans: opts.indexOf(meaningText),
          hint: `${item.ch} = ${meaningText}`,
          char: item.ch,
        });
      } else {
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
          hint: MN[item.ch] || 'Asocia la forma del carácter con su sonido puro.',
          char: item.ch,
        });
      }
    } else if (type === 'type_romaji') {
      exs.push({
        id: i + 1,
        type: 'type_romaji',
        q: 'Escribe la lectura en romaji:',
        kana: item.ch,
        ans: item.rd,
        hint: MN[item.ch] || 'Escribe la pronunciación exacta usando letras en romaji.',
        char: item.ch,
      });
    } else if (type === 'pick_kana') {
      if (hasVocabMeaning || isVocabLesson) {
        const meaningText = vocabEntry?.es || item.rd;
        // SIGNIFICADO INVERSO: muestra significado en español, pide la palabra japonesa
        const wrong = sh(
          pool
            .filter((p) => p.ch !== item.ch && (VOCAB_DICTIONARY[p.ch]?.es || p.rd))
            .map((p) => p.ch)
            .filter((ch, idx, arr) => arr.indexOf(ch) === idx)
        ).slice(0, 3);
        const opts = sh([item.ch, ...wrong]).slice(0, 4);

        let qTitle = '¿Cuál es la palabra correcta?';
        if (isParticle) qTitle = '¿Cuál es la partícula correspondiente?';
        else if (isKanji) qTitle = '¿Cuál es el Kanji correcto?';

        exs.push({
          id: i + 1,
          type: 'pick_kana',
          q: qTitle,
          romaji: meaningText,
          opts,
          ans: opts.indexOf(item.ch),
          hint: `${meaningText} = ${item.ch}`,
          char: item.ch,
        });
      } else {
        // Romaji arriba, elige el kana correcto abajo.
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
          hint: MN[item.ch] || 'Identifica la silueta del carácter que corresponde al sonido.',
          char: item.ch,
        });
      }
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
        hint: MN[item.ch] || 'Escucha el tono e identifica la consonante inicial.',
        char: item.ch,
      });
    } else if (type === 'true_false') {
      const isTrue = r() > 0.5;
      if (hasVocabMeaning || isVocabLesson) {
        const meaningText = vocabEntry?.es || item.rd;
        // SIGNIFICADO: ¿X significa Y?
        const fakeMeaning = sh(
          pool
            .filter((p) => p.ch !== item.ch && VOCAB_DICTIONARY[p.ch]?.es)
            .map((p) => VOCAB_DICTIONARY[p.ch]!.es)
            .filter((es) => es !== meaningText)
        )[0] || 'otra función distinta';
        const displayMeaning = isTrue ? meaningText : fakeMeaning;
        exs.push({
          id: i + 1,
          type: 'true_false',
          q: '¿Es correcto?',
          kana: item.ch,
          claim: displayMeaning,
          ans: isTrue,
          hint: `${item.ch} = ${meaningText}`,
          char: item.ch,
        });
      } else {
        const fakeRead = sh(pool.filter((p) => p.rd !== item.rd))[0]?.rd || 'x';
        const displayRead = isTrue ? item.rd : fakeRead;
        exs.push({
          id: i + 1,
          type: 'true_false',
          q: '¿Es correcto?',
          kana: item.ch,
          claim: displayRead,
          ans: isTrue,
          hint: MN[item.ch] || 'Verifica si la lectura corresponde exactamente al carácter.',
          char: item.ch,
        });
      }
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
        hint: 'Ordena la secuencia según el orden del alfabeto fonético.',
      });
    } else if (type === 'digit_to_kana') {
      const numInfo = JAPANESE_NUMBERS_MAP[item.ch] || { digit: '1', es: item.ch };
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
        type: 'digit_to_kana',
        q: '¿Cómo se escribe este número en hiragana?',
        digit: numInfo.digit,
        kana: item.ch,
        romaji: item.rd,
        opts,
        ans: opts.indexOf(item.ch),
        hint: `Identifica el hiragana para el número ${numInfo.digit}`,
        char: item.ch,
      });
    } else if (type === 'type_digit') {
      const numInfo = JAPANESE_NUMBERS_MAP[item.ch] || { digit: '1', es: item.ch };
      exs.push({
        id: i + 1,
        type: 'type_digit',
        q: 'Escribe este número en dígitos occidentales:',
        kana: item.ch,
        romaji: item.rd,
        digit: numInfo.digit,
        ans: numInfo.digit,
        hint: `Escribe el dígito (1, 2, 3...) que corresponde a ${item.ch} (${numInfo.es})`,
        char: item.ch,
      });
    } else if (type === 'kana_to_digit') {
      const numInfo = JAPANESE_NUMBERS_MAP[item.ch] || { digit: '1', es: item.ch };
      const allDigits = Object.values(JAPANESE_NUMBERS_MAP).map((n) => n.digit);
      const wrongDigits = sh(allDigits.filter((d) => d !== numInfo.digit)).slice(0, 3);
      const opts = sh([numInfo.digit, ...wrongDigits]).slice(0, 4);
      exs.push({
        id: i + 1,
        type: 'kana_to_digit',
        q: '¿Qué número en dígitos representa este hiragana?',
        digit: numInfo.digit,
        kana: item.ch,
        romaji: item.rd,
        opts,
        ans: opts.indexOf(numInfo.digit),
        hint: `Selecciona el número en dígitos que corresponde a ${item.ch} (${numInfo.es})`,
        char: item.ch,
      });
    } else if (type === 'pair_match') {
      // Encuentra la pareja: izquierda ↔ kana derecha.
      // Dedupe por AMBOS lados para evitar duplicados visuales.
      const uniqueLocal = uniqueBy(uniqueBy([...local], (p) => p.ch), (p) => p.rd);
      const picked = sh(uniqueLocal).slice(0, Math.min(4, uniqueLocal.length));
      if (isVocabLesson) {
        // SIGNIFICADO: español ↔ japonés
        const pairsWithMeaning = picked.map((p) => {
          const entry = VOCAB_DICTIONARY[p.ch];
          const leftLabel = entry?.es || p.rd;
          return { left: leftLabel, right: p.ch };
        });
        // Dedupe por significado (left) para evitar pares con mismo texto
        const dedupedPairs = uniqueBy(pairsWithMeaning, (p) => p.left);
        exs.push({
          id: i + 1,
          type: 'pair_match',
          q: 'Encuentra la pareja correcta:',
          pairs: dedupedPairs.slice(0, 4),
          hint: 'Conecta cada significado en español con su palabra japonesa.',
        });
      } else {
        const pairs = picked.map((p) => ({ left: p.rd, right: p.ch }));
        exs.push({
          id: i + 1,
          type: 'pair_match',
          q: 'Encuentra la pareja correcta:',
          pairs,
          hint: 'Conecta cada lectura con su kana correspondiente.',
        });
      }
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
        hint: 'Construye la oración ordenando los bloques en japonés.',
      });
    });
  }

  // Mezclar el orden final para que las oraciones no queden todas al
  // final ni siempre en la misma posición.
  return sh(exs);
}
