// wpa2-handshake-krack — Step through WPA2 4-way handshake. Enable
// "replay Msg3" → client reinstalls PTK → nonce reset → keystream reuse.
import { useState } from "react";

const STEPS = [
  { id: "m1", text: "Msg 1 — AP → Client", detail: "ANonce" },
  { id: "m2", text: "Msg 2 — Client → AP", detail: "SNonce + MIC (PTK = KDF(PMK, ANonce, SNonce, MAC_AP, MAC_C))" },
  { id: "m3", text: "Msg 3 — AP → Client", detail: "GTK encrypted + MIC; klient install PTK, nonce → 1" },
  { id: "m4", text: "Msg 4 — Client → AP", detail: "ACK, ready for data" },
  { id: "data", text: "DATA — encrypted with PTK + nonce", detail: "nonce inkrementuje per packet" },
];

export default function Wpa2HandshakeKrack() {
  const [step, setStep] = useState(0);
  const [replay, setReplay] = useState(false);
  const [packetCount, setPacketCount] = useState(0);
  const [nonceReset, setNonceReset] = useState(0);

  const installed = step >= 3;
  const dataPhase = step >= 5;

  function sendData() {
    setPacketCount(c => c + 1);
  }

  function doReplay() {
    setNonceReset(r => r + 1);
    setPacketCount(0);
  }

  const W = 580, H = 250;

  // Compute keystream reuse: each "session" (between resets) uses nonces 1, 2, 3...
  // If we reset (replay msg3), nonce starts at 1 again → keystream reused.
  const reuse = nonceReset > 0;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap", alignItems: "center", fontSize: 11 }}>
        <button onClick={() => setStep(Math.min(STEPS.length, step + 1))} style={btn(false)}>▶ next step</button>
        <button onClick={() => { setStep(0); setReplay(false); setPacketCount(0); setNonceReset(0); }} style={btn(false)}>reset</button>
        <button onClick={sendData} disabled={!dataPhase} style={{ ...btn(false), opacity: dataPhase ? 1 : 0.4 }}>send data packet</button>
        <button onClick={doReplay} disabled={step < 3} style={{ ...btn(replay), opacity: step >= 3 ? 1 : 0.4 }}>⚠ KRACK: replay Msg 3</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        <text x={50} y={25} textAnchor="middle" fontSize="11" fontWeight="700" fill="oklch(0.65 0.16 245)">Client</text>
        <text x={W - 50} y={25} textAnchor="middle" fontSize="11" fontWeight="700" fill="oklch(0.7 0.15 30)">AP</text>
        <line x1={50} y1={32} x2={50} y2={150} stroke="var(--line-strong)" strokeWidth="2" />
        <line x1={W - 50} y1={32} x2={W - 50} y2={150} stroke="var(--line-strong)" strokeWidth="2" />

        {STEPS.slice(0, 4).map((s, i) => {
          const y = 50 + i * 22;
          const done = step > i;
          const dirRight = s.id === "m2" || s.id === "m4";
          return (
            <g key={s.id} opacity={done ? 1 : 0.25}>
              <line x1={dirRight ? 50 : W - 50} y1={y} x2={dirRight ? W - 50 : 50} y2={y}
                stroke={done ? "var(--accent)" : "var(--line)"} strokeWidth="1.5"
                markerEnd={dirRight ? "url(#wk-arR)" : "url(#wk-arL)"} />
              <text x={W / 2} y={y - 3} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text)">{s.text}</text>
              <text x={W / 2} y={y + 9} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{s.detail}</text>
            </g>
          );
        })}
        <defs>
          <marker id="wk-arR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L5,3 L0,6 z" fill="var(--accent)" /></marker>
          <marker id="wk-arL" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L5,3 L0,6 z" fill="var(--accent)" /></marker>
        </defs>

        {/* state panel */}
        <g fontFamily="ui-monospace, monospace" fontSize="10">
          <text x={20} y={170} fontWeight="600" fill="var(--text)" fontFamily="ui-sans-serif, system-ui">Client state:</text>
          <text x={20} y={185} fill={installed ? "var(--text)" : "var(--text-faint)"}>PTK = {installed ? "[installed]" : "—"}</text>
          <text x={20} y={199} fill={installed ? "var(--text)" : "var(--text-faint)"}>nonce counter = {dataPhase ? packetCount : 0}</text>
          <text x={20} y={213} fill="var(--text-muted)">replay events: {nonceReset}</text>
        </g>
        <g fontFamily="ui-monospace, monospace" fontSize="10">
          <text x={300} y={170} fontWeight="600" fill="var(--text)" fontFamily="ui-sans-serif, system-ui">Keystream:</text>
          {dataPhase && Array.from({ length: Math.min(packetCount + (reuse ? 3 : 0), 6) }).map((_, i) => {
            const reused = reuse && i < 3;
            return (
              <rect key={i} x={300 + i * 22} y={178} width="18" height="18"
                fill={reused ? "oklch(0.65 0.18 22 / 0.6)" : "oklch(0.7 0.15 145 / 0.5)"}
                stroke={reused ? "oklch(0.65 0.18 22)" : "oklch(0.7 0.15 145)"} />
            );
          })}
          <text x={300} y={213} fill={reuse ? "oklch(0.65 0.18 22)" : "var(--text-muted)"}>
            {reuse ? "⚠ keystream reuse → decrypt!" : "(unique per packet ✓)"}
          </text>
        </g>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        KRACK (Vanhoef 2017): attacker replays <b>Msg 3</b> → klient reinstaluje *stejný* PTK → nonce counter reset → stejný keystream pro nové pakety.
        XOR dvou ciphertextů zruší keystream → leak plaintext. Patch flushuje state, brání reinstalu.
      </div>
    </div>
  );
}

function btn(active) {
  return { background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", border: "1px solid var(--line)", padding: "3px 9px", borderRadius: 3, fontSize: 11, cursor: "pointer" };
}
