// Frekvenční analýza monoalfabetické substituce.
// Cryptogram s histogramem ciphertext frekvencí porovnaným s angličtinou.
// Drag-and-assign: klikni cipher písmeno → klikni plaintext → mapování se uloží.
// Plaintext view ukazuje současný stav rozluštění.
import { useMemo, useState } from "react";

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const ENGLISH_FREQ = {
  E: 12.31, T: 9.59, A: 8.05, O: 7.94, N: 7.19, I: 7.18, S: 6.59, R: 6.03,
  H: 5.14, L: 4.03, D: 3.65, C: 3.20, U: 3.10, P: 2.29, F: 2.28, M: 2.25,
  W: 2.03, Y: 1.88, G: 1.61, B: 1.62, V: 0.93, K: 0.52, X: 0.20, Q: 0.20, J: 0.10, Z: 0.09,
};

// Pevný klíč (permutace abecedy)
function generateCipher() {
  const plain =
    "THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG WHILE THE SUN RISES OVER THE EASTERN HILLS AND " +
    "THE FOG CLEARS FROM THE VALLEY LETTING THE LIGHT FALL ON THE SLEEPING TOWN THAT WILL SOON WAKE";
  const key = "XKVMFPLZBYJHGNWQTRIESUDCAO"; // permutation
  const mapping = {};
  for (let i = 0; i < 26; i++) mapping[ALPHA[i]] = key[i];
  const cipher = plain.toUpperCase().split("").map((c) => mapping[c] || c).join("");
  return { plain: plain.toUpperCase(), cipher, key, mapping };
}

const { plain: PLAIN_TEXT, cipher: CIPHER_TEXT, mapping: TRUE_MAPPING } = generateCipher();

function countFreq(text) {
  const counts = new Array(26).fill(0);
  let total = 0;
  for (const c of text) {
    const i = ALPHA.indexOf(c);
    if (i >= 0) { counts[i]++; total++; }
  }
  return { counts, total, percent: counts.map((c) => total ? (100 * c) / total : 0) };
}

export default function FreqAnalysis() {
  const [assignments, setAssignments] = useState({});
  const [selectedCipher, setSelectedCipher] = useState(null);

  const cipherFreq = useMemo(() => countFreq(CIPHER_TEXT), []);
  const sortedCipher = useMemo(() => {
    const idx = [...Array(26).keys()].sort((a, b) => cipherFreq.percent[b] - cipherFreq.percent[a]);
    return idx.map((i) => ALPHA[i]);
  }, [cipherFreq]);

  const partialDecrypt = useMemo(() => {
    return CIPHER_TEXT.split("").map((c) => assignments[c] ? assignments[c] : (ALPHA.includes(c) ? "·" : c)).join("");
  }, [assignments]);

  const correctCount = useMemo(() => {
    let n = 0;
    for (const [c, p] of Object.entries(assignments)) {
      const truePlain = Object.keys(TRUE_MAPPING).find((k) => TRUE_MAPPING[k] === c);
      if (truePlain === p) n++;
    }
    return n;
  }, [assignments]);

  function assign(plainChar) {
    if (!selectedCipher) return;
    const next = { ...assignments };
    // remove previous binding to either side
    for (const [c, p] of Object.entries(next)) {
      if (p === plainChar || c === selectedCipher) delete next[c];
    }
    next[selectedCipher] = plainChar;
    setAssignments(next);
    setSelectedCipher(null);
  }
  function autoHint() {
    // Top 3 most common cipher → E T A
    const next = { ...assignments };
    const guesses = ["E", "T", "A"];
    for (let i = 0; i < 3; i++) {
      // remove existing usages
      for (const [c, p] of Object.entries(next)) {
        if (p === guesses[i] || c === sortedCipher[i]) delete next[c];
      }
      next[sortedCipher[i]] = guesses[i];
    }
    setAssignments(next);
  }

  const W = 540, BAR_W = 540, BAR_H = 130;
  const maxFreqValue = 13;

  return (
    <div style={ctn}>
      <div style={row}>
        <button onClick={() => { setAssignments({}); setSelectedCipher(null); }} style={btn}>Vyčistit</button>
        <button onClick={autoHint} style={btn}>Návrh: top-3 → E,T,A</button>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          Mapování: <b style={{ color: "var(--accent)" }}>{Object.keys(assignments).length}</b> / 26 znaků
          (správně: <b style={{ color: "#81b29a" }}>{correctCount}</b>)
        </span>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        <b>Frekvence v ciphertextu</b> vs. <span style={{ color: "#81b29a" }}>angličtina</span>:
      </div>
      <svg viewBox={`0 -4 ${W} ${BAR_H + 34}`} style={{ width: "100%", maxWidth: 620 }}>
        {ALPHA.split("").map((c, i) => {
          const x = 8 + i * ((BAR_W - 16) / 26);
          const ph = (cipherFreq.percent[i] / maxFreqValue) * BAR_H;
          const eh = ((ENGLISH_FREQ[c] || 0) / maxFreqValue) * BAR_H;
          const cw = (BAR_W - 16) / 26 - 2;
          const isSelected = selectedCipher === c;
          return (
            <g key={c}>
              <rect x={x} y={BAR_H - eh} width={cw / 2} height={eh} fill="#81b29a" opacity="0.5" />
              <rect
                x={x + cw / 2} y={BAR_H - ph} width={cw / 2} height={ph}
                fill={isSelected ? "var(--accent)" : "var(--accent)"}
                opacity={isSelected ? 1 : 0.85}
                stroke={isSelected ? "var(--text)" : "none"} strokeWidth="1.5"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedCipher(c === selectedCipher ? null : c)}
              />
              <text x={x + cw / 2} y={BAR_H + 12} fontSize="10" fill={isSelected ? "var(--accent)" : "var(--text-muted)"}
                textAnchor="middle" fontFamily="var(--font-mono)" fontWeight={isSelected ? "bold" : "normal"}>
                {c}
              </text>
              {assignments[c] && (
                <text x={x + cw / 2} y={BAR_H + 26} fontSize="9" fill="var(--accent)" textAnchor="middle" fontFamily="var(--font-mono)">
                  ↓{assignments[c]}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div style={{ fontSize: 12, color: "var(--text)" }}>
        {selectedCipher ? (
          <>Vybráno cipher písmeno <b style={{ color: "var(--accent)" }}>{selectedCipher}</b>. Klikni na cíl (plaintext) →</>
        ) : (
          <>Klikni na sloupec ciphertextu, pak na cílové plaintext písmeno níže.</>
        )}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 4 }}>
        {ALPHA.split("").map((c) => {
          const used = Object.values(assignments).includes(c);
          return (
            <button key={c} onClick={() => assign(c)} disabled={!selectedCipher || used}
              style={{
                ...btn,
                opacity: !selectedCipher || used ? 0.4 : 1,
                background: used ? "var(--bg-inset)" : "var(--bg-card)",
                color: used ? "var(--text-faint)" : "var(--text)",
                minWidth: 22, padding: "3px 6px", fontFamily: "var(--font-mono)",
              }}>
              {c}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Ciphertext:</div>
      <div style={textBox}>{CIPHER_TEXT.slice(0, 220)}…</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Stav rozluštění (· = nevyplněno):</div>
      <div style={{ ...textBox, color: "var(--accent)" }}>{partialDecrypt.slice(0, 220)}…</div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Anglické frekvence: E (12.3 %), T (9.6 %), A (8.1 %), O (7.9 %)… Hledej nejčastější ciphertext znak — odpovídá nejspíš E.
        Pak nejčastější digram → TH, trigram → THE.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 8 };
const row = { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 11, cursor: "pointer" };
const textBox = { background: "var(--bg-inset)", padding: 8, borderRadius: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text)", whiteSpace: "pre-wrap", lineHeight: 1.4, wordBreak: "break-all" };
