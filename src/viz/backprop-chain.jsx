// Backpropagation through a small MLP — forward values + backward gradient walk per click.
import { useState } from "react";

// Architecture: 2 inputs → 2 hidden (sigmoid) → 1 output (linear) → squared loss with target.
// Visualize: forward pass values on each node, then user clicks "Step backward" to see chain rule unfold.

function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }

const NETS = {
  "simple": {
    label: "MLP 2-2-1",
    inputs: [0.5, 1.2],
    target: 1.0,
    W1: [[0.8, -0.4], [0.5, 0.9]], // [out × in]
    b1: [0.1, -0.2],
    W2: [[1.2, -0.6]],
    b2: [0.3],
  },
};

function forward(net) {
  const [x1, x2] = net.inputs;
  const z1 = [
    net.W1[0][0] * x1 + net.W1[0][1] * x2 + net.b1[0],
    net.W1[1][0] * x1 + net.W1[1][1] * x2 + net.b1[1],
  ];
  const a1 = z1.map(sigmoid);
  const z2 = net.W2[0][0] * a1[0] + net.W2[0][1] * a1[1] + net.b2[0];
  const yhat = z2; // linear output
  const err = yhat - net.target;
  const loss = 0.5 * err * err;
  return { x1, x2, z1, a1, z2, yhat, err, loss };
}

function backward(net, fwd) {
  // dL/dyhat = err
  const dL_dyhat = fwd.err;
  const dyhat_dz2 = 1;
  const dL_dz2 = dL_dyhat * dyhat_dz2;
  // dL/dW2 = dL/dz2 · a1
  const dL_dW2 = [dL_dz2 * fwd.a1[0], dL_dz2 * fwd.a1[1]];
  const dL_db2 = dL_dz2;
  // dL/da1 = dL/dz2 · W2
  const dL_da1 = [dL_dz2 * net.W2[0][0], dL_dz2 * net.W2[0][1]];
  // dL/dz1 = dL/da1 · sigmoid'(z1) = dL/da1 · a1 · (1 - a1)
  const dL_dz1 = [
    dL_da1[0] * fwd.a1[0] * (1 - fwd.a1[0]),
    dL_da1[1] * fwd.a1[1] * (1 - fwd.a1[1]),
  ];
  // dL/dW1 = dL/dz1 ⊗ x
  const dL_dW1 = [
    [dL_dz1[0] * fwd.x1, dL_dz1[0] * fwd.x2],
    [dL_dz1[1] * fwd.x1, dL_dz1[1] * fwd.x2],
  ];
  const dL_db1 = [...dL_dz1];

  return { dL_dyhat, dL_dz2, dL_dW2, dL_db2, dL_da1, dL_dz1, dL_dW1, dL_db1 };
}

const STEPS = [
  { id: "fwd",   label: "Forward: dopočítej yhat a Loss", reveals: { z1: true, a1: true, z2: true, yhat: true, loss: true } },
  { id: "dL",    label: "∂L/∂yhat = (yhat − t)" },
  { id: "dz2",   label: "∂L/∂z₂ = ∂L/∂yhat · ∂yhat/∂z₂ (= 1)" },
  { id: "dW2",   label: "∂L/∂W₂ = ∂L/∂z₂ · a₁" },
  { id: "db2",   label: "∂L/∂b₂ = ∂L/∂z₂" },
  { id: "da1",   label: "∂L/∂a₁ = ∂L/∂z₂ · W₂ᵀ" },
  { id: "dz1",   label: "∂L/∂z₁ = ∂L/∂a₁ · σ'(z₁) = ∂L/∂a₁ · a₁·(1−a₁)" },
  { id: "dW1",   label: "∂L/∂W₁ = ∂L/∂z₁ · xᵀ" },
  { id: "db1",   label: "∂L/∂b₁ = ∂L/∂z₁" },
];

export default function BackpropChain() {
  const [step, setStep] = useState(0);
  const net = NETS.simple;
  const fwd = forward(net);
  const bwd = backward(net, fwd);

  const W = 540, H = 280;
  const xPos = { x: 60, h: 220, y: 380 };
  const NODES = [
    { id: "x1", x: 60, y: 80, label: "x₁", val: fwd.x1.toFixed(2) },
    { id: "x2", x: 60, y: 200, label: "x₂", val: fwd.x2.toFixed(2) },
    { id: "z1_0", x: 200, y: 80, label: "z₁₁ → a₁₁", val: `${fwd.z1[0].toFixed(2)} → ${fwd.a1[0].toFixed(2)}` },
    { id: "z1_1", x: 200, y: 200, label: "z₁₂ → a₁₂", val: `${fwd.z1[1].toFixed(2)} → ${fwd.a1[1].toFixed(2)}` },
    { id: "z2",   x: 360, y: 140, label: "z₂ = yhat", val: fwd.z2.toFixed(2) },
    { id: "loss", x: 480, y: 140, label: "L (½ err²)", val: fwd.loss.toFixed(3) },
  ];
  const EDGES = [
    { from: "x1", to: "z1_0", w: net.W1[0][0], grad: bwd.dL_dW1[0][0] },
    { from: "x2", to: "z1_0", w: net.W1[0][1], grad: bwd.dL_dW1[0][1] },
    { from: "x1", to: "z1_1", w: net.W1[1][0], grad: bwd.dL_dW1[1][0] },
    { from: "x2", to: "z1_1", w: net.W1[1][1], grad: bwd.dL_dW1[1][1] },
    { from: "z1_0", to: "z2", w: net.W2[0][0], grad: bwd.dL_dW2[0] },
    { from: "z1_1", to: "z2", w: net.W2[0][1], grad: bwd.dL_dW2[1] },
    { from: "z2", to: "loss", w: 1, grad: bwd.dL_dyhat },
  ];

  // Highlighting: which gradients are "computed" up to this step
  const shown = STEPS.slice(0, step + 1).map((s) => s.id);
  const showGrad = (g) => shown.includes(g);

  function nodePos(id) { return NODES.find((n) => n.id === id); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 11 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setStep(0)} style={btnStyle()}>⏮</button>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} style={btnStyle()}>◀</button>
          <button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} style={btnStyle()}>▶</button>
          <button onClick={() => setStep(STEPS.length - 1)} style={btnStyle()}>⏭</button>
        </div>
        <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>krok {step}/{STEPS.length - 1}</span>
        <span style={{ color: "var(--text)", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{STEPS[step].label}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* edges */}
        {EDGES.map((e, i) => {
          const a = nodePos(e.from), b = nodePos(e.to);
          // gradient highlight: when this weight's gradient has been computed in current step
          const wasComputed = (
            (e.from === "x1" || e.from === "x2") && (e.to === "z1_0" || e.to === "z1_1") && showGrad("dW1")
          ) || (
            (e.from === "z1_0" || e.from === "z1_1") && e.to === "z2" && showGrad("dW2")
          ) || (
            e.from === "z2" && e.to === "loss" && showGrad("dL")
          );
          return (
            <g key={i}>
              <line x1={a.x + 26} y1={a.y} x2={b.x - 26} y2={b.y}
                stroke={wasComputed ? "oklch(0.7 0.2 30)" : "var(--line-strong)"}
                strokeWidth={wasComputed ? 2 : 1.2} opacity={wasComputed ? 1 : 0.6}/>
              <g>
                <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 6} textAnchor="middle"
                  fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                  w={e.w.toFixed(2)}
                </text>
                {wasComputed && (
                  <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 7} textAnchor="middle"
                    fontSize="9" fontFamily="var(--font-mono)" fill="oklch(0.78 0.18 30)" fontWeight="700">
                    ∂L/∂w={e.grad.toFixed(3)}
                  </text>
                )}
              </g>
            </g>
          );
        })}
        {/* nodes */}
        {NODES.map((n) => (
          <g key={n.id}>
            <ellipse cx={n.x} cy={n.y} rx="26" ry="20"
              fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1.4"/>
            <text x={n.x} y={n.y - 4} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
              {n.label}
            </text>
            <text x={n.x} y={n.y + 8} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)" fontWeight="600">
              {n.val}
            </text>
          </g>
        ))}
        {/* target */}
        <g>
          <rect x={420} y={210} width={120} height={50} fill="var(--bg-card)" stroke="oklch(0.65 0.18 145)" strokeWidth="1.4" rx="4"/>
          <text x={480} y={230} textAnchor="middle" fontSize="10" fill="var(--text-muted)">target t</text>
          <text x={480} y={246} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)" fontWeight="600">
            {net.target.toFixed(2)}
          </text>
          <text x={480} y={258} textAnchor="middle" fontSize="9" fill="var(--text-muted)" fontFamily="var(--font-mono)">
            err = {fwd.err.toFixed(3)}
          </text>
        </g>
      </svg>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 8, borderRadius: 4, fontSize: 11, fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
        <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", marginBottom: 4 }}>
          řetězové pravidlo (až do kroku {step})
        </div>
        {showGrad("dL") && <div>∂L/∂yhat = yhat − t = {fwd.yhat.toFixed(3)} − {net.target} = <strong>{bwd.dL_dyhat.toFixed(3)}</strong></div>}
        {showGrad("dz2") && <div>∂L/∂z₂ = ∂L/∂yhat · 1 = <strong>{bwd.dL_dz2.toFixed(3)}</strong></div>}
        {showGrad("dW2") && <div>∂L/∂W₂ = [{bwd.dL_dW2.map((g) => g.toFixed(3)).join(", ")}]</div>}
        {showGrad("db2") && <div>∂L/∂b₂ = {bwd.dL_db2.toFixed(3)}</div>}
        {showGrad("da1") && <div>∂L/∂a₁ = [{bwd.dL_da1.map((g) => g.toFixed(3)).join(", ")}]</div>}
        {showGrad("dz1") && <div>∂L/∂z₁ = [{bwd.dL_dz1.map((g) => g.toFixed(3)).join(", ")}]</div>}
        {showGrad("dW1") && <div>∂L/∂W₁ = [[{bwd.dL_dW1[0].map((g) => g.toFixed(3)).join(", ")}], [{bwd.dL_dW1[1].map((g) => g.toFixed(3)).join(", ")}]]</div>}
        {showGrad("db1") && <div>∂L/∂b₁ = [{bwd.dL_db1.map((g) => g.toFixed(3)).join(", ")}]</div>}
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Backprop = aplikace řetězového pravidla *zpětně*. Gradient `∂L/∂W` se počítá od loss směrem ke vstupům.
        Sigmoid derivace σ'(z) = a·(1−a) — proto vanishing gradient pro |z| velké (a → 0 nebo 1 → derivace ~ 0).
      </div>
    </div>
  );
}

function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
