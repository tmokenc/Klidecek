// Sample space Venn — P(A), P(B), P(A∩B); compute union, conditional, independence.
import { useState } from "react";

const W = 540, H = 280;

export default function SampleSpaceEvents() {
  const [pA, setPA] = useState(0.45);
  const [pB, setPB] = useState(0.35);
  const [pAB, setPAB] = useState(0.15);

  // Clamp P(A∩B) ≤ min(P(A), P(B)) and ≥ max(0, P(A)+P(B)-1) — Fréchet bounds
  const maxAB = Math.min(pA, pB);
  const minAB = Math.max(0, pA + pB - 1);
  const ab = Math.min(maxAB, Math.max(minAB, pAB));

  const aOnly = pA - ab;
  const bOnly = pB - ab;
  const neither = 1 - pA - pB + ab;
  const union = pA + pB - ab;

  // Conditional probs
  const condAB = pB > 0 ? ab / pB : NaN;  // P(A|B)
  const condBA = pA > 0 ? ab / pA : NaN;  // P(B|A)

  // Independence check: P(A∩B) = P(A)·P(B)?
  const indepProduct = pA * pB;
  const indepGap = ab - indepProduct;

  // SVG geometry — circles overlap proportional to ab
  const cx1 = 180, cy = 130;
  const r1 = 70, r2 = 70;
  // Find overlap distance d s.t. lens-area / (π r²) ≈ ab when both circles equal area = pA, pB
  // Approximation: place circles at fixed distance, just visualize labels with computed probs.
  // For visual: scale circles by sqrt of area
  const ra = 25 + 45 * Math.sqrt(pA);
  const rb = 25 + 45 * Math.sqrt(pB);
  // Distance: lens overlap when d = ra + rb − 2 sqrt(overlap_factor)
  const lensFactor = ab / Math.max(0.01, Math.min(pA, pB));
  const overlap = (ra + rb) * 0.55 * lensFactor + 6;
  const cxA = 180, cxB = cxA + (ra + rb) - overlap;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* Sample space Ω */}
        <rect x="20" y="20" width={W - 40} height={H - 40} fill="var(--bg-inset)" stroke="var(--line)" strokeDasharray="4 3" />
        <text x={W - 30} y={36} fontSize="10.5" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">Ω · P(Ω) = 1</text>

        {/* Event A */}
        <circle cx={cxA} cy={cy} r={ra} fill="var(--accent)" opacity="0.32" stroke="var(--accent)" strokeWidth="1.5" />
        <text x={cxA - ra * 0.6} y={cy - ra * 0.4} fontSize="13" fill="var(--accent)" fontFamily="var(--font-mono)">A</text>

        {/* Event B */}
        <circle cx={cxB} cy={cy} r={rb} fill="var(--accent-line)" opacity="0.32" stroke="var(--accent-line)" strokeWidth="1.5" />
        <text x={cxB + rb * 0.6} y={cy - rb * 0.4} fontSize="13" fill="var(--accent-line)" fontFamily="var(--font-mono)">B</text>

        {/* Probability labels in regions */}
        <text x={cxA - ra * 0.4} y={cy + 5} fontSize="11" fill="var(--text)" fontFamily="var(--font-mono)" textAnchor="middle">{aOnly.toFixed(2)}</text>
        <text x={cxB + rb * 0.4} y={cy + 5} fontSize="11" fill="var(--text)" fontFamily="var(--font-mono)" textAnchor="middle">{bOnly.toFixed(2)}</text>
        <text x={(cxA + cxB) / 2} y={cy + 5} fontSize="11" fontWeight="600" fill="var(--text)" fontFamily="var(--font-mono)" textAnchor="middle">{ab.toFixed(2)}</text>
        <text x={W - 36} y={H - 30} fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)" textAnchor="end">{neither.toFixed(2)}</text>

        {/* Right side — derived quantities */}
        <g transform={`translate(${W - 180}, 60)`} fontSize="10.5" fontFamily="var(--font-mono)">
          <text x="0" y="0" fill="var(--text-muted)">P(A)</text>
          <text x="78" y="0" fill="var(--text)">{pA.toFixed(3)}</text>
          <text x="0" y="16" fill="var(--text-muted)">P(B)</text>
          <text x="78" y="16" fill="var(--text)">{pB.toFixed(3)}</text>
          <text x="0" y="32" fill="var(--text-muted)">P(A∩B)</text>
          <text x="78" y="32" fill="var(--text)">{ab.toFixed(3)}</text>
          <text x="0" y="48" fill="var(--text-muted)">P(A∪B)</text>
          <text x="78" y="48" fill="var(--text)">{union.toFixed(3)}</text>
          <text x="0" y="64" fill="var(--text-muted)">P(A|B)</text>
          <text x="78" y="64" fill="var(--text)">{isNaN(condAB) ? "—" : condAB.toFixed(3)}</text>
          <text x="0" y="80" fill="var(--text-muted)">P(B|A)</text>
          <text x="78" y="80" fill="var(--text)">{isNaN(condBA) ? "—" : condBA.toFixed(3)}</text>

          <line x1="0" y1="92" x2="120" y2="92" stroke="var(--line)" />
          <text x="0" y="106" fill="var(--text-muted)">P(A)·P(B)</text>
          <text x="78" y="106" fill="var(--text)">{indepProduct.toFixed(3)}</text>
          <text x="0" y="122" fill={Math.abs(indepGap) < 0.005 ? "var(--accent)" : "var(--accent-line)"} fontWeight="600">
            {Math.abs(indepGap) < 0.005 ? "nezávislé ✓" : "závislé"}
          </text>
        </g>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <label style={lab()}>P(A) = {pA.toFixed(2)}
          <input type="range" min={0.05} max={0.95} step={0.01} value={pA}
            onChange={(e) => { setPA(+e.target.value); setPAB(Math.min(ab, Math.min(+e.target.value, pB))); }} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>P(B) = {pB.toFixed(2)}
          <input type="range" min={0.05} max={0.95} step={0.01} value={pB}
            onChange={(e) => { setPB(+e.target.value); setPAB(Math.min(ab, Math.min(pA, +e.target.value))); }} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>P(A∩B) = {ab.toFixed(2)}
          <input type="range" min={minAB} max={maxAB} step={0.01} value={pAB}
            onChange={(e) => setPAB(+e.target.value)} style={{ width: "100%" }} />
        </label>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        Fréchetovy meze: max(0, P(A)+P(B)−1) ≤ P(A∩B) ≤ min(P(A), P(B)). Slider P(A∩B) je oříznutý do tohoto intervalu.
      </div>
    </div>
  );
}

function lab() {
  return { flex: "1 1 160px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" };
}
