// ISO 14443-3 anticollision: 4 karty v poli s nahodnymi UID, binary tree
// search; karty bez shody jdou do HALT.
import { useMemo, useState } from "react";

function randomUid(rng) {
  let s = rng;
  const arr = [];
  for (let i = 0; i < 32; i++) {
    s = (Math.imul(s, 1103515245) + 12345) | 0;
    arr.push((s >>> 24) & 1);
  }
  return { uid: arr, state: "ACTIVE" };
}

export default function NfcAnticollision() {
  const [seed, setSeed] = useState(7);
  const [cards, setCards] = useState(() => [
    randomUid(11), randomUid(23), randomUid(47), randomUid(89),
  ]);
  const [knownBits, setKnownBits] = useState(""); // partial UID prefix discovered

  function newField() {
    const s = Date.now() & 0xfffff;
    setSeed(s);
    setCards([randomUid(s + 1), randomUid(s + 3), randomUid(s + 7), randomUid(s + 17)]);
    setKnownBits("");
  }

  // Active cards = those whose UID starts with knownBits AND state === ACTIVE
  const candidates = useMemo(() => {
    return cards.filter((c) => c.state === "ACTIVE" && c.uid.slice(0, knownBits.length).join("") === knownBits);
  }, [cards, knownBits]);

  // What bit do they disagree on?
  const conflictBit = useMemo(() => {
    if (candidates.length <= 1) return null;
    const pos = knownBits.length;
    const vals = new Set(candidates.map((c) => c.uid[pos]));
    if (vals.size === 1) return null;
    return pos;
  }, [candidates, knownBits]);

  function pickBit(b) {
    if (conflictBit === null) return;
    // cards with different bit go to HALT
    setCards(cards.map((c) => {
      if (c.state !== "ACTIVE") return c;
      const matches = c.uid.slice(0, knownBits.length).join("") === knownBits;
      if (!matches) return c;
      if (c.uid[knownBits.length] === b) return c;
      return { ...c, state: "HALT" };
    }));
    setKnownBits(knownBits + b);
  }

  return (
    <div style={ctn}>
      <div style={row}>
        <button style={btn} onClick={newField}>↻ nove karty v poli</button>
        <span style={lbl}>aktivni: {candidates.length} / {cards.filter((c) => c.state === "ACTIVE").length}</span>
        {candidates.length === 1 && (
          <span style={{ ...lbl, color: "#81b29a" }}>✓ uniquely identified — pripravna pro SELECT</span>
        )}
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={lbl}>karty (UID 32-bit; znamy prefix podtrzeny):</div>
        {cards.map((c, i) => {
          const isActive = c.state === "ACTIVE";
          const matches = isActive && c.uid.slice(0, knownBits.length).join("") === knownBits;
          return (
            <div key={i} style={{ display: "flex", gap: 8, padding: "3px 0", fontFamily: "var(--font-mono)", fontSize: 11,
              opacity: matches ? 1 : 0.4 }}>
              <span style={{ minWidth: 60, color: c.state === "HALT" ? "#e07a5f" : "#81b29a" }}>{c.state === "HALT" ? "HALT" : "ACTIVE"}</span>
              <span style={{ letterSpacing: 1 }}>
                {c.uid.map((b, j) => (
                  <span key={j} style={{
                    color: j < knownBits.length ? "var(--accent)" : "var(--text)",
                    fontWeight: j === knownBits.length && conflictBit === j && matches ? "bold" : "normal",
                    textDecoration: j < knownBits.length ? "underline" : "none",
                    background: j === knownBits.length && conflictBit === j && matches ? "rgba(244,162,89,0.2)" : "transparent",
                  }}>{b}</span>
                ))}
              </span>
            </div>
          );
        })}
      </div>

      <div style={row}>
        <span style={lbl}>znama pozice {knownBits.length}/32 — na bitu {knownBits.length} se kandidati rozchazeji:</span>
      </div>
      <div style={row}>
        <button style={{ ...btn, padding: "8px 16px", background: conflictBit !== null ? "var(--accent)" : "var(--bg-inset)", color: conflictBit !== null ? "var(--bg-inset)" : "var(--text-muted)" }}
          onClick={() => pickBit("0")} disabled={conflictBit === null}>
          pokracuj s bitem 0 (HALT karty s bitem 1)
        </button>
        <button style={{ ...btn, padding: "8px 16px", background: conflictBit !== null ? "var(--accent)" : "var(--bg-inset)", color: conflictBit !== null ? "var(--bg-inset)" : "var(--text-muted)" }}
          onClick={() => pickBit("1")} disabled={conflictBit === null}>
          pokracuj s bitem 1 (HALT karty s bitem 0)
        </button>
      </div>

      {candidates.length === 1 && (
        <div style={{ background: "var(--bg-inset)", padding: 8, borderRadius: 6, borderLeft: "3px solid #81b29a", fontSize: 11 }}>
          <b style={{ color: "#81b29a" }}>SAK → ACTIVE karta vybrana.</b> UID = <span style={{ fontFamily: "var(--font-mono)" }}>{candidates[0].uid.join("")}</span>.
          Ostatni karty v HALT do dalsiho REQA.
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Reader vysila REQA → vsechny karty odpovi ATQA. Pri kolizi reader vybere jednu vetev (0 nebo 1) a opakuje;
        ostatni karty prejdou do HALT. Sekvence SEL + bitu narusuje UID po jednom kroku. SAK pak finalizuje vyber.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
