// APDU builder / stepper s pre-canned card OS. Ukazuje SW1/SW2 leak v
// '63 CX' (zbyvajici tries) a sekvenci SELECT → VERIFY → READ BINARY.
import { useState } from "react";

const COMMANDS = [
  { id: "select_aid", label: "SELECT AID (VISA)", apdu: "00 A4 04 00 07 A0 00 00 00 03 10 10" },
  { id: "verify_pin_ok", label: "VERIFY PIN 1234", apdu: "00 20 00 80 08 24 12 34 FF FF FF FF FF" },
  { id: "verify_pin_bad", label: "VERIFY PIN 9999", apdu: "00 20 00 80 08 24 99 99 FF FF FF FF FF" },
  { id: "read_binary", label: "READ BINARY", apdu: "00 B0 00 00 10" },
  { id: "internal_auth", label: "INTERNAL AUTHENTICATE", apdu: "00 88 00 00 08 11 22 33 44 55 66 77 88" },
  { id: "get_response", label: "GET RESPONSE", apdu: "00 C0 00 00 10" },
  { id: "select_invalid", label: "SELECT AID neexistujici", apdu: "00 A4 04 00 07 FF FF FF FF FF FF FF" },
  { id: "wrong_ins", label: "neznama instrukce", apdu: "00 F1 00 00 00" },
];

const PIN_CORRECT = "1234";
const FILE_DATA = "DEADBEEFCAFE12340102030405060708";

function simulateCard(state, cmdId) {
  const next = { ...state };
  let response = "";
  let sw = "6F 00"; // unknown error
  let note = "";

  switch (cmdId) {
    case "select_aid":
      next.selected = "VISA";
      response = "6F 30 84 07 A0 00 00 00 03 10 10 ...";
      sw = "90 00";
      note = "Karta vraci FCI (File Control Information) + uspech.";
      break;
    case "select_invalid":
      sw = "6A 82";
      note = "File not found — leak: utocnik vi, ze AID neexistuje.";
      break;
    case "verify_pin_ok":
      if (next.tries <= 0) {
        sw = "69 83";
        note = "Karta zablokovana (zustalo 0 tries).";
      } else if (PIN_CORRECT === "1234") {
        next.pinOK = true;
        sw = "90 00";
        note = "PIN spravny. PIN tries reset na 3.";
        next.tries = 3;
      } else {
        next.tries--;
        sw = `63 C${next.tries}`;
        note = "PIN spatny — SW vraci zbyvajici tries (LEAK).";
      }
      break;
    case "verify_pin_bad":
      next.tries = Math.max(0, next.tries - 1);
      sw = `63 C${next.tries}`;
      note = "PIN spatny — SW1/SW2 = 63 CX leakuje zbyvajici tries.";
      break;
    case "read_binary":
      if (!next.selected) { sw = "6A 82"; note = "Zadny soubor neni vybran."; break; }
      if (!next.pinOK) { sw = "69 82"; note = "Security status not satisfied — PIN nebyl overen."; break; }
      response = FILE_DATA;
      sw = "90 00";
      note = "Data vracena.";
      break;
    case "internal_auth":
      if (!next.selected) { sw = "6A 82"; note = "Zadny soubor."; break; }
      response = "88 22 11 5C 33 91 47 DE";
      sw = "90 00";
      note = "Card-side challenge-response signature.";
      break;
    case "get_response":
      response = "(pripravena response z predchozi 61 XX...)";
      sw = "90 00";
      note = "Pouzije se po '61 XX' z karty (T=0 protokol).";
      break;
    case "wrong_ins":
      sw = "6D 00";
      note = "Instruction not supported. Leakuje, ze INS=F1 neni podporovana.";
      break;
  }
  return { next, response, sw, note };
}

const initialState = { selected: null, pinOK: false, tries: 3 };

export default function ApduBuilder() {
  const [state, setState] = useState(initialState);
  const [history, setHistory] = useState([]);

  function send(cmdId) {
    const cmd = COMMANDS.find((c) => c.id === cmdId);
    const { next, response, sw, note } = simulateCard(state, cmdId);
    setState(next);
    setHistory((h) => [...h, { cmd, response, sw, note, snapshot: { ...next } }]);
  }

  function reset() {
    setState(initialState);
    setHistory([]);
  }

  return (
    <div style={ctn}>
      <div className="viz-controls">
        <span className="viz-readout">stav karty:</span>
        <span className="viz-readout" style={{ color: state.selected ? "#81b29a" : "var(--text-muted)" }}>selected={state.selected || "—"}</span>
        <span className="viz-readout" style={{ color: state.pinOK ? "#81b29a" : "var(--text-muted)" }}>pinOK={state.pinOK ? "ano" : "ne"}</span>
        <span className="viz-readout" style={{ color: state.tries === 0 ? "#e07a5f" : "var(--text-muted)" }}>tries={state.tries}</span>
        <button className="viz-btn" onClick={reset}>reset karty</button>
      </div>

      <div>
        <div style={lbl}>vyber prikaz a posli na kartu:</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 4, marginTop: 4 }}>
          {COMMANDS.map((c) => (
            // .viz-btn is nowrap inline-flex; override to a wrapping column so the long APDU
            // hex stacks under the label and breaks instead of overflowing the button.
            <button key={c.id} className="viz-btn" onClick={() => send(c.id)}
              style={{ textAlign: "left", padding: 6, flexDirection: "column", alignItems: "flex-start", gap: 2, whiteSpace: "normal" }}>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{c.label}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--text-muted)", wordBreak: "break-word" }}>{c.apdu}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 8, borderRadius: 6, maxHeight: 240, overflowY: "auto" }}>
        {history.length === 0 ? (
          <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", padding: 16 }}>(historie prazdna — klikni vyse na prikaz)</div>
        ) : (
          history.map((h, i) => (
            <div key={i} style={{ padding: "6px 0", borderBottom: i < history.length - 1 ? "1px dashed var(--line)" : "none" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)" }}>&gt; {h.cmd.apdu}</div>
              {h.response && <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}>&lt; {h.response}</div>}
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, marginTop: 2 }}>
                SW = <b style={{ color: h.sw.startsWith("90") ? "#81b29a" : h.sw.startsWith("63") ? "#e07a5f" : "var(--accent)" }}>{h.sw}</b>
                <span style={{ color: "var(--text-muted)", marginLeft: 8, fontFamily: "inherit", fontSize: 11 }}>{h.note}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Tip: posli SELECT → VERIFY 9999 (3×) → karta vrati 63 C2, 63 C1, 63 C0 (leak tries → utocnik vi, kolik pokusu zbyva).
        READ BINARY bez VERIFY → 69 82 (security status not satisfied).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
