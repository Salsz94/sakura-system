import { C } from '../styles/tokens';
import { Ghost } from '../components/Ghost';
import type { Module, Lesson, MasteryMap } from '../core/types';

interface ModuleLessonsScreenProps {
  mod: Module;
  doneLs: string[];
  mastery: MasteryMap;
  isExamUnlocked: (mod: Module) => boolean;
  isExamPassed: (mod: Module) => boolean;
  onSelect: (lesson: Lesson, repeat: boolean) => void;
  onExam: (mod: Module) => void;
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
          // Si el módulo fue completado (examen aprobado), se puede elegir cualquier lección libremente.
          // Si está en progreso, solo se puede jugar la siguiente lección en orden secuencial.
          const avail = examDone ? true : li === firstUncompletedIdx;
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
                background: isDone ? C.aD : C.s2,
                border: `1px solid ${isDone ? 'rgba(140,242,68,.22)' : C.b1}`,
                borderRadius: 12,
                padding: '11px 14px',
                opacity: avail ? 1 : 0.22,
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
                    background: isDone ? mod.color || C.accent : C.b2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 800,
                    color: isDone ? '#04000D' : C.t2,
                  }}
                >
                  {isDone ? '✓' : li + 1}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: C.jp,
                      fontSize: 14,
                      color: C.t1,
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
                <div style={{ fontSize: 10, color: mod.color || C.accent, fontFamily: C.mono, fontWeight: 600 }}>
                  +{les.xp}
                </div>
                {isDone && avg > 0 && (
                  <div style={{ fontSize: 8, color: C.t2, fontFamily: C.mono }}>{avg}%</div>
                )}
                {isDone && (
                  // span con role: un <button> anidado dentro del botón
                  // de la lección es HTML inválido (foco/lectores rotos).
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

      {(examReady || examDone) && (
        <button
          onClick={() => !examDone && onExam(mod)}
          className="fu corner-frame"
          style={{
            width: '100%',
            textAlign: 'left',
            background: examDone ? C.okD : C.aD,
            border: `1px solid ${examDone ? 'rgba(140,242,68,.28)' : 'rgba(140,242,68,.4)'}`,
            borderRadius: 14,
            padding: '16px 18px',
            marginTop: 4,
            cursor: examDone ? 'default' : 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            animation: examReady && !examDone ? 'pulse 2.5s ease infinite' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: examDone ? C.ok : C.aD,
                border: `1px solid ${examDone ? C.ok : C.accent}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 15,
                color: examDone ? C.ok : C.accent,
              }}
            >
              {examDone ? '✓' : 'EX'}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: examDone ? C.ok : C.accent }}>
                Boss — Examen Final
              </div>
              <div style={{ fontSize: 10, color: C.t2, marginTop: 1 }}>
                {examDone ? 'Aprobado' : '3 fases: Rapid · Match · Boss'}
              </div>
            </div>
          </div>
          {!examDone && (
            <div style={{ fontSize: 11, color: C.accent, fontFamily: C.mono, fontWeight: 700 }}>
              +{mod.xpE}
            </div>
          )}
        </button>
      )}

      {!examReady && !examDone && (
        <div style={{ fontSize: 10, color: C.t3, textAlign: 'center', marginTop: 4 }}>
          Termina todas las lecciones para desbloquear el boss.
        </div>
      )}
    </div>
  );
}
