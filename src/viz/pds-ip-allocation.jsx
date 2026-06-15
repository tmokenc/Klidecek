// IP address allocation hierarchy: IANA → RIR → LIR → ISP → uživatel.
// Click a level to see its role and which whois / log field exposes the address
// at that level. The lower you go, the more specific the identification.
import { useState } from "react";

const LEVELS = [
  {
    id: "iana", label: "IANA", x: 70,
    role: "Spravuje celý adresní prostor; přiděluje velké bloky regionálním registrům.",
    field: "(globální /8 bloky)",
    learns: "kontinentální alokace",
  },
  {
    id: "rir", label: "RIR", x: 168,
    role: "5 regionálních registrů (ARIN, RIPE NCC, APNIC, AfriNIC, LACNIC). Vedou veřejné whois.",
    field: "country, region",
    learns: "region a země",
  },
  {
    id: "lir", label: "LIR", x: 266,
    role: "Local Internet Registry (velký ISP). Od RIR dostává bloky a dál je rozděluje.",
    field: "inetnum, netname, route, origin (AS)",
    learns: "držitel bloku + AS",
  },
  {
    id: "isp", label: "ISP", x: 364,
    role: "Koncový poskytovatel; přiděluje adresy uživatelům přes DHCP / PPPoE / SLAAC.",
    field: "MAC, DHCP opt.82, username, lease time",
    learns: "konkrétní přípojka",
  },
  {
    id: "user", label: "uživatel", x: 466,
    role: "Vstupní bod do sítě. ISP zná dvojici „kdo měl jakou adresu a kdy“ (tracing, billing).",
    field: "← dohledatelný konkrétní účastník",
    learns: "konkrétní osoba",
  },
];

export default function IpAllocation() {
  const [sel, setSel] = useState("isp");
  const lv = LEVELS.find((l) => l.id === sel);
  const selIdx = LEVELS.findIndex((l) => l.id === sel);

  const W = 520, H = 150;
  const y = 56;

  // whois/field callout: width fits the longest field string; clamp inside frame
  const calloutW = 200;
  const calloutX = Math.max(8, Math.min(lv.x - 70, W - calloutW - 8));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />
        <text x={W / 2} y={20} textAnchor="middle" fontSize="10" fill="var(--text-muted)" fontWeight="700">
          hierarchie alokace — vlevo obecné, vpravo konkrétní
        </text>

        {/* connecting arrows */}
        {LEVELS.slice(0, -1).map((l, i) => {
          const next = LEVELS[i + 1];
          return (
            <line key={`a-${i}`} x1={l.x + 26} y1={y} x2={next.x - 26} y2={y}
              stroke="var(--line-strong)" strokeWidth="1.2" markerEnd="url(#ia-arr)" />
          );
        })}

        {LEVELS.map((l, i) => {
          const isSel = l.id === sel;
          const inChain = i <= selIdx;
          let fill = "var(--bg-card)", stroke = "var(--line-strong)";
          if (isSel) { fill = "var(--accent)"; stroke = "var(--accent)"; }
          else if (inChain) { fill = "color-mix(in oklch, var(--accent) 14%, var(--bg-card))"; stroke = "var(--accent)"; }
          return (
            <g key={l.id} style={{ cursor: "pointer" }} onClick={() => setSel(l.id)}>
              <circle cx={l.x} cy={y} r="22" fill={fill} stroke={stroke} strokeWidth={isSel ? 2 : 1} />
              <text x={l.x} y={y + 3.5} textAnchor="middle" fontSize={l.id === "user" ? "8" : "10"}
                fontFamily="var(--font-mono)" fontWeight="700"
                fill={isSel ? "white" : "var(--text)"}>{l.label}</text>
            </g>
          );
        })}

        {/* specificity arrow under the chain */}
        <line x1={56} y1={96} x2={480} y2={96} stroke="var(--text-faint)" strokeWidth="0.8"
          markerEnd="url(#ia-arr2)" />
        <text x={70} y={110} fontSize="8.5" fill="var(--text-faint)">obecné</text>
        <text x={470} y={110} textAnchor="end" fontSize="8.5" fill="var(--text-faint)">konkrétní účastník</text>

        {/* selected level whois/field callout */}
        <rect x={calloutX} y={120} width={calloutW} height="22" rx="3"
          fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="1" />
        <text x={calloutX + 6} y={134} fontSize="7.5"
          fontFamily="var(--font-mono)" fill="var(--accent)">{lv.field}</text>

        <defs>
          <marker id="ia-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 z" fill="var(--line-strong)" />
          </marker>
          <marker id="ia-arr2" markerWidth="6" markerHeight="6" refX="4" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 z" fill="var(--text-faint)" />
          </marker>
        </defs>
      </svg>

      <div className="viz-controls">
        {LEVELS.map((l) => (
          <button key={l.id}
            className="viz-btn"
            data-active={sel === l.id}
            onClick={() => setSel(l.id)}>
            {l.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 10, background: "var(--bg-card)", borderRadius: 6, border: "1px solid var(--line)" }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text)", marginBottom: 4 }}>
          {lv.label} — zjistí: {lv.learns}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{lv.role}</div>
      </div>
    </div>
  );
}
