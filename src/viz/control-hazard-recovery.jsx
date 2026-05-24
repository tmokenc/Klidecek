// control-hazard-recovery — visualise branch flushing in a 5-stage pipeline:
// fetch-behind-branch keeps filling, taken branch flushes wrong-path insts.
import { useEffect, useState } from "react";

const W = 580, H = 240;
const STAGES = ["IF", "ID", "EX", "MA", "WB"];
const COLORS = ["#5b8def", "#7c5bef", "#ef5b8d", "#ef8d5b", "#5befef"];

// Branch resolves at EX. If predict_not_taken and branch is taken,
// instructions in IF and ID must be flushed (2 bubbles).
const PROG = [
  { txt: "add r1, r2, r3", branch: false },
  { txt: "beq r1, r0, L1", branch: true },
  { txt: "sub r4, r5, r6", branch: false, wrongPath: true },
  { txt: "or  r7, r4, r8", branch: false, wrongPath: true },
  { txt: "L1: xor r9,r1,r10", branch: false, target: true },
  { txt: "and r11,r9,r12", branch: false, target: true },
];

const STRATS = {
  predNotTaken: { label: "predict-not-taken", penaltyTaken: 2 },
  predTaken:    { label: "predict-taken (BTB)", penaltyTaken: 0, penaltyNot: 2 },
  delayed:      { label: "delayed slot (1)", penaltyTaken: 1 },
  stall:        { label: "stall do EX (3)", penaltyTaken: 2 },
};

function schedule(strat, taken) {
  const out = [];
  let cycle = 0;
  // i=0
  out.push({ start: 0, stages: STAGES, kind: "ok" });
  // i=1 branch
  out.push({ start: 1, stages: STAGES, kind: "branch" });
  // wrong-path or stall depending on strategy
  if (strat === "stall") {
    // bubbles for 2 cycles after branch fetch
    out.push({ start: 2, stages: ["—","—","—","—","—"], kind: "bubble" });
    out.push({ start: 3, stages: ["—","—","—","—","—"], kind: "bubble" });
    out.push({ start: taken ? 4 : 4, stages: STAGES, kind: taken ? "target" : "fall" });
    out.push({ start: 5, stages: STAGES, kind: taken ? "target" : "fall" });
  } else if (strat === "delayed") {
    // delay slot: i=2 always executes (1 slot only)
    out.push({ start: 2, stages: STAGES, kind: "delay-slot" });
    out.push({ start: 3, stages: STAGES, kind: taken ? "target" : "fall" });
    out.push({ start: 4, stages: STAGES, kind: taken ? "target" : "fall" });
  } else if (strat === "predNotTaken") {
    if (taken) {
      // i=2, i=3 fetched on wrong path, flushed after branch resolves at EX (cycle 3)
      out.push({ start: 2, stages: STAGES.slice(0, 2).concat(["⨯","⨯","⨯"]), kind: "flush" });
      out.push({ start: 3, stages: STAGES.slice(0, 1).concat(["⨯","⨯","⨯","⨯"]), kind: "flush" });
      out.push({ start: 4, stages: STAGES, kind: "target" });
      out.push({ start: 5, stages: STAGES, kind: "target" });
    } else {
      out.push({ start: 2, stages: STAGES, kind: "fall" });
      out.push({ start: 3, stages: STAGES, kind: "fall" });
    }
  } else if (strat === "predTaken") {
    if (taken) {
      out.push({ start: 2, stages: STAGES, kind: "target" });
      out.push({ start: 3, stages: STAGES, kind: "target" });
    } else {
      // wrong: target fetched, flush
      out.push({ start: 2, stages: STAGES.slice(0, 2).concat(["⨯","⨯","⨯"]), kind: "flush" });
      out.push({ start: 3, stages: STAGES.slice(0, 1).concat(["⨯","⨯","⨯","⨯"]), kind: "flush" });
      out.push({ start: 4, stages: STAGES, kind: "fall" });
      out.push({ start: 5, stages: STAGES, kind: "fall" });
    }
  }
  return out;
}

const CELL = 30, ROW = 24, LABEL_W = 130;

export default function ControlHazardRecovery() {
  const [strat, setStrat] = useState("predNotTaken");
  const [taken, setTaken] = useState(true);
  const [t, setT] = useState(0);
  const [auto, setAuto] = useState(false);

  const sched = schedule(strat, taken);
  const labels = strat === "delayed"
    ? ["add", "beq", "(delay) sub", "L1: xor", "and"]
    : ["add", "beq", "sub (wrong)", "or (wrong)", "L1: xor", "and"].slice(0, sched.length);
  const maxT = Math.max(...sched.map(s => s.start + s.stages.filter(x => x !== "—").length)) + 1;

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setT(x => (x >= maxT ? 0 : x + 1)), 700);
    return () => clearInterval(id);
  }, [auto, maxT]);

  const flushed = sched.reduce((s, x) => s + (x.kind === "flush" || x.kind === "bubble" ? 1 : 0), 0);
  const cycles = maxT;

  const Wsvg = LABEL_W + maxT * CELL + 10;
  const Hsvg = sched.length * ROW + 50;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
        <select value={strat} onChange={e => { setStrat(e.target.value); setT(0); }} style={ctrl}>
          {Object.entries(STRATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <label style={{ display: "flex", gap: 4, alignItems: "center", color: "var(--text)", fontSize: 11 }}>
          <input type="checkbox" checked={taken} onChange={e => { setTaken(e.target.checked); setT(0); }} /> branch TAKEN
        </label>
        <button onClick={() => setT(Math.max(0, t - 1))} style={btn(false)}>←</button>
        <button onClick={() => setT(Math.min(maxT, t + 1))} style={btn(false)}>→</button>
        <button onClick={() => setAuto(a => !a)} style={btn(auto)}>{auto ? "■" : "▶"}</button>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          flushed bubbles: {flushed} | celkem cyklů: {cycles}
        </span>
      </div>

      <svg viewBox={`0 0 ${Wsvg} ${Hsvg}`} style={{ width: "100%", maxWidth: 720, fontFamily: "ui-sans-serif, system-ui" }}>
        <g fontSize="9" fill="var(--text-muted)" textAnchor="middle">
          {Array.from({ length: maxT }).map((_, c) => (
            <text key={c} x={LABEL_W + c * CELL + CELL / 2} y={12}>t{c}</text>
          ))}
        </g>
        <line x1={LABEL_W + (t + 1) * CELL} y1={18} x2={LABEL_W + (t + 1) * CELL} y2={18 + sched.length * ROW}
          stroke="var(--accent)" strokeWidth="1.5" />
        {sched.map((s, i) => (
          <g key={i}>
            <text x={5} y={18 + i * ROW + ROW / 2 + 4} fill={s.kind === "flush" ? "oklch(0.6 0.2 22)" : "var(--text)"}
              fontFamily="ui-monospace, monospace" fontSize="10">{labels[i]}</text>
            {s.stages.map((stg, si) => {
              const c = s.start + si;
              if (c > t) return null;
              const isFlush = stg === "⨯";
              const isBubble = stg === "—";
              return (
                <g key={si}>
                  <rect x={LABEL_W + c * CELL + 2} y={18 + i * ROW + 3} width={CELL - 4} height={ROW - 6}
                    fill={isFlush ? "oklch(0.6 0.2 22)" : isBubble ? "var(--bg-inset)" : COLORS[si]}
                    opacity={isFlush ? 0.6 : isBubble ? 1 : 0.7}
                    stroke={isBubble ? "var(--text-faint)" : "none"} strokeDasharray={isBubble ? "2 2" : ""}
                    rx="2" />
                  <text x={LABEL_W + c * CELL + CELL / 2} y={18 + i * ROW + ROW / 2 + 4} textAnchor="middle"
                    fontSize="9.5" fill={isBubble ? "var(--text-faint)" : "white"} fontWeight="600">{stg}</text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Větvení se rozhodne v EX (cyklus 3). Předtím fetchované instrukce v IF/ID jsou na "wrong path" — buď je flushneme (×), čekáme (bubble), nebo využijeme delay slot.
      </div>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 3, fontSize: 11 };
function btn(active) {
  return { ...ctrl, background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", cursor: "pointer", padding: "3px 8px" };
}
