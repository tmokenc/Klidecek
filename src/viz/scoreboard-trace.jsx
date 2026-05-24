// scoreboard-trace — CDC 6600 scoreboard. Trace 4-phase execution
// (Issue / Read / Execute / Write) with WAW + WAR stall highlighting.
import { useState } from "react";

const PROG = [
  { id: 0, txt: "ld   f6, 34(r2)", dst: "f6", src: [], lat: 2, unit: "L/S" },
  { id: 1, txt: "ld   f2, 45(r3)", dst: "f2", src: [], lat: 2, unit: "L/S" },
  { id: 2, txt: "mulf f0, f2, f4", dst: "f0", src: ["f2","f4"], lat: 5, unit: "MUL" },
  { id: 3, txt: "subf f8, f6, f2", dst: "f8", src: ["f6","f2"], lat: 2, unit: "ADD" },
  { id: 4, txt: "divf f10, f0, f6", dst: "f10", src: ["f0","f6"], lat: 8, unit: "DIV" },
  { id: 5, txt: "addf f6, f8, f2", dst: "f6", src: ["f8","f2"], lat: 2, unit: "ADD" },
];

// Simulate scoreboard: phases I (issue), R (read operands), E (execute), W (write).
// Stalls: WAW (target busy), structural (FU busy), WAR (writeback waits).
function simulate() {
  const units = { "L/S": null, "MUL": null, "ADD": null, "DIV": null };
  const regWriter = {}; // reg → instr that will write it
  const sched = PROG.map(() => ({ I: null, R: null, E: null, W: null }));
  const stalls = PROG.map(() => ({ waw: false, struct: false, war: false }));
  let cycle = 0;
  let issued = 0;
  const order = PROG.map(p => p.id);
  while (issued < PROG.length || Object.values(units).some(u => u !== null)) {
    // ISSUE: in-order
    const next = issued;
    if (next < PROG.length) {
      const inst = PROG[next];
      // Structural: unit busy?
      const unitBusy = units[inst.unit] !== null;
      // WAW: another in-flight inst writes same dst?
      const waw = Object.values(units).some(u => u && u.dst === inst.dst && u.id !== inst.id);
      if (!unitBusy && !waw) {
        sched[next].I = cycle;
        units[inst.unit] = { ...inst, phase: "R", srcReady: false };
        regWriter[inst.dst] = inst.id;
        issued++;
      } else {
        if (unitBusy) stalls[next].struct = true;
        if (waw) stalls[next].waw = true;
      }
    }
    // READ: each unit with phase R, check if srcs available
    for (const u of Object.values(units)) {
      if (!u || u.phase !== "R") continue;
      // Sources ready if no other instr is going to write them OR all writers have W'd
      const ready = u.src.every(s => {
        const w = regWriter[s];
        // Source is ready unless a *prior* instr writes it and hasn't done W
        if (w === undefined || w === u.id) return true;
        return sched[w].W !== null;
      });
      if (ready) {
        sched[u.id].R = cycle;
        u.phase = "E";
        u.execLeft = u.lat;
      }
    }
    // EXECUTE
    for (const u of Object.values(units)) {
      if (!u || u.phase !== "E") continue;
      if (sched[u.id].R === cycle) continue; // just entered
      u.execLeft--;
      if (u.execLeft <= 0) {
        sched[u.id].E = cycle;
        u.phase = "W";
      }
    }
    // WRITE: check WAR — any later instr reads dst and hasn't R'd?
    for (const [unitName, u] of Object.entries(units)) {
      if (!u || u.phase !== "W") continue;
      const warStall = PROG.some(other =>
        other.id !== u.id &&
        sched[other.id].R === null &&
        other.src.includes(u.dst) &&
        sched[other.id].I !== null && sched[other.id].I < sched[u.id].I
      );
      if (!warStall) {
        sched[u.id].W = cycle;
        if (regWriter[u.dst] === u.id) regWriter[u.dst] = undefined;
        units[unitName] = null;
      } else {
        stalls[u.id].war = true;
      }
    }
    cycle++;
    if (cycle > 40) break; // safety
  }
  return { sched, stalls, cycles: cycle };
}

const result = simulate();

export default function ScoreboardTrace() {
  const [step, setStep] = useState(result.cycles);
  const W = 580, H = 240;
  const CELL = 28, ROW = 24, LABEL_W = 130;
  const maxT = result.cycles + 1;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setStep(Math.max(0, step - 1))} style={btn(false)}>←</button>
        <button onClick={() => setStep(Math.min(maxT, step + 1))} style={btn(false)}>krok →</button>
        <button onClick={() => setStep(maxT)} style={btn(false)}>do konce</button>
        <button onClick={() => setStep(0)} style={btn(false)}>reset</button>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          celkem cyklů: {result.cycles}, t = {step}
        </span>
      </div>

      <svg viewBox={`0 0 ${LABEL_W + maxT * CELL + 20} ${PROG.length * ROW + 60}`}
        style={{ width: "100%", maxWidth: 720, fontFamily: "ui-sans-serif, system-ui" }}>
        <g fontSize="9" fill="var(--text-muted)" textAnchor="middle">
          {Array.from({ length: maxT }).map((_, c) => (
            <text key={c} x={LABEL_W + c * CELL + CELL / 2} y={12}>{c}</text>
          ))}
        </g>
        <line x1={LABEL_W + (step + 1) * CELL} y1={18} x2={LABEL_W + (step + 1) * CELL} y2={18 + PROG.length * ROW}
          stroke="var(--accent)" strokeWidth="1.5" />

        {PROG.map((inst, i) => {
          const s = result.sched[i];
          const st = result.stalls[i];
          return (
            <g key={i}>
              <text x={4} y={18 + i * ROW + ROW / 2 + 4} fontSize="10" fontFamily="ui-monospace, monospace" fill="var(--text)">
                {inst.txt}
              </text>
              {/* Phase markers */}
              {["I", "R", "E", "W"].map((ph, pi) => {
                const c = s[ph];
                if (c === null || c > step) return null;
                const color = ["#5b8def", "#7c5bef", "#ef5b8d", "#ef8d5b"][pi];
                return (
                  <g key={ph}>
                    <rect x={LABEL_W + c * CELL + 2} y={18 + i * ROW + 3} width={CELL - 4} height={ROW - 6}
                      fill={color} opacity={0.8} rx="2" />
                    <text x={LABEL_W + c * CELL + CELL / 2} y={18 + i * ROW + ROW / 2 + 4} textAnchor="middle"
                      fontSize="9.5" fill="white" fontWeight="700">{ph}</text>
                  </g>
                );
              })}
              {/* Stall indicators */}
              {(st.waw || st.war || st.struct) && (
                <text x={LABEL_W - 6} y={18 + i * ROW + ROW / 2 + 4} fontSize="9" textAnchor="end" fill="oklch(0.65 0.18 22)">
                  {[st.waw && "WAW", st.struct && "STR", st.war && "WAR"].filter(Boolean).join(" ")}
                </text>
              )}
            </g>
          );
        })}

        <g fontSize="9.5" fill="var(--text-muted)">
          <text x={4} y={PROG.length * ROW + 40}>fáze: I = issue, R = read operands, E = execute (latence), W = writeback</text>
          <text x={4} y={PROG.length * ROW + 54} fill="var(--text-faint)">
            STR = strukturální stall (FU obsazena), WAW = target zápisu obsazen, WAR = writeback čeká na čtenáře
          </text>
        </g>
      </svg>
    </div>
  );
}

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 11, padding: "3px 9px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "white" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer",
  };
}
