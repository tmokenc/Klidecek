// Cyklus evolučního algoritmu jako krokovatelný diagram.
// Krok zvýrazní aktuální fázi: populace → fitness → selekce → křížení/mutace → nová populace.
import { useState } from "react";

export default function BinEaCycle() {
  // Fáze rozmístěné v kruhu kolem středu.
  const phases = [
    { key: "init", label: "Inicializace", sub: "náhodná populace", short: "P0" },
    { key: "eval", label: "Ohodnocení", sub: "fitness funkce", short: "fit" },
    { key: "select", label: "Selekce", sub: "výběr rodičů", short: "sel" },
    { key: "vary", label: "Křížení + mutace", sub: "noví potomci", short: "var" },
    { key: "replace", label: "Nová populace", sub: "nahrazení", short: "P+1" },
  ];
  const [step, setStep] = useState(0);

  const W = 460, H = 230;
  const cx = 175, cy = 118, rx = 132, ry = 86;
  // Pozice uzlů na elipse, fáze 0 nahoře, po směru hodin.
  const pos = phases.map((_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / phases.length;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)];
  });

  const next = () => setStep((s) => (s + 1) % phases.length);
  const active = step;
  // Šipka mezi fází i a i+1 je „prošlá", pokud jsme za ní.

  const arrow = (i) => {
    const j = (i + 1) % phases.length;
    const [x1, y1] = pos[i];
    const [x2, y2] = pos[j];
    // zkrátit ke krajům uzlů
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const r = 30;
    const live = i === active;
    return (
      <line
        key={`a${i}`}
        x1={x1 + ux * r} y1={y1 + uy * r}
        x2={x2 - ux * (r + 6)} y2={y2 - uy * (r + 6)}
        stroke={live ? "var(--accent)" : "var(--line-strong)"}
        strokeWidth={live ? 2 : 1}
        opacity={live ? 1 : 0.55}
        markerEnd={live ? "url(#eaArrowOn)" : "url(#eaArrowOff)"}
      />
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 520, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        <defs>
          <marker id="eaArrowOn" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="var(--accent)" />
          </marker>
          <marker id="eaArrowOff" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
            <polygon points="0 0, 8 4, 0 8" fill="var(--line-strong)" />
          </marker>
        </defs>

        {phases.map((_, i) => arrow(i))}

        {phases.map((p, i) => {
          const [x, y] = pos[i];
          const on = i === active;
          return (
            <g key={p.key} onClick={() => setStep(i)} style={{ cursor: "pointer" }}>
              <circle
                cx={x} cy={y} r={28}
                fill={on ? "var(--accent)" : "var(--bg-card)"}
                stroke={on ? "var(--accent)" : "var(--line-strong)"}
                strokeWidth={on ? 2 : 1}
              />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                fontSize="12" fontFamily="var(--font-mono)"
                fill={on ? "var(--accent-text-on)" : "var(--text-muted)"}>
                {p.short}
              </text>
            </g>
          );
        })}

        {/* Popisek středu = aktuální fáze */}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="13"
          fill="var(--text)" fontWeight="600">
          {phases[active].label}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11"
          fill="var(--text-muted)">
          {phases[active].sub}
        </text>

        {/* Ukončovací podmínka jako poznámka u smyčky */}
        <text x={W - 8} y={H - 10} textAnchor="end" fontSize="10"
          fontFamily="var(--font-mono)" fill="var(--text-faint)">
          opakuj, dokud není splněna ukončovací podmínka
        </text>
      </svg>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={next}
          style={{
            padding: "5px 14px", fontSize: 13, cursor: "pointer",
            background: "var(--accent)", color: "var(--accent-text-on)",
            border: "none", borderRadius: 6, fontWeight: 600,
          }}>
          Krok ▸
        </button>
        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          fáze {active + 1} / {phases.length} · klikni na uzel pro skok
        </span>
      </div>
    </div>
  );
}
