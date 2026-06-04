// UPGMA step-through: merge the closest pair, recompute distances (size-weighted
// arithmetic mean), grow an ultrametric dendrogram. Step button drives the merges.
import { useState } from "react";

// Initial taxa and a symmetric distance matrix (additive-ish, integer-ish for clarity).
const TAXA = ["A", "B", "C", "D"];
const D0 = [
  [0, 4, 10, 12],
  [4, 0, 10, 12],
  [10, 10, 0, 6],
  [12, 12, 6, 0],
];

// Precompute the whole UPGMA run as a list of steps so the Step button can scrub it.
function runUPGMA() {
  // clusters: { id, members:[leaf names], size, height, x } — height = node depth
  let clusters = TAXA.map((t, i) => ({ id: t, members: [t], size: 1, height: 0, leaf: true, kids: null, dij: 0 }));
  // distance lookup keyed by cluster id pair
  const dist = {};
  TAXA.forEach((a, i) => TAXA.forEach((b, j) => { dist[a + "|" + b] = D0[i][j]; }));
  const get = (a, b) => dist[a + "|" + b];

  const steps = [{ clusters: clusters.map((c) => ({ ...c })), pair: null, newD: null }];
  let counter = 0;

  while (clusters.length > 1) {
    // find closest pair
    let best = null;
    for (let i = 0; i < clusters.length; i++)
      for (let j = i + 1; j < clusters.length; j++) {
        const d = get(clusters[i].id, clusters[j].id);
        if (best === null || d < best.d) best = { i, j, d };
      }
    const ci = clusters[best.i], cj = clusters[best.j];
    const newHeight = best.d / 2; // ultrametric: each leaf equidistant from this node
    const merged = {
      id: "U" + counter++,
      members: [...ci.members, ...cj.members],
      size: ci.size + cj.size,
      height: newHeight,
      leaf: false,
      kids: [ci, cj],
      dij: best.d,
    };
    // recompute distances to all surviving clusters: size-weighted mean
    const others = clusters.filter((_, k) => k !== best.i && k !== best.j);
    for (const o of others) {
      const nd = (ci.size * get(ci.id, o.id) + cj.size * get(cj.id, o.id)) / merged.size;
      dist[merged.id + "|" + o.id] = nd;
      dist[o.id + "|" + merged.id] = nd;
    }
    dist[merged.id + "|" + merged.id] = 0;
    clusters = [...others, merged];

    steps.push({
      clusters: clusters.map((c) => ({ ...c })),
      pair: [ci.id, cj.id],
      pairNames: [ci.members.join(""), cj.members.join("")],
      dij: best.d,
      newD: others.map((o) => ({ to: o.members.join(""), v: dist[merged.id + "|" + o.id] })),
    });
  }
  return steps;
}

const STEPS = runUPGMA();
const MAXH = Math.max(...STEPS[STEPS.length - 1].clusters.map((c) => c.height));

// assign x positions to leaves in a fixed order so the dendrogram is stable
const LEAF_X = {};
TAXA.forEach((t, i) => (LEAF_X[t] = i));

export default function BifUpgma() {
  const [step, setStep] = useState(0);
  const cur = STEPS[step];

  // Build a render tree from the current clusters: every top-level cluster is a subtree.
  const W = 420, H = 216;
  const padL = 70, padR = 24, padT = 30, padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const xOf = (i) => padL + (TAXA.length === 1 ? plotW / 2 : (i / (TAXA.length - 1)) * plotW);
  const yOf = (h) => padT + (MAXH === 0 ? 0 : (h / MAXH) * plotH);

  // recursively place a cluster, returning its drawn x and y(height)
  const lines = [];
  const dots = [];
  function place(c) {
    if (c.leaf) {
      const x = xOf(LEAF_X[c.id]);
      return { x, y: yOf(0) };
    }
    const a = place(c.kids[0]);
    const b = place(c.kids[1]);
    const y = yOf(c.height);
    // vertical drops from the two children up to this node's height
    lines.push({ x1: a.x, y1: a.y, x2: a.x, y2: y, join: false });
    lines.push({ x1: b.x, y1: b.y, x2: b.x, y2: y, join: false });
    // horizontal connector at this node's height
    lines.push({ x1: a.x, y1: y, x2: b.x, y2: y, join: true });
    const x = (a.x + b.x) / 2;
    dots.push({ x, y, h: c.height });
    return { x, y };
  }
  cur.clusters.forEach((c) => place(c));

  // which leaves belong to the pair just merged this step? highlight them
  const mergedNames = step > 0 && cur.pairNames ? new Set([...cur.pairNames.join("")].filter((ch) => /[A-Z]/.test(ch))) : new Set();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 520, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* height axis */}
        <line x1={padL - 8} y1={padT} x2={padL - 8} y2={H - padB} stroke="var(--line-strong)" strokeWidth="0.7" />
        <text x={12} y={16} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">vyska uzlu</text>
        {[0, 0.5, 1].map((f, i) => {
          const y = padT + f * plotH;
          return (
            <g key={i}>
              <line x1={padL - 11} y1={y} x2={padL - 5} y2={y} stroke="var(--line-strong)" strokeWidth="0.7" />
              <text x={padL - 14} y={y + 3} textAnchor="end" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">
                {(MAXH * f).toFixed(1)}
              </text>
            </g>
          );
        })}
        {/* dendrogram edges */}
        {lines.map((l, i) => (
          <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
            stroke={l.join ? "var(--accent)" : "var(--accent-line)"} strokeWidth={l.join ? 2 : 1.4} />
        ))}
        {/* internal nodes */}
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r="2.6" fill="var(--accent)" />
        ))}
        {/* leaf labels */}
        {TAXA.map((t) => {
          const on = mergedNames.has(t);
          return (
            <g key={t}>
              <circle cx={xOf(LEAF_X[t])} cy={yOf(0)} r="9"
                fill={on ? "var(--accent)" : "var(--bg-card)"}
                stroke={on ? "var(--accent)" : "var(--line-strong)"} strokeWidth="1.2" />
              <text x={xOf(LEAF_X[t])} y={yOf(0) + 1} textAnchor="middle" dominantBaseline="central"
                fontSize="11" fontFamily="var(--font-mono)" fill={on ? "white" : "var(--text)"}>{t}</text>
            </g>
          );
        })}
      </svg>

      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={() => setStep((s) => (s + 1) % STEPS.length)}
          style={{ fontSize: 12, padding: "3px 10px", cursor: "pointer",
            background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line-strong)", borderRadius: 5 }}>
          {step === STEPS.length - 1 ? "restart" : "krok ->"}
        </button>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          krok {step} / {STEPS.length - 1} · {cur.clusters.length} shluku
        </span>
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)", minHeight: 34 }}>
        {step === 0
          ? "matice 4x4: najdi nejblizsi dvojici, sluc ji, prepocti vzdalenosti"
          : `slouceno ${cur.pairNames[0]} + ${cur.pairNames[1]} (d=${cur.dij}), uzel ve vysce ${(cur.dij / 2).toFixed(1)}` +
            (cur.newD && cur.newD.length
              ? " · nove d: " + cur.newD.map((x) => `${x.to}=${x.v.toFixed(1)}`).join(", ")
              : " · hotovo: ultrametricky strom")}
      </div>
    </div>
  );
}
