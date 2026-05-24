// distribution-explorer — see how skewness shifts mean/median/mode and
// how outliers affect robust vs. non-robust measures.
import { useMemo, useState } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 280;

function buildSample(skew, outlierMag, seed) {
  const rng = S.mulberry32(seed);
  const N = 200;
  // Generate skewed distribution via shifted log-normal-like transform.
  // skew in [-2, 2]; 0 = symmetric normal-ish, +2 = strong right tail.
  const xs = [];
  for (let i = 0; i < N; i++) {
    const u = rng(), v = rng();
    const z = Math.sqrt(-2 * Math.log(Math.max(1e-9, u))) * Math.cos(2 * Math.PI * v);
    // Asymmetric power: positive skew stretches right tail.
    let x = z;
    if (skew > 0) {
      x = z + skew * 0.4 * (Math.exp(Math.abs(z) * 0.7) - 1) * Math.sign(z + 0.5);
    } else if (skew < 0) {
      x = z - Math.abs(skew) * 0.4 * (Math.exp(Math.abs(z) * 0.7) - 1) * Math.sign(0.5 - z);
    }
    xs.push(50 + 12 * x);
  }
  // Inject outlierMag big outliers on the right.
  for (let i = 0; i < outlierMag; i++) {
    xs.push(150 + rng() * 100);
  }
  return xs;
}

function summarize(xs, trimPct) {
  const sorted = [...xs].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((s, v) => s + v, 0) / n;
  const median = n % 2 ? sorted[(n - 1) >> 1] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  // Mode via histogram bin with max count
  const bMin = sorted[0], bMax = sorted[n - 1];
  const bins = 30;
  const counts = new Array(bins).fill(0);
  for (const v of xs) {
    const k = Math.min(bins - 1, Math.floor((v - bMin) / (bMax - bMin + 1e-9) * bins));
    counts[k]++;
  }
  let modeBin = 0;
  for (let i = 1; i < bins; i++) if (counts[i] > counts[modeBin]) modeBin = i;
  const mode = bMin + (modeBin + 0.5) * (bMax - bMin) / bins;
  // Quartiles
  const q = (p) => {
    const idx = p * (n - 1);
    const lo = Math.floor(idx), hi = Math.ceil(idx);
    return sorted[lo] + (idx - lo) * (sorted[hi] - sorted[lo]);
  };
  const Q1 = q(0.25), Q3 = q(0.75), IQR = Q3 - Q1;
  // Trimmed mean
  const trimN = Math.floor(n * trimPct / 100);
  const trimmed = sorted.slice(trimN, n - trimN);
  const trimMean = trimmed.reduce((s, v) => s + v, 0) / Math.max(1, trimmed.length);
  // Std
  const std = Math.sqrt(xs.reduce((s, v) => s + (v - mean) ** 2, 0) / n);
  return { sorted, counts, bMin, bMax, mean, median, mode, Q1, Q3, IQR, trimMean, std, bins };
}

export default function DistributionExplorer() {
  const [skew, setSkew] = useState(0);
  const [outliers, setOutliers] = useState(0);
  const [trimPct, setTrimPct] = useState(10);
  const [seed] = useState(42);

  const xs = useMemo(() => buildSample(skew, outliers, seed), [skew, outliers, seed]);
  const stats = useMemo(() => summarize(xs, trimPct), [xs, trimPct]);

  // Plot histogram
  const PAD_L = 36, PAD_R = 16, PAD_T = 16, PAD_B = 70;
  const PW = W - PAD_L - PAD_R;
  const PH = H - PAD_T - PAD_B;
  const xMin = Math.min(stats.bMin, stats.mean - 4 * stats.std);
  const xMax = Math.max(stats.bMax, stats.mean + 4 * stats.std);
  const toX = (x) => PAD_L + ((x - xMin) / (xMax - xMin + 1e-9)) * PW;
  const maxCount = Math.max(...stats.counts);
  const toY = (c) => PAD_T + PH - (c / Math.max(1, maxCount)) * PH;

  // Boxplot below histogram
  const boxY = PAD_T + PH + 18;
  const boxH = 18;

  const colorMean = "oklch(0.6 0.18 22)";   // red
  const colorMedian = "oklch(0.65 0.16 264)"; // blue
  const colorMode = "oklch(0.65 0.16 145)"; // green
  const colorTrim = "oklch(0.7 0.14 60)";   // orange

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "4px 12px", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 12 }}>
        <span>skew</span>
        <input type="range" min={-20} max={20} value={skew * 10}
          onChange={(e) => setSkew(+e.target.value / 10)} />
        <span style={{ width: 40, textAlign: "right" }}>{skew.toFixed(1)}</span>

        <span>outliers</span>
        <input type="range" min={0} max={15} value={outliers}
          onChange={(e) => setOutliers(+e.target.value)} />
        <span style={{ width: 40, textAlign: "right" }}>{outliers}</span>

        <span>trim %</span>
        <input type="range" min={0} max={40} value={trimPct}
          onChange={(e) => setTrimPct(+e.target.value)} />
        <span style={{ width: 40, textAlign: "right" }}>{trimPct}%</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* axes */}
        <line x1={PAD_L} y1={PAD_T + PH} x2={W - PAD_R} y2={PAD_T + PH} stroke="var(--line-strong)" strokeWidth="0.6" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" strokeWidth="0.6" />

        {/* histogram bars */}
        {stats.counts.map((c, i) => {
          const x0 = toX(stats.bMin + i * (stats.bMax - stats.bMin) / stats.bins);
          const x1 = toX(stats.bMin + (i + 1) * (stats.bMax - stats.bMin) / stats.bins);
          return (
            <rect key={i} x={x0} y={toY(c)} width={Math.max(1, x1 - x0 - 0.5)} height={PAD_T + PH - toY(c)}
              fill="var(--bg-inset)" stroke="var(--line)" strokeWidth="0.4" />
          );
        })}

        {/* mean / median / mode lines */}
        <line x1={toX(stats.mean)} y1={PAD_T - 6} x2={toX(stats.mean)} y2={PAD_T + PH} stroke={colorMean} strokeWidth="1.4" />
        <text x={toX(stats.mean)} y={PAD_T - 8} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill={colorMean}>mean</text>
        <line x1={toX(stats.median)} y1={PAD_T - 6} x2={toX(stats.median)} y2={PAD_T + PH} stroke={colorMedian} strokeWidth="1.4" strokeDasharray="3 2" />
        <text x={toX(stats.median)} y={PAD_T + 5} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill={colorMedian}>med</text>
        <line x1={toX(stats.mode)} y1={PAD_T - 6} x2={toX(stats.mode)} y2={PAD_T + PH} stroke={colorMode} strokeWidth="1.4" strokeDasharray="1 2" />
        <text x={toX(stats.mode)} y={PAD_T + 16} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill={colorMode}>mode</text>
        <line x1={toX(stats.trimMean)} y1={PAD_T + PH - 6} x2={toX(stats.trimMean)} y2={PAD_T + PH + 6} stroke={colorTrim} strokeWidth="1.4" />
        <text x={toX(stats.trimMean)} y={PAD_T + PH + 18} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill={colorTrim}>trim</text>

        {/* boxplot */}
        <line x1={toX(stats.sorted[0])} y1={boxY + boxH / 2}
              x2={toX(stats.Q1)} y2={boxY + boxH / 2} stroke="var(--line-strong)" />
        <line x1={toX(stats.Q3)} y1={boxY + boxH / 2}
              x2={toX(stats.sorted[stats.sorted.length - 1])} y2={boxY + boxH / 2} stroke="var(--line-strong)" />
        <rect x={toX(stats.Q1)} y={boxY} width={toX(stats.Q3) - toX(stats.Q1)} height={boxH}
              fill="var(--bg-inset)" stroke="var(--accent)" strokeWidth="1.2" />
        <line x1={toX(stats.median)} y1={boxY} x2={toX(stats.median)} y2={boxY + boxH} stroke={colorMedian} strokeWidth="1.5" />

        {/* x-axis labels */}
        {[xMin, (xMin + xMax) / 2, xMax].map((v, i) => (
          <text key={i} x={toX(v)} y={H - 22} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">{v.toFixed(0)}</text>
        ))}
        <text x={W - PAD_R} y={H - 6} textAnchor="end" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          n={xs.length} · IQR={stats.IQR.toFixed(1)} · σ={stats.std.toFixed(1)}
        </text>
      </svg>

      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
        <span style={{ color: colorMean }}>mean = {stats.mean.toFixed(2)}</span>
        <span style={{ color: colorMedian }}>median = {stats.median.toFixed(2)}</span>
        <span style={{ color: colorMode }}>mode ≈ {stats.mode.toFixed(2)}</span>
        <span style={{ color: colorTrim }}>trim = {stats.trimMean.toFixed(2)}</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        For symmetric data all three coincide. Right-skew → mean &gt; median &gt; mode (tail pulls mean). Outliers move mean and σ; median and IQR are robust.
      </div>
    </div>
  );
}
