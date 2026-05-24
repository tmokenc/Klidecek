// dvfs-pstate-cstate-timeline — workload trace, OS picks P/C state, voltage
// + frequency curve, energy integrated. Toggle race-to-idle vs run-slow.
import { useState } from "react";

// Workload: pulses
const WORKLOAD = [
  { start: 0, end: 4, busy: false },
  { start: 4, end: 14, busy: true },   // burst
  { start: 14, end: 20, busy: false },
  { start: 20, end: 50, busy: true, intensity: 0.6 }, // sustained
  { start: 50, end: 64, busy: false },
];

const STRATS = {
  race: { label: "race-to-idle (max f, pak C6)", busyF: 4500, busyV: 1.35, idleF: 0, idleV: 0, idleP: 0.5 },
  slow: { label: "run-slow (nižší f, mělčí idle)", busyF: 2500, busyV: 0.9, idleF: 0, idleV: 0.6, idleP: 3 },
  balanced: { label: "balanced", busyF: 3500, busyV: 1.1, idleF: 0, idleV: 0.4, idleP: 1.5 },
};

function powerOfF(f, v) {
  if (f === 0 && v === 0) return 0.3; // C6 leakage
  // dynamic ~ v^2 * f
  return 0.001 * v * v * f + (v > 0 ? 2 : 0);
}

export default function DvfsPstateCstateTimeline() {
  const [stratKey, setStratKey] = useState("race");
  const s = STRATS[stratKey];

  const W = 580, H = 320;
  const padX = 60;
  const chartW = W - padX - 20;
  const tMax = 64;
  const xOf = t => padX + (t / tMax) * chartW;

  // Build per-ms power trace
  const samples = [];
  let energy = 0;
  for (let t = 0; t < tMax; t++) {
    const wl = WORKLOAD.find(w => t >= w.start && t < w.end);
    const busy = wl?.busy ?? false;
    const f = busy ? s.busyF : s.idleF;
    const v = busy ? s.busyV : s.idleV;
    const p = busy ? powerOfF(f, v) : s.idleP;
    energy += p;
    samples.push({ t, busy, f, v, p });
  }
  const maxP = Math.max(...samples.map(x => x.p));
  const maxF = 5000;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <select value={stratKey} onChange={e => setStratKey(e.target.value)} style={ctrl}>
          {Object.entries(STRATS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          celková energie ≈ <b style={{ color: stratKey === "race" ? "oklch(0.65 0.16 145)" : "var(--accent)" }}>{energy.toFixed(0)}</b> J
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Workload bar */}
        <text x={6} y={20} fontSize="10" fill="var(--text)" fontWeight="600">workload:</text>
        {WORKLOAD.map((w, i) => (
          <rect key={i} x={xOf(w.start)} y={26} width={xOf(w.end) - xOf(w.start)} height={14}
            fill={w.busy ? "oklch(0.7 0.15 60 / 0.5)" : "var(--bg-inset)"} stroke="var(--line)" />
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

        <text x={padX + chartW + 4} y={H - 16} fontSize="9" fill="var(--text-faint)">∫P·dt = {energy.toFixed(0)} J</text>
        <text x={20} y={H - 5} fontSize="9.5" fill="var(--text-faint)">
          Race-to-idle: vysoké P krátce, pak C6 (0.3 W). Vyplatí se pro CMOS s nízkým leakage. Run-slow: nižší V², ale delší.
        </text>
      </svg>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 6px", borderRadius: 3, fontSize: 11 };
