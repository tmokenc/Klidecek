// binning-and-outlier-rules — edit a column, choose binning + smoothing
// strategy, see outlier detection rules light up.
import { useMemo, useState } from "react";

const W = 540, H = 300;

const INIT = "4 9 15 21 24 24 24 26 27 28 29 34 42 55 250";

function parseSample(text) {
  return text.split(/[\s,;]+/).map(s => s.trim()).filter(Boolean).map(Number).filter(Number.isFinite);
}

function median(arr) {
  const s = [...arr].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) >> 1] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

function quantile(sorted, p) {
  const n = sorted.length;
  if (n === 0) return 0;
  const idx = p * (n - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return sorted[lo] + (idx - lo) * (sorted[hi] - sorted[lo]);
}

function binsEqualWidth(xs, k) {
  const min = Math.min(...xs), max = Math.max(...xs);
  const w = (max - min) / k;
  return Array.from({ length: k }, (_, i) => ({
    lo: min + i * w, hi: min + (i + 1) * w,
    members: xs.map((v, idx) => ({ v, idx })).filter(({ v }) => v >= min + i * w && (i === k - 1 ? v <= max + 1e-9 : v < min + (i + 1) * w)),
  }));
}

function binsEqualDepth(xs, k) {
  const sorted = [...xs].sort((a, b) => a - b);
  const n = sorted.length;
  const result = [];
  for (let i = 0; i < k; i++) {
    const lo = Math.floor(i * n / k), hi = Math.floor((i + 1) * n / k);
    const slice = sorted.slice(lo, hi);
    if (slice.length === 0) continue;
    result.push({
      lo: slice[0], hi: slice[slice.length - 1],
      members: slice.map(v => ({ v, idx: xs.indexOf(v) })),
    });
  }
  return result;
}

function smoothMean(bins) {
  return bins.flatMap(b => {
    const m = b.members.reduce((s, { v }) => s + v, 0) / Math.max(1, b.members.length);
    return b.members.map(({ idx }) => ({ idx, v: m }));
  });
}

function smoothMedian(bins) {
  return bins.flatMap(b => {
    const m = median(b.members.map(({ v }) => v));
    return b.members.map(({ idx }) => ({ idx, v: m }));
  });
}

function smoothBoundary(bins) {
  return bins.flatMap(b => b.members.map(({ idx, v }) => {
    const lo = Math.min(...b.members.map(m => m.v));
    const hi = Math.max(...b.members.map(m => m.v));
    return { idx, v: Math.abs(v - lo) < Math.abs(v - hi) ? lo : hi };
  }));
}

function outliersZ(xs, thr) {
  const m = xs.reduce((s, v) => s + v, 0) / xs.length;
  const sd = Math.sqrt(xs.reduce((s, v) => s + (v - m) ** 2, 0) / xs.length);
  return xs.map(v => sd > 0 && Math.abs(v - m) / sd > thr);
}

function outliersIQR(xs, mul) {
  const s = [...xs].sort((a, b) => a - b);
  const Q1 = quantile(s, 0.25), Q3 = quantile(s, 0.75);
  const IQR = Q3 - Q1;
  return xs.map(v => v < Q1 - mul * IQR || v > Q3 + mul * IQR);
}

function outliersMad(xs, thr) {
  const med = median(xs);
  const dev = xs.map(v => Math.abs(v - med));
  const mad = median(dev);
  return xs.map(v => mad > 0 && 0.6745 * Math.abs(v - med) / mad > thr);
}

export default function BinningAndOutlierRules() {
  const [input, setInput] = useState(INIT);
  const [k, setK] = useState(3);
  const [binMode, setBinMode] = useState("depth");
  const [smooth, setSmooth] = useState("mean");
  const [outRule, setOutRule] = useState("iqr");
  const [thr, setThr] = useState(1.5);

  const xs = useMemo(() => parseSample(input), [input]);

  const bins = useMemo(() => xs.length === 0 ? [] : (binMode === "width" ? binsEqualWidth(xs, k) : binsEqualDepth(xs, k)), [xs, k, binMode]);

  const smoothed = useMemo(() => {
    if (xs.length === 0) return [];
    const out = new Array(xs.length).fill(null);
    const records = smooth === "mean" ? smoothMean(bins) : smooth === "median" ? smoothMedian(bins) : smoothBoundary(bins);
    for (const { idx, v } of records) if (idx >= 0 && idx < xs.length && out[idx] === null) out[idx] = v;
    return out.map((v, i) => v === null ? xs[i] : v);
  }, [xs, bins, smooth]);

  const outliers = useMemo(() => {
    if (xs.length === 0) return [];
    return outRule === "z" ? outliersZ(xs, thr) : outRule === "iqr" ? outliersIQR(xs, thr) : outliersMad(xs, thr);
  }, [xs, outRule, thr]);

  const xMin = Math.min(0, Math.min(...(xs.length ? xs : [0]))) - 5;
  const xMax = Math.max(...(xs.length ? xs : [10])) + 5;
  const PAD_L = 40, PAD_R = 16, PAD_T = 20, PAD_B = 80;
  const PW = W - PAD_L - PAD_R;
  const toX = (v) => PAD_L + ((v - xMin) / (xMax - xMin + 1e-9)) * PW;

  const colorBins = ["oklch(0.75 0.14 230)", "oklch(0.75 0.14 145)", "oklch(0.75 0.14 60)", "oklch(0.75 0.14 320)", "oklch(0.75 0.14 22)"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={2}
        style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line-strong)", padding: 4, resize: "vertical" }} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, auto)", gap: "4px 12px", alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <span>bins</span>
        <input type="range" min={2} max={5} value={k} onChange={(e) => setK(+e.target.value)} />
        <span>mode</span>
        <select value={binMode} onChange={(e) => setBinMode(e.target.value)} style={sel}>
          <option value="width">equal-width</option>
          <option value="depth">equal-depth</option>
        </select>

        <span>smooth</span>
        <select value={smooth} onChange={(e) => setSmooth(e.target.value)} style={sel}>
          <option value="mean">bin mean</option>
          <option value="median">bin median</option>
          <option value="boundary">boundary</option>
        </select>
        <span>outlier</span>
        <select value={outRule} onChange={(e) => setOutRule(e.target.value)} style={sel}>
          <option value="z">|z| &gt; thr</option>
          <option value="iqr">IQR × thr</option>
          <option value="mad">MAD × thr</option>
        </select>

        <span>threshold</span>
        <input type="range" min={5} max={50} value={thr * 10} onChange={(e) => setThr(+e.target.value / 10)} />
        <span colSpan={2} style={{ gridColumn: "span 2" }}>thr = {thr.toFixed(1)}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* axis */}
        <line x1={PAD_L} y1={PAD_T + 30} x2={W - PAD_R} y2={PAD_T + 30} stroke="var(--line-strong)" />
        <text x={PAD_L - 4} y={PAD_T + 33} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">orig</text>

        {/* bin band visualization */}
        {bins.map((b, i) => (
          <rect key={i} x={toX(b.lo)} y={PAD_T + 15} width={toX(b.hi) - toX(b.lo)} height={30}
            fill={colorBins[i % colorBins.length]} opacity={0.15} />
        ))}
        {/* original points */}
        {xs.map((v, i) => (
          <g key={i}>
            <circle cx={toX(v)} cy={PAD_T + 30} r={4} fill={outliers[i] ? "oklch(0.6 0.18 22)" : "oklch(0.65 0.16 264)"} stroke="var(--text)" strokeWidth="0.5" />
            {outliers[i] && (
              <text x={toX(v)} y={PAD_T + 12} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.6 0.18 22)">×</text>
            )}
          </g>
        ))}
        {/* smoothed points */}
        <line x1={PAD_L} y1={PAD_T + 90} x2={W - PAD_R} y2={PAD_T + 90} stroke="var(--line-strong)" />
        <text x={PAD_L - 4} y={PAD_T + 93} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">smooth</text>
        {smoothed.map((v, i) => (
          <circle key={i} cx={toX(v)} cy={PAD_T + 90} r={4} fill="oklch(0.65 0.16 145)" stroke="var(--text)" strokeWidth="0.5" />
        ))}
        {/* connecting lines orig→smooth */}
        {xs.map((v, i) => (
          <line key={i} x1={toX(v)} y1={PAD_T + 34} x2={toX(smoothed[i])} y2={PAD_T + 86}
            stroke="var(--line)" strokeWidth="0.4" strokeDasharray="2 2" />
        ))}

        {/* bin boundaries on axis */}
        {bins.map((b, i) => (
          <g key={i}>
            <line x1={toX(b.lo)} y1={PAD_T + 6} x2={toX(b.lo)} y2={PAD_T + 50} stroke="var(--line-strong)" strokeWidth="0.6" strokeDasharray="2 2" />
            <text x={(toX(b.lo) + toX(b.hi)) / 2} y={PAD_T + 6} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">bin {i + 1}</text>
          </g>
        ))}
        {bins.length > 0 && (
          <line x1={toX(bins[bins.length - 1].hi)} y1={PAD_T + 6} x2={toX(bins[bins.length - 1].hi)} y2={PAD_T + 50} stroke="var(--line-strong)" strokeWidth="0.6" strokeDasharray="2 2" />
        )}

        {/* numeric values below */}
        <g>
          <text x={PAD_L} y={H - 50} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">orig    [{xs.map(v => v.toFixed(0).padStart(3)).join(" ")}]</text>
          <text x={PAD_L} y={H - 36} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">smooth  [{smoothed.map(v => v.toFixed(0).padStart(3)).join(" ")}]</text>
          <text x={PAD_L} y={H - 22} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.6 0.18 22)">outlier [{outliers.map(o => (o ? "  ×" : "  ·")).join(" ")}]</text>
          <text x={PAD_L} y={H - 6} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
            n = {xs.length} · flagged {outliers.filter(Boolean).length}
          </text>
        </g>
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Equal-depth puts roughly the same count into each bin → robust to skew. The big outlier (250) dominates equal-width binning.
        Z-score assumes normality; IQR is non-parametric; MAD with 0.6745 scaling matches σ for Gaussian data.
      </div>
    </div>
  );
}

const sel = {
  fontFamily: "var(--font-mono)", fontSize: 11,
  background: "var(--bg-inset)", color: "var(--text)",
  border: "1px solid var(--line-strong)", borderRadius: 3, padding: "1px 4px",
};
