// Dot plot of two short sequences with a sliding-window filter.
// Slider 1: window size W. Slider 2: match threshold (how many matches inside W).
// At W=1, threshold=1 you see the raw (noisy) dot plot; widening W + raising the
// threshold removes the random-match noise and leaves the true diagonal.
import { useState } from "react";

export default function BifDotPlot() {
  // Two short sequences that share a clear diagonal plus some random noise hits.
  const seqA = "ACGTACGTAC"; // along the top (columns)
  const seqB = "TGACGTACGA"; // down the side (rows)
  const n = seqA.length;
  const m = seqB.length;

  const [win, setWin] = useState(1);     // sliding-window size W
  const [thr, setThr] = useState(1);     // required matches inside the window

  // raw match: same character at (column j of A, row i of B)
  const raw = (i, j) => (i >= 0 && j >= 0 && i < m && j < n && seqB[i] === seqA[j]);

  // windowed cell: count matches on the diagonal segment of length `win`
  // starting at (i,j); plot a dot only if count >= thr.
  const filtered = (i, j) => {
    let c = 0;
    for (let k = 0; k < win; k++) if (raw(i + k, j + k)) c++;
    return c >= Math.min(thr, win);
  };

  // Fixed square cells; size the canvas around the grid + labels + legend.
  const cell = 18;
  const ox = 42;          // left margin for side labels
  const oy = 32;          // top margin for top labels
  const legendW = 76;     // right column for the legend
  const W = ox + n * cell + legendW;
  const H = oy + m * cell + 26; // bottom room for the axis caption

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 460, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* grid */}
        {Array.from({ length: n + 1 }).map((_, j) => (
          <line key={`v${j}`} x1={ox + j * cell} y1={oy} x2={ox + j * cell} y2={oy + m * cell}
            stroke="var(--line)" strokeWidth="0.5" />
        ))}
        {Array.from({ length: m + 1 }).map((_, i) => (
          <line key={`h${i}`} x1={ox} y1={oy + i * cell} x2={ox + n * cell} y2={oy + i * cell}
            stroke="var(--line)" strokeWidth="0.5" />
        ))}

        {/* top labels (sequence A) */}
        {seqA.split("").map((ch, j) => (
          <text key={`a${j}`} x={ox + j * cell + cell / 2} y={oy - 4} textAnchor="middle"
            fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">{ch}</text>
        ))}
        {/* side labels (sequence B) */}
        {seqB.split("").map((ch, i) => (
          <text key={`b${i}`} x={ox - 5} y={oy + i * cell + cell / 2 + 3} textAnchor="end"
            fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">{ch}</text>
        ))}

        {/* dots */}
        {Array.from({ length: m }).map((_, i) =>
          Array.from({ length: n }).map((_, j) => {
            const on = filtered(i, j);
            if (!on) return null;
            const isDiag = raw(i, j) && (raw(i - 1, j - 1) || raw(i + 1, j + 1)); // part of a run (either direction)
            return (
              <circle key={`d${i}-${j}`} cx={ox + j * cell + cell / 2} cy={oy + i * cell + cell / 2}
                r={cell * 0.32}
                fill={isDiag ? "var(--accent)" : "color-mix(in oklch, var(--accent) 45%, var(--bg-card))"} />
            );
          })
        )}

        {/* axis captions */}
        <text x={ox + (n * cell) / 2} y={H - 8} textAnchor="middle" fontSize="9"
          fontFamily="var(--font-mono)" fill="var(--text-faint)">seq A (sloupce)</text>
        <text x={10} y={oy + (m * cell) / 2} textAnchor="middle" fontSize="9"
          fontFamily="var(--font-mono)" fill="var(--text-faint)"
          transform={`rotate(-90 10 ${oy + (m * cell) / 2})`}>seq B (radky)</text>

        {/* legend */}
        <g>
          <text x={W - 70} y={oy + 6} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">W = {win}</text>
          <text x={W - 70} y={oy + 20} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">prah = {Math.min(thr, win)}</text>
          <circle cx={W - 62} cy={oy + 38} r="3.5" fill="var(--accent)" />
          <text x={W - 54} y={oy + 41} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">diagonala</text>
          <circle cx={W - 62} cy={oy + 54} r="3.5" fill="color-mix(in oklch, var(--accent) 45%, var(--bg-card))" />
          <text x={W - 54} y={oy + 57} fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">izolovany</text>
        </g>
      </svg>

      <label style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        velikost okna W = {win}
        <input type="range" min={1} max={4} value={win}
          onChange={(e) => { const v = +e.target.value; setWin(v); if (thr > v) setThr(v); }}
          style={{ width: "100%" }} />
      </label>
      <label style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        prah shody = {Math.min(thr, win)} z {win}
        <input type="range" min={1} max={4} value={Math.min(thr, win)}
          onChange={(e) => setThr(+e.target.value)} style={{ width: "100%" }} />
      </label>
    </div>
  );
}
