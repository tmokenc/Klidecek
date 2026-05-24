// Activation functions and derivatives — overlay sigmoid / tanh / ReLU / LeakyReLU / GELU.
import { useState } from "react";

const ACTS = {
  "sigmoid": {
    label: "sigmoid",
    color: "oklch(0.65 0.2 280)",
    f: (z) => 1 / (1 + Math.exp(-z)),
    df: (z) => { const s = 1 / (1 + Math.exp(-z)); return s * (1 - s); },
  },
  "tanh": {
    label: "tanh",
    color: "oklch(0.7 0.18 145)",
    f: (z) => Math.tanh(z),
    df: (z) => 1 - Math.tanh(z) ** 2,
  },
  "relu": {
    label: "ReLU",
    color: "oklch(0.7 0.18 30)",
    f: (z) => Math.max(0, z),
    df: (z) => z > 0 ? 1 : 0,
  },
  "leaky": {
    label: "LeakyReLU",
    color: "oklch(0.65 0.18 60)",
    f: (z) => z > 0 ? z : 0.1 * z,
    df: (z) => z > 0 ? 1 : 0.1,
  },
  "gelu": {
    label: "GELU",
    color: "oklch(0.6 0.2 220)",
    f: (z) => 0.5 * z * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (z + 0.044715 * z * z * z))),
    df: (z) => {
      const c = Math.sqrt(2 / Math.PI);
      const t = c * (z + 0.044715 * z * z * z);
      const sech2 = 1 - Math.tanh(t) ** 2;
      const dt = c * (1 + 3 * 0.044715 * z * z);
      return 0.5 * (1 + Math.tanh(t)) + 0.5 * z * sech2 * dt;
    },
  },
};

const W = 540, H = 260;
const PAD_L = 50, PAD_R = 20, PAD_T = 20, PAD_B = 30;
const ZMIN = -5, ZMAX = 5, YMIN = -2, YMAX = 2;
const PLOT_W = W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const zToPx = (z) => PAD_L + ((z - ZMIN) / (ZMAX - ZMIN)) * PLOT_W;
const yToPx = (y) => PAD_T + (1 - (y - YMIN) / (YMAX - YMIN)) * PLOT_H;
const pxToZ = (px) => ZMIN + ((px - PAD_L) / PLOT_W) * (ZMAX - ZMIN);

export default function ActivationDerivatives() {
  const [active, setActive] = useState({ sigmoid: true, tanh: true, relu: true, leaky: false, gelu: false });
  const [showDeriv, setShowDeriv] = useState(true);
  const [hoverZ, setHoverZ] = useState(null);

  function curveFor(act) {
    const path = [];
    for (let i = 0; i <= 200; i++) {
      const z = ZMIN + (i / 200) * (ZMAX - ZMIN);
      path.push(`${i === 0 ? "M" : "L"}${zToPx(z).toFixed(1)} ${yToPx(act.f(z)).toFixed(1)}`);
    }
    return path.join(" ");
  }
  function derivCurveFor(act) {
    const path = [];
    for (let i = 0; i <= 200; i++) {
      const z = ZMIN + (i / 200) * (ZMAX - ZMIN);
      const y = act.df(z);
      path.push(`${i === 0 ? "M" : "L"}${zToPx(z).toFixed(1)} ${yToPx(y).toFixed(1)}`);
    }
    return path.join(" ");
  }

  function onMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    if (px >= PAD_L && px <= W - PAD_R) setHoverZ(pxToZ(px));
    else setHoverZ(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 11 }}>
        {Object.entries(ACTS).map(([k, a]) => (
          <label key={k} style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <input type="checkbox" checked={active[k]} onChange={(e) => setActive({ ...active, [k]: e.target.checked })}/>
            <span style={{ color: a.color, fontWeight: 600 }}>{a.label}</span>
          </label>
        ))}
        <label style={{ display: "flex", gap: 4, alignItems: "center", marginLeft: 8 }}>
          <input type="checkbox" checked={showDeriv} onChange={(e) => setShowDeriv(e.target.checked)}/>
          derivace (čárkovaně)
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} onMouseMove={onMove} onMouseLeave={() => setHoverZ(null)}
        style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* axes */}
        <g stroke="var(--line)" strokeWidth="0.6" fill="none">
          <line x1={PAD_L} y1={yToPx(0)} x2={W - PAD_R} y2={yToPx(0)}/>
          <line x1={zToPx(0)} y1={PAD_T} x2={zToPx(0)} y2={H - PAD_B}/>
        </g>
        <g fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          {[-4, -2, 0, 2, 4].map((z) => (
            <text key={`z${z}`} x={zToPx(z)} y={yToPx(0) + 12} textAnchor="middle">{z}</text>
          ))}
          {[-2, -1, 0, 1, 2].map((y) => (
            <text key={`y${y}`} x={zToPx(0) - 4} y={yToPx(y) + 3} textAnchor="end">{y}</text>
          ))}
          <text x={W - PAD_R} y={yToPx(0) + 22} textAnchor="end">z</text>
        </g>
        {/* hover */}
        {hoverZ !== null && (
          <line x1={zToPx(hoverZ)} y1={PAD_T} x2={zToPx(hoverZ)} y2={H - PAD_B} stroke="oklch(0.7 0.18 60)" strokeWidth="1" strokeDasharray="3 2"/>
        )}
        {/* activation curves */}
        {Object.entries(ACTS).map(([k, a]) => active[k] && (
          <g key={k}>
            <path d={curveFor(a)} stroke={a.color} strokeWidth="2" fill="none"/>
            {showDeriv && (
              <path d={derivCurveFor(a)} stroke={a.color} strokeWidth="1.4" strokeDasharray="5 3" fill="none" opacity="0.7"/>
            )}
            {hoverZ !== null && (
              <>
                <circle cx={zToPx(hoverZ)} cy={yToPx(a.f(hoverZ))} r="3" fill={a.color}/>
                {showDeriv && <circle cx={zToPx(hoverZ)} cy={yToPx(a.df(hoverZ))} r="3" fill={a.color} stroke="white" strokeWidth="0.8"/>}
              </>
            )}
          </g>
        ))}
      </svg>

      {hoverZ !== null && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 6, borderRadius: 3, fontSize: 11, fontFamily: "var(--font-mono)" }}>
          <span style={{ color: "var(--text-muted)" }}>z = {hoverZ.toFixed(2)}</span>
          {Object.entries(ACTS).map(([k, a]) => active[k] && (
            <span key={k} style={{ marginLeft: 14, color: a.color }}>
              {a.label}: f={a.f(hoverZ).toFixed(3)} f&apos;={a.df(hoverZ).toFixed(3)}
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Sigmoid &amp; tanh — saturují pro |z| velké → derivace → 0 → <strong>vanishing gradient</strong>.
        ReLU řeší tím, že pro z &gt; 0 je derivace = 1 (gradient projde čistý). Ale &quot;dead neurons&quot;: z &lt; 0 znamená f&apos; = 0 navždy.
        LeakyReLU dává f&apos; = 0.1 pro z &lt; 0. GELU = smooth ReLU (BERT, GPT default).
      </div>
    </div>
  );
}
