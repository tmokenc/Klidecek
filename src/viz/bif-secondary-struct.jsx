// Sliding-window secondary-structure prediction (simplified Chou-Fasman / GOR propensities).
// Each residue gets a helix/sheet/coil propensity; a sliding window averages the
// propensities and classifies the centre position. The window width is the slider.
import { useState } from "react";

// Simplified per-residue propensities (P_helix, P_sheet) loosely after Chou-Fasman.
// >1 favours that state. Coil wins when neither average clears the threshold.
const PROP = {
  E: [1.51, 0.37], M: [1.45, 1.05], A: [1.42, 0.83], L: [1.21, 1.30],
  K: [1.16, 0.74], F: [1.13, 1.38], Q: [1.11, 1.10], W: [1.08, 1.37],
  I: [1.08, 1.60], V: [1.06, 1.70], D: [1.01, 0.54], H: [1.00, 0.87],
  R: [0.98, 0.93], T: [0.83, 1.19], S: [0.77, 0.75], C: [0.70, 1.19],
  Y: [0.69, 1.47], N: [0.67, 0.89], P: [0.57, 0.55], G: [0.57, 0.75],
};

// A demo sequence with a helix-leaning stretch then a sheet-leaning stretch.
const SEQ = "MEAALEKQMAFLIVYTSVIFVCYTSPGNDPGK".split("");

export default function BifSecondaryStruct() {
  const [win, setWin] = useState(5);
  const half = Math.floor(win / 2);

  // classify each position by averaging propensities over the window
  const classify = (idx) => {
    let h = 0, s = 0, n = 0;
    for (let k = idx - half; k <= idx + half; k++) {
      const aa = SEQ[k];
      if (!aa || !PROP[aa]) continue;
      h += PROP[aa][0];
      s += PROP[aa][1];
      n++;
    }
    if (!n) return "C";
    h /= n; s /= n;
    if (h < 1.03 && s < 1.03) return "C";   // neither clears threshold -> coil/loop
    return h >= s ? "H" : "S";
  };

  const labels = SEQ.map((_, i) => classify(i));

  const W = 540, H = 180;
  const x0 = 16, cellW = (W - 2 * x0) / SEQ.length, top = 58, rowH = 22;
  const colorFor = (c) =>
    c === "H" ? "var(--accent)" :
    c === "S" ? "var(--accent-line)" : "var(--bg-card)";
  const name = (c) => (c === "H" ? "helix" : c === "S" ? "list" : "smyčka");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 540, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        <text x={x0} y={22} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">
          sekvence aminokyselin → klouzavé okno klasifikuje každou pozici
        </text>

        {/* residue letters */}
        {SEQ.map((aa, i) => (
          <text key={`r${i}`} x={x0 + cellW * (i + 0.5)} y={48}
            textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">
            {aa}
          </text>
        ))}

        {/* predicted-state cells */}
        {labels.map((c, i) => (
          <g key={`c${i}`}>
            <rect x={x0 + cellW * i + 0.6} y={top} width={cellW - 1.2} height={rowH}
              rx="2" fill={colorFor(c)} stroke="var(--line)" strokeWidth="0.5" />
            <text x={x0 + cellW * (i + 0.5)} y={top + rowH / 2 + 4}
              textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)"
              fill={c === "C" ? "var(--text-faint)" : "white"}>
              {c}
            </text>
          </g>
        ))}

        {/* window bracket under one centred example position */}
        {(() => {
          const center = Math.floor(SEQ.length / 2);
          const lo = Math.max(0, center - half), hi = Math.min(SEQ.length - 1, center + half);
          const bx = x0 + cellW * lo, bw = cellW * (hi - lo + 1);
          return (
            <g>
              <rect x={bx} y={top - 3} width={bw} height={rowH + 6} rx="3"
                fill="none" stroke="var(--text)" strokeWidth="1.5" strokeDasharray="3 2" />
              <text x={bx + bw / 2} y={top + rowH + 18} textAnchor="middle"
                fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                okno šířky {win}
              </text>
            </g>
          );
        })()}

        {/* legend */}
        <rect x={x0} y={H - 22} width={12} height={10} rx="2" fill="var(--accent)" />
        <text x={x0 + 16} y={H - 13} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">H = helix</text>
        <rect x={x0 + 92} y={H - 22} width={12} height={10} rx="2" fill="var(--accent-line)" />
        <text x={x0 + 108} y={H - 13} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">S = list</text>
        <rect x={x0 + 178} y={H - 22} width={12} height={10} rx="2" fill="var(--bg-card)" stroke="var(--line)" />
        <text x={x0 + 194} y={H - 13} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">C = smyčka</text>
      </svg>

      <input type="range" min={1} max={9} step={2} value={win}
        onChange={(e) => setWin(+e.target.value)} style={{ width: "100%" }} />
      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        šířka okna = {win} · větší okno = hladší (méně roztříštěná) predikce ·
        prostřední pozice klasifikována jako {name(labels[Math.floor(SEQ.length / 2)])}
      </div>
    </div>
  );
}
