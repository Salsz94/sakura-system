import { C } from '../styles/tokens';
import { RapidComboExam } from './RapidComboExam';
import { KanaMatchExam } from './KanaMatchExam';
import { MiniBossExam } from './MiniBossExam';
import type { Module } from '../core/types';
import type { Rank } from '../core/progression';

interface ExamData {
  mod: Module;
  rapidQ: { kana: string; ans: string; opts: string[]; hint: string }[];
  matchPairs: { left: string; right: string }[];
  memPairs: { a: string; b: string }[];
  bossQ: { kana: string; q: string; ans: string; opts: string[]; hint: string; char: string }[];
  bossIdx: number;
}

interface ExamPhaseScreenProps {
  examData: ExamData;
  phase: number;
  phaseXp: number;
  xp: number;
  rank: Rank;
  passedEx: string[];
  onPhaseComplete: (xp: number) => void;
  onFail: () => void;
  onRetry: () => void;
}

// ════════════════════════════════════════════════════════════════
// EXAM PHASE SCREEN — orquesta las 3 fases del examen final
// ════════════════════════════════════════════════════════════════
export function ExamPhaseScreen({
  examData,
  phase,
  phaseXp,
  onPhaseComplete,
  onFail,
  onRetry,
}: ExamPhaseScreenProps) {
  const { mod, rapidQ, matchPairs, bossQ, bossIdx } = examData;
  const phaseColors = [C.accent, C.teal, C.err];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header de fases */}
      <div
        className="fu corner-frame"
        style={{
          background: C.s1,
          border: `1px solid ${C.b1}`,
          borderRadius: 14,
          padding: '14px 16px',
        }}
      >
        <div
          style={{
            fontFamily: C.title,
            fontSize: 9,
            color: C.t2,
            letterSpacing: 3,
            marginBottom: 10,
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          Examen Final — {mod.sub}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background:
                    i < phase ? C.ok : i === phase ? phaseColors[i] : C.b2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  fontWeight: 800,
                  color: i < phase ? '#04000D' : i === phase ? '#04000D' : C.t2,
                  border: `1px solid ${
                    i < phase ? C.ok : i === phase ? phaseColors[i] : C.b2
                  }`,
                  transition: 'all .3s',
                }}
              >
                {i < phase ? '✓' : i + 1}
              </div>
              <div
                style={{
                  fontSize: 8,
                  color: i === phase ? phaseColors[i] : i < phase ? C.ok : C.t2,
                  letterSpacing: 0.5,
                  textAlign: 'center',
                  fontWeight: i === phase ? 700 : 400,
                  textTransform: 'uppercase',
                }}
              >
                {['Rapid', 'Match', 'Boss'][i]}
              </div>
            </div>
          ))}
        </div>
        {phaseXp > 0 && (
          <div
            style={{
              marginTop: 10,
              fontSize: 10,
              color: C.accent,
              fontFamily: C.mono,
              textAlign: 'right',
              fontWeight: 600,
            }}
          >
            XP acumulado: +{phaseXp}
          </div>
        )}
      </div>

      {/* Fase 0 — Rapid Combo */}
      {phase === 0 && (
        <RapidComboExam
          questions={rapidQ}
          onComplete={(xp) => onPhaseComplete(xp)}
          onFail={onFail}
        />
      )}

      {/* Fase 1 — KanaMatch */}
      {phase === 1 && (
        <KanaMatchExam
          pairs={matchPairs}
          onComplete={(xp) => onPhaseComplete(xp)}
          onFail={onFail}
        />
      )}

      {/* Fase 2 — Mini Boss. m1/m2 (alfabetización) usan "completa la
          palabra"; m3-m8 usan preguntas del contenido REAL del módulo. */}
      {phase === 2 && (
        <MiniBossExam
          questions={bossQ}
          bossIndex={bossIdx}
          kanaSet={mod.id === 'm2' ? 'katakana' : 'hiragana'}
          mode={mod.id === 'm1' || mod.id === 'm2' ? 'words' : 'quiz'}
          onComplete={(xp) => onPhaseComplete(xp)}
          onFail={onFail}
          onRetry={onRetry}
        />
      )}
    </div>
  );
}
