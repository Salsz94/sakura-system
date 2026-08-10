export interface VocabEntry {
  jp: string;
  romaji: string;
  es: string;
  type: 'kana' | 'vocab' | 'kanji';
  mnemonic?: string;
}

export const VOCAB_DICTIONARY: Record<string, VocabEntry> = {
  // Vocales Hiragana
  'あ': { jp: 'あ', romaji: 'a', es: 'Vocal "A" (antena de radio)', type: 'kana' },
  'い': { jp: 'い', romaji: 'i', es: 'Vocal "I" (dos anguilas)', type: 'kana' },
  'う': { jp: 'う', romaji: 'u', es: 'Vocal "U" (bolsa pesada)', type: 'kana' },
  'え': { jp: 'え', romaji: 'e', es: 'Vocal "E" (gimnasta)', type: 'kana' },
  'お': { jp: 'お', romaji: 'o', es: 'Vocal "O" (golfista)', type: 'kana' },

  // Fila Ka
  'か': { jp: 'か', romaji: 'ka', es: 'Sílaba "ka" (cuchillo y piedra)', type: 'kana' },
  'き': { jp: 'き', romaji: 'ki', es: 'Sílaba "ki" (llave que abre emociones)', type: 'kana' },
  'く': { jp: 'く', romaji: 'ku', es: 'Sílaba "ku" (pico de pájaro Cú-cú)', type: 'kana' },
  'け': { jp: 'け', romaji: 'ke', es: 'Sílaba "ke" (barril de cerveza)', type: 'kana' },
  'こ': { jp: 'こ', romaji: 'ko', es: 'Sílaba "ko" (gusano o dos líneas)', type: 'kana' },

  // Fila Sa
  'さ': { jp: 'さ', romaji: 'sa', es: 'Sílaba "sa" (servilleta doblada)', type: 'kana' },
  'し': { jp: 'し', romaji: 'shi', es: 'Sílaba "shi" (anzuelo de pescar)', type: 'kana' },
  'す': { jp: 'す', romaji: 'su', es: 'Sílaba "su" (espiral de humo / suki)', type: 'kana' },
  'せ': { jp: 'せ', romaji: 'se', es: 'Sílaba "se" (puesta de sol / sensei)', type: 'kana' },
  'そ': { jp: 'そ', romaji: 'so', es: 'Sílaba "so" (costura en zig-zag)', type: 'kana' },

  // Fila Ta
  'た': { jp: 'た', romaji: 'ta', es: 'Sílaba "ta" (letra t y a)', type: 'kana' },
  'ち': { jp: 'ち', romaji: 'chi', es: 'Sílaba "chi" (animadora dando salto)', type: 'kana' },
  'つ': { jp: 'つ', romaji: 'tsu', es: 'Sílaba "tsu" (ola de tsunami)', type: 'kana' },
  'て': { jp: 'て', romaji: 'te', es: 'Sílaba "te" (mano abierta)', type: 'kana' },
  'と': { jp: 'と', romaji: 'to', es: 'Sílaba "to" (dedo del pie golpeado)', type: 'kana' },

  // Fila Na
  'な': { jp: 'な', romaji: 'na', es: 'Sílaba "na" (monja rezando)', type: 'kana' },
  'に': { jp: 'に', romaji: 'ni', es: 'Sílaba "ni" (dos agujas de coser)', type: 'kana' },
  'ぬ': { jp: 'ぬ', romaji: 'nu', es: 'Sílaba "nu" (fideos de ramen)', type: 'kana' },
  'ね': { jp: 'ね', romaji: 'ne', es: 'Sílaba "ne" (gato durmiendo)', type: 'kana' },
  'の': { jp: 'の', romaji: 'no', es: 'Partícula posesiva "de" / Sílaba "no"', type: 'kana' },

  // Fila Ha
  'は': { jp: 'は', romaji: 'ha / wa', es: 'Sílaba "ha" / Partícula de tema "wa"', type: 'kana' },
  'ひ': { jp: 'ひ', romaji: 'hi', es: 'Sílaba "hi" (sonrisa amplia)', type: 'kana' },
  'ふ': { jp: 'ふ', romaji: 'fu', es: 'Sílaba "fu" (Monte Fuji)', type: 'kana' },
  'へ': { jp: 'へ', romaji: 'he', es: 'Sílaba "he" (cima de la montaña)', type: 'kana' },
  'ほ': { jp: 'ほ', romaji: 'ho', es: 'Sílaba "ho" (mástil de barco)', type: 'kana' },

  // Fila Ma
  'ま': { jp: 'ま', romaji: 'ma', es: 'Sílaba "ma" (mamá con brazos abiertos)', type: 'kana' },
  'み': { jp: 'み', romaji: 'mi', es: 'Sílaba "mi" (nota musical mi)', type: 'kana' },
  'む': { jp: 'む', romaji: 'mu', es: 'Sílaba "mu" (vaca mugiendo ¡Muu!)', type: 'kana' },
  'め': { jp: 'め', romaji: 'me', es: 'Sílaba "me" (ojo)', type: 'kana' },
  'も': { jp: 'も', romaji: 'mo', es: 'Partícula "también" / Sílaba "mo"', type: 'kana' },

  // Fila Ya, Ra, Wa, N
  'や': { jp: 'や', romaji: 'ya', es: 'Sílaba "ya" (yak lanudo)', type: 'kana' },
  'ゆ': { jp: 'ゆ', romaji: 'yu', es: 'Sílaba "yu" (pez flotando)', type: 'kana' },
  'よ': { jp: 'よ', romaji: 'yo', es: 'Sílaba "yo" (hombre diciendo ¡Yo!)', type: 'kana' },
  'ら': { jp: 'ら', romaji: 'ra', es: 'Sílaba "ra" (conejo saltando)', type: 'kana' },
  'り': { jp: 'り', romaji: 'ri', es: 'Sílaba "ri" (juncos del río)', type: 'kana' },
  'る': { jp: 'る', romaji: 'ru', es: 'Sílaba "ru" (lazo de soga)', type: 'kana' },
  'れ': { jp: 'れ', romaji: 're', es: 'Sílaba "re" (persona corriendo)', type: 'kana' },
  'ろ': { jp: 'ろ', romaji: 'ro', es: 'Sílaba "ro" (boca abierta)', type: 'kana' },
  'わ': { jp: 'わ', romaji: 'wa', es: 'Sílaba "wa" (avispero en la pared)', type: 'kana' },
  'を': { jp: 'を', romaji: 'wo / o', es: 'Partícula de objeto directo', type: 'kana' },
  'ん': { jp: 'ん', romaji: 'n', es: 'Consonante nasal solo "n"', type: 'kana' },

  // Katakana basico
  'ア': { jp: 'ア', romaji: 'a', es: 'Katakana "A"', type: 'kana' },
  'イ': { jp: 'イ', romaji: 'i', es: 'Katakana "I"', type: 'kana' },
  'ウ': { jp: 'ウ', romaji: 'u', es: 'Katakana "U"', type: 'kana' },
  'エ': { jp: 'エ', romaji: 'e', es: 'Katakana "E"', type: 'kana' },
  'オ': { jp: 'オ', romaji: 'o', es: 'Katakana "O"', type: 'kana' },
  'カ': { jp: 'カ', romaji: 'ka', es: 'Katakana "KA"', type: 'kana' },
  'キ': { jp: 'キ', romaji: 'ki', es: 'Katakana "KI"', type: 'kana' },
  'ク': { jp: 'ク', romaji: 'ku', es: 'Katakana "KU"', type: 'kana' },
  'ケ': { jp: 'ケ', romaji: 'ke', es: 'Katakana "KE"', type: 'kana' },
  'コ': { jp: 'コ', romaji: 'ko', es: 'Katakana "KO"', type: 'kana' },

  // Palabras Compuestas & Vocabulario Reales
  'おばさん': { jp: 'おばさん', romaji: 'obasan', es: 'tía / mujer adulta', type: 'vocab' },
  'おばあさん': { jp: 'おばあさん', romaji: 'obaasan', es: 'abuela / anciana', type: 'vocab' },
  'あめ': { jp: 'あめ', romaji: 'ame', es: 'lluvia / caramelo', type: 'vocab' },
  'いい': { jp: 'いい', romaji: 'ii', es: 'bueno / correcto / está bien', type: 'vocab' },
  'うた': { jp: 'うta', romaji: 'uta', es: 'canción / cantar', type: 'vocab' },
  'えん': { jp: 'えん', romaji: 'en', es: 'yen (moneda oficial de Japón)', type: 'vocab' },
  'おいしい': { jp: 'おいしい', romaji: 'oishii', es: 'delicioso / sabroso', type: 'vocab' },
  'コーヒー': { jp: 'コーヒー', romaji: 'kōhī', es: 'café / cafetería', type: 'vocab' },
  'すし': { jp: 'すし', romaji: 'sushi', es: 'sushi (platillo tradicional de arroz y pescado)', type: 'vocab' },
  'ねこ': { jp: 'ねこ', romaji: 'neko', es: 'gato / felino', type: 'vocab' },
  'いぬ': { jp: 'いぬ', romaji: 'inu', es: 'perro / canino', type: 'vocab' },
  'さくら': { jp: 'さくら', romaji: 'sakura', es: 'flor de cerezo', type: 'vocab' },
  'ありがとう': { jp: 'ありがとう', romaji: 'arigatō', es: 'gracias / agradecimiento', type: 'vocab' },
  'すみません': { jp: 'すみません', romaji: 'sumimasen', es: 'disculpe / perdón / gracias', type: 'vocab' },
  'どこ': { jp: 'どこ', romaji: 'doko', es: 'dónde / qué lugar', type: 'vocab' },
  'ばか': { jp: 'ばか', romaji: 'baka', es: 'tonto / necio', type: 'vocab' },
  'みず': { jp: 'みず', romaji: 'mizu', es: 'agua fría', type: 'vocab' },
  'ともだち': { jp: 'ともだち', romaji: 'tomodachi', es: 'amigo / compañero', type: 'vocab' },
  'つき': { jp: 'つき', romaji: 'tsuki', es: 'luna / mes', type: 'vocab' },
  'こころ': { jp: 'こころ', romaji: 'kokoro', es: 'corazón / alma / mente', type: 'vocab' },
  'せんせい': { jp: 'せんせい', romaji: 'sensei', es: 'maestro / profesor', type: 'vocab' },
  'すき': { jp: 'すき', romaji: 'suki', es: 'gustar / encantar', type: 'vocab' },
  'じかん': { jp: 'じかん', romaji: 'jikan', es: 'tiempo / hora', type: 'vocab' },
  'じぶん': { jp: 'じぶん', romaji: 'jibun', es: 'uno mismo / yo mismo', type: 'vocab' },
  'げんき': { jp: 'げんき', romaji: 'genki', es: 'saludable / lleno de energía', type: 'vocab' },
  'おちゃ': { jp: 'おちゃ', romaji: 'ocha', es: 'té verde japonés', type: 'vocab' },
  'にゃん': { jp: 'にゃん', romaji: 'nyan', es: 'maullido de gato (miau)', type: 'vocab' },
  'ざっし': { jp: 'ざっし', romaji: 'zasshi', es: 'revista / publicación', type: 'vocab' },
  'おかあさん': { jp: 'おかあさん', romaji: 'okaasan', es: 'madre / mamá', type: 'vocab' },
  'ケーキ': { jp: 'ケーキ', romaji: 'keeki', es: 'pastel / tarta', type: 'vocab' },
  'パンダ': { jp: 'パンダ', romaji: 'panda', es: 'oso panda', type: 'vocab' },
  'アニメ': { jp: 'アニメ', romaji: 'anime', es: 'animación japonesa', type: 'vocab' },
  'ラーメン': { jp: 'ラーメン', romaji: 'ramen', es: 'fideos ramen', type: 'vocab' },
  'カレー': { jp: 'カレー', romaji: 'karē', es: 'curry japonés', type: 'vocab' },
  'タクシー': { jp: 'タクシー', romaji: 'takushī', es: 'taxi', type: 'vocab' },
  'ホテル': { jp: 'ホテル', romaji: 'hoteru', es: 'hotel', type: 'vocab' },
  'アメリカ': { jp: 'アメリカ', romaji: 'amerika', es: 'Estados Unidos', type: 'vocab' },
  'ニホン': { jp: 'ニホン', romaji: 'nihon', es: 'Japón', type: 'vocab' },
  'きっと': { jp: 'きっと', romaji: 'kitto', es: 'sin duda / de seguro', type: 'vocab' },
  'きて': { jp: 'きて', romaji: 'kite', es: 'ven (por favor ven)', type: 'vocab' },
  'きって': { jp: 'きって', romaji: 'kitte', es: 'sello / estampilla postal', type: 'vocab' },
};

/** Helper para obtener la definición exacta en español de cualquier palabra o kana. */
export function getVocabEntry(item: string): VocabEntry {
  if (VOCAB_DICTIONARY[item]) return VOCAB_DICTIONARY[item];
  return {
    jp: item,
    romaji: item,
    es: item.length > 2 ? 'Palabra en japonés' : `Sílaba ${item}`,
    type: item.length > 2 ? 'vocab' : 'kana',
  };
}
