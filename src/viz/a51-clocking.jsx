// A5/1 majority clocking — 3 LFSRs (R1=19b, R2=22b, R3=23b) s irregularnim
// clockingem. Tapy a clocking biti dle skutecne specifikace GSM.
import { useEffect, useRef, useState } from "react";

// R1: 19 bits, polynom x^19 + x^18 + x^17 + x^14 + 1; clock bit = pozice 8 (0-indexed)
const R1_TAPS = [18, 17, 16, 13]; // 0-indexed bit positions feeding new MSB
const R1_CLK = 8;
// R2: 22 bits, polynom x^22 + x^21 + 1; clock bit = pozice 10
const R2_TAPS = [21, 20];
const R2_CLK = 10;
// R3: 23 bits, polynom x^23 + x^22 + x^21 + x^8 + 1; clock bit = pozice 10
const R3_TAPS = [22, 21, 20, 7];
const R3_CLK = 10;

function newReg(len) {
  const a = new Array(len).fill(0);
  a[0] = 1;
  return a;
}

function clockReg(reg, taps) {
  // reg[0] = LSB (output bit), reg[len-1] = MSB-receiving bit
  const fb = taps.reduce((acc, t) => acc ^ reg[t], 0);
  const out = reg[0];
  const next = reg.slice(1);
  next.push(fb);
  return { next, out };
}

export default function A51Clocking() {
  const [r1, setR1] = useState(() => newReg(19));
  const [r2, setR2] = useState(() => newReg(22));
  const [r3, setR3] = useState(() => newReg(23));
  const [tick, setTick] = useState(0);
  const [keystream, setKeystream] = useState("");
  const [shifts, setShifts] = useState({ r1: 0, r2: 0, r3: 0 });
  const [running, setRunning] = useState(false);
  const [lastM, setLastM] = useState(null);

  function reset() {
    setR1(newReg(19));
    setR2(newReg(22));
    setR3(newReg(23));
    setTick(0);
    setKeystream("");
    setShifts({ r1: 0, r2: 0, r3: 0 });
    setLastM(null);
    setRunning(false);
  }

  function step() {
    const c1 = r1[R1_CLK], c2 = r2[R2_CLK], c3 = r3[R3_CLK];
    const m = (c1 + c2 + c3) >= 2 ? 1 : 0; // majority
    let nr1 = r1, nr2 = r2, nr3 = r3;
    let s1 = shifts.r1, s2 = shifts.r2, s3 = shifts.r3;
    if (c1 === m) { nr1 = clockReg(r1, R1_TAPS).next; s1++; }
    if (c2 === m) { nr2 = clockReg(r2, R2_TAPS).next; s2++; }
    if (c3 === m) { nr3 = clockReg(r3, R3_TAPS).next; s3++; }
    // keystream bit = XOR of MSBs of all three (after potential clocking)
    const ks = nr1[18] ^ nr2[21] ^ nr3[22];
    setR1(nr1); setR2(nr2); setR3(nr3);
    setTick(tick + 1);
    setKeystream((k) => (k.length < 200 ? k + ks : k.slice(-199) + ks));
    setShifts({ r1: s1, r2: s2, r3: s3 });
    setLastM(m);
  }

  useEffect(() => {
    if (!running) return;
    const id = setTimeout(step, 80);
    return () => clearTimeout(id);
  });

  const W = 520, H = 230;
  const RegRow = ({ reg, label, clkPos, y, shifted }) => {
    const len = reg.length;
    const cellW = (W - 100) / len;
    const c1 = reg[clkPos];
    return (
      <g>
        <text x={8} y={y + 14} fontSize="10" fill={shifted ? "#81b29a" : "var(--text-muted)"} fontFamily="var(--font-mono)">{label}</text>
        {reg.slice().reverse().map((b, i) => {
          const realIdx = len - 1 - i;
          const x = 86 + i * cellW;
          const isClk = realIdx === clkPos;
          return (
            <rect key={i} x={x} y={y} width={cellW - 0.5} height={22}
              fill={b ? "var(--accent)" : "var(--bg-card)"}
              stroke={isClk ? "#e07a5f" : "var(--line)"} strokeWidth={isClk ? 1.4 : 0.6} />
          );
        })}
        <text x={86 + (len - 1 - clkPos) * cellW + cellW / 2} y={y - 4} fontSize="9" textAnchor="middle" fill="#e07a5f" fontFamily="var(--font-mono)">C={c1}</text>
        <text x={W - 8} y={y + 14} fontSize="10" textAnchor="end" fill={shifted ? "#81b29a" : "var(--text-muted)"} fontFamily="var(--font-mono)">
          {shifted ? "↻" : "—"} {shifts[label.toLowerCase()]}×
        </text>
      </g>
    );
  };

  // determine which registers shifted in this tick: compute clocking outcome
  const c1 = r1[R1_CLK], c2 = r2[R2_CLK], c3 = r3[R3_CLK];
  const m = (c1 + c2 + c3) >= 2 ? 1 : 0;
  const willShift = { r1: c1 === m, r2: c2 === m, r3: c3 === m };

  return (
    <div style={ctn}>
      <div style={row}>
        <button style={btn} onClick={step} disabled={running}>krok</button>
        <button style={btn} onClick={() => setRunning((r) => !r)}>{running ? "stop" : "auto"}</button>
        <button style={btn} onClick={reset}>reset</button>
        <span style={lbl}>tik: {tick}</span>
        <span style={lbl}>nasledujici majority m = ({c1},{c2},{c3}) → <b style={{ color: "#e07a5f" }}>{m}</b></span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 580, background: "var(--bg-inset)", borderRadius: 6 }}>
        <RegRow reg={r1} label="R1" clkPos={R1_CLK} y={28} shifted={willShift.r1} />
        <RegRow reg={r2} label="R2" clkPos={R2_CLK} y={78} shifted={willShift.r2} />
        <RegRow reg={r3} label="R3" clkPos={R3_CLK} y={128} shifted={willShift.r3} />
        <text x={W/2} y={176} fontSize="11" textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)">
          keystream bit = MSB(R1) ⊕ MSB(R2) ⊕ MSB(R3)
        </text>
        <text x={8} y={200} fontSize="10" fill="var(--text-muted)">poslednich 80 bitu:</text>
        <text x={8} y={216} fontSize="11" fill="var(--accent)" fontFamily="var(--font-mono)">{keystream.slice(-80) || "—"}</text>
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Po n tikani se kazdy registr posunul ≈ 75 % casu. Vsimni si, ze pri kazdem tiku se posunou 2 nebo 3 registry (ne 1 ani 0).
        Tapy: R1 = [18,17,16,13], R2 = [21,20], R3 = [22,21,20,7]; clocking biti C1=8, C2=10, C3=10 (vse 0-indexed).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
