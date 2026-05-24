// Deep MLP — gradient magnitude through layers; sigmoid vs ReLU vs ReLU+BN.
import { useState, useMemo } from "react";

function rngFactory(seed) {
  let s = seed;
  return () => {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ACTS = {
  "sigmoid": {
    label: "sigmoid",
    color: "oklch(0.65 0.2 280)",
    f: (z) => 1 / (1 + Math.exp(-z)),
    df_from_a: (a) => a * (1 - a),
  },
  "tanh": {
    label: "tanh",
    color: "oklch(0.7 0.18 145)",
    f: (z) => Math.tanh(z),
    df_from_a: (a) => 1 - a * a,
  },
  "relu": {
    label: "ReLU",
    color: "oklch(0.7 0.18 30)",
    f: (z) => Math.max(0, z),
    df_from_a: (a) => a > 0 ? 1 : 0,
  },
  "relu-bn": {
    label: "ReLU + BatchNorm",
    color: "oklch(0.6 0.2 220)",
    f: (z) => Math.max(0, z),
    df_from_a: (a) => a > 0 ? 1 : 0,
    useBN: true,
  },
};

// Simulate forward + backward pass through deep MLP.
// Single scalar per layer for simplicity (representative magnitude).
function simulateMLP(depth, actKey, initScale, seed) {
  const rng = rngFactory(seed);
  const act = ACTS[actKey];
  const weights = [];
  for (let l = 0; l < depth; l++) {
    weights.push((rng() - 0.5) * 2 * initScale);
  }
  // Forward
  const acts = [];
  const preActs = [];
  let a = 1.0;
  for (let l = 0; l < depth; l++) {
    let z = weights[l] * a;
    if (act.useBN) {
      // BN normalizes pre-activation toward unit variance (toy)
      z = Math.tanh(z) * 1.5; // approximate effect: bound z
    }
    preActs.push(z);
    a = act.f(z);
    acts.push(a);
  }
  // Backward: gradient magnitude per layer
  const gradMag = new Array(depth);
  // start from output, ∂L/∂a_L = 1
  let g = 1.0;
  gradMag[depth - 1] = Math.abs(g);
  for (let l = depth - 1; l >= 1; l--) {
    // ∂a_l/∂a_(l-1) = act'(z_l) · w_l  (using a_l for activation-based deriv)
    g = g * act.df_from_a(acts[l]) * weights[l];
    if (Math.abs(g) > 1e20) g = Math.sign(g) * 1e20;
    if (Math.abs(g) < 1e-20) g = Math.sign(g) * 1e-20;
    gradMag[l - 1] = Math.abs(g);
  }
  return { gradMag, weights };
}

export default function VanishingGradientDepth() {
  const [depth, setDepth] = useState(20);
  const [active, setActive] = useState({ sigmoid: true, tanh: true, relu: true, "relu-bn": false });
  const [initScale, setInitScale] = useState(0.5);
  const [seed, setSeed] = useState(42);

  const traces = useMemo(() => {
    const out = {};
    for (const k of Object.keys(ACTS)) {
      if (active[k]) out[k] = simulateMLP(depth, k, initScale, seed);
    }
    return out;
  }, [depth, active, initScale, seed]);

  const W = 540, H = 280;
  const PAD = 50;
  const PLOT_W = W - PAD * 2;
  const PLOT_H = H - 60;

  // Log scale Y: gradient magnitude over 30+ orders of magnitude is normal
  const allGrads = Object.values(traces).flatMap((t) => t.gradMag);
  const logMax = Math.max(...allGrads.map((g) => Math.log10(g + 1e-30)));
  const logMin = Math.min(...allGrads.map((g) => Math.log10(g + 1e-30)));
  const logRange = logMax - logMin + 0.5;

  function lToPx(l) { return PAD + (l / (depth - 1)) * PLOT_W; }
  function gToPx(g) {
    const lg = Math.log10(g + 1e-30);
    return 30 + (1 - (lg - logMin) / logRange) * PLOT_H;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          hloubka L:
          <input type="range" min={5} max={60} value={depth} onChange={(e) => setDepth(+e.target.value)} style={{ width: 100 }}/>
          <span style={{ minWidth: 22 }}>{depth}</span>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          init scale σ:
          <input type="range" min={0.1} max={2} step={0.05} value={initScale} onChange={(e) => setInitScale(+e.target.value)} style={{ width: 80 }}/>
          <span style={{ minWidth: 28 }}>{initScale.toFixed(2)}</span>
        </label>
        <button onClick={() => setSeed(seed + 1)} style={btnStyle()}>nový seed</button>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 11 }}>
        {Object.entries(ACTS).map(([k, a]) => (
          <label key={k} style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <input type="checkbox" checked={active[k]} onChange={(e) => setActive({ ...active, [k]: e.target.checked })}/>
            <span style={{ color: a.color, fontWeight: 600 }}>{a.label}</span>
          </label>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* axes */}
        <g stroke="var(--line)" strokeWidth="0.5" fill="none">
          <line x1={PAD} y1={30} x2={PAD} y2={H - 30}/>
          <line x1={PAD} y1={H - 30} x2={W - PAD} y2={H - 30}/>
        </g>
        {/* y-axis log labels */}
        <g fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          {[-20, -15, -10, -5, 0].map((lg) => {
            const py = gToPx(Math.pow(10, lg));
            if (py < 25 || py > H - 25) return null;
            return (
              <g key={lg}>
                <text x={PAD - 4} y={py + 3} textAnchor="end">10^{lg}</text>
                <line x1={PAD} y1={py} x2={W - PAD} y2={py} stroke="var(--line)" strokeOpacity="0.2"/>
              </g>
            );
          })}
        </g>
        {/* x labels */}
        {[1, Math.floor(depth / 4), Math.floor(depth / 2), Math.floor(3 * depth / 4), depth].map((l, i) => (
          <text key={i} x={lToPx(l - 1)} y={H - 14} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
            {l}
          </text>
        ))}
        <text x={W / 2} y={H - 2} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">layer (od input)</text>

        {/* curves */}
        {Object.entries(traces).map(([k, t]) => {
          const path = t.gradMag.map((g, l) => `${l === 0 ? "M" : "L"}${lToPx(l).toFixed(1)} ${gToPx(g).toFixed(1)}`).join(" ");
          return (
            <g key={k}>
              <path d={path} stroke={ACTS[k].color} strokeWidth="2" fill="none"/>
              {t.gradMag.map((g, l) => (
                <circle key={l} cx={lToPx(l)} cy={gToPx(g)} r="2" fill={ACTS[k].color}/>
              ))}
            </g>
          );
        })}
      </svg>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 6, borderRadius: 3, fontSize: 11, fontFamily: "var(--font-mono)" }}>
        <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", marginBottom: 2 }}>gradient na vstupní vrstvě (∂L/∂a₁)</div>
        {Object.entries(traces).map(([k, t]) => (
          <div key={k} style={{ color: ACTS[k].color }}>
            {ACTS[k].label}: {t.gradMag[0].toExponential(2)}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Y-osa <strong>log10</strong> gradientu. Sigmoid/tanh: maximální derivace σ&apos; = 0.25 (resp. tanh&apos; = 1 v 0), takže gradient
        násoben menším čísly přes hloubku → mizí. ReLU: σ&apos; = 1 pro z &gt; 0 (gradient projde čistě) — ale citlivé na inicializaci a dead neurons.
        BatchNorm/LayerNorm stabilizují pre-aktivace, snižují závislost na σ. (Bonus: skip connections jako v ResNet úplně obejít problém.)
      </div>
    </div>
  );
}

function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 8px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
