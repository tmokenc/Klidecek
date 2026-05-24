// Rank test mechanics — merge X, Y; assign ranks; compute Mann-Whitney U.
import { useState } from "react";

const INIT_X = [3.2, 4.1, 5.5, 6.0, 7.3];
const INIT_Y = [2.8, 4.8, 5.9, 8.1, 9.4];

export default function RankTestMechanics() {
  const [X, setX] = useState(INIT_X);
  const [Y, setY] = useState(INIT_Y);

  // Merge with labels and assign ranks
  const merged = [...X.map((v) => ({ v, src: "X" })), ...Y.map((v) => ({ v, src: "Y" }))];
  merged.sort((a, b) => a.v - b.v);
  // Average ranks for ties (here unique, so just 1..N)
  merged.forEach((item, i) => { item.rank = i + 1; });

  const n1 = X.length, n2 = Y.length;
  const R1 = merged.filter((m) => m.src === "X").reduce((a, m) => a + m.rank, 0);
  const R2 = merged.filter((m) => m.src === "Y").reduce((a, m) => a + m.rank, 0);
  const U1 = R1 - (n1 * (n1 + 1)) / 2;
  const U2 = n1 * n2 - U1;
  const U = Math.min(U1, U2);

  // Asymptotic Z-test
  const meanU = (n1 * n2) / 2;
  const varU = (n1 * n2 * (n1 + n2 + 1)) / 12;
  const Z = (U - meanU) / Math.sqrt(varU);

  const W = 540, H = 280;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <text x={W / 2} y={20} textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">slučujeme oba vzorky, řadíme, přiřazujeme pořadí</text>

        {/* Merged table */}
        <g transform={`translate(40, 50)`} fontSize="11" fontFamily="var(--font-mono)">
          <text x="0" y="0" fill="var(--text-muted)">hodnota</text>
          <text x="80" y="0" fill="var(--text-muted)">vzorek</text>
          <text x="160" y="0" fill="var(--text-muted)">pořadí R</text>
          {merged.map((m, i) => (
            <g key={i}>
              <text x="0" y={16 + i * 16} fill="var(--text)">{m.v.toFixed(2)}</text>
              <text x="80" y={16 + i * 16} fill={m.src === "X" ? "var(--accent)" : "var(--accent-line)"}>{m.src}</text>
              <text x="160" y={16 + i * 16} fill="var(--text)">{m.rank}</text>
            </g>
          ))}
        </g>

        {/* Computation */}
        <g transform={`translate(260, 50)`} fontSize="11.5" fontFamily="var(--font-mono)">
          <text x="0" y="0" fill="var(--text-muted)">výpočet</text>
          <text x="0" y="22" fill="var(--accent)">R₁ = Σ ranks(X) = {R1}</text>
          <text x="0" y="40" fill="var(--accent-line)">R₂ = Σ ranks(Y) = {R2}</text>
          <text x="0" y="62" fill="var(--text)">U₁ = R₁ − n₁(n₁+1)/2 = {R1} − {(n1*(n1+1))/2} = {U1}</text>
          <text x="0" y="80" fill="var(--text)">U₂ = n₁·n₂ − U₁ = {n1 * n2} − {U1} = {U2}</text>
          <text x="0" y="98" fill="var(--text)">U = min(U₁, U₂) = <tspan fill="var(--accent)" fontWeight="600">{U}</tspan></text>
          <text x="0" y="124" fill="var(--text-muted)">pod H₀:</text>
          <text x="0" y="142" fill="var(--text)">E[U] = n₁·n₂/2 = {meanU}</text>
          <text x="0" y="160" fill="var(--text)">Var(U) = n₁·n₂(n₁+n₂+1)/12 = {varU.toFixed(2)}</text>
          <text x="0" y="182" fill="var(--text)">Z = (U − E[U])/√Var = <tspan fill="var(--accent)" fontWeight="600">{Z.toFixed(3)}</tspan></text>
        </g>
      </svg>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        Pořadí *nezávisí* na konkrétním rozdělení — tato robustnost je jádro neparametrických testů. U-statistika rozhoduje, zda jeden vzorek systematicky předbíhá druhý.
      </div>
    </div>
  );
}
