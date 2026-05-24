// Las Vegas vs Monte Carlo — find a 1 in a half-1 array via two strategies.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 280;
const PAD_L = 50, PAD_R = 14, PAD_T = 22, PAD_B = 36;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

export default function LasVegasVsMc() {
  const [n, setN] = useState(20);  // array size (even)
  const [k, setK] = useState(5);    // MC: number of tries
  const [seed, setSeed] = useState(1);

  // Simulate distributions
  const sims = useMemo(() => {
    const rng = S.mulberry32(seed * 191 + 1);
    const NUM = 5000;
    const lvTimes = [];
    const mcResults = [];
    const arr = Array.from({ length: n }, (_, i) => i < n / 2 ? 0 : 1);
    // shuffle once
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    for (let t = 0; t < NUM; t++) {
      // Las Vegas: keep trying until find 1
      let tries = 0;
      while (true) {
        tries++;
        const idx = Math.floor(rng() * n);
        if (arr[idx] === 1) break;
        if (tries > 1000) break;  // safety
      }
      lvTimes.push(tries);
      // Monte Carlo: try k times, succeed if any returns 1
      let mcSucc = false;
      for (let i = 0; i < k; i++) {
        const idx = Math.floor(rng() * n);
        if (arr[idx] === 1) { mcSucc = true; break; }
      }
      mcResults.push(mcSucc);
    }
    return { lvTimes, mcResults };
  }, [n, k, seed]);

  const lvMean = sims.lvTimes.reduce((a, b) => a + b, 0) / sims.lvTimes.length;
  const mcSuccess = sims.mcResults.filter(Boolean).length / sims.mcResults.length;
  const mcTheory = 1 - Math.pow(0.5, k);  // P[at least one success] = 1 - (1/2)^k

  // LV histogram
  const maxT = Math.min(15, Math.max(...sims.lvTimes));
  const hist = new Int32Array(maxT + 1);
  for (const t of sims.lvTimes) {
    if (t <= maxT) hist[t]++;
  }
  const histMax = Math.max(...hist);

  const toX = (t) => PAD_L + (t / maxT) * PW;
  const toY = (c) => PAD_T + PH - (c / histMax) * PH;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <text x={PAD_L} y={PAD_T - 6} fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">Las Vegas: doba do prvního úspěchu</text>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* LV histogram */}
        {Array.from(hist).map((c, i) => {
          const bw = PW / maxT;
          return c > 0 && <rect key={i} x={toX(i) - bw / 4} y={toY(c)} width={bw / 2} height={PAD_T + PH - toY(c)} fill="var(--accent)" opacity="0.7" />;
        })}

        {/* Theoretical Geom(1/2) overlay */}
        {Array.from({ length: maxT + 1 }, (_, i) => {
          if (i < 1) return null;
          const p = Math.pow(0.5, i - 1) * 0.5;
          return <circle key={i} cx={toX(i)} cy={toY(p * sims.lvTimes.length)} r="3" fill="var(--accent-line)" />;
        })}

        {/* Mean LV time */}
        <line x1={toX(lvMean)} y1={PAD_T} x2={toX(lvMean)} y2={PAD_T + PH} stroke="var(--accent-line)" strokeDasharray="3 3" />
        <text x={toX(lvMean) + 3} y={PAD_T + 12} fontSize="10" fill="var(--accent-line)" fontFamily="var(--font-mono)">E[T] = {lvMean.toFixed(2)}</text>

        {/* x ticks */}
        {[1, 5, 10, 15].map((t) => t <= maxT && (
          <g key={t}>
            <line x1={toX(t)} y1={PAD_T + PH} x2={toX(t)} y2={PAD_T + PH + 4} stroke="var(--line-strong)" />
            <text x={toX(t)} y={PAD_T + PH + 16} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">{t}</text>
          </g>
        ))}

        {/* legend */}
        <g transform={`translate(${W - 220}, ${PAD_T + 4})`} fontSize="10.5" fontFamily="var(--font-mono)">
          <rect x="0" y="0" width="14" height="9" fill="var(--accent)" opacity="0.7" />
          <text x="18" y="8" fill="var(--accent)">empirické</text>
          <circle cx="100" cy="4" r="3" fill="var(--accent-line)" />
          <text x="108" y="8" fill="var(--accent-line)">Geom(1/2) teorie</text>
        </g>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <label style={lab()}>n (pole) = {n}
          <input type="range" min={4} max={50} step={2} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>k (MC pokusů) = {k}
          <input type="range" min={1} max={20} value={k} onChange={(e) => setK(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <button onClick={() => setSeed(seed + 1)} style={btn(false)}>nový seed</button>
      </div>

      <div style={{ fontSize: 11, color: "var(--text)", fontFamily: "var(--font-mono)" }}>
        <strong style={{ color: "var(--accent)" }}>Las Vegas</strong>: vždy správně; E[T] = 2 (≈ {lvMean.toFixed(3)} empiricky). Worst-case neomezeno.
        <br />
        <strong style={{ color: "var(--accent-line)" }}>Monte Carlo (k = {k})</strong>: worst-case O(k); P[úspěch] = 1 − (1/2)^k = {mcTheory.toFixed(4)} (empiricky {mcSuccess.toFixed(4)}).
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        Dvě strategie distribuce rizika: LV gambluje s časem (E[T] = 2), MC s korektností (P[chyba] = 2^(−k)). Amplifikace MC: zdvojnásob k → P[chyba] na druhou.
      </div>
    </div>
  );
}

function btn(active) { return { padding: "4px 10px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function lab() { return { flex: "1 1 180px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
