// FLAGSHIP: self-attention nad několika tokeny.
// Ukazuje Q, K, V (zjednodušené 2D vektory), matici skóre QK^T/√d a softmax váhy (heatmapa).
// Klikni na token (řádek = query) → zvýrazní, na co se "dívá". Přepínač kauzální masky.
// Vlevo dole: krátká poznámka k multi-head a pozičnímu kódování.
import { useState } from "react";

const TOKENS = ["kočka", "spí", "na", "gauči"];

// Zjednodušené 2D Q/K/V vektory pro názornost (reálně d_k ~ 64).
// Voleny tak, aby vznikly čitelné, ne uniformní attention vzory.
const Q = [[1.0, 0.2], [0.3, 1.0], [0.6, 0.6], [0.9, 0.4]];
const K = [[0.9, 0.3], [0.2, 1.0], [0.7, 0.5], [1.0, 0.2]];
const V = [[1.0, 0.0], [0.0, 1.0], [0.5, 0.5], [0.8, 0.2]];
const D = 2; // d_k

function dot(a, b) { return a[0] * b[0] + a[1] * b[1]; }

function softmax(row) {
  const m = Math.max(...row.filter((x) => x > -1e8));
  const ex = row.map((x) => (x <= -1e8 ? 0 : Math.exp(x - m)));
  const s = ex.reduce((a, b) => a + b, 0);
  return ex.map((x) => (s > 0 ? x / s : 0));
}

export default function KnnAttention() {
  const [sel, setSel] = useState(0); // vybraný query token (řádek)
  const [causal, setCausal] = useState(false);

  const n = TOKENS.length;
  // skóre = Q·K / √d, případně kauzální maska (j > i → -inf)
  const scores = Q.map((q, i) =>
    K.map((k, j) => {
      const raw = dot(q, k) / Math.sqrt(D);
      return causal && j > i ? -1e9 : raw;
    })
  );
  const weights = scores.map((row) => softmax(row));

  const W = 540, H = 280;
  const cell = 44;
  const gridX = 250, gridY = 60; // levý horní roh heatmapy

  const colorFor = (v) => `oklch(${0.94 - Math.min(1, v) * 0.5} 0.13 250)`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: 12, flexWrap: "wrap" }}>
        <span style={{ color: "var(--text-muted)" }}>query token:</span>
        {TOKENS.map((t, i) => (
          <button key={i} onClick={() => setSel(i)}
            style={{
              background: sel === i ? "var(--accent)" : "var(--bg-card)",
              color: sel === i ? "white" : "var(--text)",
              border: "1px solid var(--line)", padding: "2px 8px", borderRadius: 4,
              fontSize: 12, cursor: "pointer", fontFamily: "var(--font-mono)",
            }}>{t}</button>
        ))}
        <label style={{ display: "flex", gap: 5, alignItems: "center", marginLeft: "auto" }}>
          <input type="checkbox" checked={causal} onChange={(e) => setCausal(e.target.checked)} />
          kauzální maska
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 560 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* === levý panel: Q, K, V vektory vybraného tokenu === */}
        <text x={16} y={24} fontSize="11.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          token &quot;{TOKENS[sel]}&quot;:
        </text>
        {[["Q", Q[sel], "var(--accent)"], ["K", K[sel], "var(--accent-line)"], ["V", V[sel], "var(--text-muted)"]].map(
          ([lbl, vec, col], r) => (
            <g key={lbl}>
              <text x={16} y={48 + r * 26} fontSize="12" fontFamily="var(--font-mono)" fill={col}>
                {lbl}
              </text>
              <rect x={40} y={36 + r * 26} width={86} height={18} rx="3"
                fill="var(--bg-card)" stroke="var(--line)" strokeWidth="0.6" />
              <text x={83} y={49 + r * 26} textAnchor="middle"
                fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">
                [{vec[0].toFixed(1)}, {vec[1].toFixed(1)}]
              </text>
            </g>
          )
        )}
        <text x={16} y={140} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          Q = co hledám
        </text>
        <text x={16} y={154} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          K = čím se nabízím
        </text>
        <text x={16} y={168} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          V = co předávám dál
        </text>

        {/* === formula === */}
        <text x={16} y={206} fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          softmax(Q·Kᵀ / √d)
        </text>
        <text x={16} y={222} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          d = {D} (√d = {Math.sqrt(D).toFixed(2)})
        </text>

        {/* === heatmapa attention vah === */}
        <text x={gridX} y={gridY - 30} fontSize="11.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          attention váhy (řádek = query)
        </text>
        {/* sloupcové popisky = key tokeny */}
        {TOKENS.map((t, j) => (
          <text key={j} x={gridX + j * cell + cell / 2} y={gridY - 8} textAnchor="middle"
            fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
            {t}
          </text>
        ))}
        {/* buňky */}
        {weights.map((row, i) =>
          row.map((v, j) => {
            const active = i === sel;
            const masked = causal && j > i;
            return (
              <g key={`${i}-${j}`} onClick={() => setSel(i)} style={{ cursor: "pointer" }}>
                <rect x={gridX + j * cell} y={gridY + i * cell} width={cell} height={cell}
                  fill={masked ? "var(--bg-card)" : colorFor(v)}
                  stroke={active ? "var(--accent)" : "var(--line)"}
                  strokeWidth={active ? 2 : 0.5}
                  opacity={active ? 1 : 0.55} />
                <text x={gridX + j * cell + cell / 2} y={gridY + i * cell + cell / 2 + 4} textAnchor="middle"
                  fontSize="10" fontFamily="var(--font-mono)"
                  fill={active ? "var(--text)" : "var(--text-muted)"}>
                  {masked ? "–" : v < 0.005 ? "·" : v.toFixed(2)}
                </text>
              </g>
            );
          })
        )}
        {/* řádkové popisky = query tokeny */}
        {TOKENS.map((t, i) => (
          <text key={i} x={gridX - 6} y={gridY + i * cell + cell / 2 + 4} textAnchor="end"
            fontSize="10" fontFamily="var(--font-mono)"
            fill={i === sel ? "var(--accent)" : "var(--text-muted)"}>
            {t}
          </text>
        ))}

        {/* shrnutí vybraného řádku */}
        <text x={gridX} y={gridY + n * cell + 18} fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          &quot;{TOKENS[sel]}&quot; nejvíc attenduje →{" "}
          <tspan fill="var(--accent)">
            {TOKENS[weights[sel].indexOf(Math.max(...weights[sel]))]}
          </tspan>
          {"  (Σ řádku = "}{weights[sel].reduce((a, b) => a + b, 0).toFixed(2)}{")"}
        </text>
      </svg>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Každý řádek je softmax distribuce: jak moc daný query token bere informaci (V) z ostatních. Klikni na token
        nebo řádek → zvýrazní jeho pozornost. Kauzální maska vynuluje budoucí tokeny (j &gt; i), takže token vidí jen
        sebe a minulost — to potřebuje autoregresivní decoder.
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Multi-head: tento výpočet běží paralelně v h hlavách s vlastními projekcemi Q/K/V — různé hlavy chytají různé
        vztahy (sousednost, shoda rodu, dlouhé závislosti). Poziční kódování přidá k embeddingu informaci o pořadí,
        protože attention je sama o sobě permutačně invariantní.
      </div>
    </div>
  );
}
