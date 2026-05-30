// AND-OR tree for nondeterministic vacuum world — show conditional plan.
import { useState } from "react";

// 4-state vacuum world (simplified):
// State 1: agent left, both dirty
// State 2: agent right, both dirty
// State 3: agent left, only right dirty
// State 4: agent right, only left dirty
// Actions: L (move left), R (move right), Suck
// Suck is *nondeterministic*: on dirty cell, sometimes also cleans the other cell.

const NODES = {
  S1: { label: "1\nL dirty, R dirty\nagent: L", terminal: false, type: "OR" },
  S2: { label: "2\nL dirty, R dirty\nagent: R", terminal: false, type: "OR" },
  S5: { label: "5\nL clean, R dirty\nagent: L", terminal: false, type: "OR" },
  S6: { label: "6\nL clean, R dirty\nagent: R", terminal: false, type: "OR" },
  S7: { label: "7\nL dirty, R clean\nagent: L", terminal: false, type: "OR" },
  S8: { label: "8\nL clean, R clean\nagent: any", terminal: true, type: "GOAL" },
};

// Edges: from OR to AND (action), then AND can branch to multiple OR nodes (nondeterminism)
const ACTIONS = {
  S1: [
    { action: "Suck", outcomes: ["S5", "S8"] }, // suck might also clean R
  ],
  S5: [
    { action: "R", outcomes: ["S6"] },
  ],
  S6: [
    { action: "Suck", outcomes: ["S8", "S6"] }, // sometimes makes it dirty again
  ],
};

const LEVELS = [
  ["S1"],
  ["a:S1-Suck"],
  ["S5", "S8"],
  ["a:S5-R"],
  ["S6"],
  ["a:S6-Suck"],
  ["S8b"],
];

function planLabel(node) {
  return `[Suck, R, Suck, if R-dirty Suck again]`;
}

export default function AndOrTreePlan() {
  const [showPlan, setShowPlan] = useState(false);
  const [expanded, setExpanded] = useState({ "S1-Suck": true, "S5-R": true, "S6-Suck": true });

  const W = 540, H = 390;
  // Layout: BFS-like
  // OR (state) nodes are circles; AND (action) nodes are bars.
  const positions = {
    S1: { x: W / 2, y: 30 },
    "a:S1-Suck": { x: W / 2, y: 80 },
    S5: { x: W / 2 - 110, y: 140 },
    S8a: { x: W / 2 + 110, y: 140 },
    "a:S5-R": { x: W / 2 - 110, y: 190 },
    S6: { x: W / 2 - 110, y: 240 },
    "a:S6-Suck": { x: W / 2 - 110, y: 290 },
    S8b: { x: W / 2 - 165, y: 350 },
    S6loop: { x: W / 2 - 55, y: 350 },
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input type="checkbox" checked={showPlan} onChange={(e) => setShowPlan(e.target.checked)} />
          ukázat plán
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width={W} height={H} fill="var(--bg-inset)"/>

        {/* Edges */}
        <g stroke="var(--line-strong)" strokeWidth="1.2" fill="none">
          {/* S1 → action */}
          <line x1={positions.S1.x} y1={positions.S1.y + 18} x2={positions["a:S1-Suck"].x} y2={positions["a:S1-Suck"].y - 8}/>
          {/* action → outcomes (AND: both must succeed) */}
          <line x1={positions["a:S1-Suck"].x - 28} y1={positions["a:S1-Suck"].y + 8} x2={positions.S5.x} y2={positions.S5.y - 18} stroke="oklch(0.7 0.18 60)" strokeDasharray="3 2"/>
          <line x1={positions["a:S1-Suck"].x + 28} y1={positions["a:S1-Suck"].y + 8} x2={positions.S8a.x} y2={positions.S8a.y - 18} stroke="oklch(0.7 0.18 60)" strokeDasharray="3 2"/>
          {/* S5 → action */}
          <line x1={positions.S5.x} y1={positions.S5.y + 18} x2={positions["a:S5-R"].x} y2={positions["a:S5-R"].y - 8}/>
          <line x1={positions["a:S5-R"].x} y1={positions["a:S5-R"].y + 8} x2={positions.S6.x} y2={positions.S6.y - 18}/>
          {/* S6 → action */}
          <line x1={positions.S6.x} y1={positions.S6.y + 18} x2={positions["a:S6-Suck"].x} y2={positions["a:S6-Suck"].y - 8}/>
          <line x1={positions["a:S6-Suck"].x - 28} y1={positions["a:S6-Suck"].y + 8} x2={positions.S8b.x} y2={positions.S8b.y - 18} stroke="oklch(0.7 0.18 60)" strokeDasharray="3 2"/>
          <line x1={positions["a:S6-Suck"].x + 28} y1={positions["a:S6-Suck"].y + 8} x2={positions.S6loop.x} y2={positions.S6loop.y - 18} stroke="oklch(0.7 0.18 60)" strokeDasharray="3 2"/>
        </g>

        {/* AND nodes (action bars) */}
        {[
          { id: "a:S1-Suck", label: "Suck" },
          { id: "a:S5-R", label: "R" },
          { id: "a:S6-Suck", label: "Suck" },
        ].map((act) => (
          <g key={act.id}>
            <rect x={positions[act.id].x - 30} y={positions[act.id].y - 8} width={60} height={16} rx={3}
              fill="color-mix(in oklch, oklch(0.7 0.18 60) 30%, var(--bg-card))" stroke="oklch(0.7 0.18 60)" strokeWidth="1.2"/>
            <text x={positions[act.id].x} y={positions[act.id].y + 4} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)" fontWeight="700">{act.label}</text>
          </g>
        ))}

        {/* OR (state) nodes */}
        {[
          { id: "S1", label: "S1", desc: "L,R dirty\nagent left", goal: false },
          { id: "S5", label: "S5", desc: "L clean\nagent left", goal: false },
          { id: "S8a", label: "S8 (goal)", desc: "all clean", goal: true },
          { id: "S6", label: "S6", desc: "L clean, R dirty\nagent right", goal: false },
          { id: "S8b", label: "S8 (goal)", desc: "all clean", goal: true },
          { id: "S6loop", label: "S6 (loop)", desc: "back to S6", goal: false, loop: true },
        ].map((s) => (
          <g key={s.id}>
            <circle cx={positions[s.id].x} cy={positions[s.id].y} r="18"
              fill={s.goal ? "color-mix(in oklch, oklch(0.75 0.18 145) 35%, var(--bg-card))" : (s.loop ? "color-mix(in oklch, oklch(0.6 0.2 25) 20%, var(--bg-card))" : "var(--bg-card)")}
              stroke={s.goal ? "oklch(0.75 0.18 145)" : (s.loop ? "oklch(0.6 0.2 25)" : "var(--accent)")} strokeWidth="1.4"/>
            <text x={positions[s.id].x} y={positions[s.id].y + 2} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)" fontWeight="700">{s.label}</text>
            <text x={positions[s.id].x} y={positions[s.id].y + 30} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{s.desc.split("\n")[0]}</text>
            {s.desc.split("\n")[1] && <text x={positions[s.id].x} y={positions[s.id].y + 42} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{s.desc.split("\n")[1]}</text>}
          </g>
        ))}

        {/* AND-OR explanation chip */}
        <g transform={`translate(${W - 180}, 16)`}>
          <rect x={0} y={0} width={170} height={48} rx={4} fill="var(--bg-card)" stroke="var(--line)" strokeWidth="0.8"/>
          <text x={6} y={12} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text)" fontWeight="600">AND (= action outcome)</text>
          <line x1={6} y1={17} x2={50} y2={17} stroke="oklch(0.7 0.18 60)" strokeDasharray="3 2" strokeWidth="1.5"/>
          <text x={6} y={32} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text)" fontWeight="600">OR (= state choice)</text>
          <line x1={6} y1={37} x2={50} y2={37} stroke="var(--line-strong)" strokeWidth="1.5"/>
        </g>
      </svg>

      {showPlan && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 8, borderRadius: 4, fontSize: 11, fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
          <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", marginBottom: 4 }}>plán (podmíněný)</div>
          <div>1. Suck</div>
          <div>2. if state == S8 then return ✓</div>
          <div>3. else (state == S5):</div>
          <div style={{ paddingLeft: 14 }}>3a. R</div>
          <div style={{ paddingLeft: 14 }}>3b. Suck</div>
          <div style={{ paddingLeft: 14 }}>3c. if state == S6 (loop): repeat Suck until S8</div>
        </div>
      )}

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        AND uzly (čárkované): *všechny* potomky musí vést k cíli (action může skončit *kterýmkoliv* outcomem). OR uzly: stačí *jeden* potomek vedoucí k cíli.
        Při Suck → nondeterminismus: může vyčistit jen aktuální (→S5) nebo i vedlejší (→S8). Plán musí pokrýt *obě* možnosti.
      </div>
    </div>
  );
}
