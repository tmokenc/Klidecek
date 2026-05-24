// ddos-amplification — Pick reflector protocol; set botnet outgoing bandwidth;
// compute reflected attack volume. Real-world amplification factors.
import { useState } from "react";

const PROTOCOLS = [
  { id: "dns",    name: "DNS (ANY query)",   amp: 28,    note: "common, easy to find resolvers" },
  { id: "ntp",    name: "NTP monlist",       amp: 556,   note: "old NTP servers, mostly patched" },
  { id: "ssdp",   name: "SSDP",              amp: 30,    note: "IoT devices, UPnP" },
  { id: "memc",   name: "Memcached",         amp: 51200, note: "GitHub 2018: 1.35 Tbps" },
  { id: "snmp",   name: "SNMP",              amp: 6.3,   note: "modest factor" },
  { id: "chargen",name: "CHARGEN",           amp: 358,   note: "legacy, rare today" },
];

function fmt(gbps) {
  if (gbps >= 1000) return (gbps / 1000).toFixed(2) + " Tbps";
  if (gbps >= 1)    return gbps.toFixed(1) + " Gbps";
  return (gbps * 1000).toFixed(0) + " Mbps";
}

export default function DdosAmplification() {
  const [protoId, setProtoId] = useState("memc");
  const [botSize, setBotSize] = useState(1000);     // bots
  const [perBotMbps, setPerBotMbps] = useState(1);  // attacker outgoing per bot

  const proto = PROTOCOLS.find(p => p.id === protoId);
  const totalOutMbps = botSize * perBotMbps;
  const reflectedMbps = totalOutMbps * proto.amp;
  const reflectedGbps = reflectedMbps / 1000;

  const W = 580, H = 250;

  // Famous attacks for context
  const REFS = [
    { name: "Mirai DDoS 2016",        gbps: 1000 },
    { name: "GitHub memcached 2018",  gbps: 1350 },
    { name: "AWS 2020",               gbps: 2300 },
    { name: "Cloudflare 2022",        gbps: 2400 },
  ];

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8, fontSize: 11 }}>
        <div>
          Protocol: <select value={protoId} onChange={e => setProtoId(e.target.value)} style={ctrl}>
            {PROTOCOLS.map(p => <option key={p.id} value={p.id}>{p.name} ({p.amp}×)</option>)}
          </select>
          <div style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 10 }}>{proto.note}</div>
        </div>
        <div>
          <div>Botnet size = {botSize.toLocaleString()} bots
            <input type="range" min="10" max="100000" step="10" value={botSize} onChange={e => setBotSize(+e.target.value)} style={{ width: "100%" }} /></div>
          <div>Per-bot outgoing = {perBotMbps} Mbps
            <input type="range" min="0.1" max="10" step="0.1" value={perBotMbps} onChange={e => setPerBotMbps(+e.target.value)} style={{ width: "100%" }} /></div>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Attacker box */}
        <rect x={20} y={50} width={140} height={60} rx="4" fill="oklch(0.65 0.18 22 / 0.2)" stroke="oklch(0.65 0.18 22)" />
        <text x={90} y={70} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">Botnet</text>
        <text x={90} y={86} textAnchor="middle" fontSize="9.5" fontFamily="ui-monospace, monospace" fill="var(--text)">{fmt(totalOutMbps / 1000)}</text>
        <text x={90} y={100} textAnchor="middle" fontSize="9" fill="var(--text-muted)">spoofed src = victim</text>

        {/* Reflectors */}
        <rect x={220} y={50} width={140} height={60} rx="4" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={290} y={70} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">Open {proto.name.split(" ")[0]}</text>
        <text x={290} y={86} textAnchor="middle" fontSize="10" fontFamily="ui-monospace, monospace" fill="var(--accent)">×{proto.amp}</text>
        <text x={290} y={100} textAnchor="middle" fontSize="9" fill="var(--text-muted)">reflectors (servers)</text>

        {/* Victim */}
        <rect x={420} y={50} width={140} height={60} rx="4" fill="oklch(0.65 0.16 245 / 0.2)" stroke="oklch(0.65 0.16 245)" />
        <text x={490} y={70} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">Victim</text>
        <text x={490} y={88} textAnchor="middle" fontSize="11" fontFamily="ui-monospace, monospace" fontWeight="700"
          fill={reflectedGbps > 500 ? "oklch(0.65 0.18 22)" : reflectedGbps > 50 ? "oklch(0.75 0.12 60)" : "var(--text)"}>
          {fmt(reflectedGbps)}
        </text>
        <text x={490} y={102} textAnchor="middle" fontSize="9" fill="var(--text-muted)">incoming flood</text>

        {/* Arrows */}
        <line x1={160} y1={80} x2={220} y2={80} stroke="oklch(0.65 0.18 22)" strokeWidth="1.5" markerEnd="url(#dd-ar)" />
        <line x1={360} y1={80} x2={420} y2={80} stroke="oklch(0.65 0.18 22)" strokeWidth="3" markerEnd="url(#dd-ar)" />
        <text x={190} y={75} textAnchor="middle" fontSize="9" fill="var(--text-muted)">small req</text>
        <text x={390} y={75} textAnchor="middle" fontSize="9" fill="oklch(0.65 0.18 22)" fontWeight="600">amplified</text>

        <defs>
          <marker id="dd-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L5,3 L0,6 z" fill="oklch(0.65 0.18 22)" /></marker>
        </defs>

        {/* Comparison bar chart */}
        <text x={20} y={140} fontSize="10" fontWeight="600" fill="var(--text)">historical comparison:</text>
        {REFS.map((r, i) => {
          const maxGbps = Math.max(reflectedGbps, ...REFS.map(x => x.gbps));
          const ourW = Math.min(540, reflectedGbps / maxGbps * 540);
          const refW = Math.min(540, r.gbps / maxGbps * 540);
          return (
            <g key={r.name}>
              <rect x={20} y={150 + i * 20} width={refW} height="14" fill="oklch(0.7 0.15 145 / 0.4)" stroke="oklch(0.7 0.15 145)" strokeWidth="0.5" />
              <text x={25 + refW + 5} y={161 + i * 20} fontSize="9" fill="var(--text)">{r.name}: {fmt(r.gbps)}</text>
            </g>
          );
        })}
        <rect x={20} y={150 + REFS.length * 20} width={Math.min(540, reflectedGbps / Math.max(reflectedGbps, ...REFS.map(x => x.gbps)) * 540)} height="16"
          fill="oklch(0.65 0.18 22 / 0.6)" stroke="oklch(0.65 0.18 22)" strokeWidth="1" />
        <text x={25 + Math.min(540, reflectedGbps / Math.max(reflectedGbps, ...REFS.map(x => x.gbps)) * 540) + 5}
          y={163 + REFS.length * 20} fontSize="9.5" fill="oklch(0.65 0.18 22)" fontWeight="700">
          tvoje sim: {fmt(reflectedGbps)}
        </text>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Princip amplifikace: <b>spoofed src</b> = victim IP, *malý* UDP request → *velká* response → router posílá na victim.
        Defense: BCP38 (filter spoofed src), patch reflectors (memcached 11211 nepublikovat), cloud DDoS scrubbing.
      </div>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 5px", borderRadius: 3, fontSize: 11 };
