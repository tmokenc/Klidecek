// BFS / DFS / UCS — side-by-side comparison: 3 mini-graphs render the final
// expanded order and solution path for every algorithm at once, so the user
// sees the contrast at a glance. The active algorithm gets a larger,
// step-by-step graph below for exploration.
import { useState, useEffect, useMemo } from "react";

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

const ALGOS = [
  { id: "BFS", hue: 264, blurb: "FIFO fronta · široko",  guarantee: "min hran" },
  { id: "DFS", hue: 22,  blurb: "LIFO zásobník · hluboko", guarantee: "libovolná" },
  { id: "UCS", hue: 145, blurb: "priorit. fronta · cena", guarantee: "min cena" },
];

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
      const path = [];
      let p = goal;
      while (p) { path.push(p); p = parent[p]; }
      path.reverse();
      // Compute path cost
      let pathCost = 0;
      for (let i = 0; i < path.length - 1; i++) {
        const e = EDGES.find(([a, b]) => (a === path[i] && b === path[i + 1]) || (b === path[i] && a === path[i + 1]));
        if (e) pathCost += e[2];
      }
      trace.push({ frontier: [...frontier.map((f) => f.node)], expanded: [...expandedOrder], current: null, path, pathCost });
      return { trace, path, pathCost };
    }

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
  return { trace, path: null, pathCost: null };
}

export default function UninformedCompare() {
  // Pre-compute final results for ALL three algorithms so the summary panel
  // is always populated.
  const allRuns = useMemo(() => Object.fromEntries(ALGOS.map((a) => [a.id, runAlgo(a.id)])), []);

  const [algo, setAlgo] = useState("BFS");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const trace = allRuns[algo].trace;
  useEffect(() => { setStep(0); setPlaying(false); }, [algo]);
  const cur = trace[Math.min(step, trace.length - 1)];
  const frontierSet = new Set(cur.frontier);
  const expandedSet = new Set(cur.expanded);
  const pathSet = new Set(cur.path || []);

  useEffect(() => {
    if (!playing) return;
    if (step >= trace.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), 600);
    return () => clearTimeout(t);
  }, [playing, step, trace.length]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* ─── Comparison strip: all 3 algos at once ──────────────── */}
      <div>
        <div style={{ fontSize: 10.5, fontFamily: "var(--font-mono)", color: "var(--text-faint)",
          textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          srovnání · stejný graf, 3 strategie
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {ALGOS.map((a) => {
            const r = allRuns[a.id];
            const finalTrace = r.trace[r.trace.length - 1];
            const expandedCount = finalTrace.expanded.length;
            const pathLen = r.path ? r.path.length - 1 : null;
            const pathCost = r.pathCost ?? null;
            const isActive = algo === a.id;
            return (
              <button key={a.id} onClick={() => setAlgo(a.id)}
                style={{
                  display: "flex", flexDirection: "column", gap: 4,
                  padding: "8px 10px",
                  background: isActive ? `oklch(0.65 0.16 ${a.hue} / 0.10)` : "var(--bg-inset)",
                  border: `1px solid ${isActive ? `oklch(0.65 0.16 ${a.hue})` : "var(--line)"}`,
                  borderRadius: 6,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "var(--font-mono)",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: `oklch(0.40 0.16 ${a.hue})` }}>{a.id}</span>
                  <span style={{ fontSize: 9.5, color: "var(--text-faint)" }}>{a.blurb}</span>
                </div>
                <MiniGraph path={r.path || []} expanded={finalTrace.expanded} hue={a.hue} active={isActive} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}>
                  <span>exp <b style={{ color: "var(--text)" }}>{expandedCount}</b></span>
                  <span>hran <b style={{ color: "var(--text)" }}>{pathLen ?? "—"}</b></span>
                  <span>cena <b style={{ color: "var(--text)" }}>{pathCost ?? "—"}</b></span>
                </div>
                <div style={{ fontSize: 9.5, color: `oklch(0.40 0.16 ${a.hue})`, marginTop: 2 }}>
                  garance: {a.guarantee}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Step-by-step explorer for the active algorithm ─────── */}
      <div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11, marginBottom: 6 }}>
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 10.5 }}>
            detail · {algo}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
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

        <svg viewBox="0 0 420 290" style={{ width: "100%", display: "block", maxWidth: 540, background: "var(--bg-inset)", borderRadius: 4 }}>
          {EDGES.map(([a, b, c], i) => {
            const na = NODES.find((n) => n.id === a);
            const nb = NODES.find((n) => n.id === b);
            const onPath = pathSet.has(a) && pathSet.has(b);
            return (
              <g key={i}>
                <line x1={na.p[0]} y1={na.p[1]} x2={nb.p[0]} y2={nb.p[1]}
                  stroke={onPath ? "oklch(0.75 0.18 145)" : "var(--line-strong)"}
                  strokeWidth={onPath ? 2.5 : 1} opacity={onPath ? 1 : 0.5} />
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
                <circle cx={n.p[0]} cy={n.p[1]} r="14" fill={fill} stroke={stroke} strokeWidth="1.4" />
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

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 11, fontFamily: "var(--font-mono)", marginTop: 6 }}>
          <span style={{ color: "var(--text-muted)" }}>frontier:</span>
          {cur.frontier.length === 0
            ? <span style={{ color: "var(--text-faint)" }}>∅</span>
            : <span style={{ color: "var(--text)" }}>[{cur.frontier.join(", ")}]</span>}
          <span style={{ color: "var(--text-muted)" }}>expandované:</span>
          <span style={{ color: "var(--text)" }}>{cur.expanded.length}/{NODES.length}</span>
        </div>

        <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45, marginTop: 6 }}>
          <strong>BFS</strong> široko (FIFO), <strong>DFS</strong> hluboko (LIFO), <strong>UCS</strong> podle ceny (priorit. fronta).
          Číslo u uzlu = pořadí expanze. Cesta zelená = nalezené řešení. UCS dává <em>optimální</em> cestu (nejmenší cenu),
          BFS <em>nejkratší</em> (počtem hran), DFS <em>libovolnou</em>.
        </div>
      </div>
    </div>
  );
}

// Mini-graph: small thumbnail used inside the comparison-strip cards.
// Same node layout as the main graph but smaller; only the path + expanded
// halo is drawn so the eye can compare the three strategies' outcomes.
function MiniGraph({ path, expanded, hue, active }) {
  const W = 200, H = 110;
  const SX = 0.50, SY = 0.36;  // scale from main 420×290
  const OX = 4, OY = 6;
  const xy = (n) => [OX + n.p[0] * SX, OY + n.p[1] * SY];
  const pathSet = new Set(path);
  const expSet  = new Set(expanded);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 110, background: "var(--bg-card)", borderRadius: 4 }}>
      {EDGES.map(([a, b], i) => {
        const na = NODES.find((n) => n.id === a);
        const nb = NODES.find((n) => n.id === b);
        const [ax, ay] = xy(na);
        const [bx, by] = xy(nb);
        const onPath = pathSet.has(a) && pathSet.has(b);
        return (
          <line key={i} x1={ax} y1={ay} x2={bx} y2={by}
            stroke={onPath ? `oklch(0.55 0.18 ${hue})` : "var(--line-strong)"}
            strokeWidth={onPath ? 1.6 : 0.6} opacity={onPath ? 1 : 0.45} />
        );
      })}
      {NODES.map((n) => {
        const [cx, cy] = xy(n);
        const onPath = pathSet.has(n.id);
        const wasExpanded = expSet.has(n.id);
        return (
          <g key={n.id}>
            {wasExpanded && !onPath && (
              <circle cx={cx} cy={cy} r="6" fill={`oklch(0.65 0.16 ${hue} / 0.20)`} stroke="none" />
            )}
            <circle cx={cx} cy={cy} r="4"
              fill={onPath ? `oklch(0.55 0.18 ${hue})` : (wasExpanded ? "var(--bg-card)" : "var(--bg-inset)")}
              stroke={onPath ? `oklch(0.55 0.18 ${hue})` : "var(--line-strong)"} strokeWidth="0.8" />
          </g>
        );
      })}
      {!active && (
        <rect width={W} height={H} fill="var(--bg-card)" opacity="0" />
      )}
    </svg>
  );
}

function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
