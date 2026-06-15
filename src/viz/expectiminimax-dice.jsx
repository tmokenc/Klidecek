// Expectiminimax — chance nodes computed as weighted averages.
import { useState } from "react";

// Game tree with: MAX root → chance node (dice 1..3) → MIN → leaves
// Layout: 1 root MAX, 3 chance branches, each with 2 MIN children, each with 2 leaves

const PROBS = [1/3, 1/3, 1/3];
const LEAVES = [
  // For dice value 1: MIN over [MAX-children pairs]
  [[4, 7], [5, 3]],
  [[6, 9], [2, 8]],
  [[1, 5], [4, 6]],
];

function computeExpectimini() {
  // values[d][m] = min of leaves[d][m]
  const minVals = LEAVES.map((row) => row.map((pair) => Math.min(...pair)));
  // For each chance branch, take MAX over MIN children (assuming MAX comes after chance)
  // But the structure here is MAX → chance → MIN → leaves; so MAX takes max over its children which are chance nodes.
  // Actually let me think again: root MAX → 3 chance children → each chance has 2 MIN children → each MIN has 2 leaves
  // Wait — that means MAX's only branching is over the dice... not quite right.
  // Let me reformulate: MAX picks action a ∈ {a1, a2}; for each action, chance happens (dice 1..3); after chance MIN picks.
  // So tree is: MAX → 2 actions, each → chance node → 3 outcomes, each → MIN → 2 leaves.
  // Restructure data accordingly.
  // I'll redo this with the right semantics below.
  return minVals;
}

// Restructured tree:
// MAX → action a1 → chance(1/3, 1/3, 1/3) → MIN per outcome → 2 leaves
// MAX → action a2 → chance(1/3, 1/3, 1/3) → MIN per outcome → 2 leaves
const ACTIONS = {
  a1: {
    chance: [
      { p: 1/3, dice: 1, minLeaves: [4, 7] },
      { p: 1/3, dice: 2, minLeaves: [5, 3] },
      { p: 1/3, dice: 3, minLeaves: [6, 9] },
    ],
  },
  a2: {
    chance: [
      { p: 1/3, dice: 1, minLeaves: [2, 8] },
      { p: 1/3, dice: 2, minLeaves: [1, 5] },
      { p: 1/3, dice: 3, minLeaves: [4, 6] },
    ],
  },
};

function actionValue(action) {
  // For each chance outcome, compute MIN over leaves, then E[chance]
  let exp = 0;
  const outcomes = action.chance.map((c) => {
    const minV = Math.min(...c.minLeaves);
    exp += c.p * minV;
    return { ...c, minV };
  });
  return { exp, outcomes };
}

export default function ExpectiminimaxDice() {
  const a1 = actionValue(ACTIONS.a1);
  const a2 = actionValue(ACTIONS.a2);
  const bestAction = a1.exp > a2.exp ? "a1" : "a2";
  const rootValue = Math.max(a1.exp, a2.exp);

  const [showFormula, setShowFormula] = useState(false);

  const W = 540, H = 320;

  // Layout positions
  const ROOT = { x: W / 2, y: 22 };
  const ACT = { a1: { x: 130, y: 70 }, a2: { x: 410, y: 70 } };
  const CHANCE_OFFS = [-50, 0, 50];
  const CHANCE = (act, i) => ({ x: ACT[act].x + CHANCE_OFFS[i] * 1.8, y: 140 });
  const MIN_POS = (act, i) => ({ x: ACT[act].x + CHANCE_OFFS[i] * 1.8, y: 200 });
  const LEAF_POS = (act, i, k) => ({ x: ACT[act].x + CHANCE_OFFS[i] * 1.8 + (k - 0.5) * 30, y: 270 });

  function drawAction(actionKey, actionResult) {
    return (
      <g key={actionKey}>
        {/* action node */}
        <rect x={ACT[actionKey].x - 30} y={ACT[actionKey].y - 14} width={60} height={28} rx={4}
          fill={bestAction === actionKey ? "color-mix(in oklch, oklch(0.75 0.18 145) 35%, var(--bg-card))" : "var(--bg-card)"}
          stroke={bestAction === actionKey ? "oklch(0.75 0.18 145)" : "var(--accent)"} strokeWidth={1.5}/>
        <text x={ACT[actionKey].x} y={ACT[actionKey].y - 1} textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="600">action {actionKey}</text>
        <text x={ACT[actionKey].x} y={ACT[actionKey].y + 11} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill={bestAction === actionKey ? "oklch(0.78 0.18 145)" : "var(--text-muted)"} fontWeight="700">
          E = {actionResult.exp.toFixed(2)}
        </text>
        {/* root → action */}
        <line x1={ROOT.x} y1={ROOT.y + 14} x2={ACT[actionKey].x} y2={ACT[actionKey].y - 14} stroke="var(--line-strong)" strokeWidth="1.2"/>

        {/* For each chance outcome */}
        {actionResult.outcomes.map((oc, i) => {
          const cp = CHANCE(actionKey, i);
          const mp = MIN_POS(actionKey, i);
          return (
            <g key={i}>
              <line x1={ACT[actionKey].x} y1={ACT[actionKey].y + 14} x2={cp.x} y2={cp.y - 14} stroke="var(--line-strong)" strokeWidth="1"/>
              {/* chance node (triangle) */}
              <polygon points={`${cp.x - 14},${cp.y + 10} ${cp.x + 14},${cp.y + 10} ${cp.x},${cp.y - 14}`}
                fill="color-mix(in oklch, oklch(0.7 0.18 60) 20%, var(--bg-card))" stroke="oklch(0.7 0.18 60)" strokeWidth="1.2"/>
              <text x={cp.x + 5} y={cp.y + 22} textAnchor="start" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">dice={oc.dice}</text>
              <text x={cp.x} y={cp.y - 18} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">p={oc.p.toFixed(2)}</text>
              {/* chance → MIN */}
              <line x1={cp.x} y1={cp.y + 12} x2={mp.x} y2={mp.y - 12} stroke="var(--line-strong)" strokeWidth="1"/>
              {/* MIN node */}
              <rect x={mp.x - 20} y={mp.y - 12} width={40} height={24} rx={3}
                fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.2"/>
              <text x={mp.x} y={mp.y + 3} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)" fontWeight="600">MIN={oc.minV}</text>
              {/* leaves */}
              {oc.minLeaves.map((v, k) => {
                const lp = LEAF_POS(actionKey, i, k);
                const isMin = v === oc.minV;
                return (
                  <g key={k}>
                    <line x1={mp.x} y1={mp.y + 12} x2={lp.x} y2={lp.y - 10} stroke="var(--line-strong)" strokeWidth="0.8" opacity="0.6"/>
                    <rect x={lp.x - 12} y={lp.y - 10} width={24} height={20} rx={2}
                      fill={isMin ? "color-mix(in oklch, oklch(0.75 0.18 145) 40%, var(--bg-card))" : "var(--bg-card)"} stroke="var(--line-strong)" strokeWidth="1"/>
                    <text x={lp.x} y={lp.y + 4} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)" fontWeight={isMin ? "700" : "400"}>{v}</text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </g>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input type="checkbox" checked={showFormula} onChange={(e) => setShowFormula(e.target.checked)} />
          výpočet
        </label>
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          root MAX = {rootValue.toFixed(2)} → vyber {bestAction}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* root */}
        <rect x={ROOT.x - 30} y={ROOT.y - 12} width={60} height={26} rx={4} fill="color-mix(in oklch, oklch(0.7 0.2 240) 30%, var(--bg-card))" stroke="oklch(0.7 0.2 240)" strokeWidth="1.5"/>
        <text x={ROOT.x} y={ROOT.y + 3} textAnchor="middle" fontSize="10" fill="var(--text)" fontWeight="700">MAX = {rootValue.toFixed(2)}</text>

        {drawAction("a1", a1)}
        {drawAction("a2", a2)}
      </svg>

      {showFormula && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 8, borderRadius: 4, fontSize: 11, fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
          <div>E[a1] = {a1.outcomes.map((o) => `${o.p.toFixed(2)}·${o.minV}`).join(" + ")} = <strong>{a1.exp.toFixed(2)}</strong></div>
          <div>E[a2] = {a2.outcomes.map((o) => `${o.p.toFixed(2)}·${o.minV}`).join(" + ")} = <strong>{a2.exp.toFixed(2)}</strong></div>
          <div style={{ marginTop: 4 }}>MAX = max(E[a1], E[a2]) = <strong style={{ color: "oklch(0.78 0.18 145)" }}>{rootValue.toFixed(2)}</strong></div>
        </div>
      )}

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        <strong>Chance node</strong> (trojúhelník) = uzel náhody. Hodnota = vážený průměr potomků (Σ p · v).
        Stejná struktura jako minimax, jen místo `max/min` se aplikuje očekávání. Backgammon, Yahtzee.
        Cutoff (α-β) v expectiminimax je *slabší* — náhoda mezi-vrstva často nedovolí silný pruning.
      </div>
    </div>
  );
}
