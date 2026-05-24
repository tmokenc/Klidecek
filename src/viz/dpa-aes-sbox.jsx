// DPA na AES S-box: utocnik tipne klicovy byte; korelace mezi modelem
// HW(S(p XOR k_g)) a "naměřeným" power = HW(S(p XOR k*)) + sum rozliší správný klíč.
import { useMemo, useState } from "react";

// AES S-box (FIPS 197)
const SBOX = new Uint8Array([
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
]);

function popcount(x) {
  x = x - ((x >> 1) & 0x55);
  x = (x & 0x33) + ((x >> 2) & 0x33);
  return (((x + (x >> 4)) & 0x0f));
}

// Pearson correlation
function pearson(xs, ys) {
  const n = xs.length;
  let sx = 0, sy = 0;
  for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; }
  const mx = sx / n, my = sy / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx, b = ys[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  if (dx === 0 || dy === 0) return 0;
  return num / Math.sqrt(dx * dy);
}

// Box-Muller for Gaussian noise
function gauss() {
  const u1 = Math.random() || 1e-9, u2 = Math.random();
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

export default function DpaAesSbox() {
  const [trueKey, setTrueKey] = useState(0x2b); // standard AES "0x2b" first byte
  const [n, setN] = useState(200);
  const [noise, setNoise] = useState(1.5);

  const data = useMemo(() => {
    // Generate N random plaintexts + measurements
    const plain = new Uint8Array(n);
    const power = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      plain[i] = Math.floor(Math.random() * 256);
      const v = SBOX[plain[i] ^ trueKey];
      power[i] = popcount(v) + noise * gauss();
    }
    // For each k_g, compute model and correlation
    const rhos = new Float32Array(256);
    const xs = new Float32Array(n);
    for (let kg = 0; kg < 256; kg++) {
      for (let i = 0; i < n; i++) xs[i] = popcount(SBOX[plain[i] ^ kg]);
      rhos[kg] = pearson(xs, power);
    }
    return { rhos, plain, power };
  }, [trueKey, n, noise]);

  const maxRhoAbs = Math.max(...data.rhos.map(Math.abs), 0.01);

  // Find best guess
  let bestKg = 0, bestRho = 0;
  for (let kg = 0; kg < 256; kg++) {
    if (Math.abs(data.rhos[kg]) > Math.abs(bestRho)) { bestRho = data.rhos[kg]; bestKg = kg; }
  }

  const W = 520, H = 200;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>skutecny k* =</label>
        <input type="number" min={0} max={255} value={trueKey} onChange={(e) => setTrueKey(Math.max(0, Math.min(255, +e.target.value || 0)))}
          style={{ ...sel, width: 80, fontFamily: "var(--font-mono)" }} />
        <span style={lbl}>0x{trueKey.toString(16).padStart(2, "0")}</span>
        <button style={btn} onClick={() => setTrueKey(Math.floor(Math.random() * 256))}>nahodny k*</button>
      </div>
      <div style={row}>
        <label style={lbl}>N traces =</label>
        <input type="range" min={20} max={2000} step={10} value={n} onChange={(e) => setN(+e.target.value)} style={{ flex: 1, minWidth: 140 }} />
        <span style={lbl}>{n}</span>
        <label style={lbl}>sum sigma =</label>
        <input type="range" min={0} max={5} step={0.1} value={noise} onChange={(e) => setNoise(+e.target.value)} style={{ flex: 1, minWidth: 100 }} />
        <span style={lbl}>{noise.toFixed(1)}</span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 580, background: "var(--bg-inset)", borderRadius: 6 }}>
        <line x1={20} y1={H/2} x2={W-20} y2={H/2} stroke="var(--line)" />
        {Array.from({ length: 256 }).map((_, kg) => {
          const x = 20 + (kg / 256) * (W - 40);
          const r = data.rhos[kg];
          const isTrue = kg === trueKey;
          const isBest = kg === bestKg;
          const h = (r / maxRhoAbs) * (H / 2 - 20);
          return (
            <line key={kg} x1={x} y1={H/2} x2={x} y2={H/2 - h}
              stroke={isTrue ? "#81b29a" : isBest ? "#e07a5f" : "var(--accent)"}
              strokeWidth={isTrue || isBest ? 1.5 : 0.6} />
          );
        })}
        <text x={20} y={14} fontSize="10" fill="var(--text-muted)">Pearson rho(k_g, trace) pro vsech 256 hypotez:</text>
        <text x={W - 20} y={14} fontSize="10" textAnchor="end" fill="#81b29a">spravny k* = 0x{trueKey.toString(16).padStart(2, "0")}</text>
        <text x={20} y={H - 8} fontSize="10" fill="var(--text-muted)">k_g = 0</text>
        <text x={W - 20} y={H - 8} fontSize="10" textAnchor="end" fill="var(--text-muted)">k_g = 255</text>
      </svg>

      <div style={{ fontSize: 12, fontFamily: "var(--font-mono)" }}>
        nejvyssi |rho| pro k_g = <b style={{ color: bestKg === trueKey ? "#81b29a" : "#e07a5f" }}>
          0x{bestKg.toString(16).padStart(2, "0")}
        </b> &nbsp; (rho = {bestRho.toFixed(3)}) &nbsp;·&nbsp;
        {bestKg === trueKey ? "✓ klic obnoven" : "✗ jeste neutekuje — zvys N nebo sniz sum"}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Model: spotreba = HW(S-box(p XOR k)) + sum. Pro spravny k_g je korelace silna; pro chybne tipy se priblizi 0.
        DPA reduuje 2^128 (full klic) na 16 × 256 = 4096 hypotez (byte-wise). Maskovani a balanced logic chrani proti.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
