import { useState } from 'react';
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
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const earnedXp = usePhases ? totalXp : (mod?.xpE || 200);
    const shareText = `🌸 ¡Acabo de completar el ${mod?.title || 'Módulo'} (${mod?.sub || 'Japonés'}) en SakiGo! ⚡\n🏆 Rango: ${rank.l} | +${earnedXp} XP\n🔥 ¡Aprende japonés real jugando!: ${window.location.origin}\n#SakiGo #AprenderJapones #JapaneseLearning #Otaku`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '🌸 SakiGo — ¡Módulo Completado!',
          text: shareText,
          url: window.location.origin,
        });
        setShared(true);
      } catch {
        // Cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setShared(true);
        setTimeout(() => setShared(false), 3500);
      } catch (err) {
        console.error('Error al copiar al portapapeles:', err);
      }
    }
  };
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
        {pass && (
          <img
            src="/animaciones/celebracion.gif"
            alt="Boss Derrotado"
            style={{
              width: 90,
              height: 90,
              objectFit: 'contain',
              imageRendering: 'pixelated',
              margin: '0 auto 12px auto',
              display: 'block',
            }}
          />
        )}
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
      <div className="fu4" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {pass && (
          <button
            onClick={handleShare}
            style={{
              background: 'linear-gradient(135deg, rgba(255,46,144,0.18) 0%, rgba(18,168,194,0.18) 100%)',
              border: '1px solid #FF2E90',
              borderRadius: 14,
              padding: '13px 18px',
              color: '#FFFFFF',
              fontFamily: C.title,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 0 16px rgba(255,46,144,0.25)',
              transition: 'all .2s ease',
            }}
          >
            <span>📲</span>
            <span>{shared ? '¡LOGRO COPIADO / COMPARTIDO! 🚀' : 'COMPARTIR RESULTADOS Y LOGRO ⚔️'}</span>
          </button>
        )}
        <Btn onClick={onMap}>
          {pass ? 'Ver Siguiente Módulo →' : 'Volver al Mapa'}
        </Btn>
      </div>
    </div>
  );
}
