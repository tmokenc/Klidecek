// Word2Vec skip-gram — center+context window + 2D embedding projection.
import { useState } from "react";

const CORPUS = ["the", "king", "loves", "the", "queen", "the", "queen", "loves", "the", "king",
                "a", "man", "loves", "a", "woman", "a", "woman", "loves", "a", "man"];

const WINDOW = 2;

// Toy 2D embeddings (pretend trained — close in semantic space)
const EMBEDDINGS = {
  king:  [-1.5,  1.2],
  queen: [-1.2,  1.5],
  man:   [-1.5, -1.0],
  woman: [-1.2, -1.2],
  loves: [ 1.0,  0.2],
  the:   [ 1.5, -1.5],
  a:     [ 1.7, -1.6],
};

export default function Word2VecSkipgram() {
  const [centerIdx, setCenterIdx] = useState(2);
  const [showAnalogy, setShowAnalogy] = useState(false);

  const center = CORPUS[centerIdx];
  const context = [];
  for (let i = Math.max(0, centerIdx - WINDOW); i <= Math.min(CORPUS.length - 1, centerIdx + WINDOW); i++) {
    if (i !== centerIdx) context.push({ word: CORPUS[i], position: i });
  }

  const W = 540, H = 320;
  const PLOT_X = 280, PLOT_W = 240, PLOT_Y = 30, PLOT_H = 260;
  const eMin = -2.2, eMax = 2.2;
  const ex = (x) => PLOT_X + ((x - eMin) / (eMax - eMin)) * PLOT_W;
  const ey = (y) => PLOT_Y + (1 - (y - eMin) / (eMax - eMin)) * PLOT_H;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 11 }}>
        <span style={{ color: "var(--text-muted)" }}>centrum okna:</span>
        <input type="range" min={0} max={CORPUS.length - 1} value={centerIdx} onChange={(e) => setCenterIdx(+e.target.value)} style={{ width: 200 }}/>
        <span style={{ fontFamily: "var(--font-mono)" }}>{centerIdx}</span>
        <label style={{ display: "flex", gap: 4, alignItems: "center", marginLeft: 8 }}>
          <input type="checkbox" checked={showAnalogy} onChange={(e) => setShowAnalogy(e.target.checked)}/>
          analogie king−man+woman ≈ queen
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block", maxWidth: 620 }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        {/* Corpus row */}
        {CORPUS.map((w, i) => {
          const x0 = 16 + i * 12;
          const isCenter = i === centerIdx;
          const inWindow = Math.abs(i - centerIdx) <= WINDOW && i !== centerIdx;
          return (
            <g key={i} onClick={() => setCenterIdx(i)} style={{ cursor: "pointer" }}>
              <rect x={x0} y={20} width={11} height={20}
                fill={isCenter ? "oklch(0.7 0.18 60)" : (inWindow ? "color-mix(in oklch, oklch(0.7 0.18 60) 30%, var(--bg-card))" : "var(--bg-card)")}
                stroke="var(--line)" strokeWidth="0.5"/>
              <text x={x0 + 5.5} y={56} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-muted)"
                transform={`rotate(45, ${x0 + 5.5}, 56)`}>
                {w}
              </text>
            </g>
          );
        })}

        {/* Window summary */}
        <g>
          <text x={20} y={100} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)" fontWeight="700">
            center: <tspan fill="oklch(0.78 0.18 60)">{center}</tspan>
          </text>
          <text x={20} y={118} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">
            context: [{context.map((c) => c.word).join(", ")}]
          </text>
          <text x={20} y={140} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
            Skip-gram objective:
          </text>
          <text x={20} y={156} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
            max Σ log P(c | center)
          </text>
          <text x={20} y={176} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
            for c ∈ window
          </text>
        </g>

        {/* Plot: embeddings */}
        <g>
          <line x1={PLOT_X} y1={ey(0)} x2={PLOT_X + PLOT_W} y2={ey(0)} stroke="var(--line)" strokeWidth="0.5"/>
          <line x1={ex(0)} y1={PLOT_Y} x2={ex(0)} y2={PLOT_Y + PLOT_H} stroke="var(--line)" strokeWidth="0.5"/>
          <text x={PLOT_X + PLOT_W - 4} y={ey(0) - 4} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)" textAnchor="end">embedding 2D</text>

          {Object.entries(EMBEDDINGS).map(([w, e]) => {
            const isCenter = w === center;
            const inContext = context.some((c) => c.word === w);
            return (
              <g key={w}>
                <circle cx={ex(e[0])} cy={ey(e[1])} r="5"
                  fill={isCenter ? "oklch(0.7 0.18 60)" : (inContext ? "oklch(0.6 0.2 60)" : "var(--accent)")}
                  stroke={isCenter || inContext ? "white" : "var(--bg-inset)"} strokeWidth="1.5"/>
                <text x={ex(e[0]) + 8} y={ey(e[1]) + 4} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">
                  {w}
                </text>
              </g>
            );
          })}

          {/* Analogy vectors */}
          {showAnalogy && (
            <>
              <line x1={ex(EMBEDDINGS.man[0])} y1={ey(EMBEDDINGS.man[1])}
                x2={ex(EMBEDDINGS.king[0])} y2={ey(EMBEDDINGS.king[1])}
                stroke="oklch(0.7 0.2 30)" strokeWidth="1.5" markerEnd="url(#an-arr)"/>
              <line x1={ex(EMBEDDINGS.woman[0])} y1={ey(EMBEDDINGS.woman[1])}
                x2={ex(EMBEDDINGS.queen[0])} y2={ey(EMBEDDINGS.queen[1])}
                stroke="oklch(0.7 0.2 30)" strokeWidth="1.5" markerEnd="url(#an-arr)"/>
              <text x={ex(-0.5)} y={ey(1.7)} fontSize="10" fontFamily="var(--font-mono)" fill="oklch(0.78 0.18 30)" textAnchor="middle">
                queen − woman ≈ king − man
              </text>
            </>
          )}
          <defs>
            <marker id="an-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M 0 0 L 5 3 L 0 6 z" fill="oklch(0.7 0.2 30)"/>
            </marker>
          </defs>
        </g>
      </svg>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Skip-gram: pro center slovo predikuj okolní (context) slova. Trénink přes negative sampling.
        Naučené embeddingy zachycují *sémantické* (král/královna) i *syntaktické* (sloveso/podstatné jméno) podobnosti.
        Klasické analogie: king − man + woman ≈ queen. (FastText doplňuje sub-word; GloVe agreguje globální statistiky.)
      </div>
    </div>
  );
}
