// BLE Legacy Pairing brute-force (Crackle, Mike Ryan 2013).
// 6-mistny PIN je TK; brute-force 10^6 v sekundach.
import { useEffect, useRef, useState } from "react";

export default function BleCrackle() {
  const [mode, setMode] = useState("legacy"); // legacy | sc
  const [secretPin, setSecretPin] = useState(285743);
  const [attacking, setAttacking] = useState(false);
  const [tried, setTried] = useState(0);
  const [foundPin, setFoundPin] = useState(null);
  const [snifferLog, setSnifferLog] = useState([]);
  const startRef = useRef(0);

  function captureHandshake() {
    setSnifferLog([
      "[t=0] central → peripheral: Pairing Request (Just Works / Passkey Entry)",
      "[t=12 ms] peripheral → central: Pairing Response",
      "[t=24 ms] central → peripheral: Mconfirm = c1(TK, Mrand, ...)",
      "[t=36 ms] peripheral → central: Sconfirm = c1(TK, Srand, ...)",
      "[t=48 ms] central → peripheral: Mrand",
      "[t=60 ms] peripheral → central: Srand",
      "[t=72 ms] encryption start (LTK = s1(TK, Mrand, Srand))",
    ]);
  }

  useEffect(() => {
    if (!attacking) return;
    if (mode === "sc") {
      // Secure Connections: ECDH brute force impractical
      const id = setTimeout(() => {
        setAttacking(false);
        setSnifferLog((l) => [...l, "↳ ECDH P-256: brute force ~2^128 — neproveditelne na zadnem HW."]);
      }, 800);
      return () => clearTimeout(id);
    }
    // legacy: simulate try ~50000 PINs per render tick
    const id = setTimeout(() => {
      const next = tried + 50000;
      if (next >= 1_000_000 || next > secretPin) {
        // we "guessed" the secret PIN
        setFoundPin(secretPin);
        setAttacking(false);
      }
      setTried(Math.min(next, 1_000_000));
    }, 60);
    return () => clearTimeout(id);
  });

  function startAttack() {
    setAttacking(true);
    setTried(0);
    setFoundPin(null);
    startRef.current = Date.now();
  }

  function reset() {
    setAttacking(false);
    setTried(0);
    setFoundPin(null);
    setSnifferLog([]);
  }

  const progress = Math.min(100, (tried / 1_000_000) * 100);

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>BLE pairing mod:</label>
        <select value={mode} onChange={(e) => { setMode(e.target.value); reset(); }} style={{ ...sel, minWidth: 200 }}>
          <option value="legacy">Legacy (BLE 4.0–4.1, 6-digit Passkey)</option>
          <option value="sc">LE Secure Connections (4.2+, ECDH P-256)</option>
        </select>
      </div>

      <div style={row}>
        <label style={lbl}>tajny PIN:</label>
        <input type="number" min={0} max={999999} value={secretPin} onChange={(e) => setSecretPin(Math.max(0, Math.min(999999, +e.target.value || 0)))}
          style={{ ...sel, width: 120, fontFamily: "var(--font-mono)" }} />
        <button style={btn} onClick={() => setSecretPin(Math.floor(Math.random() * 1000000))}>nahodne</button>
        <button style={btn} onClick={captureHandshake}>capture handshake</button>
        <button style={btn} onClick={startAttack} disabled={attacking || snifferLog.length === 0}>spust crackle</button>
        <button style={btn} onClick={reset}>reset</button>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 10, minHeight: 100 }}>
        {snifferLog.length === 0 ? (
          <div style={{ color: "var(--text-muted)" }}>(sniffer prazdny — klikni "capture handshake" pro odposlech pairing)</div>
        ) : snifferLog.map((l, i) => (
          <div key={i} style={{ color: i < 6 ? "var(--accent)" : "#e07a5f", padding: "1px 0" }}>{l}</div>
        ))}
      </div>

      <div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
          brute-force PIN: {tried.toLocaleString()} / 1 000 000 ({progress.toFixed(1)}%)
        </div>
        <div style={{ background: "var(--bg-inset)", height: 10, borderRadius: 5, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: foundPin !== null ? "#e07a5f" : "var(--accent)", transition: "width 50ms" }} />
        </div>
      </div>

      {foundPin !== null && (
        <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, borderLeft: "3px solid #e07a5f", fontSize: 12 }}>
          <div style={{ color: "#e07a5f", fontWeight: 600 }}>✓ PIN obnoven: {String(foundPin).padStart(6, "0")}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
            TK = {String(foundPin).padStart(6, "0").split("").map(c => c).join("")} jako 16-byte little-endian. LTK = s1(TK, Mrand, Srand) → dešifruje veškerou nasledny encrypted komunikaci.
          </div>
        </div>
      )}

      {mode === "sc" && (
        <div style={{ fontSize: 11, color: "#81b29a", fontStyle: "italic" }}>
          LE Secure Connections: ECDH P-256 key exchange, soukromy klic na strane peripheral. Pasivni odposlech
          handshake neumozni recovery sdileneho LTK; vyžaduje 2^128 operations.
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        BLE 4.0–4.1 Legacy Pairing: TK je 6-digit PIN (10^6 ≈ 2^20). Crackle brute-forcuje za sekundy.
        BLE 4.2+ Secure Connections: ECDH P-256 — pasivni utok nemozny. Aktivni MITM lze stale resit cez Numeric Comparison nebo OOB.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
