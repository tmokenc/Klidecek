// Q-learning on a 5×5 gridworld — Q-table updates, ε-greedy policy, convergence trace.
import { useState, useMemo, useEffect } from "react";

const COLS = 5, ROWS = 5;
const ACTIONS = ["↑", "↓", "←", "→"];
const ACTION_DELTAS = [[0, -1], [0, 1], [-1, 0], [1, 0]];

const REWARD_GRID = (() => {
  const r = Array.from({ length: ROWS }, () => Array(COLS).fill(-0.04));
  r[0][4] = 1.0;   // goal
  r[1][4] = -1.0;  // trap
  r[2][2] = null;  // wall
  return r;
})();

const START = [0, 4]; // (col, row) — bottom-left

function isTerminal(c, r) {
  return REWARD_GRID[r] && (REWARD_GRID[r][c] === 1 || REWARD_GRID[r][c] === -1);
}

function isWall(c, r) {
  return REWARD_GRID[r] && REWARD_GRID[r][c] === null;
}

function stepEnv(c, r, a) {
  const [dc, dr] = ACTION_DELTAS[a];
  let nc = c + dc, nr = r + dr;
  if (nc < 0 || nc >= COLS || nr < 0 || nr >= ROWS || isWall(nc, nr)) {
    nc = c; nr = r;
  }
  const reward = REWARD_GRID[nr][nc] === null ? 0 : REWARD_GRID[nr][nc];
  const done = isTerminal(nc, nr);
  return { nc, nr, reward, done };
}

function makeQ() {
  const q = {};
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (isWall(c, r)) continue;
      q[`${c},${r}`] = [0, 0, 0, 0];
    }
  }
  return q;
}

function epsilonGreedy(q, c, r, eps, rng) {
  if (rng() < eps) return Math.floor(rng() * 4);
  const arr = q[`${c},${r}`];
  let best = 0;
  for (let i = 1; i < 4; i++) if (arr[i] > arr[best]) best = i;
  return best;
}

// Seeded RNG (Mulberry32)
function rngFactory(seed) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function runEpisodes(numEpisodes, alpha, gamma, eps, seed) {
  const rng = rngFactory(seed);
  const q = makeQ();
  const trace = [];
  let returnsHist = [];

  trace.push({ episode: 0, q: cloneQ(q), agentPos: START, lastReward: null, totalReturn: null });

  for (let ep = 0; ep < numEpisodes; ep++) {
    let [c, r] = START;
    let totalR = 0;
    let safety = 0;
    while (safety++ < 200) {
      if (isTerminal(c, r)) break;
      const a = epsilonGreedy(q, c, r, eps, rng);
      const { nc, nr, reward, done } = stepEnv(c, r, a);
      const k = `${c},${r}`;
      const kn = `${nc},${nr}`;
      const oldQ = q[k][a];
      const futureQ = done || isTerminal(nc, nr) ? 0 : Math.max(...q[kn]);
      const target = reward + gamma * futureQ;
      q[k][a] = oldQ + alpha * (target - oldQ);
      totalR += reward;
      c = nc; r = nr;
      if (done) break;
    }
    returnsHist.push(totalR);
    trace.push({ episode: ep + 1, q: cloneQ(q), agentPos: [c, r], lastReward: totalR, totalReturn: totalR });
  }
  return { trace, returnsHist };
}

function cloneQ(q) {
  const out = {};
  for (const k in q) out[k] = [...q[k]];
  return out;
}

export default function QLearningGridworld() {
  const [alpha, setAlpha] = useState(0.3);
  const [gamma, setGamma] = useState(0.9);
  const [eps, setEps] = useState(0.2);
  const [episodes, setEpisodes] = useState(100);
  const [seed, setSeed] = useState(42);

  const { trace, returnsHist } = useMemo(() => runEpisodes(episodes, alpha, gamma, eps, seed), [episodes, alpha, gamma, eps, seed]);
  const [scrub, setScrub] = useState(episodes);
  useEffect(() => { setScrub(episodes); }, [episodes]);

  const frame = trace[Math.min(scrub, trace.length - 1)];

  const CELL = 56;
  const W = COLS * CELL;
  const H = ROWS * CELL;

  // Best action and value per cell from current Q
  function bestAction(c, r) {
    if (isWall(c, r) || isTerminal(c, r)) return null;
    const arr = frame.q[`${c},${r}`];
    let best = 0;
    for (let i = 1; i < 4; i++) if (arr[i] > arr[best]) best = i;
    return best;
  }
  function maxQ(c, r) {
    if (isWall(c, r) || isTerminal(c, r)) return null;
    return Math.max(...frame.q[`${c},${r}`]);
  }

  const allMaxQ = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const v = maxQ(c, r);
    if (v !== null) allMaxQ.push(v);
  }
  const qMin = Math.min(...allMaxQ, 0), qMax = Math.max(...allMaxQ, 1);

  function cellFill(c, r) {
    if (isWall(c, r)) return "var(--text-faint)";
    if (REWARD_GRID[r][c] === 1) return "oklch(0.75 0.18 145)";
    if (REWARD_GRID[r][c] === -1) return "oklch(0.6 0.22 25)";
    const v = maxQ(c, r);
    if (v === null) return "var(--bg-card)";
    const t = (v - qMin) / (qMax - qMin + 1e-9);
    return `oklch(${0.85 - t * 0.3} 0.05 ${145 + t * 60})`;
  }

  function arrowFor(a) { return ACTIONS[a]; }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          α
          <input type="range" min={0.05} max={1} step={0.05} value={alpha} onChange={(e) => setAlpha(+e.target.value)} style={{ width: 70 }}/>
          <span style={{ minWidth: 30 }}>{alpha.toFixed(2)}</span>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          γ
          <input type="range" min={0.1} max={0.99} step={0.01} value={gamma} onChange={(e) => setGamma(+e.target.value)} style={{ width: 70 }}/>
          <span style={{ minWidth: 30 }}>{gamma.toFixed(2)}</span>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          ε
          <input type="range" min={0} max={1} step={0.05} value={eps} onChange={(e) => setEps(+e.target.value)} style={{ width: 70 }}/>
          <span style={{ minWidth: 30 }}>{eps.toFixed(2)}</span>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          episodes
          <input type="range" min={10} max={500} step={10} value={episodes} onChange={(e) => setEpisodes(+e.target.value)} style={{ width: 90 }}/>
          <span style={{ minWidth: 30 }}>{episodes}</span>
        </label>
        <button onClick={() => setSeed((s) => s + 1)} style={btnStyle()}>nový seed</button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, maxWidth: "100%", display: "block" }}>
          <rect width={W} height={H} fill="var(--bg-inset)"/>
          {Array.from({ length: ROWS }).map((_, r) =>
            Array.from({ length: COLS }).map((_, c) => {
              const x = c * CELL, y = r * CELL;
              const v = maxQ(c, r);
              return (
                <g key={`${c}-${r}`}>
                  <rect x={x} y={y} width={CELL} height={CELL}
                    fill={cellFill(c, r)} stroke="var(--line)" strokeWidth="0.5"/>
                  {REWARD_GRID[r][c] === 1 && (
                    <text x={x + CELL / 2} y={y + CELL / 2 + 4} textAnchor="middle" fontSize="20" fontWeight="700" fill="white">+1</text>
                  )}
                  {REWARD_GRID[r][c] === -1 && (
                    <text x={x + CELL / 2} y={y + CELL / 2 + 4} textAnchor="middle" fontSize="20" fontWeight="700" fill="white">−1</text>
                  )}
                  {!isWall(c, r) && !isTerminal(c, r) && (
                    <>
                      {(() => {
                        const a = bestAction(c, r);
                        return a !== null && (
                          <text x={x + CELL / 2} y={y + CELL / 2 + 6} textAnchor="middle" fontSize="20" fill="var(--text)">
                            {arrowFor(a)}
                          </text>
                        );
                      })()}
                      <text x={x + CELL / 2} y={y + CELL - 4} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                        {v !== null ? v.toFixed(2) : ""}
                      </text>
                    </>
                  )}
                </g>
              );
            })
          )}
          {/* start marker */}
          <circle cx={START[0] * CELL + CELL / 2} cy={START[1] * CELL + 8} r="5" fill="var(--accent)" stroke="white" strokeWidth="1"/>
        </svg>

        {/* Return curve */}
        <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
            average return per epizodu
          </div>
          <svg viewBox="0 0 240 140" style={{ width: "100%", maxWidth: 280 }}>
            <rect width="240" height="140" fill="var(--bg-inset)"/>
            {returnsHist.length > 1 && (() => {
              const minR = Math.min(...returnsHist), maxR = Math.max(...returnsHist);
              const range = maxR - minR + 0.0001;
              // smoothed (moving average)
              const window = Math.max(1, Math.floor(returnsHist.length / 30));
              const smoothed = returnsHist.map((_, i) => {
                const start = Math.max(0, i - window);
                const slice = returnsHist.slice(start, i + 1);
                return slice.reduce((a, b) => a + b, 0) / slice.length;
              });
              const path = smoothed.map((v, i) => {
                const x = 10 + (i / (returnsHist.length - 1)) * 220;
                const y = 130 - ((v - minR) / range) * 110;
                return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
              }).join(" ");
              return (
                <>
                  <line x1="10" y1="20" x2="10" y2="130" stroke="var(--line)" strokeWidth="0.5"/>
                  <line x1="10" y1="130" x2="230" y2="130" stroke="var(--line)" strokeWidth="0.5"/>
                  <path d={path} stroke="var(--accent)" strokeWidth="1.6" fill="none"/>
                  <text x="14" y="16" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">{maxR.toFixed(2)}</text>
                  <text x="14" y="135" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">{minR.toFixed(2)}</text>
                  <text x="226" y="135" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)" textAnchor="end">{returnsHist.length}</text>
                </>
              );
            })()}
          </svg>
          <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            poslední 10 ep. ⌀: {returnsHist.slice(-10).reduce((a, b) => a + b, 0) / Math.min(10, returnsHist.length || 1)}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 10.5, alignItems: "center" }}>
        <span style={{ color: "var(--text-faint)" }}>
          Q(s, a) ← Q(s, a) + α [r + γ · max Q(s&apos;, ·) − Q(s, a)]
        </span>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        ε-greedy explorace: s prav. ε zkusí náhodnou akci, jinak max-Q. Velké ε = lepší explorace, pomalejší konvergence.
        Snižte ε → policy je rychlejší ale může uváznout v suboptimálních cestách. Klasický exploration-exploitation tradeoff.
      </div>
    </div>
  );
}

function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 8px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
