// LoRaWAN FCnt replay / rollover / ABP reset utoky.
import { useState } from "react";

const WINDOW = 32768; // 16-bit FCnt rollover threshold
const MAX_FCNT = 65535;

export default function LorawanCounter() {
  const [mode, setMode] = useState("ABP");
  const [edFcnt, setEdFcnt] = useState(5);
  const [nsLast, setNsLast] = useState(5);
  const [log, setLog] = useState([
    { type: "info", msg: "ED inicializovano s FCnt=5; NS ma last_accepted=5." },
  ]);
  const [capturedPkt, setCapturedPkt] = useState(null);

  function sendUplink() {
    const newFcnt = edFcnt + 1;
    const pkt = { fcnt: newFcnt, payload: `data_${newFcnt}` };
    setEdFcnt(newFcnt);
    // NS check
    if (newFcnt > nsLast && newFcnt < nsLast + WINDOW) {
      setNsLast(newFcnt);
      setLog((l) => [...l, { type: "ok", msg: `ED → NS: FCnt=${newFcnt} ✓ akceptováno (last_accepted ${nsLast} → ${newFcnt})` }]);
    } else if (newFcnt > MAX_FCNT) {
      setEdFcnt(0); // rollover
      setLog((l) => [...l, { type: "warn", msg: `ED → NS: FCnt prekrocil 16-bit max → ED se vrati na 0` }]);
    } else {
      setLog((l) => [...l, { type: "fail", msg: `ED → NS: FCnt=${newFcnt} ✗ NS zahodi (mimo okno)` }]);
    }
  }

  function abpReset() {
    if (mode !== "ABP") return;
    setEdFcnt(0);
    setLog((l) => [...l, { type: "warn", msg: "ABP zarizeni vypnuto + zapnuto → FCnt resetovano na 0 (NS ma stale last_accepted)." }]);
  }

  function capturePkt() {
    const pkt = { fcnt: edFcnt, payload: `data_${edFcnt}` };
    setCapturedPkt(pkt);
    setLog((l) => [...l, { type: "info", msg: `útočník zachytil packet FCnt=${edFcnt}.` }]);
  }

  function replay() {
    if (!capturedPkt) return;
    const pkt = capturedPkt;
    if (pkt.fcnt > nsLast && pkt.fcnt < nsLast + WINDOW) {
      setNsLast(pkt.fcnt);
      setLog((l) => [...l, { type: "fail", msg: `replay FCnt=${pkt.fcnt}: ✓ akceptován! (utocnik se vydaval za ED, NS nemůže odlišit)` }]);
    } else {
      setLog((l) => [...l, { type: "ok", msg: `replay FCnt=${pkt.fcnt}: ✗ NS zahodi (FCnt ≤ last_accepted=${nsLast})` }]);
    }
  }

  function forceRollover() {
    setEdFcnt(MAX_FCNT);
    setLog((l) => [...l, { type: "warn", msg: `simulace: FCnt nastaveno tesne pred rollover (${MAX_FCNT}).` }]);
  }

  function nsReset() {
    setNsLast(0);
    setLog((l) => [...l, { type: "warn", msg: "NS resetovan (ABP rejoin) → vsechny stare packety lze replayovat." }]);
  }

  function reset() {
    setEdFcnt(5); setNsLast(5); setLog([{ type: "info", msg: "Reset." }]); setCapturedPkt(null);
  }

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>aktivace:</label>
        <select value={mode} onChange={(e) => setMode(e.target.value)} style={sel}>
          <option value="ABP">ABP (staticke klice + reset on reboot)</option>
          <option value="OTAA">OTAA (dynamicke session keys)</option>
        </select>
        <button style={btn} onClick={reset}>reset vse</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={panel}>
          <div style={{ fontWeight: 600, color: "#81b29a" }}>End-Device</div>
          <div style={mono}>FCnt = <b>{edFcnt}</b></div>
        </div>
        <div style={panel}>
          <div style={{ fontWeight: 600, color: "var(--accent)" }}>Network Server</div>
          <div style={mono}>last_accepted = <b>{nsLast}</b></div>
          <div style={{ ...mono, fontSize: 10, color: "var(--text-muted)" }}>okno: [{nsLast + 1}, {nsLast + WINDOW}]</div>
        </div>
      </div>

      <div style={row}>
        <button style={btn} onClick={sendUplink}>ED uplink (FCnt++)</button>
        <button style={btn} onClick={capturePkt}>utocnik: capture posledni packet</button>
        <button style={btn} onClick={replay} disabled={!capturedPkt}>replay</button>
        <button style={btn} onClick={abpReset} disabled={mode !== "ABP"}>ABP reset (vyjmi baterii)</button>
        <button style={btn} onClick={forceRollover}>nastav FCnt = max</button>
        <button style={btn} onClick={nsReset}>NS reset (rejoin)</button>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, maxHeight: 200, overflowY: "auto", fontFamily: "var(--font-mono)", fontSize: 11 }}>
        {log.map((l, i) => (
          <div key={i} style={{ color: l.type === "ok" ? "#81b29a" : l.type === "fail" ? "#e07a5f" : l.type === "warn" ? "var(--accent)" : "var(--text-muted)", padding: "1px 0" }}>
            [{i + 1}] {l.msg}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        ABP zranitelnosti: reset baterie → ED FCnt=0 ale NS ma stary; bud DoS (zahozene packety) nebo replay
        po koordinovanem reset (NS rejoin). OTAA s 1.1+ resi pres JoinNonce + DevNonce + rejoin procedure;
        po rollover automaticky rekey.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const panel = { background: "var(--bg-inset)", padding: 8, borderRadius: 6, fontSize: 12 };
const mono = { fontFamily: "var(--font-mono)", fontSize: 11, marginTop: 4 };
