import { C } from '../styles/tokens';
import { MODULES } from '../core/content';
import { Btn } from '../components/Btn';
import { AdBanner } from '../components/AdBanner';

interface HomeScreenProps {
  xp: number;
  streak: number;
  rank: { l: string; min: number; next: string; nXp: number };
  doneLs: string[];
  passedEx: string[];
  totalL: number;
  moduleLives: Record<string, number>;
  dueCount?: number;
  /** ¿Ya entrenó hoy? (lastTrainedOn === hoy) — para objetivos diarios. */
  trainedToday?: boolean;
  onReview: () => void;
  onMap: () => void;
  onProfile: () => void;
  onSpeedReview: () => void;
}

export function HomeScreen({
  xp,
  streak,
  rank,
  doneLs,
  passedEx,
  totalL,
  moduleLives,
  dueCount = 0,
  trainedToday = false,
  onReview,
  onMap,
  onProfile,
  onSpeedReview,
}: HomeScreenProps) {
  // Objetivos diarios (Bible §04): derivados del estado real, sin
  // estado nuevo — se cumplen jugando, no son promesas vacías.
  const goals: { label: string; done: boolean }[] = [
    { label: 'Entrena hoy', done: trainedToday },
    { label: 'Repasos SRS al día', done: dueCount === 0 },
    { label: 'Racha viva', done: streak > 0 },
  ];
  const goalsDone = goals.filter((g) => g.done).length;
  const pct = Math.min(((xp - rank.min) / (rank.nXp - rank.min)) * 100, 100);
  const circ = 2 * Math.PI * 44,
    off = circ - (pct / 100) * circ;
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src="/animaciones/saludo.gif"
            alt="Saludo Dojo"
            style={{ width: 36, height: 36, objectFit: 'contain', imageRendering: 'pixelated' }}
          />
          <div
            style={{
              fontFamily: C.title,
              fontSize: 10,
              letterSpacing: 4,
              color: C.t3,
              fontWeight: 600,
            }}
          >
            SAKIGO SYSTEM
          </div>
        </div>
        <div
          onClick={onProfile}
          style={{
            fontSize: 9,
            color: C.accent,
            border: `1px solid rgba(140,242,68,.2)`,
            padding: '3px 10px',
            borderRadius: 20,
            fontFamily: C.mono,
            letterSpacing: 1,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <span>{rank.l}</span>
          <span style={{ opacity: 0.6 }}>· perfil</span>
        </div>
        </div>

      {/* XP Ring */}
      <div
        className="fu2 corner-frame"
        style={{
          background: C.s1,
          border: `1px solid ${C.b1}`,
          borderRadius: 18,
          padding: '22px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <svg
          width={92}
          height={92}
          viewBox="0 0 100 100"
          style={{ flexShrink: 0 }}
        >
          <circle
            cx={50}
            cy={50}
            r={44}
            fill="none"
            stroke={C.b2}
            strokeWidth={4.5}
          />
          <circle
            cx={50}
            cy={50}
            r={44}
            fill="none"
            stroke="url(#gr)"
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={off}
            transform="rotate(-90 50 50)"
            style={{
              transition: 'stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)',
            }}
          />
          <defs>
            <linearGradient id="gr" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8CF244" />
              <stop offset="100%" stopColor="#98D96A" />
            </linearGradient>
          </defs>
          <text
            x={50}
            y={46}
            textAnchor="middle"
            fill={C.t1}
            fontSize={17}
            fontWeight={800}
            fontFamily="'Outfit',sans-serif"
          >
            {xp}
          </text>
          <text
            x={50}
            y={60}
            textAnchor="middle"
            fill={C.t2}
            fontSize={9}
            fontFamily="'Outfit',sans-serif"
            letterSpacing={2}
          >
            XP
          </text>
        </svg>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 10,
              color: C.t2,
              letterSpacing: 1.5,
              marginBottom: 4,
              fontWeight: 500,
            }}
          >
            PRÓXIMO RANGO
          </div>
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: C.t1,
              marginBottom: 8,
              letterSpacing: -0.3,
            }}
          >
            {rank.next}
          </div>
          <div
            style={{
              height: 2,
              background: C.b2,
              borderRadius: 1,
              overflow: 'hidden',
              marginBottom: 5,
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: 'linear-gradient(90deg,#8CF244,#98D96A)',
                borderRadius: 1,
                transition: 'width 1.4s cubic-bezier(.22,1,.36,1)',
              }}
            />
          </div>
          <div style={{ fontSize: 10, fontFamily: C.mono, color: C.t2 }}>
            {rank.nXp - xp} XP restantes
          </div>
        </div>
      </div>

      {/* Stats */}
      <div
        className="fu3"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}
      >
        {(
          [
            [streak, 'RACHA', 'días', C.accent],
            [doneLs.length + '/' + totalL, 'LECCIONES', 'hechas', C.t1],
            [
              passedEx.length + '/' + MODULES.length,
              'MÓDULOS',
              'aprobados',
              C.t2,
            ],
          ] as [string | number, string, string, string][]
        ).map(([v, l, s, color], i) => (
          <div
            key={i}
            style={{
              background: C.s1,
              border: `1px solid ${C.b1}`,
              borderRadius: 14,
              padding: '14px 10px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color,
                fontFamily: C.mono,
                lineHeight: 1,
                letterSpacing: -0.5,
              }}
            >
              {v}
            </div>
            <div
              style={{
                fontSize: 8,
                color: C.t2,
                letterSpacing: 2,
                marginTop: 5,
                fontWeight: 600,
                textTransform: 'uppercase',
              }}
            >
              {l}
            </div>
            <div style={{ fontSize: 9, color: C.t3, marginTop: 2 }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Módulos list */}
      <div
        className="fu4"
        style={{
          background: C.s1,
          border: `1px solid ${C.b1}`,
          borderRadius: 16,
          padding: '16px 18px',
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
          Ruta de Aprendizaje
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MODULES.map((m, i) => {
            const done = passedEx.includes(m.id);
            const lives = moduleLives?.[m.id] ?? 3;
            const inProgress =
              doneLs.some((id) => m.lessons.find((l) => l.id === id)) && !done;
            return (
              <div
                key={i}
                style={{ display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 1,
                    background: done ? C.ok : m.color,
                    flexShrink: 0,
                    transform: 'rotate(45deg)',
                  }}
                />
                <div
                  style={{
                    fontSize: 12,
                    color: done ? C.ok : C.t1,
                    flex: 1,
                    fontWeight: 500,
                  }}
                >
                  {m.sub}
                </div>
                {done && (
                  <div style={{ fontSize: 9, color: C.ok, fontFamily: C.mono }}>
                    ✓
                  </div>
                )}
                {inProgress && !done && (
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[1, 2, 3].map((h) => (
                      <div
                        key={h}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: 1,
                          background: h <= lives ? C.err : C.b2,
                          transform: 'rotate(45deg)',
                          transition: 'background .3s',
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Objetivos diarios (Bible §04) */}
      <div
        className="fu4 corner-frame"
        style={{
          background: C.s1,
          border: `1px solid ${goalsDone === goals.length ? 'rgba(140,242,68,.3)' : C.b1}`,
          borderRadius: 16,
          padding: '14px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 8,
              color: C.accent,
              letterSpacing: 3,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Objetivos de hoy
          </div>
          <div style={{ fontSize: 10, fontFamily: C.mono, color: goalsDone === goals.length ? C.ok : C.t2 }}>
            {goalsDone}/{goals.length}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {goals.map((g) => (
            <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  flexShrink: 0,
                  background: g.done ? C.accent : 'transparent',
                  border: `1.5px solid ${g.done ? C.accent : C.b2}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  fontWeight: 900,
                  color: '#04000D',
                  transition: 'all .3s',
                }}
              >
                {g.done ? '✓' : ''}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: g.done ? C.t2 : C.t1,
                  textDecoration: g.done ? 'line-through' : 'none',
                  fontWeight: 500,
                }}
              >
                {g.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Repaso diario (SRS Leitner) */}
      {dueCount > 0 && (
        <div
          className="fu5"
          onClick={onReview}
          style={{
            background: 'rgba(140,242,68,.06)',
            border: `1px solid rgba(140,242,68,.35)`,
            borderRadius: 16,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3"
                stroke={C.accent}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path d="M17 4v4h-4M7 20v-4h4" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div
                style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}
              >
                Repaso diario
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: C.t2,
                  fontFamily: C.mono,
                  letterSpacing: 0.5,
                }}
              >
                {dueCount} {dueCount === 1 ? 'carácter listo' : 'caracteres listos'} para repasar
              </div>
            </div>
          </div>
          <div
            style={{
              fontSize: 18,
              color: C.accent,
              fontWeight: 800,
            }}
          >
            →
          </div>
        </div>
      )}

      <div
        className="fu5"
        onClick={onSpeedReview}
        style={{
          background: 'rgba(14,124,140,.08)',
          border: `1px solid rgba(14,124,140,.4)`,
          borderRadius: 16,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke={C.teal} strokeWidth="1.8" />
            <path d="M12 7v5l3.5 2" stroke={C.teal} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>
              Repaso Cronometrado
            </div>
            <div style={{ fontSize: 10, color: C.t2, fontFamily: C.mono, letterSpacing: 0.5 }}>
              Kana mezclado · leaderboard global
            </div>
          </div>
        </div>
        <div style={{ fontSize: 18, color: C.teal, fontWeight: 800 }}>→</div>
      </div>

      <div className="fu5">
        <Btn onClick={onMap}>CONTINUAR APRENDIZAJE</Btn>
      </div>
      <div
        style={{
          textAlign: 'center',
          fontSize: 10,
          color: C.t3,
          fontFamily: C.mono,
          letterSpacing: 1,
        }}
      >
      </div>
    </div>
  );
}
