// Belief-state visualization — 4-room vacuum, partially observable, set shrinks with percepts.
import { useState } from "react";

// 4 rooms (2x2 grid). Each room can be clean or dirty. Agent doesn't know its position initially.
// State = (agentRoom, dirty mask over 4 rooms).
// Belief state = set of states consistent with history of percepts.

const ALL_ROOMS = [0, 1, 2, 3]; // 0=TL, 1=TR, 2=BL, 3=BR
const ALL_DIRT_MASKS = []; // 16 possible masks
for (let m = 0; m < 16; m++) ALL_DIRT_MASKS.push(m);

// Initially belief = all 4 × 16 = 64 states
function initBelief() {
  const set = [];
  for (const r of ALL_ROOMS) {
    for (const m of ALL_DIRT_MASKS) {
      set.push({ room: r, mask: m });
    }
  }
  return set;
}

// Apply action to all states
const ACTIONS = ["L", "R", "U", "D", "Suck"];
function applyAction(state, action) {
  let { room, mask } = state;
  // grid layout: 0=TL, 1=TR, 2=BL, 3=BR
  // L: 1→0, 3→2; R: 0→1, 2→3; U: 2→0, 3→1; D: 0→2, 1→3
  if (action === "L") room = (room === 1) ? 0 : (room === 3) ? 2 : room;
  if (action === "R") room = (room === 0) ? 1 : (room === 2) ? 3 : room;
  if (action === "U") room = (room === 2) ? 0 : (room === 3) ? 1 : room;
  if (action === "D") room = (room === 0) ? 2 : (room === 1) ? 3 : room;
  if (action === "Suck") mask = mask & ~(1 << room);
  return { room, mask };
}

// Percept: (currentRoomIsDirty, isAtWall) — simplified — we model dirt-only sensor.
function percept(state) {
  return (state.mask >> state.room) & 1; // 0 = clean, 1 = dirty
}

function filterByPercept(belief, observed) {
  return belief.filter((s) => percept(s) === observed);
}

function dedup(belief) {
  const seen = new Set();
  const out = [];
  for (const s of belief) {
    const k = `${s.room}-${s.mask}`;
    if (!seen.has(k)) { seen.add(k); out.push(s); }
  }
  return out;
}

export default function BeliefStateVacuum() {
  const [history, setHistory] = useState([]);
  // History: [{ action, observed }]

  // Reconstruct belief from scratch
  let belief = initBelief();
  for (const h of history) {
    belief = belief.map((s) => applyAction(s, h.action));
    belief = dedup(belief);
    belief = filterByPercept(belief, h.observed);
  }

  const W = 540, H = 320;
  const ROOM_SIZE = 36;
  const GROUPS_PER_ROW = 6;

  function reset() { setHistory([]); }
  function step(action, observed) {
    setHistory([...history, { action, observed }]);
  }

  // Group belief by (room, mask) into visual cells
  const stateCount = belief.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 11 }}>
        <span style={{ color: "var(--text-muted)" }}>akce:</span>
        {["L", "R", "U", "D", "Suck"].map((a) => (
          <span key={a} style={{ display: "flex", gap: 2 }}>
            <button onClick={() => step(a, 0)} style={btnStyle()}>{a}+čisto</button>
            <button onClick={() => step(a, 1)} style={btnStyle()}>{a}+špín.</button>
          </span>
        ))}
        <button onClick={reset} style={btnStyle()}>reset</button>
        <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>
          |B| = <strong>{stateCount}</strong>
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* visualize each state in belief as a 4-cell mini-grid */}
        {belief.slice(0, 64).map((s, idx) => {
          const col = idx % GROUPS_PER_ROW;
          const row = Math.floor(idx / GROUPS_PER_ROW);
          const x0 = 16 + col * (ROOM_SIZE + 20);
          const y0 = 16 + row * (ROOM_SIZE + 20);
          return (
            <g key={idx}>
              {[0, 1, 2, 3].map((r) => {
                const cellCol = r % 2, cellRow = Math.floor(r / 2);
                const cellSize = ROOM_SIZE / 2;
                const cx = x0 + cellCol * cellSize, cy = y0 + cellRow * cellSize;
                const isDirty = (s.mask >> r) & 1;
                const isAgent = s.room === r;
                return (
                  <g key={r}>
                    <rect x={cx} y={cy} width={cellSize - 0.5} height={cellSize - 0.5}
                      fill={isDirty ? "color-mix(in oklch, oklch(0.6 0.18 60) 35%, var(--bg-card))" : "var(--bg-card)"}
                      stroke="var(--line)" strokeWidth="0.5"/>
                    {isAgent && (
                      <circle cx={cx + cellSize / 2} cy={cy + cellSize / 2} r={cellSize * 0.25}
                        fill="oklch(0.65 0.18 240)" stroke="white" strokeWidth="0.7"/>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
        {belief.length > 64 && (
          <text x={W - 16} y={H - 6} textAnchor="end" fontSize="10" fill="var(--text-faint)" fontFamily="var(--font-mono)">
            ... a {belief.length - 64} dalších
          </text>
        )}
      </svg>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 6, borderRadius: 3, fontSize: 11, fontFamily: "var(--font-mono)" }}>
        <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", marginBottom: 2 }}>historie</div>
        {history.length === 0 ? (
          <span style={{ color: "var(--text-faint)" }}>(prázdná — belief = všech 64 stavů)</span>
        ) : (
          history.map((h, i) => (
            <span key={i} style={{ marginRight: 8 }}>
              {h.action}→{h.observed === 0 ? "čisto" : "špín."}
            </span>
          ))
        )}
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Belief state = množina možných stavů konzistentních s historií. Začínáme s 64 stavy (4 pozice × 16 dirt-vzorů).
        Akce: predict (aplikuj transition na *všechny* stavy). Vjem: filter (ponech jen kompatibilní stavy).
        Modré tečky = pozice agenta v daném (možném) stavu. Oranžové buňky = špinavé místnosti.
      </div>
    </div>
  );
}

function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 3, fontSize: 10, cursor: "pointer", fontFamily: "var(--font-mono)" };
}
