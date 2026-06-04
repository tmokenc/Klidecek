// NEAT topology growth: add-node / add-connection mutations grow a minimal net.
// Direct encoding = genome lists every node/connection gene explicitly.
import { useState } from "react";

export default function BinNeat() {
  // Fixed I/O slots; hidden node appears after an add-node mutation.
  const inA = { id: "I1", p: [60, 50] };
  const inB = { id: "I2", p: [60, 130] };
  const out = { id: "O1", p: [340, 90] };
  const hid = { id: "H1", p: [200, 145] };

  // Three evolution stages, each a snapshot of genotype -> phenotype.
  const stages = [
    {
      name: "minimální start",
      mut: "počáteční síť: jen vstupy → výstup",
      nodes: [inA, inB, out],
      // each connection gene: from, to, weight, enabled, innovation number
      conns: [
        { f: inA, t: out, w: "0.7", en: true, innov: 1 },
        { f: inB, t: out, w: "-0.4", en: true, innov: 2 },
      ],
    },
    {
      name: "add-connection",
      mut: "mutace přidá spojení I1 → I2 (nový gen, innov 3)",
      nodes: [inA, inB, out],
      conns: [
        { f: inA, t: out, w: "0.7", en: true, innov: 1 },
        { f: inB, t: out, w: "-0.4", en: true, innov: 2 },
        { f: inA, t: inB, w: "0.5", en: true, innov: 3, fresh: true },
      ],
    },
    {
      name: "add-node",
      mut: "mutace rozdělí spoj I2→O1: vznikne uzel H1 (innov 4,5; starý gen zakázán)",
      nodes: [inA, inB, out, hid],
      conns: [
        { f: inA, t: out, w: "0.7", en: true, innov: 1 },
        { f: inB, t: out, w: "-0.4", en: false, innov: 2 },
        { f: inA, t: inB, w: "0.5", en: true, innov: 3 },
        { f: inB, t: hid, w: "1.0", en: true, innov: 4, fresh: true },
        { f: hid, t: out, w: "-0.4", en: true, innov: 5, fresh: true },
      ],
    },
  ];

  const [s, setS] = useState(0);
  const st = stages[s];
  const W = 420, H = 200;

  const nodeFill = (n) =>
    n.id === hid.id ? "var(--accent)" :
    n.id.startsWith("I") ? "var(--bg-card)" : "var(--bg-card)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 460, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        <defs>
          <marker id="binNeatArr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent-line)" />
          </marker>
          <marker id="binNeatArrOn" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* connections (phenotype edges) */}
        {st.conns.map((c, i) => {
          const on = c.en;
          const stroke = !on ? "var(--line-strong)" : c.fresh ? "var(--accent)" : "var(--accent-line)";
          return (
            <line key={i} x1={c.f.p[0]} y1={c.f.p[1]} x2={c.t.p[0]} y2={c.t.p[1]}
              stroke={stroke} strokeWidth={c.fresh ? 2.2 : 1.4}
              strokeDasharray={on ? "0" : "4 3"}
              opacity={on ? 0.95 : 0.45}
              markerEnd={`url(#${c.fresh ? "binNeatArrOn" : "binNeatArr"})`} />
          );
        })}

        {/* nodes */}
        {st.nodes.map((n) => (
          <g key={n.id}>
            <circle cx={n.p[0]} cy={n.p[1]} r="15"
              fill={nodeFill(n)}
              stroke={n.id === hid.id ? "var(--accent)" : "var(--line-strong)"}
              strokeWidth={n.id === hid.id ? 2 : 1.2} />
            <text x={n.p[0]} y={n.p[1] + 1} textAnchor="middle" dominantBaseline="central"
              fontSize="12" fontFamily="var(--font-mono)"
              fill={n.id === hid.id ? "white" : "var(--text)"}>{n.id}</text>
          </g>
        ))}

        {/* genotype panel: connection-gene list (direct encoding) */}
        <text x={10} y={184} fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          geny (innov):
        </text>
        {st.conns.map((c, i) => (
          <text key={i} x={150 + i * 54} y={184} fontSize="9.5" fontFamily="var(--font-mono)"
            fill={c.fresh ? "var(--accent)" : c.en ? "var(--text-muted)" : "var(--text-faint)"}>
            {`#${c.innov}${c.en ? "" : "✗"}`}
          </text>
        ))}
      </svg>

      <div style={{ display: "flex", gap: 6 }}>
        {stages.map((g, i) => (
          <button key={i} onClick={() => setS(i)}
            style={{
              flex: 1, fontSize: 11, padding: "4px 6px", cursor: "pointer",
              fontFamily: "var(--font-mono)",
              background: i === s ? "var(--accent)" : "var(--bg-card)",
              color: i === s ? "white" : "var(--text-muted)",
              border: "1px solid var(--line-strong)", borderRadius: 4,
            }}>
            {g.name}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        {st.mut}
      </div>
    </div>
  );
}
