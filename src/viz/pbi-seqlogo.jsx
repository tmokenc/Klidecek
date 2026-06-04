// Sekvenční logo: malé zarovnání (sloupce nukleotidů) -> logo.
// Výška sloupce = informační obsah R_i = 2 - H_i (bity); výška každého
// písmene = frekvence * R_i. Lze přepínat mezi dvěma zarovnáními
// (konzervované vs. variabilní) a zobrazit/skrýt vstupní zarovnání.
import { useState } from "react";

// dvě malá zarovnání po 8 sekvencích, 6 pozic
const ALN_CONS = [
  "TATAAT", "TATAAT", "TATAAA", "TATAAT",
  "TAGAAT", "TATAAT", "TATTAT", "TATAAT",
]; // pozice 1-2 (TA) silně konzervované
const ALN_VAR = [
  "ACGTAC", "GTCAGT", "CAGTCA", "TGACTG",
  "ACGTGA", "GTACAG", "CTGAAC", "TACGTC",
]; // skoro rovnoměrné rozložení

const BASES = ["A", "C", "G", "T"];
const COLOR = {
  A: "oklch(0.62 0.16 145)",  // zelená
  C: "oklch(0.62 0.16 250)",  // modrá
  G: "oklch(0.72 0.15 80)",   // žlutá/oranžová
  T: "oklch(0.6 0.18 22)",    // červená
};

function column(aln, j) {
  const n = aln.length;
  const counts = { A: 0, C: 0, G: 0, T: 0 };
  for (const s of aln) counts[s[j]]++;
  const f = {};
  let H = 0;
  for (const b of BASES) {
    f[b] = counts[b] / n;
    if (f[b] > 0) H -= f[b] * Math.log2(f[b]);
  }
  // malá vzorková korekce e(n) = (1/ln2)*(s-1)/(2n)
  const e = (1 / Math.LN2) * (BASES.length - 1) / (2 * n);
  const R = Math.max(0, Math.log2(BASES.length) - (H + e)); // 2 - (H + e)
  // písmena seřazená podle frekvence (nejčastější nahoře)
  const stack = BASES
    .filter((b) => f[b] > 0)
    .sort((a, b) => f[a] - f[b]) // odspodu nejmenší
    .map((b) => ({ b, h: f[b] * R }));
  return { R, stack };
}

export default function PbiSeqLogo() {
  const [conserved, setConserved] = useState(true);
  const [showAln, setShowAln] = useState(true);
  const aln = conserved ? ALN_CONS : ALN_VAR;
  const L = aln[0].length;

  const W = 420, H = 230;
  const padL = 34, padR = 12, padT = showAln ? 70 : 16, padB = 30;
  const colW = (W - padL - padR) / L;
  const maxBits = 2; // osa y: 0..2 bitů
  const plotH = H - padT - padB;
  const bitsToPx = (bits) => (bits / maxBits) * plotH;
  const baseY = padT + plotH; // y=0 bitů

  const cols = Array.from({ length: L }, (_, j) => column(aln, j));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 480, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* vstupní zarovnání nad logem */}
        {showAln && aln.map((s, r) =>
          s.split("").map((ch, j) => (
            <text key={`a${r}-${j}`} x={padL + j * colW + colW / 2} y={16 + r * 6.4}
              textAnchor="middle" fontSize="6.2" fontFamily="var(--font-mono)" fill={COLOR[ch]}>
              {ch}
            </text>
          ))
        )}

        {/* osa y: bity */}
        <line x1={padL} y1={padT} x2={padL} y2={baseY} stroke="var(--line-strong)" strokeWidth="0.7" />
        {[0, 1, 2].map((b) => (
          <g key={b}>
            <line x1={padL - 3} y1={baseY - bitsToPx(b)} x2={padL} y2={baseY - bitsToPx(b)}
              stroke="var(--line-strong)" strokeWidth="0.7" />
            <text x={padL - 6} y={baseY - bitsToPx(b) + 3} textAnchor="end"
              fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-faint)">{b}</text>
          </g>
        ))}
        <text x={9} y={padT + plotH / 2} textAnchor="middle" fontSize="9"
          fontFamily="var(--font-mono)" fill="var(--text-muted)"
          transform={`rotate(-90 9 ${padT + plotH / 2})`}>bity (R)</text>

        {/* sloupce loga */}
        {cols.map((col, j) => {
          let yTop = baseY; // začínáme od osy nahoru
          const conservedCol = col.R >= 1.4;
          return (
            <g key={`c${j}`}>
              {/* zvýraznění konzervovaného sloupce */}
              {conservedCol && (
                <rect x={padL + j * colW + 1} y={padT - 2} width={colW - 2} height={plotH + 4}
                  fill="color-mix(in oklch, var(--accent) 14%, transparent)" />
              )}
              {col.stack.map(({ b, h }, k) => {
                const px = bitsToPx(h);
                yTop -= px;
                // baseline písmene = spodek jeho slotu (yTop + px); škálujeme
                // kolem baseline (lokální počátek), takže spodek leží přesně na
                // baseline a horní okraj přesně px nad ním (= bitsToPx(h)).
                const REF = 20; // referenční fontSize, na němž je glyf nakreslen
                const CAP = 0.7 * REF; // cap-height monospace fontu (≈0,7·fontSize)
                const sx = (colW - 3) / (0.62 * REF); // šířka glyfu ≈0,62·fontSize
                const sy = px / CAP; // svislé měřítko: cap-height -> přesně px
                return (
                  <g key={`${j}-${k}`}
                    transform={`translate(${padL + j * colW + colW / 2}, ${yTop + px})`}>
                    <text x={0} y={0} textAnchor="middle"
                      fontFamily="var(--font-mono)" fontWeight="700"
                      fontSize={REF} fill={COLOR[b]}
                      transform={`scale(${sx}, ${sy})`}>
                      {b}
                    </text>
                  </g>
                );
              })}
              {/* pozice */}
              <text x={padL + j * colW + colW / 2} y={baseY + 12} textAnchor="middle"
                fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">{j + 1}</text>
            </g>
          );
        })}
        <text x={W - padR} y={H - 6} textAnchor="end" fontSize="8.5"
          fontFamily="var(--font-mono)" fill="var(--text-faint)">pozice v zarovnání</text>
      </svg>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={() => setConserved((v) => !v)}
          style={{ fontSize: 12, fontFamily: "var(--font-mono)", padding: "3px 8px",
            background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line-strong)",
            borderRadius: 4, cursor: "pointer" }}>
          {conserved ? "motiv: konzervovaný (TATA-box)" : "motiv: variabilní (skoro náhodný)"}
        </button>
        <button onClick={() => setShowAln((v) => !v)}
          style={{ fontSize: 12, fontFamily: "var(--font-mono)", padding: "3px 8px",
            background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line-strong)",
            borderRadius: 4, cursor: "pointer" }}>
          {showAln ? "skrýt zarovnání" : "zobrazit zarovnání"}
        </button>
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        celkový obsah loga = {cols.reduce((s, c) => s + c.R, 0).toFixed(2)} bitů · vyšší sloupec = silnější konzervace
      </div>
    </div>
  );
}
