// Attention heatmap — sentence pair, multi-head visualization, causal masking toggle.
import { useState } from "react";

const SENTENCES = {
  "translate": {
    label: "překlad EN → CS",
    src: ["The", "cat", "sees", "the", "dog"],
    tgt: ["Kočka", "vidí", "psa"],
    // Pretend attention from decoder position to encoder positions (rows = tgt, cols = src)
    heads: [
      // Head 0: aligns content words
      [[0.05, 0.85, 0.04, 0.03, 0.03],
       [0.03, 0.08, 0.83, 0.03, 0.03],
       [0.02, 0.05, 0.03, 0.05, 0.85]],
      // Head 1: attends to article + subject
      [[0.40, 0.50, 0.04, 0.03, 0.03],
       [0.20, 0.15, 0.55, 0.05, 0.05],
       [0.04, 0.08, 0.10, 0.35, 0.43]],
      // Head 2: smeared (general context)
      [[0.20, 0.25, 0.20, 0.18, 0.17],
       [0.18, 0.20, 0.25, 0.18, 0.19],
       [0.18, 0.18, 0.20, 0.22, 0.22]],
      // Head 3: position-biased (diagonal)
      [[0.55, 0.20, 0.10, 0.10, 0.05],
       [0.15, 0.50, 0.20, 0.10, 0.05],
       [0.05, 0.10, 0.20, 0.30, 0.35]],
    ],
  },
  "self-attn": {
    label: "self-attention v rámci věty",
    src: ["the", "cat", "sat", "on", "the", "mat"],
    tgt: ["the", "cat", "sat", "on", "the", "mat"],
    heads: [
      // Head 0: content + coref (the ↔ mat, cat ↔ sat)
      [[0.50, 0.10, 0.05, 0.05, 0.10, 0.20],
       [0.10, 0.30, 0.40, 0.05, 0.05, 0.10],
       [0.05, 0.45, 0.30, 0.10, 0.05, 0.05],
       [0.05, 0.05, 0.15, 0.40, 0.10, 0.25],
       [0.15, 0.05, 0.05, 0.10, 0.30, 0.35],
       [0.10, 0.10, 0.05, 0.15, 0.20, 0.40]],
      // Head 1: previous token bias
      [[0.90, 0.05, 0.02, 0.01, 0.01, 0.01],
       [0.60, 0.30, 0.05, 0.02, 0.02, 0.01],
       [0.05, 0.65, 0.20, 0.05, 0.03, 0.02],
       [0.05, 0.10, 0.60, 0.18, 0.05, 0.02],
       [0.05, 0.05, 0.10, 0.55, 0.20, 0.05],
       [0.03, 0.05, 0.07, 0.10, 0.55, 0.20]],
      // Head 2: skip-token (positional)
      [[0.30, 0.05, 0.50, 0.05, 0.05, 0.05],
       [0.05, 0.30, 0.05, 0.50, 0.05, 0.05],
       [0.05, 0.05, 0.30, 0.05, 0.50, 0.05],
       [0.05, 0.05, 0.05, 0.30, 0.05, 0.50],
       [0.05, 0.05, 0.05, 0.05, 0.50, 0.30],
       [0.05, 0.05, 0.05, 0.05, 0.05, 0.75]],
      // Head 3: global average
      [[0.18, 0.16, 0.16, 0.16, 0.17, 0.17],
       [0.17, 0.18, 0.16, 0.16, 0.16, 0.17],
       [0.16, 0.17, 0.18, 0.16, 0.16, 0.17],
       [0.16, 0.16, 0.17, 0.18, 0.16, 0.17],
       [0.17, 0.16, 0.16, 0.16, 0.18, 0.17],
       [0.17, 0.17, 0.16, 0.16, 0.16, 0.18]],
    ],
  },
};

function maskCausal(matrix) {
  return matrix.map((row, i) => {
    const masked = row.map((v, j) => (j > i ? 0 : v));
    const sum = masked.reduce((a, b) => a + b, 0);
    return sum > 0 ? masked.map((v) => v / sum) : masked;
  });
}

export default function AttentionHeatmap() {
  const [sentKey, setSentKey] = useState("translate");
  const [head, setHead] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  const [causal, setCausal] = useState(false);

  const data = SENTENCES[sentKey];
  let matrix = data.heads[head];
  if (causal && sentKey === "self-attn") matrix = maskCausal(matrix);

  const numRows = data.tgt.length;
  const numCols = data.src.length;
  const cell = 50;
  const labelW = 80;
  const labelH = 60;
  const W = labelW + numCols * cell;
  const H = labelH + numRows * cell;

  function colorFor(v) {
    const t = Math.min(1, v / 0.9);
    return `oklch(${0.95 - t * 0.5} 0.13 60)`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>scénář:</span>
          <select value={sentKey} onChange={(e) => { setSentKey(e.target.value); setSelectedRow(null); setHead(0); }}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 4px", borderRadius: 3 }}>
            {Object.entries(SENTENCES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>head:</span>
          {data.heads.map((_, i) => (
            <button key={i} onClick={() => setHead(i)}
              style={{
                background: head === i ? "var(--accent)" : "var(--bg-card)",
                color: head === i ? "white" : "var(--text)",
                border: "1px solid var(--line)", padding: "2px 8px", borderRadius: 3, fontSize: 11, cursor: "pointer",
                fontFamily: "var(--font-mono)",
              }}>
              {i}
            </button>
          ))}
        </div>
        {sentKey === "self-attn" && (
          <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <input type="checkbox" checked={causal} onChange={(e) => setCausal(e.target.checked)} />
            kauzální maska
          </label>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 560 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* Source labels (columns) */}
        {data.src.map((tok, j) => (
          <text key={j} x={labelW + j * cell + cell / 2} y={labelH - 8} textAnchor="middle"
            fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">
            {tok}
          </text>
        ))}
        {/* Target labels (rows) */}
        {data.tgt.map((tok, i) => (
          <text key={i} x={labelW - 8} y={labelH + i * cell + cell / 2 + 4} textAnchor="end"
            fontSize="11" fontFamily="var(--font-mono)"
            fill={selectedRow === i ? "oklch(0.7 0.2 60)" : "var(--text)"}>
            {tok}
          </text>
        ))}
        {/* Matrix */}
        {matrix.map((row, i) =>
          row.map((v, j) => (
            <g key={`${i}-${j}`} onMouseEnter={() => setSelectedRow(i)} onMouseLeave={() => setSelectedRow(null)}>
              <rect x={labelW + j * cell} y={labelH + i * cell} width={cell} height={cell}
                fill={colorFor(v)}
                stroke={selectedRow === i ? "oklch(0.7 0.2 60)" : "var(--line)"}
                strokeWidth={selectedRow === i ? 1.5 : 0.5}/>
              <text x={labelW + j * cell + cell / 2} y={labelH + i * cell + cell / 2 + 4} textAnchor="middle"
                fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">
                {v < 0.01 ? "·" : v.toFixed(2)}
              </text>
            </g>
          ))
        )}
      </svg>

      {selectedRow !== null && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 6, borderRadius: 3, fontSize: 11, fontFamily: "var(--font-mono)" }}>
          Σ řádek &quot;{data.tgt[selectedRow]}&quot; = {matrix[selectedRow].reduce((a, b) => a + b, 0).toFixed(3)}
          {" "}
          (každý řádek je softmax distribuce přes zdrojové tokeny)
        </div>
      )}

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Každý řádek = pozornost jednoho cílového tokenu přes všechny zdrojové. Hlavy se učí různé vzory — některé content-based (obsah),
        některé position-based (sousednost), některé smeared (kontext). Kauzální maska zabrání hlavě dívat se na budoucí tokeny (decoder).
      </div>
    </div>
  );
}
