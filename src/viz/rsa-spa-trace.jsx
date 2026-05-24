// SPA na RSA square-and-multiply: user precte sekvenci square (kratky peak)
// vs. square+multiply (dlouhy peak) z power trace a tipne bity klice.
import { useMemo, useState } from "react";

function bits8(n) {
  const out = [];
  for (let i = 7; i >= 0; i--) out.push((n >> i) & 1);
  return out;
}

export default function RsaSpaTrace() {
  const [secret, setSecret] = useState(0xa5); // 10100101
  const truth = useMemo(() => bits8(secret), [secret]);
  const [guess, setGuess] = useState(() => new Array(8).fill(0));
  const [revealed, setRevealed] = useState(false);

  function reset() {
    setGuess(new Array(8).fill(0));
    setRevealed(false);
  }

  function randomSecret() {
    setSecret(Math.floor(Math.random() * 256));
    reset();
  }

  // Build trace data: for each of 8 bits, a "square" peak + optional "multiply" peak.
  // Visualize as polyline y(t).
  const W = 520, H = 140, tileW = (W - 40) / 8;
  const points = [];
  truth.forEach((b, i) => {
    const x0 = 20 + i * tileW;
    // baseline
    points.push([x0, H - 18]);
    // square peak
    points.push([x0 + tileW * 0.15, H - 70]);
    points.push([x0 + tileW * 0.3, H - 30]);
    // multiply peak if b==1
    if (b === 1) {
      points.push([x0 + tileW * 0.5, H - 70]);
      points.push([x0 + tileW * 0.65, H - 30]);
    }
    points.push([x0 + tileW - 4, H - 18]);
  });
  const d = points.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");

  const correctCount = truth.reduce((a, _, i) => a + (truth[i] === guess[i] ? 1 : 0), 0);

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>tajny exponent d (8 bitu):</label>
        <input type="number" min={0} max={255} value={secret} onChange={(e) => { setSecret(Math.max(0, Math.min(255, +e.target.value || 0))); reset(); }}
          style={{ ...sel, width: 80, fontFamily: "var(--font-mono)" }} />
        <button style={btn} onClick={randomSecret}>nahodne</button>
        <button style={btn} onClick={reset}>reset tip</button>
        <button style={btn} onClick={() => setRevealed(true)} disabled={revealed}>odhal</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 580, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* vertical separators */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={20 + i * tileW} y1={20} x2={20 + i * tileW} y2={H - 10} stroke="var(--line)" strokeWidth="0.5" strokeDasharray="2 3" />
        ))}
        {/* bit position labels */}
        {Array.from({ length: 8 }).map((_, i) => (
          <text key={i} x={20 + i * tileW + tileW / 2} y={16} fontSize="10" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">d[{7 - i}]</text>
        ))}
        <path d={d} fill="none" stroke="var(--accent)" strokeWidth="1.6" />
      </svg>

      <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
        {Array.from({ length: 8 }).map((_, i) => {
          const t = truth[i], g = guess[i];
          const correct = revealed ? t === g : null;
          return (
            <button key={i} onClick={() => setGuess(guess.map((x, j) => j === i ? 1 - x : x))}
              style={{
                width: 48, height: 38,
                background: g === 1 ? "var(--accent)" : "var(--bg-inset)",
                color: g === 1 ? "var(--bg-inset)" : "var(--text)",
                border: revealed ? `2px solid ${correct ? "#81b29a" : "#e07a5f"}` : "1px solid var(--line)",
                borderRadius: 5, fontFamily: "var(--font-mono)", fontSize: 14, cursor: "pointer",
              }}>
              {g}
              {revealed && <div style={{ fontSize: 8, marginTop: -2 }}>{correct ? "OK" : t}</div>}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", textAlign: "center" }}>
        klikni na tlacitka aby tipnul kazdy bit (0 = jen square, 1 = square+multiply).
        {revealed && (
          <div style={{ marginTop: 4 }}>
            spravne: <b style={{ color: correctCount === 8 ? "#81b29a" : "#e07a5f" }}>{correctCount} / 8</b>
            &nbsp;·&nbsp; tip = {guess.join("")} &nbsp;·&nbsp; truth = {truth.join("")}
          </div>
        )}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Pro kazdy bit klice d se vzdy provede <b>square</b> (kratky peak); pokud d[i]=1, navic <b>multiply</b>
        (druhy peak ve stejnem tile). Z jedineho power trace lze precist cely klic; proto SPA na nezabezpecene
        smart card extrahuje 1024-bit RSA exponent v sekundach. Obrana: Montgomery ladder (konstantni sekvence S+M).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
