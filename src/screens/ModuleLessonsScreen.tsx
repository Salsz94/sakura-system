import { C } from '../styles/tokens';
import { Ghost } from '../components/Ghost';
import { CyberLock } from '../components/CyberIcons';
import type { Module, Lesson, MasteryMap } from '../core/types';

interface ModuleLessonsScreenProps {
  mod: Module;
  doneLs: string[];
  mastery: MasteryMap;
  isExamUnlocked: (mod: Module) => boolean;
  isExamPassed: (mod: Module) => boolean;
  onSelect: (lesson: Lesson, repeat: boolean) => void;
  onExam: (mod: Module, difficulty?: 'normal' | 'hard') => void;
  onBack: () => void;
}

// ════════════════════════════════════════════════════════════════
// MODULE LESSONS — lecciones de un solo módulo + boss (examen) al final
// ════════════════════════════════════════════════════════════════
export function ModuleLessonsScreen({
  mod,
  doneLs,
  mastery,
  isExamUnlocked,
  isExamPassed,
  onSelect,
  onExam,
  onBack,
}: ModuleLessonsScreenProps) {
  const examReady = isExamUnlocked(mod);
  const examDone = isExamPassed(mod);
  const mDone = mod.lessons.filter((l) => doneLs.includes(l.id)).length;
  const mPct = mod.lessons.length > 0 ? Math.round((mDone / mod.lessons.length) * 100) : 0;

  const firstUncompletedIdx = mod.lessons.findIndex((l) => !doneLs.includes(l.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        className="fu"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Ghost onClick={onBack}>← Mapa</Ghost>
        <div
          style={{
            fontSize: 8,
            letterSpacing: 3,
            color: mod.color,
            fontWeight: 700,
            textTransform: 'uppercase',
          }}
        >
          Bloque {mod.block}
        </div>
      </div>

      <div
        className="fu2 corner-frame"
        style={{
          background: C.s1,
          border: `1px solid ${C.b1}`,
          borderRadius: 16,
          padding: '16px 18px',
        }}
      >
        <div style={{ fontSize: 9, color: C.t2, letterSpacing: 1, marginBottom: 3, fontWeight: 500 }}>
          {mod.title} · {mod.lessons.length} lecciones
        </div>
        <div style={{ fontFamily: C.title, fontSize: 18, fontWeight: 800, color: examDone ? C.ok : C.t1 }}>
          {mod.sub}
        </div>
        <div style={{ height: 3, background: C.b2, borderRadius: 1, overflow: 'hidden', marginTop: 12 }}>
          <div
            style={{
              height: '100%',
              width: `${mPct}%`,
              background: `linear-gradient(90deg,${mod.color},#98D96A)`,
              borderRadius: 1,
              transition: 'width 1s ease',
            }}
          />
        </div>
        <div style={{ fontSize: 10, color: C.t2, fontFamily: C.mono, marginTop: 6 }}>
          {mDone}/{mod.lessons.length} completadas
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {mod.lessons.map((les, li) => {
          const isDone = doneLs.includes(les.id);
          // Si el módulo fue completado (examen aprobado), se puede elegir cualquier lecciones libremente.
          // Si está en progreso, solo se puede jugar la siguiente lección en orden secuencial.
          const avail = examDone ? true : li === firstUncompletedIdx;
          const isCurrentTarget = !examDone && li === firstUncompletedIdx;

          const avg = les.chars?.length
            ? Math.round(
                les.chars.reduce((a, c) => a + (mastery[c]?.score || 0), 0) / les.chars.length
              )
            : 0;

          return (
            <button
              key={les.id}
              disabled={!avail}
              onClick={() => avail && onSelect(les, false)}
              className="fu"
              style={{
                width: '100%',
                textAlign: 'left',
                background: !avail
                  ? '#090b10'
                  : isDone
                  ? C.aD
                  : C.s1,
                border: !avail
                  ? '1px dashed rgba(255,255,255,0.12)'
                  : isCurrentTarget
                  ? `1px solid ${C.accent}`
                  : isDone
                  ? '1px solid rgba(140,242,68,.22)'
                  : `1px solid ${C.b1}`,
                boxShadow: isCurrentTarget ? `0 0 16px rgba(255,0,205,0.25)` : 'none',
                borderRadius: 12,
                padding: '11px 14px',
                filter: !avail ? 'grayscale(100%)' : 'none',
                opacity: !avail ? 0.45 : 1,
                cursor: avail ? 'pointer' : 'not-allowed',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all .18s',
                animationDelay: `${li * 0.03}s`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: !avail
                      ? '#151922'
                      : isDone
                      ? mod.color || C.accent
                      : isCurrentTarget
                      ? C.accent
                      : C.b2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 800,
                    color: !avail
                      ? C.t3
                      : isDone
                      ? '#04000D'
                      : isCurrentTarget
                      ? '#FFFFFF'
                      : C.t2,
                    boxShadow: isCurrentTarget ? `0 0 8px ${C.accent}` : 'none',
                  }}
                >
                  {!avail ? <CyberLock size={12} color="#666666" /> : isDone ? '✓' : li + 1}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: C.jp,
                      fontSize: 14,
                      color: !avail ? C.t3 : C.t1,
                      fontWeight: 600,
                      lineHeight: 1.3,
                    }}
                  >
                    {les.t}
                  </div>
                  <div style={{ fontSize: 10, color: C.t2, marginTop: 2, fontFamily: C.mono }}>
                    {les.s}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                {isCurrentTarget && (
                  <span
                    style={{
                      fontSize: 9,
                      color: C.accent,
                      fontWeight: 800,
                      letterSpacing: 1.5,
                      fontFamily: C.mono,
                      background: C.aD,
                      padding: '3px 8px',
                      borderRadius: 4,
                      border: `1px solid ${C.accent}`,
                      boxShadow: `0 0 8px rgba(255,0,205,0.3)`,
                    }}
                  >
                    ▶ JUGAR
                  </span>
                )}
                {!avail && (
                  <span style={{ fontSize: 9, color: C.t3, fontFamily: C.mono, letterSpacing: 0.5 }}>
                    🔒 BLOQUEADO
                  </span>
                )}
                {avail && !isCurrentTarget && (
                  <div style={{ fontSize: 10, color: mod.color || C.accent, fontFamily: C.mono, fontWeight: 600 }}>
                    +{les.xp} XP
                  </div>
                )}
                {isDone && avg > 0 && (
                  <div style={{ fontSize: 8, color: C.t2, fontFamily: C.mono }}>{avg}%</div>
                )}
                {isDone && examDone && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(les, true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        e.preventDefault();
                        onSelect(les, true);
                      }
                    }}
                    style={{
                      fontSize: 8,
                      color: C.t2,
                      border: `1px solid ${C.b2}`,
                      padding: '2px 6px',
                      borderRadius: 3,
                      letterSpacing: 1,
                      background: 'transparent',
                      fontFamily: C.mono,
                      cursor: 'pointer',
                    }}
                  >
                    REPETIR
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {examReady && !examDone && (
        <button
          onClick={() => onExam(mod, 'normal')}
          className="fu corner-frame"
          style={{
            width: '100%',
            textAlign: 'left',
            background: C.aD,
            border: '1px solid rgba(140,242,68,.4)',
            borderRadius: 14,
            padding: '16px 18px',
            marginTop: 4,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            animation: 'pulse 2.5s ease infinite',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: C.aD,
                border: `1px solid ${C.accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                color: C.accent,
              }}
            >
              EX
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>
                Boss — Examen Final
              </div>
              <div style={{ fontSize: 10, color: C.t2, marginTop: 1 }}>
                3 fases: Rapid · Match · Boss
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: C.accent, fontFamily: C.mono, fontWeight: 700 }}>
            +{mod.xpE}
          </div>
        </button>
      )}

      {examDone && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {/* Card de Boss Aprobado (con opción de repetir normal) */}
          <div
            className="fu corner-frame"
            style={{
              background: C.okD,
              border: '1px solid rgba(140,242,68,.28)',
              borderRadius: 14,
              padding: '13px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: C.ok,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 15,
                  color: '#04000D',
                  fontWeight: 900,
                }}
              >
                ✓
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.ok }}>
                  Boss — Examen Final Aprobado
                </div>
                <div style={{ fontSize: 10, color: C.t2 }}>
                  Módulo completado exitosamente
                </div>
              </div>
            </div>
            <button
              onClick={() => onExam(mod, 'normal')}
              style={{
                fontSize: 9,
                color: C.t2,
                border: `1px solid ${C.b2}`,
                padding: '4px 8px',
                borderRadius: 4,
                letterSpacing: 1,
                background: 'transparent',
                fontFamily: C.mono,
                cursor: 'pointer',
              }}
            >
              MODO NORMAL
            </button>
          </div>

          {/* Botón de Revancha: Modo Difícil (Recycled Boss) */}
          <button
            onClick={() => onExam(mod, 'hard')}
            className="fu corner-frame corner-frame-err"
            style={{
              width: '100%',
              textAlign: 'left',
              background: 'linear-gradient(135deg, rgba(220,38,38,0.2) 0%, rgba(124,58,237,0.18) 100%)',
              border: '1px solid rgba(255,59,92,0.5)',
              borderRadius: 14,
              padding: '15px 16px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: '0 0 16px rgba(255,59,92,0.22)',
              transition: 'all .2s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'rgba(255,59,92,0.28)',
                  border: '1px solid #FF3B5C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 17,
                }}
              >
                ⚔️
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#FF3B5C' }}>
                    REVANCHA: MODO DIFÍCIL
                  </span>
                  <span
                    style={{
                      fontSize: 8,
                      background: '#FF3B5C',
                      color: '#FFFFFF',
                      padding: '1px 5px',
                      borderRadius: 3,
                      fontWeight: 900,
                      letterSpacing: 0.5,
                    }}
                  >
                    HARD 🔥
                  </span>
                </div>
                <div style={{ fontSize: 10, color: C.t2, marginTop: 2 }}>
                  Menos tiempo · Palabras trampa (shi/ji) · Boss furioso
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#FF3B5C', fontFamily: C.mono, fontWeight: 800 }}>
                +{Math.round((mod.xpE || 200) * 0.75)} XP
              </div>
              <div style={{ fontSize: 8, color: C.t2, fontFamily: C.mono }}>
                DESAFÍO ⚡
              </div>
            </div>
          </button>
        </div>
      )}

      {!examReady && !examDone && (
        <div style={{ fontSize: 10, color: C.t3, textAlign: 'center', marginTop: 4 }}>
          Termina todas las lecciones para desbloquear el boss.
        </div>
      )}
    </div>
  );
}
