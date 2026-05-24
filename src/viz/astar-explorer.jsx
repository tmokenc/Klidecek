// A* on a grid — heuristic picker, step-through expansion, path trace.
import { useState, useMemo, useEffect } from "react";

const COLS = 14;
const ROWS = 9;

// 1 = wall, 0 = open. Three preset maps with deliberately different topology.
const MAPS = {
  "open": {
    label: "open prostor",
    grid: makeGrid(COLS, ROWS, () => 0),
    start: [1, 4],
    goal: [12, 4],
  },
  "wall": {
    label: "rovná zeď",
    grid: (() => {
      const g = makeGrid(COLS, ROWS, () => 0);
      for (let r = 1; r < 8; r++) g[r][7] = 1;
      g[4][7] = 0;
      return g;
    })(),
    start: [1, 4],
    goal: [12, 4],
  },
  "maze": {
    label: "bludiště",
    grid: (() => {
      const g = makeGrid(COLS, ROWS, () => 0);
      [[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],
       [9,1],[10,1],[11,1],[12,1],
       [3,3],[3,4],[3,5],[3,6],[3,7],
       [5,3],[6,3],[7,3],[8,3],[9,3],[10,3],
       [10,4],[10,5],[10,6],[10,7],
       [5,5],[6,5],[7,5],[8,5],
       [5,7],[6,7],[7,7],[8,7]
      ].forEach(([c, r]) => { g[r][c] = 1; });
      return g;
    })(),
    start: [1, 0],
    goal: [12, 8],
  },
};

const HEURISTICS = {
  "zero": { label: "h₀ = 0  (≡ UCS)", fn: () => 0 },
  "manhattan": { label: "h₁ = Manhattan", fn: (a, b) => Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]) },
  "euclidean": { label: "h₂ = Euklid",  fn: (a, b) => Math.hypot(a[0]-b[0], a[1]-b[1]) },
  "inflated":  { label: "h₃ = 3·Manhattan  (neadmis.)", fn: (a, b) => 3 * (Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1])) },
};

function makeGrid(c, r, f) {
  const g = [];
  for (let y = 0; y < r; y++) {
    const row = [];
    for (let x = 0; x < c; x++) row.push(f(x, y));
    g.push(row);
  }
  return g;
}

function key([x, y]) { return `${x},${y}`; }

function computeTrace(mapKey, hKey) {
  const m = MAPS[mapKey];
  const h = HEURISTICS[hKey].fn;
  const grid = m.grid;
  const start = m.start;
  const goal = m.goal;

  const open = new Map();
  const closed = new Set();
  const gScore = new Map();
  const fScore = new Map();
  const parent = new Map();
  gScore.set(key(start), 0);
  fScore.set(key(start), h(start, goal));
  open.set(key(start), { node: start, g: 0, h: h(start, goal), f: h(start, goal) });

  const trace = [];
  trace.push({
    kind: "init",
    open: new Map(open),
    closed: new Set(closed),
    gScore: new Map(gScore),
    fScore: new Map(fScore),
    current: null,
    path: null,
  });

  let safety = 0;
  while (open.size > 0 && safety++ < 500) {
    // pick min-f
    let bestK = null, bestF = Infinity;
    for (const [k, v] of open) if (v.f < bestF) { bestF = v.f; bestK = k; }
    const cur = open.get(bestK);
    open.delete(bestK);
    closed.add(bestK);

    if (cur.node[0] === goal[0] && cur.node[1] === goal[1]) {
      // reconstruct
      const path = [];
      let p = key(cur.node);
      while (p) { path.push(p); p = parent.get(p); }
      path.reverse();
      trace.push({
        kind: "done",
        open: new Map(open),
        closed: new Set(closed),
        gScore: new Map(gScore),
        fScore: new Map(fScore),
        current: cur.node,
        path,
      });
      return trace;
    }

    trace.push({
      kind: "expand",
      open: new Map(open),
      closed: new Set(closed),
      gScore: new Map(gScore),
      fScore: new Map(fScore),
      current: cur.node,
      path: null,
    });

    const [cx, cy] = cur.node;
    const neigh = [[cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]];
    for (const n of neigh) {
      const [nx, ny] = n;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      if (grid[ny][nx] === 1) continue;
      const nk = key(n);
      if (closed.has(nk)) continue;
      const tentG = cur.g + 1;
      const oldG = gScore.has(nk) ? gScore.get(nk) : Infinity;
      if (tentG < oldG) {
        parent.set(nk, key(cur.node));
        gScore.set(nk, tentG);
        const hv = h(n, goal);
        fScore.set(nk, tentG + hv);
        open.set(nk, { node: n, g: tentG, h: hv, f: tentG + hv });
      }
    }
  }

  trace.push({
    kind: "fail",
    open: new Map(open),
    closed: new Set(closed),
    gScore: new Map(gScore),
    fScore: new Map(fScore),
    current: null,
    path: null,
  });
  return trace;
}

export default function AstarExplorer() {
  const [mapKey, setMapKey] = useState("wall");
  const [hKey, setHKey] = useState("manhattan");
  const [step, setStep] = useState(0);

  const trace = useMemo(() => computeTrace(mapKey, hKey), [mapKey, hKey]);
  const maxStep = trace.length - 1;
  useEffect(() => { setStep(0); }, [mapKey, hKey]);
  const cur = trace[Math.min(step, maxStep)];

  const m = MAPS[mapKey];
  const CELL = 30;
  const W = COLS * CELL;
  const H = ROWS * CELL;

  function cellFill(x, y) {
    if (m.grid[y][x] === 1) return "var(--text-faint)";
    const k = `${x},${y}`;
    if (cur.path && cur.path.includes(k)) return "oklch(0.75 0.18 145)";
    if (cur.current && cur.current[0] === x && cur.current[1] === y) return "oklch(0.7 0.18 60)";
    if (cur.closed.has(k)) return "color-mix(in oklch, var(--accent) 30%, var(--bg-card))";
    if (cur.open.has(k)) return "color-mix(in oklch, var(--accent) 18%, var(--bg-card))";
    return "var(--bg-card)";
  }

  function cellLabel(x, y) {
    if (m.grid[y][x] === 1) return null;
    const k = `${x},${y}`;
    if (!cur.gScore.has(k)) return null;
    const g = cur.gScore.get(k);
    const f = cur.fScore.get(k);
    return { g, f, h: f - g };
  }

  const closedCount = cur.closed.size;
  const openCount = cur.open.size;
  const pathLen = cur.path ? cur.path.length - 1 : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>mapa:</span>
          <select value={mapKey} onChange={(e) => setMapKey(e.target.value)}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 4px", borderRadius: 3 }}>
            {Object.entries(MAPS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>heuristika:</span>
          <select value={hKey} onChange={(e) => setHKey(e.target.value)}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 4px", borderRadius: 3 }}>
            {Object.entries(HEURISTICS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setStep(0)}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 3, fontSize: 11, cursor: "pointer" }}>
            ⏮ reset
          </button>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 3, fontSize: 11, cursor: "pointer" }}>
            ◀
          </button>
          <button onClick={() => setStep((s) => Math.min(maxStep, s + 1))}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 3, fontSize: 11, cursor: "pointer" }}>
            ▶
          </button>
          <button onClick={() => setStep(maxStep)}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 3, fontSize: 11, cursor: "pointer" }}>
            ⏭
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 560 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {Array.from({ length: ROWS }).map((_, y) =>
          Array.from({ length: COLS }).map((_, x) => {
            const isStart = m.start[0] === x && m.start[1] === y;
            const isGoal = m.goal[0] === x && m.goal[1] === y;
            const label = cellLabel(x, y);
            return (
              <g key={`${x}-${y}`}>
                <rect x={x * CELL} y={y * CELL} width={CELL} height={CELL}
                  fill={cellFill(x, y)} stroke="var(--line)" strokeWidth="0.5" />
                {label && (
                  <>
                    <text x={x * CELL + 4} y={y * CELL + 10} fontSize="7.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                      g={label.g}
                    </text>
                    <text x={x * CELL + 4} y={y * CELL + 19} fontSize="7.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                      h={label.h.toFixed(1)}
                    </text>
                    <text x={x * CELL + CELL / 2} y={y * CELL + CELL - 4} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text)" textAnchor="middle" fontWeight="600">
                      f={label.f.toFixed(1)}
                    </text>
                  </>
                )}
                {isStart && (
                  <text x={x * CELL + CELL / 2} y={y * CELL + CELL / 2 + 3} fontSize="10" fontWeight="600" textAnchor="middle" fill="var(--text)">S</text>
                )}
                {isGoal && (
                  <text x={x * CELL + CELL / 2} y={y * CELL + CELL / 2 + 3} fontSize="10" fontWeight="600" textAnchor="middle" fill="var(--text)">G</text>
                )}
              </g>
            );
          })
        )}
      </svg>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        <span>krok {step}/{maxStep}</span>
        <span>closed: {closedCount}</span>
        <span>open: {openCount}</span>
        {pathLen !== null && (
          <span style={{ color: "oklch(0.75 0.18 145)" }}>cesta: {pathLen} kroků</span>
        )}
        {cur.kind === "done" && (
          <span style={{ color: "oklch(0.75 0.18 145)" }}>✓ cíl nalezen</span>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 10.5, alignItems: "center" }}>
        <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
          <span style={{ display: "inline-block", width: 12, height: 12, background: "color-mix(in oklch, var(--accent) 18%, var(--bg-card))", border: "1px solid var(--line)" }}/>
          frontier (open)
        </span>
        <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
          <span style={{ display: "inline-block", width: 12, height: 12, background: "color-mix(in oklch, var(--accent) 30%, var(--bg-card))", border: "1px solid var(--line)" }}/>
          expandované (closed)
        </span>
        <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
          <span style={{ display: "inline-block", width: 12, height: 12, background: "oklch(0.7 0.18 60)", border: "1px solid var(--line)" }}/>
          aktuální
        </span>
        <span style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
          <span style={{ display: "inline-block", width: 12, height: 12, background: "oklch(0.75 0.18 145)", border: "1px solid var(--line)" }}/>
          nalezená cesta
        </span>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Porovnejte h₀ (= UCS, expanduje široce do všech směrů) vs h₂ (žene se přímo k cíli) na stejné mapě.
        Heuristika h₃ je 3× nadhodnocená — najde cestu *rychleji*, ale není garantovaně optimální.
      </div>
    </div>
  );
}
