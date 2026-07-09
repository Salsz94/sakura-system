import { useState } from 'react';
import { C } from '../styles/tokens';
import { MN } from '../core/content';
import { Btn } from '../components/Btn';
import { Ghost } from '../components/Ghost';
import { playSound } from '../audio/soundManager';

// ── PALABRAS PARA BOSS AHORCADO ──────────────────────────────────
// Un solo banco (hiragana) se usaba para TODOS los módulos, incluido
// el examen de Katakana — el juego mostraba palabras en hiragana
// dentro de un examen de katakana. Ahora hay un banco propio por set.
const HIRAGANA_BOSS_WORDS = [
  {
    word: ['わ', 'た', 'し'],
    meaning: 'yo (watashi)',
    hint: "La palabra más básica para decir 'yo' en japonés.",
  },
  {
    word: ['あ', 'り', 'が', 'と'],
    meaning: 'gracias (arigato)',
    hint: 'Versión corta de arigatou. La escuchas en todos los animes.',
  },
  {
    word: ['さ', 'く', 'ら'],
    meaning: 'cerezo / sakura',
    hint: 'La flor más icónica de Japón. También es un nombre.',
  },
  {
    word: ['み', 'ず'],
    meaning: 'agua (mizu)',
    hint: 'み = mi, ず = zu. Aparece en Suiton no jutsu.',
  },
  {
    word: ['き', 'も', 'ち'],
    meaning: 'sentimiento (kimochi)',
    hint: "き = ki, も = mo, ち = chi. 'Kimochi ii' = se siente bien.",
  },
  {
    word: ['な', 'ま', 'え'],
    meaning: 'nombre (namae)',
    hint: "'Namae wa nan desu ka?' = ¿Cómo te llamas?",
  },
  {
    word: ['と', 'も', 'だ', 'ち'],
    meaning: 'amigo (tomodachi)',
    hint: 'と+も+だ+ち. La palabra que Naruto repite todo el tiempo.',
  },
  {
    word: ['に', 'ほ', 'ん'],
    meaning: 'Japón (nihon)',
    hint: 'に = ni, ほ = ho, ん = n. El nombre propio del país.',
  },
  {
    word: ['は', 'な'],
    meaning: 'flor (hana)',
    hint: 'は = ha, な = na. También significa nariz. Contexto es clave.',
  },
  {
    word: ['う', 'み'],
    meaning: 'mar (umi)',
    hint: 'う = u, み = mi. El mar donde vive Kisame.',
  },
  {
    word: ['か', 'わ'],
    meaning: 'río (kawa)',
    hint: 'か = ka, わ = wa. El kanji 川 representa un río.',
  },
  {
    word: ['や', 'ま'],
    meaning: 'montaña (yama)',
    hint: 'や = ya, ま = ma. El kanji 山 representa una montaña.',
  },
];

const KATAKANA_BOSS_WORDS = [
  {
    word: ['コ', 'ー', 'ヒ', 'ー'],
    meaning: 'café (koohii)',
    hint: 'Del inglés "coffee". El ー alarga la vocal anterior.',
  },
  {
    word: ['テ', 'レ', 'ビ'],
    meaning: 'televisión (terebi)',
    hint: 'Del inglés "television", acortado.',
  },
  {
    word: ['カ', 'メ', 'ラ'],
    meaning: 'cámara (kamera)',
    hint: 'Del inglés "camera".',
  },
  {
    word: ['パ', 'ン'],
    meaning: 'pan (pan)',
    hint: 'Del portugués "pão". Una de las primeras palabras occidentales en entrar al japonés.',
  },
  {
    word: ['ケ', 'ー', 'キ'],
    meaning: 'pastel (keeki)',
    hint: 'Del inglés "cake".',
  },
  {
    word: ['ホ', 'テ', 'ル'],
    meaning: 'hotel (hoteru)',
    hint: 'Del inglés/francés "hotel".',
  },
  {
    word: ['ピ', 'ザ'],
    meaning: 'pizza (piza)',
    hint: 'Del italiano "pizza".',
  },
  {
    word: ['ジ', 'ュ', 'ー', 'ス'],
    meaning: 'jugo (juusu)',
    hint: 'Del inglés "juice".',
  },
  {
    word: ['ボ', 'ー', 'ル'],
    meaning: 'pelota (booru)',
    hint: 'Del inglés "ball".',
  },
  {
    word: ['ラ', 'ジ', 'オ'],
    meaning: 'radio (rajio)',
    hint: 'Del inglés "radio".',
  },
  {
    word: ['タ', 'ク', 'シ', 'ー'],
    meaning: 'taxi (takushii)',
    hint: 'Del inglés "taxi".',
  },
  {
    word: ['ノ', 'ー', 'ト'],
    meaning: 'cuaderno (nooto)',
    hint: 'Del inglés "note(book)".',
  },
];

const HIRAGANA_POOL = [
  'あ', 'い', 'う', 'え', 'お',
  'か', 'き', 'く', 'け', 'こ',
  'さ', 'し', 'す', 'せ', 'そ',
  'た', 'ち', 'つ', 'て', 'と',
  'な', 'に', 'ぬ', 'ね', 'の',
  'は', 'ひ', 'ふ', 'へ', 'ほ',
  'ま', 'み', 'む', 'め', 'も',
  'や', 'ゆ', 'よ',
  'ら', 'り', 'る', 'れ', 'ろ',
  'わ', 'を', 'ん',
];

const KATAKANA_POOL = [
  'ア', 'イ', 'ウ', 'エ', 'オ',
  'カ', 'キ', 'ク', 'ケ', 'コ',
  'サ', 'シ', 'ス', 'セ', 'ソ',
  'タ', 'チ', 'ツ', 'テ', 'ト',
  'ナ', 'ニ', 'ヌ', 'ネ', 'ノ',
  'ハ', 'ヒ', 'フ', 'ヘ', 'ホ',
  'マ', 'ミ', 'ム', 'メ', 'モ',
  'ヤ', 'ユ', 'ヨ',
  'ラ', 'リ', 'ル', 'レ', 'ロ',
  'ワ', 'ヲ', 'ン', 'ー',
];

// ── MINI BOSS (inline para examen) ───────────────────────────────
const BOSSES = [
  {
    name: 'Yamato',
    title: 'Guardián del Bosque',
    kana: '木',
    color: '#16A34A',
    hp: 5,
    bonus: 150,
  },
  {
    name: 'Kisame',
    title: 'Señor del Agua',
    kana: '水',
    color: '#2563EB',
    hp: 6,
    bonus: 180,
  },
  {
    name: 'Itachi',
    title: 'Maestro del Fuego',
    kana: '火',
    color: '#DC2626',
    hp: 6,
    bonus: 200,
  },
  {
    name: 'Orochimaru',
    title: 'Sabio del Sonido',
    kana: '音',
    color: '#7C3AED',
    hp: 7,
    bonus: 250,
  },
];

interface BossQuestion {
  kana: string;
  q: string;
  ans: string;
  opts: string[];
  hint: string;
  char: string;
}

interface MiniBossExamProps {
  questions: BossQuestion[];
  bossIndex?: number;
  kanaSet?: 'hiragana' | 'katakana';
  /** 'words' = completa la palabra (solo m1/m2, alfabetización);
   *  'quiz'  = preguntas del CONTENIDO REAL del módulo (m3-m8).
   *  Antes el boss usaba palabras de hiragana básico para TODOS los
   *  módulos — el examen de kanji/gramática validaba otra cosa. */
  mode?: 'words' | 'quiz';
  onComplete: (xp: number) => void;
  onFail: () => void;
  onRetry: () => void;
}

export function MiniBossExam({
  questions,
  bossIndex = 0,
  kanaSet = 'hiragana',
  mode = 'words',
  onComplete,
  onFail,
  onRetry,
}: MiniBossExamProps) {
  const boss = BOSSES[bossIndex % BOSSES.length];
  const wordBank = kanaSet === 'katakana' ? KATAKANA_BOSS_WORDS : HIRAGANA_BOSS_WORDS;
  const distractorPool = kanaSet === 'katakana' ? KATAKANA_POOL : HIRAGANA_POOL;
  const isQuiz = mode === 'quiz' && questions.length > 0;
  const maxBossHp = isQuiz ? questions.length : boss.hp;
  const [playerHp, setPlayerHp] = useState(5);
  const [bossHp, setBossHp] = useState(maxBossHp);
  const [wordIdx, setWordIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [xpG, setXpG] = useState(0);
  const [combo, setCombo] = useState(0);
  const [done, setDone] = useState<'win' | 'lose' | null>(null);
  const [bossShake, setBossShake] = useState(false);
  const [playerShake, setPlayerShake] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [showQHint, setShowQHint] = useState(false);

  // Seleccionar palabras random del módulo actual
  const [words] = useState(() => {
    const arr = [...wordBank];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.slice(0, boss.hp); // una palabra por HP del boss
  });

  // Para cada palabra, elegir qué posición ocultar
  const [blanks] = useState(() =>
    words.map((w) => Math.floor(Math.random() * w.word.length))
  );

  // Generar opciones para la kana faltante de cada palabra
  const [options] = useState(() =>
    words.map((w, wi) => {
      const correct = w.word[blanks[wi]];
      const wrong = distractorPool
        .filter((k) => k !== correct)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const opts = [correct, ...wrong].sort(() => Math.random() - 0.5);
      return opts;
    })
  );

  const currentWord = words[wordIdx];
  const currentBlank = blanks[wordIdx];
  const currentOpts = options[wordIdx];
  const currentQ = isQuiz ? questions[qIdx] : null;

  // Modo quiz: responder bien daña al boss y avanza; responder mal
  // cuesta HP propio y REPITE la misma pregunta (hay que dominarla).
  const pickQuizOption = (i: number) => {
    if (done || !currentQ || showQHint) return;
    const ok = currentQ.opts[i] === currentQ.ans;
    playSound(ok ? 'correct' : 'wrong');
    if (ok) {
      const g = 10 + (combo >= 2 ? 5 : 0);
      setXpG((x) => x + g);
      setCombo((c) => c + 1);
      const nh = Math.max(0, bossHp - 1);
      setBossHp(nh);
      setBossShake(true);
      setTimeout(() => setBossShake(false), 400);
      setShowQHint(true);
      setTimeout(() => {
        setShowQHint(false);
        if (nh === 0 || qIdx >= questions.length - 1) setDone('win');
        else setQIdx((x) => x + 1);
      }, 1600);
    } else {
      setCombo(0);
      setWrong(true);
      setTimeout(() => setWrong(false), 400);
      const nh = Math.max(0, playerHp - 1);
      setPlayerHp(nh);
      setPlayerShake(true);
      setTimeout(() => setPlayerShake(false), 400);
      if (nh === 0) setTimeout(() => setDone('lose'), 500);
    }
  };

  const pickKana = (kana: string) => {
    if (done) return;
    const correct = currentWord.word[currentBlank];
    playSound(kana === correct ? 'correct' : 'wrong');
    if (kana === correct) {
      const g = 10 + (combo >= 2 ? 5 : 0);
      setXpG((x) => x + g);
      setCombo((c) => c + 1);
      setBossHp((h) => {
        const nh = Math.max(0, h - 1);
        if (nh === 0) setTimeout(() => setDone('win'), 600);
        return nh;
      });
      setBossShake(true);
      setTimeout(() => setBossShake(false), 400);
      setShowMeaning(true);
      setTimeout(() => {
        setShowMeaning(false);
        if (wordIdx < words.length - 1) setWordIdx((i) => i + 1);
        else setDone('win');
      }, 1800);
    } else {
      setCombo(0);
      setWrong(true);
      setTimeout(() => setWrong(false), 400);
      setPlayerHp((h) => {
        const nh = Math.max(0, h - 1);
        if (nh === 0) setTimeout(() => setDone('lose'), 500);
        return nh;
      });
      setPlayerShake(true);
      setTimeout(() => setPlayerShake(false), 400);
    }
  };

  const bHpPct = (bossHp / maxBossHp) * 100;
  const pHpPct = (playerHp / 5) * 100;

  if (done) {
    const won = done === 'win';
    return (
      <div
        className="fu"
        style={{
          background: C.s1,
          border: `1px solid ${
            won ? 'rgba(140,242,68,.28)' : 'rgba(255,59,92,.2)'
          }`,
          borderRadius: 18,
          padding: '26px 20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: won ? C.ok : C.err,
            letterSpacing: 3,
            fontWeight: 700,
            marginBottom: 12,
            textTransform: 'uppercase',
          }}
        >
          {won ? `¡${boss.name} Derrotado!` : 'Has caído en batalla'}
        </div>
        <div
          style={{
            fontFamily: C.jp,
            fontSize: 60,
            color: won ? boss.color : 'rgba(255,59,92,.15)',
            fontWeight: 900,
            lineHeight: 1,
            marginBottom: 6,
          }}
        >
          {boss.kana}
        </div>
        <div style={{ fontSize: 11, color: C.t2, marginBottom: won ? 16 : 12 }}>
          {boss.title}
        </div>
        {won && (
          <>
            <div
              style={{
                fontFamily: C.mono,
                fontSize: 38,
                fontWeight: 900,
                color: C.accent,
                letterSpacing: -1,
              }}
            >
              +{xpG + boss.bonus}
            </div>
            <div
              style={{
                fontSize: 9,
                color: C.t2,
                letterSpacing: 2,
                marginBottom: 16,
                textTransform: 'uppercase',
              }}
            >
              XP · Boss Bonus +{boss.bonus}
            </div>
          </>
        )}
        {won ? (
          <Btn onClick={() => onComplete(xpG + boss.bonus)}>
            VER RESULTADO →
          </Btn>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Ghost onClick={onFail} style={{ flex: 1 }}>
              Al Mapa
            </Ghost>
            <Btn onClick={onRetry} style={{ flex: 2 }}>
              Intentar de Nuevo
            </Btn>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          fontFamily: C.title,
          fontSize: 10,
          color: C.err,
          letterSpacing: 3,
          fontWeight: 700,
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        Mini Boss — {boss.name}
      </div>

      {/* Boss HP */}
      <div
        className={`corner-frame corner-frame-err ${bossShake ? 'shake' : ''}`}
        style={{
          background: C.s1,
          border: `1px solid ${C.b1}`,
          borderRadius: 14,
          padding: '12px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 7,
          }}
        >
          <div
            style={{
              fontFamily: C.jp,
              fontSize: 16,
              fontWeight: 900,
              color: boss.color,
            }}
          >
            {boss.kana} {boss.name}
          </div>
          <div style={{ fontFamily: C.mono, fontSize: 10, color: boss.color }}>
            {bossHp}/{maxBossHp} HP
          </div>
        </div>
        <div
          style={{
            height: 5,
            background: C.b2,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${bHpPct}%`,
              background: boss.color,
              borderRadius: 3,
              transition: 'width .5s cubic-bezier(.22,1,.36,1)',
            }}
          />
        </div>
      </div>

      {/* Player HP */}
      <div
        className={playerShake ? 'shake' : ''}
        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      >
        <div
          style={{
            fontSize: 9,
            color: C.t2,
            fontFamily: C.mono,
            whiteSpace: 'nowrap',
          }}
        >
          TÚ {playerHp}/5
        </div>
        <div
          style={{
            flex: 1,
            height: 3,
            background: C.b2,
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pHpPct}%`,
              background: playerHp > 2 ? C.ok : C.err,
              borderRadius: 2,
              transition: 'width .4s',
            }}
          />
        </div>
        {combo >= 2 && (
          <div
            style={{
              fontFamily: C.mono,
              fontSize: 9,
              color: C.warn,
              border: `1px solid rgba(255,59,92,.22)`,
              padding: '2px 6px',
              borderRadius: 20,
            }}
          >
            ×{combo}
          </div>
        )}
      </div>

      {/* Reto QUIZ — preguntas del contenido real del módulo (m3-m8) */}
      {isQuiz && currentQ && (
        <>
          <div
            className={wrong ? 'shake' : ''}
            style={{
              background: C.s1,
              border: `1px solid ${
                showQHint
                  ? 'rgba(140,242,68,.4)'
                  : wrong
                  ? 'rgba(255,59,92,.35)'
                  : C.b1
              }`,
              borderRadius: 18,
              padding: '22px 18px',
              textAlign: 'center',
              transition: 'border .15s',
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: C.t2,
                letterSpacing: 2,
                marginBottom: 14,
                textTransform: 'uppercase',
              }}
            >
              {currentQ.q} — {qIdx + 1}/{questions.length}
            </div>
            <div
              style={{
                fontFamily: C.jp,
                fontSize: currentQ.kana.length > 2 ? 44 : 76,
                fontWeight: 900,
                color: C.t1,
                lineHeight: 1.15,
                marginBottom: showQHint ? 14 : 0,
              }}
            >
              {currentQ.kana}
            </div>
            {showQHint && (
              <div
                className="fu"
                style={{
                  borderTop: `1px solid rgba(140,242,68,.2)`,
                  paddingTop: 12,
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 700, color: C.ok, marginBottom: 4 }}>
                  {currentQ.ans}
                </div>
                <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.7 }}>
                  {currentQ.hint}
                </div>
              </div>
            )}
          </div>
          {!showQHint && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {currentQ.opts.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => pickQuizOption(i)}
                  style={{
                    background: C.s2,
                    border: `1px solid ${C.b2}`,
                    borderRadius: 14,
                    padding: '16px 10px',
                    fontSize: 15,
                    fontFamily: C.mono,
                    fontWeight: 700,
                    color: C.t1,
                    transition: 'all .15s',
                    minHeight: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Palabra con hueco (modo alfabetización, m1/m2) */}
      {!isQuiz && (
      <div
        className={wrong ? 'shake' : ''}
        style={{
          background: C.s1,
          border: `1px solid ${
            showMeaning
              ? 'rgba(140,242,68,.4)'
              : wrong
              ? 'rgba(255,59,92,.35)'
              : C.b1
          }`,
          borderRadius: 18,
          padding: '22px 18px',
          textAlign: 'center',
          transition: 'border .15s',
        }}
      >
        <div
          style={{
            fontSize: 10,
            color: C.t2,
            letterSpacing: 2,
            marginBottom: 16,
            textTransform: 'uppercase',
          }}
        >
          Completa la palabra — {wordIdx + 1}/{words.length}
        </div>

        {/* Palabra con la kana faltante como hueco */}
        <div
          style={{
            display: 'flex',
            gap: 10,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          {currentWord.word.map((kana, ki) => (
            <div
              key={ki}
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background:
                  ki === currentBlank ? (showMeaning ? C.okD : C.aD) : C.s2,
                border: `1px solid ${
                  ki === currentBlank ? (showMeaning ? C.ok : C.accent) : C.b2
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: C.jp,
                fontSize: 28,
                fontWeight: 900,
                color:
                  ki === currentBlank ? (showMeaning ? C.ok : C.accent) : C.t1,
                transition: 'all .3s',
              }}
            >
              {ki === currentBlank ? (showMeaning ? kana : '？') : kana}
            </div>
          ))}
        </div>

        {/* Significado — aparece al acertar */}
        {showMeaning && (
          <div
            className="fu"
            style={{
              borderTop: `1px solid rgba(140,242,68,.2)`,
              paddingTop: 12,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: C.ok,
                marginBottom: 4,
              }}
            >
              {currentWord.meaning}
            </div>
            <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.7 }}>
              {currentWord.hint}
            </div>
          </div>
        )}

        {/* Mnemónico si no ha acertado */}
        {!showMeaning && MN[currentWord.word[currentBlank]] && (
          <div
            style={{
              fontSize: 11,
              color: C.t2,
              lineHeight: 1.6,
              borderTop: `1px solid ${C.b1}`,
              paddingTop: 10,
            }}
          >
            {MN[currentWord.word[currentBlank]]}
          </div>
        )}
      </div>
      )}

      {/* Opciones de kana (modo alfabetización) */}
      {!isQuiz && !showMeaning && (
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
        >
          {currentOpts.map((opt, i) => (
            <button
              key={i}
              onClick={() => pickKana(opt)}
              style={{
                background: C.s2,
                border: `1px solid ${C.b2}`,
                borderRadius: 14,
                padding: '16px 10px',
                fontSize: 36,
                fontFamily: C.jp,
                fontWeight: 700,
                color: C.t1,
                transition: 'all .15s',
                minHeight: 70,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
