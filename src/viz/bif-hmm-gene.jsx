// HMM gene-finder + Viterbi, step by step.
// A 3-state HMM (intergenic / exon / intron) emits nucleotides A C G T.
// We step the Viterbi DP column by column over a fixed sequence: each cell holds
// the log-prob of the best path ending in that state, and a back-pointer. After the
// last column we trace back the single most probable state path = gene annotation.
import { useState } from "react";

export default function BifHmmGene() {
  // States: 0 = intergenic (I), 1 = exon (E), 2 = intron (N)
  const STATES = [
    { key: "I", name: "intergen.", color: "var(--text-muted)" },
    { key: "E", name: "exon", color: "var(--accent)" },
    { key: "N", name: "intron", color: "var(--accent-line)" },
  ];
  const SYM = ["A", "C", "G", "T"];

  // Observed sequence (short, so the DP grid fits the canvas).
  // GC-rich middle (exon) + AT-rich stretch (intron) so the path visibly switches states.
  const seq = "ATGCGCATTAG".split("");
  const T = seq.length;
  const K = STATES.length;

  // Emission probabilities b[state][symbol]:  A C G T
  //  exon: GC-rich, intron: AT-rich, intergenic: ~uniform.
  const emit = [
    { A: 0.28, C: 0.22, G: 0.22, T: 0.28 }, // intergenic
    { A: 0.12, C: 0.38, G: 0.38, T: 0.12 }, // exon
    { A: 0.40, C: 0.10, G: 0.10, T: 0.40 }, // intron
  ];
  // Transition probabilities a[from][to]  (rows sum to 1):  to I, E, N
  const trans = [
    [0.55, 0.45, 0.00], // from intergenic -> stay or enter exon
    [0.05, 0.70, 0.25], // from exon -> stay, leave, or splice into intron (donor)
    [0.00, 0.30, 0.70], // from intron -> stay or back to exon (acceptor)
  ];
  const init = [0.7, 0.3, 0.0]; // start mostly intergenic

  const L = Math.log;
  // Viterbi DP: V[t][k] = best log-prob of a path ending in state k at position t.
  const V = Array.from({ length: T }, () => new Array(K).fill(-Infinity));
  const bp = Array.from({ length: T }, () => new Array(K).fill(-1));
  for (let k = 0; k < K; k++) {
    const e = emit[k][seq[0]];
    V[0][k] = init[k] > 0 && e > 0 ? L(init[k]) + L(e) : -Infinity;
  }
  for (let t = 1; t < T; t++) {
    for (let k = 0; k < K; k++) {
      const e = emit[k][seq[t]];
      if (e <= 0) continue;
      let best = -Infinity, arg = -1;
      for (let j = 0; j < K; j++) {
        if (V[t - 1][j] === -Infinity || trans[j][k] <= 0) continue;
        const cand = V[t - 1][j] + L(trans[j][k]);
        if (cand > best) { best = cand; arg = j; }
      }
      if (arg >= 0) { V[t][k] = best + L(e); bp[t][k] = arg; }
    }
  }
  // Traceback: most probable final state, then follow back-pointers.
  let lastBest = 0;
  for (let k = 1; k < K; k++) if (V[T - 1][k] > V[T - 1][lastBest]) lastBest = k;
  const path = new Array(T).fill(0);
  path[T - 1] = lastBest;
  for (let t = T - 1; t > 0; t--) path[t - 1] = bp[t][path[t]];

  // step: 0..T fills columns; T..2T-1 walks the traceback right-to-left.
  const maxStep = T + (T - 1);
  const [step, setStep] = useState(0);
  const filledCols = Math.min(step, T);              // how many DP columns are computed
  const tbShown = Math.max(0, step - T);             // how many traceback cells shown
  // traceback reveals from the last column leftwards
  const tbActive = (t) => tbShown > 0 && t >= T - tbShown;

  const W = 540, H = 230;
  const ox = 80, oy = 46, cw = 42, ch = 40;
  const cx = (t) => ox + t * cw;
  const cy = (k) => oy + k * ch;

  const fmt = (v) => (v === -Infinity ? "−∞" : v.toFixed(1));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 540, display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* observed sequence header */}
        <text x={ox - 58} y={oy - 14} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text-faint)">pozice t</text>
        {seq.map((ch, t) => (
          <text key={`s${t}`} x={cx(t) + cw / 2} y={oy - 14} textAnchor="middle"
            fontSize="13" fontFamily="var(--font-mono)" fontWeight="600"
            fill={filledCols > t ? "var(--accent)" : "var(--text-muted)"}>{ch}</text>
        ))}

        {/* state row labels */}
        {STATES.map((s, k) => (
          <text key={`r${k}`} x={ox - 10} y={cy(k) + ch / 2 + 4} textAnchor="end"
            fontSize="11" fontFamily="var(--font-mono)" fill={s.color}>{s.name}</text>
        ))}

        {/* DP grid */}
        {seq.map((_, t) =>
          STATES.map((s, k) => {
            const shown = t < filledCols;
            const onPath = shown && path[t] === k;
            const onTb = onPath && tbActive(t);
            let fill = "var(--bg-card)";
            if (onTb) fill = "var(--accent)";
            else if (onPath) fill = "color-mix(in oklch, var(--accent) 30%, var(--bg-card))";
            return (
              <g key={`g${t}-${k}`}>
                <rect x={cx(t)} y={cy(k)} width={cw - 4} height={ch - 4} fill={fill}
                  stroke={onPath ? "var(--accent)" : "var(--line-strong)"}
                  strokeWidth={onPath ? 1.4 : 0.6} />
                {shown && (
                  <text x={cx(t) + (cw - 4) / 2} y={cy(k) + (ch - 4) / 2 + 4} textAnchor="middle"
                    fontSize="11" fontFamily="var(--font-mono)"
                    fill={onTb ? "white" : V[t][k] === -Infinity ? "var(--text-faint)" : "var(--text)"}>
                    {fmt(V[t][k])}
                  </text>
                )}
              </g>
            );
          })
        )}

        {/* traceback connector arrows along the chosen path */}
        {tbShown > 0 && seq.map((_, t) => {
          if (t === 0 || !tbActive(t)) return null;
          const k = path[t], j = path[t - 1];
          return (
            <line key={`tb${t}`} x1={cx(t - 1) + (cw - 4)} y1={cy(j) + (ch - 4) / 2}
              x2={cx(t)} y2={cy(k) + (ch - 4) / 2}
              stroke="var(--accent)" strokeWidth="1.6" markerEnd="url(#hmmArr)" />
          );
        })}

        <defs>
          <marker id="hmmArr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)" />
          </marker>
        </defs>

        {/* status / annotation line */}
        <text x={ox - 58} y={H - 26} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">
          {filledCols < T
            ? `vyplnuji sloupec t=${filledCols} · V[t][k]=max_j(V[t-1][j]+log a[j,k])+log b[k,x_t]`
            : tbShown < T
              ? "zpetny pruchod (traceback) — nejpravdepodobnejsi cesta"
              : "anotace = " + path.map((k) => STATES[k].key).join(" ")}
        </text>
        {filledCols >= T && (
          <text x={ox - 58} y={H - 10} fontSize="11" fontFamily="var(--font-mono)" fill="var(--accent)">
            cesta stavu: {path.map((k) => STATES[k].key).join("·")}  (I=intergen, E=exon, N=intron)
          </text>
        )}
      </svg>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setStep((s) => Math.min(s + 1, maxStep))} style={btn}>krok ▸</button>
        <button onClick={() => setStep(maxStep)} style={btn}>dokonči ⏭</button>
        <button onClick={() => setStep(0)} style={btn}>reset ↺</button>
      </div>
      <div style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>
        3 skryté stavy emitují nukleotidy · čas O(T·K²), paměť O(T·K) · K=3, T={T}
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
