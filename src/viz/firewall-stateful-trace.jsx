// firewall-stateful-trace — Injects packet stream; shows stateless vs
// stateful firewall decisions and connection-state table.
import { useState } from "react";

// Each packet: src, dst, srcPort, dstPort, flags ("SYN", "SYN-ACK", "ACK", "FIN"), direction
const SCENARIO = [
  { id: 1,  src: "192.168.1.5", dst: "8.8.8.8",     dstPort: 53,  flags: "SYN",    dir: "out" },
  { id: 2,  src: "8.8.8.8",     dst: "192.168.1.5", dstPort: 54321, flags: "SYN-ACK", dir: "in"  },
  { id: 3,  src: "192.168.1.5", dst: "8.8.8.8",     dstPort: 53,  flags: "ACK",    dir: "out" },
  { id: 4,  src: "192.168.1.5", dst: "8.8.8.8",     dstPort: 53,  flags: "DATA",   dir: "out" },
  { id: 5,  src: "8.8.8.8",     dst: "192.168.1.5", dstPort: 54321, flags: "DATA",   dir: "in"  },
  { id: 6,  src: "203.0.113.7", dst: "192.168.1.5", dstPort: 23,  flags: "SYN",    dir: "in"  },  // attacker telnet
  { id: 7,  src: "203.0.113.7", dst: "192.168.1.5", dstPort: 80,  flags: "ACK",    dir: "in"  },  // forged ACK
];

const STATELESS_RULES = [
  { test: p => p.dir === "out", verdict: "ALLOW", reason: "outbound any" },
  { test: p => p.dstPort === 80 || p.dstPort === 443, verdict: "ALLOW", reason: "inbound HTTP/S" },
  { test: () => true, verdict: "DENY", reason: "default deny" },
];

function statelessDecide(pkt) {
  for (const r of STATELESS_RULES) if (r.test(pkt)) return r;
}

function statefulDecide(pkt, table) {
  // Outbound: allow + create state entry on SYN/DATA
  if (pkt.dir === "out") {
    return { verdict: "ALLOW", reason: "outbound, state " + (pkt.flags === "SYN" ? "NEW" : "ESTABLISHED") };
  }
  // Inbound: check state table
  const matched = table.some(e => e.dst === pkt.src && e.src === pkt.dst);
  if (matched) return { verdict: "ALLOW", reason: "ESTABLISHED (matched state table)" };
  return { verdict: "DENY", reason: "no state for inbound NEW" };
}

export default function FirewallStatefulTrace() {
  const [idx, setIdx] = useState(0);
  const [table, setTable] = useState([]);
  const [log, setLog] = useState([]);

  function next() {
    if (idx >= SCENARIO.length) return;
    const pkt = SCENARIO[idx];
    const sless = statelessDecide(pkt);
    const sfull = statefulDecide(pkt, table);
    // Stateful: update table on outbound
    if (pkt.dir === "out" && sfull.verdict === "ALLOW") {
      const exists = table.some(e => e.src === pkt.src && e.dst === pkt.dst);
      if (!exists) setTable(t => [...t, { src: pkt.src, dst: pkt.dst, dstPort: pkt.dstPort, state: "ESTABLISHED" }]);
    }
    setLog(l => [...l, { pkt, sless, sfull }]);
    setIdx(idx + 1);
  }

  function reset() { setIdx(0); setTable([]); setLog([]); }

  const W = 580, H = 260;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 11, alignItems: "center" }}>
        <button onClick={next} disabled={idx >= SCENARIO.length} style={btn(false)}>▶ next packet ({idx}/{SCENARIO.length})</button>
        <button onClick={reset} style={btn(false)}>reset</button>
        <span style={{ color: "var(--text-muted)" }}>scenario: DNS query + attacker probe</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Decision panels */}
        <text x={150} y={25} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">stateless</text>
        <text x={430} y={25} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">stateful</text>

        <rect x={20} y={32} width={260} height={130} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <rect x={300} y={32} width={260} height={130} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />

        {/* recent log entries */}
        {log.slice(-5).map((entry, i) => {
          const y = 50 + i * 22;
          return (
            <g key={i}>
              <text x={30} y={y} fontSize="9.5" fontFamily="ui-monospace, monospace" fill="var(--text)">
                #{entry.pkt.id} {entry.pkt.dir} {entry.pkt.flags} :{entry.pkt.dstPort}
              </text>
              <text x={30} y={y + 11} fontSize="8.5" fill={entry.sless.verdict === "ALLOW" ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"}>
                → {entry.sless.verdict}: {entry.sless.reason}
              </text>
              <text x={310} y={y} fontSize="9.5" fontFamily="ui-monospace, monospace" fill="var(--text)">
                #{entry.pkt.id} {entry.pkt.dir} {entry.pkt.flags}
              </text>
              <text x={310} y={y + 11} fontSize="8.5" fill={entry.sfull.verdict === "ALLOW" ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"}>
                → {entry.sfull.verdict}: {entry.sfull.reason}
              </text>
            </g>
          );
        })}

        {/* State table */}
        <text x={W / 2} y={185} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">connection state table (stateful only)</text>
        <rect x={20} y={195} width={W - 40} height={55} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        {table.length === 0 ? (
          <text x={W / 2} y={225} textAnchor="middle" fontSize="10" fill="var(--text-faint)">(empty)</text>
        ) : (
          table.map((e, i) => (
            <text key={i} x={30} y={215 + i * 12} fontSize="9.5" fontFamily="ui-monospace, monospace" fill="var(--text)">
              {e.src} → {e.dst}:{e.dstPort}  state={e.state}
            </text>
          ))
        )}
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Stateless = per-packet rule match (rychlé, hloupé). Stateful = trackuje TCP/UDP <i>spojení</i> — povolí návrat traffic jen pokud
        odpovídá outbound state. Inbound NEW bez stavu → DENY. Attacker pakety odhalí jako orphan.
      </div>
    </div>
  );
}

function btn(active) {
  return { background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", border: "1px solid var(--line)", padding: "3px 9px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
