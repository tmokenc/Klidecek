// Glitch utok: user pick which CPU cycle to vynechat instrukci, vidi
// nasledek (vystupni cyklus dump pameti, PIN bypass, infinite loop).
import { useState } from "react";

const SCENARIOS = {
  output_loop: {
    title: "vystupni cyklus (dump pameti)",
    code: [
      "b = answer_address      ; (0) ptr",
      "a = answer_length       ; (1) counter",
      "loop:",
      "  if (a == 0) goto end  ; (2) podminka",
      "  transmit(*b)          ; (3) posli byte",
      "  b = b + 1             ; (4) inc ptr",
      "  a = a - 1             ; (5) dec counter",
      "  goto loop             ; (6)",
      "end:",
      "  halt                  ; (7)",
    ],
    legitimate: "Posle answer_length bytu z bufferu, pak halt.",
    glitches: {
      2: "Skip 'if (a==0) goto end' → smycka pokracuje za hranicí bufferu, dumpe RAM/EEPROM (klice!).",
      5: "Skip 'a--' → smycka nikdy neskonci, posle vsechnu pamet az do externiho preruseni.",
      4: "Skip 'b++' → opakovane posila stejny byte, neunikne nic novyho.",
      6: "Skip 'goto loop' → posle jen 1 byte, pak halt.",
    },
  },
  pin_check: {
    title: "PIN check + counter",
    code: [
      "  read entered_pin       ; (0)",
      "  if (counter == 0)      ; (1) blokovano?",
      "    goto blocked",
      "  counter = counter - 1  ; (2) DECREMENT FIRST",
      "  if (entered == correct); (3) overeni",
      "    counter = 3          ; (4) reset",
      "    auth_ok = 1          ; (5)",
      "  else",
      "    auth_ok = 0          ; (6)",
      "  store counter          ; (7) flush do EEPROM",
    ],
    legitimate: "Spravne se decrementuje counter pred overovani (write-then-verify pattern).",
    glitches: {
      2: "Skip counter-- → counter se nikdy nesnizi, brute-force PIN do nekonecna.",
      7: "Skip 'store counter' → counter v RAM, ale EEPROM nezapsana. Po reboot countera nepodporen.",
      3: "Skip 'if entered==correct' → auth_ok zustane stary (z minulé iterace).",
      5: "Skip 'auth_ok = 1' → auth nepride OK, ale dalsi krok muze byt prozradi mezistav.",
    },
  },
};

export default function GlitchPin() {
  const [scenario, setScenario] = useState("output_loop");
  const sc = SCENARIOS[scenario];
  const [glitchLine, setGlitchLine] = useState(null);

  function reset() { setGlitchLine(null); }

  // Find line index from code line text
  function lineNum(idx) {
    let n = 0;
    for (let i = 0; i < idx; i++) if (!sc.code[i].endsWith(":")) n++;
    return n;
  }

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>scénář:</label>
        <select value={scenario} onChange={(e) => { setScenario(e.target.value); reset(); }} style={{ ...sel, flex: 1, minWidth: 220 }}>
          {Object.entries(SCENARIOS).map(([k, v]) => <option key={k} value={k}>{v.title}</option>)}
        </select>
        <button style={btn} onClick={reset}>reset glitch</button>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 12 }}>
        {sc.code.map((line, i) => {
          const isLabel = line.endsWith(":");
          const lineNumber = isLabel ? null : lineNum(i);
          const isGlitched = glitchLine !== null && lineNumber === glitchLine;
          const canGlitch = lineNumber !== null && sc.glitches[lineNumber];
          return (
            <div key={i} style={{ padding: "2px 4px", color: isGlitched ? "#e07a5f" : "var(--text)",
              textDecoration: isGlitched ? "line-through" : "none",
              background: canGlitch && glitchLine === null ? "rgba(244,162,89,0.06)" : "transparent",
              cursor: canGlitch && glitchLine === null ? "pointer" : "default", borderRadius: 3 }}
              onClick={() => { if (canGlitch && glitchLine === null) setGlitchLine(lineNumber); }}>
              {line}
              {canGlitch && glitchLine === null && (
                <span style={{ color: "var(--text-muted)", fontSize: 10, marginLeft: 6 }}> ⚡ klikni pro glitch</span>
              )}
            </div>
          );
        })}
      </div>

      {glitchLine === null ? (
        <div style={{ background: "var(--bg-inset)", padding: 8, borderRadius: 6, fontSize: 11, color: "var(--text-muted)", borderLeft: "3px solid #81b29a" }}>
          <b style={{ color: "#81b29a" }}>Legitimni behaviour:</b> {sc.legitimate}
        </div>
      ) : (
        <div style={{ background: "var(--bg-inset)", padding: 8, borderRadius: 6, fontSize: 11, color: "var(--text-muted)", borderLeft: "3px solid #e07a5f" }}>
          <b style={{ color: "#e07a5f" }}>Vynechana instrukce {glitchLine}:</b> {sc.glitches[glitchLine]}
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        CLK / VCC glitch typicky vynecha jednu instrukci behem fetch/decode fáze. Obrana: redundantni vypocet
        (2× nebo 3× s porovnánim), <i>defensive programming</i> (acceptance vyzaduje konkretni hodnotu 0x5A, ne "cokoli != 0"),
        senzory napeti a frekvence.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
