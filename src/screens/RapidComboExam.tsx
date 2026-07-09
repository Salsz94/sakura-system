import { useState, useEffect, useRef } from 'react';
import { C } from '../styles/tokens';
import { Btn } from '../components/Btn';
import { playSound } from '../audio/soundManager';

interface RapidQuestion {
  kana: string;
  ans: string;
  opts: string[];
  hint: string;
}

interface RapidComboExamProps {
  questions: RapidQuestion[];
  onComplete: (xp: number) => void;
  onFail: () => void;
}

// ── RAPID COMBO (inline para examen) ─────────────────────────────
export function RapidComboExam({ questions, onComplete, onFail }: RapidComboExamProps) {
  const [idx, setIdx] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState<'ok' | 'err' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (done) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [done]);

  const answer = (i: number) => {
    if (done) return;
    const q = questions[idx];
    const ok = q.opts[i] === q.ans;
    setFlash(ok ? 'ok' : 'err');
    setTimeout(() => setFlash(null), 250);
    playSound(ok ? 'correct' : 'wrong');
    if (ok) {
      setCorrect((c) => c + 1);
      setCombo((c) => {
        const n = c + 1;
        setMaxCombo((m) => Math.max(m, n));
        return n;
      });
    } else setCombo(0);
    if (idx < questions.length - 1) setIdx((i) => i + 1);
    else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => setDone(true), 300);
    }
  };

  const xp = correct * 8 + (maxCombo >= 5 ? 20 : 0);
  const tPct = (timeLeft / 45) * 100;
  const tColor = timeLeft > 20 ? C.accent : timeLeft > 10 ? C.warn : C.err;
  const q = questions[idx];
  // Umbral por fase: antes 0 aciertos igual "completaba" la fase — el
  // examen solo se podía reprobar en el boss. Ahora exige 70%.
  const passNeeded = Math.ceil(questions.length * 0.7);
  const passed = correct >= passNeeded;

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
            marginBottom: 14,
            textTransform: 'uppercase',
          }}
        >
          {passed ? 'Fase 1 Completada' : `Fase 1 Fallida — necesitas ${passNeeded}/${questions.length}`}
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 8,
            marginBottom: 16,
          }}
        >
          {(
            [
              [correct, 'Correctas', C.ok],
              [
                questions.length - correct,
                'Errores',
                correct < questions.length ? C.err : C.ok,
              ],
              [maxCombo, 'Max Combo', C.accent],
            ] as [number, string, string][]
          ).map(([v, l, c]) => (
            <div
              key={l}
              style={{
                background: C.s2,
                border: `1px solid ${C.b1}`,
                borderRadius: 12,
                padding: '12px 8px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: 20,
                  fontWeight: 900,
                  color: c,
                  lineHeight: 1,
                }}
              >
                {v}
              </div>
              <div
                style={{
                  fontSize: 8,
                  color: C.t2,
                  letterSpacing: 1,
                  marginTop: 4,
                  textTransform: 'uppercase',
                }}
              >
                {l}
              </div>
            </div>
          ))}
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
        {passed && maxCombo >= 5 && (
          <div
            style={{
              fontSize: 9,
              color: C.ok,
              letterSpacing: 2,
              marginBottom: 14,
              textTransform: 'uppercase',
            }}
          >
            Combo Bonus +20 XP
          </div>
        )}
        {passed ? (
          <Btn onClick={() => onComplete(xp)}>SIGUIENTE FASE →</Btn>
        ) : (
          <Btn onClick={onFail}>VOLVER AL MAPA</Btn>
        )}
      </div>
    );
  }

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
            color: C.accent,
            letterSpacing: 3,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          Rapid Combo
        </div>
        {combo >= 2 && (
          <div
            style={{
              fontFamily: C.mono,
              fontSize: 9,
              color: C.warn,
              border: `1px solid rgba(255,59,92,.25)`,
              padding: '2px 8px',
              borderRadius: 20,
            }}
          >
            ×{combo} COMBO
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            flex: 1,
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
        <div
          style={{
            fontFamily: C.mono,
            fontSize: 12,
            color: tColor,
            fontWeight: 600,
          }}
        >
          {timeLeft}s
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
              background: i < idx ? C.ok : i === idx ? C.t1 : C.b2,
            }}
          />
        ))}
      </div>
      <div
        style={{
          background: C.s1,
          border: `1px solid ${
            flash === 'ok'
              ? 'rgba(140,242,68,.5)'
              : flash === 'err'
              ? 'rgba(255,59,92,.4)'
              : C.b1
          }`,
          borderRadius: 18,
          padding: '24px 18px',
          textAlign: 'center',
          transition: 'border .12s',
        }}
      >
        <div
          style={{
            fontFamily: C.jp,
            fontSize: 88,
            fontWeight: 900,
            color: C.t1,
            lineHeight: 1,
          }}
        >
          {q.kana}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {q.opts.map((opt, i) => (
          <button
            key={i}
            onClick={() => answer(i)}
            style={{
              background: C.s2,
              border: `1px solid ${C.b2}`,
              borderRadius: 12,
              padding: '16px',
              fontSize: 14,
              fontFamily: C.mono,
              fontWeight: 600,
              color: C.t1,
              transition: 'all .1s',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, color: C.t2, fontFamily: C.mono }}>
          {idx + 1}/{questions.length}
        </div>
        <div style={{ fontSize: 10, color: C.ok, fontFamily: C.mono }}>
          {correct} ✓
        </div>
      </div>
    </div>
  );
}
