// MDP gridworld — value iteration or policy iteration; arrows show policy.
import { useState, useEffect } from "react";

// 5x5 grid. Cells: 0 = empty, 1 = wall, 2 = goal (+1), 3 = pit (-1)
const GRID = [
  [0, 0, 0, 0, 2],
  [0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0],
  [0, 1, 1, 0, 3],
  [0, 0, 0, 0, 0],
];
const ROWS = GRID.length, COLS = GRID[0].length;
const ACTIONS = [[-1, 0], [0, 1], [1, 0], [0, -1]];  // N, E, S, W
const ACTION_LABEL = ["↑", "→", "↓", "←"];

function nextState(r, c, ai, slip) {
  // With prob (1-slip) goes intended; with slip splits into perpendicular directions
  const intended = ACTIONS[ai];
  const perp1 = ACTIONS[(ai + 1) % 4];
  const perp2 = ACTIONS[(ai + 3) % 4];
  return [
    { prob: 1 - slip, to: tryMove(r, c, intended) },
    { prob: slip / 2,  to: tryMove(r, c, perp1) },
    { prob: slip / 2,  to: tryMove(r, c, perp2) },
  ];
}

function tryMove(r, c, [dr, dc]) {
  const nr = r + dr, nc = c + dc;
  if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || GRID[nr][nc] === 1) return [r, c];
  return [nr, nc];
}

function reward(r, c) {
  if (GRID[r][c] === 2) return 1;
  if (GRID[r][c] === 3) return -1;
  return -0.04;  // step cost
}

function isTerminal(r, c) {
  return GRID[r][c] === 2 || GRID[r][c] === 3;
}

export default function MdpGridworldPolicy() {
  const [V, setV] = useState(() => Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [policy, setPolicy] = useState(() => Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const [k, setK] = useState(0);
  const [gamma, setGamma] = useState(0.9);
  const [slip, setSlip] = useState(0.2);

  function bellmanBackup(curV) {
    const newV = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    const newPol = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (GRID[r][c] === 1) { newV[r][c] = 0; continue; }
        if (isTerminal(r, c)) {
          newV[r][c] = reward(r, c);
          continue;
        }
        let best = -Infinity, bestA = 0;
        for (let a = 0; a < 4; a++) {
          let q = 0;
          for (const { prob, to } of nextState(r, c, a, slip)) {
            const [tr, tc] = to;
            q += prob * (reward(tr, tc) + gamma * curV[tr][tc]);
          }
          if (q > best) { best = q; bestA = a; }
        }
        newV[r][c] = best;
        newPol[r][c] = bestA;
      }
    }
    return [newV, newPol];
  }

  function step() {
    const [newV, newPol] = bellmanBackup(V);
    setV(newV);
    setPolicy(newPol);
    setK(k + 1);
  }

  function reset() {
    setV(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setPolicy(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
    setK(0);
  }

  // Re-reset when params change
  useEffect(() => { reset(); }, [gamma, slip]);

  // Render
  const W = 540, H = 340;
  const CELL = 56;
  const gridW = COLS * CELL;
  const offsetX = (W - gridW) / 2;
  const offsetY = 18;
  const minV = Math.min(...V.flat());
  const maxV = Math.max(...V.flat());

  const valueColor = (v) => {
    if (v >= 0) {
      const t = maxV > 0 ? v / maxV : 0;
      return `rgba(50, 180, 90, ${0.15 + 0.5 * t})`;
    }
    const t = minV < 0 ? v / minV : 0;
    return `rgba(220, 90, 90, ${0.15 + 0.5 * t})`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {V.map((row, r) => row.map((v, c) => {
          const x = offsetX + c * CELL, y = offsetY + r * CELL;
          if (GRID[r][c] === 1) {
            return <rect key={`${r}-${c}`} x={x} y={y} width={CELL} height={CELL} fill="var(--text-muted)" opacity="0.6" stroke="var(--line)" />;
          }
          const isGoal = GRID[r][c] === 2;
          const isPit = GRID[r][c] === 3;
          return (
            <g key={`${r}-${c}`}>
              <rect x={x} y={y} width={CELL} height={CELL} fill={valueColor(v)} stroke="var(--line)" />
              {isGoal && <text x={x + CELL / 2} y={y + CELL / 2 + 5} textAnchor="middle" fontSize="20" fill="var(--accent)" fontFamily="var(--font-mono)">+1</text>}
              {isPit && <text x={x + CELL / 2} y={y + CELL / 2 + 5} textAnchor="middle" fontSize="20" fill="var(--accent-line)" fontFamily="var(--font-mono)">−1</text>}
              {!isGoal && !isPit && (
                <>
                  <text x={x + CELL / 2} y={y + 16} textAnchor="middle" fontSize="11" fill="var(--text)" fontFamily="var(--font-mono)">{v.toFixed(2)}</text>
                  {k > 0 && (
                    <text x={x + CELL / 2} y={y + CELL / 2 + 14} textAnchor="middle" fontSize="22" fill="var(--accent)" fontFamily="var(--font-mono)">{ACTION_LABEL[policy[r][c]]}</text>
                  )}
                </>
              )}
            </g>
          );
        }))}

        <text x={W / 2} y={H - 14} textAnchor="middle" fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">
          V(s) zobrazené v každé buňce; po prvním kroku se zobrazí i optimální akce.
        </text>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={step} style={btn(false)}>krok VI →</button>
        <button onClick={() => { for (let i = 0; i < 50; i++) step(); }} style={btn(false)}>×50 kroků</button>
        <button onClick={reset} style={btn(false)}>reset</button>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>iterace = {k}</span>
        <label style={lab()}>γ = {gamma.toFixed(2)}
          <input type="range" min={0.5} max={0.99} step={0.01} value={gamma} onChange={(e) => setGamma(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>p(slip) = {slip.toFixed(2)}
          <input type="range" min={0} max={0.5} step={0.05} value={slip} onChange={(e) => setSlip(+e.target.value)} style={{ width: "100%" }} />
        </label>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        Bellmanův operátor V(s) ← max<sub>a</sub> Σ P(s, a, s') [r(s') + γ V(s')]. Cílový stav +1, pit −1, krok −0.04.
        Slip prob: agent uklouzne s pravděpodobností {(slip * 100).toFixed(0)}% kolmo k zamýšlené akci. Zmenšete γ — vidíte kratší plán; zvětšete slip — vidíte „opatrnější" politiku obcházející pit.
      </div>
    </div>
  );
}

function btn(active) { return { padding: "4px 10px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function lab() { return { flex: "0 1 180px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
