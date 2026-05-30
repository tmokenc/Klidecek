// AES round + avalanche effect.
// 4x4 stavová matice; krok SubBytes, ShiftRows, MixColumns, AddRoundKey.
// Toggle "flip 1 bit" pro zobrazení lavinového efektu — kolik bytů divergeuje po n kolech.
import { useMemo, useState } from "react";

// Standard AES S-box (256 bytes)
const SBOX = [
  0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16,
];

function xtime(x) { return ((x << 1) ^ (x & 0x80 ? 0x1b : 0)) & 0xff; }

function subBytes(s) { return s.map((b) => SBOX[b]); }
function shiftRows(s) {
  // s is column-major: s[0..3] = col 0
  const out = new Array(16);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    out[r + 4 * c] = s[r + 4 * ((c + r) % 4)];
  }
  return out;
}
function mixColumns(s) {
  const out = new Array(16);
  for (let c = 0; c < 4; c++) {
    const a0 = s[4*c], a1 = s[4*c+1], a2 = s[4*c+2], a3 = s[4*c+3];
    out[4*c+0] = xtime(a0) ^ (xtime(a1) ^ a1) ^ a2 ^ a3;
    out[4*c+1] = a0 ^ xtime(a1) ^ (xtime(a2) ^ a2) ^ a3;
    out[4*c+2] = a0 ^ a1 ^ xtime(a2) ^ (xtime(a3) ^ a3);
    out[4*c+3] = (xtime(a0) ^ a0) ^ a1 ^ a2 ^ xtime(a3);
  }
  return out;
}
function addRoundKey(s, k) { return s.map((b, i) => b ^ k[i]); }
function aesRound(s, k) { return addRoundKey(mixColumns(shiftRows(subBytes(s))), k); }

function popcount(x) {
  let c = 0;
  while (x) { c += x & 1; x >>>= 1; }
  return c;
}

const STEPS = ["Vstup", "SubBytes", "ShiftRows", "MixColumns", "AddRoundKey"];

function hex(b) { return b.toString(16).padStart(2, "0").toUpperCase(); }

export default function AesRound() {
  const [step, setStep] = useState(0);
  const [flippedBit, setFlippedBit] = useState(false);

  const initial = useMemo(() => [
    0x32, 0x88, 0x31, 0xe0, 0x43, 0x5a, 0x31, 0x37,
    0xf6, 0x30, 0x98, 0x07, 0xa8, 0x8d, 0xa2, 0x34,
  ], []);
  const initialFlipped = useMemo(() => {
    const out = [...initial];
    out[0] ^= 0x01;
    return out;
  }, [initial]);
  const roundKey = useMemo(() => [
    0x2b, 0x28, 0xab, 0x09, 0x7e, 0xae, 0xf7, 0xcf,
    0x15, 0xd2, 0x15, 0x4f, 0x16, 0xa6, 0x88, 0x3c,
  ], []);

  function statesFor(start) {
    const out = [start];
    let s = start;
    s = subBytes(s); out.push(s);
    s = shiftRows(s); out.push(s);
    s = mixColumns(s); out.push(s);
    s = addRoundKey(s, roundKey); out.push(s);
    return out;
  }
  const original = useMemo(() => statesFor(initial), [initial, roundKey]);
  const flipped = useMemo(() => statesFor(initialFlipped), [initialFlipped, roundKey]);

  // Track avalanche per step
  const avalanche = useMemo(() => original.map((o, i) => {
    let diff = 0, bytesChanged = 0;
    for (let j = 0; j < 16; j++) {
      diff += popcount(o[j] ^ flipped[i][j]);
      if (o[j] !== flipped[i][j]) bytesChanged++;
    }
    return { diff, bytesChanged };
  }), [original, flipped]);

  const current = flippedBit ? flipped[step] : original[step];

  const W = 540, CELL = 36, GRID = CELL * 4 + 20;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>Krok kola:</label>
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} style={{
            ...btn, background: step === i ? "var(--accent)" : "var(--bg-inset)",
            color: step === i ? "var(--bg-card)" : "var(--text)",
          }}>
            {i}: {s}
          </button>
        ))}
      </div>
      <div style={row}>
        <label style={{ ...lbl, display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={flippedBit} onChange={(e) => setFlippedBit(e.target.checked)} />
          flip 1 bit ve vstupu (lavinový efekt)
        </label>
      </div>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginBottom: 4 }}>
            stav po kroku „{STEPS[step]}"
          </div>
          <svg viewBox={`0 0 ${GRID} ${GRID}`} style={{ width: 220, height: 220 }}>
            {[0, 1, 2, 3].map((c) => [0, 1, 2, 3].map((r) => {
              const idx = r + 4 * c;
              const v = current[idx];
              const orig = original[step][idx];
              const changed = flippedBit && v !== orig;
              const x = 10 + c * CELL, y = 10 + r * CELL;
              return (
                <g key={`${r}-${c}`}>
                  <rect x={x} y={y} width={CELL - 2} height={CELL - 2} rx={3}
                    fill={changed ? "var(--accent)" : "var(--bg-inset)"}
                    opacity={changed ? 0.9 : 1}
                    stroke={changed ? "var(--accent)" : "var(--line)"} />
                  <text x={x + CELL / 2} y={y + CELL / 2 + 4}
                    fontFamily="var(--font-mono)" fontSize="12" textAnchor="middle"
                    fill={changed ? "var(--bg-card)" : "var(--text)"}>
                    {hex(v)}
                  </text>
                </g>
              );
            }))}
          </svg>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 220 }}>
          <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontSize: 11 }}>
            <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>Avalanche (po kroku):</div>
            <div style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>
              odlišných bitů: <b style={{ color: "var(--accent)" }}>{avalanche[step].diff}</b> / 128
            </div>
            <div style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>
              odlišných bytů: <b style={{ color: "var(--accent)" }}>{avalanche[step].bytesChanged}</b> / 16
            </div>
          </div>
          <svg viewBox="0 0 260 100" style={{ width: "100%" }}>
            <text x={130} y={12} fontSize="10" fill="var(--text-muted)" textAnchor="middle">
              šíření odlišných bitů přes kolo
            </text>
            {avalanche.map((a, i) => {
              const x = 10 + i * 50;
              const h = (a.diff / 128) * 70;
              return (
                <g key={i}>
                  <rect x={x} y={90 - h} width={40} height={h} fill="var(--accent)" opacity="0.7" />
                  <text x={x + 20} y={94} fontSize="9" fill="var(--text-muted)" textAnchor="middle">{STEPS[i].slice(0, 4)}</text>
                  <text x={x + 20} y={88 - h} fontSize="9" fill="var(--text-muted)" textAnchor="middle">{a.diff}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        AES kolo = <b>SubBytes</b> (nelinearita / S-box) + <b>ShiftRows</b> + <b>MixColumns</b> (difúze) + <b>AddRoundKey</b>.
        Lavinový efekt: po jednom kole se odchylka 1 bitu rozlije přes MixColumns na celý sloupec; po 2 kolech přes celý stav.
        AES-128 má 10 kol — desetinásobná bezpečnostní rezerva.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 12, color: "var(--text-muted)" };
const btn = { padding: "4px 8px", border: "1px solid var(--line)", borderRadius: 4, fontSize: 10, cursor: "pointer" };
