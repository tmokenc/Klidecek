// tomasulo-rs-cdb — interactive Tomasulo with all three canonical tables.
// Per cycle, see the Load Buffers, Reservation Stations, Register Status,
// and CDB broadcasts mutate as instructions issue, execute, and write back.
//
// Program follows the classic Hennessy & Patterson example (Chapter 3) so
// readers can compare directly against the textbook trace.
import { useEffect, useState } from "react";

// Latencies follow H&P §3 (Tomasulo example): LD takes 2 EX cycles (address +
// memory), ADD/SUB 2, MULT 10, DIV 8 (shortened from 40 for demo brevity).
const PROG = [
  { id: 0, op: "LD",    txt: "LD    F6, 34(R2)",   dst: "F6",  src: [],            lat: 2,  kind: "load", rs: "LB",  addr: "34+R2" },
  { id: 1, op: "LD",    txt: "LD    F2, 45(R3)",   dst: "F2",  src: [],            lat: 2,  kind: "load", rs: "LB",  addr: "45+R3" },
  { id: 2, op: "MULTD", txt: "MULTD F0, F2, F4",   dst: "F0",  src: ["F2", "F4"],  lat: 10, kind: "mul",  rs: "MUL" },
  { id: 3, op: "SUBD",  txt: "SUBD  F8, F6, F2",   dst: "F8",  src: ["F6", "F2"],  lat: 2,  kind: "add",  rs: "ADD" },
  { id: 4, op: "DIVD",  txt: "DIVD  F10,F0, F6",   dst: "F10", src: ["F0", "F6"],  lat: 8,  kind: "div",  rs: "MUL" },
  { id: 5, op: "ADDD",  txt: "ADDD  F6, F8, F2",   dst: "F6",  src: ["F8", "F2"],  lat: 2,  kind: "add",  rs: "ADD" }, // WAR + WAW on F6
];

const REGS = ["F0", "F2", "F4", "F6", "F8", "F10"];

// Initial register file values — referenced by source operands until renamed.
const REG_INIT = { F0: "v(F0)", F2: "v(F2)", F4: "v(F4)", F6: "v(F6)", F8: "v(F8)", F10: "v(F10)" };

const LB_COUNT  = 3;
const ADD_COUNT = 3;
const MUL_COUNT = 2;

function makeState() {
  const fresh = id => ({
    id, busy: false, op: null, addr: null, vj: null, vk: null, qj: null, qk: null,
    inst: null, exec: 0, done: false, broadcasted: false,
    issuedAt: null,    // cycle when this slot received its instruction (so EX can't begin same cycle)
    doneAt: null,      // cycle when execution finished (so WB can't happen same cycle)
  });
  const lb  = Array.from({ length: LB_COUNT  }, (_, i) => fresh(`LB${i + 1}`));
  const add = Array.from({ length: ADD_COUNT }, (_, i) => fresh(`ADD${i + 1}`));
  const mul = Array.from({ length: MUL_COUNT }, (_, i) => fresh(`MUL${i + 1}`));
  const regStatus = Object.fromEntries(REGS.map(r => [r, null]));
  return { lb, add, mul, regStatus, cdb: [], sched: PROG.map(() => ({ I: null, exec: null, W: null })), justBroadcast: null };
}

// Pick the RS pool a given kind feeds into.
function poolFor(state, kind) {
  if (kind === "load") return state.lb;
  if (kind === "add")  return state.add;
  return state.mul;
}

function simulate(uptoT) {
  const s = makeState();
  let cycle = 0;
  let issued = 0;

  // Stop strictly at uptoT so state reflects "after cycle uptoT" — events
  // beyond that point (further CDB broadcasts, etc.) must not appear yet.
  while ((issued < PROG.length || allBusy(s)) && cycle <= uptoT) {
    s.justBroadcast = null;

    // ── ISSUE (in-order, exactly one per cycle) ────────────────────
    if (issued < PROG.length) {
      const inst = PROG[issued];
      const pool = poolFor(s, inst.kind);
      const free = pool.find(r => !r.busy);
      if (free) {
        free.busy = true;
        free.op = inst.op;
        free.inst = inst;
        free.issuedAt = cycle;
        if (inst.kind === "load") {
          free.addr = inst.addr;
        } else {
          for (const k of [0, 1]) {
            const src = inst.src[k];
            const tag = s.regStatus[src];
            if (tag) { if (k === 0) free.qj = tag; else free.qk = tag; }
            else      { if (k === 0) free.vj = REG_INIT[src]; else free.vk = REG_INIT[src]; }
          }
        }
        s.regStatus[inst.dst] = free.id;     // rename
        s.sched[inst.id].I = cycle;
        issued++;
      }
    }

    // ── EXECUTE — operands ready AND not issued this very cycle ────
    for (const r of [...s.lb, ...s.add, ...s.mul]) {
      if (!r.busy || r.done) continue;
      if (r.issuedAt === cycle) continue;   // 1-cycle issue latency
      const ready = r.inst.kind === "load" ? true : (r.qj === null && r.qk === null);
      if (!ready) continue;
      r.exec++;
      if (r.exec === 1) s.sched[r.inst.id].exec = cycle;
      if (r.exec >= r.inst.lat) { r.done = true; r.doneAt = cycle; }
    }

    // ── WRITE RESULT — at most one CDB broadcast/cycle, must have
    // finished EX at least one cycle ago (matches H&P timing).
    const ready = [...s.lb, ...s.add, ...s.mul].find(r => r.done && !r.broadcasted && r.doneAt < cycle);
    if (ready) {
      ready.broadcasted = true;
      s.sched[ready.inst.id].W = cycle;
      const result = `r(${ready.id})`;
      s.cdb.push({ cycle, tag: ready.id, dst: ready.inst.dst, instId: ready.inst.id, value: result });
      s.justBroadcast = ready.id;
      // Capture-by-tag in every waiting RS
      for (const r of [...s.add, ...s.mul]) {
        if (r.qj === ready.id) { r.vj = result; r.qj = null; }
        if (r.qk === ready.id) { r.vk = result; r.qk = null; }
      }
      // Release the register-status entry if still owned by this tag.
      if (s.regStatus[ready.inst.dst] === ready.id) s.regStatus[ready.inst.dst] = null;
      // Free the slot.
      Object.assign(ready, {
        busy: false, op: null, addr: null, vj: null, vk: null, qj: null, qk: null,
        inst: null, exec: 0, done: false, broadcasted: false, issuedAt: null, doneAt: null,
      });
    }

    cycle++;
  }
  return { state: s, totalCycles: cycle };
}

function allBusy(s) {
  return [...s.lb, ...s.add, ...s.mul].some(r => r.busy);
}

const FULL = simulate(120);

// ─── Component ─────────────────────────────────────────────────────
export default function TomasuloRsCdb() {
  const [t, setT] = useState(0);
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setT(x => (x >= FULL.totalCycles ? 0 : x + 1)), 700);
    return () => clearInterval(id);
  }, [auto]);
  const cur = simulate(t).state;

  return (
    <div style={ctn}>
      {/* ── Controls ─────────────────────────────────────────── */}
      <div style={ctrlRow}>
        <button onClick={() => setT(Math.max(0, t - 1))} style={btn(false)}>← cycle</button>
        <button onClick={() => setT(Math.min(FULL.totalCycles, t + 1))} style={btn(false)}>cycle →</button>
        <button onClick={() => setAuto(a => !a)} style={btn(auto)}>{auto ? "■ pause" : "▶ play"}</button>
        <button onClick={() => { setT(0); setAuto(false); }} style={btn(false)}>reset</button>
        <span style={tlabel}>t = <b>{t}</b> / {FULL.totalCycles}</span>
        {cur.justBroadcast && (
          <span style={{ ...tlabel, color: "var(--accent)" }}>
            ⚡ CDB: <b>{cur.justBroadcast}</b> just broadcast
          </span>
        )}
      </div>

      <div style={twoCol}>
        {/* ── Program listing ─────────────────────────────── */}
        <Section title="Program (in-order issue)">
          <table style={tbl}>
            <thead>
              <tr style={trHead}>
                <th style={th}>#</th>
                <th style={th}>instruction</th>
                <th style={th}>I</th>
                <th style={th}>exec</th>
                <th style={th}>W</th>
              </tr>
            </thead>
            <tbody>
              {PROG.map((p) => {
                const s = cur.sched[p.id];
                const phase =
                  s.W !== null && s.W <= t   ? "done"   :
                  s.exec !== null && s.exec <= t ? "exec" :
                  s.I !== null && s.I <= t   ? "issued" : "pending";
                return (
                  <tr key={p.id} style={{
                    background:
                      phase === "done"   ? "color-mix(in oklch, var(--ok) 18%, transparent)" :
                      phase === "exec"   ? "color-mix(in oklch, oklch(0.7 0.15 60) 22%, transparent)" :
                      phase === "issued" ? "var(--bg-inset)" : "transparent",
                  }}>
                    <td style={td}>{p.id}</td>
                    <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{p.txt}</td>
                    <td style={tdNum}>{s.I !== null && s.I <= t ? s.I : "—"}</td>
                    <td style={tdNum}>{s.exec !== null && s.exec <= t ? s.exec : "—"}</td>
                    <td style={tdNum}>{s.W !== null && s.W <= t ? s.W : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Section>

        {/* ── Register status — who currently owns each register's write ── */}
        <Section title="Register Status (rename table)">
          <table style={tbl}>
            <thead>
              <tr style={trHead}>
                {REGS.map(r => <th key={r} style={th}>{r}</th>)}
              </tr>
            </thead>
            <tbody>
              <tr>
                {REGS.map(r => (
                  <td key={r} style={{
                    ...tdNum,
                    color: cur.regStatus[r] ? "var(--accent)" : "var(--text-faint)",
                    fontWeight: cur.regStatus[r] ? 600 : 400,
                    background: cur.regStatus[r] ? "var(--accent-soft)" : "transparent",
                  }}>
                    {cur.regStatus[r] || "—"}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <div style={caption}>
            A tag here means an in-flight RS/LB will produce that register. Source
            operands of new instructions inherit the tag (Qj/Qk) and wait for the CDB broadcast.
          </div>
        </Section>
      </div>

      {/* ── Load Buffers ───────────────────────────────────── */}
      <Section title="Load Buffers">
        <table style={tbl}>
          <thead>
            <tr style={trHead}>
              <th style={th}>tag</th>
              <th style={th}>busy</th>
              <th style={th}>address</th>
              <th style={th}>op</th>
              <th style={th}>cycles</th>
            </tr>
          </thead>
          <tbody>
            {cur.lb.map(b => <BusyRow key={b.id} r={b} cols={["addr"]} latency={b.inst?.lat} />)}
          </tbody>
        </table>
      </Section>

      {/* ── Reservation Stations ────────────────────────────── */}
      <Section title="Reservation Stations (ADD/SUB)">
        <table style={tbl}>
          <thead>
            <tr style={trHead}>
              <th style={th}>tag</th>
              <th style={th}>busy</th>
              <th style={th}>op</th>
              <th style={th}>Vj</th>
              <th style={th}>Vk</th>
              <th style={th}>Qj</th>
              <th style={th}>Qk</th>
              <th style={th}>cycles</th>
            </tr>
          </thead>
          <tbody>
            {cur.add.map(r => <BusyRow key={r.id} r={r} cols={["op", "vj", "vk", "qj", "qk"]} latency={r.inst?.lat} />)}
          </tbody>
        </table>
      </Section>

      <Section title="Reservation Stations (MUL/DIV)">
        <table style={tbl}>
          <thead>
            <tr style={trHead}>
              <th style={th}>tag</th>
              <th style={th}>busy</th>
              <th style={th}>op</th>
              <th style={th}>Vj</th>
              <th style={th}>Vk</th>
              <th style={th}>Qj</th>
              <th style={th}>Qk</th>
              <th style={th}>cycles</th>
            </tr>
          </thead>
          <tbody>
            {cur.mul.map(r => <BusyRow key={r.id} r={r} cols={["op", "vj", "vk", "qj", "qk"]} latency={r.inst?.lat} />)}
          </tbody>
        </table>
      </Section>

      {/* ── CDB log ────────────────────────────────────────── */}
      <Section title={`CDB log — ${cur.cdb.length} broadcast${cur.cdb.length === 1 ? "" : "s"} so far`}>
        {cur.cdb.length === 0 ? (
          <div style={caption}>(no broadcasts yet)</div>
        ) : (
          <table style={tbl}>
            <thead>
              <tr style={trHead}>
                <th style={th}>cycle</th>
                <th style={th}>tag</th>
                <th style={th}>writes</th>
                <th style={th}>value</th>
              </tr>
            </thead>
            <tbody>
              {cur.cdb.slice(-6).map((b, i) => (
                <tr key={i} style={i === cur.cdb.slice(-6).length - 1 && cur.justBroadcast === b.tag ? { background: "var(--accent-soft)" } : {}}>
                  <td style={tdNum}>{b.cycle}</td>
                  <td style={{ ...td, fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--accent)" }}>{b.tag}</td>
                  <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{b.dst}</td>
                  <td style={{ ...td, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{b.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>

      <div style={footer}>
        <b>Renaming via the register-status table</b> eliminates WAR + WAW automatically — the
        reservation station holds the source <i>value</i> (or a tag waiting for it),
        not the source register's name. By the time the producer broadcasts, the
        register may already point at a newer instruction.
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

// Generic table row for LB / ADD / MUL — shared layout so the three tables
// align visually even when their column sets differ slightly.
function BusyRow({ r, cols, latency }) {
  const ready = !r.busy ? null : (r.inst.kind === "load" ? true : (r.qj === null && r.qk === null));
  const rowBg = !r.busy            ? "transparent" :
                r.done             ? "color-mix(in oklch, var(--ok) 18%, transparent)" :
                ready              ? "color-mix(in oklch, oklch(0.7 0.15 60) 22%, transparent)" :
                                     "var(--bg-inset)";
  return (
    <tr style={{ background: rowBg }}>
      <td style={{ ...td, fontFamily: "var(--font-mono)", fontWeight: 600, color: r.busy ? "var(--accent)" : "var(--text-faint)" }}>{r.id}</td>
      <td style={tdCenter}>{r.busy ? "yes" : "—"}</td>
      {cols.map(c => <Cell key={c} r={r} field={c} />)}
      <td style={tdNum}>{r.busy && latency ? `${Math.min(r.exec, latency)}/${latency}` : "—"}</td>
    </tr>
  );
}

function Cell({ r, field }) {
  const fmt = {
    op:   r.op || "—",
    addr: r.addr || "—",
    vj:   r.busy ? (r.vj ?? (r.qj ? "—" : "—")) : "—",
    vk:   r.busy ? (r.vk ?? (r.qk ? "—" : "—")) : "—",
    qj:   r.busy && r.qj ? r.qj : "—",
    qk:   r.busy && r.qk ? r.qk : "—",
  };
  const isWaitingTag = (field === "qj" || field === "qk") && r.busy && r[field];
  return (
    <td style={{
      ...td,
      fontFamily: "var(--font-mono)",
      color: isWaitingTag ? "oklch(0.65 0.18 22)" :
             r.busy ? "var(--text)" : "var(--text-faint)",
      fontWeight: isWaitingTag ? 600 : 400,
    }}>
      {fmt[field]}
    </td>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const ctn        = { display: "flex", flexDirection: "column", gap: 12 };
const ctrlRow    = { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" };
const twoCol     = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 };
const tlabel     = { fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-muted)" };
const tbl        = { width: "100%", borderCollapse: "collapse", fontSize: 11.5, fontFamily: "var(--font-mono)" };
const trHead     = { background: "var(--bg-inset)" };
const th         = { padding: "4px 6px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--line)" };
const td         = { padding: "3px 6px", borderBottom: "0.5px solid var(--line)", color: "var(--text)" };
const tdNum      = { ...td, fontFamily: "var(--font-mono)", textAlign: "right", color: "var(--text-muted)" };
const tdCenter   = { ...td, textAlign: "center", color: "var(--text-muted)" };
const sectionTitle = { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-faint)" };
const caption    = { fontSize: 10.5, color: "var(--text-faint)", marginTop: 2 };
const footer     = { fontSize: 11, color: "var(--text-muted)", lineHeight: 1.55, padding: "6px 10px", background: "var(--bg-inset)", borderRadius: 4 };

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 11.5, padding: "4px 10px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "var(--accent-text-on)" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 4, cursor: "pointer",
  };
}
