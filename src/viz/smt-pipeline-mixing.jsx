// smt-pipeline-mixing — two thread streams, superscalar issue 4-wide;
// SMT off vs on; toggle CPU-bound + mem-bound mix.
import { useState } from "react";

const WIDTH = 4; // issue width
const CYCLES = 16;

// Generate a thread's instruction stream
function genStream(kind, seed) {
  let r = seed;
  const stream = [];
  for (let c = 0; c < CYCLES; c++) {
    const cyc = [];
    for (let s = 0; s < WIDTH; s++) {
      r = (r * 1664525 + 1013904223) >>> 0;
      const rand = (r >>> 8) & 0xFF;
      if (kind === "cpu") {
        // mostly compute, occasional stall
        if (rand < 25) cyc.push("stall");
        else cyc.push("compute");
      } else if (kind === "mem") {
        // many stalls
        if (rand < 130) cyc.push("stall");
        else cyc.push("compute");
      }
    }
    stream.push(cyc);
  }
  return stream;
}

const MIXES = {
  cpu_cpu: { label: "CPU + CPU (degrade)", t0: "cpu", t1: "cpu" },
  cpu_mem: { label: "CPU + Mem (sweet spot)", t0: "cpu", t1: "mem" },
  mem_mem: { label: "Mem + Mem (žádný benefit)", t0: "mem", t1: "mem" },
};

function simulateNoSMT(stream) {
  // thread alone occupies all WIDTH slots
  const grid = stream.map(c => c.slice());
  const utilized = grid.flat().filter(s => s === "compute").length;
  return { grid, utilized, total: grid.length * WIDTH };
}

function simulateSMT(s0, s1) {
  // each cycle, prefer compute from either thread; share width
  const grid = [];
  for (let c = 0; c < CYCLES; c++) {
    const row = [];
    let i0 = 0, i1 = 0;
    // alternate, but skip stalls
    while (row.length < WIDTH) {
      // pick non-stall ops first; if t0 has more compute, take from t0
      const c0 = s0[c][i0];
      const c1 = s1[c][i1];
      if (c0 === "compute" && i0 < WIDTH) { row.push({ kind: "compute", thread: 0 }); i0++; }
      else if (c1 === "compute" && i1 < WIDTH) { row.push({ kind: "compute", thread: 1 }); i1++; }
      else if (i0 < WIDTH) { row.push({ kind: "stall", thread: 0 }); i0++; }
      else if (i1 < WIDTH) { row.push({ kind: "stall", thread: 1 }); i1++; }
      else break;
    }
    grid.push(row);
  }
  const utilized = grid.flat().filter(s => s.kind === "compute").length;
  return { grid, utilized, total: grid.length * WIDTH };
}

export default function SmtPipelineMixing() {
  const [mixKey, setMixKey] = useState("cpu_mem");
  const mix = MIXES[mixKey];
  const s0 = genStream(mix.t0, 13);
  const s1 = genStream(mix.t1, 71);
  const single = simulateNoSMT(s0);
  const smt = simulateSMT(s0, s1);
  const speedup = (smt.utilized / single.utilized);

  const W = 580, H = 290;
  const cellW = (W - 100) / CYCLES - 1;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <select value={mixKey} onChange={e => setMixKey(e.target.value)} style={ctrl}>
          {Object.entries(MIXES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          1 thread util: {(single.utilized / single.total * 100).toFixed(0)} % →
          SMT util: {(smt.utilized / smt.total * 100).toFixed(0)} %, speedup ≈ {speedup.toFixed(2)}×
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        <text x={6} y={20} fontSize="11" fill="var(--text)" fontWeight="600">single thread (žádný SMT)</text>
        {single.grid.map((row, c) => row.map((slot, s) => (
          <g key={`s${c}-${s}`}>
            <rect x={100 + c * (cellW + 1)} y={26 + s * 14} width={cellW} height={12}
              fill={slot === "compute" ? "oklch(0.7 0.15 245 / 0.7)" : "var(--bg-inset)"}
              stroke={slot === "stall" ? "var(--text-faint)" : "none"} strokeDasharray={slot === "stall" ? "1 1" : ""} rx="1" />
          </g>
        )))}

        <text x={6} y={108} fontSize="11" fill="var(--text)" fontWeight="600">SMT (2 thready)</text>
        {smt.grid.map((row, c) => row.map((slot, s) => (
          <g key={`m${c}-${s}`}>
            <rect x={100 + c * (cellW + 1)} y={114 + s * 14} width={cellW} height={12}
              fill={slot.kind === "compute" ?
                  (slot.thread === 0 ? "oklch(0.7 0.15 245 / 0.7)" : "oklch(0.7 0.15 145 / 0.7)") :
                  "var(--bg-inset)"}
              stroke={slot.kind === "stall" ? "var(--text-faint)" : "none"} strokeDasharray={slot.kind === "stall" ? "1 1" : ""} rx="1" />
          </g>
        )))}

        <g fontSize="10" fill="var(--text)">
          <text x={6} y={196}>thread 0 ({mix.t0})</text>
          <rect x={100} y={188} width={20} height={10} fill="oklch(0.7 0.15 245 / 0.7)" />
          <text x={140} y={196}>thread 1 ({mix.t1})</text>
          <rect x={240} y={188} width={20} height={10} fill="oklch(0.7 0.15 145 / 0.7)" />
        </g>

        {/* utility bars */}
        <text x={6} y={222} fontSize="10.5" fill="var(--text)" fontWeight="600">funkční jednotky využití:</text>
        <rect x={100} y={228} width={420} height={14} fill="var(--bg-inset)" stroke="var(--line)" rx="2" />
        <rect x={100} y={228} width={420 * (single.utilized / single.total)} height={14} fill="oklch(0.7 0.15 245 / 0.7)" />
        <text x={310} y={239} textAnchor="middle" fontSize="9" fill="white">no-SMT {(single.utilized / single.total * 100).toFixed(0)} %</text>

        <rect x={100} y={246} width={420} height={14} fill="var(--bg-inset)" stroke="var(--line)" rx="2" />
        <rect x={100} y={246} width={420 * (smt.utilized / smt.total)} height={14} fill="oklch(0.65 0.16 145 / 0.8)" />
        <text x={310} y={257} textAnchor="middle" fontSize="9" fill="white">SMT {(smt.utilized / smt.total * 100).toFixed(0)} %</text>

        <text x={6} y={H - 18} fontSize="9.5" fill="var(--text-faint)">
          CPU + Mem mix = mem-thread plní bubliny z compute thread → big win.
        </text>
        <text x={6} y={H - 6} fontSize="9.5" fill="var(--text-faint)">
          CPU + CPU = wallový boj o stejné FU → degrade.
        </text>
      </svg>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 6px", borderRadius: 3, fontSize: 11 };
