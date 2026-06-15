// dvfs-pstate-cstate-timeline — workload trace, OS picks P/C state, voltage
// + frequency curve, energy integrated. Toggle race-to-idle vs run-slow.
import { useState } from "react";

// Workload as ARRIVING tasks: fixed work (in reference-ms @ refF). A higher clock
// finishes the same work sooner, so the busy window shrinks and idle grows — this
// is what lets race-to-idle drop into deep C6 for longer.
const refF = 3500;
const TASKS = [
  { arrive: 4, work: 10 },  // burst
  { arrive: 20, work: 30 }, // sustained
];

const STRATS = {
  race: { label: "race-to-idle (max f, pak C6)", busyF: 4500, busyV: 1.35, idleF: 0, idleV: 0, idleP: 0.3 },
  slow: { label: "run-slow (nižší f, mělčí idle)", busyF: 2500, busyV: 0.9, idleF: 0, idleV: 0.6, idleP: 3 },
  balanced: { label: "balanced", busyF: 3500, busyV: 1.1, idleF: 0, idleV: 0.4, idleP: 1.5 },
};

// Always-on platform/uncore/static power while active (W). It makes run-slow's
// long active time costly, so race-to-idle wins despite its higher V².
const ACTIVE_FLOOR = 10;
function powerOfF(f, v) {
  if (f === 0 && v === 0) return 0.3; // C6 leakage (deep sleep)
  // dynamic ~ v^2 * f, plus the always-on platform floor while active
  return 0.001 * v * v * f + (v > 0 ? ACTIVE_FLOOR : 0);
}

export default function DvfsPstateCstateTimeline() {
  const [stratKey, setStratKey] = useState("race");
  const s = STRATS[stratKey];

  const W = 580, H = 340;
  const padX = 60;
  const chartW = W - padX - 20;
  const tMax = 64;
  const xOf = t => padX + (t / tMax) * chartW;

  // Busy intervals: each task takes work·(refF/busyF) ms, back-to-back after it
  // arrives. A faster clock → shorter busy window → more time in deep C6 idle.
  const intervals = [];
  let prevEnd = 0;
  for (const tk of TASKS) {
    const start = Math.max(tk.arrive, prevEnd);
    const end = Math.min(tMax, start + tk.work * (refF / s.busyF));
    intervals.push([start, end]);
    prevEnd = end;
  }
  const isBusy = t => intervals.some(([a, b]) => t >= a && t < b);

  // Build per-ms power trace
  const samples = [];
  let energy = 0;
  for (let t = 0; t < tMax; t++) {
    const busy = isBusy(t);
    const f = busy ? s.busyF : s.idleF;
    const v = busy ? s.busyV : s.idleV;
    const p = busy ? powerOfF(s.busyF, s.busyV) : s.idleP;
    energy += p;
    samples.push({ t, busy, f, v, p });
  }
  const maxP = Math.max(...samples.map(x => x.p));
  const maxF = 5000;

  return (
    <div style={{ width: "100%" }}>
      <div className="viz-controls" style={{ marginBottom: 6 }}>
        <select className="viz-select" value={stratKey} onChange={e => setStratKey(e.target.value)}>
          {Object.entries(STRATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span className="viz-readout">
          celková energie ≈ <b style={{ color: stratKey === "race" ? "oklch(0.65 0.16 145)" : "var(--accent)" }}>{energy.toFixed(0)}</b> J
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Workload bar */}
        <text x={6} y={20} fontSize="10" fill="var(--text)" fontWeight="600">workload:</text>
        <rect x={xOf(0)} y={26} width={xOf(tMax) - xOf(0)} height={14} fill="var(--bg-inset)" stroke="var(--line)" />
        {intervals.map(([a, b], i) => (
          <rect key={i} x={xOf(a)} y={26} width={xOf(b) - xOf(a)} height={14} fill="oklch(0.7 0.15 60 / 0.5)" stroke="var(--line)" />
        ))}

        {/* Frequency curve */}
        <text x={6} y={62} fontSize="10" fill="var(--text)" fontWeight="600">f (MHz)</text>
        <line x1={padX} y1={70} x2={padX} y2={140} stroke="var(--line)" />
        <line x1={padX} y1={140} x2={padX + chartW} y2={140} stroke="var(--line)" />
        <text x={padX - 4} y={72} fontSize="8" fill="var(--text-faint)" textAnchor="end">{maxF}</text>
        <text x={padX - 4} y={142} fontSize="8" fill="var(--text-faint)" textAnchor="end">0</text>
        <path d={samples.map((x, i) => `${i === 0 ? "M" : "L"} ${xOf(x.t)} ${140 - (x.f / maxF) * 70}`).join(" ")}
          fill="oklch(0.7 0.15 245 / 0.2)" stroke="oklch(0.7 0.15 245)" strokeWidth="1.5" />

        {/* Voltage */}
        <text x={6} y={162} fontSize="10" fill="var(--text)" fontWeight="600">V</text>
        <line x1={padX} y1={170} x2={padX} y2={220} stroke="var(--line)" />
        <line x1={padX} y1={220} x2={padX + chartW} y2={220} stroke="var(--line)" />
        <path d={samples.map((x, i) => `${i === 0 ? "M" : "L"} ${xOf(x.t)} ${220 - (x.v / 1.4) * 50}`).join(" ")}
          fill="oklch(0.7 0.15 145 / 0.2)" stroke="oklch(0.7 0.15 145)" strokeWidth="1.5" />

        {/* Power */}
        <text x={6} y={242} fontSize="10" fill="var(--text)" fontWeight="600">P (W)</text>
        <line x1={padX} y1={250} x2={padX} y2={300} stroke="var(--line)" />
        <line x1={padX} y1={300} x2={padX + chartW} y2={300} stroke="var(--line)" />
        <path d={samples.map((x, i) => `${i === 0 ? "M" : "L"} ${xOf(x.t)} ${300 - (x.p / maxP) * 50}`).join(" ")}
          fill="oklch(0.65 0.18 22 / 0.2)" stroke="oklch(0.65 0.18 22)" strokeWidth="1.5" />

        <text x={padX + chartW} y={290} fontSize="9" fill="var(--text-faint)" textAnchor="end">∫P·dt = {energy.toFixed(0)} J</text>
        <text x={20} y={318} fontSize="9.5" fill="var(--text-faint)">
          Race-to-idle: vysoké P krátce, pak C6 (0.3 W). Vyplatí se pro CMOS s nízkým leakage.
        </text>
        <text x={20} y={332} fontSize="9.5" fill="var(--text-faint)">
          Run-slow: nižší V², ale delší doba běhu.
        </text>
      </svg>
    </div>
  );
}
