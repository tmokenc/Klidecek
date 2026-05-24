// wep-fms-cracker — FMS / PTW attack progress. Capture packets; weak IV
// fraction reveals key bytes; ~40k packets crack 104-bit WEP in minutes.
import { useState, useEffect, useRef } from "react";

const KEY_LEN = 13; // 13 bytes = 104-bit WEP
const PACKETS_TO_CRACK = 40000;

export default function WepFmsCracker() {
  const [packets, setPackets] = useState(0);
  const [running, setRunning] = useState(false);
  const [arpReplay, setArpReplay] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const step = arpReplay ? 500 : 50;
    intervalRef.current = setInterval(() => {
      setPackets(p => {
        const next = p + step;
        if (next >= PACKETS_TO_CRACK * 1.5) { setRunning(false); return PACKETS_TO_CRACK * 1.5; }
        return next;
      });
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [running, arpReplay]);

  // Confidence per key byte rises sigmoidally as we cross threshold per byte.
  const perByteThresh = PACKETS_TO_CRACK / KEY_LEN;
  const keyBytes = Array.from({ length: KEY_LEN }, (_, i) => {
    // Byte i needs more packets than byte i-1 (FMS attack recovers bytes sequentially).
    const need = perByteThresh * (i + 1);
    const confidence = Math.max(0, Math.min(1, (packets - need * 0.8) / (need * 0.3)));
    return { recovered: confidence > 0.8, confidence };
  });
  const recoveredCount = keyBytes.filter(b => b.recovered).length;
  const cracked = recoveredCount === KEY_LEN;

  // Weak IV count (FMS: ~5% IVs are "weak")
  const weakIvs = Math.floor(packets * 0.05);

  const W = 580, H = 240;

  function reset() { setRunning(false); setPackets(0); }

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center", fontSize: 11 }}>
        <button onClick={() => setRunning(r => !r)} style={btn(running)}>{running ? "⏸ pauza" : "▶ capture"}</button>
        <button onClick={reset} style={btn(false)}>reset</button>
        <label><input type="checkbox" checked={arpReplay} onChange={e => setArpReplay(e.target.checked)} /> ARP replay attack (10× rychlost)</label>
        <span style={{ marginLeft: "auto", color: "var(--text-muted)" }}>tcpdump-style packet capture simulation</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Progress bar */}
        <text x={20} y={25} fontSize="10" fill="var(--text-muted)">captured packets:</text>
        <rect x={20} y={32} width={W - 40} height={20} fill="var(--bg-inset)" stroke="var(--line)" rx="2" />
        <rect x={20} y={32} width={Math.min(1, packets / PACKETS_TO_CRACK) * (W - 40)} height={20}
          fill={cracked ? "oklch(0.65 0.18 22)" : "oklch(0.7 0.15 145)"} opacity="0.7" rx="2" />
        <text x={W / 2} y={47} textAnchor="middle" fontSize="10" fontFamily="ui-monospace, monospace" fill="var(--text)">
          {packets.toLocaleString()} / {PACKETS_TO_CRACK.toLocaleString()} ({weakIvs.toLocaleString()} weak IVs)
        </text>

        {/* Key bytes display */}
        <text x={20} y={80} fontSize="11" fontWeight="600" fill="var(--text)">WEP key (104-bit, 13 bytes):</text>
        {keyBytes.map((b, i) => (
          <g key={i}>
            <rect x={20 + i * 42} y={90} width={36} height={36} rx="3"
              fill={b.recovered ? "oklch(0.65 0.18 22 / 0.85)" : `oklch(0.7 0.15 145 / ${b.confidence * 0.5})`}
              stroke={b.recovered ? "oklch(0.65 0.18 22)" : "var(--line)"} strokeWidth={b.recovered ? 1.5 : 0.8} />
            <text x={38 + i * 42} y={113} textAnchor="middle" fontSize="11"
              fontFamily="ui-monospace, monospace" fontWeight="700"
              fill={b.recovered ? "white" : "var(--text-faint)"}>
              {b.recovered ? "0x" + ((i * 17 + 23) & 0xff).toString(16).padStart(2, "0") : "??"}
            </text>
            <text x={38 + i * 42} y={138} textAnchor="middle" fontSize="8" fill="var(--text-muted)">{i}</text>
          </g>
        ))}

        {/* status */}
        <rect x={20} y={160} width={W - 40} height={66} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={W / 2} y={183} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={cracked ? "oklch(0.65 0.18 22)" : "var(--text)"}>
          {cracked ? "⚠ KEY RECOVERED" : `${recoveredCount}/${KEY_LEN} bytes recovered`}
        </text>
        <text x={W / 2} y={203} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">
          {cracked ? "WEP completely broken — minutes wall-clock" :
           "FMS/PTW: certain IV patterns leak key bytes statisticky"}
        </text>
        <text x={W / 2} y={218} textAnchor="middle" fontSize="9" fill="var(--text-faint)">
          IV = 24-bit ⇒ 16.7 M values, reused after few hours; CRC-32 nestačí jako MAC
        </text>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        WEP fundamental flaws: <b>24-bit IV</b> (reuse), <b>RC4 weak keys</b> (FMS, PTW), <b>CRC-32 ≠ MAC</b>.
        Patches nemožné — replaced by WPA (TKIP interim), WPA2 (AES-CCMP), WPA3 (SAE).
      </div>
    </div>
  );
}

function btn(active) {
  return { background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", border: "1px solid var(--line)", padding: "3px 9px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
