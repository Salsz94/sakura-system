import { C } from '../styles/tokens';
import { MN } from '../core/content';
import { Btn } from '../components/Btn';
import { Ghost } from '../components/Ghost';
import type { ActiveLesson } from '../core/types';

interface FailScreenProps {
  lesson: ActiveLesson;
  correct: number;
  minPass: number;
  total: number;
  modLives: number;
  onRetry: () => void;
  onMap: () => void;
}

// ════════════════════════════════════════════════════════════════
// FAIL
// ════════════════════════════════════════════════════════════════
export function FailScreen({
  lesson,
  correct,
  minPass,
  total,
  modLives,
  onRetry,
  onMap,
}: FailScreenProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        className="fu"
        style={{
          fontSize: 8,
          color: C.err,
          letterSpacing: 3,
          fontWeight: 700,
          textTransform: 'uppercase',
        }}
      >
        Lección No Superada
      </div>
      <div
        className="fu2 fail corner-frame corner-frame-err"
        style={{
          background: C.s1,
          border: `1px solid rgba(255,59,92,.18)`,
          borderRadius: 18,
          padding: '26px 20px',
          textAlign: 'center',
        }}
      >
        <img
          src="/animaciones/sin corazones.gif"
          alt="Sin corazones"
          style={{
            width: 90,
            height: 90,
            objectFit: 'contain',
            imageRendering: 'pixelated',
            margin: '0 auto 12px auto',
            display: 'block',
          }}
        />
        <div
          style={{
            fontFamily: C.mono,
            fontSize: 44,
            fontWeight: 900,
            color: C.err,
            lineHeight: 1,
          }}
        >
          {correct}/{total}
        </div>
        <div
          style={{
            fontSize: 11,
            color: C.t2,
            marginTop: 8,
            letterSpacing: 0.5,
          }}
        >
          Necesitas {minPass} correctas para avanzar
        </div>
      </div>
      <div
        className="fu3"
        style={{
          background: C.s1,
          border: `1px solid ${C.b1}`,
          borderRadius: 14,
          padding: '18px',
        }}
      >
        <div
          style={{
            fontSize: 14,
            color: C.t1,
            lineHeight: 1.9,
            fontWeight: 300,
          }}
        >
          {lesson.note}
        </div>
        {lesson.chars && MN[lesson.chars[0]] && (
          <div
            style={{
              borderTop: `1px solid ${C.b1}`,
              paddingTop: 13,
              marginTop: 13,
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
              Asociación
            </div>
            <div style={{ fontSize: 13, color: C.t1, lineHeight: 1.8 }}>
              {MN[lesson.chars[0]]}
            </div>
          </div>
        )}
      </div>
      {/* Estado de vidas */}
      <div
        style={{
          background:
            modLives <= 1 ? 'rgba(255,59,92,.08)' : 'rgba(255,59,92,.04)',
          border: `1px solid ${
            modLives <= 1 ? 'rgba(255,59,92,.3)' : 'rgba(255,59,92,.15)'
          }`,
          borderRadius: 12,
          padding: '14px 16px',
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
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: 11,
            color: modLives <= 1 ? C.err : C.t2,
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          {modLives === 0
            ? 'Módulo reseteado — vuelve al mapa'
            : modLives === 1
            ? '¡ÚLTIMA VIDA restante!'
            : `${modLives} vidas restantes en este módulo`}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Ghost onClick={onMap} style={{ flex: 1 }}>
          Volver
        </Ghost>
        {modLives > 0 && (
          <Btn onClick={onRetry} style={{ flex: 2 }}>
            Intentar de Nuevo
          </Btn>
        )}
        {modLives === 0 && (
          <Btn onClick={onMap} style={{ flex: 2 }}>
            Volver
          </Btn>
        )}
      </div>
    </div>
  );
}
