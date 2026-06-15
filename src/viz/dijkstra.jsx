// Dijkstra shortest-path step-by-step on a small weighted graph.
import { useState, useMemo, useEffect } from "react";

const NODES = [
  { id: "A", p: [50, 80] },
  { id: "B", p: [150, 50] },
  { id: "C", p: [260, 75] },
  { id: "D", p: [330, 140] },
  { id: "E", p: [260, 205] },
  { id: "F", p: [150, 230] },
  { id: "G", p: [50, 175] },
];
const EDGES = [
  ["A", "B", 7], ["A", "G", 4], ["B", "C", 5], ["B", "F", 9],
  ["C", "D", 3], ["C", "E", 6], ["D", "E", 4], ["E", "F", 5],
  ["F", "G", 6], ["B", "G", 8], ["C", "F", 4],
];

export default function Dijkstra() {
  const [src, setSrc] = useState("A");
  const [steps, setSteps] = useState(0);

  // pre-compute the entire trace so we can scrub it.
  const trace = useMemo(() => computeTrace(src), [src]);
  const maxSteps = trace.length - 1;
  const current = trace[Math.min(steps, maxSteps)];

  useEffect(() => { setSteps(0); }, [src]);

  const W = 380, H = 260;
  const r = 14;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {EDGES.map(([a, b, w], i) => {
          const na = NODES.find((n) => n.id === a);
          const nb = NODES.find((n) => n.id === b);
          const usedFwd = current.prev[b] === a;
          const usedBack = current.prev[a] === b;
          const used = usedFwd || usedBack;
          const relaxing = current.relax && (
            (current.relax.from === a && current.relax.to === b) ||
            (current.relax.from === b && current.relax.to === a)
          );
          const stroke = relaxing
            ? "oklch(0.68 0.16 65)"
            : used
              ? "var(--accent)"
              : "var(--line-strong)";
          return (
            <g key={`e-${i}`}>
              <line x1={na.p[0]} y1={na.p[1]} x2={nb.p[0]} y2={nb.p[1]}
                stroke={stroke}
                strokeWidth={relaxing ? 2.2 : used ? 1.6 : 0.9} />
              <text x={(na.p[0] + nb.p[0]) / 2}
                y={(na.p[1] + nb.p[1]) / 2 - 3}
                textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)"
                fill={relaxing ? "oklch(0.68 0.16 65)" : "var(--text-muted)"}>
                {w}
              </text>
            </g>
          );
        })}

        {NODES.map((n) => {
          const visited = current.visited.has(n.id);
          const isCurrent = current.current === n.id;
          const d = current.dist[n.id];
          return (
            <g key={`n-${n.id}`} onClick={() => setSrc(n.id)} style={{ cursor: "pointer" }}>
              <circle cx={n.p[0]} cy={n.p[1]} r={r}
                fill={isCurrent ? "var(--accent)"
                  : visited ? "color-mix(in oklch, var(--accent) 25%, var(--bg-card))"
                  : "var(--bg-card)"}
                stroke={n.id === src ? "var(--accent)" : "var(--line-strong)"}
                strokeWidth={n.id === src ? 2 : 1} />
              <text x={n.p[0]} y={n.p[1] + 3.5} textAnchor="middle"
                fontSize="11" fontFamily="var(--font-mono)" fontWeight="700"
                fill={isCurrent ? "white" : "var(--text)"}>
                {n.id}
              </text>
              <text x={n.p[0]} y={n.id === "F" ? n.p[1] - r - 4 : n.p[1] + r + 11} textAnchor="middle"
                fontSize="9" fontFamily="var(--font-mono)"
                fill={d === Infinity ? "var(--text-faint)" : "var(--accent)"}>
                d={d === Infinity ? "∞" : d}
              </text>
            </g>
          );
        })}

        <text x={8} y={H - 8} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          krok {Math.min(steps, maxSteps)} / {maxSteps} · klikni na uzel = zdroj
        </text>
      </svg>

      <div className="viz-controls">
        <button className="viz-btn primary"
          onClick={() => setSteps((s) => Math.min(maxSteps, s + 1))}
          disabled={steps >= maxSteps}>
          krok →
        </button>
        <button className="viz-btn" onClick={() => setSteps(0)}>reset</button>
        <button className="viz-btn"
          onClick={() => setSteps(maxSteps)}>doběhnout</button>
        <span className="viz-readout push">
          {current.note}
        </span>
      </div>
    </div>
  );
}

// ----------- Dijkstra trace generator -----------

function computeTrace(src) {
  const adj = {};
  NODES.forEach((n) => (adj[n.id] = []));
  EDGES.forEach(([a, b, w]) => {
    adj[a].push([b, w]);
    adj[b].push([a, w]);
  });

  const trace = [];
  const dist = {};
  const prev = {};
  NODES.forEach((n) => {
    dist[n.id] = n.id === src ? 0 : Infinity;
    prev[n.id] = null;
  });
  const visited = new Set();

  trace.push({
    dist: { ...dist }, prev: { ...prev }, visited: new Set(visited),
    current: null, relax: null,
    note: `init — d(${src}) = 0, ostatní ∞`,
  });

  while (visited.size < NODES.length) {
    // pick the unvisited node with min dist
    let u = null;
    for (const n of NODES) {
      if (visited.has(n.id)) continue;
      if (dist[n.id] === Infinity) continue;
      if (u === null || dist[n.id] < dist[u]) u = n.id;
    }
    if (u === null) break;
    visited.add(u);
    trace.push({
      dist: { ...dist }, prev: { ...prev }, visited: new Set(visited),
      current: u, relax: null,
      note: `vybrán ${u} (d=${dist[u]}), relaxuji sousedy`,
    });
    // relax neighbors
    for (const [v, w] of adj[u]) {
      if (visited.has(v)) continue;
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
        trace.push({
          dist: { ...dist }, prev: { ...prev }, visited: new Set(visited),
          current: u, relax: { from: u, to: v },
          note: `relax ${u}→${v} (w=${w}): d(${v}) = ${dist[v]}`,
        });
      }
    }
  }
  trace.push({
    dist: { ...dist }, prev: { ...prev }, visited: new Set(visited),
    current: null, relax: null,
    note: "hotovo — vše rozhodnuto",
  });
  return trace;
}
