import { C } from '../styles/tokens';
import { Btn } from '../components/Btn';
import { Ghost } from '../components/Ghost';
import { AdBanner } from '../components/AdBanner';
import type { ActiveLesson, Module } from '../core/types';
import type { Rank } from '../core/progression';

interface SummaryScreenProps {
  lesson: ActiveLesson;
  /** XP realmente otorgada (0 en repeticiones — sin farmeo). */
  awardedXp: number;
  errs: number;
  correct: number;
  rank: Rank;
  streak: number;
  modules: Module[];
  onMap: () => void;
  onRepeat: () => void;
}

// ════════════════════════════════════════════════════════════════
// SUMMARY
// ════════════════════════════════════════════════════════════════
export function SummaryScreen({
  lesson,
  awardedXp,
  errs,
  correct,
  rank,
  streak,
  modules,
  onMap,
  onRepeat,
}: SummaryScreenProps) {
  // Muestra la XP REALMENTE otorgada — antes sumaba sesXp + lesson.xp
  // aunque en repeticiones no se diera nada (el usuario veía +90 y
  // recibía +0).
  const total = awardedXp;
  const isRepeatRun = !lesson.isReview && awardedXp === 0;
  const mod = modules.find((m) => m.lessons.find((l) => l.id === lesson.id));
  const li = mod ? mod.lessons.findIndex((l) => l.id === lesson.id) : -1;
  const next = mod && li < mod.lessons.length - 1 ? mod.lessons[li + 1] : null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        className="fu"
        style={{
          fontFamily: C.title,
          fontSize: 10,
          color: C.ok,
          letterSpacing: 3,
          fontWeight: 700,
          textTransform: 'uppercase',
        }}
      >
        {lesson.isReview ? 'Repaso Completado' : 'Lección Aprobada'}
      </div>
      <div
        className="fu2 corner-frame"
        style={{
          background: C.s1,
          border: `1px solid rgba(140,242,68,.18)`,
          borderRadius: 18,
          padding: '26px 20px',
          textAlign: 'center',
          boxShadow: `0 0 28px 2px rgba(140,242,68,.04)`,
        }}
      >
        <img
          src="/animaciones/celebracion.gif"
          alt="Celebración Lección"
          style={{
            width: 80,
            height: 80,
            objectFit: 'contain',
            imageRendering: 'pixelated',
            margin: '0 auto 10px auto',
            display: 'block',
          }}
        />
        <div
          style={{
            fontFamily: C.mono,
            fontSize: 52,
            fontWeight: 900,
            color: C.accent,
            letterSpacing: -2,
            lineHeight: 1,
          }}
        >
          +{total}
        </div>
        <div
          style={{
            fontSize: 9,
            color: C.t2,
            letterSpacing: 2,
            marginTop: 6,
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          {isRepeatRun ? 'Práctica · sin XP en repeticiones' : `XP · ${rank.l}`}
        </div>
      </div>
      <div
        className="fu3"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}
      >
        {(
          [
            [correct, 'Correctas', C.ok],
            [errs, 'Errores', errs > 0 ? C.err : C.ok],
            [streak, 'Racha', C.accent],
          ] as [number, string, string][]
        ).map(([v, l, c]) => (
          <div
            key={l}
            style={{
              background: C.s1,
              border: `1px solid ${C.b1}`,
              borderRadius: 12,
              padding: '14px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: c,
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
      {!lesson.isReview && errs === 0 && correct > 0 && (
        <div
          style={{
            textAlign: 'center',
            fontSize: 9,
            letterSpacing: 2,
            color: C.ok,
            border: `1px solid rgba(140,242,68,.17)`,
            borderRadius: 8,
            padding: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            fontFamily: C.mono,
          }}
        >
          Perfect Clear · Sin errores
        </div>
      )}
      {lesson.chars && lesson.chars.length > 0 && (
        <div
          className="fu4"
          style={{
            background: C.s1,
            border: `1px solid ${C.b1}`,
            borderRadius: 14,
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontSize: 8,
              color: C.t2,
              letterSpacing: 2,
              fontWeight: 700,
              marginBottom: 11,
              textTransform: 'uppercase',
            }}
          >
            Caracteres de Hoy
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {lesson.chars.slice(0, 8).map((ch, i) => (
              <div
                key={i}
                style={{
                  textAlign: 'center',
                  background: C.s2,
                  border: `1px solid ${C.b1}`,
                  borderRadius: 10,
                  padding: '10px 11px',
                  minWidth: 46,
                }}
              >
                <div
                  style={{
                    fontFamily: C.jp,
                    fontSize: 26,
                    color: C.t1,
                    fontWeight: 700,
                  }}
                >
                  {ch}
                </div>
                <div
                  style={{
                    fontFamily: C.mono,
                    fontSize: 9,
                    color: C.accent,
                    marginTop: 4,
                  }}
                >
                  {lesson.reads?.[i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {next && (
        <div
          style={{
            background: C.s2,
            border: `1px solid ${C.b1}`,
            borderRadius: 12,
            padding: '13px 15px',
          }}
        >
          <div
            style={{
              fontSize: 8,
              color: C.t2,
              letterSpacing: 2,
              fontWeight: 700,
              marginBottom: 5,
              textTransform: 'uppercase',
            }}
          >
            Siguiente
          </div>
          <div
            style={{
              fontFamily: C.jp,
              fontSize: 16,
              color: C.t1,
              fontWeight: 700,
            }}
          >
            {next.t}
          </div>
          <div
            style={{
              fontFamily: C.mono,
              fontSize: 10,
              color: C.t2,
              marginTop: 2,
            }}
          >
            {next.s}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <Ghost onClick={onRepeat} style={{ flex: 1 }}>
          Repetir
        </Ghost>
        <Btn onClick={onMap} style={{ flex: 2 }}>
          Siguiente →
        </Btn>
      </div>
    </div>
  );
}
