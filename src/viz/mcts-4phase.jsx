// MCTS — 4-phase loop visualization with UCB1 selection.
import { useState, useMemo } from "react";

// Build a deterministic but visually rich MCTS trace.
// Tree node: { id, parent, children, n, w, untriedChildren (count), value (for leaf), depth, side ("MAX" or "MIN") }
// We simulate a small game tree with 3 root actions, each producing 2 children, each leaf has a deterministic outcome (toy values).

const BRANCH_FACTOR = 3;
const DEPTH = 2; // root → action → result → leaf
const C_UCT = 1.41;

function makeTree() {
  // outcomes for leaf paths: indexed by [a, b] choices.
  const outcomes = [
    [0.7, 0.2],   // action 0 → 70% / 20%
    [0.6, 0.5],   // action 1 → 60% / 50%
    [0.3, 0.9],   // action 2 → 30% / 90%
  ];
  let nextId = 0;
  function mk(parent, depth, path) {
    const id = nextId++;
    const node = { id, parent, children: [], n: 0, w: 0, depth, path };
    if (depth < DEPTH) {
      for (let i = 0; i < (depth === 0 ? BRANCH_FACTOR : 2); i++) {
        node.children.push(mk(id, depth + 1, [...path, i]));
      }
    } else {
      // leaf — payoff fixed
      node.payoff = outcomes[path[0]][path[1]];
    }
    return node;
  }
  return mk(null, 0, []);
}

function ucb1(child, parent) {
  if (child.n === 0) return Infinity;
  return child.w / child.n + C_UCT * Math.sqrt(Math.log(parent.n) / child.n);
}

function runMCTS(iterations) {
  const root = makeTree();
  const nodeById = new Map();
  function indexAll(n) { nodeById.set(n.id, n); n.children.forEach(indexAll); }
  indexAll(root);

  const frames = [];
  // Initial frame
  frames.push(snapshot(root, "init", null));

  // Deterministic rollouts: each "simulation" returns the leaf payoff (no random rollouts since depth ≤ 2 is tight).
  for (let it = 0; it < iterations; it++) {
    // PHASE 1 — Selection: walk down via UCB1 until we hit a leaf-of-tree (untried child or terminal)
    const selectionPath = [root];
    let cur = root;
    while (cur.children.length > 0 && cur.children.every((c) => c.n > 0)) {
      // all children expanded → pick UCB1 max
      let best = cur.children[0], bestV = -Infinity;
      for (const ch of cur.children) {
        const u = ucb1(ch, cur);
        if (u > bestV) { bestV = u; best = ch; }
      }
      cur = best;
      selectionPath.push(cur);
    }
    frames.push(snapshot(root, "select", { path: selectionPath.map((n) => n.id) }));

    // PHASE 2 — Expansion: if cur has unvisited children, pick first one
    let expanded = cur;
    if (cur.children.length > 0) {
      expanded = cur.children.find((c) => c.n === 0) || cur.children[0];
      selectionPath.push(expanded);
      frames.push(snapshot(root, "expand", { path: selectionPath.map((n) => n.id), expandedId: expanded.id }));
    }

    // PHASE 3 — Simulation: get payoff at leaf
    // If `expanded` is not a leaf, walk to first leaf greedily (toy game)
    let leaf = expanded;
    while (leaf.children.length > 0) {
      leaf = leaf.children[0];
      selectionPath.push(leaf);
    }
    const payoff = leaf.payoff;
    frames.push(snapshot(root, "simulate", { path: selectionPath.map((n) => n.id), payoff, leafId: leaf.id }));

    // PHASE 4 — Backpropagation
    for (const node of selectionPath) {
      node.n += 1;
      node.w += payoff;
    }
    frames.push(snapshot(root, "backprop", { path: selectionPath.map((n) => n.id), payoff }));
  }

  return { frames, root };
}

function snapshot(root, phase, info) {
  const stats = new Map();
  function walk(n) {
    stats.set(n.id, { n: n.n, w: n.w });
    n.children.forEach(walk);
  }
  walk(root);
  return { phase, info, stats };
}

export default function Mcts4Phase() {
  const [budget, setBudget] = useState(8);
  const { frames, root: treeRoot } = useMemo(() => runMCTS(budget), [budget]);
  const [step, setStep] = useState(0);
  const cur = frames[Math.min(step, frames.length - 1)];

  const W = 540, H = 280;

  // Layout: 3 levels — root → action → result
  function nodePos(node, treeRoot) {
    if (node.depth === 0) return { x: W / 2, y: 40 };
    if (node.depth === 1) {
      const idx = treeRoot.children.findIndex((c) => c.id === node.id);
      return { x: 100 + idx * 170, y: 130 };
    }
    // depth 2: 2 children per parent at depth 1
    const parentNode = treeRoot.children.find((c) => c.children.some((cc) => cc.id === node.id));
    const parentIdx = treeRoot.children.findIndex((c) => c.id === parentNode.id);
    const idxInParent = parentNode.children.findIndex((c) => c.id === node.id);
    return { x: 60 + parentIdx * 170 + idxInParent * 60, y: 230 };
  }

  function allNodes(n, acc = []) {
    acc.push(n);
    n.children.forEach((c) => allNodes(c, acc));
    return acc;
  }
  const nodes = allNodes(treeRoot);
  const pathSet = new Set(cur.info?.path || []);

  function nodeFill(n) {
    if (cur.info?.expandedId === n.id) return "oklch(0.7 0.2 70)";
    if (cur.info?.leafId === n.id && cur.phase === "simulate") return "oklch(0.8 0.18 145)";
    if (pathSet.has(n.id)) {
      if (cur.phase === "select") return "color-mix(in oklch, oklch(0.7 0.2 240) 35%, var(--bg-card))";
      if (cur.phase === "expand") return "color-mix(in oklch, oklch(0.7 0.2 70) 35%, var(--bg-card))";
      if (cur.phase === "simulate") return "color-mix(in oklch, oklch(0.75 0.18 145) 35%, var(--bg-card))";
      if (cur.phase === "backprop") return "color-mix(in oklch, oklch(0.7 0.2 30) 35%, var(--bg-card))";
    }
    const s = cur.stats.get(n.id);
    if (s && s.n > 0) return "color-mix(in oklch, var(--accent) 18%, var(--bg-card))";
    return "var(--bg-card)";
  }

  const phaseLabels = { init: "init", select: "1. SELECTION (UCB1)", expand: "2. EXPANSION", simulate: "3. SIMULATION", backprop: "4. BACKPROPAGATION" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>budget:</span>
          <input type="range" min={1} max={20} value={budget} onChange={(e) => { setBudget(+e.target.value); setStep(0); }} style={{ width: 100 }}/>
          <span style={{ fontFamily: "var(--font-mono)", minWidth: 24 }}>{budget}</span>
        </label>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setStep(0)} style={btnStyle()}>⏮</button>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} style={btnStyle()}>◀</button>
          <button onClick={() => setStep((s) => Math.min(frames.length - 1, s + 1))} style={btnStyle()}>▶</button>
          <button onClick={() => setStep(frames.length - 1)} style={btnStyle()}>⏭</button>
        </div>
        <span style={{ color: "var(--text)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
          {phaseLabels[cur.phase]}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 600 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {nodes.map((n) => {
          if (n.parent === null) return null;
          const p = nodes.find((m) => m.id === n.parent);
          const np = nodePos(n, treeRoot);
          const pp = nodePos(p, treeRoot);
          const onPath = pathSet.has(n.id) && pathSet.has(p.id);
          return (
            <line key={`edge-${n.id}`} x1={pp.x} y1={pp.y + 14} x2={np.x} y2={np.y - 14}
              stroke={onPath ? "oklch(0.7 0.18 60)" : "var(--line-strong)"}
              strokeWidth={onPath ? 1.8 : 1} opacity={onPath ? 0.9 : 0.55}/>
          );
        })}

        {nodes.map((n) => {
          const np = nodePos(n, treeRoot);
          const s = cur.stats.get(n.id);
          return (
            <g key={`node-${n.id}`}>
              <rect x={np.x - 26} y={np.y - 14} width={52} height={28} rx={4}
                fill={nodeFill(n)} stroke="var(--line-strong)" strokeWidth={1.2}/>
              {s && s.n > 0 ? (
                <>
                  <text x={np.x} y={np.y - 2} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text)" fontWeight="600">
                    {s.w.toFixed(2)}/{s.n}
                  </text>
                  <text x={np.x} y={np.y + 9} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                    Q̂={(s.w / s.n).toFixed(2)}
                  </text>
                </>
              ) : (
                <text x={np.x} y={np.y + 4} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                  0/0
                </text>
              )}
              {n.depth === 2 && (
                <text x={np.x} y={np.y + 24} textAnchor="middle" fontSize="8" fill="var(--text-faint)" fontFamily="var(--font-mono)">
                  v={n.payoff}
                </text>
              )}
            </g>
          );
        })}

        {/* Phase indicator legend */}
        <g transform={`translate(10, ${H - 20})`}>
          <text fontSize="9" fill="var(--text-faint)" fontFamily="var(--font-mono)">
            UCB1 = w/n + 1.41·√(ln N / n)  · větší = preferované
          </text>
        </g>
      </svg>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Každá iterace: <strong style={{ color: "oklch(0.7 0.2 240)" }}>1. Select</strong> přes UCB1 →
        <strong style={{ color: "oklch(0.7 0.2 70)" }}> 2. Expand</strong> dosud nezkoušeného potomka →
        <strong style={{ color: "oklch(0.75 0.18 145)" }}> 3. Simulate</strong> (rollout do listu) →
        <strong style={{ color: "oklch(0.7 0.2 30)" }}> 4. Backprop</strong> výsledek nahoru.
        Po dostatku iterací akce s největším <code>n</code> v kořeni je doporučená.
      </div>
    </div>
  );
}

function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
