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

// ── COMPONENTE DE DIAGRAMAS GRAMATICALES VISUALES ─────────────
function renderVisualBlueprint(lesson: ActiveLesson) {
  const id = lesson.id || '';
  
  // 1. KOSOADO Demostrativos (Objetos y Lugares)
  if (id === 'm3l6' || id === 'm3l7' || id === 'm3l4' || id === 'm3l5') {
    return (
      <div className="fu2" style={{ background: C.s1, border: `1px solid ${C.accent}44`, borderRadius: 16, padding: '16px 14px' }}>
        <div style={{ fontSize: 9, color: C.accent, letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <CyberGrid size={13} color={C.accent} />
          <span>Mapa de Distancia Demostrativa (KO-SO-A-DO)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, textAlign: 'center' }}>
          <div style={{ background: C.aD, border: `1px solid ${C.accent}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontFamily: C.jp, fontSize: 15, fontWeight: 900, color: C.accent }}>これ (Kore)</div>
            <div style={{ fontSize: 9, color: C.t1, marginTop: 4, fontWeight: 600 }}>Cerca del hablante</div>
          </div>
          <div style={{ background: C.s2, border: `1px solid ${C.b1}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontFamily: C.jp, fontSize: 15, fontWeight: 800, color: C.t1 }}>それ (Sore)</div>
            <div style={{ fontSize: 9, color: C.t2, marginTop: 4 }}>Cerca del oyente</div>
          </div>
          <div style={{ background: C.s2, border: `1px solid ${C.b1}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontFamily: C.jp, fontSize: 15, fontWeight: 800, color: C.t1 }}>あれ (Are)</div>
            <div style={{ fontSize: 9, color: C.t2, marginTop: 4 }}>Lejos de ambos</div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Sintaxis u Oraciones (Múltiples elementos / Partículas)
  if (id.startsWith('m3') || id === 'm5l3') {
    return (
      <div className="fu2" style={{ background: C.s1, border: `1px solid ${C.accent}44`, borderRadius: 16, padding: '16px 14px' }}>
        <div style={{ fontSize: 9, color: C.accent, letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <CyberGrid size={13} color={C.accent} />
          <span>Esquema Visual de Sintaxis Japonesa (S + O + V)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 6, alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: C.s2, border: `1px solid ${C.b1}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 8, color: C.t2, textTransform: 'uppercase', fontWeight: 600 }}>Sujeto</div>
            <div style={{ fontFamily: C.jp, fontSize: 13, fontWeight: 800, color: C.accent, marginTop: 2 }}>わたし</div>
            <div style={{ fontSize: 9, color: C.t2 }}>Yo</div>
          </div>
          <div style={{ fontSize: 11, color: C.accent, fontWeight: 900 }}>+</div>
          <div style={{ background: C.aD, border: `1px solid ${C.accent}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 8, color: C.accent, textTransform: 'uppercase', fontWeight: 700 }}>Partícula</div>
            <div style={{ fontFamily: C.jp, fontSize: 14, fontWeight: 900, color: C.accent, marginTop: 2 }}>は WA</div>
            <div style={{ fontSize: 9, color: C.t2 }}>Tema</div>
          </div>
          <div style={{ fontSize: 11, color: C.accent, fontWeight: 900 }}>+</div>
          <div style={{ background: C.s2, border: `1px solid ${C.b1}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 8, color: C.t2, textTransform: 'uppercase', fontWeight: 600 }}>Predicado</div>
            <div style={{ fontFamily: C.jp, fontSize: 13, fontWeight: 800, color: C.t1, marginTop: 2 }}>がくせい です</div>
            <div style={{ fontSize: 9, color: C.t2 }}>Soy estudiante</div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Números (Decenas, Centenas, Miles)
  if (id.startsWith('m4l1')) {
    return (
      <div className="fu2" style={{ background: C.s1, border: `1px solid ${C.accent}44`, borderRadius: 16, padding: '16px 14px' }}>
        <div style={{ fontSize: 9, color: C.accent, letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <CyberTarget size={13} color={C.accent} />
          <span>Fórmula Numérica Visual (Japonés ➔ Dígitos)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 6, alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: C.s2, border: `1px solid ${C.b1}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 8, color: C.t2, textTransform: 'uppercase', fontWeight: 600 }}>Decena (10)</div>
            <div style={{ fontFamily: C.jp, fontSize: 14, fontWeight: 800, color: C.accent, marginTop: 2 }}>じゅう</div>
            <div style={{ fontSize: 9, color: C.t2 }}>10</div>
          </div>
          <div style={{ fontSize: 13, color: C.accent, fontWeight: 900 }}>+</div>
          <div style={{ background: C.s2, border: `1px solid ${C.b1}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 8, color: C.t2, textTransform: 'uppercase', fontWeight: 600 }}>Unidad (5)</div>
            <div style={{ fontFamily: C.jp, fontSize: 14, fontWeight: 800, color: C.t1, marginTop: 2 }}>ご</div>
            <div style={{ fontSize: 9, color: C.t2 }}>5</div>
          </div>
          <div style={{ fontSize: 13, color: C.accent, fontWeight: 900 }}>=</div>
          <div style={{ background: C.aD, border: `1px solid ${C.accent}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 8, color: C.accent, textTransform: 'uppercase', fontWeight: 700 }}>Total (15)</div>
            <div style={{ fontFamily: C.jp, fontSize: 14, fontWeight: 900, color: C.accent, marginTop: 2 }}>じゅうご</div>
            <div style={{ fontSize: 9, color: C.t2 }}>15</div>
          </div>
        </div>
      </div>
    );
  }

  // 3. KOSOADO Demostrativos
  if (id === 'm3l4' || id === 'm3l5') {
    return (
      <div className="fu2" style={{ background: C.s1, border: `1px solid ${C.accent}44`, borderRadius: 16, padding: '16px 14px' }}>
        <div style={{ fontSize: 9, color: C.accent, letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <CyberGrid size={13} color={C.accent} />
          <span>Mapa de Distancia Demostrativa (KO-SO-A-DO)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, textAlign: 'center' }}>
          <div style={{ background: C.aD, border: `1px solid ${C.accent}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontFamily: C.jp, fontSize: 15, fontWeight: 900, color: C.accent }}>これ (Kore)</div>
            <div style={{ fontSize: 9, color: C.t1, marginTop: 4, fontWeight: 600 }}>Cerca del hablante</div>
          </div>
          <div style={{ background: C.s2, border: `1px solid ${C.b1}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontFamily: C.jp, fontSize: 15, fontWeight: 800, color: C.t1 }}>それ (Sore)</div>
            <div style={{ fontSize: 9, color: C.t2, marginTop: 4 }}>Cerca del oyente</div>
          </div>
          <div style={{ background: C.s2, border: `1px solid ${C.b1}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontFamily: C.jp, fontSize: 15, fontWeight: 800, color: C.t1 }}>あれ (Are)</div>
            <div style={{ fontSize: 9, color: C.t2, marginTop: 4 }}>Lejos de ambos</div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Verbos (m5l1, m5l2)
  if (id.startsWith('m5')) {
    return (
      <div className="fu2" style={{ background: C.s1, border: `1px solid ${C.accent}44`, borderRadius: 16, padding: '16px 14px' }}>
        <div style={{ fontSize: 9, color: C.accent, letterSpacing: 2, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <CyberWave size={13} color={C.accent} />
          <span>Esquema de Conjugación Verbal (-MASU)</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 6, alignItems: 'center', textAlign: 'center' }}>
          <div style={{ background: C.s2, border: `1px solid ${C.b1}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 8, color: C.t2, textTransform: 'uppercase', fontWeight: 600 }}>Raíz Verbal</div>
            <div style={{ fontFamily: C.jp, fontSize: 13, fontWeight: 800, color: C.t1, marginTop: 2 }}>たべ- (Tabe)</div>
            <div style={{ fontSize: 9, color: C.t2 }}>Comer</div>
          </div>
          <div style={{ fontSize: 13, color: C.accent, fontWeight: 900 }}>+</div>
          <div style={{ background: C.aD, border: `1px solid ${C.accent}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 8, color: C.accent, textTransform: 'uppercase', fontWeight: 700 }}>Sufijo Formal</div>
            <div style={{ fontFamily: C.jp, fontSize: 13, fontWeight: 900, color: C.accent, marginTop: 2 }}>ます (-masu)</div>
            <div style={{ fontSize: 9, color: C.t2 }}>Presente</div>
          </div>
          <div style={{ fontSize: 13, color: C.accent, fontWeight: 900 }}>=</div>
          <div style={{ background: C.s2, border: `1px solid ${C.b1}`, borderRadius: 10, padding: '10px 4px' }}>
            <div style={{ fontSize: 8, color: C.t2, textTransform: 'uppercase', fontWeight: 600 }}>Forma Final</div>
            <div style={{ fontFamily: C.jp, fontSize: 13, fontWeight: 800, color: C.t1, marginTop: 2 }}>たべます</div>
            <div style={{ fontSize: 9, color: C.t2 }}>Como / Comeré</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// ════════════════════════════════════════════════════════════════
// INTRO
// ════════════════════════════════════════════════════════════════
export function IntroScreen({ lesson, modLives, onStart, onBack }: IntroScreenProps) {
  const chars = (lesson.chars || []).slice(0, 8);
  const reads = (lesson.reads || []).slice(0, 8);
  const firstMn = chars.length > 0 ? MN[chars[0]] : null;
  const noteBullets = (lesson.note || '')
    .split('.')
    .map((s) => s.trim())
    .filter(Boolean);

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

      {/* Diagrama gramatical visual autogenerado si aplica */}
      {renderVisualBlueprint(lesson)}

      {/* Caracteres hero con audio interactivo */}
      {chars.length > 0 && (
        <div
          className="fu2 corner-frame"
          style={{
            background: C.s1,
            border: `1px solid ${C.b1}`,
            borderRadius: 18,
            padding: '20px 16px',
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
              marginBottom: 16,
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
                  padding: '14px 12px',
                  minWidth: 54,
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'transform .15s ease, border-color .15s ease',
                }}
              >
                <div
                  style={{
                    fontFamily: C.jp,
                    fontSize: 34,
                    color: C.t1,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {ch}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: C.accent,
                    fontFamily: C.mono,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 3,
                    marginTop: 6,
                  }}
                >
                  <CyberSpeaker size={11} color={C.accent} />
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
            padding: '18px',
          }}
        >
          <div
            style={{
              fontFamily: C.jp,
              fontSize: 15,
              fontWeight: 800,
              color: C.t1,
              marginBottom: 12,
            }}
          >
            {lesson.t}
          </div>
          {lesson.vocab.slice(0, 3).map((v, i) => (
            <div
              key={i}
              style={{
                borderBottom: i < 2 ? `1px solid ${C.b1}` : 'none',
                paddingBottom: i < 2 ? 10 : 0,
                marginBottom: i < 2 ? 10 : 0,
              }}
            >
              <div
                style={{
                  fontFamily: C.jp,
                  fontSize: 15,
                  color: C.t1,
                  fontWeight: 600,
                }}
              >
                {v.jp}
              </div>
              <div style={{ fontSize: 11, color: C.t2, marginTop: 2 }}>
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
            <span>Objetivo Didáctico Clave</span>
          </div>
          <div style={{ fontSize: 13, color: C.t1, fontWeight: 600, lineHeight: 1.5 }}>
            {lesson.objective}
          </div>
        </div>
      )}

      {/* Puntos Didácticos en Formato Chips Visuales (remplaza párrafos densos) */}
      <div
        className="fu3"
        style={{
          background: C.s2,
          border: `1px solid ${C.b1}`,
          borderRadius: 14,
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 9,
            color: C.t2,
            letterSpacing: 2,
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: 2,
          }}
        >
          Claves Rápidas de la Lección
        </div>
        {noteBullets.map((bullet, bIdx) => (
          <div
            key={bIdx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              background: C.s1,
              border: `1px solid ${C.b2}`,
              borderRadius: 10,
              padding: '10px 12px',
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: bIdx === 0 ? C.accent : C.t2,
                marginTop: 6,
                flexShrink: 0,
              }}
            />
            <div style={{ fontSize: 12, color: C.t1, lineHeight: 1.55 }}>
              {bullet}
            </div>
          </div>
        ))}
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
