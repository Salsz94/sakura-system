import { C } from '../styles/tokens';
import { Ghost } from '../components/Ghost';
import type { Module, MasteryMap, ModuleLives } from '../core/types';

interface MapScreenProps {
  modules: Module[];
  doneLs: string[];
  passedEx: string[];
  mastery: MasteryMap;
  moduleLives: ModuleLives;
  isModUnlocked: (mod: Module) => boolean;
  isExamUnlocked: (mod: Module) => boolean;
  isExamPassed: (mod: Module) => boolean;
  getModLives: (modId: string) => number;
  onOpenModule: (mod: Module) => void;
  onExam: (mod: Module) => void;
  onBack: () => void;
}

const NODE_R = 20;
const BOSS_R = 11;
const ROW_H = 96;
const PATH_W = 320;
const X_LEFT = 76;
const X_RIGHT = 244;
const CHAMFER = 9;

/** Traza ortogonal tipo circuito (vertical-horizontal-vertical) con esquinas
 * cortadas a 45° en vez de curvas orgánicas — look de PCB/HUD cyberpunk. */
function manhattanPath(nodes: { x: number; y: number }[]): string {
  if (nodes.length === 0) return '';
  let d = `M ${nodes[0].x} ${nodes[0].y}`;
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i - 1];
    const b = nodes[i];
    if (a.x === b.x) {
      d += ` L ${b.x} ${b.y}`;
      continue;
    }
    const midY = (a.y + b.y) / 2;
    const dir = b.x > a.x ? 1 : -1;
    d += ` L ${a.x} ${midY - CHAMFER}`;
    d += ` L ${a.x + dir * CHAMFER} ${midY}`;
    d += ` L ${b.x - dir * CHAMFER} ${midY}`;
    d += ` L ${b.x} ${midY + CHAMFER}`;
    d += ` L ${b.x} ${b.y}`;
  }
  return d;
}

/** Polígono de esquinas cortadas (chaflán) — el nodo del mapa. */
function chamferNodePoints(cx: number, cy: number, r: number, c: number): string {
  const l = cx - r, right = cx + r, t = cy - r, b = cy + r;
  return [
    [l + c, t], [right - c, t], [right, t + c], [right, b - c],
    [right - c, b], [l + c, b], [l, b - c], [l, t + c],
  ]
    .map((p) => p.join(','))
    .join(' ');
}

export function MapScreen({
  modules,
  doneLs,
  passedEx,
  isModUnlocked,
  isExamUnlocked,
  isExamPassed,
  onOpenModule,
  onExam,
  onBack,
}: MapScreenProps) {
  const visibleModules = modules;

  const activeMod = modules.find(
    (m) => !passedEx.includes(m.id) && isModUnlocked(m)
  );
  const activeIdx = activeMod ? visibleModules.indexOf(activeMod) : -1;

  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);
  const doneLessons = doneLs.length;
  const overallPct =
    totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;
  const lessonsToNextBlock = activeMod
    ? activeMod.lessons.filter((l) => !doneLs.includes(l.id)).length
    : 0;

  const nodeX = (i: number) => (i % 2 === 0 ? X_LEFT : X_RIGHT);
  const nodeY = (i: number) => 50 + i * ROW_H;
  const bossX = (i: number) => (i % 2 === 0 ? X_LEFT + 54 : X_RIGHT - 54);
  const svgH = visibleModules.length > 0 ? 50 + (visibleModules.length - 1) * ROW_H + 50 : 100;

  const allNodePts = visibleModules.map((_, i) => ({ x: nodeX(i), y: nodeY(i) }));
  const pathD = manhattanPath(allNodePts);
  const traveledD = activeIdx > 0 ? manhattanPath(allNodePts.slice(0, activeIdx + 1)) : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Cabecera dojo */}
      <div
        className="fu"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2,
        }}
      >
        <Ghost onClick={onBack}>← DOJO</Ghost>
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
          Mapa de Aprendizaje
        </div>
      </div>

      {/* Resumen de avance general */}
      <div
        className="fu2 corner-frame"
        style={{
          background: C.s1,
          border: `1px solid ${C.b1}`,
          borderRadius: 16,
          padding: '16px 18px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 8,
          }}
        >
          <div
            style={{
              fontSize: 9,
              letterSpacing: 2,
              color: C.t2,
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Avance general
          </div>
          <div style={{ fontFamily: C.mono, fontSize: 13, color: C.accent, fontWeight: 700 }}>
            {overallPct}%
          </div>
        </div>
        <div style={{ height: 4, background: C.b1, borderRadius: 2, overflow: 'hidden', marginBottom: 10 }}>
          <div
            style={{
              width: `${overallPct}%`,
              height: '100%',
              background: `linear-gradient(90deg,${C.accent},${C.accent2})`,
              transition: 'width .8s cubic-bezier(.22,1,.36,1)',
            }}
          />
        </div>
        {activeMod ? (
          <div style={{ fontSize: 11, color: C.t2 }}>
            Estás en{' '}
            <span style={{ color: C.accent, fontWeight: 700 }}>
              Bloque {activeMod.block} — {activeMod.sub}
            </span>
            {lessonsToNextBlock > 0 ? (
              <> · faltan <span style={{ color: C.t1, fontWeight: 700 }}>{lessonsToNextBlock}</span> lecciones para el boss</>
            ) : (
              <> · el boss te espera</>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: C.ok }}>Sílabo completado — has dominado todos los bloques.</div>
        )}
      </div>

      {/* Mundo — mapa visual tipo videojuego */}
      <div
        className="fu3 corner-frame"
        style={{
          background: C.s1,
          border: `1px solid ${C.b1}`,
          borderRadius: 18,
          padding: '10px 6px',
          overflow: 'hidden',
        }}
      >
        <svg width="100%" viewBox={`0 0 ${PATH_W} ${svgH}`} style={{ display: 'block' }}>
          {/* Traza base (circuito) */}
          <path d={pathD} fill="none" stroke={C.b1} strokeWidth={3} />
          {/* Traza recorrida hasta el módulo activo */}
          {traveledD && (
            <path d={traveledD} fill="none" stroke={C.accent} strokeWidth={3} opacity={0.75} />
          )}

          {visibleModules.map((mod, i) => {
            const unlocked = isModUnlocked(mod);
            const examReady = isExamUnlocked(mod);
            const examDone = isExamPassed(mod);
            const isCurrent = activeMod?.id === mod.id;
            const x = nodeX(i);
            const y = nodeY(i);
            const bx = bossX(i);
            const showBoss = examReady || examDone;
            return (
              <g key={mod.id}>
                {/* Nodo del módulo → abre sus lecciones */}
                <g
                  onClick={() => unlocked && onOpenModule(mod)}
                  style={{ cursor: unlocked ? 'pointer' : 'default' }}
                >
                  {isCurrent && (
                    <g style={{ animation: 'mapBounce 1.4s ease-in-out infinite' }}>
                      <text
                        x={x}
                        y={y - NODE_R - 14}
                        textAnchor="middle"
                        fontFamily={C.mono}
                        fontSize={7.5}
                        fontWeight={800}
                        letterSpacing={0.5}
                        fill={C.accent}
                      >
                        [ ESTÁS AQUÍ ]
                      </text>
                      <polyline
                        points={`${x - 4},${y - NODE_R - 6} ${x},${y - NODE_R} ${x + 4},${y - NODE_R - 6}`}
                        fill="none"
                        stroke={C.accent}
                        strokeWidth={1.6}
                      />
                    </g>
                  )}
                  <polygon
                    points={chamferNodePoints(x, y, NODE_R, CHAMFER)}
                    fill={examDone ? C.ok : unlocked ? C.s2 : C.b1}
                    stroke={examDone ? C.ok : isCurrent ? C.accent : unlocked ? C.b2 : C.b1}
                    strokeWidth={isCurrent ? 2.5 : 1.5}
                    style={isCurrent ? { filter: `drop-shadow(0 0 6px rgba(140,242,68,.55))` } : undefined}
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fontFamily={C.mono}
                    fontSize={13}
                    fontWeight={800}
                    fill={examDone ? '#04000D' : unlocked ? C.t1 : C.t3}
                  >
                    {examDone ? '✓' : String(modules.indexOf(mod) + 1).padStart(2, '0')}
                  </text>
                  <text
                    x={x}
                    y={y + NODE_R + 16}
                    textAnchor="middle"
                    fontFamily={C.mono}
                    fontSize={6.5}
                    fontWeight={600}
                    letterSpacing={0.3}
                    fill={unlocked ? C.t2 : C.t3}
                    style={{ textTransform: 'uppercase' }}
                  >
                    {mod.sub.length > 20 ? mod.sub.slice(0, 18) + '…' : mod.sub}
                  </text>
                </g>

                {/* Nodo boss (satélite) → aparece al terminar el módulo */}
                {showBoss && (
                  <g
                    onClick={() => !examDone && onExam(mod)}
                    style={{ cursor: examDone ? 'default' : 'pointer' }}
                  >
                    <line
                      x1={x + (i % 2 === 0 ? NODE_R - 4 : -(NODE_R - 4))}
                      y1={y}
                      x2={bx}
                      y2={y}
                      stroke={examDone ? C.ok : C.err}
                      strokeWidth={2}
                      opacity={0.6}
                    />
                    <polygon
                      points={chamferNodePoints(bx, y, BOSS_R, 5)}
                      fill={examDone ? C.ok : C.s1}
                      stroke={examDone ? C.ok : C.err}
                      strokeWidth={2}
                      style={
                        !examDone
                          ? { filter: `drop-shadow(0 0 5px rgba(255,59,92,.5))`, animation: 'pulse 2.2s ease infinite' }
                          : undefined
                      }
                    />
                    <text
                      x={bx}
                      y={y + 3.5}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight={800}
                      fill={examDone ? '#04000D' : C.err}
                    >
                      {examDone ? '✓' : '★'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
