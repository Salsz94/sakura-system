import { useState, useEffect, useRef } from 'react';
import { C } from '../styles/tokens';
import { Ghost } from '../components/Ghost';
import { Btn } from '../components/Btn';
import { rng, shuffle } from '../core/engine';
import { playSound } from '../audio/soundManager';
import type { KanaSet } from '../data/repositories/leaderboardRepo';

interface Question {
  char: string;
  ans: string;
  opts: string[];
}

interface SpeedReviewScreenProps {
  kanaSet: KanaSet;
  pool: { chars: string[]; reads: string[] };
  displayName: string | null;
  onSetDisplayName: (name: string) => void;
  onFinish: (timeMs: number, errors: number) => void;
  onBack: () => void;
  onViewLeaderboard: () => void;
}

const QUESTION_COUNT = 46;

function buildQuestions(
  pool: { chars: string[]; reads: string[] },
  count: number,
  seed: number
): Question[] {
  const { chars, reads } = pool;
  if (chars.length === 0) return [];
  const r = rng(seed);
  const idxs: number[] = [];
  let bag: number[] = [];
  while (idxs.length < count) {
    if (bag.length === 0) bag = shuffle(chars.map((_, i) => i), r);
    idxs.push(bag.pop() as number);
  }
  return idxs.map((i) => {
    const ch = chars[i];
    const ans = reads[i];
    const wrongPool = chars
      .map((c, j) => ({ c, r: reads[j] }))
      .filter((x) => x.r !== ans);
    const wrong = shuffle(wrongPool, r)
      .slice(0, 3)
      .map((x) => x.r);
    const opts = shuffle([ans, ...wrong], r);
    return { char: ch, ans, opts };
  });
}

function formatTime(ms: number): string {
  const totalCs = Math.floor(ms / 10);
  const s = Math.floor(totalCs / 100);
  const cs = totalCs % 100;
  return `${s}.${String(cs).padStart(2, '0')}s`;
}

// ════════════════════════════════════════════════════════════════
// SPEED REVIEW — repaso cronometrado, kana mezclado, leaderboard global
// ════════════════════════════════════════════════════════════════
export function SpeedReviewScreen({
  kanaSet,
  pool,
  displayName,
  onSetDisplayName,
  onFinish,
  onBack,
  onViewLeaderboard,
}: SpeedReviewScreenProps) {
  const [phase, setPhase] = useState<'setup' | 'running' | 'done'>('setup');
  const [aliasInput, setAliasInput] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [wrong, setWrong] = useState(false);
  const [errors, setErrors] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startRef = useRef<number | null>(null);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (phase !== 'running') return;
    const id = setInterval(() => {
      if (startRef.current) setElapsedMs(Date.now() - startRef.current);
    }, 47);
    return () => clearInterval(id);
  }, [phase]);

  const q = questions[qIdx];
  const label = kanaSet === 'hiragana' ? 'Hiragana' : 'Katakana';

  const start = () => {
    const qs = buildQuestions(pool, QUESTION_COUNT, Date.now() % 999999);
    setQuestions(qs);
    setQIdx(0);
    setSel(null);
    setErrors(0);
    setElapsedMs(0);
    finishedRef.current = false;
    startRef.current = Date.now();
    setPhase('running');
  };

  const pick = (i: number) => {
    if (!q || sel !== null) return;
    const ok = q.opts[i] === q.ans;
    if (ok) {
      playSound('correct');
      setSel(i);
      setTimeout(() => {
        if (qIdx < questions.length - 1) {
          setQIdx((x) => x + 1);
          setSel(null);
        } else if (!finishedRef.current) {
          finishedRef.current = true;
          const total = startRef.current ? Date.now() - startRef.current : elapsedMs;
          setElapsedMs(total);
          setPhase('done');
          onFinish(total, errors);
        }
      }, 200);
    } else {
      setErrors((e) => e + 1);
      setWrong(true);
      playSound('wrong');
      setTimeout(() => setWrong(false), 300);
    }
  };

  if (phase === 'setup') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Ghost onClick={onBack}>← Volver</Ghost>
          <div
            style={{
              fontFamily: C.title,
              fontSize: 10,
              letterSpacing: 4,
              color: C.t3,
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            Repaso Cronometrado
          </div>
        </div>

        <div
          className="fu corner-frame"
          style={{
            background: C.s1,
            border: `1px solid ${C.b1}`,
            borderRadius: 18,
            padding: '24px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontFamily: C.title, fontSize: 20, fontWeight: 800, color: C.t1, marginBottom: 6 }}>
            {label} — Modo Velocidad
          </div>
          <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.7, marginBottom: 18 }}>
            {QUESTION_COUNT} caracteres mezclados de todo lo que ya desbloqueaste.
            El cronómetro corre desde el primero hasta el último acierto. Los
            errores no detienen el tiempo — pero sí lo alargan.
          </div>
          {pool.chars.length > 0 && pool.chars.length < 20 && (
            <div
              style={{
                fontSize: 11,
                color: C.warn,
                lineHeight: 1.6,
                marginBottom: 14,
                border: `1px solid rgba(255,176,32,.25)`,
                borderRadius: 10,
                padding: '10px 12px',
              }}
            >
              Tienes {pool.chars.length} caracteres desbloqueados. Puedes jugar,
              pero tu tiempo entra al leaderboard global a partir de 20 (para
              que todos compitan con la misma dificultad).
            </div>
          )}

          {pool.chars.length === 0 ? (
            <div style={{ fontSize: 12, color: C.t2 }}>
              Todavía no has desbloqueado suficiente {label.toLowerCase()} para
              este modo. Completa algunas lecciones primero.
            </div>
          ) : !displayName ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 11, color: C.t2 }}>
                Elige tu alias para el leaderboard global (no se muestra tu email):
              </div>
              <input
                value={aliasInput}
                onChange={(e) => setAliasInput(e.target.value.slice(0, 18))}
                placeholder="Tu gamer tag"
                style={{
                  background: C.s2,
                  border: `1px solid ${C.b2}`,
                  borderRadius: 10,
                  padding: '12px 14px',
                  color: C.t1,
                  fontSize: 14,
                  fontFamily: C.mono,
                  textAlign: 'center',
                }}
              />
              <Btn
                onClick={() => aliasInput.trim() && onSetDisplayName(aliasInput.trim())}
                style={{ opacity: aliasInput.trim() ? 1 : 0.4 }}
              >
                Guardar alias
              </Btn>
            </div>
          ) : (
            <Btn onClick={start}>Empezar →</Btn>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'running' && q) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: C.mono, fontSize: 20, fontWeight: 800, color: C.accent }}>
            {formatTime(elapsedMs)}
          </div>
          <div style={{ fontSize: 10, color: C.t2, fontFamily: C.mono }}>
            {qIdx + 1}/{questions.length}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 3 }}>
          {questions.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 2,
                borderRadius: 1,
                background: i < qIdx ? C.accent : i === qIdx ? C.t1 : C.b2,
              }}
            />
          ))}
        </div>

        <div
          className={`corner-frame ${wrong ? 'error-shake' : ''}`}
          style={{
            background: C.s1,
            border: `1px solid ${wrong ? C.err : sel !== null ? C.accent : C.b1}`,
            borderRadius: 18,
            padding: '30px 18px',
            textAlign: 'center',
            transition: 'border .12s',
          }}
        >
          <div
            style={{
              fontFamily: C.jp,
              fontSize: q.char.length > 1 ? 64 : 96,
              color: C.t1,
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {q.char}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {q.opts.map((opt, i) => {
            const isSelCorrect = sel === i;
            return (
              <button
                key={i}
                onClick={() => pick(i)}
                style={{
                  background: isSelCorrect ? C.okD : C.s2,
                  border: `1px solid ${isSelCorrect ? C.ok : C.b1}`,
                  color: isSelCorrect ? C.ok : C.t1,
                  borderRadius: 14,
                  padding: '16px 10px',
                  fontSize: 16,
                  fontFamily: C.mono,
                  fontWeight: 700,
                  transition: 'all .12s',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div
        className="fu corner-frame"
        style={{
          background: C.s1,
          border: `1px solid rgba(140,242,68,.25)`,
          borderRadius: 18,
          padding: '28px 20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 9, color: C.accent, letterSpacing: 3, fontWeight: 700, marginBottom: 12, textTransform: 'uppercase' }}>
          {label} completado
        </div>
        <div style={{ fontFamily: C.mono, fontSize: 40, fontWeight: 900, color: C.accent, marginBottom: 6 }}>
          {formatTime(elapsedMs)}
        </div>
        <div style={{ fontSize: 11, color: C.t2, marginBottom: 20 }}>
          {errors === 0 ? 'Sin errores — tiempo limpio' : `${errors} error${errors > 1 ? 'es' : ''}`}
          {pool.chars.length < 20 && (
            <>
              <br />
              <span style={{ color: C.warn }}>
                Tiempo de práctica — rankea desde 20 caracteres desbloqueados.
              </span>
            </>
          )}
        </div>
        <Btn onClick={onViewLeaderboard}>Ver leaderboard →</Btn>
      </div>
    );
  }

  return null;
}
