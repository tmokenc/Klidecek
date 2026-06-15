// superpipelining-depth — explore performance vs pipeline depth with branch
// misprediction cost; reveals the performance peak and Pentium 4 cautionary point.
import { useState } from "react";

const W = 540, H = 280;

function compute(depth, mispred, branchFreq) {
  const idealCPI = 1;
  const stallsPerBranch = depth - 1;
  const effectiveCPI = idealCPI + branchFreq * mispred * stallsPerBranch;
  const tdRatio = 0.2; // podíl latch/režie na stupeň (t_d/t_1) — Hartstein–Puzak
  const freqGain = depth / (1 + depth * tdRatio); // perioda hodin = t_1/depth + t_d → saturuje
  const ipc = 1 / effectiveCPI;
  const base = 1 / (1 + tdRatio); // normalizace na d = 1
  const perfRel = (ipc * freqGain) / base;
  return { effectiveCPI, freqGain, ipc, perfRel };
}

const REF_POINTS = [
  { d: 5,  label: "MIPS R3000" },
  { d: 10, label: "Pentium III" },
  { d: 14, label: "ARM Cortex-A78" },
  { d: 20, label: "AMD Zen 4" },
  { d: 31, label: "Pentium 4 Prescott", warn: true },
];

export default function SuperpipeliningDepth() {
  const [depth, setDepth] = useState(14);
  const [mispred, setMispred] = useState(0.08);
  const [branchFreq, setBranchFreq] = useState(0.2);

  const points = Array.from({ length: 32 }, (_, i) => {
    const d = i + 1;
    return { d, ...compute(d, mispred, branchFreq) };
  });
  const peak = points.reduce((a, b) => b.perfRel > a.perfRel ? b : a);
  const cur = compute(depth, mispred, branchFreq);

  const padX = 40, padY = 30;
  const plotW = W - 2 * padX, plotH = H - 2 * padY - 50;
  const maxPerf = Math.max(...points.map(p => p.perfRel));
  const xPos = d => padX + ((d - 1) / 31) * plotW;
  const yPos = v => padY + plotH - (v / maxPerf) * plotH;

  return (
    <div style={{ width: "100%" }}>
      <div className="viz-controls" style={{ marginBottom: 6, fontSize: 11, color: "var(--text)" }}>
        <label>hloubka: <b>{depth}</b><br />
          <input type="range" className="viz-slider" min={1} max={32} value={depth} onChange={e => setDepth(+e.target.value)} style={{ width: 130 }} />
        </label>
        <label>mispred rate: <b>{(mispred * 100).toFixed(1)}%</b><br />
          <input type="range" className="viz-slider" min={0} max={0.2} step={0.005} value={mispred} onChange={e => setMispred(+e.target.value)} style={{ width: 130 }} />
        </label>
        <label>branch freq: <b>{(branchFreq * 100).toFixed(0)}%</b><br />
          <input type="range" className="viz-slider" min={0.05} max={0.4} step={0.01} value={branchFreq} onChange={e => setBranchFreq(+e.target.value)} style={{ width: 130 }} />
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* axes */}
        <line x1={padX} y1={padY} x2={padX} y2={padY + plotH} stroke="var(--line)" />
        <line x1={padX} y1={padY + plotH} x2={padX + plotW} y2={padY + plotH} stroke="var(--line)" />
        <text x={padX} y={padY - 6} fontSize="9" fill="var(--text-muted)" textAnchor="start">rel. výkon</text>
        <text x={padX + plotW} y={padY + plotH + 14} fontSize="9" fill="var(--text-muted)" textAnchor="end">hloubka pipeline</text>

        {/* curve */}
        <path d={points.map((p, i) => `${i === 0 ? "M" : "L"} ${xPos(p.d)} ${yPos(p.perfRel)}`).join(" ")}
          fill="none" stroke="var(--accent)" strokeWidth="1.8" />

        {/* peak marker */}
        <circle cx={xPos(peak.d)} cy={yPos(peak.perfRel)} r={4} fill="var(--accent)" />
        <text x={xPos(peak.d)} y={yPos(peak.perfRel) - 8} fontSize="9.5" fill="var(--accent)" textAnchor="middle" fontWeight="600">
          peak d = {peak.d}
        </text>

        {/* reference points. Near the flat peak the markers crowd, so each label gets a
            per-index vertical stagger (above/below) + an anchor pointing away from its
            neighbours and the "peak d=" label, instead of all sitting on one line. */}
        {REF_POINTS.map((rp, i) => {
          const p = points[rp.d - 1];
          const cx = xPos(rp.d);
          const my = yPos(p.perfRel);
          const dy = [-11, 14, -11, 16, 14][i] ?? 3;       // alternate above / below the marker
          const anchorEnd = [false, false, true, false, true][i]; // extend left for crowded/edge labels
          const col = rp.warn ? "oklch(0.6 0.2 22)" : "var(--text-faint)";
          return (
            <g key={rp.label}>
              <circle cx={cx} cy={my} r={3} fill={rp.warn ? "oklch(0.6 0.2 22)" : "var(--text-muted)"} />
              <text x={cx + (anchorEnd ? -4 : 4)} y={my + dy} fontSize="8" textAnchor={anchorEnd ? "end" : "start"} fill={col}>{rp.label}</text>
            </g>
          );
        })}

        {/* current selection */}
        <line x1={xPos(depth)} y1={padY} x2={xPos(depth)} y2={padY + plotH} stroke="var(--accent-line)" strokeDasharray="3 3" opacity={0.7} />
        <circle cx={xPos(depth)} cy={yPos(cur.perfRel)} r={5} fill="var(--accent-line)" />

        <g fontSize="10" fill="var(--text)">
          <text x={padX} y={H - 18}>CPI = {cur.effectiveCPI.toFixed(2)} | freq gain ≈ {cur.freqGain.toFixed(2)}× | rel.výkon = {cur.perfRel.toFixed(2)}</text>
        </g>
      </svg>
      {/* caption as HTML so the long line wraps instead of clipping the SVG right frame */}
      <div style={{ fontSize: 11, color: "var(--text-faint)", lineHeight: 1.4, marginTop: 4 }}>
        Křivka s vrcholem: hloubka zvyšuje frekvenci (ale se sytí kvůli latch režii), zatímco stoupá náklad za mispredict ({(branchFreq * mispred * 100).toFixed(2)} % × hloubka).
      </div>
    </div>
  );
}
