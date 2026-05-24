// btb-ras-traversal — Return Address Stack + BTB across a call/return
// sequence. Toggle deep recursion, tail-call, longjmp scenarios.
import { useState } from "react";

const RAS_SIZE = 8;

const SCENARIOS = {
  normal: {
    label: "normální call/ret",
    seq: [
      { op: "call", target: "f1", retPC: 0x100 },
      { op: "call", target: "f2", retPC: 0x200 },
      { op: "call", target: "f3", retPC: 0x300 },
      { op: "ret",  expected: 0x300 },
      { op: "ret",  expected: 0x200 },
      { op: "ret",  expected: 0x100 },
    ],
  },
  deep: {
    label: "hluboká rekurze (přeteče RAS=8)",
    seq: Array.from({ length: 12 }, (_, i) => ({ op: "call", target: `rec${i}`, retPC: 0x100 + i * 0x10 }))
      .concat(Array.from({ length: 12 }, (_, i) => ({ op: "ret", expected: 0x100 + (11 - i) * 0x10 }))),
  },
  tail: {
    label: "tail-call (jmp místo call)",
    seq: [
      { op: "call", target: "f1", retPC: 0x100 },
      { op: "jmp",  target: "f2_tailcall" },
      { op: "jmp",  target: "f3_tailcall" },
      { op: "ret",  expected: 0x100 },
    ],
  },
  longjmp: {
    label: "setjmp/longjmp (cross-frame jump)",
    seq: [
      { op: "call", target: "setjmp", retPC: 0x100 },
      { op: "ret",  expected: 0x100 },
      { op: "call", target: "f1", retPC: 0x200 },
      { op: "call", target: "f2", retPC: 0x300 },
      { op: "longjmp", target: "back_to_setjmp_caller" },
    ],
  },
};

function simulate(seq) {
  let stack = [];
  const steps = [];
  for (const ev of seq) {
    if (ev.op === "call") {
      if (stack.length < RAS_SIZE) {
        stack = [...stack, ev.retPC];
        steps.push({ ...ev, stack: [...stack], ok: true, note: `push 0x${ev.retPC.toString(16)}` });
      } else {
        steps.push({ ...ev, stack: [...stack], ok: false, note: "RAS plný — push přepíše/ztratí" });
      }
    } else if (ev.op === "ret") {
      const top = stack[stack.length - 1];
      const matched = top === ev.expected;
      stack = stack.slice(0, -1);
      steps.push({ ...ev, stack: [...stack, top], popped: top, ok: matched, note: matched ? `pop 0x${top?.toString(16)} ✓` : `RAS prázdný/stale → mispredict` });
    } else if (ev.op === "jmp") {
      steps.push({ ...ev, stack: [...stack], ok: true, note: "jmp neaktualizuje RAS" });
    } else if (ev.op === "longjmp") {
      steps.push({ ...ev, stack: [...stack], ok: false, note: "longjmp ničí RAS sync — flush" });
      stack = [];
    }
  }
  return steps;
}

export default function BtbRasTraversal() {
  const [scenarioKey, setScenarioKey] = useState("normal");
  const [step, setStep] = useState(0);
  const seq = SCENARIOS[scenarioKey].seq;
  const steps = simulate(seq);
  const cur = steps[step];

  const mispred = steps.slice(0, step + 1).filter(s => s.op === "ret" && !s.ok).length;
  const longjmpMiss = steps.slice(0, step + 1).filter(s => s.op === "longjmp").length;

  const W = 580, H = 280;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <select value={scenarioKey} onChange={e => { setScenarioKey(e.target.value); setStep(0); }} style={ctrl}>
          {Object.entries(SCENARIOS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={() => setStep(Math.max(0, step - 1))} style={btn(false)}>←</button>
        <button onClick={() => setStep(Math.min(steps.length - 1, step + 1))} style={btn(false)}>krok →</button>
        <button onClick={() => setStep(steps.length - 1)} style={btn(false)}>do konce</button>
        <button onClick={() => setStep(0)} style={btn(false)}>reset</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* RAS visualization */}
        <text x={20} y={20} fontSize="12" fill="var(--text)" fontWeight="600">RAS (max {RAS_SIZE}):</text>
        {Array.from({ length: RAS_SIZE }).map((_, i) => {
          const idx = RAS_SIZE - 1 - i;
          const val = cur.stack[idx];
          const top = idx === cur.stack.length - 1;
          return (
            <g key={i}>
              <rect x={20} y={30 + i * 26} width={140} height={22} fill={val !== undefined ? (top ? "var(--accent)" : "var(--bg-inset)") : "var(--bg-card)"}
                stroke={val !== undefined ? "var(--line-strong)" : "var(--line)"} strokeDasharray={val === undefined ? "3 3" : ""} rx="3" />
              <text x={28} y={45 + i * 26} fontSize="10" fontFamily="ui-monospace, monospace"
                fill={val !== undefined ? (top ? "white" : "var(--text)") : "var(--text-faint)"}>
                [{idx}] {val !== undefined ? `0x${val.toString(16).toUpperCase()}` : "—"}
              </text>
            </g>
          );
        })}

        {/* event log */}
        <text x={200} y={20} fontSize="12" fill="var(--text)" fontWeight="600">průběh:</text>
        <g fontSize="10" fontFamily="ui-monospace, monospace">
          {steps.slice(0, step + 1).map((s, i) => {
            const y = 30 + i * 18;
            if (y > 240) return null;
            return (
              <g key={i}>
                <rect x={200} y={y} width={360} height={15}
                  fill={i === step ? "var(--bg-inset)" : "transparent"} rx="2" />
                <text x={206} y={y + 11}
                  fill={s.ok ? "var(--text)" : "oklch(0.65 0.18 22)"}
                  fontWeight={i === step ? 600 : 400}>
                  {s.op.toUpperCase().padEnd(8)} {s.target || `→ 0x${s.expected?.toString(16) || "—"}`}
                </text>
                <text x={400} y={y + 11} fontSize="9" fill="var(--text-muted)">{s.note}</text>
              </g>
            );
          })}
        </g>

        <text x={20} y={260} fontSize="10.5" fill="var(--text)">
          RAS mispredicts: <tspan fill="oklch(0.65 0.18 22)" fontWeight="600">{mispred + longjmpMiss}</tspan>
        </text>
        <text x={20} y={275} fontSize="9.5" fill="var(--text-faint)">
          Normální call/ret: 99 %+ úspěšnost. Rekurze za RAS_SIZE / tail-call / longjmp ji ničí.
        </text>
      </svg>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 6px", borderRadius: 3, fontSize: 11 };
function btn(active) {
  return { ...ctrl, background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", cursor: "pointer", padding: "3px 9px" };
}
