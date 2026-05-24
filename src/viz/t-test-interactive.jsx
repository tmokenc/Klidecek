// Interactive t-test — drag two sample clouds, compute T, p-value, decision.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 320;
const PAD_L = 40, PAD_R = 16, PAD_T = 16, PAD_B = 36;
const STRIP_H = 60;
const PW = W - PAD_L - PAD_R;
const PH = H - PAD_T - PAD_B - STRIP_H - 12;

const MODES = {
  "one":    { label: "jednovýběrový (μ vs. μ₀)", paired: false, twoSamples: false },
  "two":    { label: "dvouvýběrový (Welch)", paired: false, twoSamples: true },
  "paired": { label: "párový (X−Y)", paired: true, twoSamples: true },
};

const DEFAULT_X = [-1.0, -0.3, 0.4, 1.1, -0.8, 0.0, 0.6, -0.5];
const DEFAULT_Y = [0.4, 1.2, 0.9, 1.8, 0.6, 1.3, 0.2, 1.6];

export default function TTestInteractive() {
  const [mode, setMode] = useState("two");
  const [side, setSide] = useState("two");  // two, right, left
  const [mu0, setMu0] = useState(0);
  const [alpha, setAlpha] = useState(0.05);
  const [X, setX] = useState(DEFAULT_X);
  const [Y, setY] = useState(DEFAULT_Y);
  const [drag, setDrag] = useState(null);

  const m = MODES[mode];

  // Stats
  const meanVar = (arr) => {
    const n = arr.length;
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    const v = arr.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1 || 1);
    return { n, mean, var: v };
  };

  const { stat, df, pval, ciLo, ciHi, reject, formula } = useMemo(() => {
    const xs = meanVar(X);
    if (!m.twoSamples) {
      // one-sample
      const se = Math.sqrt(xs.var / xs.n);
      const t = (xs.mean - mu0) / se;
      const df = xs.n - 1;
      let p;
      if (side === "two") p = 2 * (1 - S.tCDF(Math.abs(t), df));
      else if (side === "right") p = 1 - S.tCDF(t, df);
      else p = S.tCDF(t, df);
      const tc = S.tQuantile(1 - alpha / 2, df);
      return {
        stat: t, df, pval: p,
        ciLo: xs.mean - tc * se, ciHi: xs.mean + tc * se,
        reject: side === "two" ? Math.abs(t) > tc : (side === "right" ? t > S.tQuantile(1 - alpha, df) : t < -S.tQuantile(1 - alpha, df)),
        formula: `T = (X̄ − μ₀) / (S/√n) = (${xs.mean.toFixed(3)} − ${mu0}) / (${Math.sqrt(xs.var).toFixed(3)}/√${xs.n})`,
      };
    } else if (m.paired) {
      const D = X.map((x, i) => x - Y[i]);
      const ds = meanVar(D);
      const se = Math.sqrt(ds.var / ds.n);
      const t = ds.mean / se;
      const df = ds.n - 1;
      let p;
      if (side === "two") p = 2 * (1 - S.tCDF(Math.abs(t), df));
      else if (side === "right") p = 1 - S.tCDF(t, df);
      else p = S.tCDF(t, df);
      const tc = S.tQuantile(1 - alpha / 2, df);
      return {
        stat: t, df, pval: p,
        ciLo: ds.mean - tc * se, ciHi: ds.mean + tc * se,
        reject: side === "two" ? Math.abs(t) > tc : (side === "right" ? t > S.tQuantile(1 - alpha, df) : t < -S.tQuantile(1 - alpha, df)),
        formula: `T = D̄ / (S_D/√n), D̄ = ${ds.mean.toFixed(3)}, S_D = ${Math.sqrt(ds.var).toFixed(3)}`,
      };
    } else {
      // Welch two-sample
      const ys = meanVar(Y);
      const se = Math.sqrt(xs.var / xs.n + ys.var / ys.n);
      const t = (xs.mean - ys.mean) / se;
      const df = (xs.var / xs.n + ys.var / ys.n) ** 2 /
                 ((xs.var / xs.n) ** 2 / (xs.n - 1) + (ys.var / ys.n) ** 2 / (ys.n - 1));
      let p;
      if (side === "two") p = 2 * (1 - S.tCDF(Math.abs(t), df));
      else if (side === "right") p = 1 - S.tCDF(t, df);
      else p = S.tCDF(t, df);
      const tc = S.tQuantile(1 - alpha / 2, df);
      return {
        stat: t, df, pval: p,
        ciLo: (xs.mean - ys.mean) - tc * se, ciHi: (xs.mean - ys.mean) + tc * se,
        reject: side === "two" ? Math.abs(t) > tc : (side === "right" ? t > S.tQuantile(1 - alpha, df) : t < -S.tQuantile(1 - alpha, df)),
        formula: `T = (X̄ − Ȳ) / √(S₁²/n₁ + S₂²/n₂), df ≈ ${df.toFixed(1)}`,
      };
    }
  }, [X, Y, mode, mu0, alpha, side, m]);

  // Plot
  const xMin = -3, xMax = 3;
  const toX = (v) => PAD_L + ((v - xMin) / (xMax - xMin)) * PW;
  const stripY1 = PAD_T + 15;
  const stripY2 = PAD_T + 45;

  function onMove(e) {
    if (!drag) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let v = xMin + ((px - PAD_L) / PW) * (xMax - xMin);
    v = Math.max(xMin, Math.min(xMax, v));
    if (drag.set === "X") {
      const arr = [...X]; arr[drag.i] = v; setX(arr);
    } else {
      const arr = [...Y]; arr[drag.i] = v; setY(arr);
    }
  }

  // T distribution curve (df from stats)
  const tCurve = [];
  const tMax = Math.max(6, Math.abs(stat) + 2);
  for (let i = -100; i <= 100; i++) {
    const tv = (i / 100) * tMax;
    tCurve.push([tv, S.tPDF(tv, df)]);
  }
  const tYMax = S.tPDF(0, df) * 1.15;
  const tToX = (tv) => PAD_L + ((tv + tMax) / (2 * tMax)) * PW;
  const tY0 = PAD_T + STRIP_H + 8;
  const tToY = (y) => tY0 + PH - (y / tYMax) * PH;

  const tc = S.tQuantile(1 - alpha / 2, df);
  const tcR = S.tQuantile(1 - alpha, df);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(MODES).map(([k, mo]) => (
          <button key={k} onClick={() => setMode(k)} style={btn(mode === k)}>{mo.label}</button>
        ))}
        <span style={{ width: 12 }} />
        <button onClick={() => setSide("two")} style={btn(side === "two")}>↔</button>
        <button onClick={() => setSide("right")} style={btn(side === "right")}>→</button>
        <button onClick={() => setSide("left")} style={btn(side === "left")}>←</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4, userSelect: "none", touchAction: "none" }}
        onMouseMove={onMove}
        onMouseUp={() => setDrag(null)}
        onMouseLeave={() => setDrag(null)}>

        {/* X strip */}
        <text x={PAD_L} y={stripY1 - 4} fontSize="10" fill="var(--accent)" fontFamily="var(--font-mono)">vzorek X (n={X.length})</text>
        <line x1={PAD_L} y1={stripY1} x2={PAD_L + PW} y2={stripY1} stroke="var(--line-strong)" />
        {X.map((v, i) => (
          <circle key={i} cx={toX(v)} cy={stripY1} r="5" fill="var(--accent)" opacity="0.7"
            onMouseDown={() => setDrag({ set: "X", i })} style={{ cursor: "ew-resize" }} />
        ))}
        {!m.twoSamples && <line x1={toX(mu0)} y1={stripY1 - 6} x2={toX(mu0)} y2={stripY1 + 6} stroke="var(--text)" strokeWidth="2" />}
        {!m.twoSamples && <text x={toX(mu0)} y={stripY1 - 8} fontSize="10" textAnchor="middle" fill="var(--text)" fontFamily="var(--font-mono)">μ₀={mu0}</text>}

        {/* Y strip */}
        {m.twoSamples && (
          <>
            <text x={PAD_L} y={stripY2 - 4} fontSize="10" fill="var(--accent-line)" fontFamily="var(--font-mono)">vzorek Y (n={Y.length})</text>
            <line x1={PAD_L} y1={stripY2} x2={PAD_L + PW} y2={stripY2} stroke="var(--line-strong)" />
            {Y.map((v, i) => (
              <circle key={i} cx={toX(v)} cy={stripY2} r="5" fill="var(--accent-line)" opacity="0.7"
                onMouseDown={() => setDrag({ set: "Y", i })} style={{ cursor: "ew-resize" }} />
            ))}
          </>
        )}

        {/* axis */}
        {[-3, -2, -1, 0, 1, 2, 3].map((v) => (
          <text key={v} x={toX(v)} y={stripY2 + 16} fontSize="9" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v}</text>
        ))}

        {/* t distribution curve */}
        <line x1={PAD_L} y1={tY0 + PH} x2={PAD_L + PW} y2={tY0 + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={tY0} x2={PAD_L} y2={tY0 + PH} stroke="var(--line-strong)" />

        {/* Rejection region shading */}
        {(() => {
          if (side === "two") {
            const lhs = tCurve.filter(([t]) => t <= -tc);
            const rhs = tCurve.filter(([t]) => t >= tc);
            return (
              <>
                {lhs.length > 1 && <path d={`M ${tToX(-tMax)} ${tY0 + PH} ${lhs.map(([t, y]) => `L ${tToX(t).toFixed(2)} ${tToY(y).toFixed(2)}`).join(" ")} L ${tToX(-tc).toFixed(2)} ${tY0 + PH} Z`} fill="var(--accent)" opacity="0.25" />}
                {rhs.length > 1 && <path d={`M ${tToX(tc).toFixed(2)} ${tY0 + PH} ${rhs.map(([t, y]) => `L ${tToX(t).toFixed(2)} ${tToY(y).toFixed(2)}`).join(" ")} L ${tToX(tMax).toFixed(2)} ${tY0 + PH} Z`} fill="var(--accent)" opacity="0.25" />}
              </>
            );
          } else if (side === "right") {
            const rhs = tCurve.filter(([t]) => t >= tcR);
            return rhs.length > 1 && <path d={`M ${tToX(tcR).toFixed(2)} ${tY0 + PH} ${rhs.map(([t, y]) => `L ${tToX(t).toFixed(2)} ${tToY(y).toFixed(2)}`).join(" ")} L ${tToX(tMax).toFixed(2)} ${tY0 + PH} Z`} fill="var(--accent)" opacity="0.25" />;
          } else {
            const lhs = tCurve.filter(([t]) => t <= -tcR);
            return lhs.length > 1 && <path d={`M ${tToX(-tMax)} ${tY0 + PH} ${lhs.map(([t, y]) => `L ${tToX(t).toFixed(2)} ${tToY(y).toFixed(2)}`).join(" ")} L ${tToX(-tcR).toFixed(2)} ${tY0 + PH} Z`} fill="var(--accent)" opacity="0.25" />;
          }
        })()}

        <path d={tCurve.map(([t, y], i) => `${i ? "L" : "M"} ${tToX(t).toFixed(2)} ${tToY(y).toFixed(2)}`).join(" ")} fill="none" stroke="var(--accent)" strokeWidth="1.8" />

        {/* observed T */}
        {Math.abs(stat) < tMax && (
          <>
            <line x1={tToX(stat)} y1={tY0} x2={tToX(stat)} y2={tY0 + PH} stroke="var(--accent-line)" strokeWidth="2" />
            <circle cx={tToX(stat)} cy={tToY(S.tPDF(stat, df))} r="4" fill="var(--accent-line)" />
            <text x={tToX(stat)} y={tY0 - 2} textAnchor="middle" fontSize="10.5" fill="var(--accent-line)" fontFamily="var(--font-mono)">T={stat.toFixed(3)}</text>
          </>
        )}

        {/* t axis labels */}
        {[-tMax, -tc, 0, tc, tMax].map((v, i) => (
          <text key={i} x={tToX(v)} y={tY0 + PH + 14} fontSize="9" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v.toFixed(2)}</text>
        ))}
      </svg>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
        {!m.twoSamples && (
          <label style={lab()}>μ₀ = {mu0.toFixed(2)}
            <input type="range" min={-2} max={2} step={0.05} value={mu0} onChange={(e) => setMu0(+e.target.value)} style={{ width: "100%" }} />
          </label>
        )}
        <label style={lab()}>α = {alpha.toFixed(3)}
          <input type="range" min={0.001} max={0.2} step={0.001} value={alpha} onChange={(e) => setAlpha(+e.target.value)} style={{ width: "100%" }} />
        </label>
      </div>

      <div style={{ fontSize: 10.5, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        {formula}<br />
        df = {df.toFixed(2)} · T = <strong>{stat.toFixed(3)}</strong> · p-hodnota = <strong style={{ color: reject ? "var(--accent-line)" : "var(--text)" }}>{pval.toFixed(4)}</strong>
        {" "}· {reject ? <strong style={{ color: "var(--accent-line)" }}>zamítáme H₀</strong> : <span>nezamítáme H₀</span>}<br />
        95% CI rozdílu/průměru: [{ciLo.toFixed(3)}, {ciHi.toFixed(3)}]
      </div>
    </div>
  );
}

function btn(active) { return { padding: "3px 9px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function lab() { return { flex: "1 1 180px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
