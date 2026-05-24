// Interactive gallery of common distributions — pick family, drag parameters.
// Live PDF/PMF curve, E[X], Var(X), and family relationships.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 240;
const PAD_L = 40, PAD_R = 90, PAD_T = 20, PAD_B = 38;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

const FAMILIES = {
  bernoulli: { label: "Bernoulli A(p)", params: [{ name: "p", min: 0.01, max: 0.99, step: 0.01, init: 0.4 }], disc: true },
  binomial:  { label: "Binomial Bi(n,p)", params: [{ name: "n", min: 1, max: 40, step: 1, init: 20 }, { name: "p", min: 0.01, max: 0.99, step: 0.01, init: 0.3 }], disc: true },
  poisson:   { label: "Poisson Po(λ)", params: [{ name: "λ", min: 0.1, max: 30, step: 0.1, init: 4 }], disc: true },
  geometric: { label: "Geometric Ge(p)", params: [{ name: "p", min: 0.05, max: 0.95, step: 0.01, init: 0.3 }], disc: true },
  uniform:   { label: "Uniform U(a,b)", params: [{ name: "a", min: -5, max: 4, step: 0.1, init: 0 }, { name: "b", min: -4, max: 10, step: 0.1, init: 4 }], disc: false },
  exponential: { label: "Exp(λ)", params: [{ name: "λ", min: 0.1, max: 3, step: 0.05, init: 1 }], disc: false },
  normal:    { label: "Normal N(μ,σ²)", params: [{ name: "μ", min: -3, max: 3, step: 0.1, init: 0 }, { name: "σ", min: 0.2, max: 3, step: 0.05, init: 1 }], disc: false },
  gamma:     { label: "Gamma Γ(k,θ)", params: [{ name: "k", min: 0.5, max: 8, step: 0.1, init: 2 }, { name: "θ", min: 0.2, max: 4, step: 0.1, init: 1 }], disc: false },
};

function support(family, params) {
  switch (family) {
    case "bernoulli": return [0, 1];
    case "binomial":  return [0, Math.round(params.n)];
    case "poisson":   return [0, Math.max(10, Math.round(params.λ * 3 + 8))];
    case "geometric": return [1, Math.max(10, Math.round(8 / params.p))];
    case "uniform":   return [params.a - 1, params.b + 1];
    case "exponential": return [0, 6 / params.λ];
    case "normal":    return [params.μ - 4 * params.σ, params.μ + 4 * params.σ];
    case "gamma":     return [0, Math.max(8, params.k * params.θ * 4)];
    default: return [0, 10];
  }
}

function pdfPMF(family, x, params) {
  switch (family) {
    case "bernoulli": return x === 0 ? 1 - params.p : x === 1 ? params.p : 0;
    case "binomial":  return S.binomialPMF(Math.round(x), Math.round(params.n), params.p);
    case "poisson":   return S.poissonPMF(Math.round(x), params.λ);
    case "geometric": return x >= 1 ? Math.pow(1 - params.p, x - 1) * params.p : 0;
    case "uniform":   return x >= params.a && x <= params.b ? 1 / (params.b - params.a) : 0;
    case "exponential": return S.expPDF(x, params.λ);
    case "normal":    return S.normalPDF(x, params.μ, params.σ);
    case "gamma":     return S.gammaPDF(x, params.k, params.θ);
    default: return 0;
  }
}

function moments(family, params) {
  switch (family) {
    case "bernoulli": return { mean: params.p, variance: params.p * (1 - params.p) };
    case "binomial":  return { mean: params.n * params.p, variance: params.n * params.p * (1 - params.p) };
    case "poisson":   return { mean: params.λ, variance: params.λ };
    case "geometric": return { mean: 1 / params.p, variance: (1 - params.p) / (params.p * params.p) };
    case "uniform":   return { mean: (params.a + params.b) / 2, variance: Math.pow(params.b - params.a, 2) / 12 };
    case "exponential": return { mean: 1 / params.λ, variance: 1 / (params.λ * params.λ) };
    case "normal":    return { mean: params.μ, variance: params.σ * params.σ };
    case "gamma":     return { mean: params.k * params.θ, variance: params.k * params.θ * params.θ };
    default: return { mean: 0, variance: 0 };
  }
}

const RELATIONS = {
  binomial:  "Bi(n, p) → Po(np) když n→∞, p→0, np=konst",
  poisson:   "limita Bi(n,p) při velkém n a malém p",
  geometric: "diskrétní obdoba Exp; jediné s bezpaměťovostí",
  exponential: "spojitá obdoba Geom; bezpaměťovost; Γ(1,1/λ)",
  normal:    "CLT — limita X̄ pro libovolné rozdělení s konečným σ²",
  gamma:     "Γ(1,θ) = Exp(1/θ); Γ(n/2,2) = χ²(n)",
};

export default function DistributionGallery() {
  const [family, setFamily] = useState("normal");
  const [params, setParams] = useState({});

  const cur = FAMILIES[family];
  const vals = useMemo(() => {
    const v = {};
    for (const p of cur.params) v[p.name] = params[p.name] ?? p.init;
    return v;
  }, [family, params, cur]);

  const [xMin, xMax] = support(family, vals);
  const { mean, variance } = moments(family, vals);
  const sd = Math.sqrt(variance);

  // Build curve / bars
  const points = [];
  if (cur.disc) {
    for (let k = Math.floor(xMin); k <= Math.ceil(xMax); k++) {
      points.push({ x: k, y: pdfPMF(family, k, vals) });
    }
  } else {
    const N = 200;
    for (let i = 0; i <= N; i++) {
      const x = xMin + (i / N) * (xMax - xMin);
      points.push({ x, y: pdfPMF(family, x, vals) });
    }
  }
  const yMax = Math.max(0.01, ...points.map((p) => p.y)) * 1.15;
  const toX = (x) => PAD_L + ((x - xMin) / (xMax - xMin)) * PW;
  const toY = (y) => PAD_T + PH - (y / yMax) * PH;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {Object.entries(FAMILIES).map(([key, f]) => (
          <button
            key={key}
            onClick={() => { setFamily(key); setParams({}); }}
            style={{
              padding: "4px 10px", fontSize: 11,
              border: "1px solid " + (family === key ? "var(--accent)" : "var(--line)"),
              background: family === key ? "var(--accent-bg, var(--bg-inset))" : "var(--bg-card)",
              color: family === key ? "var(--accent)" : "var(--text)",
              borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)",
            }}
          >{f.label}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* x-axis ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const x = xMin + t * (xMax - xMin);
          return (
            <g key={i}>
              <line x1={toX(x)} y1={PAD_T + PH} x2={toX(x)} y2={PAD_T + PH + 4} stroke="var(--line-strong)" />
              <text x={toX(x)} y={PAD_T + PH + 14} fontSize="9.5" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">
                {cur.disc ? Math.round(x) : x.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Mean line */}
        {mean >= xMin && mean <= xMax && (
          <>
            <line x1={toX(mean)} y1={PAD_T} x2={toX(mean)} y2={PAD_T + PH} stroke="var(--accent-line)" strokeDasharray="3 3" strokeWidth="1" />
            <text x={toX(mean)} y={PAD_T - 4} textAnchor="middle" fontSize="10" fill="var(--accent-line)" fontFamily="var(--font-mono)">E[X]</text>
          </>
        )}

        {/* PDF / PMF */}
        {cur.disc ? (
          points.filter((p) => p.x >= xMin && p.x <= xMax).map((p, i) => (
            <line key={i} x1={toX(p.x)} y1={PAD_T + PH} x2={toX(p.x)} y2={toY(p.y)} stroke="var(--accent)" strokeWidth="2.4" />
          ))
        ) : (
          <path
            d={points.map((p, i) => `${i ? "L" : "M"} ${toX(p.x).toFixed(2)} ${toY(p.y).toFixed(2)}`).join(" ")}
            fill="none" stroke="var(--accent)" strokeWidth="2"
          />
        )}

        {/* μ±σ band for normal */}
        {family === "normal" && (
          <line x1={toX(mean - sd)} y1={PAD_T + PH - 6} x2={toX(mean + sd)} y2={PAD_T + PH - 6} stroke="var(--text-muted)" strokeWidth="3" opacity="0.4" />
        )}

        {/* Stats box */}
        <g transform={`translate(${W - PAD_R + 6}, ${PAD_T + 8})`} fontFamily="var(--font-mono)" fontSize="10.5">
          <text x="0" y="0" fill="var(--text-muted)">E[X]</text>
          <text x="0" y="14" fill="var(--text)">{mean.toFixed(3)}</text>
          <text x="0" y="32" fill="var(--text-muted)">Var(X)</text>
          <text x="0" y="46" fill="var(--text)">{variance.toFixed(3)}</text>
          <text x="0" y="64" fill="var(--text-muted)">σ</text>
          <text x="0" y="78" fill="var(--text)">{sd.toFixed(3)}</text>
        </g>
      </svg>

      {/* Param sliders */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {cur.params.map((p) => (
          <label key={p.name} style={{ display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", flex: "1 1 200px" }}>
            <span>{p.name} = {vals[p.name].toFixed(p.step < 1 ? 2 : 0)}</span>
            <input
              type="range" min={p.min} max={p.max} step={p.step}
              value={vals[p.name]}
              onChange={(e) => setParams({ ...params, [p.name]: +e.target.value })}
            />
          </label>
        ))}
      </div>

      {RELATIONS[family] && (
        <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontStyle: "italic" }}>
          {RELATIONS[family]}
        </div>
      )}
    </div>
  );
}
