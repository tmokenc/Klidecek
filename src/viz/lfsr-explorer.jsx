// LFSR explorer — variable n, primitive vs. non-primitive polynomials,
// seed, step/run, period detection. Foundation for A5/1, Crypto-1, KeeLoq.
import { useEffect, useRef, useState } from "react";

const PRESETS = {
  4: [
    { name: "x^4 + x + 1  (primitivni, perioda 15)", taps: [4, 1], primitive: true },
    { name: "x^4 + x^3 + x^2 + x + 1  (perioda 5)", taps: [4, 3, 2, 1], primitive: false },
    { name: "x^4 + x^2 + 1  (perioda 6)", taps: [4, 2], primitive: false },
  ],
  8: [
    { name: "x^8 + x^4 + x^3 + x^2 + 1  (primitivni, perioda 255)", taps: [8, 4, 3, 2], primitive: true },
    { name: "x^8 + x^6 + x^5 + x + 1  (perioda 217)", taps: [8, 6, 5, 1], primitive: false },
  ],
  16: [
    { name: "x^16 + x^5 + x^3 + x^2 + 1  (primitivni, perioda 65535)", taps: [16, 5, 3, 2], primitive: true },
  ],
};

function defaultSeed(n) {
  return "0".repeat(n - 1) + "1";
}

export default function LfsrExplorer() {
  const [n, setN] = useState(4);
  const [presetIdx, setPresetIdx] = useState(0);
  const preset = PRESETS[n][Math.min(presetIdx, PRESETS[n].length - 1)];
  const [seed, setSeed] = useState(defaultSeed(4));
  const [state, setState] = useState(() => defaultSeed(4).split("").map(Number));
  const [tick, setTick] = useState(0);
  const [output, setOutput] = useState("");
  const [period, setPeriod] = useState(null);
  const [running, setRunning] = useState(false);
  const seenRef = useRef(new Map([[defaultSeed(4), 0]]));

  function reset(newN, newPresetIdx, newSeed) {
    const sStr = newSeed.padStart(newN, "0").slice(-newN).replace(/[^01]/g, "0");
    let arr = sStr.split("").map(Number);
    if (arr.every((b) => b === 0)) {
      arr = arr.slice();
      arr[arr.length - 1] = 1;
    }
    setState(arr);
    setTick(0);
    setOutput("");
    setPeriod(null);
    setRunning(false);
    seenRef.current = new Map([[arr.join(""), 0]]);
  }

  useEffect(() => {
    reset(n, presetIdx, seed);
  }, [n, presetIdx]);

  function step() {
    const taps = preset.taps;
    let newMsb = 0;
    for (const pos of taps) newMsb ^= state[n - pos];
    const outBit = state[n - 1];
    const newState = [newMsb, ...state.slice(0, n - 1)];
    const newTick = tick + 1;
    const key = newState.join("");
    let newPeriod = period;
    if (period === null && seenRef.current.has(key)) {
      newPeriod = newTick - seenRef.current.get(key);
    }
    seenRef.current.set(key, newTick);
    setState(newState);
    setOutput((o) => (o.length < 200 ? o + outBit : o.slice(-199) + outBit));
    setTick(newTick);
    if (newPeriod !== null) setPeriod(newPeriod);
  }

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(step, 150);
    return () => clearTimeout(id);
  });

  const W = 480;
  const cellW = Math.min(40, (W - 60) / n);
  const tapSet = new Set(preset.taps);

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>n =</label>
        <select value={n} onChange={(e) => { const nn = +e.target.value; setN(nn); setPresetIdx(0); setSeed(defaultSeed(nn)); }} style={sel}>
          <option value={4}>4</option>
          <option value={8}>8</option>
          <option value={16}>16</option>
        </select>
        <label style={lbl}>polynom:</label>
        <select value={presetIdx} onChange={(e) => setPresetIdx(+e.target.value)} style={{ ...sel, flex: 1, minWidth: 200 }}>
          {PRESETS[n].map((p, i) => <option key={i} value={i}>{p.name}</option>)}
        </select>
      </div>
      <div style={row}>
        <label style={lbl}>seed:</label>
        <input type="text" value={seed} onChange={(e) => setSeed(e.target.value.replace(/[^01]/g, ""))} onBlur={() => reset(n, presetIdx, seed)}
          style={{ ...sel, fontFamily: "var(--font-mono)", width: n <= 4 ? 80 : n <= 8 ? 120 : 200 }} />
        <button style={btn} onClick={step} disabled={running}>krok</button>
        <button style={btn} onClick={() => setRunning((r) => !r)}>{running ? "stop" : "auto"}</button>
        <button style={btn} onClick={() => reset(n, presetIdx, seed)}>reset</button>
      </div>

      <svg viewBox={`0 0 ${W} 130`} style={{ width: "100%", maxWidth: 560, background: "var(--bg-inset)", borderRadius: 6 }}>
        <text x={20} y={22} fontSize="10" fill="var(--text-muted)">stav (r_n ... r_1):</text>
        {state.map((b, i) => {
          const x = 20 + i * cellW;
          const pos = n - i;
          const isTap = tapSet.has(pos);
          return (
            <g key={i}>
              <rect x={x} y={30} width={cellW - 4} height={36} rx={4}
                fill={b ? "var(--accent)" : "var(--bg-card)"}
                stroke={isTap ? "#e07a5f" : "var(--line)"} strokeWidth={isTap ? 1.6 : 1} />
              <text x={x + (cellW - 4) / 2} y={54} fontSize="14" textAnchor="middle"
                fill={b ? "var(--bg-inset)" : "var(--text)"} fontFamily="var(--font-mono)" fontWeight="bold">{b}</text>
              <text x={x + (cellW - 4) / 2} y={80} fontSize="9" textAnchor="middle" fill={isTap ? "#e07a5f" : "var(--text-muted)"} fontFamily="var(--font-mono)">
                r_{pos}{isTap ? " ⊕" : ""}
              </text>
            </g>
          );
        })}
        <text x={20} y={108} fontSize="10" fill="var(--text-muted)">vystup (poslednich 60):</text>
        <text x={20} y={123} fontSize="11" fill="var(--accent)" fontFamily="var(--font-mono)">{output.slice(-60) || "—"}</text>
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        tik = {tick} &nbsp;·&nbsp; perioda: {period === null ? "(zatim nedetekovana)" : <span style={{ color: period === (2 ** n - 1) ? "#81b29a" : "#e07a5f" }}>{period}</span>}
        {period !== null && (
          <span> &nbsp;/&nbsp; max 2^{n}−1 = {2 ** n - 1} {period === (2 ** n - 1) ? "✓ m-sequence" : "(neoptimalni)"}</span>
        )}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Primitivni polynom = max. perioda 2^n−1 = m-sequence. Tapy oznaceny oranzove; novy MSB = XOR oznacenych bitu.
        Nulovy stav je absorpcni — proto LFSR ma 2^n−1 (ne 2^n) stavu.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
