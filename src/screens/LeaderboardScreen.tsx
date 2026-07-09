import { useState, useEffect, useCallback } from 'react';
import { C } from '../styles/tokens';
import { Ghost } from '../components/Ghost';
import { getLeaderboard, type KanaSet, type LeaderboardEntry } from '../data/repositories/leaderboardRepo';

interface LeaderboardScreenProps {
  userId: string;
  initialSet?: KanaSet;
  onBack: () => void;
}

function formatTime(ms: number): string {
  const totalCs = Math.floor(ms / 10);
  const s = Math.floor(totalCs / 100);
  const cs = totalCs % 100;
  return `${s}.${String(cs).padStart(2, '0')}s`;
}

// ════════════════════════════════════════════════════════════════
// LEADERBOARD — ranking global de repaso cronometrado
// ════════════════════════════════════════════════════════════════
export function LeaderboardScreen({ userId, initialSet = 'hiragana', onBack }: LeaderboardScreenProps) {
  const [kanaSet, setKanaSet] = useState<KanaSet>(initialSet);
  const [loading, setLoading] = useState(true);
  const [top, setTop] = useState<LeaderboardEntry[]>([]);
  const [you, setYou] = useState<(LeaderboardEntry & { rank: number }) | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getLeaderboard(kanaSet, userId);
    setTop(res.top);
    setYou(res.you);
    setLoading(false);
  }, [kanaSet, userId]);

  useEffect(() => {
    load();
  }, [load]);

  const Row = ({ rank, entry }: { rank: number; entry: LeaderboardEntry }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 12,
        background: entry.isYou ? C.aD : 'transparent',
        border: `1px solid ${entry.isYou ? 'rgba(140,242,68,.3)' : 'transparent'}`,
      }}
    >
      <div
        style={{
          width: 24,
          textAlign: 'center',
          fontFamily: C.mono,
          fontSize: 12,
          fontWeight: 800,
          color: rank <= 3 ? C.accent : C.t2,
        }}
      >
        {rank}
      </div>
      <div style={{ flex: 1, fontSize: 13, color: entry.isYou ? C.accent : C.t1, fontWeight: entry.isYou ? 700 : 500 }}>
        {entry.displayName}
        {entry.isYou && <span style={{ color: C.t2, fontWeight: 400 }}> (tú)</span>}
      </div>
      {/* Los errores desempatan el orden — se muestran para que el ranking sea legible */}
      <div style={{ fontFamily: C.mono, fontSize: 10, color: C.t2 }}>
        {entry.errors} err
      </div>
      <div style={{ fontFamily: C.mono, fontSize: 13, color: C.t1, fontWeight: 700 }}>
        {formatTime(entry.timeMs)}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
          Leaderboard
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        {(['hiragana', 'katakana'] as KanaSet[]).map((set) => (
          <button
            key={set}
            onClick={() => setKanaSet(set)}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 12,
              background: kanaSet === set ? C.aD : C.s2,
              border: `1px solid ${kanaSet === set ? C.accent : C.b1}`,
              color: kanaSet === set ? C.accent : C.t2,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {set === 'hiragana' ? 'Hiragana' : 'Katakana'}
          </button>
        ))}
      </div>

      <div
        className="corner-frame"
        style={{
          background: C.s1,
          border: `1px solid ${C.b1}`,
          borderRadius: 16,
          padding: '10px 6px',
          minHeight: 200,
        }}
      >
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: C.t2 }}>
            Cargando...
          </div>
        ) : top.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: C.t2 }}>
            Todavía nadie tiene un tiempo registrado. Sé el primero.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {top.map((entry, i) => (
              <Row key={entry.userId} rank={i + 1} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {you && you.rank > 20 && (
        <div
          style={{
            background: C.s1,
            border: `1px solid rgba(140,242,68,.3)`,
            borderRadius: 12,
            padding: '4px 6px',
          }}
        >
          <Row rank={you.rank} entry={you} />
        </div>
      )}
    </div>
  );
}
