// De Bruijn graph builder: read -> k-mers -> graph (nodes = (k-1)-mers, edges = k-mers)
// -> Eulerian path = assembled contig.
import { useState } from "react";

export default function BifDeBruijn() {
  const examples = {
    AAGACTTAG: "AAGACTTAG",
    TAATGCCAT: "TAATGCCAT",
    ATGCGTGCA: "ATGCGTGCA",
  };
  const [seqKey, setSeqKey] = useState("AAGACTTAG");
  const [k, setK] = useState(3);
  const [showEuler, setShowEuler] = useState(true);
  const seq = examples[seqKey];

  // k-mers (edges) and (k-1)-mers (nodes)
  const kmers = [];
  for (let i = 0; i + k <= seq.length; i++) kmers.push(seq.slice(i, i + k));
  const nodeList = [];
  const nodeIndex = {};
  const addNode = (s) => {
    if (!(s in nodeIndex)) { nodeIndex[s] = nodeList.length; nodeList.push(s); }
    return nodeIndex[s];
  };
  // edges: prefix (k-1)-mer -> suffix (k-1)-mer
  const edges = kmers.map((km) => {
    const from = km.slice(0, k - 1);
    const to = km.slice(1);
    return { from, to, label: km, fi: addNode(from), ti: addNode(to) };
  });

  // The Eulerian path here is simply the input order of k-mers (the read induces it):
  // each successive edge starts where the previous ended. Highlight that walk.
  const eulerEdgeOrder = edges.map((_, i) => i);

  // Layout: lay nodes left-to-right in order of first appearance, slight vertical zig-zag
  const W = 540, H = 200;
  const n = nodeList.length;
  const margin = 46;
  const span = n > 1 ? (W - 2 * margin) / (n - 1) : 0;
  const pos = nodeList.map((_, i) => ({
    x: margin + i * span,
    y: H / 2 - 26 + (i % 2 === 0 ? -22 : 22),
  }));

  const R = 17;
  const accent = "var(--accent)";

  // build assembled contig string from the euler walk over distinct edge order
  // contig = first node + last char of each edge's target
  let contig = nodeList.length ? edges.length ? edges[0].from : nodeList[0] : "";
  if (edges.length) {
    contig = edges[0].from;
    for (const e of edges) contig += e.to.slice(-1);
  }

  // count parallel edges between same node pair for slight curve offset
  const pairSeen = {};

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", fontSize: 12 }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text-muted)" }}>
          čtení:
          <select value={seqKey} onChange={(e) => setSeqKey(e.target.value)}
            style={{ fontFamily: "var(--font-mono)" }}>
            {Object.keys(examples).map((kk) => <option key={kk} value={kk}>{kk}</option>)}
          </select>
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text-muted)" }}>
          k = {k}
          <input type="range" min={3} max={4} value={k}
            onChange={(e) => setK(+e.target.value)} />
        </label>
        <label style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text-muted)" }}>
          <input type="checkbox" checked={showEuler}
            onChange={(e) => setShowEuler(e.target.checked)} />
          Eulerovská cesta
        </label>
      </div>

      <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        {k}-mery (hrany): {kmers.join(" · ")}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <defs>
          <marker id="dbn-arr" markerWidth="7" markerHeight="7" refX="6" refY="3"
            orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--line-strong)" />
          </marker>
          <marker id="dbn-arr-e" markerWidth="7" markerHeight="7" refX="6" refY="3"
            orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L6,3 L0,6 Z" fill={accent} />
          </marker>
        </defs>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {edges.map((e, i) => {
          const a = pos[e.fi], b = pos[e.ti];
          const key = `${e.fi}-${e.ti}`;
          const dup = pairSeen[key] || 0;
          pairSeen[key] = dup + 1;
          const dx = b.x - a.x, dy = b.y - a.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len, uy = dy / len;
          // start/end on circle edge
          const sx = a.x + ux * R, sy = a.y + uy * R;
          const ex = b.x - ux * R, ey = b.y - uy * R;
          // control point offset for self/parallel separation
          const nx = -uy, ny = ux;
          const bow = e.fi === e.ti ? 30 : 16 + dup * 16;
          const self = e.fi === e.ti;
          const isEuler = showEuler;
          const stroke = isEuler ? accent : "var(--line-strong)";
          let d;
          if (self) {
            d = `M ${a.x - 6} ${a.y - R} C ${a.x - 38} ${a.y - 46}, ${a.x + 38} ${a.y - 46}, ${a.x + 6} ${a.y - R}`;
          } else {
            const cx = (sx + ex) / 2 + nx * bow;
            const cy = (sy + ey) / 2 + ny * bow;
            d = `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}`;
          }
          const lx = self ? a.x : (sx + ex) / 2 + nx * (bow + 9);
          const ly = self ? a.y - 50 : (sy + ey) / 2 + ny * (bow + 9);
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={stroke}
                strokeWidth={isEuler ? 2 : 1.2}
                opacity={isEuler ? 0.9 : 0.6}
                markerEnd={`url(#${isEuler ? "dbn-arr-e" : "dbn-arr"})`} />
              <rect x={lx - e.label.length * 3.6 - 2} y={ly - 8} width={e.label.length * 7.2 + 4} height={13}
                rx={2} fill="var(--bg-inset)" opacity={0.85} />
              <text x={lx} y={ly + 2} textAnchor="middle" fontSize="11"
                fontFamily="var(--font-mono)"
                fill={isEuler ? accent : "var(--text-muted)"}>{e.label}</text>
            </g>
          );
        })}

        {nodeList.map((s, i) => (
          <g key={i}>
            <circle cx={pos[i].x} cy={pos[i].y} r={R}
              fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth={1.4} />
            <text x={pos[i].x} y={pos[i].y + 1} textAnchor="middle" dominantBaseline="central"
              fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">{s}</text>
          </g>
        ))}

        <text x={8} y={H - 8} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          vrcholy = (k-1)-mery · hrany = k-mery
        </text>
      </svg>

      <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        Eulerovská cesta projde každou hranu právě jednou → contig:{" "}
        <span style={{ color: accent }}>{contig}</span>
      </div>
    </div>
  );
}
