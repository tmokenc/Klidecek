// Bond-Zielinski decimalization table attack — IBM 3624 PIN management.
// Utocnik moze pridat DT jako parametr a z 10 dotazu odhalit, ktere digity PIN obsahuje.
import { useMemo, useState } from "react";

const STANDARD_DT = "0123456789012345"; // 0..9 same, A..F → 0..5
const HEX_CHARS = "0123456789ABCDEF";

// Fixed pretend output from DES(PDK, PAN) — first 4 hex nibbles only matter
const HEX_PRESETS = [
  { name: "DES output A5F3..", hex: "A5F3" },
  { name: "DES output 7028..", hex: "7028" },
  { name: "DES output BBBB..", hex: "BBBB" },
  { name: "DES output 1234..", hex: "1234" },
];

function applyDT(hex, dt) {
  return hex.split("").map((h) => dt[parseInt(h, 16)]).join("");
}

export default function DecimalizationAttack() {
  const [hexIdx, setHexIdx] = useState(0);
  const hex = HEX_PRESETS[hexIdx].hex;
  const [dt, setDt] = useState(STANDARD_DT);

  const generatedPin = applyDT(hex, dt);
  const realPin = applyDT(hex, STANDARD_DT);

  // Diagnostic: which digits does standard PIN contain
  const realDigits = useMemo(() => {
    const set = new Set(realPin.split(""));
    return Array.from(set).sort();
  }, [realPin]);

  // For each Dᵢ table (DT[i] = "1" if hex==i else "0"), report PIN
  const diagnostics = useMemo(() => {
    const out = [];
    for (let i = 0; i < 10; i++) {
      const di = STANDARD_DT.split("").map((c, j) => (HEX_CHARS[j].toLowerCase() === STANDARD_DT[j] && parseInt(c, 10) === i) ? "1" : "0").join("");
      const pin = applyDT(hex, di);
      out.push({ i, di, pin, contains: pin !== "0000" });
    }
    return out;
  }, [hex]);

  function setBoxToStandard() { setDt(STANDARD_DT); }
  function setZeroDt() { setDt("0".repeat(16)); }
  function setDi(digit) {
    // D_digit: DT[j] = "1" if STANDARD_DT[j] == digit (after standard decimalization)
    let d = "";
    for (let j = 0; j < 16; j++) d += (STANDARD_DT[j] === String(digit) ? "1" : "0");
    setDt(d);
  }

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>DES(PDK, PAN) [prvni 4 hex]:</label>
        <select value={hexIdx} onChange={(e) => setHexIdx(+e.target.value)} style={{ ...sel, minWidth: 180 }}>
          {HEX_PRESETS.map((p, i) => <option key={i} value={i}>{p.name} → {p.hex}</option>)}
        </select>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <div>hex = <b style={{ color: "var(--accent)" }}>{hex}</b></div>
        <div style={{ marginTop: 4 }}>realny PIN zakaznika (standard DT) = <b style={{ color: "#81b29a" }}>{realPin}</b> &nbsp;
          digity: <span style={{ color: "var(--text-muted)" }}>{`{${realDigits.join(", ")}}`}</span>
        </div>
      </div>

      <div>
        <div style={lbl}>Decimalizační tabulka (16 hodnot pro hex 0..F):</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(16, 1fr)", gap: 2, marginTop: 4 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{HEX_CHARS[i]}</div>
              <input
                value={dt[i]}
                onChange={(e) => {
                  const c = e.target.value.replace(/[^0-9]/g, "").slice(-1);
                  if (c) setDt(dt.slice(0, i) + c + dt.slice(i + 1));
                }}
                style={{ width: 22, textAlign: "center", padding: 2, fontFamily: "var(--font-mono)",
                  background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 3, fontSize: 12 }}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <button style={btn} onClick={setBoxToStandard}>standardni DT</button>
        <button style={btn} onClick={setZeroDt}>nulova DT (wildcard)</button>
        {[0,1,2,3,4,5,6,7,8,9].map((d) => (
          <button key={d} style={{ ...btn, padding: "5px 8px" }} onClick={() => setDi(d)}>D_{d}</button>
        ))}
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <div>aplikace DT: PIN = DT[{hex[0]}] · DT[{hex[1]}] · DT[{hex[2]}] · DT[{hex[3]}]</div>
        <div style={{ fontSize: 14, marginTop: 4 }}>
          generovany PIN = <b style={{ color: "var(--accent)" }}>{generatedPin}</b>
        </div>
      </div>

      <details style={{ fontSize: 11, color: "var(--text-muted)" }}>
        <summary style={{ cursor: "pointer", color: "var(--text)" }}>Diagnostika všech D_i (10 dotazu na HSM)</summary>
        <div style={{ marginTop: 6, fontFamily: "var(--font-mono)" }}>
          {diagnostics.map((dg) => (
            <div key={dg.i} style={{ padding: "2px 0" }}>
              D_{dg.i}: → PIN = <span style={{ color: dg.contains ? "#81b29a" : "var(--text-muted)" }}>{dg.pin}</span>
              {dg.contains && <span style={{ color: "#81b29a" }}> &nbsp;⇒ PIN obsahuje digit {dg.i}</span>}
            </div>
          ))}
          <div style={{ marginTop: 6, color: "var(--accent)" }}>
            Z teto tabulky odhali utocnik, jake digity jsou v PIN — pak max 4! = 24 permutaci na full recovery.
          </div>
        </div>
      </details>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        DT je parametr HSM funkce <span style={{ fontFamily: "var(--font-mono)" }}>VerifyPIN()</span>, ne pevna konstanta. Modifikaci DT
        utocnik s pristupem k HSM API a EPB legitimniho zakaznika rekonstruuje PIN za ~6 volani. Mitigace: HSM vynucuje kontrolu, ze DT odpovida standardní hodnotě (od 2005+ default).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
