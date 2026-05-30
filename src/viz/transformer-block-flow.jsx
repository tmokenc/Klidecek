// Transformer block — data flow per layer, click stage to see Q/K/V projections / attention / FFN.
import { useState } from "react";

const STAGES = [
  { id: "input",   label: "1. Input embedding + Positional encoding",
    detail: "Každý token mapován na vektor dim d (např. 512). Pozičná informace přidána sin/cos kódováním (Vaswani 2017) nebo learned PE." },
  { id: "ln1",     label: "2. LayerNorm (pre-norm v moderním Transformeru)",
    detail: "LayerNorm normalizuje aktivace v rámci jednoho tokenu. V GPT/LLAMA: pre-norm (před attention); v původním Transformeru post-norm." },
  { id: "qkv",     label: "3. Lineární projekce Q, K, V (multi-head)",
    detail: "Q = X·Wq, K = X·Wk, V = X·Wv. Rozděleno do H hlav (typicky 8-16), každá pracuje s d/H dim." },
  { id: "attn",    label: "4. Scaled dot-product attention",
    detail: "softmax(Q·Kᵀ / √dk) · V — váhy přes všechny tokeny. Kauzální maska v decoderu (zákaz hledět do budoucnosti)." },
  { id: "proj",    label: "5. Concat heads + lineární projekce W_o",
    detail: "H výstupů hlav konkatenováno → lineární vrstva W_o vrací zpět do d. Plus residual connection (+ X)." },
  { id: "ln2",     label: "6. LayerNorm + Feed-Forward MLP",
    detail: "FFN: dvouvrstvá MLP s GELU/ReLU mezi. Často d → 4d → d. Aplikuje se *per token* (point-wise)." },
  { id: "out",     label: "7. Residual + output",
    detail: "Druhé residual + výstup do dalšího bloku. Block stackováno N× (BERT-base: 12, GPT-3: 96)." },
];

const D = 8; // toy embedding dim
const SEQ = 4; // toy sequence length

// Pre-computed toy values
const TOY_TOKENS = ["I", "love", "AI", "."];

export default function TransformerBlockFlow() {
  const [stage, setStage] = useState(0);

  const W = 540, H = 360;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 11 }}>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => setStage(0)} style={btnStyle()}>⏮</button>
          <button onClick={() => setStage((s) => Math.max(0, s - 1))} style={btnStyle()}>◀</button>
          <button onClick={() => setStage((s) => Math.min(STAGES.length - 1, s + 1))} style={btnStyle()}>▶</button>
          <button onClick={() => setStage(STAGES.length - 1)} style={btnStyle()}>⏭</button>
        </div>
        <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
          stage {stage + 1}/{STAGES.length}
        </span>
      </div>

      <svg viewBox={`-20 0 ${W + 20} ${H}`} style={{ width: "100%", display: "block", maxWidth: 600 }}>
        <rect x={-20} width={W + 20} height={H} fill="var(--bg-inset)" />
        {/* Vertical stack of stages */}
        {STAGES.map((s, i) => {
          const yPos = 20 + i * 46;
          const active = i === stage;
          const visited = i < stage;
          const fill = active ? "oklch(0.55 0.18 60)" : (visited ? "color-mix(in oklch, var(--accent) 25%, var(--bg-card))" : "var(--bg-card)");
          const textColor = active ? "white" : "var(--text)";
          return (
            <g key={s.id} onClick={() => setStage(i)} style={{ cursor: "pointer" }}>
              <rect x={70} y={yPos} width={380} height={36} rx={4}
                fill={fill} stroke={active ? "oklch(0.7 0.18 60)" : "var(--line-strong)"} strokeWidth={active ? 2 : 1}/>
              <text x={80} y={yPos + 14} fontSize="10" fontFamily="var(--font-mono)" fill={active ? "white" : "var(--text-muted)"}>step {i + 1}</text>
              <text x={80} y={yPos + 28} fontSize="11" fill={textColor} fontWeight={active ? 700 : 500}>
                {s.label}
              </text>
              {/* Arrow downward */}
              {i < STAGES.length - 1 && (
                <line x1={W / 2} y1={yPos + 36} x2={W / 2} y2={yPos + 46}
                  stroke="var(--accent)" strokeWidth={1.2} markerEnd="url(#tfa-arr)"/>
              )}
            </g>
          );
        })}
        {/* Residual arrows */}
        <g stroke="oklch(0.7 0.18 145)" strokeWidth="1.5" strokeDasharray="4 3" fill="none">
          {/* residual from before attn to after proj */}
          <path d={`M 50 ${20 + 1 * 46 + 18} L 30 ${20 + 1 * 46 + 18} L 30 ${20 + 4 * 46 + 18} L 50 ${20 + 4 * 46 + 18}`}/>
          {/* residual from before FFN to after FFN */}
          <path d={`M 470 ${20 + 4 * 46 + 18} L 490 ${20 + 4 * 46 + 18} L 490 ${20 + 6 * 46 + 18} L 470 ${20 + 6 * 46 + 18}`}/>
        </g>
        <text x={28} y={20 + 2.5 * 46} fontSize="9" fill="oklch(0.7 0.18 145)" fontFamily="var(--font-mono)" textAnchor="end">
          residual
        </text>
        <text x={494} y={20 + 5.5 * 46} fontSize="9" fill="oklch(0.7 0.18 145)" fontFamily="var(--font-mono)" textAnchor="start">
          residual
        </text>
        <defs>
          <marker id="tfa-arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 z" fill="var(--accent)"/>
          </marker>
        </defs>
      </svg>

      <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 10, borderRadius: 4, fontSize: 11, lineHeight: 1.6 }}>
        <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
          detail
        </div>
        <div style={{ marginBottom: 6 }}>{STAGES[stage].detail}</div>
        {stage === 2 && (
          <div style={{ marginTop: 6, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            X ∈ R^(T×d) → Q, K, V ∈ R^(T×d) → reshape do H·R^(T×d/H)
          </div>
        )}
        {stage === 3 && (
          <div style={{ marginTop: 6 }}>
            <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              Attention(Q, K, V) = softmax(Q · Kᵀ / √dk) · V
            </div>
            <div style={{ marginTop: 4, fontSize: 10, color: "var(--text-faint)" }}>
              Dělení √dk stabilizuje softmax — pro velké dk by se logits saturovaly.
            </div>
          </div>
        )}
        {stage === 5 && (
          <div style={{ marginTop: 6, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            FFN(x) = W₂ · GELU(W₁ · x + b₁) + b₂
          </div>
        )}
      </div>

      {/* Mini token diagram for the active stage */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 11 }}>
        {TOY_TOKENS.map((t, i) => (
          <div key={i} style={{
            padding: "6px 10px", border: "1px solid var(--line)", borderRadius: 3,
            background: stage >= 0 ? "var(--bg-card)" : "transparent",
            color: "var(--text)",
            opacity: stage === 0 ? 1 : 0.85,
          }}>
            {t}
            <span style={{ color: "var(--text-faint)", marginLeft: 4 }}>[{i}]</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        Klikni na libovolný řádek. Klíčové elementy: <strong>multi-head</strong> (paralelní pohledy), <strong>residual</strong>
        (deep skips), <strong>LayerNorm</strong> (stabilita), <strong>positional</strong> (info o pořadí — attention sám je permutačně invariantní).
        Standardní block stackováno N×: BERT-base = 12, GPT-3 = 96, GPT-4 odhad 120+.
      </div>
    </div>
  );
}

function btnStyle() {
  return { background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 6px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
