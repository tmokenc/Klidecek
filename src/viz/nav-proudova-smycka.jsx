// Proudová smyčka 4–20 mA — živá nula a detekce přerušení vodiče.
// Slider nastaví měřenou veličinu (0–100 %), toggle simuluje přerušený vodič.
import { useState } from "react";

export default function NavProudovaSmycka() {
  const [pct, setPct] = useState(50);
  const [broken, setBroken] = useState(false);

  // 0 % → 4 mA, 100 % → 20 mA. Přerušení → 0 mA.
  const mA = broken ? 0 : 4 + (pct / 100) * 16;

  const W = 360, H = 150;
  const x0 = 24, x1 = W - 24, y = 96;
  const toX = (v) => x0 + (v / 24) * (x1 - x0); // 0..24 mA stupnice
  const fault = mA < 3.8;
  const needleX = toX(mA);

  const accent = fault ? "oklch(0.6 0.18 22)" : "oklch(0.55 0.16 142)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />

        {/* fault zone 0–4 mA */}
        <rect x={toX(0)} y={y - 10} width={toX(4) - toX(0)} height={20}
          fill="oklch(0.6 0.18 22 / 0.18)" />
        {/* valid zone 4–20 mA */}
        <rect x={toX(4)} y={y - 10} width={toX(20) - toX(4)} height={20}
          fill="oklch(0.55 0.16 142 / 0.15)" />

        {/* scale line */}
        <line x1={toX(0)} y1={y} x2={toX(24)} y2={y} stroke="var(--line-strong)" strokeWidth="1" />
        {[0, 4, 12, 20, 24].map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1={y - 4} x2={toX(t)} y2={y + 4} stroke="var(--text-muted)" strokeWidth="1" />
            <text x={toX(t)} y={y + 18} textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">{t}</text>
          </g>
        ))}
        <text x={toX(24)} y={y + 32} textAnchor="end" fontSize="8.5" fill="var(--text-faint)">mA</text>

        {/* zone labels — above the needle knob (y−24) so the vertical needle never strikes them */}
        <text x={(toX(0) + toX(4)) / 2} y={y - 31} textAnchor="middle" fontSize="8.5" fontWeight="600" fill="oklch(0.6 0.18 22)">PORUCHA</text>
        <text x={(toX(4) + toX(20)) / 2} y={y - 31} textAnchor="middle" fontSize="8.5" fontWeight="600" fill="oklch(0.5 0.16 142)">měřicí rozsah</text>

        {/* needle */}
        <line x1={needleX} y1={y - 22} x2={needleX} y2={y + 8} stroke={accent} strokeWidth="2" />
        <circle cx={needleX} cy={y - 22} r="4" fill={accent} />

        {/* readout */}
        <text x={W / 2} y={24} textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="var(--font-mono)" fill={accent}>
          {mA.toFixed(1)} mA
        </text>
        <text x={W / 2} y={40} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
          {fault ? "I < 4 mA → přerušený vodič / výpadek" : `${pct} % rozsahu`}
        </text>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <input type="range" className="viz-slider" min={0} max={100} value={pct}
          disabled={broken}
          onChange={(e) => setPct(+e.target.value)} style={{ width: "100%", opacity: broken ? 0.4 : 1 }} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          <input type="checkbox" checked={broken} onChange={(e) => setBroken(e.target.checked)} />
          přerušit vodič (I → 0 mA)
        </label>
      </div>
    </div>
  );
}
