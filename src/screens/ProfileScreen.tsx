import { useState } from 'react';
import { C } from '../styles/tokens';
import { Btn } from '../components/Btn';
import { Ghost } from '../components/Ghost';
import { AdBanner } from '../components/AdBanner';
import { CyberSpeaker, CyberStar, CyberLock } from '../components/CyberIcons';
import { getVocabEntry, VOCAB_DICTIONARY } from '../core/content/vocabDictionary';
import { playPronunciation } from '../audio/tts';
import type { Rank } from '../core/progression';
import { formatStudyTime } from '../core/progression';
import type { ProfileStats } from '../core/stats';
import type { MasteryMap } from '../core/types';

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
  mastery?: MasteryMap;
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
  mastery = {},
  email,
  onBack,
  onReview,
  onSettings,
  onLogout,
}: ProfileScreenProps) {
  const [filterType, setFilterType] = useState<'all' | 'vocab' | 'kana'>('all');

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

      {/* Identidad + rango con respiracion.gif */}
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
        <img
          src="/animaciones/respiracion.gif"
          alt="Respiración Zen"
          style={{
            width: 58,
            height: 58,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `1.5px solid ${C.accent}`,
            flexShrink: 0,
            imageRendering: 'pixelated',
          }}
        />
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

      {/* 📜 GRIMORIO DE RECURSOS (Palabras & Fonética Aprendidas) */}
      {(() => {
        const dictKeys = Object.keys(VOCAB_DICTIONARY);
        const userLearnedKeys = Object.keys(mastery).filter((k) => (mastery[k]?.attempts || 0) > 0);
        const allKeys = Array.from(new Set([...userLearnedKeys, ...dictKeys]));

        const items = allKeys
          .map((key) => {
            const entry = getVocabEntry(key);
            const mCard = mastery[key];
            const isLearned = mCard ? mCard.attempts > 0 : false;
            return { key, entry, mCard, isLearned };
          })
          .filter((item) => {
            if (filterType === 'vocab') return item.entry.type === 'vocab';
            if (filterType === 'kana') return item.entry.type === 'kana';
            return true;
          })
          .sort((a, b) => (b.isLearned ? 1 : 0) - (a.isLearned ? 1 : 0));

        const totalLearned = allKeys.filter((k) => (mastery[k]?.attempts || 0) > 0).length;

        return (
          <div
            className="fu4 corner-frame"
            style={{
              background: C.s1,
              border: `1px solid ${C.b1}`,
              borderRadius: 16,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 9,
                    letterSpacing: 1.5,
                    color: C.accent,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <CyberStar size={12} color={C.accent} />
                  <span>Recursos & Vocabulario Desbloqueado</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.t1, marginTop: 2 }}>
                  {totalLearned} / {dictKeys.length} Palabras & Kana Aprendidos
                </div>
              </div>
              <div
                style={{
                  fontSize: 10,
                  fontFamily: C.mono,
                  color: C.ok,
                  background: C.aD,
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: `1px solid ${C.ok}`,
                }}
              >
                {Math.round((totalLearned / Math.max(1, dictKeys.length)) * 100)}%
              </div>
            </div>

            {/* Filtros de Tipo */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setFilterType('all')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 10,
                  fontFamily: C.mono,
                  fontWeight: 700,
                  background: filterType === 'all' ? C.accent : C.s2,
                  color: filterType === 'all' ? '#FFF' : C.t2,
                  border: `1px solid ${filterType === 'all' ? C.accent : C.b1}`,
                  cursor: 'pointer',
                }}
              >
                TODAS ({allKeys.length})
              </button>
              <button
                onClick={() => setFilterType('vocab')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 10,
                  fontFamily: C.mono,
                  fontWeight: 700,
                  background: filterType === 'vocab' ? C.accent : C.s2,
                  color: filterType === 'vocab' ? '#FFF' : C.t2,
                  border: `1px solid ${filterType === 'vocab' ? C.accent : C.b1}`,
                  cursor: 'pointer',
                }}
              >
                PALABRAS ({allKeys.filter((k) => getVocabEntry(k).type === 'vocab').length})
              </button>
              <button
                onClick={() => setFilterType('kana')}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 10,
                  fontFamily: C.mono,
                  fontWeight: 700,
                  background: filterType === 'kana' ? C.accent : C.s2,
                  color: filterType === 'kana' ? '#FFF' : C.t2,
                  border: `1px solid ${filterType === 'kana' ? C.accent : C.b1}`,
                  cursor: 'pointer',
                }}
              >
                KANA ({allKeys.filter((k) => getVocabEntry(k).type === 'kana').length})
              </button>
            </div>

            {/* Lista de Tarjetas de Recursos */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 8,
                maxHeight: 280,
                overflowY: 'auto',
                paddingRight: 4,
              }}
            >
              {items.map(({ key, entry, mCard, isLearned }) => (
                <div
                  key={key}
                  style={{
                    background: isLearned ? C.s2 : '#090b10',
                    border: `1px solid ${isLearned ? C.b2 : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    opacity: isLearned ? 1 : 0.45,
                    filter: isLearned ? 'none' : 'grayscale(100%)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        fontFamily: C.jp,
                        fontSize: 18,
                        fontWeight: 900,
                        color: isLearned ? C.accent : C.t3,
                        minWidth: 32,
                        textAlign: 'center',
                      }}
                    >
                      {entry.jp}
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          color: C.t1,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span>{entry.romaji}</span>
                        <span style={{ fontSize: 11, color: C.ok, fontWeight: 600 }}>
                          = "{entry.es}"
                        </span>
                      </div>
                      <div style={{ fontSize: 9, color: C.t2, fontFamily: C.mono, marginTop: 1 }}>
                        {entry.type === 'vocab' ? 'Vocabulario' : 'Fonética Kana'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isLearned ? (
                      <>
                        <button
                          onClick={() => playPronunciation(entry.jp)}
                          style={{
                            background: C.aD,
                            border: `1px solid ${C.accent}`,
                            borderRadius: 6,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <CyberSpeaker size={12} color={C.accent} />
                        </button>
                        <div
                          style={{
                            fontSize: 9,
                            fontFamily: C.mono,
                            color: C.ok,
                            border: `1px solid rgba(140,242,68,.3)`,
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}
                        >
                          Caja {mCard?.box || 1}
                        </div>
                      </>
                    ) : (
                      <div
                        style={{
                          fontSize: 9,
                          fontFamily: C.mono,
                          color: C.t3,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <CyberLock size={10} color={C.t3} />
                        <span>Por desbloquear</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

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

      <AdBanner slot="profile-screen-bottom" />
    </div>
  );
}
