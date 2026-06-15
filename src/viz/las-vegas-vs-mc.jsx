// Las Vegas vs Monte Carlo — side-by-side visual comparison.
// LEFT  panel: distribution of running time T (LV always correct, runtime variable).
// RIGHT panel: distribution of result correctness (MC fixed runtime O(k), variable correctness).
// Headers + a "VS" pill make the comparison axis obvious at a glance.
import { useState, useMemo } from "react";
import * as S from "./_msp-stats.js";

const W = 720, H = 320;
const PANEL_W = (W - 32) / 2;
const PAD_L = 44, PAD_R = 14, PAD_T = 56, PAD_B = 56;
const PLOT_W = PANEL_W - PAD_L - PAD_R;
const PLOT_H = H - PAD_T - PAD_B;

const HUE_LV = 264; // purple — variable time
const HUE_MC = 22;  // orange — variable correctness

export default function LasVegasVsMc() {
  const [n, setN] = useState(20);   // array size (half 0, half 1)
  const [k, setK] = useState(5);    // MC: number of tries
  const [seed, setSeed] = useState(1);

  const sims = useMemo(() => {
    const rng = S.mulberry32(seed * 191 + 1);
    const NUM = 5000;
    const lvTimes = [];
    const mcResults = [];
    const arr = Array.from({ length: n }, (_, i) => i < n / 2 ? 0 : 1);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    for (let t = 0; t < NUM; t++) {
      // Las Vegas
      let tries = 0;
      while (true) {
        tries++;
        const idx = Math.floor(rng() * n);
        if (arr[idx] === 1) break;
        if (tries > 1000) break;
      }
      lvTimes.push(tries);
      // Monte Carlo
      let mcSucc = false;
      for (let i = 0; i < k; i++) {
        const idx = Math.floor(rng() * n);
        if (arr[idx] === 1) { mcSucc = true; break; }
      }
      mcResults.push(mcSucc);
    }
    return { lvTimes, mcResults };
  }, [n, k, seed]);

  // LV stats
  const lvMean = sims.lvTimes.reduce((a, b) => a + b, 0) / sims.lvTimes.length;
  const lvMax = Math.min(15, Math.max(...sims.lvTimes));
  const lvHist = new Int32Array(lvMax + 1);
  for (const t of sims.lvTimes) if (t <= lvMax) lvHist[t]++;
  const lvHistMax = Math.max(...lvHist) || 1;

  // MC stats — empirical success rate + theory curve over k
  const mcSuccess = sims.mcResults.filter(Boolean).length / sims.mcResults.length;
  const mcTheory = 1 - Math.pow(0.5, k);
  // Sweep k = 1..15 → theoretical success curve
  const mcCurve = Array.from({ length: 15 }, (_, i) => ({
    k: i + 1,
    p: 1 - Math.pow(0.5, i + 1),
  }));
  const mcMax = 1;

  // Coordinate helpers, one per panel
  const PANEL_LEFT_X = 0;
  const PANEL_RIGHT_X = PANEL_W + 32;
  const lvX = (t) => PANEL_LEFT_X + PAD_L + (t / lvMax) * PLOT_W;
  const lvY = (c) => PAD_T + PLOT_H - (c / lvHistMax) * PLOT_H;
  const mcX = (kk) => PANEL_RIGHT_X + PAD_L + ((kk - 1) / 14) * PLOT_W;
  const mcY = (p) => PAD_T + PLOT_H - (p / mcMax) * PLOT_H;

  return (
    <div style={{ width: "100%" }}>
      <div className="viz-controls" style={{ marginBottom: 10 }}>
        <label style={lab()}>n (pole) = {n}
          <input type="range" className="viz-slider" min={4} max={50} step={2} value={n} onChange={(e) => setN(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <label style={lab()}>k (MC pokusů) = {k}
          <input type="range" className="viz-slider" min={1} max={15} value={k} onChange={(e) => setK(+e.target.value)} style={{ width: "100%" }} />
        </label>
        <button className="viz-btn" onClick={() => setSeed(seed + 1)}>nový seed</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 880, background: "var(--bg-card)", borderRadius: 6, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Header strip ─────────────────────────────────────────── */}
        <rect x={PANEL_LEFT_X + 4} y={4} width={PANEL_W - 4} height={42} rx="8"
          fill={`oklch(0.65 0.16 ${HUE_LV} / 0.10)`} stroke={`oklch(0.65 0.16 ${HUE_LV} / 0.35)`} strokeWidth="0.7" />
        <text x={PANEL_LEFT_X + PANEL_W / 2 + 2} y={20} textAnchor="middle"
          fontSize="12.5" fontWeight="700" fontFamily="var(--font-mono)" fill={`oklch(0.40 0.16 ${HUE_LV})`}>
          Las Vegas
        </text>
        <text x={PANEL_LEFT_X + PANEL_W / 2 + 2} y={36} textAnchor="middle"
          fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          vždy správně · doba běhu kolísá
        </text>

        <rect x={PANEL_RIGHT_X - 4} y={4} width={PANEL_W - 4} height={42} rx="8"
          fill={`oklch(0.65 0.16 ${HUE_MC} / 0.10)`} stroke={`oklch(0.65 0.16 ${HUE_MC} / 0.35)`} strokeWidth="0.7" />
        <text x={PANEL_RIGHT_X + PANEL_W / 2 - 4} y={20} textAnchor="middle"
          fontSize="12.5" fontWeight="700" fontFamily="var(--font-mono)" fill={`oklch(0.40 0.16 ${HUE_MC})`}>
          Monte Carlo
        </text>
        <text x={PANEL_RIGHT_X + PANEL_W / 2 - 4} y={36} textAnchor="middle"
          fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          pevný čas O(k) · šance chyby
        </text>

        {/* Centred VS pill */}
        <circle cx={PANEL_W + 16} cy={25} r="14" fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1" />
        <text x={PANEL_W + 16} y={29} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-muted)" fontFamily="var(--font-mono)">VS</text>
        <line x1={PANEL_W + 16} y1={48} x2={PANEL_W + 16} y2={H - 50} stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="3 4" opacity={0.5} />

        {/* ── LEFT PANEL: LV running-time distribution ────────────── */}
        <PanelBg x={PANEL_LEFT_X} y={50} w={PANEL_W} h={H - 110} hue={HUE_LV} />

        {/* axes */}
        <line x1={lvX(0)} y1={PAD_T + PLOT_H} x2={lvX(lvMax)} y2={PAD_T + PLOT_H} stroke="var(--line-strong)" strokeWidth="0.6" />
        <line x1={lvX(0)} y1={PAD_T} x2={lvX(0)} y2={PAD_T + PLOT_H} stroke="var(--line-strong)" strokeWidth="0.6" />
        <text x={PANEL_LEFT_X + PANEL_W / 2} y={PAD_T + PLOT_H + 30} textAnchor="middle"
          fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">počet pokusů T do nalezení 1</text>
        <text x={PANEL_LEFT_X + 8} y={PAD_T - 8} fontSize="9.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">četnost</text>

        {/* bars */}
        {Array.from(lvHist).map((c, i) => {
          if (c === 0) return null;
          const bw = (PLOT_W / lvMax) * 0.6;
          return <rect key={i} x={lvX(i) - bw / 2} y={lvY(c)} width={bw} height={PAD_T + PLOT_H - lvY(c)}
            fill={`oklch(0.65 0.16 ${HUE_LV})`} opacity="0.72" />;
        })}
        {/* mean marker */}
        <line x1={lvX(lvMean)} y1={PAD_T} x2={lvX(lvMean)} y2={PAD_T + PLOT_H}
          stroke={`oklch(0.40 0.16 ${HUE_LV})`} strokeDasharray="3 3" strokeWidth="1.2" />
        <text x={lvX(lvMean) + 4} y={PAD_T + 12} fontSize="10" fontFamily="var(--font-mono)"
          fill={`oklch(0.40 0.16 ${HUE_LV})`}>E[T] = {lvMean.toFixed(2)}</text>

        {/* x ticks */}
        {[1, 5, 10, 15].map((t) => t <= lvMax && (
          <g key={t}>
            <line x1={lvX(t)} y1={PAD_T + PLOT_H} x2={lvX(t)} y2={PAD_T + PLOT_H + 4} stroke="var(--line-strong)" />
            <text x={lvX(t)} y={PAD_T + PLOT_H + 16} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">{t}</text>
          </g>
        ))}

        {/* key metric card */}
        <KeyMetric x={PANEL_LEFT_X + PANEL_W - 130} y={PAD_T + 4} hue={HUE_LV}
          label="E[T]" value={lvMean.toFixed(2)} sub="cyklů (teorie: 2)" />

        {/* ── RIGHT PANEL: MC success-vs-k curve ───────────────────── */}
        <PanelBg x={PANEL_RIGHT_X} y={50} w={PANEL_W} h={H - 110} hue={HUE_MC} />

        {/* axes */}
        <line x1={mcX(1)} y1={PAD_T + PLOT_H} x2={mcX(15)} y2={PAD_T + PLOT_H} stroke="var(--line-strong)" strokeWidth="0.6" />
        <line x1={mcX(1)} y1={PAD_T} x2={mcX(1)} y2={PAD_T + PLOT_H} stroke="var(--line-strong)" strokeWidth="0.6" />
        <text x={PANEL_RIGHT_X + PANEL_W / 2} y={PAD_T + PLOT_H + 30} textAnchor="middle"
          fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">počet pokusů k</text>
        <text x={PANEL_RIGHT_X + 8} y={PAD_T - 8} fontSize="9.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">P[úspěch]</text>

        {/* y ticks 0, 0.5, 1 */}
        {[0, 0.5, 1].map((p) => (
          <g key={p}>
            <line x1={mcX(1) - 4} y1={mcY(p)} x2={mcX(1)} y2={mcY(p)} stroke="var(--line-strong)" />
            <text x={mcX(1) - 8} y={mcY(p) + 3} textAnchor="end" fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">{p}</text>
          </g>
        ))}

        {/* theory curve */}
        <path d={mcCurve.map((d, i) => `${i === 0 ? 'M' : 'L'} ${mcX(d.k)} ${mcY(d.p)}`).join(' ')}
          stroke={`oklch(0.65 0.16 ${HUE_MC})`} strokeWidth="2" fill="none" />
        {/* dots */}
        {mcCurve.map((d) => (
          <circle key={d.k} cx={mcX(d.k)} cy={mcY(d.p)} r={d.k === k ? 5 : 3}
            fill={d.k === k ? `oklch(0.55 0.20 ${HUE_MC})` : `oklch(0.65 0.16 ${HUE_MC})`}
            stroke={d.k === k ? "var(--bg-card)" : "none"} strokeWidth="1.5" />
        ))}
        {/* current k marker */}
        <line x1={mcX(k)} y1={PAD_T} x2={mcX(k)} y2={PAD_T + PLOT_H}
          stroke={`oklch(0.40 0.16 ${HUE_MC})`} strokeDasharray="3 3" strokeWidth="1.2" />
        <text x={mcX(k) + 4} y={PAD_T + 12} fontSize="10" fontFamily="var(--font-mono)"
          fill={`oklch(0.40 0.16 ${HUE_MC})`}>k = {k}</text>
        {/* empirical point at current k */}
        <circle cx={mcX(k)} cy={mcY(mcSuccess)} r="5" fill="none"
          stroke={`oklch(0.40 0.16 ${HUE_MC})`} strokeWidth="2" />

        {/* x ticks */}
        {[1, 5, 10, 15].map((kk) => (
          <g key={kk}>
            <line x1={mcX(kk)} y1={PAD_T + PLOT_H} x2={mcX(kk)} y2={PAD_T + PLOT_H + 4} stroke="var(--line-strong)" />
            <text x={mcX(kk)} y={PAD_T + PLOT_H + 16} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" fontFamily="var(--font-mono)">{kk}</text>
          </g>
        ))}

        {/* key metric card — placed in the empty lower-left so it never overlaps the rising curve/dots */}
        <KeyMetric x={PANEL_RIGHT_X + PAD_L + 2} y={PAD_T + PLOT_H - 46 - 6} hue={HUE_MC}
          label="P[chyba]" value={(1 - mcTheory).toFixed(3)} sub={`= (1/2)^${k}`} />

        {/* ── Footer summary ─────────────────────────────────────── */}
        <g>
          <text x={PANEL_W + 16} y={H - 30} textAnchor="middle"
            fontSize="10.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">
            trade-off
          </text>
          <text x={PANEL_W + 16} y={H - 12} textAnchor="middle"
            fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
            čas ↔ správnost
          </text>
        </g>
        <text x={PANEL_LEFT_X + PANEL_W / 2} y={H - 18} textAnchor="middle"
          fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">
          LV gambluje s časem ⇒ neomezený worst-case
        </text>
        <text x={PANEL_RIGHT_X + PANEL_W / 2 - 4} y={H - 18} textAnchor="middle"
          fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">
          MC gambluje se správností ⇒ amplifikace k → P[chyba]²
        </text>
      </svg>

      <div style={{ fontSize: 11, color: "var(--text)", fontFamily: "var(--font-mono)", marginTop: 8 }}>
        <strong style={{ color: `oklch(0.40 0.16 ${HUE_LV})` }}>Las Vegas</strong>: empirické E[T] = {lvMean.toFixed(3)} (teorie 2);
        worst-case neomezeno.{" "}
        <strong style={{ color: `oklch(0.40 0.16 ${HUE_MC})` }}>Monte Carlo (k = {k})</strong>:
        empiricky {mcSuccess.toFixed(4)}; teoreticky 1 − (1/2)^k = {mcTheory.toFixed(4)}.
      </div>
    </div>
  );
}

function PanelBg({ x, y, w, h, hue }) {
  return (
    <rect x={x} y={y} width={w} height={h} rx="6"
      fill={`oklch(0.97 0.01 ${hue} / 0.35)`}
      stroke={`oklch(0.65 0.10 ${hue} / 0.45)`} strokeWidth="0.7" />
  );
}

function KeyMetric({ x, y, hue, label, value, sub }) {
  return (
    <g>
      <rect x={x} y={y} width="118" height="46" rx="6"
        fill="var(--bg-card)" stroke={`oklch(0.65 0.16 ${hue} / 0.45)`} strokeWidth="1" />
      <text x={x + 59} y={y + 14} textAnchor="middle"
        fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">{label}</text>
      <text x={x + 59} y={y + 30} textAnchor="middle"
        fontSize="15" fontWeight="700" fontFamily="var(--font-mono)" fill={`oklch(0.40 0.16 ${hue})`}>{value}</text>
      <text x={x + 59} y={y + 41} textAnchor="middle"
        fontSize="8.5" fontFamily="var(--font-mono)" fill="var(--text-muted)">{sub}</text>
    </g>
  );
}

function lab() { return { flex: "1 1 180px", display: "flex", flexDirection: "column", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }; }
