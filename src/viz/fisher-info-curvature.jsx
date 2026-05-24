// Fisher information visualization — curvature of log-likelihood vs precision of MLE.
// For Normal N(μ, σ²): J(μ) = 1/σ². For Exp(λ): J(λ) = 1/λ². For Bernoulli(p): J(p) = 1/(p(1-p)).
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 280;
const PAD_L = 40, PAD_R = 14, PAD_T = 18, PAD_B = 38;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

const MODELS = {
  normal: {
    label: "N(μ, σ²) — odhad μ",
    paramName: "μ",
    fixedName: "σ",
    fixedMin: 0.3, fixedMax: 3, fixedInit: 1,
    paramTrue: 0,
    paramRange: [-3, 3],
    loglik: (mu, sigma, data) => {
      let s = 0;
      for (const x of data) s += -0.5 * Math.log(2 * Math.PI * sigma * sigma) - 0.5 * ((x - mu) / sigma) ** 2;
      return s;
    },
    fisher: (mu, sigma) => 1 / (sigma * sigma),
    sample: (rng, n, sigma) => Array.from({ length: n }, () => S.sampleNormal(rng, 0, sigma)),
  },
  exp: {
    label: "Exp(λ) — odhad λ",
    paramName: "λ",
    fixedName: "n",
    fixedMin: 1, fixedMax: 100, fixedInit: 20,
    paramTrue: 1,
    paramRange: [0.05, 3],
    loglik: (lam, _, data) => {
      if (lam <= 0) return -Infinity;
      return data.length * Math.log(lam) - lam * data.reduce((a, b) => a + b, 0);
    },
    fisher: (lam, _) => 1 / (lam * lam),
    sample: (rng, n) => Array.from({ length: n }, () => S.sampleExp(rng, 1)),
  },
  bernoulli: {
    label: "Bernoulli(p) — odhad p",
    paramName: "p",
    fixedName: "p_true",
    fixedMin: 0.05, fixedMax: 0.95, fixedInit: 0.5,
    paramTrue: 0.5,
    paramRange: [0.01, 0.99],
    loglik: (p, _, data) => {
      if (p <= 0 || p >= 1) return -Infinity;
      const k = data.reduce((a, b) => a + b, 0);
      return k * Math.log(p) + (data.length - k) * Math.log(1 - p);
    },
    fisher: (p, _) => 1 / (p * (1 - p)),
    sample: (rng, n, ptrue) => Array.from({ length: n }, () => (rng() < ptrue ? 1 : 0)),
  },
};

export default function FisherInfoCurvature() {
  const [model, setModel] = useState("normal");
  const [n, setN] = useState(15);
  const [fixed, setFixed] = useState(MODELS.normal.fixedInit);
  const [seed, setSeed] = useState(0);

  const m = MODELS[model];

  // Generate a sample
  const data = useMemo(() => {
    const rng = S.mulberry32(seed * 1009 + 1);
    if (model === "bernoulli") return m.sample(rng, n, fixed);
    if (model === "normal") return m.sample(rng, n, fixed);
    return m.sample(rng, n);
  }, [model, n, fixed, seed]);

  const [pMin, pMax] = m.paramRange;
  const NCURVE = 160;
  const ll = [];
  for (let i = 0; i <= NCURVE; i++) {
    const t = pMin + (i / NCURVE) * (pMax - pMin);
    ll.push([t, m.loglik(t, fixed, data)]);
  }
  const valid = ll.filter(([, y]) => isFinite(y));
  const yMax = Math.max(...valid.map(([, y]) => y));
  const yMin = Math.min(...valid.map(([, y]) => y));
  const yRange = (yMax - yMin) || 1;

  const toX = (t) => PAD_L + ((t - pMin) / (pMax - pMin)) * PW;
  const toY = (y) => PAD_T + PH - ((y - yMin) / yRange) * PH;

  // Theoretical Fisher information at true θ
  const J_one = m.fisher(m.paramTrue, fixed);
  const J_n = n * J_one;
  const seTheo = 1 / Math.sqrt(J_n);  // CRLB → asymptotic s.e. of MLE

  // Compute observed quadratic approx around θ_true using second derivative at θ_true
  // Quadratic approx: ℓ(θ) ≈ ℓ(θ*) − (n J(θ*)/2) (θ−θ*)²
  const llStar = m.loglik(m.paramTrue, fixed, data);

  const quadPts = [];
  for (let i = 0; i <= NCURVE; i++) {
    const t = pMin + (i / NCURVE) * (pMax - pMin);
    const q = llStar - (J_n / 2) * (t - m.paramTrue) ** 2;
    quadPts.push([t, q]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(MODELS).map(([k, mo]) => (
          <button key={k} onClick={() => { setModel(k); setFixed(mo.fixedInit); }}
            style={btn(model === k)}>{mo.label}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* quadratic approximation */}
        <path d={quadPts.filter(([, y]) => y >= yMin).map(([t, y], i) => `${i ? "L" : "M"} ${toX(t).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ")}
          fill="none" stroke="var(--accent-line)" strokeWidth="1.5" strokeDasharray="4 3" />

        {/* log-likelihood */}
        <path d={valid.map(([t, y], i) => `${i ? "L" : "M"} ${toX(t).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ")}
          fill="none" stroke="var(--accent)" strokeWidth="2.2" />

        {/* θ_true marker */}
        <line x1={toX(m.paramTrue)} y1={PAD_T} x2={toX(m.paramTrue)} y2={PAD_T + PH} stroke="var(--text)" strokeDasharray="3 3" opacity="0.5" />
        <text x={toX(m.paramTrue)} y={PAD_T + 12} textAnchor="middle" fontSize="10" fill="var(--text)" fontFamily="var(--font-mono)">{m.paramName}*={m.paramTrue}</text>

        {/* CRLB band — ±s.e. */}
        <line x1={toX(m.paramTrue - seTheo)} y1={PAD_T + PH - 6} x2={toX(m.paramTrue + seTheo)} y2={PAD_T + PH - 6} stroke="var(--accent-line)" strokeWidth="4" opacity="0.4" />

        {/* x ticks */}
        {[0, 0.5, 1].map((t, i) => {
          const v = pMin + t * (pMax - pMin);
          return <text key={i} x={toX(v)} y={PAD_T + PH + 14} fontSize="9.5" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v.toFixed(2)}</text>;
        })}
        <text x={W - 14} y={H - 16} fontSize="10" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">{m.paramName}</text>

        {/* legend */}
        <g transform={`translate(${PAD_L + 10}, ${PAD_T + 8})`} fontSize="10" fontFamily="var(--font-mono)">
          <line x1="0" y1="6" x2="14" y2="6" stroke="var(--accent)" strokeWidth="2.2" />
          <text x="18" y="9" fill="var(--text-muted)">ℓ({m.paramName})</text>
          <line x1="0" y1="22" x2="14" y2="22" stroke="var(--accent-line)" strokeDasharray="4 3" />
          <text x="18" y="25" fill="var(--text-muted)">kvadratická aproximace −(n·J/2)·({m.paramName}−{m.paramName}*)²</text>
        </g>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <label style={lab()}>n = {n}
          <input type="range" min={2} max={200} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>{m.fixedName} = {fixed.toFixed(2)}
          <input type="range" min={m.fixedMin} max={m.fixedMax} step={0.05} value={fixed}
            onChange={(e) => setFixed(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <button onClick={() => setSeed(seed + 1)} style={btn(false)}>nový vzorek</button>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        J({m.paramName}*) = <strong>{J_one.toFixed(3)}</strong> (na pozorování) · J<sub>n</sub> = n·J = <strong>{J_n.toFixed(2)}</strong> · CRLB: s.e.({m.paramName}̂) = 1/√(n·J) = <strong>{seTheo.toFixed(3)}</strong>
        <br />Zvyš n nebo sniž {m.fixedName} — vidíte, jak se ℓ zužuje a CRLB klesá. Asymptoticky MLE dosahuje této meze.
      </div>
    </div>
  );
}

function btn(active) {
  return { padding: "3px 9px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" };
}
function lab() {
  return { flex: "1 1 180px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" };
}
