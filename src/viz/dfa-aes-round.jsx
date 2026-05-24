// DFA na AES posledni kolo (Piret-Quisquater). User klikne 1 byte ve stavu
// na zacatku 9. kola; sledujeme propagaci pres MixColumns (1→4), ShiftRows
// (rozprostreni do 4 sloupcu), do ciphertextu.
import { useMemo, useState } from "react";

const ROW_SHIFT = [0, 1, 2, 3];

function cellIdx(r, c) { return r + 4 * c; } // column-major

export default function DfaAesRound() {
  const [faulted, setFaulted] = useState({ r: 1, c: 2 }); // initial fault position at start of round 9
  const [step, setStep] = useState(0); // 0..4

  // Compute affected cells at each step
  const affected = useMemo(() => {
    const out = [[], [], [], [], []];
    out[0] = [cellIdx(faulted.r, faulted.c)];
    // Step 1: After SubBytes round 9 — same position (SubBytes is byte-wise bijection)
    out[1] = [cellIdx(faulted.r, faulted.c)];
    // Step 2: After ShiftRows round 9 — byte moves to (r, (c-r) mod 4)
    const c2 = (faulted.c - faulted.r + 4) % 4;
    out[2] = [cellIdx(faulted.r, c2)];
    // Step 3: After MixColumns round 9 — entire column c2 differs
    out[3] = [0, 1, 2, 3].map((r) => cellIdx(r, c2));
    // Step 4: After round 10 ShiftRows + AddRoundKey — each of 4 bytes moved by its row shift
    out[4] = [0, 1, 2, 3].map((r) => cellIdx(r, (c2 - r + 4) % 4));
    return out;
  }, [faulted]);

  const stepInfo = [
    { title: "Krok 0 — injekce chyby (start kola 9)", desc: "1 byte modifikovan (napr. bit-flip pres EM-FI nebo laser)." },
    { title: "Krok 1 — po SubBytes kola 9", desc: "S-box je byte-wise bijekce; chyba zustava na stejne pozici." },
    { title: "Krok 2 — po ShiftRows kola 9", desc: `Radek r=${faulted.r} se posune o ${faulted.r} doleva; byte je nyni na sloupci c'=${(faulted.c - faulted.r + 4) % 4}.` },
    { title: "Krok 3 — po MixColumns kola 9", desc: "MixColumns smichá 4 bity sloupce; cely sloupec se nyni lisi." },
    { title: "Krok 4 — po SubBytes + ShiftRows + AddRoundKey kola 10 (C')", desc: "Poslední kolo nema MixColumns; ShiftRows roztáhne 4 byty do 4 ruznych sloupcu." },
  ];

  const cellSize = 36;
  const gridSize = 4 * cellSize + 8;

  function Grid({ active, label }) {
    return (
      <svg viewBox={`0 0 ${gridSize} ${gridSize + 18}`} style={{ width: gridSize + 4 }}>
        <text x={4} y={12} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">{label}</text>
        {Array.from({ length: 16 }).map((_, i) => {
          const r = i % 4, c = Math.floor(i / 4);
          const x = 4 + c * cellSize, y = 18 + r * cellSize;
          const isActive = active.includes(i);
          return (
            <g key={i}>
              <rect x={x} y={y} width={cellSize - 2} height={cellSize - 2} rx={3}
                fill={isActive ? "#e07a5f" : "var(--bg-card)"}
                stroke="var(--line)" strokeWidth={0.6}
                style={{ cursor: step === 0 ? "pointer" : "default" }}
                onClick={() => { if (step === 0) setFaulted({ r, c }); }} />
              <text x={x + (cellSize - 2) / 2} y={y + (cellSize - 2) / 2 + 4} fontSize="10"
                textAnchor="middle" fill={isActive ? "var(--bg-inset)" : "var(--text-muted)"} fontFamily="var(--font-mono)">
                {r},{c}
              </text>
            </g>
          );
        })}
      </svg>
    );
  }

  return (
    <div style={ctn}>
      <div style={row}>
        <button style={btn} onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← zpet</button>
        <span style={lbl}>krok {step} / 4</span>
        <button style={btn} onClick={() => setStep(Math.min(4, step + 1))} disabled={step === 4}>vpred →</button>
        <button style={btn} onClick={() => { setStep(0); setFaulted({ r: Math.floor(Math.random() * 4), c: Math.floor(Math.random() * 4) }); }}>jine misto</button>
      </div>

      <div style={{ background: "var(--bg-inset)", borderRadius: 6, padding: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{stepInfo[step].title}</div>
        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{stepInfo[step].desc}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
        <Grid active={affected[step]} label="aktualni stav (r, c)" />
        {step === 4 && (
          <Grid active={affected[4]} label="C ⊕ C' (pozice byty C' se lisi od C)" />
        )}
      </div>

      {step === 4 && (
        <div style={{ background: "var(--bg-inset)", borderRadius: 6, padding: 10, fontSize: 11, color: "var(--text-muted)" }}>
          <b style={{ color: "var(--text)" }}>Utok (Piret-Quisquater):</b> utocnik ma C a C'. Pro kazdou hypotezu o 4 bytech k_10 na ovlivnenych pozicich
          zpetne spocita stav pred AddRoundKey-10 a pred SubBytes-10. Spravna hypoteza vede k diff, ktery odpovida
          MixColumns aplikovanemu na (a, 0, 0, 0) — tedy konstanty (2a, a, a, 3a) v GF(2^8). 2 fault pary → cely k_10 → klic AES.
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Pred startem klikni do mrizky pro zmenu pozice chyby. Sleduj jak se 1 byte rozprostre do 4 sloupcu skrz MixColumns + ShiftRows.
        Obrana: dvoji vypocet a porovnani (temporal redundancy), nebo signature verify po vypoctu.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
