// arp-poison-mitm — Click "send fake ARP reply"; victim's table updates;
// subsequent packets re-route through attacker. Toggle dynamic-ARP-inspection.
import { useState } from "react";

const VICTIM_IP = "192.168.1.5";
const VICTIM_MAC = "aa:aa:aa:11:11:11";
const GATEWAY_IP = "192.168.1.1";
const GATEWAY_MAC = "bb:bb:bb:22:22:22";
const ATTACKER_IP = "192.168.1.99";
const ATTACKER_MAC = "cc:cc:cc:99:99:99";

export default function ArpPoisonMitm() {
  const [arpTable, setArpTable] = useState({
    [GATEWAY_IP]: GATEWAY_MAC,
  });
  const [packets, setPackets] = useState([]);
  const [dai, setDai] = useState(false);

  function poison() {
    if (dai) {
      // Dynamic ARP Inspection blocks bogus
      setPackets(p => [...p, { kind: "blocked", txt: "ARP reply ATTACKER→VICTIM 'I'm gateway' (BLOCKED by DAI)" }]);
      return;
    }
    setArpTable(t => ({ ...t, [GATEWAY_IP]: ATTACKER_MAC }));
    setPackets(p => [...p, { kind: "poison", txt: `ARP reply (forged): "${GATEWAY_IP} is at ${ATTACKER_MAC}" → table updated` }]);
  }

  function sendPacket() {
    const gwMac = arpTable[GATEWAY_IP];
    const intercepted = gwMac === ATTACKER_MAC;
    setPackets(p => [...p, {
      kind: intercepted ? "mitm" : "ok",
      txt: `Packet ${VICTIM_IP}→${GATEWAY_IP} sent to MAC ${gwMac} ${intercepted ? "← ATTACKER (sniffed!)" : "← gateway ✓"}`
    }]);
  }

  function reset() {
    setArpTable({ [GATEWAY_IP]: GATEWAY_MAC });
    setPackets([]);
  }

  const poisoned = arpTable[GATEWAY_IP] === ATTACKER_MAC;
  const W = 580, H = 250;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center", fontSize: 11 }}>
        <button onClick={poison} style={btn(false)}>⚠ attacker: send fake ARP reply</button>
        <button onClick={sendPacket} style={btn(false)}>victim: send packet → gateway</button>
        <button onClick={reset} style={btn(false)}>reset</button>
        <label><input type="checkbox" checked={dai} onChange={e => { setDai(e.target.checked); if (e.target.checked) reset(); }} /> Dynamic ARP Inspection (DAI)</label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Hosts */}
        <g>
          <rect x={20} y={30} width={120} height={56} rx="4" fill="var(--bg-inset)" stroke="oklch(0.65 0.16 245)" strokeWidth="1.5" />
          <text x={80} y={47} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text)">Victim</text>
          <text x={80} y={61} textAnchor="middle" fontSize="9" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">{VICTIM_IP}</text>
          <text x={80} y={75} textAnchor="middle" fontSize="9" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">{VICTIM_MAC}</text>

          <rect x={440} y={30} width={120} height={56} rx="4" fill="var(--bg-inset)" stroke="oklch(0.7 0.15 145)" strokeWidth="1.5" />
          <text x={500} y={47} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text)">Gateway</text>
          <text x={500} y={61} textAnchor="middle" fontSize="9" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">{GATEWAY_IP}</text>
          <text x={500} y={75} textAnchor="middle" fontSize="9" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">{GATEWAY_MAC}</text>

          <rect x={230} y={130} width={120} height={56} rx="4" fill="oklch(0.65 0.18 22 / 0.15)" stroke="oklch(0.65 0.18 22)" strokeWidth="1.5" />
          <text x={290} y={147} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--text)">Attacker</text>
          <text x={290} y={161} textAnchor="middle" fontSize="9" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">{ATTACKER_IP}</text>
          <text x={290} y={175} textAnchor="middle" fontSize="9" fontFamily="ui-monospace, monospace" fill="var(--text-muted)">{ATTACKER_MAC}</text>
        </g>

        {/* Path arrows */}
        {!poisoned ? (
          <path d="M 140 58 L 440 58" stroke="oklch(0.7 0.15 145)" strokeWidth="2" markerEnd="url(#arp-ar)" />
        ) : (
          <>
            <path d="M 140 58 Q 200 100 290 130" stroke="oklch(0.65 0.18 22)" strokeWidth="2" markerEnd="url(#arp-ar)" />
            <path d="M 290 130 Q 380 100 440 58" stroke="oklch(0.65 0.18 22)" strokeWidth="2" markerEnd="url(#arp-ar)" strokeDasharray="3 2" />
            <text x={W / 2} y={115} textAnchor="middle" fontSize="10" fill="oklch(0.65 0.18 22)" fontWeight="700">MITM</text>
          </>
        )}
        <defs>
          <marker id="arp-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L5,3 L0,6 z" fill="currentColor" /></marker>
        </defs>

        {/* Victim's ARP table */}
        <rect x={20} y={195} width={260} height={48} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={30} y={210} fontSize="9.5" fontWeight="600" fill="var(--text)">victim's ARP table:</text>
        <text x={30} y={224} fontSize="9.5" fontFamily="ui-monospace, monospace"
          fill={poisoned ? "oklch(0.65 0.18 22)" : "var(--text)"}>
          {GATEWAY_IP} → {arpTable[GATEWAY_IP]} {poisoned ? "(POISONED!)" : ""}
        </text>
        <text x={30} y={237} fontSize="8.5" fill="var(--text-muted)">no auth in ARP → first reply wins</text>

        {/* log */}
        <rect x={300} y={195} width={260} height={48} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={310} y={210} fontSize="9.5" fontWeight="600" fill="var(--text)">trace:</text>
        {packets.slice(-2).map((p, i) => (
          <text key={i} x={310} y={224 + i * 12} fontSize="8.5" fontFamily="ui-monospace, monospace"
            fill={p.kind === "mitm" || p.kind === "poison" ? "oklch(0.65 0.18 22)" :
                  p.kind === "blocked" ? "oklch(0.7 0.15 145)" : "var(--text)"}>
            {p.txt.length > 50 ? p.txt.slice(0, 48) + "…" : p.txt}
          </text>
        ))}
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        ARP nemá autentizaci — attacker pošle nezvanou reply, victim updatuje cache. Defense: <b>DAI</b> (switch validuje proti DHCP snooping),
        <b>static ARP</b>, monitoring. TLS + HSTS limituje impact (encrypt + autentizovaný server).
      </div>
    </div>
  );
}

function btn(active) {
  return { background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", border: "1px solid var(--line)", padding: "3px 9px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
