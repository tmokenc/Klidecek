// MLE likelihood curve — pick model, drag data, see ℓ(θ) and θ̂_MLE.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 540, H = 280;
const PAD_L = 50, PAD_R = 18, PAD_T = 20, PAD_B = 30;
const PW = W - PAD_L - PAD_R;
const TOP_PH = 50;  // data strip
const PH = H - PAD_T - PAD_B - TOP_PH - 8;

const MODELS = {
  exp: {
    label: "Exp(λ)",
    paramName: "λ",
    paramMin: 0.05, paramMax: 4, paramSteps: 200,
    dataLabel: "x_i ≥ 0",
    sampleStrip: [0, 5],
    initData: [0.4, 0.7, 1.2, 1.8, 2.5],
    loglik: (theta, data) => {
      if (theta <= 0) return -Infinity;
      let s = 0;
      for (const x of data) { if (x < 0) return -Infinity; s += Math.log(theta) - theta * x; }
      return s;
    },
    mle: (data) => 1 / (data.reduce((a, b) => a + b, 0) / data.length),
    mleLabel: (data) => `λ̂ = n/Σxᵢ = 1/x̄ = ${(1 / (data.reduce((a, b) => a + b, 0) / data.length)).toFixed(3)}`,
  },
  bernoulli: {
    label: "Bernoulli A(p)",
    paramName: "p",
    paramMin: 0.01, paramMax: 0.99, paramSteps: 200,
    dataLabel: "x_i ∈ {0, 1}",
    sampleStrip: [0, 1],
    initData: [1, 0, 1, 1, 0, 1, 1, 0],
    loglik: (theta, data) => {
      if (theta <= 0 || theta >= 1) return -Infinity;
      const k = data.reduce((a, b) => a + b, 0);
      const n = data.length;
      return k * Math.log(theta) + (n - k) * Math.log(1 - theta);
    },
    mle: (data) => data.reduce((a, b) => a + b, 0) / data.length,
    mleLabel: (data) => `p̂ = k/n = ${data.reduce((a, b) => a + b, 0)}/${data.length} = ${(data.reduce((a, b) => a + b, 0) / data.length).toFixed(3)}`,
  },
  normal: {
    label: "N(μ, 1)",
    paramName: "μ",
    paramMin: -3, paramMax: 3, paramSteps: 200,
    dataLabel: "x_i ∈ ℝ",
    sampleStrip: [-3, 3],
    initData: [-0.8, 0.3, 1.1, 0.5, -0.2],
    loglik: (theta, data) => {
      let s = 0;
      for (const x of data) s += -0.5 * Math.log(2 * Math.PI) - 0.5 * (x - theta) ** 2;
      return s;
    },
    mle: (data) => data.reduce((a, b) => a + b, 0) / data.length,
    mleLabel: (data) => `μ̂ = x̄ = ${(data.reduce((a, b) => a + b, 0) / data.length).toFixed(3)}`,
  },
};

export default function MleLikelihoodCurve() {
  const [model, setModel] = useState("exp");
  const [data, setData] = useState(MODELS.exp.initData);
  const [dragIdx, setDragIdx] = useState(null);

  const m = MODELS[model];
  const [aMin, aMax] = m.sampleStrip;

  const ll = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= m.paramSteps; i++) {
      const theta = m.paramMin + (i / m.paramSteps) * (m.paramMax - m.paramMin);
      const val = m.loglik(theta, data);
      pts.push([theta, val]);
    }
    return pts;
  }, [model, data, m]);

  const valid = ll.filter(([, y]) => isFinite(y));
  const yMax = Math.max(...valid.map(([, y]) => y));
  const yMin = Math.min(...valid.map(([, y]) => y));
  const yRange = yMax - yMin || 1;

  const toX = (theta) => PAD_L + ((theta - m.paramMin) / (m.paramMax - m.paramMin)) * PW;
  const toY = (y) => PAD_T + TOP_PH + 8 + PH - ((y - yMin) / yRange) * PH;
  const mleTheta = m.mle(data);

  // Strip mapping for data drag
  const dataY = PAD_T + 20;
  const stripToX = (v) => PAD_L + ((v - aMin) / (aMax - aMin)) * PW;
  const xToStrip = (px) => aMin + ((px - PAD_L) / PW) * (aMax - aMin);

  function onMove(e) {
    if (dragIdx === null) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let v = xToStrip(px);
    v = Math.max(aMin, Math.min(aMax, v));
    if (model === "bernoulli") v = v > 0.5 ? 1 : 0;
    const nd = [...data];
    nd[dragIdx] = v;
    setData(nd);
  }

  function addPoint() {
    if (model === "bernoulli") {
      setData([...data, 1]);
    } else {
      setData([...data, (aMin + aMax) / 2]);
    }
  }

  function rmPoint() { if (data.length > 1) setData(data.slice(0, -1)); }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(MODELS).map(([k, mo]) => (
          <button key={k} onClick={() => { setModel(k); setData(mo.initData); }}
            style={{
              padding: "3px 9px", fontSize: 11,
              border: "1px solid " + (model === k ? "var(--accent)" : "var(--line)"),
              background: model === k ? "var(--bg-inset)" : "var(--bg-card)",
              color: model === k ? "var(--accent)" : "var(--text)",
              borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)",
            }}
          >{mo.label}</button>
        ))}
        <button onClick={addPoint} style={btnStyle()}>+ bod</button>
        <button onClick={rmPoint} style={btnStyle()}>− bod</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4, userSelect: "none", touchAction: "none" }}
        onMouseMove={onMove}
        onMouseUp={() => setDragIdx(null)}
        onMouseLeave={() => setDragIdx(null)}>

        {/* Data strip */}
        <text x={PAD_L} y={PAD_T + 8} fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">data {m.dataLabel}</text>
        <line x1={PAD_L} y1={dataY} x2={PAD_L + PW} y2={dataY} stroke="var(--line-strong)" />
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const v = aMin + t * (aMax - aMin);
          return (
            <g key={i}>
              <line x1={stripToX(v)} y1={dataY - 3} x2={stripToX(v)} y2={dataY + 3} stroke="var(--line-strong)" />
              <text x={stripToX(v)} y={dataY + 13} fontSize="9" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v.toFixed(1)}</text>
            </g>
          );
        })}
        {data.map((v, i) => (
          <circle key={i} cx={stripToX(v)} cy={dataY} r="5" fill="var(--accent-line)"
            onMouseDown={() => setDragIdx(i)} style={{ cursor: "ew-resize" }} />
        ))}

        {/* Log-likelihood curve */}
        <text x={PAD_L} y={PAD_T + TOP_PH + 5} fontSize="10.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">log-likelihood ℓ({m.paramName})</text>
        <line x1={PAD_L} y1={PAD_T + TOP_PH + 8 + PH} x2={PAD_L + PW} y2={PAD_T + TOP_PH + 8 + PH} stroke="var(--line-strong)" />
        <line x1={PAD_L} y1={PAD_T + TOP_PH + 8} x2={PAD_L} y2={PAD_T + TOP_PH + 8 + PH} stroke="var(--line-strong)" />

        <path d={ll.filter(([, y]) => isFinite(y)).map(([t, y], i) => `${i ? "L" : "M"} ${toX(t).toFixed(2)} ${toY(y).toFixed(2)}`).join(" ")}
          fill="none" stroke="var(--accent)" strokeWidth="2" />

        {/* MLE marker */}
        {mleTheta >= m.paramMin && mleTheta <= m.paramMax && isFinite(m.loglik(mleTheta, data)) && (
          <>
            <line x1={toX(mleTheta)} y1={PAD_T + TOP_PH + 8} x2={toX(mleTheta)} y2={PAD_T + TOP_PH + 8 + PH} stroke="var(--accent-line)" strokeDasharray="3 3" />
            <circle cx={toX(mleTheta)} cy={toY(m.loglik(mleTheta, data))} r="4" fill="var(--accent-line)" />
            <text x={toX(mleTheta)} y={PAD_T + TOP_PH + 4} textAnchor="middle" fontSize="10" fill="var(--accent-line)" fontFamily="var(--font-mono)">{m.paramName}̂={mleTheta.toFixed(3)}</text>
          </>
        )}

        {/* θ-axis ticks */}
        {[0, 0.5, 1].map((t, i) => {
          const v = m.paramMin + t * (m.paramMax - m.paramMin);
          return <text key={i} x={toX(v)} y={H - PAD_B + 18} fontSize="9.5" textAnchor="middle" fill="var(--text-muted)" fontFamily="var(--font-mono)">{v.toFixed(2)}</text>;
        })}
      </svg>

      <div style={{ fontSize: 11, color: "var(--text)", fontFamily: "var(--font-mono)" }}>
        n = {data.length} · {m.mleLabel(data)}
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>
        Přetáhněte body na ose, sledujte tvar ℓ(θ) a posun maxima. Přidání bodu zužuje ℓ — vyšší Fisherova informace.
      </div>
    </div>
  );
}

function btnStyle() {
  return { padding: "3px 9px", fontSize: 11, border: "1px solid var(--line)", background: "var(--bg-card)", color: "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" };
}
