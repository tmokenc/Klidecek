// omp-scheduling-comparator — 4 threads, 32 iterations with skewed work.
// Gantt visualizing static / static,chunk / dynamic / guided.
import { useState } from "react";

const N_ITERS = 32;
const N_THREADS = 4;

const WORKLOADS = {
  triangle: { label: "triangulární (i⋅2 cyklů)", w: i => 2 + i },
  skewed: { label: "skewed (random)", w: (i, seed) => {
    let r = (seed + i * 2654435761) >>> 0;
    return 1 + ((r >>> 8) & 0xF);
  }},
  uniform: { label: "uniform", w: () => 8 },
};

const SCHEDS = ["static", "static,4", "dynamic,4", "guided,4"];

function distribute(sched, iters, work) {
  // returns array of {thread, iter, start, end} blocks
  if (sched === "static") {
    const blocks = [];
    const chunk = Math.ceil(iters.length / N_THREADS);
    const finishes = new Array(N_THREADS).fill(0);
    for (let t = 0; t < N_THREADS; t++) {
      let cursor = 0;
      for (let k = 0; k < chunk && t * chunk + k < iters.length; k++) {
        const i = t * chunk + k;
        const w = work[i];
        blocks.push({ thread: t, iter: i, start: cursor, end: cursor + w });
        cursor += w;
      }
      finishes[t] = cursor;
    }
    return blocks;
  } else if (sched === "static,4") {
    const blocks = [];
    const chunk = 4;
    const finishes = new Array(N_THREADS).fill(0);
    let it = 0;
    while (it < iters.length) {
      const t = (it / chunk) % N_THREADS;
      for (let k = 0; k < chunk && it < iters.length; k++, it++) {
        const w = work[it];
        blocks.push({ thread: t, iter: it, start: finishes[t], end: finishes[t] + w });
        finishes[t] += w;
      }
    }
    return blocks;
  } else if (sched === "dynamic,4") {
    const blocks = [];
    const chunk = 4;
    const finishes = new Array(N_THREADS).fill(0);
    let it = 0;
    while (it < iters.length) {
      // pick least busy thread
      const t = finishes.indexOf(Math.min(...finishes));
      for (let k = 0; k < chunk && it < iters.length; k++, it++) {
        const w = work[it];
        blocks.push({ thread: t, iter: it, start: finishes[t], end: finishes[t] + w });
        finishes[t] += w;
      }
    }
    return blocks;
  } else if (sched === "guided,4") {
    const blocks = [];
    const finishes = new Array(N_THREADS).fill(0);
    let it = 0;
    while (it < iters.length) {
      const remaining = iters.length - it;
      const chunk = Math.max(4, Math.floor(remaining / (N_THREADS * 2)));
      const t = finishes.indexOf(Math.min(...finishes));
      for (let k = 0; k < chunk && it < iters.length; k++, it++) {
        const w = work[it];
        blocks.push({ thread: t, iter: it, start: finishes[t], end: finishes[t] + w });
        finishes[t] += w;
      }
    }
    return blocks;
  }
  return [];
}

export default function OmpSchedulingComparator() {
  const [wlKey, setWlKey] = useState("skewed");
  const wl = WORKLOADS[wlKey];
  const work = Array.from({ length: N_ITERS }, (_, i) => wl.w(i, 31));
  const iters = Array.from({ length: N_ITERS }, (_, i) => i);

  const results = SCHEDS.map(s => ({ sched: s, blocks: distribute(s, iters, work) }));
  const maxEnd = Math.max(...results.flatMap(r => r.blocks.map(b => b.end)));

  const W = 580, H = 320;
  const padX = 80, padY = 26;
  const chartW = W - padX - 16;
  const rowH = (H - padY - 30) / SCHEDS.length;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <select value={wlKey} onChange={e => setWlKey(e.target.value)} style={ctrl}>
          {Object.entries(WORKLOADS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>
          N = {N_ITERS} iterací, {N_THREADS} vláken
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {results.map((r, ri) => {
          const y0 = padY + ri * rowH;
          const finishes = new Array(N_THREADS).fill(0);
          r.blocks.forEach(b => { finishes[b.thread] = Math.max(finishes[b.thread], b.end); });
          const lastFinish = Math.max(...finishes);
          const idle = finishes.map(f => lastFinish - f);
          const balance = 1 - (Math.max(...idle) / lastFinish);
          return (
            <g key={r.sched}>
              <text x={6} y={y0 + 14} fontSize="11" fill="var(--text)" fontWeight="600">{r.sched}</text>
              <text x={6} y={y0 + 30} fontSize="9" fill="var(--text-muted)">{(balance * 100).toFixed(0)}% bal</text>
              {/* Thread rows */}
              {Array.from({ length: N_THREADS }).map((_, t) => (
                <line key={t} x1={padX} y1={y0 + 8 + t * 14} x2={padX + chartW} y2={y0 + 8 + t * 14} stroke="var(--line)" strokeWidth="0.4" />
              ))}
              {r.blocks.map((b, bi) => {
                const x = padX + (b.start / maxEnd) * chartW;
                const w = ((b.end - b.start) / maxEnd) * chartW;
                const colors = ["oklch(0.7 0.15 245)", "oklch(0.7 0.15 145)", "oklch(0.7 0.15 60)", "oklch(0.65 0.18 22)"];
                return (
                  <rect key={bi} x={x} y={y0 + 4 + b.thread * 14} width={Math.max(1, w - 0.5)} height={9}
                    fill={colors[b.thread]} opacity={0.7} rx="1" />
                );
              })}
              {/* Idle markers */}
              {finishes.map((f, t) => {
                const x = padX + (f / maxEnd) * chartW;
                const w = ((lastFinish - f) / maxEnd) * chartW;
                if (w < 1) return null;
                return (
                  <rect key={"i" + t} x={x} y={y0 + 4 + t * 14} width={w} height={9}
                    fill="oklch(0.65 0.18 22 / 0.2)" stroke="oklch(0.65 0.18 22)" strokeWidth="0.4" strokeDasharray="2 2" />
                );
              })}
            </g>
          );
        })}

        <text x={20} y={H - 8} fontSize="9.5" fill="var(--text-faint)">
          Idle (přerušovaně červené) = vlákno čeká na poslední pracující u barrier. Dynamic/guided minimalizují idle.
        </text>
      </svg>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 6px", borderRadius: 3, fontSize: 11 };
