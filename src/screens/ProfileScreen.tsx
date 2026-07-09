import { C } from '../styles/tokens';
import { Btn } from '../components/Btn';
import { Ghost } from '../components/Ghost';
import type { Rank } from '../core/progression';
import { formatStudyTime } from '../core/progression';
import type { ProfileStats } from '../core/stats';

interface StatProps {
  label: string;
  value: string | number;
  sub?: string | null;
}

interface ProfileScreenProps {
  xp: number;
  rank: Rank;
  streak: number;
  stats: ProfileStats;
  studySeconds: number;
  email?: string | null;
  onBack: () => void;
  onReview: (() => void) | null;
  onSettings: () => void;
  onLogout: () => void;
}

// ════════════════════════════════════════════════════════════════
// PROFILE — ¿Quién soy dentro del dojo?
// ════════════════════════════════════════════════════════════════
export function ProfileScreen({
  xp,
  rank,
  streak,
  stats,
  studySeconds,
  email,
  onBack,
  onReview,
  onSettings,
  onLogout,
}: ProfileScreenProps) {
  const pct = Math.min(
    ((xp - rank.min) / (rank.nXp - rank.min)) * 100,
    100
  );
  // Progresión: caja 0 (nuevo) → caja 5 (dominado), de apagado a lima pleno.
  const boxColors = ['#3A4536', C.tealD, C.teal, C.accent2, C.accent2, C.accent];
  const maxBox = Math.max(1, ...stats.boxDistribution);

  const Stat = ({ label, value, sub = null }: StatProps) => (
    <div
      style={{
        background: C.s1,
        border: `1px solid ${C.b1}`,
        borderRadius: 14,
        padding: '14px 12px',
        flex: 1,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 800, color: C.t1 }}>{value}</div>
      <div
        style={{
          fontSize: 9,
          color: C.t2,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          marginTop: 2,
        }}
      >
        {label}
      </div>
      {sub != null && (
        <div style={{ fontSize: 9, color: C.t3, fontFamily: C.mono, marginTop: 2 }}>
          {sub}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div
        className="fu"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div style={{ fontFamily: C.title, fontSize: 10, letterSpacing: 4, color: C.t3, fontWeight: 600 }}>
          PERFIL
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Ghost onClick={onSettings}>Ajustes</Ghost>
          <Ghost onClick={onBack}>← Volver</Ghost>
        </div>
      </div>

      {/* Identidad + rango */}
      <div
        className="fu2 corner-frame"
        style={{
          background: C.s1,
          border: `1px solid ${C.b1}`,
          borderRadius: 18,
          padding: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: C.aD,
            border: `1px solid rgba(140,242,68,.3)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: C.jp, color: C.accent, fontWeight: 900 }}>
            桜
          </span>
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.t1 }}>{rank.l}</div>
          <div
            style={{
              fontSize: 10,
              color: C.t2,
              fontFamily: C.mono,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {email || 'Entrenador anónimo'}
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 5, background: C.b1, borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: C.accent,
                  transition: 'width .6s cubic-bezier(.22,1,.36,1)',
                }}
              />
            </div>
            <div style={{ fontSize: 9, color: C.t3, fontFamily: C.mono, marginTop: 4 }}>
              {xp} XP · faltan {Math.max(0, rank.nXp - xp)} para {rank.next}
            </div>
          </div>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="fu3" style={{ display: 'flex', gap: 10 }}>
        <Stat label="Racha" value={streak} sub={streak === 1 ? 'día' : 'días'} />
        <Stat label="Entrenado" value={formatStudyTime(studySeconds)} />
        <Stat
          label="Dominados"
          value={stats.charsMastered}
          sub={`de ${stats.charsSeen} vistos`}
        />
        <Stat label="Dominio medio" value={`${stats.avgScore}%`} />
      </div>

      <div className="fu3" style={{ display: 'flex', gap: 10 }}>
        <Stat label="Kana" value={stats.kanaMastered} sub="dominados" />
        <Stat label="Kanji" value={stats.kanjiMastered} sub="dominados" />
        <Stat
          label="Lecciones"
          value={`${stats.lessonsDone}/${stats.lessonsTotal}`}
        />
        <Stat
          label="Exámenes"
          value={`${stats.examsPassed}/${stats.examsTotal}`}
        />
      </div>

      {/* Distribución SRS (cajas de Leitner) */}
      <div
        className="fu4"
        style={{
          background: C.s1,
          border: `1px solid ${C.b1}`,
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 9,
            letterSpacing: 1.5,
            color: C.t2,
            textTransform: 'uppercase',
            marginBottom: 12,
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>Memoria · cajas de repaso</span>
          <span style={{ color: C.accent }}>{stats.charsDue} para hoy</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 70 }}>
          {stats.boxDistribution.map((count, box) => (
            <div
              key={box}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
            >
              <div style={{ fontSize: 9, color: C.t2, fontFamily: C.mono }}>{count}</div>
              <div
                style={{
                  width: '100%',
                  height: `${(count / maxBox) * 46}px`,
                  minHeight: count > 0 ? 4 : 2,
                  background: count > 0 ? boxColors[box] : C.b1,
                  borderRadius: 4,
                  transition: 'height .5s cubic-bezier(.22,1,.36,1)',
                }}
              />
              <div style={{ fontSize: 8, color: C.t3, fontFamily: C.mono }}>
                {box === 0 ? 'new' : `c${box}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {onReview && (
        <div className="fu5">
          <Btn onClick={onReview}>REPASAR {stats.charsDue} CARACTERES →</Btn>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <Ghost onClick={onLogout} style={{ color: C.err, borderColor: 'rgba(255,59,92,.3)' }}>
          Cerrar sesión
        </Ghost>
      </div>
    </div>
  );
}
