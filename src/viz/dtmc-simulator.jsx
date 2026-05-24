// DTMC simulator — pick a chain, step/run, see t^(k) evolve.
import { useState, useEffect, useRef } from "react";

const W = 540, H = 320;

const PRESETS = {
  protocol: {
    label: "protokol (3 stavy)",
    states: ["start", "error", "deliv."],
    pos: [[140, 160], [280, 70], [280, 250]],
    P: [
      [0.0, 0.5, 0.5],
      [0.5, 0.5, 0.0],
      [0.0, 0.0, 1.0],
    ],
    init: [1, 0, 0],
  },
  periodic3: {
    label: "periodický (d=3)",
    states: ["s₀", "s₁", "s₂"],
    pos: [[140, 160], [280, 90], [280, 230]],
    P: [
      [0.0, 1.0, 0.0],
      [0.0, 0.0, 1.0],
      [1.0, 0.0, 0.0],
    ],
    init: [1, 0, 0],
  },
  ergodic: {
    label: "ergodický (random walk)",
    states: ["A", "B", "C"],
    pos: [[140, 160], [280, 100], [280, 220]],
    P: [
      [0.5, 0.25, 0.25],
      [0.3, 0.5, 0.2],
      [0.2, 0.3, 0.5],
    ],
    init: [1, 0, 0],
  },
  twoclass: {
    label: "dvě rekurentní třídy",
    states: ["s₀", "A", "B₁", "B₂"],
    pos: [[100, 160], [250, 60], [400, 100], [400, 220]],
    P: [
      [0.0, 0.5, 0.3, 0.2],
      [0.0, 1.0, 0.0, 0.0],
      [0.0, 0.0, 0.5, 0.5],
      [0.0, 0.0, 0.5, 0.5],
    ],
    init: [1, 0, 0, 0],
  },
};

function multiply(t, P) {
  // row vector × matrix
  const out = new Float64Array(P.length);
  for (let j = 0; j < P.length; j++) {
    let s = 0;
    for (let i = 0; i < P.length; i++) s += t[i] * P[i][j];
    out[j] = s;
  }
  return out;
}

export default function DtmcSimulator() {
  const [preset, setPreset] = useState("protocol");
  const [k, setK] = useState(0);
  const [t, setT] = useState(PRESETS.protocol.init.slice());
  const [running, setRunning] = useState(false);
  const timer = useRef(null);

  function reset() {
    setRunning(false);
    setK(0);
    setT(PRESETS[preset].init.slice());
  }

  useEffect(() => {
    reset();
  }, [preset]);

  useEffect(() => {
    if (!running) { if (timer.current) clearInterval(timer.current); return; }
    timer.current = setInterval(() => {
      setT((prev) => Array.from(multiply(prev, PRESETS[preset].P)));
      setK((k) => k + 1);
    }, 350);
    return () => clearInterval(timer.current);
  }, [running, preset]);

  function step() {
    setT((prev) => Array.from(multiply(prev, PRESETS[preset].P)));
    setK(k + 1);
  }

  const cur = PRESETS[preset];
  const N = cur.states.length;

  // Bar chart of t^(k) on the right side
  const barX = 50;
  const barY0 = 30;
  const barH = 28;
  const barMaxW = 240;
  // graph area = left half
  const graphArea = { x: 20, y: 20, w: 200, h: 280 };

  // For display, allow viz of graph: nodes + edges
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(PRESETS).map(([k, p]) => (
          <button key={k} onClick={() => setPreset(k)} style={btn(preset === k)}>{p.label}</button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <defs>
          <marker id="dtmcArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L 10 5 L 0 10 z" fill="var(--text-muted)" />
          </marker>
        </defs>

        {/* Graph view */}
        {cur.P.map((row, i) =>
          row.map((p, j) => {
            if (p < 0.001) return null;
            if (i === j) {
              const [x, y] = cur.pos[i];
              return (
                <g key={`${i}-${j}`}>
                  <path d={`M ${x + 20} ${y - 8} C ${x + 50} ${y - 35}, ${x + 50} ${y + 35}, ${x + 20} ${y + 8}`} stroke="var(--line-strong)" fill="none" markerEnd="url(#dtmcArr)" />
                  <text x={x + 56} y={y + 4} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">{p.toFixed(2)}</text>
                </g>
              );
            }
            const [x1, y1] = cur.pos[i];
            const [x2, y2] = cur.pos[j];
            // shorten endpoints
            const dx = x2 - x1, dy = y2 - y1;
            const d = Math.sqrt(dx * dx + dy * dy);
            const r = 26;
            const sx = x1 + (dx / d) * r;
            const sy = y1 + (dy / d) * r;
            const ex = x2 - (dx / d) * r;
            const ey = y2 - (dy / d) * r;
            // offset for bidirectional
            const perpX = -dy / d * 6;
            const perpY = dx / d * 6;
            return (
              <g key={`${i}-${j}`}>
                <path d={`M ${sx + perpX} ${sy + perpY} L ${ex + perpX} ${ey + perpY}`} stroke="var(--line-strong)" fill="none" markerEnd="url(#dtmcArr)" />
                <text x={(sx + ex) / 2 + perpX * 2} y={(sy + ey) / 2 + perpY * 2 + 3} fontSize="9.5" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{p.toFixed(2)}</text>
              </g>
            );
          })
        )}

        {cur.pos.map(([x, y], i) => {
          // Intensity ∝ t[i]
          const intensity = Math.min(1, t[i]);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="22"
                fill="var(--accent)" fillOpacity={0.15 + 0.65 * intensity}
                stroke="var(--accent)" strokeWidth="2" />
              <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fill="var(--text)" fontFamily="var(--font-mono)">{cur.states[i]}</text>
              <text x={x} y={y + 38} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">{t[i].toFixed(3)}</text>
            </g>
          );
        })}

        {/* Bar chart of t^(k) */}
        <text x={barX + 220} y={20} textAnchor="end" fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">t⁽{k}⁾</text>
        <g transform={`translate(${W - 270}, 30)`}>
          {Array.from(t).map((v, i) => (
            <g key={i}>
              <text x="0" y={i * (barH + 6) + 14} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">{cur.states[i]}</text>
              <rect x="46" y={i * (barH + 6)} width={barMaxW} height={barH} fill="var(--bg-inset)" stroke="var(--line)" />
              <rect x="46" y={i * (barH + 6)} width={Math.max(0, v * barMaxW)} height={barH} fill="var(--accent)" opacity="0.6" />
              <text x={46 + Math.min(barMaxW - 4, v * barMaxW + 4)} y={i * (barH + 6) + 18} fontSize="10" fill="var(--text)" fontFamily="var(--font-mono)">{v.toFixed(3)}</text>
            </g>
          ))}
        </g>
      </svg>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={() => setRunning(!running)} style={btn(false)}>{running ? "⏸ pauza" : "▶ běž"}</button>
        <button onClick={step} disabled={running} style={btn(false)}>krok →</button>
        <button onClick={reset} style={btn(false)}>reset</button>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginLeft: 6 }}>
          k = {k} · Σ t = {Array.from(t).reduce((a, b) => a + b, 0).toFixed(4)}
        </span>
      </div>
    </div>
  );
}

function btn(active) { return { padding: "4px 10px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
