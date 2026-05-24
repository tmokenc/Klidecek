// Interactive Bayes — pick observation, see prior × likelihood / evidence = posterior derivation.
import { useState } from "react";

// Counts from the textbook example (granát × jablko × weight category).
const CATS = ["nejlehčí", "lehčí", "lehká", "střední", "těžká", "těžší", "nejtěžší"];
const COUNTS = {
  granát: [1, 6, 12, 15, 12, 2, 2],
  jablko: [4, 22, 50, 14, 6, 3, 1],
};
const TOTAL_PER_CLASS = {
  granát: COUNTS.granát.reduce((a, b) => a + b, 0),
  jablko: COUNTS.jablko.reduce((a, b) => a + b, 0),
};
const N = TOTAL_PER_CLASS.granát + TOTAL_PER_CLASS.jablko;
const COL_TOTALS = CATS.map((_, i) => COUNTS.granát[i] + COUNTS.jablko[i]);

const COLOR_G = "oklch(0.6 0.18 25)";
const COLOR_A = "oklch(0.65 0.18 130)";

export default function BayesFromJoint() {
  const [obs, setObs] = useState(4); // default "těžká" — interesting case
  const [showLaplace, setShowLaplace] = useState(false);

  // Marginal P(class)
  const prior_g = TOTAL_PER_CLASS.granát / N;
  const prior_a = TOTAL_PER_CLASS.jablko / N;

  // Likelihoods P(weight | class)
  const c_g = COUNTS.granát[obs];
  const c_a = COUNTS.jablko[obs];
  const lik_g_raw = c_g / TOTAL_PER_CLASS.granát;
  const lik_a_raw = c_a / TOTAL_PER_CLASS.jablko;
  // Laplace smoothing (add α=1 per cell, K=7 categories)
  const K = CATS.length;
  const lik_g = showLaplace ? (c_g + 1) / (TOTAL_PER_CLASS.granát + K) : lik_g_raw;
  const lik_a = showLaplace ? (c_a + 1) / (TOTAL_PER_CLASS.jablko + K) : lik_a_raw;

  // Evidence P(x) = P(x|g)·P(g) + P(x|a)·P(a)
  const evidence = lik_g * prior_g + lik_a * prior_a;
  const post_g = (lik_g * prior_g) / evidence;
  const post_a = (lik_a * prior_a) / evidence;

  const decision = post_g > post_a ? "granát" : "jablko";
  const decisionColor = post_g > post_a ? COLOR_G : COLOR_A;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>pozorování (váhová kategorie):</span>
          <select value={obs} onChange={(e) => setObs(+e.target.value)}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 4px", borderRadius: 3 }}>
            {CATS.map((c, i) => <option key={i} value={i}>{c}</option>)}
          </select>
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <input type="checkbox" checked={showLaplace} onChange={(e) => setShowLaplace(e.target.checked)} />
          Laplace α = 1
        </label>
      </div>

      <svg viewBox="0 0 540 180" style={{ width: "100%", display: "block" }}>
        <rect width="540" height="180" fill="var(--bg-inset)" />
        {/* Table */}
        <g fontFamily="var(--font-mono)" fontSize="10">
          {CATS.map((cat, i) => {
            const isObs = i === obs;
            return (
              <g key={i}>
                <rect x={70 + i * 55} y={20} width={50} height={130}
                  fill={isObs ? "color-mix(in oklch, oklch(0.7 0.18 60) 25%, var(--bg-card))" : "var(--bg-card)"}
                  stroke="var(--line)" strokeWidth="0.7" />
                <text x={70 + i * 55 + 25} y={36} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{cat}</text>
                {/* count cells */}
                <text x={70 + i * 55 + 25} y={65} textAnchor="middle" fontSize="11" fill={COLOR_G} fontWeight={isObs ? 700 : 400}>
                  {COUNTS.granát[i]}
                </text>
                <text x={70 + i * 55 + 25} y={95} textAnchor="middle" fontSize="11" fill={COLOR_A} fontWeight={isObs ? 700 : 400}>
                  {COUNTS.jablko[i]}
                </text>
                <text x={70 + i * 55 + 25} y={130} textAnchor="middle" fontSize="11" fill="var(--text-muted)">
                  {COL_TOTALS[i]}
                </text>
              </g>
            );
          })}
          <g textAnchor="end" fill="var(--text)">
            <text x={64} y={68} fill={COLOR_G} fontWeight="700">granát</text>
            <text x={64} y={98} fill={COLOR_A} fontWeight="700">jablko</text>
            <text x={64} y={134} fill="var(--text-muted)">Σ</text>
          </g>
          <text x={460} y={68} fill={COLOR_G} fontWeight="600" fontFamily="var(--font-mono)">= {TOTAL_PER_CLASS.granát}</text>
          <text x={460} y={98} fill={COLOR_A} fontWeight="600" fontFamily="var(--font-mono)">= {TOTAL_PER_CLASS.jablko}</text>
          <text x={460} y={134} fill="var(--text-muted)" fontFamily="var(--font-mono)">= {N}</text>
          {/* horizontal separator */}
          <line x1="50" y1="110" x2="510" y2="110" stroke="var(--line)" strokeWidth="0.5" />
        </g>
      </svg>

      {/* Bayes arithmetic */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 4, padding: 10, fontSize: 11, fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
        <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
          Bayes — třída granát
        </div>
        <div>
          P(granát) = <span style={{ color: COLOR_G }}>{TOTAL_PER_CLASS.granát}/{N}</span> = <strong>{prior_g.toFixed(3)}</strong>
        </div>
        <div>
          P(x=&quot;{CATS[obs]}&quot; | granát) = <span style={{ color: COLOR_G }}>{showLaplace ? `(${c_g}+1)/(${TOTAL_PER_CLASS.granát}+${K})` : `${c_g}/${TOTAL_PER_CLASS.granát}`}</span> = <strong>{lik_g.toFixed(3)}</strong>
        </div>

        <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 8, marginBottom: 4 }}>
          Bayes — třída jablko
        </div>
        <div>
          P(jablko) = <span style={{ color: COLOR_A }}>{TOTAL_PER_CLASS.jablko}/{N}</span> = <strong>{prior_a.toFixed(3)}</strong>
        </div>
        <div>
          P(x=&quot;{CATS[obs]}&quot; | jablko) = <span style={{ color: COLOR_A }}>{showLaplace ? `(${c_a}+1)/(${TOTAL_PER_CLASS.jablko}+${K})` : `${c_a}/${TOTAL_PER_CLASS.jablko}`}</span> = <strong>{lik_a.toFixed(3)}</strong>
        </div>

        <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 8, marginBottom: 4 }}>
          posterior
        </div>
        <div>
          P(x) = P(x|g)·P(g) + P(x|a)·P(a) = {lik_g.toFixed(3)}·{prior_g.toFixed(3)} + {lik_a.toFixed(3)}·{prior_a.toFixed(3)} = <strong>{evidence.toFixed(4)}</strong>
        </div>
        <div style={{ marginTop: 4 }}>
          P(granát | x) = ({lik_g.toFixed(3)} × {prior_g.toFixed(3)}) / {evidence.toFixed(4)} = <strong style={{ color: COLOR_G }}>{post_g.toFixed(3)}</strong>
        </div>
        <div>
          P(jablko | x) = ({lik_a.toFixed(3)} × {prior_a.toFixed(3)}) / {evidence.toFixed(4)} = <strong style={{ color: COLOR_A }}>{post_a.toFixed(3)}</strong>
        </div>
      </div>

      {/* Posterior bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>posterior:</span>
        <div style={{ flex: 1, display: "flex", height: 22, border: "1px solid var(--line)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${post_g * 100}%`, background: COLOR_G, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            {(post_g * 100).toFixed(1)}%
          </div>
          <div style={{ width: `${post_a * 100}%`, background: COLOR_A, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontFamily: "var(--font-mono)" }}>
            {(post_a * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text)" }}>
        Rozhodnutí (MAP): <strong style={{ color: decisionColor }}>{decision}</strong>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Vyzkoušejte &quot;nejtěžší&quot; — likelihood je 2/50 vs 1/100; prior dvojnásobně preferuje jablko (100 vs 50),
        ale silnější likelihood granátu vyhrává. Zapnutí Laplace zmírní extrémní hodnoty pro malá `n_c,k`.
      </div>
    </div>
  );
}
