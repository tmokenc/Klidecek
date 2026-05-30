// pipeline-stage-tracker — 5-stage MIPS pipeline animating an instruction
// stream; compare pipelined vs sequential CPI side-by-side.
import { useEffect, useState } from "react";

const STAGES = ["IF", "ID", "EX", "MA", "WB"];
const COLORS = ["#5b8def", "#7c5bef", "#ef5b8d", "#ef8d5b", "#5befef"];

const PROG = [
  "lw  r1, 0(r0)",
  "add r2, r1, r3",
  "sub r4, r2, r5",
  "or  r6, r4, r7",
  "and r8, r6, r9",
  "xor r10,r8,r11",
];

const CELL = 32;
const ROW = 26;
const LABEL_W = 110;

export default function PipelineStageTracker() {
  const [t, setT] = useState(0);
  const [auto, setAuto] = useState(false);
  const [mode, setMode] = useState("pipelined");
  const n = PROG.length;
  const maxT = mode === "pipelined" ? n + 4 : 5 * n;

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setT(x => (x + 1 > maxT ? 0 : x + 1)), 700);
    return () => clearInterval(id);
  }, [auto, maxT]);

  function stageOf(i, cycle) {
    if (mode === "pipelined") {
      const s = cycle - i;
      if (s < 0 || s > 4) return null;
      return s;
    } else {
      const start = i * 5;
      if (cycle < start || cycle >= start + 5) return null;
      return cycle - start;
    }
  }

  const completed = Array.from({ length: n }, (_, i) => stageOf(i, t) === 4 || (mode === "pipelined" ? t - i > 4 : t >= i * 5 + 5)).filter(Boolean).length;
  const cpi = completed > 0 ? (t + 1) / completed : 0;

  const W = LABEL_W + (maxT + 1) * CELL + 8;
  const H = n * ROW + 70;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setMode(mode === "pipelined" ? "sequential" : "pipelined")} style={btn(false)}>
          {mode === "pipelined" ? "→ sekvenční" : "→ zřetězené"}
        </button>
        <button onClick={() => setT(Math.max(0, t - 1))} style={btn(false)} disabled={t === 0}>← krok</button>
        <button onClick={() => setT(Math.min(maxT, t + 1))} style={btn(false)} disabled={t === maxT}>krok →</button>
        <button onClick={() => setAuto(a => !a)} style={btn(auto)}>{auto ? "■ stop" : "▶ auto"}</button>
        <button onClick={() => { setT(0); setAuto(false); }} style={btn(false)}>reset</button>
        <span style={{ color: "var(--text-muted)", fontSize: 11, marginLeft: 4 }}>
          t = {t} | dokončeno: {completed}/{n} | CPI ≈ {cpi.toFixed(2)}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, fontFamily: "ui-sans-serif, system-ui" }}>
        <g fontSize="9.5" fill="var(--text-muted)" textAnchor="middle">
          {Array.from({ length: maxT + 1 }).map((_, c) => (
            <text key={c} x={LABEL_W + c * CELL + CELL / 2} y={14}>t{c}</text>
          ))}
        </g>
        <g stroke="var(--line)" strokeWidth="0.4">
          {Array.from({ length: n + 1 }).map((_, i) => (
            <line key={i} x1={0} y1={22 + i * ROW} x2={LABEL_W + (maxT + 1) * CELL} y2={22 + i * ROW} />
          ))}
          <line x1={LABEL_W + (t + 1) * CELL} y1={22} x2={LABEL_W + (t + 1) * CELL} y2={22 + n * ROW} stroke="var(--accent)" strokeWidth="1.5" />
        </g>
        {PROG.map((txt, i) => (
          <g key={i}>
            <text x={5} y={22 + i * ROW + ROW / 2 + 4} fill="var(--text)" fontFamily="ui-monospace, monospace" fontSize="10.5">
              {txt}
            </text>
            {Array.from({ length: maxT + 1 }).map((_, c) => {
              const si = stageOf(i, c);
              if (si === null) return null;
              const active = c === t;
              return (
                <g key={c}>
                  <rect x={LABEL_W + c * CELL + 2} y={22 + i * ROW + 3} width={CELL - 4} height={ROW - 6}
                    fill={COLORS[si]} opacity={active ? 0.95 : 0.55} rx="2" />
                  <text x={LABEL_W + c * CELL + CELL / 2} y={22 + i * ROW + ROW / 2 + 4} textAnchor="middle"
                    fontSize="9.5" fill="white" fontWeight="600">{STAGES[si]}</text>
                </g>
              );
            })}
          </g>
        ))}
        <text x={W / 2} y={H - 10} textAnchor="middle" fill="var(--text-faint)" fontSize="10">
          {mode === "pipelined"
            ? "Zřetězené: 5 instrukcí překrytých, ustálené CPI → 1."
            : "Sekvenční: každá instrukce čeká na konec předchozí, CPI = 5."}
        </text>
      </svg>
    </div>
  );
}

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 11, padding: "3px 9px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "white" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer",
  };
}
