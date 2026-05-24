// Tamper response state machine: senzory teplota/napeti/freq/svetlo/mesh
// → alarm → zeroization → locked. FIPS 140-3 Level 3 vs. Level 4.
import { useEffect, useState } from "react";

const SENSORS = [
  { id: "temp", label: "teplota", range: "−25..+85 °C", lvl4Only: false },
  { id: "volt", label: "napeti", range: "3.0 V ±10 %", lvl4Only: false },
  { id: "freq", label: "freq", range: "1–5 MHz", lvl4Only: false },
  { id: "light", label: "svetlo", range: "back-side photo", lvl4Only: false },
  { id: "mesh", label: "mesh", range: "drátěná síť", lvl4Only: false },
  { id: "em", label: "EM", range: "anomalie impedance", lvl4Only: true },
  { id: "cold", label: "tek. dusik", range: "ext. cold-boot", lvl4Only: true },
];

export default function TamperResponse() {
  const [level, setLevel] = useState(4);
  const [phase, setPhase] = useState("normal"); // normal | alarm | zeroizing | locked
  const [triggered, setTriggered] = useState(null);
  const [keys, setKeys] = useState({
    master_key: "0xa5b7c3...",
    rsa_d: "0x3F9C2D...",
    session: "0x88E1...",
    counter: "42",
  });

  function trigger(sensor) {
    if (phase !== "normal") return;
    // Level 4 detekuje vsechno; Level 3 jen "standardní" senzory
    if (level < 4 && SENSORS.find((s) => s.id === sensor)?.lvl4Only) {
      // alarm not raised on Level 3
      setTriggered({ sensor, undetected: true });
      return;
    }
    setTriggered({ sensor, undetected: false });
    setPhase("alarm");
  }

  useEffect(() => {
    if (phase === "alarm") {
      const id = setTimeout(() => setPhase("zeroizing"), 600);
      return () => clearTimeout(id);
    }
    if (phase === "zeroizing") {
      const id = setTimeout(() => {
        setKeys({
          master_key: "0x00000000...",
          rsa_d: "0x00000000...",
          session: "0x0000...",
          counter: "0",
        });
        setPhase("locked");
      }, 800);
      return () => clearTimeout(id);
    }
  }, [phase]);

  function reset() {
    setPhase("normal");
    setTriggered(null);
    setKeys({
      master_key: "0xa5b7c3...",
      rsa_d: "0x3F9C2D...",
      session: "0x88E1...",
      counter: "42",
    });
  }

  const phaseColor = { normal: "#81b29a", alarm: "#e07a5f", zeroizing: "var(--accent)", locked: "var(--text-muted)" }[phase];
  const phaseLabel = { normal: "NORMAL", alarm: "⚠ ALARM", zeroizing: "↺ ZEROIZATION", locked: "🔒 LOCKED" }[phase];

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>FIPS 140-3 Level:</label>
        <select value={level} onChange={(e) => { setLevel(+e.target.value); reset(); }} style={sel}>
          <option value={3}>3 (tamper detection + zeroization)</option>
          <option value={4}>4 (vsechny env. utoky)</option>
        </select>
        <button style={btn} onClick={reset}>reset modul</button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", padding: "8px 12px", background: "var(--bg-inset)", borderRadius: 6, fontFamily: "var(--font-mono)", color: phaseColor, fontWeight: 700, fontSize: 14 }}>
        stav: {phaseLabel}
      </div>

      <div>
        <div style={lbl}>Senzory (klikni pro spusteni alarmu):</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 4, marginTop: 4 }}>
          {SENSORS.map((s) => {
            const isLvl4 = s.lvl4Only;
            const available = level === 4 || !isLvl4;
            const isTriggered = triggered?.sensor === s.id;
            const undetected = isTriggered && triggered?.undetected;
            return (
              <button key={s.id}
                onClick={() => trigger(s.id)}
                disabled={phase !== "normal"}
                style={{
                  padding: 8, borderRadius: 5, border: `1px solid ${available ? "var(--line)" : "#e07a5f"}`,
                  background: undetected ? "#e07a5f" : isTriggered ? "var(--accent)" : "var(--bg-inset)",
                  color: undetected ? "var(--bg-inset)" : "var(--text)",
                  cursor: phase === "normal" ? "pointer" : "not-allowed",
                  fontSize: 11, textAlign: "left", opacity: available ? 1 : 0.55,
                }}>
                <div style={{ fontWeight: 600 }}>{s.label}{isLvl4 ? " *" : ""}</div>
                <div style={{ color: undetected ? "var(--bg-inset)" : "var(--text-muted)", fontSize: 10 }}>{s.range}</div>
              </button>
            );
          })}
        </div>
        {level === 3 && (
          <div style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4 }}>* dostupne pouze Level 4 — na Level 3 utok zustane nedetekovan.</div>
        )}
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={lbl}>Citliva data v modulu (CSP — Critical Security Parameters):</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, marginTop: 4 }}>
          {Object.entries(keys).map(([k, v]) => (
            <div key={k} style={{ padding: "2px 0", color: phase === "locked" ? "#e07a5f" : "var(--text)" }}>
              <span style={{ minWidth: 100, display: "inline-block", color: "var(--text-muted)" }}>{k}:</span>
              <span style={phase === "zeroizing" ? { textDecoration: "line-through", opacity: 0.5 } : {}}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {triggered?.undetected && (
        <div style={{ background: "var(--bg-inset)", padding: 8, borderRadius: 6, borderLeft: "3px solid #e07a5f", fontSize: 11, color: "var(--text-muted)" }}>
          <b style={{ color: "#e07a5f" }}>Level 3 nedetekuje:</b> útok přes <b>{SENSORS.find(s => s.id === triggered.sensor).label}</b> projde, klíče zůstávají v plaintextu.
          Pro odolnost proti všem identifikovaným útokům je třeba <b>Level 4</b>.
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Tamper response: alarm → zeroization (active overwrite, ne jen power off — SRAM ma retention) → permanent lock fuse.
        FIPS 140-3 Level 4 vyzaduje aktivni reakci na <b>vsechny</b> identifikovane utoky vc. extremnich teplot (tekuty dusik pro cold-boot).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
