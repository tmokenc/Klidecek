// BFS / DFS / IDDFS / UCS side-by-side on the same graph.
import { useState, useEffect } from "react";

const NODES = [
  { id: "S", p: [40, 130] },
  { id: "A", p: [110, 60] },
  { id: "B", p: [110, 200] },
  { id: "C", p: [200, 30] },
  { id: "D", p: [200, 110] },
  { id: "E", p: [200, 190] },
  { id: "F", p: [200, 250] },
  { id: "G", p: [290, 70] },
  { id: "H", p: [290, 150] },
  { id: "I", p: [290, 230] },
  { id: "T", p: [370, 130] },
];

const EDGES = [
  ["S", "A", 3], ["S", "B", 4],
  ["A", "C", 2], ["A", "D", 5],
  ["B", "E", 3], ["B", "F", 2],
  ["C", "G", 4], ["D", "G", 3], ["D", "H", 2],
  ["E", "H", 5], ["E", "I", 3], ["F", "I", 1],
  ["G", "T", 3], ["H", "T", 4], ["I", "T", 6],
];

const ALGOS = ["BFS", "DFS", "UCS"];

function adjacency() {
  const adj = {};
  for (const n of NODES) adj[n.id] = [];
  for (const [a, b, c] of EDGES) {
    adj[a].push({ to: b, cost: c });
    adj[b].push({ to: a, cost: c });
  }
  return adj;
}

function runAlgo(algo, start = "S", goal = "T") {
  const adj = adjacency();
  const frontier = [];
  const seen = new Set();
  const expandedOrder = [];
  const parent = {};
  const gScore = {};
  gScore[start] = 0;
  frontier.push({ node: start, depth: 0, cost: 0 });
  seen.add(start);

  const trace = [];
  trace.push({ frontier: [...frontier.map((f) => f.node)], expanded: [...expandedOrder], current: null });

  let safety = 0;
  while (frontier.length > 0 && safety++ < 1000) {
    let pickIdx;
    if (algo === "BFS") pickIdx = 0;
    else if (algo === "DFS") pickIdx = frontier.length - 1;
    else if (algo === "UCS") {
      pickIdx = 0;
      for (let i = 1; i < frontier.length; i++) if (frontier[i].cost < frontier[pickIdx].cost) pickIdx = i;
    }
    const cur = frontier.splice(pickIdx, 1)[0];
    expandedOrder.push(cur.node);
    trace.push({ frontier: [...frontier.map((f) => f.node)], expanded: [...expandedOrder], current: cur.node });

    if (cur.node === goal) {
      // reconstruct
      const path = [];
      let p = goal;
      while (p) { path.push(p); p = parent[p]; }
      path.reverse();
      trace.push({ frontier: [...frontier.map((f) => f.node)], expanded: [...expandedOrder], current: null, path });
      return { trace, path };
    }

    // expand
    for (const nb of adj[cur.node]) {
      const newCost = cur.cost + nb.cost;
      if (algo === "UCS") {
        if (gScore[nb.to] === undefined || newCost < gScore[nb.to]) {
          gScore[nb.to] = newCost;
          parent[nb.to] = cur.node;
          frontier.push({ node: nb.to, depth: cur.depth + 1, cost: newCost });
        }
      } else {
        if (!seen.has(nb.to)) {
          seen.add(nb.to);
          parent[nb.to] = cur.node;
          frontier.push({ node: nb.to, depth: cur.depth + 1, cost: newCost });
        }
      }
    }
  }
  return { trace, path: null };
}

export default function UninformedCompare() {
  const [algo, setAlgo] = useState("BFS");
  const { trace } = runAlgo(algo);
  const [step, setStep] = useState(0);

  useEffect(() => { setStep(0); }, [algo]);
  const cur = trace[Math.min(step, trace.length - 1)];
  const frontierSet = new Set(cur.frontier);
  const expandedSet = new Set(cur.expanded);
  const pathSet = new Set(cur.path || []);

  const W = 420, H = 290;

  // Auto-play toggle
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    if (step >= trace.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), 700);
    return () => clearTimeout(t);
  }, [playing, step, trace.length]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <div style={{ display: "flex", gap: 4 }}>
          {ALGOS.map((a) => (
            <button key={a} onClick={() => setAlgo(a)}
              style={{
                background: algo === a ? "var(--accent)" : "var(--bg-card)",
                color: algo === a ? "white" : "var(--text)",
                border: "1px solid var(--line)", padding: "2px 10px", borderRadius: 3, fontSize: 11, cursor: "pointer",
                fontFamily: "var(--font-mono)",
              }}>
              {a}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setStep(0)} style={btnStyle()}>⏮</button>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} style={btnStyle()}>◀</button>
          <button onClick={() => setPlaying((p) => !p)} style={btnStyle()}>{playing ? "⏸" : "▶"}</button>
          <button onClick={() => setStep((s) => Math.min(trace.length - 1, s + 1))} style={btnStyle()}>▶|</button>
          <button onClick={() => setStep(trace.length - 1)} style={btnStyle()}>⏭</button>
        </div>
        <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          krok {step}/{trace.length - 1}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 540 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {EDGES.map(([a, b, c], i) => {
          const na = NODES.find((n) => n.id === a);
          const nb = NODES.find((n) => n.id === b);
          const onPath = pathSet.has(a) && pathSet.has(b);
          return (
            <g key={i}>
              <line x1={na.p[0]} y1={na.p[1]} x2={nb.p[0]} y2={nb.p[1]}
                stroke={onPath ? "oklch(0.75 0.18 145)" : "var(--line-strong)"}
                strokeWidth={onPath ? 2.5 : 1} opacity={onPath ? 1 : 0.5}/>
              {algo === "UCS" && (
                <text x={(na.p[0] + nb.p[0]) / 2} y={(na.p[1] + nb.p[1]) / 2 - 4} textAnchor="middle"
                  fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
                  {c}
                </text>
              )}
            </g>
          );
        })}
        {NODES.map((n) => {
          let fill = "var(--bg-card)";
          let stroke = "var(--line-strong)";
          if (cur.current === n.id) { fill = "oklch(0.7 0.2 60)"; stroke = "oklch(0.7 0.2 60)"; }
          else if (pathSet.has(n.id)) fill = "oklch(0.75 0.18 145)";
          else if (expandedSet.has(n.id)) fill = "color-mix(in oklch, var(--accent) 35%, var(--bg-card))";
          else if (frontierSet.has(n.id)) fill = "color-mix(in oklch, var(--accent) 18%, var(--bg-card))";
          return (
            <g key={n.id}>
              <circle cx={n.p[0]} cy={n.p[1]} r="14" fill={fill} stroke={stroke} strokeWidth="1.4"/>
              <text x={n.p[0]} y={n.p[1] + 4} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill={(pathSet.has(n.id) || cur.current === n.id) ? "white" : "var(--text)"} fontWeight="700">
                {n.id}
              </text>
              {expandedSet.has(n.id) && (
                <text x={n.p[0] + 14} y={n.p[1] - 8} fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                  {cur.expanded.indexOf(n.id) + 1}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 11, fontFamily: "var(--font-mono)" }}>
        <span style={{ color: "var(--text-muted)" }}>frontier:</span>
        {cur.frontier.length === 0 ? (
          <span style={{ color: "var(--text-faint)" }}>∅</span>
        ) : (
          <span style={{ color: "var(--text)" }}>[{cur.frontier.join(", ")}]</span>
        )}
        <span style={{ color: "var(--text-muted)" }}>expandované:</span>
        <span style={{ color: "var(--text)" }}>{cur.expanded.length}/{NODES.length}</span>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        <strong>BFS</strong> rozšiřuje široce (FIFO), <strong>DFS</strong> hluboce (LIFO), <strong>UCS</strong> podle ceny (prio fronta).
        Číslo u uzlu = pořadí expanze. Cesta zelená = nalezené řešení. UCS najde *optimální* cestu (nejmenší cenu), BFS *nejkratší* (počtem hran),
        DFS *libovolnou*.
      </div>
    </div>
  );
}

function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
