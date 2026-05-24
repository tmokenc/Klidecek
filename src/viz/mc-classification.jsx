// Markov chain classification — SCCs, transient/recurrent, period.
import { useState } from "react";

const PRESETS = {
  ex1: {
    label: "ex 1: 5 stavů, 2 třídy",
    states: ["s₀", "s₁", "s₂", "s₃", "s₄"],
    pos: [[80, 80], [180, 180], [320, 110], [430, 70], [430, 200]],
    edges: [
      [0, 1, 0.4], [0, 2, 0.6],
      [1, 0, 0.5], [1, 2, 0.5],
      [2, 2, 1.0],
      [3, 4, 1.0],
      [4, 3, 1.0],
    ],
  },
  ex2: {
    label: "ex 2: periodický d=3",
    states: ["s₀", "s₁", "s₂"],
    pos: [[140, 140], [340, 60], [340, 220]],
    edges: [
      [0, 1, 1.0],
      [1, 2, 1.0],
      [2, 0, 1.0],
    ],
  },
  ex3: {
    label: "ex 3: aperiodický (self-loop)",
    states: ["A", "B", "C"],
    pos: [[140, 140], [340, 60], [340, 220]],
    edges: [
      [0, 0, 0.3], [0, 1, 0.7],
      [1, 2, 1.0],
      [2, 0, 1.0],
    ],
  },
  ex4: {
    label: "ex 4: ireducibilní aperiodický",
    states: ["A", "B", "C", "D"],
    pos: [[100, 80], [340, 80], [100, 220], [340, 220]],
    edges: [
      [0, 0, 0.4], [0, 1, 0.6],
      [1, 2, 1.0],
      [2, 3, 1.0],
      [3, 0, 1.0],
    ],
  },
};

// SCC computation via Tarjan
function findSCCs(N, edges) {
  const adj = Array.from({ length: N }, () => []);
  for (const [u, v] of edges) if (u !== v) adj[u].push(v);
  let index = 0;
  const indices = new Array(N).fill(-1);
  const lowlink = new Array(N).fill(-1);
  const onstack = new Array(N).fill(false);
  const stack = [];
  const sccs = [];

  function strongconnect(v) {
    indices[v] = index;
    lowlink[v] = index;
    index++;
    stack.push(v);
    onstack[v] = true;
    for (const w of adj[v]) {
      if (indices[w] === -1) {
        strongconnect(w);
        lowlink[v] = Math.min(lowlink[v], lowlink[w]);
      } else if (onstack[w]) {
        lowlink[v] = Math.min(lowlink[v], indices[w]);
      }
    }
    if (lowlink[v] === indices[v]) {
      const comp = [];
      while (true) {
        const w = stack.pop();
        onstack[w] = false;
        comp.push(w);
        if (w === v) break;
      }
      sccs.push(comp);
    }
  }

  for (let v = 0; v < N; v++) if (indices[v] === -1) strongconnect(v);
  return sccs;
}

function classifySCC(sccIdx, sccs, edges) {
  const scc = sccs[sccIdx];
  const inSCC = new Set(scc);
  // Recurrent if no edge leaves the SCC
  for (const u of scc) {
    for (const [a, b] of edges) {
      if (a === u && !inSCC.has(b)) return "transient";
    }
  }
  return "recurrent";
}

// Compute period of an SCC: gcd of cycle lengths
function periodOfSCC(scc, edges) {
  if (scc.length === 1) {
    const v = scc[0];
    // Has self-loop?
    return edges.some(([a, b]) => a === v && b === v) ? 1 : Infinity;  // no cycles
  }
  // BFS from any vertex, gcd of path lengths to return
  const start = scc[0];
  const inSCC = new Set(scc);
  const dist = new Map([[start, 0]]);
  const queue = [start];
  let g = 0;
  while (queue.length) {
    const u = queue.shift();
    const du = dist.get(u);
    for (const [a, b] of edges) {
      if (a !== u || !inSCC.has(b)) continue;
      if (b === start) g = gcd(g, du + 1);
      else if (!dist.has(b)) { dist.set(b, du + 1); queue.push(b); }
      else g = gcd(g, du + 1 - dist.get(b));
    }
  }
  return g || Infinity;
}
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; }

export default function McClassification() {
  const [preset, setPreset] = useState("ex1");
  const cur = PRESETS[preset];
  const N = cur.states.length;

  const edgesList = cur.edges.map(([u, v]) => [u, v]);
  const sccs = findSCCs(N, edgesList);
  const classes = sccs.map((scc, idx) => classifySCC(idx, sccs, edgesList));
  const periods = sccs.map((scc) => periodOfSCC(scc, edgesList));

  // Color per SCC: green if recurrent, orange if transient
  const stateClass = new Array(N).fill(null);
  sccs.forEach((scc, idx) => scc.forEach((v) => { stateClass[v] = { sccIdx: idx, kind: classes[idx], period: periods[idx] }; }));

  const W = 540, H = 320;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(PRESETS).map(([k, p]) => (
          <button key={k} onClick={() => setPreset(k)} style={btn(preset === k)}>{p.label}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <defs>
          <marker id="mcArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L 10 5 L 0 10 z" fill="var(--text-muted)" />
          </marker>
        </defs>

        {/* Edges */}
        {cur.edges.map(([i, j, p], k) => {
          if (i === j) {
            const [x, y] = cur.pos[i];
            return (
              <g key={k}>
                <path d={`M ${x + 16} ${y - 14} C ${x + 50} ${y - 36}, ${x + 50} ${y + 36}, ${x + 16} ${y + 14}`} stroke="var(--line-strong)" fill="none" markerEnd="url(#mcArr)" />
                <text x={x + 54} y={y + 3} fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">{p.toFixed(2)}</text>
              </g>
            );
          }
          const [x1, y1] = cur.pos[i];
          const [x2, y2] = cur.pos[j];
          const dx = x2 - x1, dy = y2 - y1;
          const d = Math.sqrt(dx * dx + dy * dy);
          const r = 24;
          const sx = x1 + (dx / d) * r;
          const sy = y1 + (dy / d) * r;
          const ex = x2 - (dx / d) * r;
          const ey = y2 - (dy / d) * r;
          const perpX = -dy / d * 4, perpY = dx / d * 4;
          return (
            <g key={k}>
              <path d={`M ${sx + perpX} ${sy + perpY} L ${ex + perpX} ${ey + perpY}`} stroke="var(--line-strong)" fill="none" markerEnd="url(#mcArr)" />
              <text x={(sx + ex) / 2 + perpX * 2} y={(sy + ey) / 2 + perpY * 2 + 3} fontSize="9.5" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{p.toFixed(2)}</text>
            </g>
          );
        })}

        {/* States */}
        {cur.pos.map(([x, y], i) => {
          const info = stateClass[i];
          const color = info?.kind === "recurrent" ? "var(--accent)" : "var(--accent-line)";
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="22" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fill="var(--text)" fontFamily="var(--font-mono)">{cur.states[i]}</text>
            </g>
          );
        })}
      </svg>

      <div style={{ fontSize: 11, color: "var(--text)", fontFamily: "var(--font-mono)" }}>
        <strong>Komunikační třídy (SCC):</strong>
        <ul style={{ margin: "4px 0 0 20px", padding: 0 }}>
          {sccs.map((scc, idx) => (
            <li key={idx} style={{ color: classes[idx] === "recurrent" ? "var(--accent)" : "var(--accent-line)" }}>
              {`{${scc.map((v) => cur.states[v]).join(", ")}}`} — {classes[idx] === "recurrent" ? "rekurentní" : "tranzientní"}
              {classes[idx] === "recurrent" && periods[idx] !== Infinity && (
                <> · perioda d = {periods[idx]} {periods[idx] === 1 && "(aperiodický)"}</>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function btn(active) { return { padding: "3px 9px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
