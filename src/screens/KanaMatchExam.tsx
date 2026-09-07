import { useState, useEffect } from 'react';
import { C } from '../styles/tokens';
import { Btn } from '../components/Btn';
import { playSound } from '../audio/soundManager';

interface MatchPair {
  left: string;
  right: string;
}

function fitFontSize(text: string, base: number): number {
  const len = text?.length || 1;
  if (len <= 3) return base;
  if (len <= 5) return base * 0.85;
  if (len <= 7) return base * 0.72;
  return base * 0.6;
}

interface KanaMatchExamProps {
  pairs: MatchPair[];
  difficulty?: 'normal' | 'hard';
  onComplete: (xp: number) => void;
  onFail: () => void;
}

// ── KANA MATCH (inline para examen) ──────────────────────────────
export function KanaMatchExam({ pairs, difficulty = 'normal', onComplete, onFail }: KanaMatchExamProps) {
  const isHard = difficulty === 'hard';
  const totalTime = isHard ? 15 : 25;
  const maxP = Math.min(pairs.length, 5);
  const active = pairs.slice(0, maxP);
  const [rightOrder] = useState(() => {
    const arr = active.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });
  const [leftSel, setLeftSel] = useState<number | null>(null);
  const [rightSel, setRightSel] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isHard || done) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isHard, done]);

  useEffect(() => {
    if (leftSel === null || rightSel === null) return;
    const correctRight = rightOrder.indexOf(leftSel);
    if (rightSel === correctRight) {
      const nm = [...matched, leftSel];
      setMatched(nm);
      setLeftSel(null);
      setRightSel(null);
      playSound('correct');
      if (nm.length === active.length) setTimeout(() => setDone(true), 400);
    } else {
      setErrors((e) => e + 1);
      setWrong([leftSel, rightSel]);
      playSound('wrong');
      setTimeout(() => {
        setWrong(null);
        setLeftSel(null);
        setRightSel(null);
      }, 600);
    }
  }, [leftSel, rightSel]);

  // Umbral por fase: en modo normal se permite hasta active.length errores. En modo hard máximo 2 errores y emparejar todos antes de que acabe el tiempo.
  const maxErrorsAllowed = isHard ? 2 : active.length;
  const passed = matched.length === active.length && errors <= maxErrorsAllowed;
  const xp = 60 + Math.max(0, (5 - errors) * 5) + (isHard ? 25 : 0);

  if (done) {
    return (
      <div
        className="fu"
        style={{
          background: C.s1,
          border: `1px solid ${passed ? 'rgba(140,242,68,.25)' : 'rgba(255,59,92,.25)'}`,
          borderRadius: 18,
          padding: '24px 20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: passed ? C.accent : C.err,
            letterSpacing: 3,
            fontWeight: 700,
            marginBottom: 12,
            textTransform: 'uppercase',
          }}
        >
          {passed
            ? 'Fase 2 Completada'
            : matched.length < active.length
            ? 'Fase 2 Fallida — ¡Tiempo agotado!'
            : `Fase 2 Fallida — límite de errores superado (máx ${maxErrorsAllowed})`}
        </div>
        {passed && (
          <div
            style={{
              fontFamily: C.mono,
              fontSize: 36,
              fontWeight: 900,
              color: C.accent,
              marginBottom: 4,
            }}
          >
            +{xp} XP
          </div>
        )}
        <div style={{ fontSize: 10, color: C.t2, marginBottom: 16 }}>
          {errors === 0
            ? '¡Sin errores!'
            : 'con ' + errors + ' error' + (errors > 1 ? 'es' : '') + (isHard ? ` (máx permitido: ${maxErrorsAllowed})` : '')}
        </div>
        {passed ? (
          <Btn onClick={() => onComplete(xp)}>SIGUIENTE FASE →</Btn>
        ) : (
          <Btn onClick={onFail}>VOLVER AL MAPA</Btn>
        )}
      </div>
    );
  }

  const tPct = (timeLeft / totalTime) * 100;
  const tColor = timeLeft > 12 ? C.teal : timeLeft > 6 ? C.warn : C.err;

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
            fontFamily: C.title,
            fontSize: 10,
            color: C.teal,
            letterSpacing: 3,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          Kana Match
        </div>
        <div style={{ fontSize: 10, color: C.t2, fontFamily: C.mono }}>
          {matched.length}/{active.length}
        </div>
      </div>

      {isHard && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                fontSize: 9,
                color: C.err,
                background: 'rgba(255,59,92,0.15)',
                border: '1px solid rgba(255,59,92,0.4)',
                padding: '2px 8px',
                borderRadius: 6,
                fontFamily: C.mono,
                fontWeight: 800,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
              }}
            >
              🔥 Modo Difícil — Tiempo Límite ({timeLeft}s) · Máx 2 Errores
            </div>
          </div>
          <div
            style={{
              height: 4,
              background: C.b2,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${tPct}%`,
                background: tColor,
                borderRadius: 2,
                transition: 'width 1s linear',
              }}
            />
          </div>
        </div>
      )}
      <div style={{ fontSize: 11, color: C.t2, textAlign: 'center' }}>
        Toca un par para conectarlos
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {active.map((p, i) => {
            const isM = matched.includes(i);
            const isSel = leftSel === i;
            const isW = wrong && wrong[0] === i;
            return (
              <button
                key={i}
                onClick={() => !isM && setLeftSel(isSel ? null : i)}
                className={isW ? 'shake' : ''}
                style={{
                  background: isM ? C.okD : isSel ? 'rgba(14,124,140,.18)' : C.s2,
                  border: `1px solid ${
                    isM ? C.ok : isSel ? C.teal : isW ? C.err : C.b2
                  }`,
                  borderRadius: 12,
                  padding: '13px 8px',
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  fontFamily: C.mono,
                  fontSize: fitFontSize(p.left, 13),
                  fontWeight: 600,
                  color: isM ? C.ok : isSel ? C.teal : C.t1,
                  opacity: isM ? 0.45 : 1,
                  transition: 'all .15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.left}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {rightOrder.map((origIdx, di) => {
            const isM = matched.includes(origIdx);
            const isSel = rightSel === di;
            const isW = wrong && wrong[1] === di;
            return (
              <button
                key={di}
                onClick={() => !isM && setRightSel(isSel ? null : di)}
                className={isW ? 'shake' : ''}
                style={{
                  background: isM ? C.okD : isSel ? 'rgba(14,124,140,.18)' : C.s2,
                  border: `1px solid ${
                    isM ? C.ok : isSel ? C.teal : isW ? C.err : C.b2
                  }`,
                  borderRadius: 12,
                  padding: '13px 8px',
                  height: 56,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  fontFamily: C.jp,
                  fontSize: fitFontSize(active[origIdx].right, 22),
                  fontWeight: 700,
                  color: isM ? C.ok : isSel ? C.teal : C.t1,
                  opacity: isM ? 0.45 : 1,
                  transition: 'all .15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {active[origIdx].right}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
