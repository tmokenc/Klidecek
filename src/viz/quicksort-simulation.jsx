// Randomized QuickSort — distribution of comparison count over many runs vs theoretical 2n ln n.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 280;
const PAD_L = 50, PAD_R = 14, PAD_T = 20, PAD_B = 36;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

function randomizedQuickSort(arr, rng) {
  let comparisons = 0;
  function partition(lo, hi) {
    const pivIdx = lo + Math.floor(rng() * (hi - lo + 1));
    [arr[pivIdx], arr[hi]] = [arr[hi], arr[pivIdx]];
    const pivot = arr[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comparisons++;
      if (arr[j] <= pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    [arr[i + 1], arr[hi]] = [arr[hi], arr[i + 1]];
    return i + 1;
  }
  function sort(lo, hi) {
    if (lo < hi) {
      const p = partition(lo, hi);
      sort(lo, p - 1);
      sort(p + 1, hi);
    }
  }
  sort(0, arr.length - 1);
  return comparisons;
}

export default function QuicksortSimulation() {
  const [n, setN] = useState(50);
  const [seed, setSeed] = useState(1);

  const results = useMemo(() => {
    const rng = S.mulberry32(seed * 1009 + 1);
    const NUM = 500;
    const out = [];
    for (let t = 0; t < NUM; t++) {
      const arr = Array.from({ length: n }, (_, i) => i);
      // shuffle
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      out.push(randomizedQuickSort(arr, rng));
    }
    return out;
  }, [n, seed]);

  const NUM = results.length;
  const meanComp = results.reduce((a, b) => a + b, 0) / NUM;
  const theo = 2 * n * Math.log(n) - 1.846 * n - 1.16;  // Sedgewick's exact average

  const xMin = Math.min(...results) * 0.95;
  const xMax = Math.max(...results) * 1.05;
  const BINS = 30;
  const hist = new Int32Array(BINS);
  const binW = (xMax - xMin) / BINS;
  for (const x of results) {
    const idx = Math.floor((x - xMin) / binW);
    if (idx >= 0 && idx < BINS) hist[idx]++;
  }
  const histMax = Math.max(...hist);

  const toX = (x) => PAD_L + ((x - xMin) / (xMax - xMin)) * PW;
  const toY = (count) => PAD_T + PH - (count / histMax) * PH;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* Histogram */}
        {Array.from(hist).map((c, i) => {
          const x0 = xMin + i * binW;
          return c > 0 && <rect key={i} x={toX(x0)} y={toY(c)} width={Math.max(1, toX(x0 + binW) - toX(x0) - 1)} height={PAD_T + PH - toY(c)} fill="var(--accent)" opacity="0.6" />;
        })}

        {/* Mean line */}
        <line x1={toX(meanComp)} y1={PAD_T} x2={toX(meanComp)} y2={PAD_T + PH} stroke="var(--accent)" strokeWidth="2" />
        <text x={toX(meanComp)} y={PAD_T + 12} textAnchor="middle" fontSize="10.5" fill="var(--accent)" fontFamily="var(--font-mono)">empirický μ = {meanComp.toFixed(1)}</text>

        {/* Theoretical */}
        <line x1={toX(theo)} y1={PAD_T} x2={toX(theo)} y2={PAD_T + PH} stroke="var(--accent-line)" strokeWidth="2" strokeDasharray="3 3" />
        <text x={toX(theo)} y={PAD_T + 28} textAnchor="middle" fontSize="10.5" fill="var(--accent-line)" fontFamily="var(--font-mono)">teorie 2n ln n − 1.85n ≈ {theo.toFixed(1)}</text>

        {/* x ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const v = xMin + t * (xMax - xMin);
          return (
            <g key={t}>
              <line x1={toX(v)} y1={PAD_T + PH} x2={toX(v)} y2={PAD_T + PH + 4} stroke="var(--line-strong)" />
              <text x={toX(v)} y={PAD_T + PH + 16} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v.toFixed(0)}</text>
            </g>
          );
        })}
        <text x={PAD_L + PW} y={H - 6} textAnchor="end" fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">počet porovnání →</text>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <label style={lab()}>n = {n}
          <input type="range" min={10} max={500} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <button onClick={() => setSeed(seed + 1)} style={btn(false)}>nový seed</button>
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        {NUM} běhů, n = {n}. Worst-case O(n²) = {n * n}, average O(n log n) ≈ {(2 * n * Math.log(n)).toFixed(0)}.
        Distribuce komparací je úzce koncentrovaná kolem střední hodnoty — Markovova nerovnost dává P[T &gt; 2·E[T]] ≤ 1/2.
      </div>
    </div>
  );
}

function btn(active) { return { padding: "4px 10px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function lab() { return { flex: "1 1 180px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
