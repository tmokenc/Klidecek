// RNN unrolled through time — show forward hidden states + backward gradient with vanishing/exploding modes.
import { useState } from "react";

const T = 8; // time steps

// Three regimes for the recurrent weight w_hh (scalar simplification)
const REGIMES = {
  "vanish": { label: "vanishing (|w| < 1)", w: 0.7 },
  "stable": { label: "stabilní (|w| ≈ 1)", w: 1.0 },
  "explode":{ label: "exploding (|w| > 1)", w: 1.4 },
};

const NLS = {
  "sigmoid": { label: "sigmoid", f: (z) => 1 / (1 + Math.exp(-z)), df: (a) => a * (1 - a) },
  "tanh":    { label: "tanh",    f: (z) => Math.tanh(z),           df: (a) => 1 - a * a },
  "linear":  { label: "linear",  f: (z) => z,                       df: () => 1 },
};

export default function RnnUnrollBptt() {
  const [regimeKey, setRegimeKey] = useState("vanish");
  const [nlKey, setNlKey] = useState("tanh");
  const [showBackward, setShowBackward] = useState(false);

  const w_hh = REGIMES[regimeKey].w;
  const w_xh = 0.5;
  const nl = NLS[nlKey];

  // Inputs: simple impulse at t=0
  const xs = [1.0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];

  // Forward pass
  let h = 0;
  const hs = [];
  const zs = [];
  for (let t = 0; t < T; t++) {
    const z = w_xh * xs[t] + w_hh * h;
    zs.push(z);
    h = nl.f(z);
    hs.push(h);
  }

  // Backward pass: gradient at t = T-1, propagated back.
  // dh_t / dh_(t-1) = nl.df(h_t) · w_hh
  // gradient flowing through time: g_t = ∏ (nl.df(h_i) · w_hh) for i in [t+1..T-1]
  const gradients = Array(T).fill(1);
  gradients[T - 1] = 1; // start
  for (let t = T - 2; t >= 0; t--) {
    gradients[t] = gradients[t + 1] * nl.df(hs[t + 1]) * w_hh;
  }

  const W = 540, H = 280;
  const stepX = (W - 80) / (T - 1);

  // Bar heights for hidden states
  const hAbsMax = Math.max(...hs.map(Math.abs), 0.001);
  const gAbsMax = Math.max(...gradients.map(Math.abs), 0.001);

  function hBarHeight(v) { return Math.min(60, Math.abs(v) / hAbsMax * 60); }
  function gBarHeight(v) {
    const ratio = Math.log10(Math.abs(v) + 1e-12) - Math.log10(1e-12);
    const t = ratio / (Math.log10(gAbsMax + 1e-12) - Math.log10(1e-12) + 1);
    return Math.min(60, Math.max(2, t * 60));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>režim:</span>
          <select value={regimeKey} onChange={(e) => setRegimeKey(e.target.value)}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 4px", borderRadius: 3 }}>
            {Object.entries(REGIMES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>aktivace:</span>
          <select value={nlKey} onChange={(e) => setNlKey(e.target.value)}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 4px", borderRadius: 3 }}>
            {Object.entries(NLS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input type="checkbox" checked={showBackward} onChange={(e) => setShowBackward(e.target.checked)} />
          BPTT backward
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* Recurrent edges */}
        {hs.map((_, t) => t > 0 && (
          <g key={`rec${t}`}>
            <line x1={40 + (t - 1) * stepX + 14} y1={100} x2={40 + t * stepX - 14} y2={100}
              stroke={showBackward ? "oklch(0.7 0.2 30)" : "var(--accent)"} strokeWidth={1.6}
              markerEnd={showBackward ? "url(#bw-arr)" : "url(#fw-arr)"}/>
            <text x={40 + (t - 0.5) * stepX} y={94} textAnchor="middle"
              fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
              w_hh={w_hh}
            </text>
          </g>
        ))}

        {/* Input arrows */}
        {xs.map((x, t) => (
          <g key={`in${t}`}>
            <line x1={40 + t * stepX} y1={150} x2={40 + t * stepX} y2={114}
              stroke="var(--text-muted)" strokeWidth="1.2" markerEnd="url(#fw-arr)"/>
            <text x={40 + t * stepX} y={166} textAnchor="middle"
              fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
              x={x.toFixed(2)}
            </text>
            <text x={40 + t * stepX} y={180} textAnchor="middle"
              fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">
              t={t}
            </text>
          </g>
        ))}

        {/* Hidden state nodes */}
        {hs.map((h, t) => (
          <g key={`h${t}`}>
            <circle cx={40 + t * stepX} cy={100} r="14"
              fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.4"/>
            <text x={40 + t * stepX} y={104} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text)">
              h_{t}
            </text>
            <text x={40 + t * stepX} y={80} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
              {h.toFixed(2)}
            </text>
          </g>
        ))}

        {/* Hidden state bars */}
        {hs.map((h, t) => (
          <g key={`hb${t}`}>
            <rect x={40 + t * stepX - 5} y={250 - hBarHeight(h)} width={10} height={hBarHeight(h)}
              fill={h >= 0 ? "var(--accent)" : "oklch(0.6 0.2 25)"}/>
          </g>
        ))}
        <line x1={20} y1={250} x2={W - 20} y2={250} stroke="var(--line)" strokeWidth="0.5"/>
        <text x={20} y={263} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">|h_t|</text>

        {/* Backward gradient bars */}
        {showBackward && gradients.map((g, t) => (
          <g key={`gb${t}`}>
            <rect x={40 + t * stepX + 8} y={250 - gBarHeight(g)} width={10} height={gBarHeight(g)}
              fill="oklch(0.7 0.2 30)" opacity="0.85"/>
            <text x={40 + t * stepX + 13} y={250 - gBarHeight(g) - 4} textAnchor="middle" fontSize="8"
              fontFamily="var(--font-mono)" fill="oklch(0.78 0.18 30)">
              {Math.abs(g) < 0.001 ? g.toExponential(1) : g.toFixed(3)}
            </text>
          </g>
        ))}

        <defs>
          <marker id="fw-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M 0 0 L 5 3 L 0 6 z" fill="var(--accent)"/>
          </marker>
          <marker id="bw-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M 0 0 L 5 3 L 0 6 z" fill="oklch(0.7 0.2 30)"/>
          </marker>
        </defs>
      </svg>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
        <span>|h_T| = {Math.abs(hs[T - 1]).toFixed(4)}</span>
        {showBackward && (
          <>
            <span style={{ color: "oklch(0.78 0.18 30)" }}>|∂L/∂h_0| ≈ {Math.abs(gradients[0]).toExponential(2)}</span>
            <span style={{ color: "oklch(0.78 0.18 30)" }}>poměr ∂h_T/∂h_0 přes {T - 1} kroků</span>
          </>
        )}
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Gradient skrz čas: <code>∂h_T/∂h_0 = ∏ σ&apos;(h_t) · w_hh</code>. Když |w_hh · σ&apos;| &lt; 1 →
        gradient *exponenciálně mizí* (vanishing); když &gt; 1 → exploduje. Proto vanilla RNN nezvládne dlouhé závislosti — LSTM a GRU
        zavádějí *brány*, které propustí gradient nezměněný.
      </div>
    </div>
  );
}
