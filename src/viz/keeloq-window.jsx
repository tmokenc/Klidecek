// KeeLoq rolling-code window: transmitter counter, receiver last + window.
// Replay / out-of-window scenare.
import { useState } from "react";

const SHORT_WIN = 16;
const WIDE_WIN = 32768;

export default function KeeloqWindow() {
  const [txCounter, setTxCounter] = useState(100);
  const [rxLast, setRxLast] = useState(100);
  const [winMode, setWinMode] = useState("short");
  const [log, setLog] = useState([{ msg: "init: tx=100, rx_last=100" }]);
  const [captured, setCaptured] = useState(null);

  const win = winMode === "short" ? SHORT_WIN : WIDE_WIN;

  function press() {
    const newC = txCounter + 1;
    setTxCounter(newC);
    // Check at receiver
    if (newC > rxLast && newC <= rxLast + win) {
      setRxLast(newC);
      setLog((l) => [...l, { type: "ok", msg: `stisk: tx=${newC} → rx prijal, rx_last=${rxLast}→${newC}` }]);
    } else {
      setLog((l) => [...l, { type: "fail", msg: `stisk: tx=${newC} → rx zahodi (mimo okno [${rxLast + 1}, ${rxLast + win}])` }]);
    }
  }

  function capturePkt() {
    setCaptured({ counter: txCounter });
    setLog((l) => [...l, { msg: `utocnik zachytil paket counter=${txCounter}` }]);
  }

  function replay() {
    if (!captured) return;
    if (captured.counter > rxLast && captured.counter <= rxLast + win) {
      setRxLast(captured.counter);
      setLog((l) => [...l, { type: "fail", msg: `replay counter=${captured.counter}: ✓ akceptován (utok uspesny!)` }]);
    } else {
      setLog((l) => [...l, { type: "ok", msg: `replay counter=${captured.counter}: ✗ mimo okno (rx_last=${rxLast})` }]);
    }
  }

  function pressWithoutReceiver() {
    // simulate: user presses button outside receiver range; counter advances at TX
    const newC = txCounter + 1;
    setTxCounter(newC);
    setLog((l) => [...l, { msg: `stisk mimo dosah: tx=${newC} (rx nevidi)` }]);
  }

  function reset() {
    setTxCounter(100); setRxLast(100); setCaptured(null);
    setLog([{ msg: "reset" }]);
  }

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>akceptacni okno:</label>
        <select value={winMode} onChange={(e) => setWinMode(e.target.value)} style={sel}>
          <option value="short">short ({SHORT_WIN}; typicke pro autoklíče)</option>
          <option value="wide">wide ({WIDE_WIN}; pro ztracene stisknuti mimo dosah)</option>
        </select>
        <button style={btn} onClick={reset}>reset</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={panel}>
          <div style={{ fontWeight: 600, color: "var(--accent)" }}>Ovládač (transmitter)</div>
          <div style={mono}>counter = <b>{txCounter}</b></div>
        </div>
        <div style={panel}>
          <div style={{ fontWeight: 600, color: "#81b29a" }}>Přijímač (receiver)</div>
          <div style={mono}>last_accepted = <b>{rxLast}</b></div>
          <div style={{ ...mono, fontSize: 10, color: "var(--text-muted)" }}>okno [{rxLast + 1}, {rxLast + win}]</div>
        </div>
      </div>

      <div style={row}>
        <button style={btn} onClick={press}>stisk tlacitka (v dosahu auta)</button>
        <button style={btn} onClick={pressWithoutReceiver}>stisk MIMO dosah</button>
        <button style={btn} onClick={capturePkt}>utocnik: capture aktualni paket</button>
        <button style={btn} onClick={replay} disabled={!captured}>utocnik: replay</button>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11, maxHeight: 180, overflowY: "auto" }}>
        {log.map((l, i) => (
          <div key={i} style={{ color: l.type === "ok" ? "#81b29a" : l.type === "fail" ? "#e07a5f" : "var(--text-muted)", padding: "1px 0" }}>
            [{i + 1}] {l.msg}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Rolling code chrani proti opakovaní stejneho paketu, ne proti relay útoku (paket se přenese přes GSM tunel z domácí klíčenky k autu).
        Wide window dovoluje resynchronizaci po stiscich mimo dosah, ale dela vetsi okno pro replay attacks.
        Tesla Phone-as-Key, BMW iX a pod. resi UWB ranging proti relay.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const panel = { background: "var(--bg-inset)", padding: 8, borderRadius: 6 };
const mono = { fontFamily: "var(--font-mono)", fontSize: 12, marginTop: 4 };
