// scaler-comparator — show MinMax / Z-score / Robust / Log + Z applied
// to the same distribution; compare resulting ranges and outlier effect.
import { useMemo, useState } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 320;

function sample(dist, seed) {
  const rng = S.mulberry32(seed);
  const N = 100;
  const out = [];
  for (let i = 0; i < N; i++) {
    const u = rng(), v = rng();
    const z = Math.sqrt(-2 * Math.log(Math.max(1e-9, u))) * Math.cos(2 * Math.PI * v);
    if (dist === "normal") out.push(50 + 12 * z);
    else if (dist === "lognormal") out.push(20 * Math.exp(0.6 * z));
    else if (dist === "exp") out.push(-Math.log(Math.max(1e-9, u)) * 25 + 5);
    else if (dist === "skew+outlier") out.push(40 + 10 * z + (rng() < 0.04 ? 200 + rng() * 100 : 0));
  }
  return out;
}

function minmax(xs) {
  const lo = Math.min(...xs), hi = Math.max(...xs);
  return xs.map(v => (v - lo) / (hi - lo + 1e-9));
}

function zscore(xs) {
  const m = xs.reduce((s, v) => s + v, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((s, v) => s + (v - m) ** 2, 0) / xs.length);
  return xs.map(v => sd > 0 ? (v - m) / sd : 0);
}

function robust(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  const median = n % 2 ? s[(n - 1) >> 1] : (s[n / 2 - 1] + s[n / 2]) / 2;
  const q = (p) => {
    const i = p * (n - 1);
    const lo = Math.floor(i), hi = Math.ceil(i);
    return s[lo] + (i - lo) * (s[hi] - s[lo]);
  };
  const iqr = q(0.75) - q(0.25);
  return xs.map(v => iqr > 0 ? (v - median) / iqr : 0);
}

function logz(xs) {
  const offset = Math.max(0, -Math.min(...xs) + 1);
  const logs = xs.map(v => Math.log(v + offset));
  return zscore(logs);
}

function histogram(xs, bins, range) {
  const [lo, hi] = range;
  const counts = new Array(bins).fill(0);
  for (const v of xs) {
    const k = Math.max(0, Math.min(bins - 1, Math.floor((v - lo) / (hi - lo + 1e-9) * bins)));
    counts[k]++;
  }
  return counts;
}

const PANES = [
  { key: "raw", title: "raw" },
  { key: "minmax", title: "MinMax [0,1]" },
  { key: "z", title: "Z-score (μ=0, σ=1)" },
  { key: "robust", title: "Robust (median/IQR)" },
  { key: "logz", title: "Log → Z" },
];

export default function ScalerComparator() {
  const [dist, setDist] = useState("skew+outlier");
  const [seed, setSeed] = useState(7);

  const raw = useMemo(() => sample(dist, seed), [dist, seed]);

  const all = useMemo(() => ({
    raw,
    minmax: minmax(raw),
    z: zscore(raw),
    robust: robust(raw),
    logz: logz(raw),
  }), [raw]);

  // Per pane: small histogram
  const PAD = 16;
  const PANE_W = (W - PAD * 2) / 5;
  const PANE_H = 180;
  const BINS = 18;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        <select className="viz-select" value={dist} onChange={(e) => setDist(e.target.value)}>
          <option value="normal">normal</option>
          <option value="lognormal">log-normal (right skew)</option>
          <option value="exp">exponential</option>
          <option value="skew+outlier">skew + outliers</option>
        </select>
        <button className="viz-btn primary" onClick={() => setSeed(s => s + 1)}>resample</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {PANES.map((p, idx) => {
          const xs = all[p.key];
          const lo = Math.min(...xs), hi = Math.max(...xs);
          const counts = histogram(xs, BINS, [lo, hi]);
          const mc = Math.max(...counts);
          const x0 = PAD + idx * PANE_W;
          // descriptors
          const m = xs.reduce((s, v) => s + v, 0) / xs.length;
          const sd = Math.sqrt(xs.reduce((s, v) => s + (v - m) ** 2, 0) / xs.length);
          return (
            <g key={p.key} transform={`translate(${x0}, ${PAD + 16})`}>
              <text x={PANE_W / 2} y={-4} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text)">{p.title}</text>
              <rect x={0} y={0} width={PANE_W - 4} height={PANE_H} fill="var(--bg-inset)" stroke="var(--line)" />
              {counts.map((c, i) => (
                <rect key={i} x={(i / BINS) * (PANE_W - 4)} y={PANE_H - (c / Math.max(1, mc)) * PANE_H}
                  width={(PANE_W - 4) / BINS - 0.5} height={(c / Math.max(1, mc)) * PANE_H}
                  fill="oklch(0.65 0.16 264)" opacity={0.7} />
              ))}
              <text x={2} y={PANE_H + 14} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">[{lo.toFixed(2)}, {hi.toFixed(2)}]</text>
              <text x={2} y={PANE_H + 26} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">μ={m.toFixed(2)} σ={sd.toFixed(2)}</text>
            </g>
          );
        })}
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        MinMax compresses the bulk toward 0 when an outlier inflates the range. Z-score is itself skewed for non-Gaussian data.
        Robust (median, IQR) ignores tails. Log + Z works for right-skewed positive data — beware of zeros/negatives (a small offset is added here).
      </div>
    </div>
  );
}
