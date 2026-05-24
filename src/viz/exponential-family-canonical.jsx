// Show how a distribution decomposes into the EF canonical form h(x)·exp(η·T(x) − A(η)).
import { useState } from "react";

const FAMILIES = {
  bernoulli: {
    label: "Bernoulli(p)",
    pmf: "p^x (1−p)^(1−x)",
    T: "T(x) = x",
    eta: "η(p) = log(p/(1−p))  ← logit",
    A: "A(η) = log(1+e^η)",
    h: "h(x) = 1",
    note: "Přirozený parametr η je log-odds — proč logistická regrese modeluje η = β'x.",
  },
  poisson: {
    label: "Poisson(λ)",
    pmf: "e^(−λ) λ^x / x!",
    T: "T(x) = x",
    eta: "η(λ) = log λ",
    A: "A(η) = e^η",
    h: "h(x) = 1/x!",
    note: "Log-link v Poissonově regresi.",
  },
  normal: {
    label: "N(μ, σ²)",
    pmf: "(2πσ²)^(−1/2) exp(−(x−μ)²/2σ²)",
    T: "T(x) = (x, x²)",
    eta: "η = (μ/σ², −1/(2σ²))",
    A: "A(η) = μ²/(2σ²) + (1/2) log σ²",
    h: "h(x) = (2π)^(−1/2)",
    note: "Dvourozměrná postačující statistika (Σxᵢ, Σxᵢ²) — proto stačí dva momenty.",
  },
  exponential: {
    label: "Exp(λ)",
    pmf: "λ e^(−λx)",
    T: "T(x) = x",
    eta: "η(λ) = −λ",
    A: "A(η) = −log(−η)",
    h: "h(x) = 1",
    note: "η musí být &lt; 0; uzavřená forma posterioru s Gamma priorem.",
  },
  gamma: {
    label: "Γ(k, θ) — reparam.",
    pmf: "x^(k−1) e^(−x/θ) / (Γ(k) θ^k)",
    T: "T(x) = (log x, x)",
    eta: "η = (k − 1, −1/θ)",
    A: "A(η) = log Γ(η₁+1) − (η₁+1) log(−η₂)",
    h: "h(x) = 1",
    note: "Dvouparametrová exponenciální rodina — sufficient statistic (Σlog xᵢ, Σxᵢ).",
  },
};

export default function ExponentialFamilyCanonical() {
  const [fam, setFam] = useState("bernoulli");
  const F = FAMILIES[fam];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(FAMILIES).map(([k, f]) => (
          <button key={k} onClick={() => setFam(k)} style={btn(fam === k)}>{f.label}</button>
        ))}
      </div>

      <div style={{ background: "var(--bg-card)", padding: 16, borderRadius: 4, fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.7 }}>
        <div style={{ color: "var(--text-muted)", marginBottom: 8 }}>původní PDF/PMF:</div>
        <div style={{ marginBottom: 12, color: "var(--text)" }}>f(x; θ) = {F.pmf}</div>

        <div style={{ color: "var(--text-muted)", marginBottom: 8 }}>kanonická forma f(x) = h(x) · exp(η·T(x) − A(η)):</div>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "6px 14px", color: "var(--text)" }}>
          <span style={{ color: "var(--accent)" }}>T(x)</span><span>{F.T}</span>
          <span style={{ color: "var(--accent)" }}>η(θ)</span><span>{F.eta}</span>
          <span style={{ color: "var(--accent)" }}>A(η)</span><span>{F.A}</span>
          <span style={{ color: "var(--accent)" }}>h(x)</span><span>{F.h}</span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text)", fontFamily: "var(--font-mono)" }}>
        <strong>Důsledky pro EF:</strong>
      </div>
      <ul style={{ margin: "0 0 0 18px", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.6 }}>
        <li>Σ T(Xᵢ) je společně postačující statistika dimenze parametru.</li>
        <li>A(η) je konvexní → log-likelihood má jediné maximum (MLE jednoznačné).</li>
        <li>E[T(X)] = ∂A/∂η · Var(T(X)) = ∂²A/∂η² → snadné momenty.</li>
        <li>Existuje konjugovaný prior tvaru exp(α·η − β·A(η)).</li>
        <li>Fisherova informace J(η) = ∂²A/∂η∂η^T = Cov(T(X)).</li>
      </ul>
      <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", fontFamily: "var(--font-mono)" }}>
        {F.note}
      </div>
    </div>
  );
}

function btn(active) { return { padding: "3px 9px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
