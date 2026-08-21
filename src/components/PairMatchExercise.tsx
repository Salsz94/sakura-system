import { useState, useEffect } from 'react';
import { C } from '../styles/tokens';
import { playSound } from '../audio/soundManager';

interface Pair {
  left: string;
  right: string;
}

// Evita que las palabras largas desalineen las filas: reduce
// la fuente según longitud y permite que el texto fluya naturalmente.
function fitFontSize(text: string, base: number): number {
  const len = text?.length || 1;
  if (len <= 4) return base;
  if (len <= 8) return Math.max(12, Math.round(base * 0.88));
  if (len <= 14) return Math.max(11, Math.round(base * 0.78));
  return Math.max(10, Math.round(base * 0.70));
}

interface PairMatchExerciseProps {
  pairs: Pair[];
  hint?: string;
  onMistake?: () => void;
  onComplete: (errors: number) => void;
}

// ════════════════════════════════════════════════════════════════
// PAIR MATCH EXERCISE — romaji columna izquierda, kana derecha
// ════════════════════════════════════════════════════════════════
export function PairMatchExercise({ pairs, onMistake, onComplete }: PairMatchExerciseProps) {
  const [leftSel, setLeftSel] = useState<number | null>(null);
  const [rightSel, setRightSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrongPair, setWrongPair] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState(0);
  const [done, setDone] = useState(false);

  const [rightOrder] = useState(() => {
    const arr = pairs.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });

  useEffect(() => {
    if (leftSel === null || rightSel === null) return;
    const correctRight = rightOrder.indexOf(leftSel);
    if (rightSel === correctRight) {
      const nm = [...matched, leftSel];
      setMatched(nm);
      setLeftSel(null);
      setRightSel(null);
      playSound('correct');
      if (nm.length === pairs.length) setTimeout(() => setDone(true), 300);
    } else {
      setErrors((e) => e + 1);
      setWrongPair([leftSel, rightSel]);
      playSound('wrong');
      onMistake?.();
      setTimeout(() => {
        setWrongPair(null);
        setLeftSel(null);
        setRightSel(null);
      }, 600);
    }
  }, [leftSel, rightSel]);

  useEffect(() => {
    if (done) onComplete(errors);
  }, [done]);

  const isMatched = (i: number) => matched.includes(i);
  const isWrongL = (i: number) => wrongPair && wrongPair[0] === i;
  const isWrongR = (i: number) => wrongPair && wrongPair[1] === i;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: C.accent,
            letterSpacing: 3,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          Encuentra la Pareja
        </div>
        <div style={{ fontSize: 10, color: C.t2, fontFamily: C.mono }}>
          {matched.length}/{pairs.length}
        </div>
      </div>
      <div style={{ fontSize: 11, color: C.t2, textAlign: 'center' }}>
        Toca un romaji y luego su kana
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Columna izquierda — romaji */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {pairs.map((p, i) => {
            const isM = isMatched(i);
            const isSel = leftSel === i;
            const isW = isWrongL(i);
            return (
              <button
                key={i}
                className={isW ? 'shake' : ''}
                onClick={() => !isM && setLeftSel(isSel ? null : i)}
                style={{
                  background: isM ? C.okD : isSel ? 'rgba(14,124,140,.18)' : C.s2,
                  border: `1px solid ${
                    isM ? C.ok : isSel ? C.teal : isW ? C.err : C.b2
                  }`,
                  borderRadius: 12,
                  padding: '6px 6px',
                  minHeight: 52,
                  height: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontFamily: p.left.length > 5 ? "'Outfit',sans-serif" : C.mono,
                  fontSize: fitFontSize(p.left, p.left.length > 5 ? 13 : 15),
                  fontWeight: 700,
                  color: isM ? C.ok : isSel ? C.teal : C.t1,
                  opacity: isM ? 0.45 : 1,
                  transition: 'all .15s',
                  letterSpacing: 0.2,
                  lineHeight: 1.2,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
              >
                {p.left}
              </button>
            );
          })}
        </div>

        {/* Columna derecha — kana (shuffled) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {rightOrder.map((origIdx, di) => {
            const isM = isMatched(origIdx);
            const isSel = rightSel === di;
            const isW = isWrongR(di);
            return (
              <button
                key={di}
                className={isW ? 'shake' : ''}
                onClick={() => !isM && setRightSel(isSel ? null : di)}
                style={{
                  background: isM ? C.okD : isSel ? 'rgba(14,124,140,.18)' : C.s2,
                  border: `1px solid ${
                    isM ? C.ok : isSel ? C.teal : isW ? C.err : C.b2
                  }`,
                  borderRadius: 12,
                  padding: '6px 6px',
                  minHeight: 52,
                  height: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  fontFamily: C.jp,
                  fontSize: fitFontSize(pairs[origIdx].right, 18),
                  fontWeight: 700,
                  color: isM ? C.ok : isSel ? C.teal : C.t1,
                  opacity: isM ? 0.45 : 1,
                  transition: 'all .15s',
                  letterSpacing: 0.2,
                  lineHeight: 1.2,
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
              >
                {pairs[origIdx].right}
              </button>
            );
          })}
        </div>
      </div>

      {errors > 0 && (
        <div
          style={{
            fontSize: 10,
            color: C.err,
            fontFamily: C.mono,
            textAlign: 'center',
          }}
        >
          {errors} error{errors > 1 ? 'es' : ''} — sigue intentando
        </div>
      )}
    </div>
  );
}
