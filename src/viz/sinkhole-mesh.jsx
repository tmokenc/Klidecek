// Sinkhole + selective forwarding na IoT mesh.
import { useMemo, useState } from "react";

// Fixed node positions
const NODES = [
  { id: "G", x: 460, y: 60, role: "gateway" },
  { id: "A", x: 80, y: 60 },
  { id: "B", x: 160, y: 120 },
  { id: "C", x: 60, y: 180 },
  { id: "D", x: 200, y: 220 },
  { id: "E", x: 260, y: 140 },
  { id: "F", x: 350, y: 100 },
  { id: "H", x: 340, y: 200 },
  { id: "I", x: 120, y: 260 },
];

// Normal route: each node routes to gateway via nearest "uplink" neighbor
const NORMAL_ROUTES = {
  A: ["B", "E", "F", "G"],
  B: ["E", "F", "G"],
  C: ["B", "E", "F", "G"],
  D: ["E", "F", "G"],
  E: ["F", "G"],
  F: ["G"],
  H: ["F", "G"],
  I: ["D", "E", "F", "G"],
};

// When 'E' is compromised, all nodes route through E (advertised as super-link)
const SINK_ROUTES = {
  A: ["B", "E", "G_via_attacker"],
  B: ["E", "G_via_attacker"],
  C: ["B", "E", "G_via_attacker"],
  D: ["E", "G_via_attacker"],
  E: ["G_via_attacker"],
  F: ["G"], // F is closer to G; may resist
  H: ["E", "G_via_attacker"], // sinkhole pulls H too
  I: ["D", "E", "G_via_attacker"],
};

export default function SinkholeMesh() {
  const [compromised, setCompromised] = useState(null);
  const [selective, setSelective] = useState(false);
  const [src, setSrc] = useState("A");
  const [packetType, setPacketType] = useState("normal");

  const routes = compromised === "E" ? SINK_ROUTES : NORMAL_ROUTES;
  const route = routes[src] || [];

  // Determine packet fate
  const passesThroughCompromised = route.includes("E") || route.includes("G_via_attacker");
  const dropped = compromised === "E" && selective && passesThroughCompromised && packetType === "alarm";

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>kompromitovany uzel:</label>
        <button style={{ ...btn, background: compromised === "E" ? "#e07a5f" : "var(--bg-inset)", color: compromised === "E" ? "var(--bg-inset)" : "var(--text)" }}
          onClick={() => setCompromised(compromised === "E" ? null : "E")}>
          {compromised === "E" ? "✓ E kompromitovan" : "kompromituj E"}
        </button>
        <label style={lbl}>selective forwarding:</label>
        <button style={{ ...btn, background: selective ? "#e07a5f" : "var(--bg-inset)", color: selective ? "var(--bg-inset)" : "var(--text)" }}
          onClick={() => setSelective(!selective)} disabled={compromised !== "E"}>
          {selective ? "drop alarm" : "off"}
        </button>
      </div>

      <div style={row}>
        <label style={lbl}>send packet from:</label>
        <select value={src} onChange={(e) => setSrc(e.target.value)} style={sel}>
          {Object.keys(NORMAL_ROUTES).map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <label style={lbl}>type:</label>
        <select value={packetType} onChange={(e) => setPacketType(e.target.value)} style={sel}>
          <option value="normal">normal (telemetrie)</option>
          <option value="alarm">alarm (panic!)</option>
        </select>
      </div>

      <svg viewBox="0 0 540 320" style={{ width: "100%", maxWidth: 580, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* Edges (mesh links) */}
        {[
          ["A", "B"], ["B", "C"], ["B", "E"], ["C", "I"], ["D", "I"], ["D", "E"], ["E", "F"],
          ["F", "G"], ["F", "H"], ["H", "E"], ["B", "D"],
        ].map(([a, b], i) => (
          <line key={i}
            x1={NODES.find(n => n.id === a).x} y1={NODES.find(n => n.id === a).y}
            x2={NODES.find(n => n.id === b).x} y2={NODES.find(n => n.id === b).y}
            stroke="var(--line)" strokeWidth="0.8" strokeDasharray="2 2" />
        ))}
        {/* Route */}
        {(() => {
          const path = [src, ...route];
          const pathPoints = path.map((p) => {
            if (p === "G_via_attacker") return NODES.find(n => n.id === "G");
            return NODES.find(n => n.id === p);
          }).filter(Boolean);
          const segments = [];
          for (let i = 0; i < pathPoints.length - 1; i++) {
            const a = pathPoints[i], b = pathPoints[i + 1];
            const isDropped = dropped && path[i + 1] === "E";
            segments.push(
              <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={isDropped ? "#e07a5f" : "var(--accent)"} strokeWidth="2"
                strokeDasharray={isDropped ? "4 3" : "0"} />
            );
            if (isDropped) {
              segments.push(<text key={`d-${i}`} x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 - 6} fontSize="14" textAnchor="middle" fill="#e07a5f">✗</text>);
            }
          }
          return segments;
        })()}
        {/* Nodes */}
        {NODES.map((n) => {
          const isComp = compromised === n.id;
          const isGw = n.role === "gateway";
          const isSrc = n.id === src;
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={isGw ? 22 : 16}
                fill={isComp ? "#e07a5f" : isGw ? "#81b29a" : "var(--bg-card)"}
                stroke="var(--accent)" strokeWidth={isSrc ? 2 : 1} />
              <text x={n.x} y={n.y + 4} fontSize={isGw ? "13" : "11"} textAnchor="middle"
                fill={isComp || isGw ? "var(--bg-inset)" : "var(--text)"} fontWeight="bold">{n.id}</text>
            </g>
          );
        })}
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 8, borderRadius: 6, fontSize: 11, fontFamily: "var(--font-mono)" }}>
        <div>route: {src} → {route.join(" → ")}</div>
        <div style={{ marginTop: 4, color: dropped ? "#e07a5f" : "#81b29a" }}>
          {dropped ? "✗ packet zahozen (selective forward — alarm filtrovan)" : "✓ packet dorazi do gateway"}
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Sinkhole: kompromitovany uzel E inzeruje "vyborna cesta k gateway" (silnejsi antena, nizsi rank). Sousedi prepocet, vsechny pakety smeruji pres E.
        Selective forwarding (gray hole): E forwarduje normal pakety, ale alarmove zahazuje — utok zustane neviditelny.
        Obrana: kryptograficky autentizovany routing (NWK encryption), watchdog uzly, anomaly detection.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
