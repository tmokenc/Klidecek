// Needleman-Wunsch (global) / Smith-Waterman (local) DP matrix, step by step.
// Step through the cells: each cell = max of three sources (diagonal = match/mismatch,
// up & left = gap). In SW mode negatives are clamped to 0. After the matrix is full,
// further steps walk the traceback and highlight the optimal alignment.
import { useState } from "react";

export default function BifNwAlign() {
  const A = "GATTACA"; // top  (columns j = 1..n)
  const B = "GCATGCU"; // side (rows    i = 1..m)
  const n = A.length, m = B.length;

  const MATCH = 1, MISMATCH = -1, GAP = -1;

  const [local, setLocal] = useState(false); // false = NW (global), true = SW (local)

  // Build the full score matrix + the source (arrow) for each cell.
  const build = () => {
    const S = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    const from = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(""));
    for (let j = 0; j <= n; j++) { S[0][j] = local ? 0 : j * GAP; from[0][j] = j ? "L" : ""; }
    for (let i = 0; i <= m; i++) { S[i][0] = local ? 0 : i * GAP; from[i][0] = i ? "U" : ""; }
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const sub = B[i - 1] === A[j - 1] ? MATCH : MISMATCH;
        const diag = S[i - 1][j - 1] + sub;
        const up = S[i - 1][j] + GAP;
        const left = S[i][j - 1] + GAP;
        let best = Math.max(diag, up, left);
        let dir = best === diag ? "D" : best === up ? "U" : "L";
        if (local && best < 0) { best = 0; dir = "0"; }
        S[i][j] = best; from[i][j] = dir;
      }
    }
    return { S, from };
  };

  const { S, from } = build();

  // Order in which cells get filled (row-major over the inner matrix).
  const order = [];
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) order.push([i, j]);
  const totalFill = order.length;

  // Traceback path (cells, in order of the walk).
  const traceback = () => {
    let si = m, sj = n;
    if (local) { // start at global max
      let bv = -Infinity;
      for (let i = 0; i <= m; i++) for (let j = 0; j <= n; j++)
        if (S[i][j] > bv) { bv = S[i][j]; si = i; sj = j; }
    }
    const path = [];
    let i = si, j = sj;
    while (i > 0 || j > 0) {
      path.push([i, j]);
      if (local && S[i][j] === 0) break;
      const d = from[i][j];
      if (d === "D") { i--; j--; }
      else if (d === "U") { i--; }
      else if (d === "L") { j--; }
      else break;
    }
    // NW (global): continue the traceback to the [0,0] origin so the leading
    // column is reconstructed and the highlight reaches the top-left corner.
    // (SW stops at the first zero cell above and must NOT include the origin.)
    if (!local) path.push([0, 0]);
    return path;
  };
  const path = traceback();

  // step: 0..totalFill fills cells; totalFill..totalFill+path.length walks traceback.
  const maxStep = totalFill + path.length;
  const [step, setStep] = useState(0);
  const clampStep = Math.min(step, maxStep);
  const filled = Math.min(clampStep, totalFill);
  const tbShown = Math.max(0, clampStep - totalFill);

  const inPath = (i, j) =>
    path.slice(0, tbShown).some(([pi, pj]) => pi === i && pj === j);

  const isFilled = (i, j) => {
    if (i === 0 || j === 0) return true; // init row/col always shown
    const idx = order.findIndex(([oi, oj]) => oi === i && oj === j);
    return idx < filled;
  };
  const activeIdx = filled < totalFill ? filled : -1;
  const active = activeIdx >= 0 ? order[activeIdx] : null;

  const cell = 34, ox = 50, oy = 40;
  const W = ox + (n + 1) * cell + 12;
  const H = oy + (m + 1) * cell + 30;
  const cx = (j) => ox + j * cell;
  const cy = (i) => oy + i * cell;

  // build the alignment strings once the traceback is fully shown
  let alnTop = "", alnBot = "";
  if (tbShown >= path.length && path.length) {
    const rev = [...path].reverse();
    for (let k = 1; k < rev.length; k++) {
      const [pi, pj] = rev[k], [qi, qj] = rev[k - 1];
      if (pi === qi + 1 && pj === qj + 1) { alnTop += A[pj - 1]; alnBot += B[pi - 1]; }
      else if (pi === qi + 1) { alnTop += "-"; alnBot += B[pi - 1]; }
      else { alnTop += A[pj - 1]; alnBot += "-"; }
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 520, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* top sequence labels */}
        {A.split("").map((ch, j) => (
          <text key={`a${j}`} x={cx(j + 1) + cell / 2} y={oy - 10} textAnchor="middle"
            fontSize="12" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--accent)">{ch}</text>
        ))}
        {/* side sequence labels */}
        {B.split("").map((ch, i) => (
          <text key={`b${i}`} x={ox - 14} y={cy(i + 1) + cell / 2 + 4} textAnchor="middle"
            fontSize="12" fontFamily="var(--font-mono)" fontWeight="600" fill="var(--accent)">{ch}</text>
        ))}

        {/* cells */}
        {Array.from({ length: m + 1 }).map((_, i) =>
          Array.from({ length: n + 1 }).map((_, j) => {
            const shown = isFilled(i, j);
            const onPath = inPath(i, j);
            const isActive = active && active[0] === i && active[1] === j;
            let fill = "var(--bg-card)";
            if (onPath) fill = "var(--accent)";
            else if (isActive) fill = "color-mix(in oklch, var(--accent) 45%, var(--bg-card))";
            else if (i === 0 || j === 0) fill = "color-mix(in oklch, var(--line) 40%, var(--bg-card))";
            return (
              <g key={`c${i}-${j}`}>
                <rect x={cx(j)} y={cy(i)} width={cell} height={cell} fill={fill}
                  stroke="var(--line-strong)" strokeWidth="0.6" />
                {shown && (
                  <text x={cx(j) + cell / 2} y={cy(i) + cell / 2 + 4} textAnchor="middle"
                    fontSize="11" fontFamily="var(--font-mono)"
                    fill={onPath ? "white" : "var(--text)"}>{S[i][j]}</text>
                )}
              </g>
            );
          })
        )}

        {/* arrow into the active cell, showing the chosen direction */}
        {active && (() => {
          const [i, j] = active;
          const d = from[i][j];
          const tx = cx(j) + cell / 2, ty = cy(i) + cell / 2;
          let sx = tx, sy = ty;
          if (d === "D") { sx = cx(j) - cell / 2; sy = cy(i) - cell / 2; }
          else if (d === "U") { sx = tx; sy = cy(i) - cell / 2; }
          else if (d === "L") { sx = cx(j) - cell / 2; sy = ty; }
          if (d === "0") return null;
          return <line x1={sx} y1={sy} x2={tx} y2={ty} stroke="var(--accent)" strokeWidth="1.6"
            markerEnd="url(#bifArrow)" />;
        })()}

        <defs>
          <marker id="bifArrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* status line */}
        <text x={ox} y={H - 10} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {clampStep < totalFill
            ? `vyplnuji bunku ${clampStep + 1}/${totalFill} · max(diag, ^, <)`
            : tbShown < path.length
              ? "zpetny pruchod (traceback)"
              : alnTop
                ? `${alnTop} / ${alnBot}  (skore ${local ? Math.max(...S.flat()) : S[m][n]})`
                : "hotovo"}
        </text>
      </svg>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setStep((s) => Math.min(s + 1, maxStep))}
          style={btn}>krok ▸</button>
        <button onClick={() => setStep(maxStep)} style={btn}>dokonči ⏭</button>
        <button onClick={() => setStep(0)} style={btn}>reset ↺</button>
        <label style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginLeft: 4 }}>
          <input type="checkbox" checked={local}
            onChange={(e) => { setLocal(e.target.checked); setStep(0); }} />
          {" "}lokální (SW, nuly)
        </label>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
        režim: {local ? "Smith-Waterman (lokální)" : "Needleman-Wunsch (globální)"} · match +1 / mismatch −1 / gap −1
      </div>
    </div>
  );
}

const btn = {
  fontSize: 12,
  fontFamily: "var(--font-mono)",
  padding: "3px 9px",
  background: "var(--bg-card)",
  color: "var(--text)",
  border: "1px solid var(--line-strong)",
  borderRadius: 5,
  cursor: "pointer",
};
