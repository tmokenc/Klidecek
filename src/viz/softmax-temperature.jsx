// Softmax with temperature scaling — see how T affects distribution sharpness.
import { useState } from "react";

const VOCAB = [
  { token: "kočka",   logit: 4.2 },
  { token: "pes",     logit: 3.8 },
  { token: "auto",    logit: 2.1 },
  { token: "strom",   logit: 1.7 },
  { token: "běží",    logit: 1.0 },
  { token: "spí",     logit: 0.8 },
  { token: "Z",       logit: 0.2 },
  { token: ".",       logit: -0.5 },
  { token: "_unused", logit: -1.2 },
  { token: "????",    logit: -2.0 },
];

function softmax(logits, T) {
  const scaled = logits.map((l) => l / Math.max(T, 0.01));
  const m = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - m));
  const Z = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / Z);
}

function entropy(probs) {
  let h = 0;
  for (const p of probs) {
    if (p > 1e-12) h -= p * Math.log2(p);
  }
  return h;
}

export default function SoftmaxTemperature() {
  const [T, setT] = useState(1.0);

  const probs = softmax(VOCAB.map((v) => v.logit), T);
  const ent = entropy(probs);

  const sorted = VOCAB.map((v, i) => ({ ...v, p: probs[i] })).sort((a, b) => b.p - a.p);

  const W = 540, H = 280;
  const maxBar = Math.max(...probs, 0.001);

  const presets = [
    { T: 0.1, label: "T=0.1 (sharp)" },
    { T: 0.5, label: "T=0.5" },
    { T: 1.0, label: "T=1 (no scale)" },
    { T: 2.0, label: "T=2 (soft)" },
    { T: 10,  label: "T=10 (≈uniform)" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)" }}>
          T
          <input type="range" min={0.1} max={10} step={0.05} value={T} onChange={(e) => setT(+e.target.value)} style={{ width: 140 }}/>
          <span style={{ minWidth: 38 }}>{T.toFixed(2)}</span>
        </label>
        <div style={{ display: "flex", gap: 4 }}>
          {presets.map((p) => (
            <button key={p.T} onClick={() => setT(p.T)} style={btnStyle()}>{p.label}</button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {sorted.map((item, i) => {
          const y = 14 + i * 24;
          const barLen = (item.p / maxBar) * 320;
          return (
            <g key={item.token}>
              <text x={100} y={y + 11} textAnchor="end" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">
                {item.token}
              </text>
              <rect x={110} y={y} width={barLen} height={16}
                fill={i === 0 ? "oklch(0.7 0.18 60)" : "var(--accent)"}
                opacity={Math.min(1, 0.4 + item.p * 0.6)}/>
              <text x={120 + barLen + 4} y={y + 11} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                {(item.p * 100).toFixed(1)}% (logit={item.logit.toFixed(1)})
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 11, fontFamily: "var(--font-mono)" }}>
        <span style={{ color: "var(--text-muted)" }}>entropy H = <strong style={{ color: "var(--text)" }}>{ent.toFixed(2)}</strong> bit</span>
        <span style={{ color: "var(--text-muted)" }}>top-1 p = {(sorted[0].p * 100).toFixed(1)}%</span>
        <span style={{ color: "var(--text-muted)" }}>max H (uniform 10) = {Math.log2(10).toFixed(2)}</span>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Softmax(z; T) = exp(z/T) / Σ exp(z/T). T → 0: distribuce *kolapsuje* na argmax (deterministické generování).
        T → ∞: konverguje k *uniformní* distribuci. T = 1 = standardní softmax. Generování textu: T = 0.7 vyvážený, T = 0
        (= argmax) deterministic, T = 1.5+ kreativní/divoký.
      </div>
    </div>
  );
}

function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 8px", borderRadius: 3, fontSize: 10.5, cursor: "pointer" };
}
