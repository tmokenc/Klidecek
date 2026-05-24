// gshare-correlated-branches — feed a correlated branch sequence to bimodal
// and gshare predictors, compare accuracy. GHR shift register shown live.
import { useState } from "react";

const GHR_BITS = 4;
const BHT_BITS = 6;
const BHT_SIZE = 1 << BHT_BITS;

function makeBHT() { return new Array(BHT_SIZE).fill(2); } // weak T

const PATTERNS = {
  copy: {
    label: "if(a) X; if(a) Y; (perfect correlation, a alterující)",
    gen: (n) => {
      const seq = [];
      for (let i = 0; i < n; i++) {
        const a = (i >> 1) % 2 === 0; // alternates every 2 iters
        seq.push({ pc: 0x100, taken: a });
        seq.push({ pc: 0x200, taken: a });
      }
      return seq;
    },
  },
  oppposite: {
    label: "if(a) X; if(!a) Y; (opposite correlation)",
    gen: (n) => {
      const seq = [];
      for (let i = 0; i < n; i++) {
        const a = (i % 3) === 0;
        seq.push({ pc: 0x100, taken: a });
        seq.push({ pc: 0x200, taken: !a });
      }
      return seq;
    },
  },
  unrelated: {
    label: "if(a) X; if(b) Y; (unrelated)",
    gen: (n) => {
      let r = 1;
      const seq = [];
      for (let i = 0; i < n; i++) {
        r = (r * 1664525 + 1013904223) >>> 0;
        const a = (r & 1) === 1;
        r = (r * 1664525 + 1013904223) >>> 0;
        const b = (r & 1) === 1;
        seq.push({ pc: 0x100, taken: a });
        seq.push({ pc: 0x200, taken: b });
      }
      return seq;
    },
  },
};

export default function GshareCorrelatedBranches() {
  const [patternKey, setPatternKey] = useState("copy");
  const [trained, setTrained] = useState(0);

  const seq = PATTERNS[patternKey].gen(50);
  const upTo = seq.slice(0, trained + 1);

  // simulate bimodal + gshare
  const bimodal = makeBHT();
  const gshare = makeBHT();
  let ghr = 0;
  const trace = [];
  let okBim = 0, okGsh = 0;

  upTo.forEach((br) => {
    const idxBim = (br.pc >> 2) & (BHT_SIZE - 1);
    const idxGsh = ((br.pc >> 2) ^ ghr) & (BHT_SIZE - 1);
    const predBim = bimodal[idxBim] >= 2 ? "T" : "N";
    const predGsh = gshare[idxGsh] >= 2 ? "T" : "N";
    const outcome = br.taken ? "T" : "N";
    if (predBim === outcome) okBim++;
    if (predGsh === outcome) okGsh++;
    // update
    bimodal[idxBim] += br.taken ? 1 : -1;
    bimodal[idxBim] = Math.max(0, Math.min(3, bimodal[idxBim]));
    gshare[idxGsh] += br.taken ? 1 : -1;
    gshare[idxGsh] = Math.max(0, Math.min(3, gshare[idxGsh]));
    ghr = ((ghr << 1) | (br.taken ? 1 : 0)) & ((1 << GHR_BITS) - 1);
    trace.push({ pc: br.pc, outcome, predBim, predGsh, idxBim, idxGsh, ghr });
  });

  const W = 580, H = 280;
  const accB = upTo.length > 0 ? (okBim / upTo.length * 100).toFixed(1) : "0";
  const accG = upTo.length > 0 ? (okGsh / upTo.length * 100).toFixed(1) : "0";

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <select value={patternKey} onChange={e => { setPatternKey(e.target.value); setTrained(0); }} style={ctrl}>
          {Object.entries(PATTERNS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={() => setTrained(Math.max(0, trained - 1))} style={btn(false)}>←</button>
        <button onClick={() => setTrained(Math.min(seq.length - 1, trained + 1))} style={btn(false)}>krok →</button>
        <button onClick={() => setTrained(seq.length - 1)} style={btn(false)}>vše ({seq.length})</button>
        <button onClick={() => setTrained(0)} style={btn(false)}>reset</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* GHR */}
        <text x={20} y={20} fontSize="11" fill="var(--text)" fontWeight="600">GHR (Global History Register, {GHR_BITS} bit):</text>
        {Array.from({ length: GHR_BITS }).map((_, i) => {
          const bit = (ghr >> (GHR_BITS - 1 - i)) & 1;
          return (
            <g key={i}>
              <rect x={20 + i * 26} y={26} width={22} height={22} fill={bit ? "oklch(0.7 0.15 145)" : "var(--bg-inset)"}
                stroke="var(--line)" rx="2" />
              <text x={31 + i * 26} y={42} textAnchor="middle" fontSize="11" fontWeight="700"
                fill={bit ? "white" : "var(--text-muted)"}>{bit}</text>
            </g>
          );
        })}
        <text x={20 + GHR_BITS * 26 + 12} y={42} fontSize="9.5" fill="var(--text-faint)">posun ← s každým výsledkem</text>

        {/* hash */}
        <text x={300} y={20} fontSize="11" fill="var(--text)" fontWeight="600">gshare index = (PC ⊕ GHR)</text>
        <text x={300} y={36} fontSize="10" fill="var(--text-muted)" fontFamily="ui-monospace, monospace">
          PC=0x{trace[trace.length - 1]?.pc.toString(16) || "—"} → idx={trace[trace.length - 1]?.idxGsh ?? "—"}
        </text>

        {/* accuracy bars */}
        <g fontSize="10" fill="var(--text)">
          <text x={20} y={80}>bimodal (PC only)</text>
          <text x={300} y={80}>gshare (PC ⊕ GHR)</text>
          <rect x={20} y={88} width={250} height={20} fill="var(--bg-inset)" stroke="var(--line)" rx="2" />
          <rect x={20} y={88} width={250 * okBim / Math.max(1, upTo.length)} height={20} fill="oklch(0.6 0.16 245)" rx="2" />
          <text x={145} y={102} textAnchor="middle" fill="white" fontWeight="600">{accB}%</text>
          <rect x={300} y={88} width={250} height={20} fill="var(--bg-inset)" stroke="var(--line)" rx="2" />
          <rect x={300} y={88} width={250 * okGsh / Math.max(1, upTo.length)} height={20} fill="oklch(0.65 0.16 145)" rx="2" />
          <text x={425} y={102} textAnchor="middle" fill="white" fontWeight="600">{accG}%</text>
        </g>

        {/* trace strip */}
        <text x={20} y={135} fontSize="10.5" fill="var(--text)" fontWeight="600">trace (poslední {Math.min(30, trace.length)} skoků):</text>
        <g fontSize="8" fontFamily="ui-monospace, monospace">
          {trace.slice(-30).map((b, i) => {
            const bimOk = b.predBim === b.outcome;
            const gshOk = b.predGsh === b.outcome;
            return (
              <g key={i}>
                <rect x={20 + i * 18} y={142} width={16} height={18} fill={bimOk ? "oklch(0.6 0.16 245 / 0.3)" : "oklch(0.65 0.18 22 / 0.4)"}
                  stroke={bimOk ? "oklch(0.6 0.16 245)" : "oklch(0.65 0.18 22)"} strokeWidth="0.7" />
                <rect x={20 + i * 18} y={162} width={16} height={18} fill={gshOk ? "oklch(0.65 0.16 145 / 0.3)" : "oklch(0.65 0.18 22 / 0.4)"}
                  stroke={gshOk ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.18 22)"} strokeWidth="0.7" />
                <text x={28 + i * 18} y={155} textAnchor="middle" fill="var(--text)">{b.outcome}</text>
                <text x={28 + i * 18} y={175} textAnchor="middle" fill="var(--text-muted)">{b.pc === 0x100 ? "a" : "b"}</text>
              </g>
            );
          })}
        </g>

        <text x={20} y={210} fontSize="9.5" fill="var(--text-faint)">
          Modrý řádek = bimodal predikce; zelený = gshare. Červená = chyba.
        </text>
        <text x={20} y={250} fontSize="10" fill="var(--text)">
          Při "copy" korelaci: bimodal nemá kontext, GHR vidí poslední větve — gshare se naučí.
        </text>
        <text x={20} y={266} fontSize="10" fill="var(--text-muted)">
          Při "unrelated": gshare degraduje pseudo-náhodně, bimodal stabilní okolo 50%.
        </text>
      </svg>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 6px", borderRadius: 3, fontSize: 11 };
function btn(active) {
  return { ...ctrl, background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", cursor: "pointer", padding: "3px 9px" };
}
