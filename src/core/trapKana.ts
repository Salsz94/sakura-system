// ════════════════════════════════════════════════════════════════
// TRAP KANA MATRIX — Sakura System
// Matriz de trampas pedagógicas: agrupa caracteres y lecturas
// que los estudiantes confunden frecuentemente (diacríticos, trazos
// similares, dakuten/handakuten y lecturas ambiguas).
// ════════════════════════════════════════════════════════════════

/**
 * Pares y grupos de confusión visual y fonética en Hiragana.
 * Especial énfasis en Dakuten (し vs じ) solicitado por el usuario.
 */
export const HIRAGANA_TRAPS: Record<string, string[]> = {
  // ── Dakuten / Handakuten y fonemas cercanos ──
  'し': ['じ', 'ち', 'ぢ', 'い', 'つ'],
  'じ': ['し', 'ぢ', 'ず', 'ち', 'ざ'],
  'ち': ['し', 'ぢ', 'さ', 'じ'],
  'ぢ': ['じ', 'ち', 'ず', 'づ'],
  'つ': ['づ', 'す', 'ず', 'っ'],
  'づ': ['つ', 'ず', 'ぢ', 'じ'],
  'す': ['ず', 'つ', 'む'],
  'ず': ['す', 'づ', 'じ', 'ぜ'],
  'は': ['ば', 'ぱ', 'ほ', 'け', 'わ'],
  'ば': ['は', 'ぱ', 'だ', 'ぼ'],
  'ぱ': ['は', 'ば', 'ぽ', 'た'],
  'ほ': ['は', 'ぼ', 'ぽ', 'ま'],
  'ぼ': ['ほ', 'ぽ', 'ば', 'ご'],
  'ぽ': ['ほ', 'ぼ', 'ぱ'],
  'か': ['が', 'き', '力'],
  'が': ['か', 'ぎ', 'だ'],
  'き': ['ぎ', 'さ', 'ち'],
  'ぎ': ['き', 'げ', 'ざ'],
  'た': ['だ', 'な', 'か', 'に'],
  'だ': ['た', 'ば', 'ざ'],
  'さ': ['ざ', 'ち', 'き'],
  'ざ': ['さ', 'だ', 'じ'],
  'て': ['で', 'と', 'そ'],
  'で': ['て', 'ど', 'ぜ'],
  'と': ['ど', 'て', 'ろ'],
  'ど': ['と', 'で', 'ご'],

  // ── Trazos y formas similares (Hiragana) ──
  'れ': ['わ', 'ね', 'る'],
  'わ': ['れ', 'ね', 'は', 'ろ'],
  'ね': ['れ', 'わ', 'ぬ'],
  'ぬ': ['め', 'ね', 'あ'],
  'め': ['ぬ', 'あ', 'ゆ'],
  'あ': ['お', 'め', 'ぬ'],
  'お': ['あ', 'む', 'す'],
  'ろ': ['る', 'ろ', 'う'],
  'る': ['ろ', 'う', 'そ'],
  'い': ['り', 'こ'],
  'り': ['い', 'け'],
  'ま': ['ほ', 'も', 'よ'],
  'も': ['ま', 'し', 'む'],
  'ゆ': ['よ', 'め', 'み'],
  'よ': ['ゆ', 'ま', 'は'],
  'そ': ['て', 'ろ', 'る'],
  'こ': ['い', 'に', 'ご'],
  'に': ['こ', 'た', 'り'],
};

/**
 * Pares y grupos de confusión visual clásica en Katakana.
 * Los clásicos de anime/manga: シ (shi) vs ツ (tsu), ソ (so) vs ン (n), etc.
 */
export const KATAKANA_TRAPS: Record<string, string[]> = {
  'シ': ['ツ', 'ソ', 'ン', 'ジ'],
  'ジ': ['シ', 'ヂ', 'ズ', 'ヅ'],
  'ツ': ['シ', 'ソ', 'ン', 'ヅ'],
  'ヅ': ['ツ', 'ズ', 'ジ'],
  'ソ': ['ン', 'シ', 'ツ', 'リ'],
  'ゾ': ['ソ', 'ン', 'ヅ'],
  'ン': ['ソ', 'シ', 'ツ', 'ワ'],
  'ク': ['ワ', 'タ', 'ケ', 'フ'],
  'ワ': ['ク', 'ウ', 'フ', 'ン'],
  'ウ': ['ワ', 'フ', 'ラ'],
  'フ': ['ワ', 'ク', 'ラ', 'ブ'],
  'コ': ['ユ', 'ゴ', 'ヨ', 'ロ'],
  'ゴ': ['コ', 'ユ', 'ヨ'],
  'ユ': ['コ', 'エ', 'ヨ'],
  'ヨ': ['ユ', 'コ', 'ロ'],
  'チ': ['テ', '千', 'ヂ'],
  'テ': ['チ', 'デ', 'ラ'],
  'ス': ['ヌ', 'ズ', 'マ'],
  'ヌ': ['ス', '又', 'ネ'],
  'カ': ['ガ', '力', 'ケ'],
  'ガ': ['カ', 'ゲ'],
  'ロ': ['口', 'コ', '日'],
  'ハ': ['バ', 'パ', '八'],
  'バ': ['ハ', 'パ'],
  'パ': ['ハ', 'バ'],
  'ラ': ['フ', 'テ', 'う'],
  'リ': ['ソ', 'い', 'ル'],
  'ル': ['レ', 'リ'],
  'レ': ['ル', 'フ'],
  'タ': ['ク', 'ダ', 'ケ'],
  'ト': ['ド', 'イ'],
  'ナ': ['メ', 'サ', '十'],
  'メ': ['ナ', 'ヌ', 'ン'],
  'マ': ['ス', 'ム', 'ア'],
  'ア': ['マ', 'ヤ', 'イ'],
};

/**
 * Confusiones frecuentes en transcripción Romaji.
 * Se usan para opciones en preguntas de lectura (quiz / rapid).
 */
export const ROMAJI_TRAPS: Record<string, string[]> = {
  'shi': ['ji', 'chi', 'tsu', 'si'],
  'ji': ['shi', 'chi', 'dji', 'zu', 'zi'],
  'chi': ['shi', 'ti', 'tsu', 'ji'],
  'tsu': ['su', 'zu', 'chu', 'tu'],
  'su': ['zu', 'tsu', 'shu'],
  'zu': ['tsu', 'su', 'dzu', 'ji'],
  'dzu': ['zu', 'tsu', 'ji'],
  'dji': ['ji', 'chi', 'dzu'],
  'ha': ['ba', 'pa', 'wa'],
  'ba': ['ha', 'pa', 'da'],
  'pa': ['ha', 'ba', 'ta'],
  'wa': ['re', 'ne', 'ha', 'ra'],
  're': ['wa', 'ne', 'ru'],
  'ne': ['re', 'wa', 'nu'],
  'nu': ['me', 'ne', 'mu'],
  'me': ['nu', 'ne', 'ma'],
  'ro': ['ru', 'ra', 'lo'],
  'ru': ['ro', 're', 'lu'],
  'o': ['wo', 'a', 'u'],
  'wo': ['o', 'wa'],
  'ka': ['ga', 'ta', 'ki'],
  'ga': ['ka', 'da', 'gi'],
  'ta': ['da', 'na', 'ka'],
  'da': ['ta', 'ba', 'za'],
  'sa': ['za', 'chi', 'ka'],
  'za': ['sa', 'da', 'ja'],
  'ko': ['go', 'to', 'so'],
  'go': ['ko', 'do', 'yo'],
  'ki': ['gi', 'chi', 'shi'],
  'gi': ['ki', 'ji', 'ge'],
  'ku': ['gu', 'wa', 'fu'],
  'gu': ['ku', 'bu'],
  'ke': ['ge', 'te'],
  'ge': ['ke', 'de'],
  'se': ['ze', 'te'],
  'ze': ['se', 'de'],
  'so': ['zo', 'to', 'ko'],
  'zo': ['so', 'do'],
  'te': ['de', 'chi', 'to'],
  'de': ['te', 'ge', 'ze'],
  'to': ['do', 'ko', 'ro'],
  'do': ['to', 'go', 'bo'],
  'na': ['ta', 'ma', 'ha'],
  'ni': ['ko', 'ri', 'i'],
  'no': ['ro', 'o'],
  'hi': ['bi', 'pi', 'ki'],
  'bi': ['hi', 'pi', 'di'],
  'pi': ['hi', 'bi', 'ti'],
  'fu': ['hu', 'bu', 'pu', 'ku'],
  'bu': ['fu', 'pu', 'gu'],
  'pu': ['fu', 'bu'],
  'he': ['be', 'pe', 'e'],
  'be': ['he', 'pe', 'de'],
  'pe': ['he', 'be'],
  'ho': ['bo', 'po', 'mo'],
  'bo': ['ho', 'po', 'do'],
  'po': ['ho', 'bo'],
  'ma': ['ha', 'mo', 'na'],
  'mi': ['ni', 'me'],
  'mu': ['su', 'bu'],
  'ya': ['a', 'wa'],
  'yu': ['yo', 'u'],
  'yo': ['yu', 'ro'],
  'n': ['m', 'ng'],
};

/**
 * Función que baraja un array (Fisher-Yates inmutable).
 */
function shuffleArray<T>(arr: T[]): T[] {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

/**
 * Obtiene opciones (1 correcta + distractores) priorizando trampas visuales/fonéticas.
 *
 * @param targetKana El caracter kana correcto.
 * @param kanaSet 'hiragana' | 'katakana'.
 * @param fallbackPool Conjunto general de caracteres para rellenar si no hay suficientes trampas.
 * @param count Total de opciones (por defecto 4).
 */
export function getTrapKanaOptions(
  targetKana: string,
  kanaSet: 'hiragana' | 'katakana',
  fallbackPool: string[],
  count: number = 4
): string[] {
  const trapMap = kanaSet === 'katakana' ? KATAKANA_TRAPS : HIRAGANA_TRAPS;
  const traps = trapMap[targetKana] || [];

  // Barajar las trampas disponibles para variedad
  const selectedTraps = shuffleArray(traps.filter((t) => t !== targetKana));

  // Distractores que usaremos
  const chosen = new Set<string>();
  for (const t of selectedTraps) {
    if (chosen.size >= count - 1) break;
    chosen.add(t);
  }

  // Si aún faltan para completar count - 1 distractores, rellenar del pool de respaldo
  if (chosen.size < count - 1) {
    const poolShuffled = shuffleArray(
      fallbackPool.filter((k) => k !== targetKana && !chosen.has(k))
    );
    for (const k of poolShuffled) {
      if (chosen.size >= count - 1) break;
      chosen.add(k);
    }
  }

  const allOpts = [targetKana, ...Array.from(chosen)];
  return shuffleArray(allOpts);
}

/**
 * Obtiene opciones de lectura romaji priorizando pares confusos (shi vs ji, chi, tsu, etc.).
 *
 * @param targetReading La lectura romaji correcta (ej. "shi").
 * @param fallbackPool Lecturas romaji de respaldo para completar si faltan.
 * @param count Total de opciones (por defecto 4).
 */
export function getTrapReadingOptions(
  targetReading: string,
  fallbackPool: string[],
  count: number = 4
): string[] {
  const traps = ROMAJI_TRAPS[targetReading.toLowerCase()] || [];

  const selectedTraps = shuffleArray(
    traps.filter((t) => t.toLowerCase() !== targetReading.toLowerCase())
  );

  const chosen = new Set<string>();
  for (const t of selectedTraps) {
    if (chosen.size >= count - 1) break;
    chosen.add(t);
  }

  if (chosen.size < count - 1) {
    const poolShuffled = shuffleArray(
      fallbackPool.filter(
        (r) => r.toLowerCase() !== targetReading.toLowerCase() && !chosen.has(r)
      )
    );
    for (const r of poolShuffled) {
      if (chosen.size >= count - 1) break;
      chosen.add(r);
    }
  }

  const allOpts = [targetReading, ...Array.from(chosen)];
  return shuffleArray(allOpts);
}
