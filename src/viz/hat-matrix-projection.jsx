// Hat matrix geometric interpretation: Ŷ = HY is projection onto col(X), residuals ⊥ col(X).
// 2D view of the geometry (since real R^n is unvisualizable).
import { useState } from "react";

const W = 540, H = 300;

export default function HatMatrixProjection() {
  const [px, setPx] = useState(0.6);  // length along col(X)
  const [perp, setPerp] = useState(0.4);  // residual length

  // Setup: col(X) is the diagonal line from (80, 220) to (440, 60)
  // Origin at (80, 220).
  const Ox = 80, Oy = 220;
  const Vx = 440 - Ox, Vy = 60 - Oy;  // col(X) direction
  const L = Math.sqrt(Vx * Vx + Vy * Vy);
  const ux = Vx / L, uy = Vy / L;       // unit along col(X)
  const nx = -uy, ny = ux;              // perpendicular unit

  // Ŷ = projection point
  const yhatLen = px * L;
  const yhatX = Ox + ux * yhatLen;
  const yhatY = Oy + uy * yhatLen;
  // Y = Ŷ + perp * ⊥
  const Yx = yhatX + nx * perp * 180;
  const Yy = yhatY + ny * perp * 180;

  // residual length
  const resLen = Math.abs(perp * 180);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <defs>
          <marker id="hatArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L 10 5 L 0 10 z" fill="var(--text-muted)" />
          </marker>
        </defs>

        {/* col(X) line */}
        <line x1={Ox} y1={Oy} x2={Ox + ux * (L + 30)} y2={Oy + uy * (L + 30)} stroke="var(--text-muted)" strokeDasharray="4 3" />
        <text x={Ox + ux * (L + 40)} y={Oy + uy * (L + 40)} fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-mono)">col(X)</text>

        {/* Origin */}
        <circle cx={Ox} cy={Oy} r="3" fill="var(--text)" />
        <text x={Ox - 8} y={Oy + 16} textAnchor="end" fontSize="11" fill="var(--text)" fontFamily="var(--font-mono)">0</text>

        {/* Y vector from origin */}
        <line x1={Ox} y1={Oy} x2={Yx} y2={Yy} stroke="var(--accent-line)" strokeWidth="2" markerEnd="url(#hatArr)" />
        <text x={Yx + 10} y={Yy + 5} fontSize="13" fill="var(--accent-line)" fontFamily="var(--font-mono)">Y</text>

        {/* Ŷ vector */}
        <line x1={Ox} y1={Oy} x2={yhatX} y2={yhatY} stroke="var(--accent)" strokeWidth="3" markerEnd="url(#hatArr)" />
        <text x={yhatX + 10 * uy} y={yhatY - 10 * ux + 5} fontSize="13" fill="var(--accent)" fontFamily="var(--font-mono)">Ŷ = HY</text>

        {/* Residual */}
        <line x1={yhatX} y1={yhatY} x2={Yx} y2={Yy} stroke="var(--text)" strokeWidth="2" markerEnd="url(#hatArr)" />
        <text x={(yhatX + Yx) / 2 + 12} y={(yhatY + Yy) / 2} fontSize="11" fill="var(--text)" fontFamily="var(--font-mono)">r = Y − Ŷ</text>

        {/* Right-angle marker */}
        <path d={`M ${yhatX - 8 * ux + 8 * nx * Math.sign(perp)} ${yhatY - 8 * uy + 8 * ny * Math.sign(perp)} L ${yhatX + 8 * nx * Math.sign(perp)} ${yhatY + 8 * ny * Math.sign(perp)} L ${yhatX + 8 * nx * Math.sign(perp) - 8 * ux} ${yhatY + 8 * ny * Math.sign(perp) - 8 * uy}`}
          fill="none" stroke="var(--text)" strokeWidth="1.2" />

        {/* Label box */}
        <g transform="translate(20, 30)" fontSize="11" fontFamily="var(--font-mono)">
          <text x="0" y="0" fill="var(--text-muted)">H = X(X'X)⁻¹X' projekční matice</text>
          <text x="0" y="16" fill="var(--text)">Ŷ = HY</text>
          <text x="0" y="32" fill="var(--text)">r = (I − H)Y ⊥ col(X)</text>
          <text x="0" y="50" fill="var(--text-muted)">||Y||² = ||Ŷ||² + ||r||²</text>
        </g>

        <text x={W / 2} y={H - 14} textAnchor="middle" fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">
          OLS hledá nejbližší Ŷ ∈ col(X). Reziduum r je ortogonální na X.
        </text>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <label style={lab()}>poloha Ŷ podél col(X) = {px.toFixed(2)}
          <input type="range" min={0.1} max={0.9} step={0.01} value={px} onChange={(e) => setPx(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>velikost reziduí = {perp.toFixed(2)}
          <input type="range" min={-0.9} max={0.9} step={0.01} value={perp} onChange={(e) => setPerp(+e.target.value)} style={{ width: "100%" }} />
        </label>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        Diagonála h<sub>ii</sub> matice H = leverage pozorování i. Σ h<sub>ii</sub> = stopa = p + 1 (počet parametrů).
        Vysoká h<sub>ii</sub> ⇒ pozorování má velký potenciální vliv na vlastní predikci.
      </div>
    </div>
  );
}

function lab() { return { flex: "1 1 200px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
