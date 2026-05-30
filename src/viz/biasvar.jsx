// Bias-variance tradeoff slider.
import { useState } from "react";

export default function BiasVar() {
  const [complexity, setComplexity] = useState(40);
  const W = 280, H = 180;
  const data = [];
  for (let c = 0; c <= 100; c += 2) {
    const train = 0.85 * Math.exp(-c/25) + 0.05;
    const test  = 0.7  * Math.exp(-c/25) + 0.00017 * (c-30)*(c-30) * (c > 30 ? 1 : 0) + 0.1;
    data.push({ c, train, test });
  }
  const toX = (c) => 20 + (c/100) * (W - 40);
  const toY = (v) => H - 30 - v * (H - 50);
  const path = (key) => data.map((d, i) => `${i === 0 ? "M" : "L"} ${toX(d.c)} ${toY(d[key])}`).join(" ");
  const here = data.reduce((best, d) => Math.abs(d.c - complexity) < Math.abs(best.c - complexity) ? d : best);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 400 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        <line x1={20} y1={H-30} x2={W-20} y2={H-30} stroke="var(--line-strong)" strokeWidth="0.5" />
        <line x1={20} y1={10} x2={20} y2={H-30} stroke="var(--line-strong)" strokeWidth="0.5" />
        <text x={W-5} y={H-18} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">model complexity →</text>
        <text x={4} y={14} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">error</text>
        <path d={path("train")} fill="none" stroke="oklch(0.65 0.16 264)" strokeWidth="1.5" />
        <path d={path("test")}  fill="none" stroke="oklch(0.6 0.18 22)"  strokeWidth="1.5" />
        <line x1={toX(here.c)} y1={10} x2={toX(here.c)} y2={H-30}
          stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" />
        <circle cx={toX(here.c)} cy={toY(here.train)} r="3" fill="oklch(0.65 0.16 264)" />
        <circle cx={toX(here.c)} cy={toY(here.test)}  r="3" fill="oklch(0.6 0.18 22)" />
        <text x={W-10} y={H-50} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.65 0.16 264)">— train</text>
        <text x={W-10} y={H-38} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.6 0.18 22)">— test</text>
      </svg>
      <input type="range" min={0} max={100} value={complexity}
        onChange={(e) => setComplexity(+e.target.value)} style={{ width: "100%" }} />
      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        complexity = {complexity} · train={here.train.toFixed(2)} · test={here.test.toFixed(2)}
      </div>
    </div>
  );
}
