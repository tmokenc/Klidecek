// rob-precise-exceptions — ROB fills head→tail; commit in-order. Inject
// mispredict or exception → squash + recovery.
import { useState } from "react";

const ROB_SIZE = 8;

const PROG = [
  { id: 0, txt: "add  r1, r2, r3",  branch: false, exception: false, lat: 1 },
  { id: 1, txt: "beq  r1, r0, L1",  branch: true,  exception: false, lat: 2 },
  { id: 2, txt: "lw   r4, 0(r5)",   branch: false, exception: false, lat: 3, mayFault: true },
  { id: 3, txt: "mul  r6, r4, r7",  branch: false, exception: false, lat: 4 },
  { id: 4, txt: "sub  r8, r6, r9",  branch: false, exception: false, lat: 1 },
  { id: 5, txt: "or   r10,r8,r11",  branch: false, exception: false, lat: 1 },
];

function simulate(injectFault, faultInst, mispredAt) {
  const rob = Array.from({ length: ROB_SIZE }, () => null);
  const sched = PROG.map(() => ({ allocated: null, exec: null, complete: null, retired: null, squashed: false }));
  let head = 0, tail = 0, count = 0;
  let cycle = 0;
  let issued = 0;
  let squashedAt = null;
  const events = [];

  while ((issued < PROG.length || count > 0) && cycle < 40) {
    // RETIRE head if complete
    while (count > 0 && rob[head]) {
      const entry = rob[head];
      if (sched[entry.id].complete === null || sched[entry.id].complete > cycle) break;
      if (sched[entry.id].squashed) {
        sched[entry.id].retired = cycle;
        rob[head] = null;
        head = (head + 1) % ROB_SIZE;
        count--;
        continue;
      }
      // Exception?
      if (injectFault && entry.id === faultInst && sched[entry.id].complete <= cycle) {
        events.push({ cycle, txt: `i${entry.id} výjimka v MEM → squash zbytku ROB` });
        // Squash everything after this in ROB
        let p = (head + 1) % ROB_SIZE;
        while (p !== tail) {
          const e2 = rob[p];
          if (e2) sched[e2.id].squashed = true;
          p = (p + 1) % ROB_SIZE;
        }
        // The faulty inst itself does not retire (jumps to handler)
        sched[entry.id].squashed = true;
        events.push({ cycle, txt: `architectural state = before i${entry.id}` });
        // Retire faulty entry to free slot
        sched[entry.id].retired = cycle;
        rob[head] = null;
        head = (head + 1) % ROB_SIZE;
        count--;
        // Drain remaining squashed entries from ROB
        while (count > 0 && rob[head]) {
          rob[head] = null;
          head = (head + 1) % ROB_SIZE;
          count--;
        }
        issued = PROG.length;
        squashedAt = cycle;
        return { sched, cycle: cycle + 1, events, squashedAt };
      }
      sched[entry.id].retired = cycle;
      rob[head] = null;
      head = (head + 1) % ROB_SIZE;
      count--;
    }

    // EXECUTE / COMPLETE
    for (let i = 0; i < PROG.length; i++) {
      const s = sched[i];
      if (s.allocated !== null && s.allocated <= cycle && s.exec === null && !s.squashed) {
        s.exec = cycle;
      }
      if (s.exec !== null && s.complete === null && (cycle - s.exec) >= PROG[i].lat && !s.squashed) {
        s.complete = cycle;
      }
    }

    // MISPREDICT triggers at branch i1 if mispredAt set
    if (mispredAt && cycle >= mispredAt && squashedAt === null) {
      // Branch resolved: squash everything after i1
      events.push({ cycle, txt: `i1 mispredict resolved → squash i2..tail` });
      for (let p = 2; p < PROG.length; p++) {
        if (sched[p].allocated !== null && sched[p].retired === null) sched[p].squashed = true;
      }
      // Free squashed slots from tail
      squashedAt = cycle;
    }

    // ALLOCATE (issue): in-order, only if not squashed
    if (issued < PROG.length && count < ROB_SIZE && (squashedAt === null || issued < 2)) {
      rob[tail] = { id: issued, slot: tail };
      sched[issued].allocated = cycle;
      tail = (tail + 1) % ROB_SIZE;
      count++;
      issued++;
    }

    cycle++;
  }
  return { sched, cycle, events, squashedAt };
}

export default function RobPreciseExceptions() {
  const [fault, setFault] = useState(false);
  const [mispred, setMispred] = useState(false);
  const result = simulate(fault, 2, mispred ? 4 : 0);
  const [t, setT] = useState(result.cycle - 1);

  // Build view at t
  const cur = simulate(fault && t >= 4, 2, mispred && t >= 4 ? 4 : 0);
  // Apply only events up to t
  const robView = Array.from({ length: ROB_SIZE }, () => null);
  let count = 0;
  PROG.forEach((p, i) => {
    const s = cur.sched[i];
    if (s.allocated !== null && s.allocated <= t && (s.retired === null || s.retired > t)) {
      // find slot from full simulate
      robView[i % ROB_SIZE] = { id: i, squashed: s.squashed && t >= (cur.squashedAt || Infinity), state:
        s.complete !== null && s.complete <= t ? "complete" :
        s.exec !== null && s.exec <= t ? "exec" : "alloc" };
      count++;
    }
  });

  const W = 580, H = 280;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <label style={{ display: "flex", gap: 4, alignItems: "center", color: "var(--text)", fontSize: 11 }}>
          <input type="checkbox" checked={mispred} onChange={e => setMispred(e.target.checked)} /> mispredict i1
        </label>
        <label style={{ display: "flex", gap: 4, alignItems: "center", color: "var(--text)", fontSize: 11 }}>
          <input type="checkbox" checked={fault} onChange={e => setFault(e.target.checked)} /> page fault i2
        </label>
        <button onClick={() => setT(Math.max(0, t - 1))} style={btn(false)}>←</button>
        <button onClick={() => setT(Math.min(result.cycle, t + 1))} style={btn(false)}>→</button>
        <button onClick={() => setT(result.cycle - 1)} style={btn(false)}>do konce</button>
        <button onClick={() => setT(0)} style={btn(false)}>reset</button>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>t = {t}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        <text x={20} y={20} fontSize="12" fill="var(--text)" fontWeight="600">ROB (head ↓ retire, tail ↓ allocate):</text>
        {Array.from({ length: ROB_SIZE }).map((_, slot) => {
          const entry = robView[slot];
          const y = 30 + slot * 22;
          return (
            <g key={slot}>
              <rect x={20} y={y} width={220} height={20}
                fill={entry ?
                  entry.squashed ? "oklch(0.65 0.18 22 / 0.3)" :
                  entry.state === "complete" ? "oklch(0.65 0.16 145 / 0.3)" :
                  entry.state === "exec" ? "oklch(0.7 0.15 60 / 0.3)" : "var(--bg-inset)"
                  : "var(--bg-card)"}
                stroke={entry ? (entry.squashed ? "oklch(0.65 0.18 22)" : "var(--line-strong)") : "var(--line)"}
                strokeDasharray={entry ? "" : "3 3"} rx="3" />
              <text x={26} y={y + 14} fontSize="9.5" fontFamily="ui-monospace, monospace"
                fill={entry ? (entry.squashed ? "oklch(0.65 0.18 22)" : "var(--text)") : "var(--text-faint)"}>
                [{slot}] {entry ? `i${entry.id} — ${entry.squashed ? "SQUASH" : entry.state}` : "empty"}
              </text>
              <text x={170} y={y + 14} fontSize="8" fill="var(--text-faint)">
                {entry ? PROG[entry.id].txt.slice(0, 16) : ""}
              </text>
            </g>
          );
        })}

        {/* Architectural vs speculative */}
        <text x={270} y={20} fontSize="12" fill="var(--text)" fontWeight="600">retired (architectural):</text>
        <g fontSize="9.5" fontFamily="ui-monospace, monospace">
          {PROG.map((p, i) => {
            const s = cur.sched[i];
            const retired = s.retired !== null && s.retired <= t && !s.squashed;
            return (
              <text key={i} x={270} y={42 + i * 17}
                fill={retired ? "oklch(0.65 0.16 145)" : "var(--text-faint)"}
                fontWeight={retired ? 600 : 400}>
                {retired ? "✓" : "·"} {p.txt}
              </text>
            );
          })}
        </g>

        <g fontSize="9.5" fill="var(--text-muted)" fontFamily="ui-monospace, monospace">
          {result.events.filter(e => e.cycle <= t).slice(-3).map((e, i) => (
            <text key={i} x={20} y={H - 20 + i * 11}>t{e.cycle}: {e.txt}</text>
          ))}
        </g>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Speculation = instrukce dokončí výpočet, ale commit (retire) musí čekat na in-order head. Squash zahodí vše za výjimkou — architectural state je *jen* retired.
      </div>
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
