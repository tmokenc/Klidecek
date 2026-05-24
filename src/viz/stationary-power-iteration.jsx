// Power iteration on a DTMC — show convergence to π, governed by spectral gap.
import { useState, useEffect, useRef } from "react";

const W = 540, H = 280;
const PAD_L = 50, PAD_R = 14, PAD_T = 20, PAD_B = 32;
const PW = W - PAD_L - PAD_R, PH = H - PAD_T - PAD_B;

// Two-state DTMC P = [[1-a, a], [b, 1-b]] with stationary π = (b/(a+b), a/(a+b))
// Spectral gap = 1 - |1 - a - b|
export default function StationaryPowerIteration() {
  const [a, setA] = useState(0.3);
  const [b, setB] = useState(0.5);
  const [k, setK] = useState(0);
  const [history, setHistory] = useState([[1, 0]]);
  const [running, setRunning] = useState(false);
  const timer = useRef(null);

  function P(t) {
    return [t[0] * (1 - a) + t[1] * b, t[0] * a + t[1] * (1 - b)];
  }

  useEffect(() => {
    setK(0);
    setHistory([[1, 0]]);
    setRunning(false);
  }, [a, b]);

  useEffect(() => {
    if (!running) { if (timer.current) clearInterval(timer.current); return; }
    timer.current = setInterval(() => {
      setHistory((h) => {
        if (h.length > 100) return h;
        return [...h, P(h[h.length - 1])];
      });
      setK((k) => k + 1);
    }, 250);
    return () => clearInterval(timer.current);
  }, [running, a, b]);

  const stationary = [b / (a + b), a / (a + b)];
  const lambda2 = Math.abs(1 - a - b);  // second eigenvalue magnitude
  const spectralGap = 1 - lambda2;

  // Plot |t^(k) - π|_∞ over k on log scale
  const errs = history.map((t) => Math.max(Math.abs(t[0] - stationary[0]), Math.abs(t[1] - stationary[1])));
  const N = errs.length;
  const xMax = Math.max(20, N);
  const yMaxL = 0;  // log10 max
  const yMinL = -10;
  const safeLog = (v) => Math.max(yMinL, Math.log10(Math.max(v, 1e-12)));
  const toX = (i) => PAD_L + (i / xMax) * PW;
  const toY = (logv) => PAD_T + PH - ((logv - yMinL) / (yMaxL - yMinL)) * PH;

  // Theoretical: error ~ λ₂^k
  const theoErr = (i) => safeLog(Math.pow(lambda2, i));
  const theoPath = [];
  for (let i = 0; i < xMax; i += 0.5) theoPath.push([i, theoErr(i)]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <line x1={PAD_L} y1={PAD_T + PH} x2={PAD_L + PW} y2={PAD_T + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + PH} stroke="var(--line-strong)" />

        {/* Theoretical convergence rate */}
        <path d={theoPath.map(([x, y], i) => `${i ? "L" : "M"} ${toX(x).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ")} fill="none" stroke="var(--accent-line)" strokeWidth="1.5" strokeDasharray="4 3" />

        {/* Empirical errors */}
        <path d={errs.map((e, i) => `${i ? "L" : "M"} ${toX(i).toFixed(2)} ${toY(safeLog(e)).toFixed(2)}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2" />
        {errs.map((e, i) => <circle key={i} cx={toX(i)} cy={toY(safeLog(e))} r="2" fill="var(--accent)" />)}

        {/* axes */}
        {[0, -2, -4, -6, -8, -10].map((l) => (
          <g key={l}>
            <line x1={PAD_L - 3} y1={toY(l)} x2={PAD_L} y2={toY(l)} stroke="var(--line-strong)" />
            <text x={PAD_L - 6} y={toY(l) + 3} fontSize="9.5" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">10^{l}</text>
          </g>
        ))}
        {[0, 25, 50, 75, 100].map((i) => i <= xMax && (
          <g key={i}>
            <line x1={toX(i)} y1={PAD_T + PH} x2={toX(i)} y2={PAD_T + PH + 4} stroke="var(--line-strong)" />
            <text x={toX(i)} y={PAD_T + PH + 14} fontSize="9.5" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{i}</text>
          </g>
        ))}
        <text x={PAD_L + PW} y={H - 6} fontSize="10" textAnchor="end" fill="var(--text-muted)" fontFamily="var(--font-mono)">k →</text>
        <text x={20} y={PAD_T - 4} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">‖t⁽ᵏ⁾ − π‖∞</text>

        {/* legend */}
        <g transform={`translate(${PAD_L + 20}, ${PAD_T + 4})`} fontSize="10" fontFamily="var(--font-mono)">
          <line x1="0" y1="6" x2="14" y2="6" stroke="var(--accent)" strokeWidth="2" />
          <text x="18" y="9" fill="var(--accent)">empirické</text>
          <line x1="100" y1="6" x2="114" y2="6" stroke="var(--accent-line)" strokeWidth="1.5" strokeDasharray="4 3" />
          <text x="118" y="9" fill="var(--accent-line)">teorie ∼ λ₂^k</text>
        </g>
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        <label style={lab()}>a = P(0→1) = {a.toFixed(2)}
          <input type="range" min={0.05} max={0.95} step={0.01} value={a} onChange={(e) => setA(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>b = P(1→0) = {b.toFixed(2)}
          <input type="range" min={0.05} max={0.95} step={0.01} value={b} onChange={(e) => setB(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <button onClick={() => setRunning(!running)} style={btn(false)}>{running ? "⏸" : "▶"}</button>
        <button onClick={() => { setK(0); setHistory([[1, 0]]); }} style={btn(false)}>reset</button>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        Stacionární distribuce π = (b/(a+b), a/(a+b)) = (<strong>{stationary[0].toFixed(3)}</strong>, <strong>{stationary[1].toFixed(3)}</strong>)
        <br />Druhé vlastní číslo |λ₂| = |1 − a − b| = <strong>{lambda2.toFixed(3)}</strong> · spektrální mezera 1 − |λ₂| = <strong>{spectralGap.toFixed(3)}</strong> · krok {k}
        <br />Větší spektrální mezera ⇒ rychlejší konvergence (geometrická rate). a+b → 1 zrychluje; a+b → 0 nebo → 2 zpomaluje.
      </div>
    </div>
  );
}

function btn(active) { return { padding: "4px 10px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function lab() { return { flex: "1 1 200px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
