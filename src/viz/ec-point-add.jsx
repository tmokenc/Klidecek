// Sčítání bodů na eliptické křivce (y² = x³ + ax + b nad ℝ pro geometrii).
// Klikni dva body → spočti přímku → třetí průsečík → zrcadli → R.
// Toggle "double": tečna v P → R = 2P.
import { useMemo, useState } from "react";

function curveY(x, a, b) {
  const rhs = x * x * x + a * x + b;
  if (rhs < 0) return null;
  return Math.sqrt(rhs);
}

function ptAdd(P, Q, a) {
  if (!P) return Q; if (!Q) return P;
  const eps = 1e-9;
  let lambda;
  if (Math.abs(P.x - Q.x) < eps) {
    if (Math.abs(P.y + Q.y) < eps) return null; // ∞
    lambda = (3 * P.x * P.x + a) / (2 * P.y); // doubling
  } else {
    lambda = (Q.y - P.y) / (Q.x - P.x);
  }
  const x3 = lambda * lambda - P.x - Q.x;
  const y3 = lambda * (P.x - x3) - P.y;
  return { x: x3, y: y3 };
}

const CURVES = {
  "y² = x³ − x + 1": { a: -1, b: 1 },
  "y² = x³ − 2x + 2": { a: -2, b: 2 },
  "y² = x³ + 0x − 1": { a: 0, b: -1 },
};

export default function EcPointAdd() {
  const [curveKey, setCurveKey] = useState(Object.keys(CURVES)[0]);
  const { a, b } = CURVES[curveKey];
  const [Px, setPx] = useState(-1.0);
  const [Qx, setQx] = useState(0.5);
  const [doubling, setDoubling] = useState(false);

  const P = useMemo(() => {
    const y = curveY(Px, a, b);
    return y !== null ? { x: Px, y } : null;
  }, [Px, a, b]);
  const Q = useMemo(() => {
    if (doubling) return P;
    const y = curveY(Qx, a, b);
    return y !== null ? { x: Qx, y } : null;
  }, [Qx, a, b, doubling, P]);

  const R = useMemo(() => P && Q ? ptAdd(P, Q, a) : null, [P, Q, a]);
  const negR = R ? { x: R.x, y: -R.y } : null;

  // Plot: x ∈ [-2.5, 2.5], y ∈ [-3, 3]
  // PAD: vertical headroom so off-range points/labels (R far off-curve) aren't clipped.
  const PAD = 48;
  const W = 480, H = 320, VH = H + 2 * PAD;
  const xMin = -2.5, xMax = 2.5, yMin = -3, yMax = 3;
  const xToPx = (x) => ((x - xMin) / (xMax - xMin)) * W;
  const yToPx = (y) => PAD + H - ((y - yMin) / (yMax - yMin)) * H;

  // Trace curve
  const path = useMemo(() => {
    const pts = [];
    for (let x = xMin; x <= xMax; x += 0.01) {
      const y = curveY(x, a, b);
      if (y !== null) pts.push({ x, y, branch: 1 });
    }
    const pts2 = pts.map((p) => ({ ...p, y: -p.y, branch: -1 }));
    return [...pts, ...pts2];
  }, [a, b]);

  const path1 = path.filter((p) => p.branch === 1);
  const path2 = path.filter((p) => p.branch === -1);

  function ptsToD(pts) {
    if (!pts.length) return "";
    return "M" + pts.map((p) => `${xToPx(p.x).toFixed(1)},${yToPx(p.y).toFixed(1)}`).join(" L");
  }

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>Křivka:</label>
        <select value={curveKey} onChange={(e) => setCurveKey(e.target.value)} style={sel}>
          {Object.keys(CURVES).map((k) => <option key={k}>{k}</option>)}
        </select>
        <label style={{ ...lbl, display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={doubling} onChange={(e) => setDoubling(e.target.checked)} />
          zdvojnásobit (R = 2P)
        </label>
      </div>
      <div style={row}>
        <label style={lbl}>x_P = {Px.toFixed(2)}</label>
        <input type="range" min={-2.4} max={2.4} step={0.05} value={Px} onChange={(e) => setPx(+e.target.value)} style={{ flex: 1, minWidth: 140 }} />
        {!doubling && (
          <>
            <label style={lbl}>x_Q = {Qx.toFixed(2)}</label>
            <input type="range" min={-2.4} max={2.4} step={0.05} value={Qx} onChange={(e) => setQx(+e.target.value)} style={{ flex: 1, minWidth: 140 }} />
          </>
        )}
      </div>

      <svg viewBox={`0 0 ${W} ${VH}`} style={{ width: "100%", maxWidth: 560, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* axes */}
        <line x1={0} y1={yToPx(0)} x2={W} y2={yToPx(0)} stroke="var(--line)" />
        <line x1={xToPx(0)} y1={PAD} x2={xToPx(0)} y2={PAD + H} stroke="var(--line)" />

        {/* curve */}
        <path d={ptsToD(path1)} fill="none" stroke="var(--accent)" strokeWidth="1.6" />
        <path d={ptsToD(path2)} fill="none" stroke="var(--accent)" strokeWidth="1.6" />

        {/* line through P,Q (or tangent) */}
        {P && Q && R && (() => {
          const slope = (doubling || Math.abs(P.x - Q.x) < 1e-9)
            ? (3 * P.x * P.x + a) / (2 * P.y)
            : (Q.y - P.y) / (Q.x - P.x);
          const intercept = P.y - slope * P.x;
          const x1 = xMin, y1 = slope * x1 + intercept;
          const x2 = xMax, y2 = slope * x2 + intercept;
          return <line x1={xToPx(x1)} y1={yToPx(y1)} x2={xToPx(x2)} y2={yToPx(y2)} stroke="#e07a5f" strokeWidth="1" strokeDasharray="4 3" />;
        })()}
        {/* vertical from −R to R */}
        {R && negR && (
          <line x1={xToPx(R.x)} y1={yToPx(R.y)} x2={xToPx(R.x)} y2={yToPx(negR.y)}
            stroke="#81b29a" strokeWidth="1" strokeDasharray="2 3" />
        )}

        {/* points */}
        {P && (
          <g>
            <circle cx={xToPx(P.x)} cy={yToPx(P.y)} r={5} fill="var(--accent)" />
            <text x={xToPx(P.x) + 8} y={yToPx(P.y) - 6} fontSize="11" fill="var(--accent)" fontFamily="var(--font-mono)">P</text>
          </g>
        )}
        {Q && !doubling && (
          <g>
            <circle cx={xToPx(Q.x)} cy={yToPx(Q.y)} r={5} fill="var(--accent)" />
            <text x={xToPx(Q.x) + 8} y={yToPx(Q.y) - 6} fontSize="11" fill="var(--accent)" fontFamily="var(--font-mono)">Q</text>
          </g>
        )}
        {negR && (
          <g>
            <circle cx={xToPx(negR.x)} cy={yToPx(negR.y)} r={4} fill="#e07a5f" />
            <text x={xToPx(negR.x) + 8} y={yToPx(negR.y) + 14} fontSize="10" fill="#e07a5f" fontFamily="var(--font-mono)">−R</text>
          </g>
        )}
        {R && (
          <g>
            <circle cx={xToPx(R.x)} cy={yToPx(R.y)} r={6} fill="#81b29a" />
            <text x={xToPx(R.x) + 8} y={yToPx(R.y) - 6} fontSize="11" fill="#81b29a" fontFamily="var(--font-mono)">R = P+Q</text>
          </g>
        )}
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        {P && <>P = ({P.x.toFixed(2)}, {P.y.toFixed(2)})</>}
        {" "}
        {Q && !doubling && <>Q = ({Q.x.toFixed(2)}, {Q.y.toFixed(2)})</>}
        {R ? <span style={{ color: "#81b29a" }}> ⇒ R = P+Q = ({R.x.toFixed(2)}, {R.y.toFixed(2)})</span> : <span style={{ color: "#e07a5f" }}> (mimo křivku)</span>}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Geometrické sčítání: protáhni přímku skrz P, Q. Najdi třetí průsečík (−R), zrcadli přes osu x → R.
        Pro zdvojnásobení (P = Q) použij tečnu v P. Nad konečným tělesem F_p není geometrie,
        ale algebraický vzorec zůstává.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
