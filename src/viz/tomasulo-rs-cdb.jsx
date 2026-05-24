// tomasulo-rs-cdb — Reservation Stations + Common Data Bus.
// Watch instructions fill RS, tags broadcast on CDB, RS turn ready.
import { useEffect, useState } from "react";

// Program: FP mix exposing WAR + WAW resolved by renaming.
const PROG = [
  { id: 0, op: "DIV", txt: "div  f0, f2, f4",  dst: "f0", src: ["f2","f4"], lat: 8, rs: "DIV" },
  { id: 1, op: "ADD", txt: "add  f6, f0, f8",  dst: "f6", src: ["f0","f8"], lat: 2, rs: "ADD" },
  { id: 2, op: "MUL", txt: "mul  f10,f12,f14", dst: "f10",src: ["f12","f14"], lat: 4, rs: "MUL" },
  { id: 3, op: "SUB", txt: "sub  f8, f10,f6",  dst: "f8", src: ["f10","f6"], lat: 2, rs: "ADD" },
  { id: 4, op: "ADD", txt: "add  f0, f4, f8",  dst: "f0", src: ["f4","f8"],  lat: 2, rs: "ADD" }, // WAW on f0
];

const RS_SLOTS = { ADD: 3, MUL: 2, DIV: 1 };

function makeRS() {
  const rs = {};
  for (const [name, n] of Object.entries(RS_SLOTS)) {
    rs[name] = Array.from({ length: n }, (_, i) => ({ id: `${name}${i + 1}`, busy: false, inst: null, qj: null, qk: null, vj: null, vk: null, exec: 0 }));
  }
  return rs;
}

function simulate(uptoT) {
  const rs = makeRS();
  const regResult = {}; // reg → tag (RS slot id) writing it
  const sched = PROG.map(() => ({ I: null, exec: null, W: null }));
  const cdbHist = [];
  let cycle = 0;
  let issued = 0;
  while ((issued < PROG.length || Object.values(rs).flat().some(r => r.busy)) && cycle <= uptoT + 20) {
    // ISSUE: pick next inst, find free RS of its type
    if (issued < PROG.length) {
      const inst = PROG[issued];
      const free = rs[inst.rs].find(r => !r.busy);
      if (free) {
        free.busy = true;
        free.inst = inst;
        for (const k of [0, 1]) {
          const src = inst.src[k];
          if (regResult[src]) {
            if (k === 0) free.qj = regResult[src]; else free.qk = regResult[src];
          } else {
            if (k === 0) free.vj = src; else free.vk = src;
          }
        }
        regResult[inst.dst] = free.id;
        sched[inst.id].I = cycle;
        issued++;
      }
    }
    // EXECUTE: each busy RS with operands ready, increment exec
    for (const r of Object.values(rs).flat()) {
      if (!r.busy) continue;
      if (r.qj === null && r.qk === null) {
        r.exec++;
        if (r.exec === 1) sched[r.inst.id].exec = cycle;
        if (r.exec === r.inst.lat) r.done = true;
      }
    }
    // WRITE RESULT: at most one CDB transaction per cycle (one DONE RS broadcasts)
    const ready = Object.values(rs).flat().find(r => r.done && !r.broadcasted);
    if (ready) {
      ready.broadcasted = true;
      sched[ready.inst.id].W = cycle;
      cdbHist.push({ cycle, tag: ready.id, dst: ready.inst.dst, instId: ready.inst.id });
      // Broadcast: other RS waiting on this tag get the value
      for (const r of Object.values(rs).flat()) {
        if (r.qj === ready.id) { r.vj = ready.id; r.qj = null; }
        if (r.qk === ready.id) { r.vk = ready.id; r.qk = null; }
      }
      // Update regResult only if still pointing at this tag
      if (regResult[ready.inst.dst] === ready.id) delete regResult[ready.inst.dst];
      // Free RS
      ready.busy = false; ready.inst = null; ready.qj = null; ready.qk = null; ready.vj = null; ready.vk = null;
      ready.exec = 0; ready.done = false; ready.broadcasted = false;
    }
    cycle++;
  }
  return { rs, sched, cdbHist, cycles: cycle };
}

const FULL = simulate(40);

export default function TomasuloRsCdb() {
  const [t, setT] = useState(0);
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setT(x => (x >= FULL.cycles ? 0 : x + 1)), 800);
    return () => clearInterval(id);
  }, [auto]);

  const cur = simulate(t);

  const W = 580, H = 320;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setT(Math.max(0, t - 1))} style={btn(false)}>←</button>
        <button onClick={() => setT(Math.min(FULL.cycles, t + 1))} style={btn(false)}>→</button>
        <button onClick={() => setAuto(a => !a)} style={btn(auto)}>{auto ? "■" : "▶"}</button>
        <button onClick={() => { setT(0); setAuto(false); }} style={btn(false)}>reset</button>
        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>t = {t} / {FULL.cycles}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Program listing */}
        <text x={10} y={16} fontSize="11" fill="var(--text)" fontWeight="600">program:</text>
        {PROG.map((p, i) => {
          const s = cur.sched[p.id];
          const stage = s.W !== null && s.W <= t ? "done" :
                        s.exec !== null && s.exec <= t ? "exec" :
                        s.I !== null && s.I <= t ? "issued" : "pending";
          return (
            <g key={i}>
              <rect x={10} y={22 + i * 18} width={190} height={16}
                fill={stage === "done" ? "oklch(0.65 0.16 145 / 0.3)" :
                      stage === "exec" ? "oklch(0.7 0.15 60 / 0.3)" :
                      stage === "issued" ? "var(--bg-inset)" : "transparent"} rx="2" />
              <text x={14} y={34 + i * 18} fontSize="10" fontFamily="ui-monospace, monospace"
                fill={stage === "pending" ? "var(--text-faint)" : "var(--text)"}>{p.txt}</text>
              <text x={170} y={34 + i * 18} fontSize="8" fill="var(--text-muted)">{stage}</text>
            </g>
          );
        })}

        {/* Reservation stations */}
        <text x={220} y={16} fontSize="11" fill="var(--text)" fontWeight="600">RS:</text>
        <g fontSize="9.5" fontFamily="ui-monospace, monospace">
          {["ADD", "MUL", "DIV"].map((unit, ui) => (
            <g key={unit} transform={`translate(220, ${22 + ui * 80})`}>
              <text x={0} y={0} fill="var(--text-muted)" fontSize="9">{unit}:</text>
              {cur.rs[unit].map((r, ri) => (
                <g key={ri} transform={`translate(0, ${4 + ri * 22})`}>
                  <rect x={0} y={0} width={350} height={20}
                    fill={r.busy ? (r.done ? "oklch(0.65 0.16 145 / 0.3)" : r.qj === null && r.qk === null ? "oklch(0.7 0.15 60 / 0.3)" : "var(--bg-inset)") : "var(--bg-card)"}
                    stroke="var(--line)" rx="2" />
                  <text x={5} y={14} fill={r.busy ? "var(--text)" : "var(--text-faint)"} fontWeight="600">{r.id}</text>
                  <text x={40} y={14} fill="var(--text)">
                    {r.busy ? `${r.inst.op} ${r.inst.dst}` : "—"}
                  </text>
                  <text x={120} y={14} fill={r.qj ? "oklch(0.65 0.18 22)" : "var(--text)"}>
                    {r.busy ? `j: ${r.qj ? `wait ${r.qj}` : `=${r.vj}`}` : ""}
                  </text>
                  <text x={220} y={14} fill={r.qk ? "oklch(0.65 0.18 22)" : "var(--text)"}>
                    {r.busy ? `k: ${r.qk ? `wait ${r.qk}` : `=${r.vk}`}` : ""}
                  </text>
                </g>
              ))}
            </g>
          ))}
        </g>

        {/* CDB last broadcast */}
        <text x={10} y={H - 50} fontSize="11" fill="var(--text)" fontWeight="600">CDB (poslední broadcast):</text>
        <g>
          {cur.cdbHist.slice(-3).map((b, i) => (
            <text key={i} x={10} y={H - 36 + i * 12} fontSize="9.5" fontFamily="ui-monospace, monospace" fill="oklch(0.7 0.15 60)">
              t{b.cycle}: tag {b.tag} → {b.dst} (i{b.instId})
            </text>
          ))}
        </g>
        <text x={10} y={H - 8} fontSize="9" fill="var(--text-faint)">
          WAR/WAW automaticky: RS drží *hodnotu* zdroje (ne jméno), cíl registru ukazuje na *novou* RS po každém issue.
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
