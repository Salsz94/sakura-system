import { C } from '../styles/tokens';
import { Btn } from '../components/Btn';
import type { Fact, Module } from '../core/types';
import type { Rank } from '../core/progression';

interface ExamResult {
  pass: boolean;
  score: number;
  total: number;
  fact: Fact;
  mod: Module;
  /** XP total ganada en el examen de 3 fases (incluye bono del módulo). */
  totalXp?: number;
}

interface ExamResScreenProps {
  res: ExamResult;
  rank: Rank;
  onMap: () => void;
}

// ════════════════════════════════════════════════════════════════
// EXAM RESULT
// ════════════════════════════════════════════════════════════════
export function ExamResScreen({ res, rank, onMap }: ExamResScreenProps) {
  const { pass, score, total, fact, mod, totalXp } = res;
  const usePhases = totalXp != null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        className="fu"
        style={{
          fontSize: 8,
          color: pass ? C.ok : C.err,
          letterSpacing: 3,
          fontWeight: 700,
          textTransform: 'uppercase',
        }}
      >
        {pass ? 'Examen Aprobado' : 'Intenta de Nuevo'}
      </div>
      <div
        className="fu2"
        style={{
          background: C.s1,
          border: `1px solid ${
            pass ? 'rgba(140,242,68,.2)' : 'rgba(255,59,92,.15)'
          }`,
          borderRadius: 18,
          padding: '26px 20px',
          textAlign: 'center',
          boxShadow: pass ? `0 0 30px 2px rgba(140,242,68,.05)` : 'none',
        }}
      >
        <div
          style={{
            fontFamily: C.mono,
            fontSize: 52,
            fontWeight: 900,
            color: pass ? C.ok : C.err,
            lineHeight: 1,
          }}
        >
          {usePhases ? `+${totalXp}` : `${score}/${total}`}
        </div>
        <div
          style={{ fontSize: 10, color: C.t2, marginTop: 8, letterSpacing: 1 }}
        >
          {pass
            ? usePhases
              ? 'XP · Módulo Completado · 3 fases superadas'
              : `Módulo Completado · +${mod?.xpE || 200} XP`
            : 'El boss te venció — repasa el módulo y vuelve'}
        </div>
        {pass && (
          <div
            style={{
              fontSize: 11,
              color: C.ok,
              marginTop: 5,
              fontFamily: C.mono,
            }}
          >
            {usePhases ? rank.l : `+${mod?.xpE || 200} XP · ${rank.l}`}
          </div>
        )}
      </div>
      {pass && fact && (
        <div
          className="fu3"
          style={{
            background: C.aS,
            border: `1px solid rgba(140,242,68,.15)`,
            borderRadius: 18,
            padding: '20px 18px',
          }}
        >
          <div
            style={{
              fontSize: 8,
              color: C.accent,
              letterSpacing: 3,
              fontWeight: 700,
              marginBottom: 12,
              textTransform: 'uppercase',
            }}
          >
            Dato Curioso de Japón
          </div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: C.t1,
              marginBottom: 10,
              lineHeight: 1.4,
              letterSpacing: -0.2,
            }}
          >
            {fact.t}
          </div>
          <div
            style={{
              fontSize: 13,
              color: C.t1,
              lineHeight: 1.95,
              fontWeight: 300,
            }}
          >
            {fact.b}
          </div>
        </div>
      )}
      {!pass && (
        <div
          className="fu3"
          style={{
            background: C.s1,
            border: `1px solid ${C.b1}`,
            borderRadius: 14,
            padding: '16px',
          }}
        >
          <div
            style={{
              fontSize: 13,
              color: C.t1,
              lineHeight: 1.85,
              fontWeight: 300,
            }}
          >
            Revisa las lecciones del módulo y vuelve cuando te sientas más
            seguro. No hay límite de intentos — el dato curioso te espera al
            otro lado.
          </div>
        </div>
      )}
      <div className="fu4">
        <Btn onClick={onMap}>
          {pass ? 'Ver Siguiente Módulo →' : 'Volver al Mapa'}
        </Btn>
      </div>
    </div>
  );
}
