// scoreboard-trace — CDC 6600 scoreboard with the three canonical tables.
// Per cycle, watch the Instruction Status, Functional Unit Status, and
// Register Result Status tables update as instructions advance through
// Issue → Read operands → Execute → Write result.
//
// Same H&P example used by the Tomasulo viz so the two methods can be
// compared cycle-for-cycle.
import { useEffect, useState } from "react";

// Latencies match H&P §3 (CDC 6600 example): LD = 2 EX, MULTD = 10, SUBD/ADDD
// = 2, DIVD = 40 (we use 8 to keep the trace digestible).  The simulator below
// gates each pipeline stage to its own cycle so Issue→Read, Read→Execute, and
// Execute→Write each consume at least one tick, exactly as the textbook shows.
const PROG = [
  { id: 0, op: "LD",    txt: "LD    F6, 34(R2)",  dst: "F6",  src: [],          lat: 2,  unit: "Integer" },
  { id: 1, op: "LD",    txt: "LD    F2, 45(R3)",  dst: "F2",  src: [],          lat: 2,  unit: "Integer" },
  { id: 2, op: "MULTD", txt: "MULTD F0, F2, F4",  dst: "F0",  src: ["F2","F4"], lat: 10, unit: "Mult1" },
  { id: 3, op: "SUBD",  txt: "SUBD  F8, F6, F2",  dst: "F8",  src: ["F6","F2"], lat: 2,  unit: "Add"    },
  { id: 4, op: "DIVD",  txt: "DIVD  F10,F0, F6",  dst: "F10", src: ["F0","F6"], lat: 8,  unit: "Divide" },
  { id: 5, op: "ADDD",  txt: "ADDD  F6, F8, F2",  dst: "F6",  src: ["F8","F2"], lat: 2,  unit: "Add"    },
];

const UNIT_NAMES = ["Integer", "Mult1", "Add", "Divide"];
const REGS = ["F0", "F2", "F4", "F6", "F8", "F10"];

function makeFu() {
  return Object.fromEntries(UNIT_NAMES.map(name => [name, {
    name,
    busy: false,
    op: null,
    Fi: null,   // dest reg
    Fj: null,   // src1 reg
    Fk: null,   // src2 reg
    Qj: null,   // FU producing Fj (or null if ready)
    Qk: null,   // FU producing Fk
    Rj: false,  // is Fj ready to read?
    Rk: false,  // is Fk ready to read?
    inst: null,
    phase: null,        // "I" | "R" | "E" | "W"
    execLeft: 0,
    issuedAt: null,     // cycle when Issue happened — R cannot fire same cycle
    readAt: null,       // cycle when Read happened — E counter starts next cycle
    execDoneAt: null,   // cycle when execLeft reached 0 — W cannot fire same cycle
  }]));
}

// Simulate the full schedule up to a given cycle, returning the state and
// schedule (entry cycle for each of the four phases per instruction).
function simulate(uptoT) {
  const fu = makeFu();
  const regResult = Object.fromEntries(REGS.map(r => [r, null])); // reg → FU that will write it
  const sched = PROG.map(() => ({ I: null, R: null, E: null, W: null }));
  const stalls = PROG.map(() => ({ waw: 0, struct: 0, war: 0 }));
  const events = [];   // textual cycle log
  let issued = 0;
  let cycle = 0;

  // Stop strictly at uptoT so state reflects "after cycle uptoT" — events
  // beyond that point (further FU transitions) must not appear yet.
  while ((issued < PROG.length || Object.values(fu).some(u => u.busy)) && cycle <= uptoT) {
    // ── ISSUE (in-order, one per cycle) ────────────────────────
    if (issued < PROG.length) {
      const inst = PROG[issued];
      const target = fu[inst.unit];
      const structural = target.busy;
      const waw = Object.values(fu).some(u => u.busy && u.Fi === inst.dst);
      if (!structural && !waw) {
        sched[inst.id].I = cycle;
        target.busy = true;
        target.op = inst.op;
        target.inst = inst;
        target.Fi = inst.dst;
        target.Fj = inst.src[0] || null;
        target.Fk = inst.src[1] || null;
        target.Qj = inst.src[0] ? regResult[inst.src[0]] : null;
        target.Qk = inst.src[1] ? regResult[inst.src[1]] : null;
        target.Rj = !target.Qj && !!inst.src[0];   // operand exists and is ready
        target.Rk = !target.Qk && !!inst.src[1];
        // Operands with no source register (e.g. loads) appear "ready" already.
        if (!inst.src[0]) { target.Rj = true; }
        if (!inst.src[1]) { target.Rk = true; }
        target.phase = "R";
        target.issuedAt = cycle;
        regResult[inst.dst] = inst.unit;
        events.push({ cycle, text: `Issue ${inst.txt.trim()} → ${inst.unit}` });
        issued++;
      } else {
        if (structural) stalls[inst.id].struct++;
        if (waw)        stalls[inst.id].waw++;
      }
    }

    // ── READ — every FU in phase R checks if both sources are ready ─
    // R cannot fire the same cycle as I (scoreboard stages take ≥1 cycle each).
    for (const u of Object.values(fu)) {
      if (!u.busy || u.phase !== "R") continue;
      if (u.issuedAt === cycle) continue;
      if (u.Rj && u.Rk) {
        sched[u.inst.id].R = cycle;
        u.readAt = cycle;
        u.phase = "E";
        u.execLeft = u.inst.lat;
        events.push({ cycle, text: `${u.name}: read operands for ${u.inst.txt.trim()}` });
      }
    }

    // ── EXECUTE — tick down latency (not the cycle Read happened) ──
    for (const u of Object.values(fu)) {
      if (!u.busy || u.phase !== "E") continue;
      if (u.readAt === cycle) continue;   // first exec cycle is read-cycle+1
      u.execLeft--;
      if (u.execLeft <= 0) {
        sched[u.inst.id].E = cycle;
        u.execDoneAt = cycle;
        u.phase = "W";
        events.push({ cycle, text: `${u.name}: finished execute for ${u.inst.txt.trim()}` });
      }
    }

    // ── WRITE — must wait one cycle after exec done; also gated by WAR ─
    // WAR is only a hazard against *earlier-issued* readers that still need to
    // sample the OLD value.  A later-issued reader of u.Fi (e.g. MULTD reading
    // the F2 that LD F2 itself produces) is waiting on u via its Q tag — those
    // are RAW dependencies, not WAR, and must not block the write.
    for (const u of Object.values(fu)) {
      if (!u.busy || u.phase !== "W") continue;
      if (u.execDoneAt === cycle) continue;   // W is exec_done_cycle + 1
      const warStall = Object.values(fu).some(o =>
        o.busy && o !== u && o.phase === "R" &&
        o.inst.id < u.inst.id &&
        (o.Fj === u.Fi || o.Fk === u.Fi)
      );
      if (warStall) {
        stalls[u.inst.id].war++;
        continue;
      }
      sched[u.inst.id].W = cycle;
      events.push({ cycle, text: `${u.name}: write ${u.Fi} (CDB)` });
      // Mark every waiting reader of this register ready.
      for (const o of Object.values(fu)) {
        if (!o.busy) continue;
        if (o.Qj === u.name) { o.Qj = null; o.Rj = true; }
        if (o.Qk === u.name) { o.Qk = null; o.Rk = true; }
      }
      if (regResult[u.Fi] === u.name) regResult[u.Fi] = null;
      // Free FU
      Object.assign(u, {
        busy: false, op: null, Fi: null, Fj: null, Fk: null, Qj: null, Qk: null,
        Rj: false, Rk: false, inst: null, phase: null, execLeft: 0,
        issuedAt: null, readAt: null, execDoneAt: null,
      });
    }

    cycle++;
  }

  return { fu, regResult, sched, stalls, events, totalCycles: cycle };
}

const FULL = simulate(120);

// ─── Component ────────────────────────────────────────────────
export default function ScoreboardTrace() {
  const [t, setT] = useState(0);
  const [auto, setAuto] = useState(false);
  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setT(x => (x >= FULL.totalCycles ? 0 : x + 1)), 700);
    return () => clearInterval(id);
  }, [auto]);
  const cur = simulate(t);
  const recent = cur.events.filter(e => e.cycle === t - 1 || e.cycle === t);

  return (
    <div style={ctn}>
      {/* ── Controls ─────────────────────────────────────────── */}
      <div style={ctrlRow}>
        <button onClick={() => setT(Math.max(0, t - 1))} style={btn(false)}>← cycle</button>
        <button onClick={() => setT(Math.min(FULL.totalCycles, t + 1))} style={btn(false)}>cycle →</button>
        <button onClick={() => setAuto(a => !a)} style={btn(auto)}>{auto ? "■ pause" : "▶ play"}</button>
        <button onClick={() => { setT(0); setAuto(false); }} style={btn(false)}>reset</button>
        <span style={tlabel}>t = <b>{t}</b> / {FULL.totalCycles}</span>
      </div>

      {/* ── Table 1: Instruction Status ──────────────────────── */}
      <Section title="Instruction Status">
        <table style={tbl}>
          <thead>
            <tr style={trHead}>
              <th style={th}>#</th>
              <th style={th}>instruction</th>
              <th style={th}>Issue</th>
              <th style={th}>Read operands</th>
              <th style={th}>Execute</th>
              <th style={th}>Write result</th>
              <th style={th}>stalls</th>
            </tr>
          </thead>
          <tbody>
            {PROG.map((p) => {
              const s = cur.sched[p.id];
              const st = cur.stalls[p.id];
              const stallParts = [];
              if (st.struct) stallParts.push(`STR×${st.struct}`);
              if (st.waw)    stallParts.push(`WAW×${st.waw}`);
              if (st.war)    stallParts.push(`WAR×${st.war}`);
              const phase =
                s.W !== null && s.W <= t   ? "done" :
                s.E !== null && s.E <= t   ? "writing" :
                s.R !== null && s.R <= t   ? "executing" :
                s.I !== null && s.I <= t   ? "reading" : "pending";
              return (
                <tr key={p.id} style={{
                  background:
                    phase === "done"      ? "color-mix(in oklch, var(--ok) 18%, transparent)" :
                    phase === "writing"   ? "color-mix(in oklch, oklch(0.7 0.18 60) 24%, transparent)" :
                    phase === "executing" ? "color-mix(in oklch, oklch(0.7 0.15 60) 18%, transparent)" :
                    phase === "reading"   ? "var(--bg-inset)" : "transparent",
                }}>
                  <td style={td}>{p.id}</td>
                  <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{p.txt}</td>
                  <td style={tdNum}>{shown(s.I, t)}</td>
                  <td style={tdNum}>{shown(s.R, t)}</td>
                  <td style={tdNum}>{shown(s.E, t)}</td>
                  <td style={tdNum}>{shown(s.W, t)}</td>
                  <td style={{ ...td, color: "oklch(0.65 0.18 22)", fontWeight: stallParts.length ? 600 : 400 }}>
                    {stallParts.join(" ") || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={caption}>
          <b>Issue</b> blocked by WAW (target reg busy) or structural (FU busy);
          <b> Read</b> waits until both sources are produced; <b>Write</b> waits
          for any earlier reader still in R-phase (WAR hazard).
        </div>
      </Section>

      {/* ── Table 2: Functional Unit Status ──────────────────── */}
      <Section title="Functional Unit Status">
        <table style={tbl}>
          <thead>
            <tr style={trHead}>
              <th style={th}>FU</th>
              <th style={th}>busy</th>
              <th style={th}>op</th>
              <th style={th}>Fi</th>
              <th style={th}>Fj</th>
              <th style={th}>Fk</th>
              <th style={th}>Qj</th>
              <th style={th}>Qk</th>
              <th style={th}>Rj</th>
              <th style={th}>Rk</th>
              <th style={th}>phase</th>
            </tr>
          </thead>
          <tbody>
            {UNIT_NAMES.map(name => {
              const u = cur.fu[name];
              return (
                <tr key={name} style={{
                  background: !u.busy ? "transparent" :
                    u.phase === "W" ? "color-mix(in oklch, var(--ok) 14%, transparent)" :
                    u.phase === "E" ? "color-mix(in oklch, oklch(0.7 0.15 60) 18%, transparent)" :
                                      "var(--bg-inset)",
                }}>
                  <td style={{ ...td, fontWeight: 600, color: u.busy ? "var(--accent)" : "var(--text-faint)" }}>{name}</td>
                  <td style={tdCenter}>{u.busy ? "yes" : "—"}</td>
                  <td style={tdMono}>{u.op || "—"}</td>
                  <td style={tdMono}>{u.Fi || "—"}</td>
                  <td style={tdMono}>{u.Fj || "—"}</td>
                  <td style={tdMono}>{u.Fk || "—"}</td>
                  <td style={{ ...tdMono, color: u.Qj ? "oklch(0.65 0.18 22)" : "var(--text-muted)" }}>{u.Qj || "—"}</td>
                  <td style={{ ...tdMono, color: u.Qk ? "oklch(0.65 0.18 22)" : "var(--text-muted)" }}>{u.Qk || "—"}</td>
                  <td style={{ ...tdCenter, color: u.busy ? (u.Rj ? "var(--ok)" : "oklch(0.65 0.18 22)") : "var(--text-faint)" }}>
                    {u.busy ? (u.Rj ? "✓" : "✗") : "—"}
                  </td>
                  <td style={{ ...tdCenter, color: u.busy ? (u.Rk ? "var(--ok)" : "oklch(0.65 0.18 22)") : "var(--text-faint)" }}>
                    {u.busy ? (u.Rk ? "✓" : "✗") : "—"}
                  </td>
                  <td style={tdCenter}>{u.phase || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={caption}>
          <b>Fi</b>: dest reg · <b>Fj/Fk</b>: source regs · <b>Qj/Qk</b>: FU producing source (null = ready) ·
          <b> Rj/Rk</b>: source ready to read · <b>phase</b>: I → R → E → W
        </div>
      </Section>

      {/* ── Table 3: Register Result Status ──────────────────── */}
      <Section title="Register Result Status">
        <table style={tbl}>
          <thead>
            <tr style={trHead}>
              {REGS.map(r => <th key={r} style={{ ...th, textAlign: "center" }}>{r}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              {REGS.map(r => (
                <td key={r} style={{
                  ...tdCenter,
                  fontFamily: "var(--font-mono)",
                  color: cur.regResult[r] ? "var(--accent)" : "var(--text-faint)",
                  fontWeight: cur.regResult[r] ? 600 : 400,
                  background: cur.regResult[r] ? "var(--accent-soft)" : "transparent",
                }}>
                  {cur.regResult[r] || "—"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        <div style={caption}>
          Single producer per register at a time — that's why WAW <i>stalls Issue</i>
          (you can't have two FUs claiming the same destination).
        </div>
      </Section>

      {/* ── Event log ─────────────────────────────────────────── */}
      <Section title="Recent events">
        {recent.length === 0 ? (
          <div style={caption}>(no events at t = {t})</div>
        ) : (
          <ul style={{ margin: 0, padding: "4px 18px", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
            {recent.map((e, i) => (
              <li key={i}>t={e.cycle}: {e.text}</li>
            ))}
          </ul>
        )}
      </Section>

      <div style={footer}>
        <b>Scoreboard vs Tomasulo:</b> scoreboard <i>stalls</i> on WAW + WAR
        and uses just one register-result entry per register. Tomasulo <i>renames</i>
        through reservation-station tags, so WAW + WAR disappear — only true RAW
        remains.
      </div>
    </div>
  );
}

function shown(c, t) {
  return c !== null && c <= t ? c : "—";
}

function Section({ title, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={sectionTitle}>{title}</div>
      {children}
    </div>
  );
}

// ─── Styles ────────────────────────────────────────────────────
const ctn      = { display: "flex", flexDirection: "column", gap: 12 };
const ctrlRow  = { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" };
const tlabel   = { fontSize: 11.5, fontFamily: "var(--font-mono)", color: "var(--text-muted)" };
const tbl      = { width: "100%", borderCollapse: "collapse", fontSize: 11.5, fontFamily: "var(--font-mono)" };
const trHead   = { background: "var(--bg-inset)" };
const th       = { padding: "4px 6px", textAlign: "left", color: "var(--text-muted)", fontWeight: 600, borderBottom: "1px solid var(--line)" };
const td       = { padding: "3px 6px", borderBottom: "0.5px solid var(--line)", color: "var(--text)" };
const tdNum    = { ...td, fontFamily: "var(--font-mono)", textAlign: "right", color: "var(--text-muted)" };
const tdMono   = { ...td, fontFamily: "var(--font-mono)" };
const tdCenter = { ...td, textAlign: "center", color: "var(--text-muted)" };
const sectionTitle = { fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-faint)" };
const caption  = { fontSize: 10.5, color: "var(--text-faint)", marginTop: 2 };
const footer   = { fontSize: 11, color: "var(--text-muted)", lineHeight: 1.55, padding: "6px 10px", background: "var(--bg-inset)", borderRadius: 4 };

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 11.5, padding: "4px 10px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "var(--accent-text-on)" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 4, cursor: "pointer",
  };
}
