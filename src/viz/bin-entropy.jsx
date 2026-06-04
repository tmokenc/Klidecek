// Shannon entropy of a 4-state distribution: drag sliders on p_i,
// distribution is renormalised, H = -sum p_i log2 p_i is computed live.
import { useState } from "react";

export default function BinEntropy() {
  // unnormalised weights for 4 states; normalised to probabilities below
  const [w, setW] = useState([1, 1, 1, 1]);
  const n = w.length;
  const sum = w.reduce((a, b) => a + b, 0) || 1;
  const p = w.map((x) => x / sum);

  const H = p.reduce((acc, pi) => acc + (pi > 0 ? -pi * Math.log2(pi) : 0), 0);
  const Hmax = Math.log2(n); // = 2 bits for n = 4
  const near = Math.abs(H - Hmax) < 0.01;

  const W = 320, Hgt = 180;
  const x0 = 36, y0 = Hgt - 30, barW = 46, gap = 18, plot = y0 - 20;
  const colors = ["var(--accent)", "var(--accent)", "var(--accent)", "var(--accent)"];

  const setOne = (i, v) =>
    setW((prev) => prev.map((x, j) => (j === i ? +v : x)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${Hgt}`} style={{ width: "100%", maxWidth: 440, display: "block" }}>
        <rect width={W} height={Hgt} fill="var(--bg-inset)" />
        {/* y axis = probability 0..1 */}
        <line x1={x0} y1={y0} x2={x0} y2={y0 - plot} stroke="var(--line-strong)" strokeWidth="0.5" />
        <line x1={x0} y1={y0} x2={W - 10} y2={y0} stroke="var(--line-strong)" strokeWidth="0.5" />
        <text x={x0 - 6} y={y0 - plot + 4} textAnchor="end" fontSize="9"
          fontFamily="var(--font-mono)" fill="var(--text-faint)">1.0</text>
        <text x={x0 - 6} y={y0 + 3} textAnchor="end" fontSize="9"
          fontFamily="var(--font-mono)" fill="var(--text-faint)">0</text>
        {/* uniform reference line p = 1/n */}
        <line x1={x0} y1={y0 - plot / n} x2={W - 10} y2={y0 - plot / n}
          stroke="var(--accent-line)" strokeWidth="0.8" strokeDasharray="3 3" />
        <text x={W - 12} y={y0 - plot / n - 4} textAnchor="end" fontSize="8"
          fontFamily="var(--font-mono)" fill="var(--text-faint)">1/n</text>
        {/* probability bars */}
        {p.map((pi, i) => {
          const bx = x0 + 8 + i * (barW + gap);
          const bh = pi * plot;
          return (
            <g key={i}>
              <rect x={bx} y={y0 - bh} width={barW} height={bh}
                fill={colors[i]} opacity={0.75} rx="2" />
              <text x={bx + barW / 2} y={y0 + 12} textAnchor="middle" fontSize="9"
                fontFamily="var(--font-mono)" fill="var(--text-muted)">p{i + 1}</text>
              <text x={bx + barW / 2} y={y0 - bh - 4} textAnchor="middle" fontSize="9"
                fontFamily="var(--font-mono)" fill="var(--text)">{pi.toFixed(2)}</text>
            </g>
          );
        })}
        {/* H readout */}
        <text x={W - 10} y={16} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)"
          fill={near ? "var(--accent)" : "var(--text)"}>
          H = {H.toFixed(3)} bit
        </text>
        <text x={W - 10} y={28} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)"
          fill="var(--text-faint)">
          max = log2 n = {Hmax.toFixed(2)}
        </text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {w.map((wi, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", width: 22 }}>
              p{i + 1}
            </span>
            <input type="range" min={0} max={10} step={0.5} value={wi}
              onChange={(e) => setOne(i, e.target.value)} style={{ flex: 1 }} />
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        {near
          ? "rovnoměrné rozdělení → H je maximální (= log2 n)"
          : "posuň jezdce; max H nastane, když jsou všechna p_i stejná"}
      </div>
    </div>
  );
}
