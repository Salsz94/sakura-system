import { C } from '../styles/tokens';
import { MN } from '../core/content';
import { dynamicPassThreshold } from '../core/progression';
import { Btn } from '../components/Btn';
import { Ghost } from '../components/Ghost';
import type { ActiveLesson } from '../core/types';

interface IntroScreenProps {
  lesson: ActiveLesson;
  modLives: number;
  onStart: () => void;
  onBack: () => void;
}

// ════════════════════════════════════════════════════════════════
// INTRO
// ════════════════════════════════════════════════════════════════
export function IntroScreen({ lesson, modLives, onStart, onBack }: IntroScreenProps) {
  const chars = (lesson.chars || []).slice(0, 8);
  const reads = (lesson.reads || []).slice(0, 8);
  const firstMn = chars.length > 0 ? MN[chars[0]] : null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        className="fu"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Ghost onClick={onBack}>← Volver</Ghost>
        <div
          style={{
            fontSize: 8,
            color: C.accent,
            letterSpacing: 3,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          Lección
        </div>
      </div>

      {/* Caracteres hero */}
      {chars.length > 0 && (
        <div
          className="fu2 corner-frame"
          style={{
            background: C.s1,
            border: `1px solid ${C.b1}`,
            borderRadius: 18,
            padding: '22px 18px',
          }}
        >
          <div
            style={{
              fontFamily: C.jp,
              fontSize: 18,
              fontWeight: 900,
              color: C.t1,
              marginBottom: 3,
            }}
          >
            {lesson.t}
          </div>
          <div
            style={{
              fontSize: 11,
              fontFamily: C.mono,
              color: C.t2,
              marginBottom: 18,
              letterSpacing: 0.5,
            }}
          >
            {lesson.s}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {chars.map((ch, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  background: C.s2,
                  border: `1px solid ${C.b2}`,
                  borderRadius: 14,
                  padding: '16px 14px',
                  minWidth: 58,
                }}
              >
                <div
                  style={{
                    fontFamily: C.jp,
                    fontSize: 38,
                    color: C.t1,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {ch}
                </div>
                <div
                  style={{
                    fontFamily: C.mono,
                    fontSize: 12,
                    color: C.accent,
                    marginTop: 8,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                  }}
                >
                  {reads[i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vocab preview */}
      {lesson.vocab && !chars.length && (
        <div
          className="fu2"
          style={{
            background: C.s1,
            border: `1px solid ${C.b1}`,
            borderRadius: 18,
            padding: '20px',
          }}
        >
          <div
            style={{
              fontFamily: C.jp,
              fontSize: 16,
              fontWeight: 800,
              color: C.t1,
              marginBottom: 14,
            }}
          >
            {lesson.t}
          </div>
          {lesson.vocab.slice(0, 3).map((v, i) => (
            <div
              key={i}
              style={{
                borderBottom: i < 2 ? `1px solid ${C.b1}` : 'none',
                paddingBottom: i < 2 ? 12 : 0,
                marginBottom: i < 2 ? 12 : 0,
              }}
            >
              <div
                style={{
                  fontFamily: C.jp,
                  fontSize: 16,
                  color: C.t1,
                  fontWeight: 600,
                }}
              >
                {v.jp}
              </div>
              <div style={{ fontSize: 12, color: C.t2, marginTop: 4 }}>
                {v.es}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nota — grande y sin label */}
      <div
        className="fu3"
        style={{
          background: C.s2,
          border: `1px solid ${C.b1}`,
          borderRadius: 14,
          padding: '18px 16px',
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: C.t1,
            lineHeight: 1.95,
            fontWeight: 300,
          }}
        >
          {lesson.note}
        </div>
      </div>

      {/* Asociación */}
      {firstMn && (
        <div
          className="fu3"
          style={{
            background: C.aS,
            border: `1px solid rgba(140,242,68,.14)`,
            borderRadius: 14,
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontSize: 8,
              color: C.accent,
              letterSpacing: 2.5,
              fontWeight: 700,
              marginBottom: 7,
              textTransform: 'uppercase',
            }}
          >
            Asociación · {chars[0]}
          </div>
          <div style={{ fontSize: 13, color: C.t1, lineHeight: 1.8 }}>
            {firstMn}
          </div>
        </div>
      )}

      <div
        className="fu4"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}
      >
        {[
          ['Ejercicios', lesson.exercises?.length || 5],
          [
            'Necesitas',
            `${dynamicPassThreshold(lesson.exercises?.length || 0)}/${
              lesson.exercises?.length || 5
            }`,
          ],
          ['XP', `+${lesson.xp}`],
        ].map(([l, v]) => (
          <div
            key={l}
            style={{
              background: C.s1,
              border: `1px solid ${C.b1}`,
              borderRadius: 12,
              padding: '12px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: C.t1,
                fontFamily: C.mono,
              }}
            >
              {v}
            </div>
            <div
              style={{
                fontSize: 8,
                color: C.t2,
                letterSpacing: 2,
                marginTop: 4,
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {l}
            </div>
          </div>
        ))}
      </div>
      {/* Vidas restantes */}
      {modLives < 3 && (
        <div
          className="fu5"
          style={{
            background: 'rgba(255,59,92,.07)',
            border: '1px solid rgba(255,59,92,.2)',
            borderRadius: 12,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', gap: 5 }}>
            {[1, 2, 3].map((h) => (
              <div
                key={h}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: h <= modLives ? C.err : C.b2,
                  transform: 'rotate(45deg)',
                  transition: 'background .3s',
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.err, fontWeight: 600 }}>
            {modLives === 2
              ? '2 vidas restantes — si fallas pierdes otra'
              : modLives === 1
              ? '¡ÚLTIMA VIDA — un fallo resetea el módulo!'
              : ''}
          </div>
        </div>
      )}
      <div className="fu5">
        <Btn onClick={onStart}>COMENZAR BATALLA</Btn>
      </div>
    </div>
  );
}
