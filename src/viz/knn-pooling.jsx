// 2x2 pooling (max vs average) over a grid, with the sliding window and shrunk output.
import { useState } from "react";

export default function KnnPooling() {
  const [mode, setMode] = useState("max");   // "max" | "avg"
  const [pos, setPos] = useState(0);

  const N = 4;                                // 4x4 input -> 2x2 output (window 2, stride 2)
  const input = [
    [1, 3, 2, 4],
    [5, 6, 1, 2],
    [7, 2, 3, 0],
    [1, 4, 8, 5],
  ];
  const win = 2, stride = 2;
  const outN = Math.floor((N - win) / stride) + 1; // = 2
  const nOut = outN * outN;
  const p = Math.min(pos, nOut - 1);
  const oy = Math.floor(p / outN), ox = p % outN;
  const top = oy * stride, left = ox * stride;

  const cells = [];
  for (let r = 0; r < win; r++)
    for (let c = 0; c < win; c++) cells.push(input[top + r][left + c]);
  const result = mode === "max"
    ? Math.max(...cells)
    : (cells.reduce((a, b) => a + b, 0) / cells.length);
  const resultTxt = mode === "max" ? String(result) : result.toFixed(1);

  const cell = 30, gap = 2, gx = 14, gy = 30;
  const cellXY = (r, c) => [gx + c * (cell + gap), gy + r * (cell + gap)];
  const gridW = N * (cell + gap);

  const ox0 = gx + gridW + 40, ocell = 34;
  const outXY = (r, c) => [ox0 + c * (ocell + gap), gy + r * (ocell + gap)];

  const W = 380, H = 200;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        <text x={gx} y={20} fontSize="12" fontFamily="var(--font-mono)" fill="var(--text-muted)">vstup 4×4</text>
        <text x={ox0} y={20} fontSize="12" fontFamily="var(--font-mono)" fill="var(--text-muted)">výstup 2×2</text>

        {input.map((row, r) =>
          row.map((v, c) => {
            const inWin = r >= top && r < top + win && c >= left && c < left + win;
            const isMaxPick = mode === "max" && inWin && v === result;
            const [x, y] = cellXY(r, c);
            return (
              <g key={`p${r}-${c}`}>
                <rect x={x} y={y} width={cell} height={cell} rx="2"
                  fill={isMaxPick ? "var(--accent)"
                    : inWin ? "color-mix(in oklch, var(--accent) 30%, var(--bg-card))"
                    : "var(--bg-card)"}
                  stroke={inWin ? "var(--accent)" : "var(--line-strong)"}
                  strokeWidth={inWin ? 1.4 : 0.8} />
                <text x={x + cell / 2} y={y + cell / 2 + 4} textAnchor="middle"
                  fontSize="13" fontFamily="var(--font-mono)"
                  fill={isMaxPick ? "var(--bg-inset)" : inWin ? "var(--text)" : "var(--text-faint)"}>{v}</text>
              </g>
            );
          })
        )}

        {/* Window outline */}
        {(() => {
          const [x, y] = cellXY(top, left);
          const wpx = win * cell + (win - 1) * gap;
          return <rect x={x - 2} y={y - 2} width={wpx + 4} height={wpx + 4} rx="3"
            fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="4 3" />;
        })()}

        {/* Output */}
        {Array.from({ length: outN }).map((_, r) =>
          Array.from({ length: outN }).map((_, c) => {
            const here = r === oy && c === ox;
            const [x, y] = outXY(r, c);
            return (
              <g key={`q${r}-${c}`}>
                <rect x={x} y={y} width={ocell} height={ocell} rx="2"
                  fill={here ? "var(--accent)" : "var(--bg-card)"}
                  stroke={here ? "var(--accent)" : "var(--line-strong)"} strokeWidth={here ? 1.5 : 0.8} />
                {here && (
                  <text x={x + ocell / 2} y={y + ocell / 2 + 4} textAnchor="middle"
                    fontSize="12" fontFamily="var(--font-mono)" fill="var(--bg-inset)">{resultTxt}</text>
                )}
              </g>
            );
          })
        )}

        <text x={ox0} y={H - 14} fontSize="11" fontFamily="var(--font-mono)" fill="var(--accent)">
          {mode === "max" ? "max" : "avg"}({cells.join(",")}) = {resultTxt}
        </text>
      </svg>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-muted)" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setMode("max")}
            style={{ cursor: "pointer", fontWeight: mode === "max" ? 700 : 400, color: mode === "max" ? "var(--accent)" : "var(--text-muted)" }}>
            max-pooling
          </button>
          <span>/</span>
          <button onClick={() => setMode("avg")}
            style={{ cursor: "pointer", fontWeight: mode === "avg" ? 700 : 400, color: mode === "avg" ? "var(--accent)" : "var(--text-muted)" }}>
            average-pooling
          </button>
        </div>
        <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => setPos((q) => (q <= 0 ? nOut - 1 : q - 1))} style={{ cursor: "pointer" }}>◀</button>
          okno {p + 1}/{nOut}
          <button onClick={() => setPos((q) => (q + 1) % nOut)} style={{ cursor: "pointer" }}>▶</button>
        </span>
        <span style={{ color: "var(--text-faint)" }}>okno 2×2, stride 2, žádné parametry</span>
      </div>
    </div>
  );
}
