// Minimum Extraction Sort na binárním stromě.
// Hodnoty bublají vzhůru, root postupně vydává minimum.
// Simulace pravidla: prázdný uzel přijme menšího syna; uzel s hodnotou čeká.
// Ověřeno manuální trasou: vstup [3,1,7,0,4,1,6,3] → výstup [0,1,1,3,3,4,6,7] ✓
import { useState, useMemo } from "react";

const PRESETS = {
  "klasický": [3, 1, 7, 0, 4, 1, 6, 3],
  "reverzní": [8, 7, 6, 5, 4, 3, 2, 1],
  "vzestupný": [1, 2, 3, 4, 5, 6, 7, 8],
  "duplikáty": [5, 5, 5, 5, 5, 5, 5, 5],
};

// Build tree structure. Leaves at level=L; internal at level<L.
// For n=8 leaves: levels 0 (root), 1, 2, 3 (leaves).
// Node id encoding: level + slot. We'll use a flat array indexed by depth-first id.
//   root = 0, then level 1 has nodes 1,2, level 2 has 3,4,5,6, level 3 has 7..14.
// children(i) = 2i+1, 2i+2. parent(i) = (i-1)/2.

function makeInitialTree(input) {
  const n = input.length;
  const nodes = []; // array of {id, level, val (null = empty), isLeaf}
  // Compute levels: total levels = log2(n) + 1.
  const totalLevels = Math.log2(n) + 1;
  // node count = 2n - 1 for perfect binary tree with n leaves
  // Indices 0..2n-2. Internal: 0..n-2, leaves: n-1..2n-2.
  for (let i = 0; i < 2 * n - 1; i++) {
    const isLeaf = i >= n - 1;
    const level = Math.floor(Math.log2(i + 1));
    nodes.push({
      id: i,
      level,
      isLeaf,
      val: isLeaf ? input[i - (n - 1)] : null,
    });
  }
  return nodes;
}

// One cycle of the algorithm.
// Rule (per textbook):
//   - if root has value: output and clear
//   - else if has value: wait (no change)
//   - else: if both children empty → nothing; if exactly one child has value → take it; if both → take min
// All internal nodes act based on START-of-cycle state in parallel.
function step(nodes, n) {
  const totalNodes = 2 * n - 1;
  const newNodes = nodes.map((nd) => ({ ...nd }));
  const events = []; // for display
  let output = null;

  // Snapshot OLD state values
  const oldVals = nodes.map((nd) => nd.val);

  // Track which children get "consumed" this cycle.
  const consumedFromChild = new Set();

  // Process internal nodes (id 0..n-2)
  for (let i = 0; i < n - 1; i++) {
    const oldVal = oldVals[i];
    if (i === 0 && oldVal !== null) {
      // root has value → output
      output = oldVal;
      newNodes[i].val = null;
      events.push({ kind: "output", val: oldVal, nodeId: i });
      continue;
    }
    if (oldVal !== null) continue; // has value, wait
    // empty — try to absorb from child
    const l = 2 * i + 1;
    const r = 2 * i + 2;
    const lv = oldVals[l];
    const rv = oldVals[r];
    let absorbedFrom = null;
    if (lv === null && rv === null) {
      // both empty
    } else if (lv === null) {
      newNodes[i].val = rv;
      absorbedFrom = r;
    } else if (rv === null) {
      newNodes[i].val = lv;
      absorbedFrom = l;
    } else {
      // both have values → take min (ties: prefer left)
      if (lv <= rv) {
        newNodes[i].val = lv;
        absorbedFrom = l;
      } else {
        newNodes[i].val = rv;
        absorbedFrom = r;
      }
    }
    if (absorbedFrom !== null) {
      consumedFromChild.add(absorbedFrom);
      events.push({ kind: "absorb", from: absorbedFrom, to: i, val: newNodes[i].val });
    }
  }

  // Clear consumed children
  consumedFromChild.forEach((childId) => {
    newNodes[childId].val = null;
  });

  return { nodes: newNodes, events, output };
}

function simulate(input) {
  const n = input.length;
  const states = [];
  let nodes = makeInitialTree(input);
  states.push({ cycle: 0, nodes, output: [], events: [], label: "Inicializace — listy mají vstupní hodnoty" });

  let output = [];
  const maxCycles = 2 * n + Math.log2(n) + 2;
  for (let c = 1; c <= maxCycles; c++) {
    const r = step(nodes, n);
    nodes = r.nodes;
    if (r.output !== null) output = [...output, r.output];
    states.push({ cycle: c, nodes, output: [...output], events: r.events, label: `Cyklus ${c}` });
    if (output.length === n) break;
  }
  return states;
}

// Validate: sort the input and compare to output
function isCorrectlySorted(input, output) {
  if (output.length !== input.length) return false;
  const sorted = input.slice().sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) if (sorted[i] !== output[i]) return false;
  return true;
}

export default function MinExtractionSort() {
  const [presetKey, setPresetKey] = useState("klasický");
  const [step_, setStep] = useState(0);

  const input = PRESETS[presetKey];
  const states = useMemo(() => simulate(input), [input]);
  const cur = states[Math.min(step_, states.length - 1)];

  useMemo(() => { setStep(0); }, [presetKey]);

  const n = input.length;
  const W = 560, H = 360;

  // Layout: levels 0..3 for n=8
  const totalLevels = Math.log2(n) + 1;
  const nodeRadius = 16;
  const levelY = (level) => 40 + (level * (H - 80)) / (totalLevels - 1);
  const nodeX = (id, level) => {
    // nodes at level L: 2^L of them, from index 2^L - 1 to 2^(L+1) - 2
    const idxInLevel = id - (Math.pow(2, level) - 1);
    const totalInLevel = Math.pow(2, level);
    return 30 + ((idxInLevel + 0.5) * (W - 60)) / totalInLevel;
  };

  const finalState = states[states.length - 1];
  const verified = isCorrectlySorted(input, finalState.output);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="viz-controls" style={{ padding: 8, background: "var(--bg-inset)", borderRadius: 8, fontSize: 11.5 }}>
        <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>vstup:</span>
        {Object.keys(PRESETS).map((k) => (
          <button key={k} className="viz-btn" data-active={presetKey === k} onClick={() => setPresetKey(k)}>{k}</button>
        ))}
      </div>

      <div className="viz-controls">
        <button className="viz-btn" onClick={() => setStep(Math.max(0, step_ - 1))} disabled={step_ === 0}>← předchozí</button>
        <span className="viz-readout" style={{ flex: 1, textAlign: "center" }}>
          cyklus {cur.cycle} / {states[states.length - 1].cycle}
        </span>
        <button className="viz-btn primary" onClick={() => setStep(Math.min(states.length - 1, step_ + 1))} disabled={step_ >= states.length - 1}>další →</button>
        <button className="viz-btn" onClick={() => setStep(states.length - 1)}>⏭</button>
        <button className="viz-btn" onClick={() => setStep(0)}>↻</button>
      </div>

      {/* Tree SVG */}
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* Edges from parent to children */}
        {cur.nodes.map((nd) => {
          if (nd.isLeaf) return null;
          const lc = 2 * nd.id + 1;
          const rc = 2 * nd.id + 2;
          if (lc >= cur.nodes.length) return null;
          const px = nodeX(nd.id, nd.level), py = levelY(nd.level);
          const lcN = cur.nodes[lc];
          const rcN = cur.nodes[rc];
          const lcX = nodeX(lcN.id, lcN.level), lcY = levelY(lcN.level);
          const rcX = nodeX(rcN.id, rcN.level), rcY = levelY(rcN.level);
          // Check if this edge is "absorbing" this cycle
          const absorbingL = cur.events.some((e) => e.kind === "absorb" && e.to === nd.id && e.from === lc);
          const absorbingR = cur.events.some((e) => e.kind === "absorb" && e.to === nd.id && e.from === rc);
          return (
            <g key={`e-${nd.id}`}>
              <line x1={px} y1={py + nodeRadius} x2={lcX} y2={lcY - nodeRadius}
                    stroke={absorbingL ? "var(--accent)" : "var(--line-strong)"} strokeWidth={absorbingL ? 2 : 0.8} opacity={absorbingL ? 1 : 0.5} />
              <line x1={px} y1={py + nodeRadius} x2={rcX} y2={rcY - nodeRadius}
                    stroke={absorbingR ? "var(--accent)" : "var(--line-strong)"} strokeWidth={absorbingR ? 2 : 0.8} opacity={absorbingR ? 1 : 0.5} />
            </g>
          );
        })}

        {/* Nodes */}
        {cur.nodes.map((nd) => {
          const x = nodeX(nd.id, nd.level);
          const y = levelY(nd.level);
          const hasVal = nd.val !== null;
          const isOutputting = nd.id === 0 && cur.events.some((e) => e.kind === "output");
          return (
            <g key={`n-${nd.id}`}>
              <circle cx={x} cy={y} r={nodeRadius}
                      fill={isOutputting ? "oklch(0.62 0.14 142 / 0.4)" : hasVal ? "oklch(0.62 0.14 252 / 0.3)" : "var(--bg-card)"}
                      stroke={isOutputting ? "oklch(0.55 0.18 142)" : hasVal ? "var(--accent)" : "var(--line-strong)"}
                      strokeWidth="1.4"
                      strokeDasharray={hasVal ? "" : "3 3"} />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="12" fontFamily="var(--font-mono)" fontWeight="600"
                    fill={hasVal ? "var(--text)" : "var(--text-faint)"}>
                {hasVal ? nd.val : "∅"}
              </text>
              {nd.id === 0 && (
                <text x={x + nodeRadius + 5} y={y + 3} textAnchor="start" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">root</text>
              )}
            </g>
          );
        })}

        <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">
          {cur.label}
        </text>
      </svg>

      {/* Output stream */}
      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
          Výstupní proud (extrahovaná minima)
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
          [{cur.output.map((v, i) => <span key={i}>{i > 0 ? ", " : ""}{v}</span>)}{cur.output.length < n && <span style={{ color: "var(--text-faint)" }}>{cur.output.length > 0 ? ", " : ""}…</span>}]
        </div>
        {step_ === states.length - 1 && verified && (
          <div style={{ marginTop: 6, fontSize: 11.5, color: "oklch(0.55 0.18 142)", fontFamily: "var(--font-mono)" }}>
            ✓ ověřeno: shoda se sekvenčním sortem
          </div>
        )}
      </div>

      <div style={{ padding: 10, background: "var(--bg-inset)", borderRadius: 6, fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
        První minimum dorazí do kořene po <b style={{ color: "var(--text)" }}>log n + 1 = {Math.log2(n) + 1}</b> krocích. Každé další po <b style={{ color: "var(--text)" }}>2 cyklech</b> (jeden na bubblování, jeden na výstup).
        Celkový čas: <b style={{ color: "var(--text)" }}>2n + log n − 1 = {2 * n + Math.log2(n) - 1}</b>. Procesorů: <b style={{ color: "var(--text)" }}>2n − 1 = {2 * n - 1}</b>. Cena: <b style={{ color: "oklch(0.55 0.18 22)" }}>O(n²) — není cost-optimal.</b>
      </div>
    </div>
  );
}
