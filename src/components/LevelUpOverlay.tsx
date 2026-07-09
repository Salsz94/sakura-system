import { useEffect } from 'react';
import { C } from '../styles/tokens';
import type { Rank } from '../core/progression';

interface LevelUpOverlayProps {
  rank: Rank;
  onDismiss: () => void;
}

// ════════════════════════════════════════════════════════════════
// LEVEL UP — overlay full-screen al subir de rango, estilo videojuego
// ════════════════════════════════════════════════════════════════
export function LevelUpOverlay({ rank, onDismiss }: LevelUpOverlayProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        background: 'rgba(4,0,13,.88)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        animation: 'fuFast .3s cubic-bezier(.22,1,.36,1) both',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: 24,
        }}
      >
        {/* Anillos expansivos */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: `1.5px solid ${C.accent}`,
              transform: 'translate(-50%,-50%)',
              animation: `levelRing 1.8s ${i * 0.3}s cubic-bezier(.22,1,.36,1) infinite`,
            }}
          />
        ))}

        <div
          style={{
            fontFamily: C.title,
            fontSize: 11,
            letterSpacing: 5,
            color: C.t2,
            fontWeight: 600,
            marginBottom: 14,
            textTransform: 'uppercase',
          }}
        >
          Subiste de rango
        </div>
        <div
          className="heroIn"
          style={{
            fontFamily: C.jp,
            fontSize: 44,
            color: C.accent,
            fontWeight: 900,
          }}
        >
          桜
        </div>
        <div
          className="glow-kanji"
          style={{
            fontFamily: C.title,
            fontSize: 34,
            fontWeight: 800,
            color: C.t1,
            letterSpacing: 1,
            marginTop: 10,
            textShadow: `0 0 30px rgba(140,242,68,.4)`,
          }}
        >
          {rank.l}
        </div>
        <div
          style={{
            fontSize: 11,
            color: C.t2,
            fontFamily: C.mono,
            marginTop: 10,
          }}
        >
          próximo: {rank.next} a {rank.nXp} XP
        </div>
        <div
          style={{
            fontSize: 9,
            color: C.t3,
            letterSpacing: 2,
            marginTop: 24,
            textTransform: 'uppercase',
          }}
        >
          toca para continuar
        </div>
      </div>
    </div>
  );
}
