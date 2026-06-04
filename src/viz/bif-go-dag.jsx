// Gene Ontology jako orientovaný acyklický graf (DAG).
// Klikni na termín → zvýrazní se cesta k jeho rodičům (is-a / part-of) až ke kořenu domény.
// Demonstruje dědičnost (propagaci) anotace nahoru podle "true path rule".
import { useState } from "react";

export default function BifGoDag() {
  // Tři domény (kořeny) + ukázková podhierarchie biologického procesu.
  // rel: typ hrany k rodiči ("is" = is_a, "part" = part_of).
  const nodes = [
    // kořeny tří domén
    { id: "bp",   label: "biologický proces",     p: [90, 30],  root: true },
    { id: "mf",   label: "molekulární funkce",    p: [270, 30], root: true },
    { id: "cc",   label: "buněčná komponenta",    p: [450, 30], root: true },
    // podhierarchie pod biologickým procesem
    { id: "meta", label: "metabolický proces",    p: [90, 90],  parents: [["bp", "is"]] },
    { id: "cell", label: "buněčný proces",         p: [230, 90], parents: [["bp", "is"]] },
    { id: "biosy",label: "biosyntéza",             p: [70, 150], parents: [["meta", "is"]] },
    { id: "trans",label: "translace",              p: [220, 150],parents: [["biosy", "is"], ["cell", "part"]] },
  ];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));

  const [sel, setSel] = useState("trans");

  // Spočti množinu předků vybraného uzlu (propagace anotace nahoru) + použité hrany.
  const ancestors = new Set();
  const usedEdges = new Set();
  const walk = (id) => {
    const n = byId[id];
    if (!n.parents) return;
    for (const [pid, rel] of n.parents) {
      usedEdges.add(`${id}->${pid}`);
      if (!ancestors.has(pid)) { ancestors.add(pid); walk(pid); }
    }
  };
  walk(sel);

  // všechny hrany k vykreslení
  const edges = [];
  for (const n of nodes) {
    if (!n.parents) continue;
    for (const [pid, rel] of n.parents) edges.push({ from: n.id, to: pid, rel });
  }

  const W = 540, H = 185;
  const isHi = (id) => id === sel || ancestors.has(id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {edges.map((e, i) => {
          const a = byId[e.from], b = byId[e.to];
          const hot = usedEdges.has(`${e.from}->${e.to}`);
          return (
            <g key={i}>
              <line x1={a.p[0]} y1={a.p[1] - 8} x2={b.p[0]} y2={b.p[1] + 8}
                stroke={hot ? "var(--accent)" : "var(--line-strong)"}
                strokeWidth={hot ? 2 : 1} opacity={hot ? 0.95 : 0.45}
                strokeDasharray={e.rel === "part" ? "4 3" : "none"} />
              <text x={(a.p[0] + b.p[0]) / 2 + 6} y={(a.p[1] + b.p[1]) / 2}
                fontSize="8.5" fontFamily="var(--font-mono)"
                fill={hot ? "var(--accent)" : "var(--text-faint)"}>
                {e.rel === "part" ? "part-of" : "is-a"}
              </text>
            </g>
          );
        })}
        {nodes.map((n) => {
          const hi = isHi(n.id);
          const w = Math.max(64, n.label.length * 5.6 + 12);
          return (
            <g key={n.id} onClick={() => setSel(n.id)} style={{ cursor: "pointer" }}>
              <rect x={n.p[0] - w / 2} y={n.p[1] - 11} width={w} height={22} rx={5}
                fill={n.id === sel ? "var(--accent)"
                  : hi ? "color-mix(in oklch, var(--accent) 28%, var(--bg-card))"
                  : "var(--bg-card)"}
                stroke={n.root ? "var(--line-strong)" : (hi ? "var(--accent)" : "var(--line)")}
                strokeWidth={n.root ? 1.5 : 1} />
              <text x={n.p[0]} y={n.p[1] + 1} textAnchor="middle" dominantBaseline="central"
                fontSize="9.5"
                fill={n.id === sel ? "white" : (hi ? "var(--text)" : "var(--text-muted)")}>
                {n.label}
              </text>
            </g>
          );
        })}
        <text x={8} y={H - 7} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          klikni na termín → anotace dědí nahoru ke všem rodičům (true path rule); ---- = part-of
        </text>
      </svg>
    </div>
  );
}
