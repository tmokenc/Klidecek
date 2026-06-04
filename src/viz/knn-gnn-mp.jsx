// One round of message passing on a small graph.
// Click a node -> its neighbors send messages, they are aggregated (sum / mean),
// then combined with the node's own state to form the updated vector.
import { useState } from "react";

export default function KnnGnnMp() {
  // small graph; each node carries a 2D feature vector (toy values)
  const nodes = [
    { id: "A", p: [70, 45], h: [1.0, 0.0] },
    { id: "B", p: [200, 35], h: [0.0, 1.0] },
    { id: "C", p: [135, 110], h: [0.5, 0.5] },
    { id: "D", p: [70, 150], h: [0.2, 0.8] },
    { id: "E", p: [255, 130], h: [0.9, 0.1] },
  ];
  const edges = [["A", "C"], ["B", "C"], ["C", "D"], ["C", "E"], ["A", "D"], ["B", "E"]];
  const idx = Object.fromEntries(nodes.map((n, i) => [n.id, i]));
  const adj = Object.fromEntries(nodes.map((n) => [n.id, []]));
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });

  const [target, setTarget] = useState("C");
  const [agg, setAgg] = useState("mean");

  const nbrs = adj[target];
  const self = nodes[idx[target]].h;
  // aggregate neighbor feature vectors
  const sumVec = nbrs.reduce((acc, n) => {
    const h = nodes[idx[n]].h;
    return [acc[0] + h[0], acc[1] + h[1]];
  }, [0, 0]);
  const aggVec = agg === "mean" && nbrs.length
    ? [sumVec[0] / nbrs.length, sumVec[1] / nbrs.length]
    : sumVec;
  // update: h' = combine(self, aggregated) -> here a simple averaged combine
  const updated = [(self[0] + aggVec[0]) / 2, (self[1] + aggVec[1]) / 2];

  const fmt = (v) => `[${v[0].toFixed(2)}, ${v[1].toFixed(2)}]`;
  const W = 340, H = 200;

  const colorFor = (id) => {
    if (id === target) return "var(--accent)";
    if (nbrs.includes(id)) return "color-mix(in oklch, var(--accent) 35%, var(--bg-card))";
    return "var(--bg-card)";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 460 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* edges; highlight edges that carry a message into the target */}
        {edges.map(([a, b], i) => {
          const carries = (a === target && nbrs.includes(b)) || (b === target && nbrs.includes(a));
          return (
            <line key={i}
              x1={nodes[idx[a]].p[0]} y1={nodes[idx[a]].p[1]}
              x2={nodes[idx[b]].p[0]} y2={nodes[idx[b]].p[1]}
              stroke={carries ? "var(--accent)" : "var(--line-strong)"}
              strokeWidth={carries ? 2 : 1} opacity={carries ? 0.85 : 0.45} />
          );
        })}
        {/* message arrows from each neighbor toward the target */}
        {nbrs.map((n) => {
          const s = nodes[idx[n]].p, t = nodes[idx[target]].p;
          const mx = s[0] + (t[0] - s[0]) * 0.55, my = s[1] + (t[1] - s[1]) * 0.55;
          return <circle key={"m" + n} cx={mx} cy={my} r="3.5" fill="var(--accent)" />;
        })}
        {nodes.map((n) => (
          <g key={n.id} onClick={() => setTarget(n.id)} style={{ cursor: "pointer" }}>
            <circle cx={n.p[0]} cy={n.p[1]} r="15"
              fill={colorFor(n.id)}
              stroke={n.id === target ? "var(--accent)" : "var(--line-strong)"}
              strokeWidth={n.id === target ? 2.5 : 1} />
            <text x={n.p[0]} y={n.p[1] + 1} textAnchor="middle" dominantBaseline="central"
              fontSize="12" fontWeight="600" fontFamily="var(--font-mono)"
              fill={n.id === target ? "var(--bg-inset)" : "var(--text)"}>
              {n.id}
            </text>
          </g>
        ))}
        <text x={8} y={H - 8} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          klikni vrchol = cíl message passingu
        </text>
      </svg>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>agregace:</span>
        {["sum", "mean"].map((a) => (
          <button key={a} onClick={() => setAgg(a)}
            style={{
              fontSize: 12, padding: "2px 10px", cursor: "pointer",
              borderRadius: 6, border: "1px solid var(--line-strong)",
              background: agg === a ? "var(--accent)" : "var(--bg-card)",
              color: agg === a ? "var(--bg-inset)" : "var(--text)",
            }}>
            {a}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 11.5, lineHeight: 1.7, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        <div>cíl <b style={{ color: "var(--text)" }}>{target}</b> · sousedé {"{" + nbrs.join(", ") + "}"}</div>
        <div>zprávy = vektory sousedů; agregace ({agg}) = <b style={{ color: "var(--accent)" }}>{fmt(aggVec)}</b></div>
        <div>vlastní h({target}) = {fmt(self)}</div>
        <div>update h&#39;({target}) = combine(self, agg) = <b style={{ color: "var(--text)" }}>{fmt(updated)}</b></div>
      </div>
    </div>
  );
}
