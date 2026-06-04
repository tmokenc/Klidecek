// Autoregresivní generování: P(x) = ∏ P(x_t | x_<t).
// Krokuje generování token po tokenu, ukazuje rozdělení dalšího tokenu (bar chart)
// a navzorkovaný token. Přepínač teacher forcing vs. sampling.
import { useState } from "react";

// Slovník kandidátů + modelem predikované pravděpodobnosti pro každý krok.
// Krok i = rozdělení P(x_i | prefix). "gold" = správný token podle ground truth.
const VOCAB = ["kočka", "spí", "na", "gauči", "stole", "běží", "."];

// Pro každý krok: rozdělení (musí sčítat ~1) přes VOCAB a index gold tokenu.
const STEPS = [
  { dist: [0.62, 0.05, 0.04, 0.05, 0.05, 0.16, 0.03], gold: 0 }, // kočka
  { dist: [0.02, 0.55, 0.04, 0.03, 0.03, 0.30, 0.03], gold: 1 }, // spí (model váhá: spí/běží)
  { dist: [0.03, 0.03, 0.78, 0.04, 0.04, 0.03, 0.05], gold: 2 }, // na
  { dist: [0.03, 0.03, 0.04, 0.34, 0.48, 0.03, 0.05], gold: 3 }, // gauči (model preferuje stole)
  { dist: [0.04, 0.03, 0.03, 0.03, 0.04, 0.03, 0.80], gold: 6 }, // .
];

export default function KnnAutoregressive() {
  const [step, setStep] = useState(0);
  const [teacher, setTeacher] = useState(false);
  // Pro každý krok si pamatujeme, který token byl "vybrán" (greedy = argmax).
  // Sampling zde reprezentujeme jako greedy (deterministicky), aby viz byla stabilní;
  // teacher forcing přepíše výběr na gold token.

  const cur = STEPS[step];
  const sampled = cur.dist.indexOf(Math.max(...cur.dist)); // greedy / argmax
  const chosen = teacher ? cur.gold : sampled;

  // Sestav dosavadní prefix z předchozích kroků (podle stejné politiky).
  const prefix = [];
  for (let i = 0; i < step; i++) {
    const s = STEPS[i];
    const g = teacher ? s.gold : s.dist.indexOf(Math.max(...s.dist));
    prefix.push(VOCAB[g]);
  }

  const W = 520, H = 250;
  const barW = 56, gap = 8, baseY = 150, maxBarH = 96;
  const left = 24;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 12 }}>
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
          style={btn(step === 0)}>◀ zpět</button>
        <button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1}
          style={btn(step === STEPS.length - 1)}>krok ▶</button>
        <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          t = {step + 1} / {STEPS.length}
        </span>
        <label style={{ display: "flex", gap: 5, alignItems: "center", marginLeft: "auto" }}>
          <input type="checkbox" checked={teacher} onChange={(e) => setTeacher(e.target.checked)} />
          teacher forcing
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 560 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* prefix (dosud vygenerovaný kontext x_<t) */}
        <text x={left} y={22} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          prefix x_&lt;t:
        </text>
        <text x={left} y={40} fontSize="13" fontFamily="var(--font-mono)" fill="var(--text)">
          {(prefix.length ? prefix.join(" ") : "⟨start⟩") + " …"}
        </text>

        {/* osa */}
        <line x1={left} y1={baseY} x2={left + VOCAB.length * (barW + gap)} y2={baseY}
          stroke="var(--line-strong)" strokeWidth="0.6" />
        <text x={left} y={68} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          P(x_t | x_&lt;t) — rozdělení dalšího tokenu
        </text>

        {/* sloupce rozdělení */}
        {VOCAB.map((tok, j) => {
          const p = cur.dist[j];
          const h = p * (maxBarH / 0.85);
          const x = left + j * (barW + gap);
          const isChosen = j === chosen;
          const isGold = j === cur.gold;
          return (
            <g key={j}>
              <rect x={x} y={baseY - h} width={barW} height={h}
                fill={isChosen ? "var(--accent)" : "color-mix(in oklch, var(--accent) 28%, var(--bg-card))"}
                stroke={isGold && !isChosen ? "var(--accent-line)" : "var(--line)"}
                strokeWidth={isGold && !isChosen ? 1.6 : 0.6}
                strokeDasharray={isGold && !isChosen ? "3 2" : "0"} />
              <text x={x + barW / 2} y={baseY - h - 5} textAnchor="middle"
                fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                {p.toFixed(2)}
              </text>
              <text x={x + barW / 2} y={baseY + 14} textAnchor="middle"
                fontSize="10.5" fontFamily="var(--font-mono)"
                fill={isChosen ? "var(--accent)" : "var(--text-muted)"}>
                {tok}
              </text>
            </g>
          );
        })}

        {/* navzorkovaný / vybraný token */}
        <text x={left} y={H - 44} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {teacher ? "vložen gold token (ground truth):" : "vybrán token (argmax / sampling):"}
        </text>
        <rect x={left} y={H - 38} width={130} height={26} rx="4"
          fill="var(--accent)" opacity="0.18" stroke="var(--accent)" strokeWidth="1" />
        <text x={left + 65} y={H - 20} textAnchor="middle"
          fontSize="13" fontFamily="var(--font-mono)" fill="var(--accent)">
          {VOCAB[chosen]}
        </text>
        <text x={left + 150} y={H - 20} fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {chosen === cur.gold ? "= gold (shoda s daty)" : "≠ gold — odchylka od dat"}
        </text>
      </svg>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Plný sloupec = vybraný token, čárkovaný obrys = gold token z trénovacích dat. Bez teacher forcing model krmí
        svůj vlastní výstup zpět (sampling/argmax) — chyba v kroku t se propaguje do celého zbytku (exposure bias).
        S teacher forcing dostane decoder v kroku t vždy správný předchozí token, což stabilizuje trénink.
      </div>
    </div>
  );
}

function btn(disabled) {
  return {
    background: disabled ? "var(--bg-card)" : "var(--accent)",
    color: disabled ? "var(--text-faint)" : "white",
    border: "1px solid var(--line)", padding: "3px 10px", borderRadius: 4,
    fontSize: 12, cursor: disabled ? "default" : "pointer", fontFamily: "var(--font-mono)",
  };
}
