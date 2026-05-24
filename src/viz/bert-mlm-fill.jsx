// BERT masked language modeling — predict masked word from bidirectional context vs GPT left-to-right.
import { useState } from "react";

const SENTENCES = {
  "simple": {
    label: "Praha je hlavní [MASK] České republiky.",
    tokens: ["Praha", "je", "hlavní", "[MASK]", "České", "republiky", "."],
    maskIdx: 3,
    bertTop: [
      { token: "město",   p: 0.62 },
      { token: "centrum", p: 0.18 },
      { token: "metropole", p: 0.09 },
      { token: "součást", p: 0.04 },
      { token: "část", p: 0.03 },
    ],
    gptTop: [
      { token: "město",   p: 0.31 },
      { token: "centrum", p: 0.12 },
      { token: "středisko", p: 0.10 },
      { token: "kulturní", p: 0.08 },
      { token: "evropské", p: 0.05 },
    ],
  },
  "tricky": {
    label: "Pes vidí kočku, protože ta [MASK] na střeše.",
    tokens: ["Pes", "vidí", "kočku", ",", "protože", "ta", "[MASK]", "na", "střeše", "."],
    maskIdx: 6,
    bertTop: [
      { token: "sedí",    p: 0.41 },
      { token: "spí",     p: 0.22 },
      { token: "leží",    p: 0.16 },
      { token: "je",      p: 0.08 },
      { token: "stojí",   p: 0.05 },
    ],
    gptTop: [
      { token: "byla",    p: 0.20 },
      { token: "je",      p: 0.18 },
      { token: "sedí",    p: 0.15 },
      { token: "skočila", p: 0.10 },
      { token: "vidí",    p: 0.08 },
    ],
  },
};

export default function BertMlmFill() {
  const [sentKey, setSentKey] = useState("simple");
  const [model, setModel] = useState("BERT");

  const data = SENTENCES[sentKey];
  const top = model === "BERT" ? data.bertTop : data.gptTop;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", fontSize: 11 }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ color: "var(--text-muted)" }}>věta:</span>
          <select value={sentKey} onChange={(e) => setSentKey(e.target.value)}
            style={{ background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 4px", borderRadius: 3 }}>
            {Object.entries(SENTENCES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <div style={{ display: "flex", gap: 4 }}>
          {["BERT", "GPT"].map((m) => (
            <button key={m} onClick={() => setModel(m)}
              style={{
                background: model === m ? "var(--accent)" : "var(--bg-card)",
                color: model === m ? "white" : "var(--text)",
                border: "1px solid var(--line)", padding: "2px 12px", borderRadius: 3, fontSize: 11, cursor: "pointer",
                fontFamily: "var(--font-mono)",
              }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Token grid showing context visibility */}
      <div style={{ background: "var(--bg-card)", border: "1px solid var(--line)", padding: 8, borderRadius: 4 }}>
        <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
          {model === "BERT" ? "bidirectional context (BERT — vidí oboustranně)" : "left-only context (GPT — autoregresivní)"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, fontFamily: "var(--font-mono)", fontSize: 12 }}>
          {data.tokens.map((tok, i) => {
            const isMask = i === data.maskIdx;
            const visible = model === "BERT" ? (i !== data.maskIdx) : (i < data.maskIdx);
            return (
              <span key={i} style={{
                padding: "4px 8px", borderRadius: 3, border: "1px solid var(--line)",
                background: isMask ? "oklch(0.7 0.18 60)" : (visible ? "color-mix(in oklch, var(--accent) 18%, var(--bg-card))" : "var(--bg-inset)"),
                color: isMask ? "white" : "var(--text)",
                opacity: visible || isMask ? 1 : 0.3,
                textDecoration: !visible && !isMask ? "line-through" : "none",
              }}>
                {tok}
              </span>
            );
          })}
        </div>
      </div>

      {/* Predictions */}
      <div>
        <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>
          top-5 predikce pro [MASK]
        </div>
        <svg viewBox="0 0 540 180" style={{ width: "100%", maxWidth: 620, display: "block" }}>
          <rect width="540" height="180" fill="var(--bg-inset)"/>
          {top.map((item, i) => {
            const y = 14 + i * 32;
            const barLen = item.p * 350;
            const isTop = i === 0;
            return (
              <g key={i}>
                <text x={100} y={y + 16} textAnchor="end" fontSize="12" fontFamily="var(--font-mono)" fill="var(--text)" fontWeight={isTop ? 700 : 400}>
                  {item.token}
                </text>
                <rect x={108} y={y + 4} width={barLen} height={20}
                  fill={isTop ? "oklch(0.7 0.18 60)" : "var(--accent)"} opacity={Math.min(1, 0.4 + item.p)}/>
                <text x={118 + barLen + 4} y={y + 18} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-muted)">
                  {(item.p * 100).toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-faint)", lineHeight: 1.45 }}>
        <strong>BERT</strong>: encoder, vidí <em>oba</em> směry; trénovaný na MLM (predikce náhodně maskovaných slov, 15 % korpusu).
        <strong> GPT</strong>: decoder, vidí jen <em>levo</em>; trénovaný na next-token prediction. Pro tuto úlohu (fill-in-the-blank)
        BERT typicky dává ostřejší distribuci, protože využívá *pravou stranu*. GPT musí hádat na základě prefixu.
      </div>
    </div>
  );
}
