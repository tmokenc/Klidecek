// Wormhole utok: dva malicious uzly propojene out-of-band tunelem.
// Vzdalene uzly se zdaji byt sousedi.
import { useState } from "react";

const NODES = [
  { id: "A", x: 60, y: 80 },
  { id: "B", x: 130, y: 130 },
  { id: "C", x: 70, y: 200 },
  { id: "M1", x: 220, y: 140, malicious: true },
  { id: "M2", x: 360, y: 140, malicious: true },
  { id: "D", x: 450, y: 80 },
  { id: "E", x: 480, y: 200 },
  { id: "F", x: 520, y: 140 },
];

const LEGIT_LINKS = [
  ["A", "B"], ["B", "C"], ["A", "C"], ["B", "M1"], ["C", "M1"],
  ["D", "M2"], ["E", "M2"], ["F", "M2"], ["D", "E"], ["D", "F"], ["E", "F"],
];

export default function WormholeTunnel() {
  const [tunnelOn, setTunnelOn] = useState(false);
  const [src, setSrc] = useState("A");
  const [dst, setDst] = useState("D");

  // Hop count
  // legit: A → B → M1 → ??? → D (without tunnel, A cannot reach D's side at all, so packet drops)
  // wormhole: A → B → M1 ⤳ M2 → D (3-4 hops, distance "1 link")
  function findPath() {
    if (!tunnelOn) return ["A → B → C → ... → ???  (zadna cesta, ostrovy oddeleny)"];
    return [`${src} → B → M1`, "M1 ⤳ M2 (out-of-band tunel)", `M2 → ${dst}`];
  }

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>wormhole tunel mezi M1 a M2:</label>
        <button style={{ ...btn, background: tunnelOn ? "#e07a5f" : "var(--bg-inset)", color: tunnelOn ? "var(--bg-inset)" : "var(--text)" }}
          onClick={() => setTunnelOn(!tunnelOn)}>{tunnelOn ? "ON" : "OFF"}</button>
      </div>

      <div style={row}>
        <label style={lbl}>from:</label>
        <select value={src} onChange={(e) => setSrc(e.target.value)} style={sel}>
          {["A", "B", "C"].map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <label style={lbl}>to:</label>
        <select value={dst} onChange={(e) => setDst(e.target.value)} style={sel}>
          {["D", "E", "F"].map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </div>

      <svg viewBox="0 0 580 280" style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* legit links */}
        {LEGIT_LINKS.map(([a, b], i) => {
          const A = NODES.find(n => n.id === a), B = NODES.find(n => n.id === b);
          return <line key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="var(--line)" strokeWidth="0.8" strokeDasharray="2 2" />;
        })}
        {/* Tunnel */}
        {tunnelOn && (
          <>
            <line x1={220} y1={140} x2={360} y2={140} stroke="#e07a5f" strokeWidth="3" strokeDasharray="0" />
            <text x={290} y={134} fontSize="10" textAnchor="middle" fill="#e07a5f">↮ tunel (fiber/GSM)</text>
          </>
        )}
        {/* Nodes */}
        {NODES.map((n) => (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={18}
              fill={n.malicious ? "#e07a5f" : "var(--bg-card)"}
              stroke="var(--accent)" strokeWidth="1.2" />
            <text x={n.x} y={n.y + 4} fontSize="12" textAnchor="middle"
              fill={n.malicious ? "var(--bg-inset)" : "var(--text)"} fontWeight="bold">{n.id}</text>
          </g>
        ))}
        {/* Network divider */}
        {!tunnelOn && (
          <>
            <line x1={290} y1={20} x2={290} y2={260} stroke="var(--text-muted)" strokeWidth="0.6" strokeDasharray="3 4" />
            <text x={290} y={20} fontSize="10" textAnchor="middle" fill="var(--text-muted)">izolovane podsite</text>
          </>
        )}
        {tunnelOn && (
          <>
            <text x={130} y={20} fontSize="11" textAnchor="middle" fill="var(--text)">sit A (uzly A, B, C)</text>
            <text x={450} y={20} fontSize="11" textAnchor="middle" fill="var(--text)">sit B (uzly D, E, F)</text>
          </>
        )}
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <div style={lbl}>cesta z {src} do {dst}:</div>
        {findPath().map((p, i) => (
          <div key={i} style={{ padding: "2px 0", color: tunnelOn ? "#e07a5f" : "var(--text-muted)" }}>{p}</div>
        ))}
        {tunnelOn && (
          <div style={{ marginTop: 6, color: "var(--accent)", fontSize: 10 }}>
            ↳ {dst} si mysli, ze M2 je primy soused {src}; ve skutecnosti se packety presli pres out-of-band kanal.
          </div>
        )}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Wormhole tunel umoznuje vzdalenym uzlum vidieť se jako sousedi → naruseni routingu (AODV neighbor table),
        race conditions, MITM cele sítě. Relay útok na PKE auta nebo bezkontaktní platby je specialny pripad wormhole.
        Obrana: packet leashes (Hu-Perrig-Johnson — GPS-based geographic leash, timestamp-based temporal leash),
        distance bounding (RTT mereni).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
