// amat-cache-calculator — AMAT = hit_L1 + miss_L1 × (lat_L2 + miss_L2 ×
// (lat_L3 + miss_L3 × lat_DRAM)). Sliders + breakdown bar.
import { useState } from "react";

const PRESETS = {
  custom: { name: "vlastní" },
  skylake: { name: "Intel Skylake", hL1: 0.95, latL1: 4, hL2: 0.85, latL2: 12, hL3: 0.7, latL3: 38, latDram: 250 },
  zen4:    { name: "AMD Zen 4",     hL1: 0.95, latL1: 4, hL2: 0.85, latL2: 14, hL3: 0.65, latL3: 50, latDram: 220 },
  m1:      { name: "Apple M1",      hL1: 0.96, latL1: 3, hL2: 0.9,  latL2: 14, hL3: 0.6,  latL3: 40, latDram: 110 },
};

export default function AmatCacheCalculator() {
  const [preset, setPreset] = useState("skylake");
  const [hL1, setHL1] = useState(0.95);
  const [latL1, setLatL1] = useState(4);
  const [hL2, setHL2] = useState(0.85);
  const [latL2, setLatL2] = useState(12);
  const [hL3, setHL3] = useState(0.7);
  const [latL3, setLatL3] = useState(38);
  const [latDram, setLatDram] = useState(250);

  function applyPreset(k) {
    setPreset(k);
    if (k === "custom") return;
    const p = PRESETS[k];
    setHL1(p.hL1); setLatL1(p.latL1); setHL2(p.hL2); setLatL2(p.latL2);
    setHL3(p.hL3); setLatL3(p.latL3); setLatDram(p.latDram);
  }

  const mL1 = 1 - hL1, mL2 = 1 - hL2, mL3 = 1 - hL3;
  const amat = latL1 + mL1 * (latL2 + mL2 * (latL3 + mL3 * latDram));

  // contributions
  const cL1 = latL1;
  const cL2 = mL1 * latL2;
  const cL3 = mL1 * mL2 * latL3;
  const cDram = mL1 * mL2 * mL3 * latDram;

  const W = 580, H = 320;
  const total = cL1 + cL2 + cL3 + cDram;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <select value={preset} onChange={e => applyPreset(e.target.value)} style={ctrl}>
          {Object.entries(PRESETS).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
        </select>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          AMAT = <b>{amat.toFixed(2)}</b> cyklů
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* sliders */}
        {[
          { label: "L1 hit rate", val: hL1, set: v => { setHL1(v); setPreset("custom"); }, min: 0.5, max: 1, step: 0.01, fmt: v => (v * 100).toFixed(0) + "%" },
          { label: "L1 latency",  val: latL1, set: v => { setLatL1(v); setPreset("custom"); }, min: 1, max: 10, step: 1, fmt: v => v + " c" },
          { label: "L2 hit rate", val: hL2, set: v => { setHL2(v); setPreset("custom"); }, min: 0.3, max: 1, step: 0.01, fmt: v => (v * 100).toFixed(0) + "%" },
          { label: "L2 latency",  val: latL2, set: v => { setLatL2(v); setPreset("custom"); }, min: 5, max: 30, step: 1, fmt: v => v + " c" },
          { label: "L3 hit rate", val: hL3, set: v => { setHL3(v); setPreset("custom"); }, min: 0.2, max: 1, step: 0.01, fmt: v => (v * 100).toFixed(0) + "%" },
          { label: "L3 latency",  val: latL3, set: v => { setLatL3(v); setPreset("custom"); }, min: 15, max: 80, step: 1, fmt: v => v + " c" },
          { label: "DRAM latency", val: latDram, set: v => { setLatDram(v); setPreset("custom"); }, min: 80, max: 400, step: 5, fmt: v => v + " c" },
        ].map((s, i) => (
          <foreignObject key={i} x={20 + (i % 4) * 140} y={10 + Math.floor(i / 4) * 50} width={130} height={48}>
            <div style={{ fontSize: 10, color: "var(--text)" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{s.label}</span><span style={{ color: "var(--text-muted)" }}>{s.fmt(s.val)}</span>
              </div>
              <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={e => s.set(+e.target.value)} style={{ width: 130 }} />
            </div>
          </foreignObject>
        ))}

        {/* breakdown bar */}
        <text x={20} y={140} fontSize="11" fill="var(--text)" fontWeight="600">rozklad AMAT podle úrovně:</text>
        {[
          { label: "L1", val: cL1, color: "oklch(0.7 0.15 245)" },
          { label: "L2", val: cL2, color: "oklch(0.7 0.15 145)" },
          { label: "L3", val: cL3, color: "oklch(0.7 0.15 60)" },
          { label: "DRAM", val: cDram, color: "oklch(0.65 0.18 22)" },
        ].reduce((acc, lvl) => {
          const w = (lvl.val / total) * 500;
          acc.elems.push(
            <g key={lvl.label}>
              <rect x={20 + acc.x} y={150} width={w} height={32} fill={lvl.color} stroke="white" strokeWidth="1" />
              {w > 30 && (
                <text x={20 + acc.x + w / 2} y={170} textAnchor="middle" fontSize="10" fill="white" fontWeight="600">
                  {lvl.label} {lvl.val.toFixed(1)}
                </text>
              )}
            </g>
          );
          acc.x += w;
          return acc;
        }, { x: 0, elems: [] }).elems}

        {/* per-level breakdown text */}
        <g fontSize="10" fill="var(--text)" fontFamily="ui-monospace, monospace">
          <text x={20} y={210}>L1 contribution: {cL1.toFixed(2)} c ({(cL1 / amat * 100).toFixed(0)} %)</text>
          <text x={20} y={226}>L2 contribution: {cL2.toFixed(2)} c ({(cL2 / amat * 100).toFixed(0)} %)</text>
          <text x={20} y={242}>L3 contribution: {cL3.toFixed(2)} c ({(cL3 / amat * 100).toFixed(0)} %)</text>
          <text x={20} y={258}>DRAM: {cDram.toFixed(2)} c ({(cDram / amat * 100).toFixed(0)} %)</text>
        </g>

        {/* Formula */}
        <text x={300} y={210} fontSize="10" fill="var(--text-muted)" fontFamily="ui-monospace, monospace">AMAT formula:</text>
        <text x={300} y={228} fontSize="9.5" fill="var(--text)" fontFamily="ui-monospace, monospace">
          AMAT = latL1
        </text>
        <text x={300} y={242} fontSize="9.5" fill="var(--text)" fontFamily="ui-monospace, monospace">
          + missL1 × (latL2 + missL2 × (latL3 + missL3 × latDram))
        </text>
        <text x={300} y={270} fontSize="10.5" fill="var(--accent)" fontFamily="ui-monospace, monospace" fontWeight="600">
          = {amat.toFixed(2)} cyklů
        </text>

        <text x={20} y={H - 8} fontSize="9.5" fill="var(--text-faint)">
          Zlepšení DRAM latence pomáhá málo (násobeno všemi miss rates). Mnohem účinnější: zvýšit L1/L2 hit rate.
        </text>
      </svg>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 6px", borderRadius: 3, fontSize: 11 };
