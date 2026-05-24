// branch-2bit-counter — Smith 1981 4-state saturating counter. Tap T/N
// (or feed canned pattern) and watch the state move; track accuracy live.
import { useState } from "react";

const STATES = [
  { id: 3, code: "11", name: "Strong T", predict: "T", x: 80 },
  { id: 2, code: "10", name: "Weak T",   predict: "T", x: 220 },
  { id: 1, code: "01", name: "Weak N",   predict: "N", x: 360 },
  { id: 0, code: "00", name: "Strong N", predict: "N", x: 500 },
];

const PATTERNS = {
  loop: { label: "loop 5 iter (TTTTN, opakuj 3×)", seq: "TTTTNTTTTNTTTTN".split("") },
  alt:  { label: "alternating TNTNTN", seq: "TNTNTNTNTNTNTNTN".split("") },
  zz:   { label: "ZZ-pattern TTNNTTNN", seq: "TTNNTTNNTTNNTTNN".split("") },
  bias: { label: "T-biased 80% (16 výsledků)", seq: "TTTTNTTTNTTTNTTTN".split("") },
};

function step(state2, bit1, outcome) {
  // 2-bit
  let s2 = state2;
  if (outcome === "T") s2 = Math.min(3, s2 + 1);
  else s2 = Math.max(0, s2 - 1);
  // 1-bit
  const s1 = outcome === "T" ? 1 : 0;
  return [s2, s1];
}

export default function Branch2bitCounter() {
  const [state2, setState2] = useState(2);
  const [state1, setState1] = useState(1);
  const [hist2, setHist2] = useState({ ok: 0, n: 0 });
  const [hist1, setHist1] = useState({ ok: 0, n: 0 });
  const [tape, setTape] = useState([]);
  const [patternKey, setPatternKey] = useState("loop");

  function feed(outcome) {
    const pred2 = state2 >= 2 ? "T" : "N";
    const pred1 = state1 === 1 ? "T" : "N";
    const ok2 = pred2 === outcome;
    const ok1 = pred1 === outcome;
    setHist2(h => ({ ok: h.ok + (ok2 ? 1 : 0), n: h.n + 1 }));
    setHist1(h => ({ ok: h.ok + (ok1 ? 1 : 0), n: h.n + 1 }));
    const [s2, s1] = step(state2, state1, outcome);
    setState2(s2); setState1(s1);
    setTape(t => [...t, { outcome, pred2, ok2, pred1, ok1 }].slice(-30));
  }

  function runPattern() {
    const seq = PATTERNS[patternKey].seq;
    let s2 = state2, s1 = state1, h2 = { ...hist2 }, h1 = { ...hist1 };
    const newTape = [...tape];
    for (const o of seq) {
      const p2 = s2 >= 2 ? "T" : "N", p1 = s1 === 1 ? "T" : "N";
      const ok2 = p2 === o, ok1 = p1 === o;
      h2 = { ok: h2.ok + (ok2 ? 1 : 0), n: h2.n + 1 };
      h1 = { ok: h1.ok + (ok1 ? 1 : 0), n: h1.n + 1 };
      [s2, s1] = step(s2, s1, o);
      newTape.push({ outcome: o, pred2: p2, ok2, pred1: p1, ok1 });
    }
    setState2(s2); setState1(s1);
    setHist2(h2); setHist1(h1);
    setTape(newTape.slice(-40));
  }

  function reset() {
    setState2(2); setState1(1);
    setHist2({ ok: 0, n: 0 }); setHist1({ ok: 0, n: 0 });
    setTape([]);
  }

  const W = 580, H = 250;
  const acc2 = hist2.n > 0 ? (hist2.ok / hist2.n * 100).toFixed(1) : "—";
  const acc1 = hist1.n > 0 ? (hist1.ok / hist1.n * 100).toFixed(1) : "—";

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => feed("T")} style={btnT}>výsledek: TAKEN</button>
        <button onClick={() => feed("N")} style={btnN}>výsledek: NOT</button>
        <select value={patternKey} onChange={e => setPatternKey(e.target.value)} style={ctrl}>
          {Object.entries(PATTERNS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={runPattern} style={btn(false)}>▶ pustit pattern</button>
        <button onClick={reset} style={btn(false)}>reset</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* state machine */}
        {STATES.map(s => (
          <g key={s.id}>
            <circle cx={s.x} cy={80} r={32} fill={state2 === s.id ? "var(--accent)" : "var(--bg-inset)"}
              stroke={s.predict === "T" ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"} strokeWidth="2" />
            <text x={s.x} y={75} textAnchor="middle" fontSize="13" fontWeight="700"
              fill={state2 === s.id ? "white" : "var(--text)"}>{s.code}</text>
            <text x={s.x} y={90} textAnchor="middle" fontSize="9" fill={state2 === s.id ? "white" : "var(--text-muted)"}>{s.name}</text>
            <text x={s.x} y={130} textAnchor="middle" fontSize="9.5"
              fill={s.predict === "T" ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"} fontWeight="600">
              predict {s.predict}
            </text>
          </g>
        ))}
        {/* arrows: T → left, N → right */}
        {STATES.map((s, i) => {
          if (i > 0) {
            // T arrow from s to STATES[i-1] (left, toward 11)
            const target = STATES[i - 1].x;
            return (
              <g key={"t" + i}>
                <path d={`M ${s.x - 30} 70 Q ${(s.x + target) / 2} 40 ${target + 30} 70`} fill="none"
                  stroke="oklch(0.7 0.15 145)" strokeWidth="1.2" markerEnd="url(#arrL)" />
              </g>
            );
          }
          return null;
        })}
        {STATES.map((s, i) => {
          if (i < STATES.length - 1) {
            const target = STATES[i + 1].x;
            return (
              <g key={"n" + i}>
                <path d={`M ${s.x + 30} 90 Q ${(s.x + target) / 2} 120 ${target - 30} 90`} fill="none"
                  stroke="oklch(0.65 0.18 22)" strokeWidth="1.2" markerEnd="url(#arrR)" />
              </g>
            );
          }
          return null;
        })}
        {/* self-loops */}
        <path d="M 50 60 A 22 18 0 0 0 50 100" fill="none" stroke="oklch(0.7 0.15 145)" strokeWidth="1.2" markerEnd="url(#arrL)" />
        <text x={30} y={85} fontSize="9" fill="oklch(0.7 0.15 145)">T</text>
        <path d="M 530 100 A 22 18 0 0 0 530 60" fill="none" stroke="oklch(0.65 0.18 22)" strokeWidth="1.2" markerEnd="url(#arrR)" />
        <text x={544} y={85} fontSize="9" fill="oklch(0.65 0.18 22)">N</text>

        <g fontSize="9" fill="var(--text-muted)">
          <text x={140} y={32}>T</text>
          <text x={280} y={32}>T</text>
          <text x={420} y={32}>T</text>
          <text x={140} y={156}>N</text>
          <text x={280} y={156}>N</text>
          <text x={420} y={156}>N</text>
        </g>

        <defs>
          <marker id="arrL" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L5,3 L0,6 z" fill="oklch(0.7 0.15 145)" />
          </marker>
          <marker id="arrR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L5,3 L0,6 z" fill="oklch(0.65 0.18 22)" />
          </marker>
        </defs>

        {/* accuracy */}
        <g fontSize="11" fill="var(--text)">
          <text x={20} y={185} fontWeight="600">2-bit: {acc2}% správně ({hist2.ok}/{hist2.n})</text>
          <text x={20} y={205} fill="var(--text-muted)">1-bit: {acc1}% správně ({hist1.ok}/{hist1.n})</text>
        </g>

        {/* tape */}
        <g fontSize="9" fontFamily="ui-monospace, monospace">
          {tape.slice(-25).map((step, i) => (
            <g key={i}>
              <rect x={20 + i * 22} y={222} width={20} height={20}
                fill={step.outcome === "T" ? "oklch(0.7 0.15 145 / 0.3)" : "oklch(0.65 0.18 22 / 0.3)"}
                stroke={step.ok2 ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"} strokeWidth="0.8" rx="2" />
              <text x={30 + i * 22} y={236} textAnchor="middle" fill="var(--text)">{step.outcome}</text>
            </g>
          ))}
        </g>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        T → counter += 1 (saturuje na 11), N → counter -= 1. Predikce: MSB = predict T. Loop-exit: 2-bit utrpí 1 mispredict, 1-bit dva.
      </div>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 8px", borderRadius: 3, fontSize: 11 };
const btnT = { ...ctrl, background: "oklch(0.7 0.15 145 / 0.2)", color: "oklch(0.7 0.15 145)", cursor: "pointer", fontWeight: 600 };
const btnN = { ...ctrl, background: "oklch(0.65 0.18 22 / 0.2)", color: "oklch(0.65 0.18 22)", cursor: "pointer", fontWeight: 600 };
function btn(active) {
  return { ...ctrl, background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", cursor: "pointer" };
}
