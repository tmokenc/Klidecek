// Beneš network BN_n — recursive multistage 2×2 switching fabric.
//
// BN_1 = single 2×2 switch.
// BN_n = N/2 input 2×2 switches  +  2 × BN_{n-1}  +  N/2 output 2×2 switches.
// Number of stages: 2·log₂(N) − 1.
import { useState, useMemo } from "react";

export default function Benes() {
  const [n, setN] = useState(3);

  const data = useMemo(() => buildBenes(n), [n]);

  const W = 560, H = 240;
  const padX = 44, padTop = 22, padBot = 26;
  const stages = 2 * n - 1;
  const N = 1 << n;
  const switchesPerStage = N / 2;
  const innerW = W - 2 * padX;
  const innerH = H - padTop - padBot;

  const xStage = (s) => padX + (s + 0.5) * (innerW / stages);
  const ySw = (k) => padTop + (k + 0.5) * (innerH / switchesPerStage);
  const yPort = (k, port) => ySw(k) + (port === 0 ? -4.5 : 4.5);

  const blockW = Math.min(28, (innerW / stages) * 0.55);
  const blockH = Math.min(16, (innerH / switchesPerStage) * 0.6);

  const palette = [
    "oklch(0.55 0.18 264)",
    "oklch(0.62 0.15 145)",
    "oklch(0.68 0.16 65)",
    "oklch(0.60 0.18 25)",
  ];

  const totalSwitches = data.switches.length;
  const crossbarCrosspoints = N * N;
  const benesCrosspoints = totalSwitches * 4;
  const saving = Math.round((1 - benesCrosspoints / crossbarCrosspoints) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* recursive sub-network rectangles, outer first */}
        {data.boxes.map((b, i) => {
          const x1 = xStage(b.fromStage) - blockW / 2 - 6;
          const x2 = xStage(b.toStage) + blockW / 2 + 6;
          const y1 = ySw(b.topSwIdx) - blockH / 2 - 5;
          const y2 = ySw(b.bottomSwIdx) + blockH / 2 + 5;
          const color = palette[(b.level - 1) % palette.length];
          return (
            <g key={i}>
              <rect x={x1} y={y1} width={x2 - x1} height={y2 - y1}
                fill="none" stroke={color} strokeWidth="1.1" strokeDasharray="3 2" rx="5" />
              <text x={x1 + 1} y={y1 - 2} fontSize="8" fontFamily="var(--font-mono)"
                fontWeight="700" fill={color}>BN{b.level}</text>
            </g>
          );
        })}

        {/* external inputs + outputs */}
        {Array.from({ length: N }, (_, i) => {
          const yi = padTop + 6 + (i * (innerH - 12)) / (N - 1 || 1);
          const swIdx = Math.floor(i / 2);
          const port = i % 2;
          return (
            <g key={`io-${i}`}>
              {/* input */}
              <line x1={padX - 6} y1={yi} x2={xStage(0) - blockW / 2} y2={yPort(swIdx, port)}
                stroke="var(--line-strong)" strokeWidth="0.6" />
              <circle cx={padX - 6} cy={yi} r="3.5" fill="var(--accent)" />
              <text x={padX - 14} y={yi + 2.5} fontSize="8" fontFamily="var(--font-mono)"
                textAnchor="end" fill="var(--text-muted)">{i}</text>
              {/* output */}
              <line x1={xStage(stages - 1) + blockW / 2} y1={yPort(swIdx, port)}
                x2={W - padX + 6} y2={yi}
                stroke="var(--line-strong)" strokeWidth="0.6" />
              <circle cx={W - padX + 6} cy={yi} r="3.5" fill="var(--accent)" />
              <text x={W - padX + 14} y={yi + 2.5} fontSize="8" fontFamily="var(--font-mono)"
                fill="var(--text-muted)">{i}</text>
            </g>
          );
        })}

        {/* inter-stage connections */}
        {data.conns.map((c, i) => (
          <line key={`c-${i}`}
            x1={xStage(c.s1) + blockW / 2} y1={yPort(c.k1, c.p1)}
            x2={xStage(c.s2) - blockW / 2} y2={yPort(c.k2, c.p2)}
            stroke="var(--line-strong)" strokeWidth="0.5" opacity="0.7" />
        ))}

        {/* 2x2 switches */}
        {data.switches.map((sw, i) => {
          const x = xStage(sw.stage);
          const y = ySw(sw.swIdx);
          return (
            <g key={`sw-${i}`}>
              <rect x={x - blockW / 2} y={y - blockH / 2} width={blockW} height={blockH}
                fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="0.9" rx="2" />
              <text x={x} y={y + 2.5} textAnchor="middle"
                fontSize="7" fontFamily="var(--font-mono)" fontWeight="700"
                fill="var(--accent)">2×2</text>
            </g>
          );
        })}

        {/* stage labels */}
        {Array.from({ length: stages }, (_, s) => (
          <text key={`s-${s}`} x={xStage(s)} y={H - 10} textAnchor="middle"
            fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">
            s{s + 1}
          </text>
        ))}

        <text x={W / 2} y={14} textAnchor="middle"
          fontSize="10" fontWeight="700" fill="var(--text)">
          BN{n} — {N} portů, {stages} stupňů, {totalSwitches}×(2×2)
        </text>
      </svg>

      <div className="viz-controls" style={{ fontSize: 12, color: "var(--text-muted)" }}>
        <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span>n</span>
          <input type="range" className="viz-slider" min="1" max="4" step="1" value={n}
            onChange={(e) => setN(parseInt(e.target.value, 10))}
            style={{ width: 120 }} />
          <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>= {n}</span>
        </label>
        <span className="viz-readout">
          N = 2<sup>{n}</sup> = {N}, stages = 2·log₂N−1 = {stages}
        </span>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.45 }}>
        <strong>Crossbar</strong> {crossbarCrosspoints} crosspointů vs.{" "}
        <strong>Beneš</strong> {benesCrosspoints} ({saving}% úspora).
        Barevné rámečky jsou rekurzivní rozklad: BN<sub>{n}</sub> = vstupní stage + 2× BN<sub>{n - 1}</sub> + výstupní stage.
        Rearrangeably non-blocking, looping algoritmus O(N).
      </div>
    </div>
  );
}

// ------------- recursive Beneš builder -------------

function buildBenes(n) {
  const N = 1 << n;
  const switchesPerStage = N / 2;
  const switches = [];
  const boxes = [];
  const conns = [];

  // collect switches and recursive boxes
  (function place(level, stage0, topSwIdx, bottomSwIdx) {
    if (level === 1) {
      switches.push({ stage: stage0, swIdx: topSwIdx, level: 1 });
      return;
    }
    const lastStage = stage0 + 2 * level - 2;
    const halfSwIdx = (topSwIdx + bottomSwIdx + 1) >> 1;
    for (let i = topSwIdx; i <= bottomSwIdx; i++) {
      switches.push({ stage: stage0, swIdx: i, level });
      if (lastStage !== stage0) switches.push({ stage: lastStage, swIdx: i, level });
    }
    if (level < n) {
      boxes.push({ level, fromStage: stage0, toStage: lastStage, topSwIdx, bottomSwIdx });
    }
    place(level - 1, stage0 + 1, topSwIdx, halfSwIdx - 1);
    place(level - 1, stage0 + 1, halfSwIdx, bottomSwIdx);
  })(n, 0, 0, switchesPerStage - 1);

  // collect connections between recursive halves
  (function wire(level, stage0, topSwIdx, bottomSwIdx) {
    if (level === 1) return;
    const lastStage = stage0 + 2 * level - 2;
    const halfSwIdx = (topSwIdx + bottomSwIdx + 1) >> 1;
    for (let i = topSwIdx; i <= bottomSwIdx; i++) {
      const rel = i - topSwIdx;
      const upperSw = topSwIdx + Math.floor(rel / 2);
      const lowerSw = halfSwIdx + Math.floor(rel / 2);
      const port = rel % 2;
      conns.push({ s1: stage0, k1: i, p1: 0, s2: stage0 + 1, k2: upperSw, p2: port });
      conns.push({ s1: stage0, k1: i, p1: 1, s2: stage0 + 1, k2: lowerSw, p2: port });
      conns.push({ s1: lastStage - 1, k1: upperSw, p1: port, s2: lastStage, k2: i, p2: 0 });
      conns.push({ s1: lastStage - 1, k1: lowerSw, p1: port, s2: lastStage, k2: i, p2: 1 });
    }
    wire(level - 1, stage0 + 1, topSwIdx, halfSwIdx - 1);
    wire(level - 1, stage0 + 1, halfSwIdx, bottomSwIdx);
  })(n, 0, 0, switchesPerStage - 1);

  // sort outer boxes first so the smaller ones draw on top
  boxes.sort((a, b) => b.level - a.level);

  return { switches, boxes, conns };
}
