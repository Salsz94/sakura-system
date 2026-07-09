import { C } from '../styles/tokens';
import { Ghost } from '../components/Ghost';
import type { KanaSet } from '../data/repositories/leaderboardRepo';

interface SpeedSelectScreenProps {
  onSelect: (set: KanaSet) => void;
  onViewLeaderboard: () => void;
  onBack: () => void;
}

const SETS: { set: KanaSet; label: string; glyph: string }[] = [
  { set: 'hiragana', label: 'Hiragana', glyph: 'あ' },
  { set: 'katakana', label: 'Katakana', glyph: 'ア' },
];

// ════════════════════════════════════════════════════════════════
// SPEED SELECT — elige el set de kana para el Repaso Cronometrado
// ════════════════════════════════════════════════════════════════
export function SpeedSelectScreen({ onSelect, onViewLeaderboard, onBack }: SpeedSelectScreenProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Ghost onClick={onBack}>← Volver</Ghost>
        <div
          style={{
            fontFamily: C.title,
            fontSize: 10,
            letterSpacing: 4,
            color: C.t3,
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          Repaso Cronometrado
        </div>
      </div>

      {SETS.map(({ set, label, glyph }, i) => (
        <button
          key={set}
          onClick={() => onSelect(set)}
          className="fu corner-frame"
          style={{
            background: C.s1,
            border: `1px solid ${C.b1}`,
            borderRadius: 18,
            padding: '18px 20px',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 14,
            animationDelay: `${i * 0.05}s`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: C.title, fontSize: 18, fontWeight: 800, color: C.t1 }}>
              {label}
            </div>
            <div style={{ fontSize: 10, color: C.t2, marginTop: 4, lineHeight: 1.5 }}>
              kana mezclado · cronometrado
              <br />
              leaderboard global
            </div>
          </div>
          <div
            style={{
              fontFamily: C.jp,
              fontSize: 64,
              fontWeight: 900,
              color: C.accent,
              lineHeight: 1,
              flexShrink: 0,
              textShadow: `0 0 30px rgba(140,242,68,.2)`,
            }}
          >
            {glyph}
          </div>
        </button>
      ))}

      <Ghost onClick={onViewLeaderboard} style={{ alignSelf: 'center' }}>
        Ver leaderboard sin jugar
      </Ghost>
    </div>
  );
}
