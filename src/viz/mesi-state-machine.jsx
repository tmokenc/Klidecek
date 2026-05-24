// mesi-state-machine — 2-core cache coherence. Click core 0/1 read/write
// to step the FSM; toggle MSI/MESI/MOESI. State, bus action, sharers visible.
import { useState } from "react";

const STATES = ["I", "S", "E", "M", "O"];
const STATE_COLOR = {
  I: "var(--text-faint)",
  S: "oklch(0.65 0.16 245)",
  E: "oklch(0.7 0.15 60)",
  M: "oklch(0.65 0.18 22)",
  O: "oklch(0.7 0.15 145)",
};

// Decide new state + bus action per protocol on this/foreign action.
function step(proto, c0, c1, ev) {
  // ev = "0r", "0w", "1r", "1w"
  const localCore = ev[0] === "0" ? 0 : 1;
  const isWrite = ev[1] === "w";
  const local = localCore === 0 ? c0 : c1;
  const other = localCore === 0 ? c1 : c0;

  let nl = local, no = other, bus = "—";

  // Helper: are there sharers?
  const otherHasCopy = ["S","E","M","O"].includes(other);

  if (!isWrite) {
    // READ
    if (local === "I") {
      bus = otherHasCopy ? "BusRead (other shares)" : "BusRead (no sharers)";
      if (proto === "MSI") {
        nl = "S";
        if (other === "M") { no = "S"; bus += " + M flush"; }
      } else if (proto === "MESI") {
        if (otherHasCopy) {
          nl = "S";
          if (other === "M") { no = "S"; bus += " + M flush"; }
          else if (other === "E") { no = "S"; }
        } else {
          nl = "E";
        }
      } else { // MOESI
        if (otherHasCopy) {
          nl = "S";
          if (other === "M") { no = "O"; bus = "BusRead → M→O, cache-to-cache"; }
          else if (other === "E") { no = "S"; }
        } else {
          nl = "E";
        }
      }
    } else {
      // hit, no bus traffic
      bus = "(hit, žádný bus)";
    }
  } else {
    // WRITE
    if (local === "I") {
      bus = "BusReadExclusive (invalidate others)";
      nl = "M";
      if (otherHasCopy) no = "I";
    } else if (local === "S") {
      bus = "BusUpgrade (invalidate sharers)";
      nl = "M";
      if (otherHasCopy) no = "I";
    } else if (local === "E") {
      bus = proto === "MSI" ? "(neexistuje E v MSI)" : "(silent E→M)";
      nl = "M";
    } else if (local === "O") {
      bus = "BusUpgrade (invalidate sharers)";
      nl = "M";
      if (otherHasCopy) no = "I";
    } else if (local === "M") {
      bus = "(hit, M zůstává)";
    }
  }
  // Restrict states by protocol
  if (proto === "MSI") {
    if (nl === "E") nl = "S";
    if (no === "E") no = "S";
    if (nl === "O") nl = "S";
    if (no === "O") no = "S";
  } else if (proto === "MESI") {
    if (nl === "O") nl = "S";
    if (no === "O") no = "S";
  }
  return [nl, no, bus];
}

export default function MesiStateMachine() {
  const [proto, setProto] = useState("MESI");
  const [c0, setC0] = useState("I");
  const [c1, setC1] = useState("I");
  const [log, setLog] = useState([{ txt: "počáteční stav: oba I" }]);

  function go(ev) {
    const [n0, n1, bus] = ev[0] === "0" ? step(proto, c0, c1, ev) : step(proto, c1, c0, ev).map((x, i) => i < 2 ? (i === 0 ? x : x) : x);
    if (ev[0] === "0") {
      setC0(n0); setC1(n1);
    } else {
      const [n1b, n0b, bus2] = step(proto, c1, c0, ev);
      setC1(n1b); setC0(n0b);
      setLog(l => [...l, { txt: `core${ev[0]} ${ev[1] === "r" ? "READ" : "WRITE"} → core0=${n0b}, core1=${n1b} | ${bus2}` }]);
      return;
    }
    setLog(l => [...l, { txt: `core${ev[0]} ${ev[1] === "r" ? "READ" : "WRITE"} → core0=${n0}, core1=${n1} | ${bus}` }]);
  }

  function reset() { setC0("I"); setC1("I"); setLog([{ txt: "počáteční stav: oba I" }]); }

  const W = 580, H = 240;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <select value={proto} onChange={e => { setProto(e.target.value); reset(); }} style={ctrl}>
          <option value="MSI">MSI (3 stavy)</option>
          <option value="MESI">MESI (+E)</option>
          <option value="MOESI">MOESI (+O)</option>
        </select>
        <button onClick={() => go("0r")} style={btn(false)}>core 0 read</button>
        <button onClick={() => go("0w")} style={btn(false)}>core 0 write</button>
        <button onClick={() => go("1r")} style={btn(false)}>core 1 read</button>
        <button onClick={() => go("1w")} style={btn(false)}>core 1 write</button>
        <button onClick={reset} style={btn(false)}>reset</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* core 0 */}
        <rect x={40} y={40} width={180} height={90} fill="var(--bg-inset)" stroke="var(--line)" rx="4" />
        <text x={130} y={58} textAnchor="middle" fontSize="11" fill="var(--text)" fontWeight="600">Core 0</text>
        <circle cx={130} cy={92} r={26} fill={STATE_COLOR[c0]} opacity={c0 === "I" ? 0.3 : 0.85} stroke="var(--line-strong)" strokeWidth="1.5" />
        <text x={130} y={97} textAnchor="middle" fontSize="20" fontWeight="700" fill={c0 === "I" ? "var(--text-muted)" : "white"}>{c0}</text>
        {/* core 1 */}
        <rect x={360} y={40} width={180} height={90} fill="var(--bg-inset)" stroke="var(--line)" rx="4" />
        <text x={450} y={58} textAnchor="middle" fontSize="11" fill="var(--text)" fontWeight="600">Core 1</text>
        <circle cx={450} cy={92} r={26} fill={STATE_COLOR[c1]} opacity={c1 === "I" ? 0.3 : 0.85} stroke="var(--line-strong)" strokeWidth="1.5" />
        <text x={450} y={97} textAnchor="middle" fontSize="20" fontWeight="700" fill={c1 === "I" ? "var(--text-muted)" : "white"}>{c1}</text>

        {/* bus */}
        <line x1={220} y1={92} x2={360} y2={92} stroke="var(--line-strong)" strokeWidth="1.5" strokeDasharray="3 3" />
        <text x={290} y={84} textAnchor="middle" fontSize="9" fill="var(--text-muted)">BUS</text>

        {/* state legend */}
        <g fontSize="9" fill="var(--text)">
          {STATES.filter(s => proto !== "MSI" || ["I","S","M"].includes(s)).filter(s => proto !== "MESI" || s !== "O").map((s, i) => (
            <g key={s} transform={`translate(${40 + i * 100}, 150)`}>
              <circle cx={6} cy={3} r={5} fill={STATE_COLOR[s]} opacity={s === "I" ? 0.3 : 0.85} />
              <text x={16} y={6} fill="var(--text-muted)">{s} = {{
                I: "Invalid", S: "Shared", E: "Exclusive", M: "Modified", O: "Owned"
              }[s]}</text>
            </g>
          ))}
        </g>

        <g fontSize="9.5" fontFamily="ui-monospace, monospace" fill="var(--text)">
          {log.slice(-4).map((l, i) => (
            <text key={i} x={20} y={185 + i * 13} fill={i === log.slice(-4).length - 1 ? "var(--accent)" : "var(--text-muted)"}>
              {l.txt}
            </text>
          ))}
        </g>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        MESI klíčový optimalizační moment: <b>E → M je silent</b> (žádný bus). MOESI navíc umí <b>cache-to-cache transfer</b> (M → O, memory zůstává).
      </div>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 6px", borderRadius: 3, fontSize: 11 };
function btn(active) {
  return { ...ctrl, background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", cursor: "pointer", padding: "3px 9px" };
}
