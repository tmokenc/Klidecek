// simd-lane-explorer — 256-bit AVX register, swap data type → lanes redraw.
// Parallel SIMD add compared to 8 sequential scalar adds.
import { useEffect, useState } from "react";

const TYPES = {
  f32: { label: "8× float32 (__m256)", n: 8, w: 32, getA: i => (i + 1) * 0.5, getB: i => i * 0.25, fmt: v => v.toFixed(2) },
  f64: { label: "4× float64 (__m256d)", n: 4, w: 64, getA: i => (i + 1) * 1.1, getB: i => (i + 1) * 0.7, fmt: v => v.toFixed(2) },
  i32: { label: "8× int32 (__m256i)",    n: 8, w: 32, getA: i => 10 + i, getB: i => 100 + i * 10, fmt: v => v.toString() },
  i16: { label: "16× int16",              n: 16, w: 16, getA: i => i + 1, getB: i => 2 * (i + 1), fmt: v => v.toString() },
  i8:  { label: "32× int8 (__m256i bytes)", n: 32, w: 8, getA: i => i, getB: i => 50 + i, fmt: v => v.toString() },
};

export default function SimdLaneExplorer() {
  const [typeKey, setTypeKey] = useState("f32");
  const [scalarStep, setScalarStep] = useState(0);
  const [running, setRunning] = useState(false);
  const t = TYPES[typeKey];

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setScalarStep(s => s >= t.n ? 0 : s + 1);
    }, 250);
    return () => clearInterval(id);
  }, [running, t.n]);

  const W = 580, H = 320;
  const laneW = (W - 60) / t.n - 2;
  const valsA = Array.from({ length: t.n }, (_, i) => t.getA(i));
  const valsB = Array.from({ length: t.n }, (_, i) => t.getB(i));
  const valsR = valsA.map((a, i) => a + valsB[i]);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
        <select value={typeKey} onChange={e => { setTypeKey(e.target.value); setScalarStep(0); }} style={ctrl}>
          {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={() => setScalarStep(s => Math.min(t.n, s + 1))} style={btn(false)}>scalar krok →</button>
        <button onClick={() => setRunning(r => !r)} style={btn(running)}>{running ? "■" : "▶"}</button>
        <button onClick={() => { setScalarStep(0); setRunning(false); }} style={btn(false)}>reset</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* 256-bit register frame */}
        <text x={20} y={20} fontSize="11" fill="var(--text)" fontWeight="600">__m256 (256 bitů = {t.n} × {t.w} bitů):</text>

        {/* Operand A */}
        <text x={20} y={45} fontSize="10" fill="var(--text-muted)">a</text>
        {valsA.map((v, i) => (
          <g key={"a" + i}>
            <rect x={40 + i * (laneW + 2)} y={32} width={laneW} height={26}
              fill="oklch(0.65 0.16 245 / 0.3)" stroke="oklch(0.65 0.16 245)" rx="2" />
            <text x={40 + i * (laneW + 2) + laneW / 2} y={49} textAnchor="middle" fontSize="9"
              fontFamily="ui-monospace, monospace" fill="var(--text)">{t.fmt(v)}</text>
          </g>
        ))}

        {/* Operand B */}
        <text x={20} y={87} fontSize="10" fill="var(--text-muted)">b</text>
        {valsB.map((v, i) => (
          <g key={"b" + i}>
            <rect x={40 + i * (laneW + 2)} y={74} width={laneW} height={26}
              fill="oklch(0.65 0.16 145 / 0.3)" stroke="oklch(0.65 0.16 145)" rx="2" />
            <text x={40 + i * (laneW + 2) + laneW / 2} y={91} textAnchor="middle" fontSize="9"
              fontFamily="ui-monospace, monospace" fill="var(--text)">{t.fmt(v)}</text>
          </g>
        ))}

        {/* SIMD parallel add */}
        <text x={20} y={140} fontSize="11" fill="var(--text)" fontWeight="600">SIMD ADD (1 instrukce, {t.n} lanes paralelně):</text>
        <text x={20} y={158} fontSize="10" fill="var(--text-muted)">r</text>
        {valsR.map((v, i) => (
          <g key={"r" + i}>
            <rect x={40 + i * (laneW + 2)} y={148} width={laneW} height={26}
              fill="oklch(0.7 0.15 60 / 0.3)" stroke="oklch(0.7 0.15 60)" rx="2" />
            <text x={40 + i * (laneW + 2) + laneW / 2} y={165} textAnchor="middle" fontSize="9"
              fontFamily="ui-monospace, monospace" fill="var(--text)">{t.fmt(v)}</text>
          </g>
        ))}
        <text x={20} y={188} fontSize="9" fill="var(--accent)">1 cyklus pro celý 256 bit registr</text>

        {/* Scalar sequential add */}
        <text x={20} y={215} fontSize="11" fill="var(--text)" fontWeight="600">skalární smyčka ({t.n} cyklů, krok {scalarStep}/{t.n}):</text>
        {valsR.map((v, i) => (
          <g key={"s" + i}>
            <rect x={40 + i * (laneW + 2)} y={224} width={laneW} height={26}
              fill={i < scalarStep ? "oklch(0.7 0.15 60 / 0.3)" : "var(--bg-inset)"}
              stroke={i < scalarStep ? "oklch(0.7 0.15 60)" : "var(--line)"} rx="2" />
            <text x={40 + i * (laneW + 2) + laneW / 2} y={241} textAnchor="middle" fontSize="9"
              fontFamily="ui-monospace, monospace" fill={i < scalarStep ? "var(--text)" : "var(--text-faint)"}>
              {i < scalarStep ? t.fmt(v) : "?"}
            </text>
            {i === scalarStep && (
              <rect x={40 + i * (laneW + 2)} y={224} width={laneW} height={26} fill="none"
                stroke="var(--accent)" strokeWidth="2" rx="2" />
            )}
          </g>
        ))}
        <text x={20} y={272} fontSize="9" fill="var(--text-muted)">krok {scalarStep + 1} / {t.n}: i = {scalarStep}</text>

        <text x={20} y={H - 12} fontSize="9.5" fill="var(--text-faint)">
          Type tag rozhoduje, jak ALU interpretuje 256 bitů. Tatáž HW lane provede {t.fmt(0)} → {t.fmt(0)} podle volby _mm256_add_ps/_pd/_epi32.
        </text>
      </svg>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 6px", borderRadius: 3, fontSize: 11 };
function btn(active) {
  return { ...ctrl, background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", cursor: "pointer", padding: "3px 9px" };
}
