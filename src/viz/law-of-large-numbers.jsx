// LLN demo — running average X̄_n vs μ; Cauchy mode shows non-convergence.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 240;
const PAD_L = 50, PAD_R = 16, PAD_T = 18, PAD_B = 30;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

const SOURCES = {
  fair_coin: { label: "férová mince (Bernoulli 0.5)", mu: 0.5, sample: (rng) => (rng() < 0.5 ? 0 : 1) },
  die:       { label: "kostka (U{1..6})", mu: 3.5, sample: (rng) => 1 + Math.floor(rng() * 6) },
  normal:    { label: "N(0, 1)", mu: 0, sample: (rng) => S.sampleNormal(rng, 0, 1) },
  exp:       { label: "Exp(1)", mu: 1, sample: (rng) => S.sampleExp(rng, 1) },
  cauchy:    { label: "Cauchy — bez μ, nekonverguje", mu: NaN, sample: (rng) => Math.tan(Math.PI * (rng() - 0.5)) },
};

export default function LawOfLargeNumbers() {
  const [src, setSrc] = useState("die");
  const [seed, setSeed] = useState(7);
  const [N, setN] = useState(1000);

  const m = SOURCES[src];

  const running = useMemo(() => {
    const rng = S.mulberry32(seed * 17 + 1);
    const out = new Float64Array(N);
    let sum = 0;
    for (let i = 0; i < N; i++) {
      sum += m.sample(rng);
      out[i] = sum / (i + 1);
    }
    return out;
  }, [src, seed, N]);

  let yMin, yMax;
  if (src === "cauchy") {
    let a = Infinity, b = -Infinity;
    for (let i = 0; i < N; i++) { if (running[i] < a) a = running[i]; if (running[i] > b) b = running[i]; }
    const span = (b - a) || 1;
    yMin = a - span * 0.1; yMax = b + span * 0.1;
  } else {
    yMin = m.mu - 1.5; yMax = m.mu + 1.5;
    if (src === "die") { yMin = 1; yMax = 6; }
    if (src === "fair_coin") { yMin = 0; yMax = 1; }
    if (src === "exp") { yMin = 0; yMax = 3; }
  }

  const toX = (i) => PAD_L + (i / (N - 1)) * PW;
  const toY = (v) => PAD_T + PH - ((v - yMin) / (yMax - yMin)) * PH;

  const pathRunning = Array.from({ length: N }, (_, i) => `${i ? "L" : "M"} ${toX(i).toFixed(2)} ${toY(running[i]).toFixed(2)}`).join(" ");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="viz-controls">
        {Object.entries(SOURCES).map(([k, v]) => (
          <button key={k} className="viz-btn" data-active={src === k} onClick={() => setSrc(k)}>{v.label}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* μ reference line */}
        {!isNaN(m.mu) && m.mu >= yMin && m.mu <= yMax && (
          <line x1={PAD_L} y1={toY(m.mu)} x2={PAD_L + PW} y2={toY(m.mu)} stroke="var(--accent-line)" strokeDasharray="3 3" />
        )}

        {/* Running average */}
        <path d={pathRunning} fill="none" stroke="var(--accent)" strokeWidth="1.5" />

        {/* μ label — drawn after the curve, at the calm right edge where it has converged */}
        {!isNaN(m.mu) && m.mu >= yMin && m.mu <= yMax && (
          <text x={PAD_L + PW - 4} y={toY(m.mu) - 4} fontSize="10" textAnchor="end" fill="var(--accent-line)" fontFamily="var(--font-mono)">μ = {m.mu}</text>
        )}

        {/* y ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const v = yMin + t * (yMax - yMin);
          return (
            <g key={i}>
              <line x1={PAD_L - 3} y1={toY(v)} x2={PAD_L} y2={toY(v)} stroke="var(--line-strong)" />
              <text x={PAD_L - 6} y={toY(v) + 3} fontSize="9.5" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v.toFixed(2)}</text>
            </g>
          );
        })}

        <text x={PAD_L + PW} y={H - 6} fontSize="10" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">n →</text>
        <text x={PAD_L} y={PAD_T - 4} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">X̄_n = (1/n) Σ Xᵢ</text>
      </svg>

      <div className="viz-controls">
        <label style={lab()}>n = {N}
          <input type="range" className="viz-slider" min={50} max={5000} step={50} value={N} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <button className="viz-btn" onClick={() => setSeed(seed + 1)}>nový seed ({seed})</button>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        Slabý zákon velkých čísel: X̄_n → μ v pravděpodobnosti. Konvergence rychlostí σ/√n.
        {src === "cauchy" && " Cauchy nemá konečný σ², LLN selhává — průměr i pro n=5000 stále skáče."}
      </div>
    </div>
  );
}

function lab() { return { flex: "1 1 200px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
