import { C } from '../styles/tokens';
import { MN } from '../core/content';
import { dynamicPassThreshold } from '../core/progression';
import { Btn } from '../components/Btn';
import { Ghost } from '../components/Ghost';
import {
  CyberSpeaker,
  CyberTarget,
  CyberWave,
  CyberGrid,
  CyberMemory,
  CyberCaution,
} from '../components/CyberIcons';
import { playPronunciation } from '../audio/tts';
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
                onClick={() => playPronunciation(reads[i] || '', ch, 'kana')}
                title="Haz clic para escuchar la pronunciación"
                style={{
                  textAlign: 'center',
                  background: C.s2,
                  border: `1px solid ${C.b2}`,
                  borderRadius: 14,
                  padding: '16px 14px',
                  minWidth: 58,
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'transform .15s ease, border-color .15s ease',
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
                    fontSize: 12,
                    color: C.accent,
                    fontFamily: C.mono,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                    marginTop: 8,
                  }}
                >
                  <CyberSpeaker size={12} color={C.accent} />
                  <span>{reads[i]}</span>
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

      {/* Objetivo pedagógico */}
      {lesson.objective && (
        <div
          className="fu3"
          style={{
            background: C.s1,
            border: `1px solid ${C.accent}44`,
            borderRadius: 14,
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 9,
              color: C.accent,
              letterSpacing: 2,
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            <CyberTarget size={12} color={C.accent} />
            <span>Objetivo Pedagógico</span>
          </div>
          <div style={{ fontSize: 13, color: C.t1, lineHeight: 1.6 }}>
            {lesson.objective}
          </div>
        </div>
      )}

      {/* Nota didáctica */}
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

      {/* Pitch Accent Note */}
      {lesson.pitchNote && (
        <div
          className="fu3"
          style={{
            background: C.s1,
            border: `1px solid ${C.b1}`,
            borderRadius: 14,
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 6,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 9,
                color: C.accent2,
                letterSpacing: 2,
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              <CyberWave size={12} color={C.accent2} />
              <span>Pitch Accent (Acento Tonal)</span>
            </div>
            <div
              style={{
                background: C.s2,
                color: C.accent,
                padding: '2px 8px',
                borderRadius: 6,
                fontSize: 10,
                fontFamily: C.mono,
                fontWeight: 700,
              }}
            >
              {lesson.pitchNote.pattern}
            </div>
          </div>
          <div style={{ fontSize: 12, color: C.t2, lineHeight: 1.6 }}>
            {lesson.pitchNote.desc}
          </div>
          {lesson.pitchNote.example && (
            <div style={{ fontSize: 11, fontFamily: C.jp, color: C.t1, marginTop: 6, fontWeight: 700 }}>
              Ejemplo: {lesson.pitchNote.example}
            </div>
          )}
        </div>
      )}

      {/* Tablas pedagógicas de referencia */}
      {lesson.tables && lesson.tables.map((table, tIdx) => (
        <div
          key={tIdx}
          className="fu3"
          style={{
            background: C.s1,
            border: `1px solid ${C.b1}`,
            borderRadius: 14,
            padding: 14,
            overflowX: 'auto',
          }}
        >
          {table.title && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: C.accent,
                fontWeight: 700,
                marginBottom: 8,
                letterSpacing: 1,
              }}
            >
              <CyberGrid size={12} color={C.accent} />
              <span>{table.title}</span>
            </div>
          )}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.b2}`, color: C.t2 }}>
                {table.headers.map((h, i) => (
                  <th key={i} style={{ padding: '6px 8px', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row, rIdx) => (
                <tr key={rIdx} style={{ borderBottom: rIdx < table.rows.length - 1 ? `1px solid ${C.b1}` : 'none' }}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: '8px', color: cIdx === 0 ? C.accent : C.t1, fontFamily: cIdx === 0 ? C.jp : 'inherit' }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Mnemotecnias estructuradas */}
      {lesson.mnemonicTips && (
        <div className="fu3" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 9,
              color: C.accent,
              letterSpacing: 2,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            <CyberMemory size={12} color={C.accent} />
            <span>Mnemotecnias Visuales y Narrativas</span>
          </div>
          {lesson.mnemonicTips.map((mn, idx) => (
            <div
              key={idx}
              style={{
                background: C.s2,
                border: `1px solid ${C.b1}`,
                borderRadius: 12,
                padding: '10px 14px',
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: C.jp,
                  fontSize: 24,
                  fontWeight: 800,
                  color: C.accent,
                  minWidth: 32,
                  textAlign: 'center',
                }}
              >
                {mn.char}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ fontSize: 10, color: C.t2, fontWeight: 600 }}>
                  Referencia: {mn.visual}
                </div>
                <div style={{ fontSize: 12, color: C.t1 }}>{mn.story}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Asociación previa */}
      {firstMn && !lesson.mnemonicTips && (
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

      {/* Tips / Advertencias didácticas */}
      {lesson.tips && lesson.tips.length > 0 && (
        <div
          className="fu3"
          style={{
            background: C.s1,
            border: `1px solid ${C.warn}33`,
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 9,
              color: C.warn,
              letterSpacing: 2,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            <CyberCaution size={12} color={C.warn} />
            <span>Puntos Clave</span>
          </div>
          {lesson.tips.map((tip, tIdx) => (
            <div
              key={tIdx}
              style={{
                fontSize: 12,
                color: C.t1,
                lineHeight: 1.5,
                paddingLeft: 10,
                borderLeft: `2px solid ${C.warn}66`,
              }}
            >
              {tip}
            </div>
          ))}
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
