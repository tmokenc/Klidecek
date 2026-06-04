// Adleman's HPP demo: click vertices to build a Hamiltonian path on a small
// directed graph; the panel shows how each chosen vertex/edge is encoded as a
// DNA oligo and how complementary edge strands splint and ligate the path.
import { useState } from "react";

export default function BinAdleman() {
  // 4-vertex directed graph with one Hamiltonian path 0->1->2->3.
  const nodes = [
    { id: 0, name: "A", seq: "GCTA", p: [40, 40] },
    { id: 1, name: "B", seq: "TTCG", p: [165, 40] },
    { id: 2, name: "C", seq: "AGCT", p: [165, 130] },
    { id: 3, name: "D", seq: "CGTA", p: [40, 130] },
  ];
  const edges = [
    [0, 1], [1, 2], [2, 3], [0, 3], [1, 3],
  ];
  const adj = {};
  nodes.forEach((n) => (adj[n.id] = []));
  edges.forEach(([a, b]) => adj[a].push(b));

  const [path, setPath] = useState([]); // sequence of vertex ids chosen

  const canClick = (id) => {
    if (path.length === 0) return true;
    const last = path[path.length - 1];
    return adj[last].includes(id) && !path.includes(id);
  };

  const onClick = (id) => {
    if (path.includes(id)) {
      // clicking a vertex on the path truncates back to it
      setPath(path.slice(0, path.indexOf(id) + 1));
      return;
    }
    if (canClick(id)) setPath([...path, id]);
  };

  const isHamiltonian = path.length === nodes.length;
  const onPath = (a, b) => {
    for (let i = 0; i < path.length - 1; i++)
      if (path[i] === a && path[i + 1] === b) return true;
    return false;
  };

  const W = 540, H = 210;
  const node = (id) => nodes.find((n) => n.id === id);
  // complement of a base, used to show edge "splint" strands
  const comp = (s) => s.split("").map((c) => ({ A: "T", T: "A", G: "C", C: "G" }[c])).join("");

  // build the assembled DNA string: vertex seq + vertex seq ...; edge oligos are
  // complementary to the second half of one node and first half of the next.
  const half = (s, which) => (which === "5" ? s.slice(0, 2) : s.slice(2));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", touchAction: "none" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* divider */}
        <line x1={250} y1={10} x2={250} y2={H - 10} stroke="var(--line)" strokeWidth="0.75" strokeDasharray="3 3" />
        <text x={12} y={20} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-faint)">graf (klikni vrcholy)</text>
        <text x={262} y={20} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-faint)">kódování v DNA</text>

        {/* ---- left: directed graph ---- */}
        <defs>
          <marker id="bin-ad-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--line-strong)" />
          </marker>
          <marker id="bin-ad-arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--accent)" />
          </marker>
        </defs>
        {edges.map(([a, b], i) => {
          const pa = node(a).p, pb = node(b).p;
          const dx = pb[0] - pa[0], dy = pb[1] - pa[1];
          const len = Math.hypot(dx, dy);
          const ux = dx / len, uy = dy / len;
          const x1 = pa[0] + ux * 16, y1 = pa[1] + uy * 16;
          const x2 = pb[0] - ux * 18, y2 = pb[1] - uy * 18;
          const on = onPath(a, b);
          return (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={on ? "var(--accent)" : "var(--line-strong)"}
              strokeWidth={on ? 2 : 1} opacity={on ? 1 : 0.55}
              markerEnd={`url(#${on ? "bin-ad-arrow-on" : "bin-ad-arrow"})`} />
          );
        })}
        {nodes.map((n) => {
          const idx = path.indexOf(n.id);
          const inPath = idx >= 0;
          const clickable = canClick(n.id) || inPath;
          return (
            <g key={n.id} onClick={() => onClick(n.id)} style={{ cursor: clickable ? "pointer" : "default" }}>
              <circle cx={n.p[0]} cy={n.p[1]} r="15"
                fill={inPath ? "var(--accent)" : "var(--bg-card)"}
                stroke={clickable ? "var(--accent)" : "var(--line-strong)"}
                strokeWidth={clickable ? 1.5 : 1}
                opacity={clickable ? 1 : 0.6} />
              <text x={n.p[0]} y={n.p[1] + 1} textAnchor="middle" dominantBaseline="central"
                fontSize="13" fontFamily="var(--font-mono)"
                fill={inPath ? "white" : "var(--text)"}>{n.name}</text>
              {inPath && (
                <text x={n.p[0]} y={n.p[1] - 22} textAnchor="middle" fontSize="10"
                  fontFamily="var(--font-mono)" fill="var(--accent)">{idx + 1}.</text>
              )}
            </g>
          );
        })}

        {/* ---- right: DNA encoding ---- */}
        {/* vertex code legend */}
        {nodes.map((n, i) => (
          <text key={n.id} x={262} y={42 + i * 16} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">
            {n.name} = {n.seq}
          </text>
        ))}

        {path.length === 0 && (
          <text x={262} y={120} fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
            zacni vrcholem, sestav cestu...
          </text>
        )}

        {/* assembled top strand: vertex oligos in series */}
        {path.length > 0 && (
          <>
            <text x={262} y={118} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">5'</text>
            {path.map((id, i) => (
              <text key={id} x={278 + i * 50} y={118} fontSize="11.5" fontFamily="var(--font-mono)"
                fill="var(--accent)" fontWeight="600">{node(id).seq}</text>
            ))}
            <text x={278 + path.length * 50} y={118} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">3'</text>

            {/* edge "splint" oligos under each junction: complement spanning the seam */}
            {path.slice(0, -1).map((id, i) => {
              const next = path[i + 1];
              const seam = half(node(id).seq, "3") + half(node(next).seq, "5");
              return (
                <g key={`e${i}`}>
                  <text x={278 + 25 + i * 50} y={138} fontSize="10.5" fontFamily="var(--font-mono)"
                    fill="var(--text)">{comp(seam)}</text>
                </g>
              );
            })}
            {path.length > 1 && (
              <text x={262} y={158} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
                {"hrany = komplement seamu -> parovani + ligace"}
              </text>
            )}
          </>
        )}

        {/* status */}
        <text x={262} y={H - 12} fontSize="11" fontFamily="var(--font-mono)"
          fill={isHamiltonian ? "var(--accent)" : "var(--text-muted)"}>
          {isHamiltonian
            ? "Hamiltonovska cesta: vsechny 4 vrcholy 1x!"
            : `cesta delky ${path.length} / ${nodes.length}`}
        </text>
      </svg>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => setPath([])}
          style={{ fontSize: 12, fontFamily: "var(--font-mono)", padding: "3px 10px",
            background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line-strong)",
            borderRadius: 4, cursor: "pointer" }}>
          reset
        </button>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          cesta: {path.length ? path.map((id) => node(id).name).join(" -> ") : "(prazdna)"}
        </span>
      </div>
    </div>
  );
}
