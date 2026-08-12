import { useState, useEffect } from 'react';
import { C } from '../styles/tokens';
import { MN } from '../core/content';
import { Ghost } from '../components/Ghost';
import { TypeRomajiInput } from '../components/TypeRomajiInput';
import { PairMatchExercise } from '../components/PairMatchExercise';
import { CyberStar, CyberMemory, CyberCaution } from '../components/CyberIcons';
import { getVocabEntry } from '../core/content/vocabDictionary';
import { playPronunciation, ttsSupported } from '../audio/tts';
import type { Exercise } from '../core/types';

// Escalado óptimo de fuente para palabras multi-carácter (ej. げつようび, getsuyōbi)
// Evita desfasar botones, tarjetas hero y contenedores en pantalla.
function heroFontSize(text: string | undefined, base: number): number {
  const len = text?.length || 1;
  if (len <= 1) return base;
  if (len === 2) return Math.max(12, Math.round(base * 0.76));
  if (len === 3) return Math.max(11, Math.round(base * 0.62));
  if (len === 4) return Math.max(11, Math.round(base * 0.52));
  if (len === 5) return Math.max(10, Math.round(base * 0.44));
  if (len === 6) return Math.max(10, Math.round(base * 0.38));
  if (len === 7) return Math.max(9, Math.round(base * 0.33));
  if (len === 8) return Math.max(9, Math.round(base * 0.29));
  return Math.max(9, Math.round(base * 0.25));
}

interface BattleScreenProps {
  ex: Exercise;
  idx: number;
  total: number;
  hp: number;
  maxHp: number;
  sesXp: number;
  combo: number;
  correct: number;
  minPass: number;
  sel: number | null;
  answered: boolean;
  timer: number;
  shake: boolean;
  flash: boolean;
  errFlash: boolean;
  orderSel: string[];
  romajiInput: string;
  setRomaji: (value: string) => void;
  /** Repaso SRS: no se aprueba ni reprueba (oculta la barra "para pasar"). */
  isReview?: boolean;
  onAns: (idx: number, textInput?: string) => void;
  onTap: (char: string) => void;
  onNext: () => void;
  onExit: () => void;
  onPairs?: (chars: string[], allCorrect: boolean) => void;
  setSesXp: (updater: (x: number) => number) => void;
  setCorrect: (updater: (x: number) => number) => void;
  setErrs: (updater: (x: number) => number) => void;
}

// ════════════════════════════════════════════════════════════════
// BATTLE — con ejercicios tipo kana_hero, true_false, order
// ════════════════════════════════════════════════════════════════
export function BattleScreen({
  ex,
  idx,
  total,
  hp,
  maxHp,
  sesXp,
  combo,
  correct,
  minPass,
  sel,
  answered,
  timer,
  shake,
  flash,
  errFlash,
  orderSel,
  romajiInput,
  setRomaji,
  isReview = false,
  onAns,
  onTap,
  onNext,
  onExit,
  onPairs,
  setSesXp,
  setCorrect,
  setErrs,
}: BattleScreenProps) {
  const [mounted, setMounted] = useState(false);
  // Fallback del ejercicio de escucha: si el TTS no funciona (voz ja
  // no disponible / desktop sin voces), se puede revelar el romaji.
  const [showRomaji, setShowRomaji] = useState(false);
  useEffect(() => {
    setMounted(false);
    setShowRomaji(false);
    setTimeout(() => setMounted(true), 20);
  }, [idx]);
  const tPct = (timer / 20) * 100;
  const tColor = timer > 10 ? C.accent : timer > 5 ? C.warn : C.err;
  const passPct = Math.min((correct / minPass) * 100, 100);

  const normRomaji = (s: string) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const isCorrect =
    answered &&
    (ex.type === 'order' || ex.type === 'build_sentence'
      ? JSON.stringify(orderSel) === JSON.stringify(ex.ans)
      : ex.type === 'true_false'
      ? (sel === 1) === ex.ans
      : ex.type === 'type_romaji' || ex.type === 'type_digit'
      ? normRomaji(romajiInput) === normRomaji(ex.ans as string)
      : ex.type === 'pair_match'
      ? false // pair_match maneja su propio estado
      : sel === ex.ans);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        opacity: mounted ? 1 : 0,
        transition: 'opacity .18s',
      }}
    >
      {/* Top HUD */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onExit}
          aria-label="Salir del ejercicio"
          style={{
            width: 24,
            height: 24,
            flexShrink: 0,
            borderRadius: 8,
            background: C.s2,
            border: `1px solid ${C.b2}`,
            color: C.t2,
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ×
        </button>
        <div style={{ display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap' }}>
          {Array.from({ length: maxHp }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: i < hp ? C.accent : C.b2,
                transition: 'background .3s',
                transform: 'rotate(45deg)',
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontFamily: C.mono,
            fontSize: 11,
            color: C.accent,
            fontWeight: 600,
          }}
        >
          +{sesXp}
        </div>
        {combo >= 2 && (
          <div
            style={{
              fontFamily: C.mono,
              fontSize: 9,
              color: C.warn,
              border: `1px solid rgba(255,59,92,.25)`,
              padding: '2px 8px',
              borderRadius: 20,
              letterSpacing: 0.5,
            }}
          >
            ×{combo} COMBO
          </div>
        )}
      </div>

      {/* Timer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            flex: 1,
            height: 2,
            background: C.b2,
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${tPct}%`,
              background: tColor,
              borderRadius: 1,
              transition: 'width 1s linear,background .3s',
            }}
          />
        </div>
        <div
          style={{
            fontFamily: C.mono,
            fontSize: 10,
            color: tColor,
            minWidth: 26,
            textAlign: 'right',
          }}
        >
          {timer}s
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 2,
              borderRadius: 1,
              background: i < idx ? C.accent : i === idx ? C.t1 : C.b2,
              transition: 'background .3s',
            }}
          />
        ))}
      </div>

      {/* Pass bar — oculta en repasos SRS: no se aprueban ni reprueban */}
      {!isReview && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            fontSize: 9,
            color: C.t2,
            fontFamily: C.mono,
            whiteSpace: 'nowrap',
          }}
        >
          {correct}/{minPass} para pasar
        </div>
        <div
          style={{
            flex: 1,
            height: 2,
            background: C.b2,
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${passPct}%`,
              background: correct >= minPass ? C.ok : C.accent,
              borderRadius: 1,
              transition: 'width .4s',
            }}
          />
        </div>
        {correct >= minPass && (
          <div style={{ fontSize: 9, color: C.ok, fontFamily: C.mono }}>✓</div>
        )}
      </div>
      )}

      {/* KANA HERO */}
      {ex.type === 'kana_hero' && (
        <div
          className={`corner-frame ${shake ? 'error-shake' : flash ? 'cardPop' : ''}`}
          style={{
            background: C.s1,
            border: `1px solid ${
              flash ? C.accent : errFlash ? C.err : C.b1
            }`,
            borderRadius: 18,
            padding: '24px 18px',
            boxShadow: flash
              ? `0 0 32px 6px rgba(140,242,68,.18)`
              : errFlash
              ? `0 0 0 2px rgba(255,59,92,.4)`
              : 'none',
            animation: errFlash ? 'errorFlash .4s ease' : 'none',
            transition: 'border .1s,box-shadow .1s',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.t2,
              letterSpacing: 2,
              marginBottom: 16,
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            {ex.q}
          </div>
          <div
            className="heroIn"
            style={{
              fontFamily: C.jp,
              fontSize: heroFontSize(ex.kana, 96),
              color: C.t1,
              fontWeight: 900,
              lineHeight: 1.15,
              textShadow: `0 0 40px rgba(140,242,68,.15)`,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {ex.kana}
          </div>
        </div>
      )}

      {/* TRUE / FALSE */}
      {ex.type === 'true_false' && (
        <div
          className={`corner-frame ${shake ? 'error-shake' : flash ? 'cardPop' : ''}`}
          style={{
            background: C.s1,
            border: `1px solid ${
              flash ? C.accent : errFlash ? C.err : C.b1
            }`,
            borderRadius: 18,
            padding: '28px 18px',
            boxShadow: flash
              ? `0 0 32px 6px rgba(140,242,68,.18)`
              : errFlash
              ? `0 0 0 2px rgba(255,59,92,.4)`
              : 'none',
            animation: errFlash ? 'errorFlash .4s ease' : 'none',
            transition: 'border .1s,box-shadow .1s',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.t2,
              letterSpacing: 2,
              marginBottom: 20,
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            ¿Esta lectura es correcta?
          </div>
          <div
            className="heroIn"
            style={{
              fontFamily: C.jp,
              fontSize: heroFontSize(ex.kana, 88),
              color: C.t1,
              fontWeight: 900,
              lineHeight: 1.15,
              marginBottom: 20,
              textShadow: `0 0 40px rgba(140,242,68,.12)`,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {ex.kana}
          </div>
          <div
            style={{
              display: 'inline-block',
              background: C.s2,
              border: `1px solid ${C.b2}`,
              borderRadius: 12,
              padding: '10px 28px',
            }}
          >
            <div
              style={{
                fontFamily: C.mono,
                fontSize: 28,
                fontWeight: 800,
                color: C.accent,
                letterSpacing: 2,
              }}
            >
              {ex.claim}
            </div>
          </div>
        </div>
      )}

      {/* ORDER */}
      {ex.type === 'order' && (
        <div
          className={`corner-frame ${shake ? 'shake' : flash ? 'cardPop' : ''}`}
          style={{
            background: C.s1,
            border: `1px solid ${flash ? C.accent : C.b1}`,
            borderRadius: 18,
            padding: '20px 16px',
            boxShadow: flash ? `0 0 32px 6px rgba(140,242,68,.18)` : 'none',
            transition: 'border .15s,box-shadow .15s',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.t2,
              letterSpacing: 2,
              marginBottom: 14,
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            {ex.q}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 6,
              justifyContent: 'center',
              marginBottom: 12,
              flexWrap: 'wrap',
            }}
          >
            {(ex.ans as string[]).map((_, i) => (
              <div
                key={i}
                style={{
                  minWidth: 52,
                  height: 52,
                  padding: '0 6px',
                  borderRadius: 12,
                  background: orderSel[i] ? C.aD : C.s2,
                  border: `1px solid ${orderSel[i] ? C.accent : C.b2}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: C.jp,
                  fontSize: heroFontSize(orderSel[i], 22),
                  color: C.accent,
                  transition: 'all .15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {orderSel[i] || ''}
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 6,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {(ex.items || []).map((ch, i) => {
              const used = orderSel.includes(ch);
              return (
                <button
                  key={i}
                  onClick={() => !answered && onTap(ch)}
                  disabled={answered}
                  style={{
                    minWidth: 52,
                    height: 52,
                    padding: '0 6px',
                    borderRadius: 12,
                    background: C.s2,
                    border: `1px solid ${used ? C.b1 : C.accent}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: C.jp,
                    fontSize: heroFontSize(ch, 22),
                    color: used ? C.t3 : C.t1,
                    opacity: used ? 0.2 : 1,
                    transition: 'all .18s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    wordBreak: 'keep-all',
                  }}
                >
                  {ch}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* BUILD SENTENCE — estilo Duolingo, ordena las palabras */}
      {ex.type === 'build_sentence' && (
        <div
          className={`corner-frame ${shake ? 'shake' : flash ? 'cardPop' : ''}`}
          style={{
            background: C.s1,
            border: `1px solid ${flash ? C.accent : C.b1}`,
            borderRadius: 18,
            padding: '20px 16px',
            boxShadow: flash ? `0 0 32px 6px rgba(140,242,68,.18)` : 'none',
            transition: 'border .15s,box-shadow .15s',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.t2,
              letterSpacing: 2,
              marginBottom: 8,
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            Construye la oración
          </div>
          <div
            style={{
              fontSize: 17,
              color: C.t1,
              fontWeight: 700,
              marginBottom: 18,
              lineHeight: 1.4,
            }}
          >
            {ex.q}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: 14,
              minHeight: 40,
            }}
          >
            {(ex.ans as string[]).map((_, i) => (
              <div
                key={i}
                style={{
                  minWidth: 38,
                  height: 40,
                  padding: '0 8px',
                  borderRadius: 10,
                  background: orderSel[i] ? C.aD : C.s2,
                  border: `1px solid ${orderSel[i] ? C.accent : C.b2}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: C.jp,
                  fontSize: heroFontSize(orderSel[i], 16),
                  color: C.accent,
                  transition: 'all .15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {orderSel[i] || ''}
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: C.b1, marginBottom: 14 }} />
          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {(ex.items || []).map((word, i) => {
              const used = orderSel.includes(word);
              return (
                <button
                  key={i}
                  onClick={() => !answered && onTap(word)}
                  disabled={answered}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 20,
                    background: C.s2,
                    border: `1px solid ${used ? C.b1 : C.accent}`,
                    fontFamily: C.jp,
                    fontSize: heroFontSize(word, 16),
                    color: used ? C.t3 : C.t1,
                    opacity: used ? 0.2 : 1,
                    transition: 'all .18s',
                    whiteSpace: 'nowrap',
                    wordBreak: 'keep-all',
                  }}
                >
                  {word}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Opciones para kana_hero */}
      {ex.type === 'kana_hero' && (
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
        >
          {(ex.opts || []).map((opt, i) => {
            let bg = C.s2,
              border = `1px solid ${C.b1}`,
              color = C.t2;
            if (answered) {
              if (i === ex.ans) {
                bg = C.okD;
                border = `1px solid ${C.ok}`;
                color = C.ok;
              } else if (i === sel) {
                bg = C.errD;
                border = `1px solid ${C.err}`;
                color = C.err;
              }
            } else if (i === sel) {
              bg = C.aD;
              border = `1px solid ${C.accent}`;
              color = C.accent;
            }
            return (
              <button
                key={i}
                onClick={() => !answered && onAns(i)}
                style={{
                  background: bg,
                  border,
                  color,
                  borderRadius: 14,
                  padding: '12px 6px',
                  fontSize: heroFontSize(opt, 20),
                  fontFamily: "'Outfit',sans-serif",
                  fontWeight: 600,
                  transition: 'all .15s',
                  minHeight: 54,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  letterSpacing: 0.5,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'keep-all',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* TYPE ROMAJI — kana hero + input */}
      {ex.type === 'type_romaji' && (
        <div
          className={`corner-frame ${shake ? 'shake' : flash ? 'cardPop' : ''}`}
          style={{
            background: C.s1,
            border: `1px solid ${flash ? C.accent : C.b1}`,
            borderRadius: 18,
            padding: '24px 18px',
            boxShadow: flash ? `0 0 32px 6px rgba(140,242,68,.18)` : 'none',
            transition: 'border .15s,box-shadow .15s',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.t2,
              letterSpacing: 2,
              marginBottom: 16,
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            {ex.q}
          </div>
          <div
            className="heroIn"
            style={{
              fontFamily: C.jp,
              fontSize: heroFontSize(ex.kana, 96),
              color: C.t1,
              fontWeight: 900,
              lineHeight: 1.15,
              textShadow: `0 0 40px rgba(140,242,68,.15)`,
              marginBottom: 16,
              wordBreak: 'keep-all',
            }}
          >
            {ex.kana}
          </div>
          {!answered && (
            <TypeRomajiInput
              value={romajiInput}
              onChange={setRomaji}
              onSubmit={() => onAns(0, romajiInput)}
              disabled={answered}
            />
          )}
          {answered && (
            <div style={{ marginTop: 4 }}>
              <div
                style={{
                  fontSize: 11,
                  color: C.t2,
                  marginBottom: 8,
                  letterSpacing: 1,
                }}
              >
                Tu respuesta
              </div>
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: 32,
                  fontWeight: 800,
                  color:
                    romajiInput.trim().toLowerCase() === (ex.ans as string).toLowerCase()
                      ? C.ok
                      : C.err,
                  letterSpacing: 1,
                }}
              >
                {romajiInput || '—'}
              </div>
              {romajiInput.trim().toLowerCase() !== (ex.ans as string).toLowerCase() && (
                <div
                  style={{
                    fontFamily: C.mono,
                    fontSize: 20,
                    color: C.ok,
                    marginTop: 8,
                  }}
                >
                  → {ex.ans}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* PAIR MATCH — columnas romaji ↔ kana */}
      {ex.type === 'pair_match' && (
        <PairMatchExercise
          key={ex.id}
          pairs={ex.pairs || []}
          hint={ex.hint}
          onComplete={(errors) => {
            // Ya no es un punto regalado: cuenta como correcto SOLO si
            // se completó sin errores; con errores cuenta como fallo
            // (los pares siempre se terminan, la señal es la limpieza).
            if (errors === 0) {
              setSesXp((s) => s + 15);
              setCorrect((c) => c + 1);
            } else {
              setErrs((e) => e + 1);
            }
            // Alimentar SRS: cada kana del par avanza (sin errores = acierto pleno).
            if (onPairs) {
              onPairs(
                (ex.pairs || []).map((p) => p.right),
                errors === 0
              );
            }
            setTimeout(() => onNext(), 800);
          }}
        />
      )}

      {/* PICK KANA — romaji arriba, elige el kana */}
      {ex.type === 'pick_kana' && (
        <div
          className={`corner-frame ${shake ? 'error-shake' : flash ? 'cardPop' : ''}`}
          style={{
            background: C.s1,
            border: `1px solid ${
              flash ? C.accent : errFlash ? C.err : C.b1
            }`,
            borderRadius: 18,
            padding: '24px 18px',
            boxShadow: flash
              ? `0 0 32px 6px rgba(140,242,68,.18)`
              : errFlash
              ? `0 0 0 2px rgba(255,59,92,.4)`
              : 'none',
            animation: errFlash ? 'errorFlash .4s ease' : 'none',
            transition: 'border .1s,box-shadow .1s',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.t2,
              letterSpacing: 2,
              marginBottom: 12,
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            {ex.q}
          </div>
          <div
            className="heroIn"
            style={{
              fontFamily: C.mono,
              fontSize: heroFontSize(ex.romaji, 72),
              fontWeight: 900,
              color: C.accent,
              lineHeight: 1.15,
              letterSpacing: -1,
              marginBottom: 8,
              wordBreak: 'keep-all',
            }}
          >
            {ex.romaji}
          </div>
          <div style={{ fontSize: 11, color: C.t2, marginBottom: 4 }}>
            elige el kana correcto
          </div>
        </div>
      )}
      {ex.type === 'pick_kana' && (
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
        >
          {(ex.opts || []).map((opt, i) => {
            let bg = C.s2,
              border = `1px solid ${C.b1}`,
              color = C.t1;
            if (answered) {
              if (i === ex.ans) {
                bg = C.okD;
                border = `1px solid ${C.ok}`;
                color = C.ok;
              } else if (i === sel) {
                bg = C.errD;
                border = `1px solid ${C.err}`;
                color = C.err;
              }
            } else if (i === sel) {
              bg = C.aD;
              border = `1px solid ${C.accent}`;
              color = C.accent;
            }
            return (
              <button
                key={i}
                onClick={() => !answered && onAns(i)}
                style={{
                  background: bg,
                  border,
                  color,
                  borderRadius: 14,
                  padding: '12px 6px',
                  fontSize: heroFontSize(opt, 32),
                  fontFamily: C.jp,
                  fontWeight: 700,
                  transition: 'all .15s',
                  minHeight: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'keep-all',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* DIGIT_TO_KANA — Muestra el dígito (1, 2, 3...), elige el Hiragana correcto */}
      {ex.type === 'digit_to_kana' && (
        <div
          className={`corner-frame ${shake ? 'error-shake' : flash ? 'cardPop' : ''}`}
          style={{
            background: C.s1,
            border: `1px solid ${flash ? C.accent : errFlash ? C.err : C.b1}`,
            borderRadius: 18,
            padding: '24px 18px',
            boxShadow: flash
              ? `0 0 32px 6px rgba(140,242,68,.18)`
              : errFlash
              ? `0 0 0 2px rgba(255,59,92,.4)`
              : 'none',
            animation: errFlash ? 'errorFlash .4s ease' : 'none',
            transition: 'border .1s,box-shadow .1s',
            textAlign: 'center',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.t2,
              letterSpacing: 2,
              marginBottom: 12,
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            {ex.q}
          </div>
          <div
            className="heroIn"
            style={{
              fontFamily: C.mono,
              fontSize: 84,
              fontWeight: 900,
              color: C.accent,
              lineHeight: 1,
              letterSpacing: -1,
              marginBottom: 8,
            }}
          >
            {ex.digit}
          </div>
          <div style={{ fontSize: 11, color: C.t2, marginBottom: 4 }}>
            selecciona el hiragana correcto
          </div>
        </div>
      )}
      {ex.type === 'digit_to_kana' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {(ex.opts || []).map((opt, i) => {
            let bg = C.s2,
              border = `1px solid ${C.b1}`,
              color = C.t1;
            if (answered) {
              if (i === ex.ans) {
                bg = C.okD;
                border = `1px solid ${C.ok}`;
                color = C.ok;
              } else if (i === sel) {
                bg = C.errD;
                border = `1px solid ${C.err}`;
                color = C.err;
              }
            } else if (i === sel) {
              bg = C.aD;
              border = `1px solid ${C.accent}`;
              color = C.accent;
            }
            return (
              <button
                key={i}
                onClick={() => !answered && onAns(i)}
                style={{
                  background: bg,
                  border,
                  color,
                  borderRadius: 14,
                  padding: '12px 6px',
                  fontSize: heroFontSize(opt, 32),
                  fontFamily: C.jp,
                  fontWeight: 700,
                  transition: 'all .15s',
                  minHeight: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'keep-all',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* TYPE DIGIT — Calculadora Cyberpunk Interactiva para Números */}
      {ex.type === 'type_digit' && (
        <div
          className={`corner-frame ${shake ? 'error-shake' : flash ? 'cardPop' : ''}`}
          style={{
            background: C.s1,
            border: `1px solid ${flash ? C.accent : errFlash ? C.err : C.b1}`,
            borderRadius: 18,
            padding: '20px 16px',
            boxShadow: flash
              ? `0 0 32px 6px rgba(140,242,68,.18)`
              : errFlash
              ? `0 0 0 2px rgba(255,59,92,.4)`
              : 'none',
            animation: errFlash ? 'errorFlash .4s ease' : 'none',
            transition: 'border .1s,box-shadow .1s',
            textAlign: 'center',
            maxWidth: 380,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: C.cyan,
              letterSpacing: 2,
              marginBottom: 10,
              fontWeight: 700,
              textTransform: 'uppercase',
              fontFamily: C.mono,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <span>📟 CALCULADORA CYBERPUNK</span>
          </div>

          {/* Palabra o número en Hiragana */}
          <div
            className="heroIn"
            style={{
              fontFamily: C.jp,
              fontSize: heroFontSize(ex.kana, 64),
              fontWeight: 900,
              color: C.accent,
              lineHeight: 1.15,
              letterSpacing: -1,
              marginBottom: 12,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {ex.kana}
          </div>

          {/* Pantalla LED Digital */}
          <div
            style={{
              background: '#040912',
              border: `1.5px solid ${romajiInput ? C.cyan : C.b2}`,
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: romajiInput ? `0 0 16px rgba(0,240,255,.2)` : 'none',
              transition: 'all .15s',
            }}
          >
            <span style={{ fontSize: 10, color: C.t3, fontFamily: C.mono, letterSpacing: 1 }}>
              ENTRADA:
            </span>
            <span
              style={{
                fontFamily: C.mono,
                fontSize: 28,
                fontWeight: 800,
                color: romajiInput ? C.cyan : C.t3,
                letterSpacing: 4,
              }}
            >
              {romajiInput || '0'}
            </span>
          </div>

          {/* Teclado Numérico (Numpad Grid 3x4) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
            }}
          >
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                disabled={answered}
                onClick={() => {
                  if (!answered && romajiInput.length < 5) {
                    setRomaji(romajiInput + digit);
                  }
                }}
                style={{
                  background: C.s2,
                  border: `1px solid ${C.b2}`,
                  borderRadius: 12,
                  padding: '14px 0',
                  fontSize: 22,
                  fontFamily: C.mono,
                  fontWeight: 800,
                  color: C.t1,
                  cursor: 'pointer',
                  transition: 'all .15s',
                }}
              >
                {digit}
              </button>
            ))}

            {/* Botón Borrar */}
            <button
              disabled={answered || !romajiInput}
              onClick={() => {
                if (!answered && romajiInput.length > 0) {
                  setRomaji(romajiInput.slice(0, -1));
                }
              }}
              style={{
                background: C.s2,
                border: `1px solid ${C.err}`,
                borderRadius: 12,
                padding: '14px 0',
                fontSize: 14,
                fontFamily: C.mono,
                fontWeight: 800,
                color: C.err,
                cursor: 'pointer',
                opacity: romajiInput ? 1 : 0.4,
                transition: 'all .15s',
              }}
            >
              ⌫ BORRAR
            </button>

            {/* Botón 0 */}
            <button
              disabled={answered}
              onClick={() => {
                if (!answered && romajiInput.length < 5) {
                  setRomaji(romajiInput + '0');
                }
              }}
              style={{
                background: C.s2,
                border: `1px solid ${C.b2}`,
                borderRadius: 12,
                padding: '14px 0',
                fontSize: 22,
                fontFamily: C.mono,
                fontWeight: 800,
                color: C.t1,
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              0
            </button>

            {/* Botón OK / Confirmar */}
            <button
              disabled={answered || !romajiInput}
              onClick={() => {
                if (!answered && romajiInput) {
                  onAns(0, romajiInput);
                }
              }}
              style={{
                background: romajiInput ? C.accent : C.s2,
                border: `1px solid ${romajiInput ? C.accent : C.b1}`,
                borderRadius: 12,
                padding: '14px 0',
                fontSize: 13,
                fontFamily: C.mono,
                fontWeight: 800,
                color: romajiInput ? '#FFFFFF' : C.t3,
                cursor: 'pointer',
                boxShadow: romajiInput ? `0 0 16px rgba(255,0,205,.35)` : 'none',
                transition: 'all .15s',
              }}
            >
              ➔ ENVIAR
            </button>
          </div>
        </div>
      )}

      {/* LISTEN — escucha la pronunciación (TTS ja), elige el kana */}
      {ex.type === 'listen' && (
        <div
          className={`corner-frame ${shake ? 'error-shake' : flash ? 'cardPop' : ''}`}
          style={{
            background: C.s1,
            border: `1px solid ${flash ? C.accent : errFlash ? C.err : C.b1}`,
            borderRadius: 18,
            padding: '24px 18px',
            boxShadow: flash
              ? `0 0 32px 6px rgba(140,242,68,.18)`
              : errFlash
              ? `0 0 0 2px rgba(255,59,92,.4)`
              : 'none',
            animation: errFlash ? 'errorFlash .4s ease' : 'none',
            transition: 'border .1s,box-shadow .1s',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: C.t2,
              letterSpacing: 2,
              marginBottom: 16,
              fontWeight: 500,
              textTransform: 'uppercase',
            }}
          >
            {ex.q}
          </div>
          <button
            onClick={() => {
              playPronunciation(ex.romaji || ex.char || '', ex.kana || '', 'kana');
            }}
            aria-label="Reproducir pronunciación"
            style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: C.aD,
              border: `2px solid ${C.accent}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 22px rgba(140,242,68,.25)`,
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 9v6h4l5 4V5L8 9H4z"
                fill={C.accent}
              />
              <path
                d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
                stroke={C.accent}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <div style={{ marginTop: 14 }}>
            {showRomaji || !ttsSupported() ? (
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: 26,
                  fontWeight: 800,
                  color: C.accent,
                  letterSpacing: 1,
                }}
              >
                {ex.romaji}
              </div>
            ) : (
              !answered && (
                <button
                  onClick={() => setShowRomaji(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: C.t3,
                    fontSize: 10,
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                    letterSpacing: 0.5,
                  }}
                >
                  ¿No escuchas el audio? Ver romaji
                </button>
              )
            )}
          </div>
        </div>
      )}
      {ex.type === 'listen' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {(ex.opts || []).map((opt, i) => {
            let bg = C.s2,
              border = `1px solid ${C.b1}`,
              color = C.t1;
            if (answered) {
              if (i === ex.ans) {
                bg = C.okD;
                border = `1px solid ${C.ok}`;
                color = C.ok;
              } else if (i === sel) {
                bg = C.errD;
                border = `1px solid ${C.err}`;
                color = C.err;
              }
            } else if (i === sel) {
              bg = C.aD;
              border = `1px solid ${C.accent}`;
              color = C.accent;
            }
            return (
              <button
                key={i}
                onClick={() => !answered && onAns(i)}
                style={{
                  background: bg,
                  border,
                  color,
                  borderRadius: 14,
                  padding: '12px 6px',
                  fontSize: heroFontSize(opt, 32),
                  fontFamily: C.jp,
                  fontWeight: 700,
                  transition: 'all .15s',
                  minHeight: 64,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  wordBreak: 'keep-all',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {ex.type === 'true_false' && !answered && (
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
        >
          <button
            onClick={() => onAns(0)}
            style={{
              background: C.s2,
              border: `1px solid ${C.b1}`,
              color: C.t1,
              borderRadius: 14,
              padding: '18px',
              fontSize: 20,
              fontWeight: 800,
              transition: 'all .15s',
            }}
          >
            ✕ FALSO
          </button>
          <button
            onClick={() => onAns(1)}
            style={{
              background: C.s2,
              border: `1px solid ${C.b1}`,
              color: C.t1,
              borderRadius: 14,
              padding: '18px',
              fontSize: 20,
              fontWeight: 800,
              transition: 'all .15s',
            }}
          >
            ✓ VERDAD
          </button>
        </div>
      )}
      {ex.type === 'true_false' && answered && (
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
        >
          {[0, 1].map((i) => {
            const isAnsOpt = i === 1;
            const isCorrectOpt = isAnsOpt === ex.ans;
            const wasChosen = i === sel;
            let bg = C.s2,
              border = `1px solid ${C.b1}`,
              color = C.t2;
            if (isCorrectOpt) {
              bg = C.okD;
              border = `1px solid ${C.ok}`;
              color = C.ok;
            } else if (wasChosen && !isCorrectOpt) {
              bg = C.errD;
              border = `1px solid ${C.err}`;
              color = C.err;
            }
            return (
              <button
                key={i}
                style={{
                  background: bg,
                  border,
                  color,
                  borderRadius: 14,
                  padding: '18px',
                  fontSize: 20,
                  fontWeight: 800,
                }}
              >
                {i === 0 ? '✗ FALSO' : '✓ VERDAD'}
              </button>
            );
          })}
        </div>
      )}

      {/* Feedback */}
      {answered && (
        <div
          className="fuF"
          style={{
            background: C.s1,
            border: `1px solid ${
              isCorrect ? 'rgba(140,242,68,.22)' : 'rgba(255,59,92,.16)'
            }`,
            borderRadius: 14,
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: 3,
              fontWeight: 800,
              color: isCorrect ? C.ok : C.err,
              marginBottom: 10,
              textTransform: 'uppercase',
            }}
          >
            {isCorrect ? 'Correcto' : 'Incorrecto'}
          </div>
          {/* Cyberpunk Sci-Fi HUD Announcement Frame */}
          {(() => {
            let targetChar = ex.kana || ex.char || '';
            let label = 'CARÁCTER KANA';
            let mainDisplay = '';
            let romajiDisplay = ex.romaji || '';
            let spanishMeaning = '';
            let mnemonicTip: string | null = null;

            if (ex.type === 'build_sentence' && Array.isArray(ex.ans)) {
              label = 'SINTAXIS & ORACIÓN JAPONESA';
              mainDisplay = ex.ans.join(' ');
              spanishMeaning = ex.q; // La oración traducida en español
              const fullEntry = getVocabEntry(mainDisplay);
              romajiDisplay = fullEntry.romaji !== mainDisplay ? fullEntry.romaji : '';
              mnemonicTip = 'Orden de la sintaxis japonesa: Sujeto + Objeto + Verbo.';
            } else if (ex.type === 'order' && Array.isArray(ex.ans)) {
              label = 'SECUENCIA Y ORDEN CORRECTO';
              mainDisplay = ex.ans.join(' · ');
              spanishMeaning = 'Orden fonético correcto';
              romajiDisplay = ex.ans.map((c) => getVocabEntry(c).romaji).join(' · ');
              mnemonicTip = 'Secuencia oficial del silabario Gojūon.';
            } else if (ex.type === 'pair_match' && ex.pairs) {
              label = 'PAREJAS CORRESPONDIENTES';
              mainDisplay = ex.pairs.map((p) => `${p.right} = ${p.left}`).join('  |  ');
              spanishMeaning = 'Parejas emparejadas correctamente';
              mnemonicTip = 'Asociación directa entre lectura Romaji y símbolo Kana.';
            } else if (ex.type === 'digit_to_kana' || ex.type === 'type_digit') {
              label = 'NUMERACIÓN JAPONESA';
              mainDisplay = `${ex.kana} = ${ex.digit}`;
              romajiDisplay = ex.romaji || '';
              spanishMeaning = getVocabEntry(ex.kana || '').es || `Número ${ex.digit}`;
              mnemonicTip = `Goroawase / Asociación visual del número ${ex.digit}.`;
            } else {
              const vEntry = getVocabEntry(targetChar);
              label = targetChar.length > 1 ? 'VOCABULARIO JAPONÉS' : 'CARÁCTER KANA';
              mainDisplay = targetChar;
              romajiDisplay = ex.romaji || vEntry.romaji;
              spanishMeaning = vEntry.es;
              mnemonicTip = (targetChar && MN[targetChar]) || vEntry.mnemonic || (ex.hint !== vEntry.es ? ex.hint : null);
            }

            return (
              <div
                style={{
                  position: 'relative',
                  background: 'linear-gradient(135deg, rgba(6,25,28,0.95) 0%, rgba(4,14,18,0.98) 100%)',
                  border: `1.5px solid ${isCorrect ? C.cyan : C.err}`,
                  clipPath: 'polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)',
                  boxShadow: `0 0 20px ${isCorrect ? 'rgba(0,194,204,0.22)' : 'rgba(255,59,92,0.22)'}`,
                  padding: '16px 18px',
                  marginBottom: 14,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* HUD Tech Cutouts & Decorative Accents */}
                <div style={{ position: 'absolute', top: 3, left: 16, fontSize: 8, color: C.cyan, opacity: 0.6, letterSpacing: 2, fontFamily: C.title }}>
                  ▲▲ // HUD_NOTICE_01
                </div>
                <div style={{ position: 'absolute', top: 3, right: 16, fontSize: 8, color: C.yellow, opacity: 0.8, letterSpacing: 2, fontFamily: C.mono }}>
                  /// TECH_DATA_01
                </div>

                {/* Cyberpunk HUD Header Banner */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(0,194,204,0.25)',
                    paddingBottom: 8,
                    marginTop: 6,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontFamily: C.title,
                      fontSize: 10,
                      letterSpacing: 3,
                      color: C.cyan,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}
                  >
                    <CyberStar size={13} color={C.cyan} />
                    <span>ANUNCIO FICHA DIDÁCTICA</span>
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      fontFamily: C.mono,
                      color: C.yellow,
                      border: `1px solid ${C.yellow}`,
                      padding: '1px 6px',
                      borderRadius: 3,
                      fontWeight: 700,
                    }}
                  >
                    01
                  </div>
                </div>

                {/* Significant Definition Display Card */}
                <div
                  style={{
                    background: 'rgba(0,194,204,0.06)',
                    borderLeft: `3px solid ${C.ok}`,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <div style={{ fontSize: 9, color: C.t2, fontFamily: C.mono, letterSpacing: 1 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 15, color: C.t1, lineHeight: 1.5, fontWeight: 700 }}>
                    <span style={{ color: C.accent, fontFamily: C.jp, fontSize: 17, fontWeight: 900 }}>
                      {mainDisplay}
                    </span>
                    {romajiDisplay && (
                      <span style={{ color: C.cyan, fontFamily: C.mono, fontSize: 13, marginLeft: 6 }}>
                        [{romajiDisplay}]
                      </span>
                    )}
                    {spanishMeaning && (
                      <>
                        <span style={{ color: C.t2, margin: '0 6px' }}>=</span>
                        <span style={{ color: C.ok, fontWeight: 800 }}>
                          "{spanishMeaning}"
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Mnemonic / Reminder Capsule (100% Vector CyberIcons, Cero Emojis) */}
                {mnemonicTip && (
                  <div
                    style={{
                      background: 'rgba(255,0,205,0.05)',
                      border: `1px dashed ${C.accent}`,
                      borderRadius: 8,
                      padding: '8px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 8,
                        color: C.accent,
                        fontFamily: C.title,
                        letterSpacing: 2,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <CyberMemory size={11} color={C.accent} />
                      <span>RECORDATORIO & MNEMOTECNIA</span>
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: C.t1,
                        lineHeight: 1.4,
                        fontWeight: 400,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 6,
                        marginTop: 2,
                      }}
                    >
                      <CyberCaution size={12} color={C.accent} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{mnemonicTip}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
          <Ghost
            onClick={onNext}
            style={{
              width: '100%',
              padding: '11px',
              letterSpacing: 2,
              fontSize: 10,
              textTransform: 'uppercase',
            }}
          >
            {idx < total - 1 ? 'Siguiente →' : 'Ver Resultado →'}
          </Ghost>
        </div>
      )}
    </div>
  );
}
