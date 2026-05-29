// simd-lane-explorer — side-by-side comparison: SIMD parallel ADD vs scalar
// sequential loop on the same N elements. Two clearly separated panels with
// their own cycle counter + a speedup callout so the comparison is obvious.
import { useEffect, useState } from "react";

const TYPES = {
  f32: { label: "8× float32 (__m256)",    n: 8,  w: 32, getA: i => (i + 1) * 0.5, getB: i => i * 0.25,     fmt: v => v.toFixed(2) },
  f64: { label: "4× float64 (__m256d)",   n: 4,  w: 64, getA: i => (i + 1) * 1.1, getB: i => (i + 1) * 0.7, fmt: v => v.toFixed(2) },
  i32: { label: "8× int32 (__m256i)",     n: 8,  w: 32, getA: i => 10 + i,        getB: i => 100 + i * 10, fmt: v => v.toString() },
  i16: { label: "16× int16",              n: 16, w: 16, getA: i => i + 1,         getB: i => 2 * (i + 1),   fmt: v => v.toString() },
  i8:  { label: "32× int8 (__m256i bytes)", n: 32, w: 8, getA: i => i,             getB: i => 50 + i,       fmt: v => v.toString() },
};

// Colours
const SIMD_HUE   = 145; // green
const SCALAR_HUE = 22;  // orange-red

export default function SimdLaneExplorer() {
  const [typeKey, setTypeKey] = useState("f32");
  const [cycle, setCycle] = useState(0);
  const [running, setRunning] = useState(false);
  const t = TYPES[typeKey];

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setCycle(c => c >= t.n ? 0 : c + 1);
    }, 350);
    return () => clearInterval(id);
  }, [running, t.n]);

  const W = 720, H = 360;
  const panelW = (W - 32) / 2;        // two panels with 32 px gutter
  const laneW = (panelW - 38) / t.n - 2;
  const valsA = Array.from({ length: t.n }, (_, i) => t.getA(i));
  const valsB = Array.from({ length: t.n }, (_, i) => t.getB(i));
  const valsR = valsA.map((a, i) => a + valsB[i]);

  // SIMD becomes "done" the moment we tick past cycle 1, scalar completes
  // one lane per cycle.
  const simdDone     = cycle >= 1;
  const scalarLanesDone = cycle; // how many scalar lanes finished

  // Cycle labels for the bar callout
  const cyclesSimd   = 1;
  const cyclesScalar = t.n;
  const speedup      = cyclesScalar / cyclesSimd;

  // Geometry
  const PANEL_X_LEFT  = 0;
  const PANEL_X_RIGHT = panelW + 32;
  const PANEL_Y       = 56;
  const PANEL_H       = H - PANEL_Y - 70;

  // Vertical timeline column on each panel showing per-cycle activity.
  const TIMELINE_X    = 14;
  const TIMELINE_W    = 18;
  const TIMELINE_Y    = PANEL_Y + 22;
  const TIMELINE_H    = PANEL_H - 40;
  const TIMELINE_BAR  = (i, total) => TIMELINE_Y + (i / total) * TIMELINE_H;

  // Row positions for operands inside each panel
  const ROW_AY = PANEL_Y + 18;
  const ROW_BY = PANEL_Y + 60;
  const ROW_RY = PANEL_Y + 132;
  const ROW_H  = 26;

  const lanesX = (panelStartX) => panelStartX + TIMELINE_X + TIMELINE_W + 12;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap", alignItems: "center" }}>
        <select value={typeKey} onChange={e => { setTypeKey(e.target.value); setCycle(0); setRunning(false); }} style={ctrl}>
          {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <button onClick={() => setCycle(c => Math.min(t.n, c + 1))} style={btn(false)}>krok →</button>
        <button onClick={() => setRunning(r => !r)} style={btn(running)}>{running ? "■ stop" : "▶ play"}</button>
        <button onClick={() => { setCycle(0); setRunning(false); }} style={btn(false)}>reset</button>
        <span style={{ marginLeft: "auto", fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          cyklus #{cycle}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 880, background: "var(--bg-card)", borderRadius: 6, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* ── Comparison header strip: SIMD ←─ VS ─→ SCALAR ───────────── */}
        <g>
          <rect x={4} y={4} width={panelW} height={28} rx="6" fill={`oklch(0.65 0.16 ${SIMD_HUE} / 0.10)`} stroke={`oklch(0.65 0.16 ${SIMD_HUE} / 0.35)`} strokeWidth="0.7" />
          <text x={panelW / 2 + 4} y={22} textAnchor="middle" fontSize="12.5" fontWeight="700"
            fill={`oklch(0.40 0.16 ${SIMD_HUE})`} fontFamily="var(--font-mono)">
            SIMD · paralelně
          </text>

          <rect x={PANEL_X_RIGHT - 4} y={4} width={panelW} height={28} rx="6" fill={`oklch(0.65 0.16 ${SCALAR_HUE} / 0.10)`} stroke={`oklch(0.65 0.16 ${SCALAR_HUE} / 0.35)`} strokeWidth="0.7" />
          <text x={PANEL_X_RIGHT + panelW / 2 - 4} y={22} textAnchor="middle" fontSize="12.5" fontWeight="700"
            fill={`oklch(0.40 0.16 ${SCALAR_HUE})`} fontFamily="var(--font-mono)">
            scalar · sekvenčně
          </text>

          {/* VS pill between the headers */}
          <circle cx={panelW + 16} cy={18} r="13" fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="1" />
          <text x={panelW + 16} y={22} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-muted)" fontFamily="var(--font-mono)">VS</text>
        </g>

        {/* Vertical dotted divider between panels */}
        <line x1={panelW + 16} y1={36} x2={panelW + 16} y2={H - 60} stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="3 4" opacity={0.55} />

        {/* ── LEFT PANEL: SIMD parallel ─────────────────────────────── */}
        <PanelBg x={PANEL_X_LEFT} y={PANEL_Y - 10} w={panelW} h={PANEL_H + 18} hue={SIMD_HUE} />

        {/* timeline */}
        <Timeline x={PANEL_X_LEFT + TIMELINE_X} y={TIMELINE_Y} w={TIMELINE_W} h={TIMELINE_H}
          cycles={cyclesSimd} done={simdDone ? 1 : 0} hue={SIMD_HUE}
          totalCycles={cyclesScalar} label="1 cyklus" />

        {/* operand a */}
        <text x={lanesX(PANEL_X_LEFT)} y={ROW_AY - 6} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">a[0..{t.n - 1}]</text>
        {valsA.map((v, i) => (
          <Lane key={"sa" + i} x={lanesX(PANEL_X_LEFT) + i * (laneW + 2)} y={ROW_AY} w={laneW} h={ROW_H}
            fill={`oklch(0.65 0.16 245 / 0.30)`} stroke={`oklch(0.65 0.16 245)`} text={t.fmt(v)} />
        ))}
        {/* operand b */}
        <text x={lanesX(PANEL_X_LEFT)} y={ROW_BY - 6} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">b[0..{t.n - 1}]</text>
        {valsB.map((v, i) => (
          <Lane key={"sb" + i} x={lanesX(PANEL_X_LEFT) + i * (laneW + 2)} y={ROW_BY} w={laneW} h={ROW_H}
            fill={`oklch(0.65 0.16 245 / 0.30)`} stroke={`oklch(0.65 0.16 245)`} text={t.fmt(v)} />
        ))}
        {/* big PLUS in the gap between b and r */}
        <text x={lanesX(PANEL_X_LEFT) + (laneW * t.n + 2 * (t.n - 1)) / 2} y={ROW_BY + ROW_H + 18} textAnchor="middle"
          fontSize="13" fontWeight="700" fill={`oklch(0.40 0.16 ${SIMD_HUE})`} fontFamily="var(--font-mono)">
          ↓ _mm256_add_{typeKey === "f32" ? "ps" : typeKey === "f64" ? "pd" : "epi" + t.w} (1 instrukce)
        </text>
        {/* result (all lanes appear together when simdDone) */}
        <text x={lanesX(PANEL_X_LEFT)} y={ROW_RY - 6} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">a+b →</text>
        {valsR.map((v, i) => (
          <Lane key={"sr" + i} x={lanesX(PANEL_X_LEFT) + i * (laneW + 2)} y={ROW_RY} w={laneW} h={ROW_H}
            fill={simdDone ? `oklch(0.65 0.16 ${SIMD_HUE} / 0.45)` : "var(--bg-inset)"}
            stroke={simdDone ? `oklch(0.55 0.16 ${SIMD_HUE})` : "var(--line)"}
            text={simdDone ? t.fmt(v) : "·"} dim={!simdDone} />
        ))}
        <text x={PANEL_X_LEFT + panelW / 2} y={ROW_RY + ROW_H + 24} textAnchor="middle"
          fontSize="10.5" fill="var(--text-muted)">
          po <tspan fontWeight="700" fill={`oklch(0.40 0.16 ${SIMD_HUE})`}>{cyclesSimd} cyklu</tspan> hotovo všech {t.n} lanes
        </text>

        {/* ── RIGHT PANEL: scalar sequential ─────────────────────────── */}
        <PanelBg x={PANEL_X_RIGHT} y={PANEL_Y - 10} w={panelW} h={PANEL_H + 18} hue={SCALAR_HUE} />

        <Timeline x={PANEL_X_RIGHT + TIMELINE_X} y={TIMELINE_Y} w={TIMELINE_W} h={TIMELINE_H}
          cycles={cyclesScalar} done={scalarLanesDone} hue={SCALAR_HUE}
          totalCycles={cyclesScalar} label={`${t.n} cyklů`} />

        {/* operand a */}
        <text x={lanesX(PANEL_X_RIGHT)} y={ROW_AY - 6} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">a[0..{t.n - 1}]</text>
        {valsA.map((v, i) => (
          <Lane key={"ca" + i} x={lanesX(PANEL_X_RIGHT) + i * (laneW + 2)} y={ROW_AY} w={laneW} h={ROW_H}
            fill={`oklch(0.65 0.16 245 / 0.30)`} stroke={`oklch(0.65 0.16 245)`} text={t.fmt(v)}
            highlight={cycle > 0 && cycle <= t.n && i === cycle - 1 ? SCALAR_HUE : null} />
        ))}
        {/* operand b */}
        <text x={lanesX(PANEL_X_RIGHT)} y={ROW_BY - 6} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">b[0..{t.n - 1}]</text>
        {valsB.map((v, i) => (
          <Lane key={"cb" + i} x={lanesX(PANEL_X_RIGHT) + i * (laneW + 2)} y={ROW_BY} w={laneW} h={ROW_H}
            fill={`oklch(0.65 0.16 245 / 0.30)`} stroke={`oklch(0.65 0.16 245)`} text={t.fmt(v)}
            highlight={cycle > 0 && cycle <= t.n && i === cycle - 1 ? SCALAR_HUE : null} />
        ))}
        <text x={lanesX(PANEL_X_RIGHT) + (laneW * t.n + 2 * (t.n - 1)) / 2} y={ROW_BY + ROW_H + 18} textAnchor="middle"
          fontSize="12.5" fontWeight="700" fill={`oklch(0.40 0.16 ${SCALAR_HUE})`} fontFamily="var(--font-mono)">
          for (i=0; i&lt;{t.n}; i++) r[i] = a[i] + b[i];
        </text>
        {/* per-lane result fills lane-by-lane as cycles tick */}
        <text x={lanesX(PANEL_X_RIGHT)} y={ROW_RY - 6} fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-mono)">r[i]</text>
        {valsR.map((v, i) => {
          const filled = i < scalarLanesDone;
          const isCurrent = cycle > 0 && cycle <= t.n && i === cycle - 1;
          return (
            <Lane key={"cr" + i} x={lanesX(PANEL_X_RIGHT) + i * (laneW + 2)} y={ROW_RY} w={laneW} h={ROW_H}
              fill={filled ? `oklch(0.65 0.16 ${SCALAR_HUE} / 0.45)` : "var(--bg-inset)"}
              stroke={isCurrent ? `oklch(0.50 0.20 ${SCALAR_HUE})` : (filled ? `oklch(0.55 0.16 ${SCALAR_HUE})` : "var(--line)")}
              strokeWidth={isCurrent ? 2 : 1}
              text={filled ? t.fmt(v) : (isCurrent ? "↻" : "·")}
              dim={!filled && !isCurrent} />
          );
        })}
        <text x={PANEL_X_RIGHT + panelW / 2} y={ROW_RY + ROW_H + 24} textAnchor="middle"
          fontSize="10.5" fill="var(--text-muted)">
          po <tspan fontWeight="700" fill={`oklch(0.40 0.16 ${SCALAR_HUE})`}>{cyclesScalar} cyklech</tspan> ({scalarLanesDone} hotovo)
        </text>

        {/* ── Footer: speedup callout ──────────────────────────────── */}
        <g>
          <rect x={panelW / 2 - 70} y={H - 50} width="140" height="34" rx="17"
            fill="var(--bg-inset)" stroke="var(--line-strong)" strokeWidth="0.8" />
          <text x={panelW / 2} y={H - 36} textAnchor="middle"
            fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">speedup</text>
          <text x={panelW / 2} y={H - 22} textAnchor="middle"
            fontSize="14" fontWeight="700" fill="var(--accent)" fontFamily="var(--font-mono)">
            {speedup}×
          </text>
        </g>
        <text x={panelW + 16} y={H - 24} textAnchor="middle" fontSize="10" fill="var(--text-faint)" fontFamily="var(--font-mono)">
          (čistá ALU; v praxi load/store + alignment)
        </text>
        <text x={PANEL_X_RIGHT + panelW / 2 - 4} y={H - 8} textAnchor="middle"
          fontSize="9.5" fill="var(--text-faint)" fontFamily="var(--font-mono)">
          stejných {t.n} prvků, jiný hardware path
        </text>
      </svg>
    </div>
  );
}

/* ─── Small reusable sub-components ──────────────────────────── */
function PanelBg({ x, y, w, h, hue }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6"
        fill={`oklch(0.97 0.01 ${hue} / 0.35)`}
        stroke={`oklch(0.65 0.10 ${hue} / 0.45)`} strokeWidth="0.7" />
    </g>
  );
}
function Lane({ x, y, w, h, fill, stroke, text, dim, highlight, strokeWidth = 1 }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="2.5" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      <text x={x + w / 2} y={y + h / 2 + 3} textAnchor="middle" fontSize="9.5"
        fontFamily="ui-monospace, monospace"
        fill={dim ? "var(--text-faint)" : "var(--text)"}>
        {text}
      </text>
      {highlight && (
        <rect x={x - 1} y={y - 1} width={w + 2} height={h + 2} rx="3"
          fill="none" stroke={`oklch(0.55 0.20 ${highlight})`} strokeWidth="2" />
      )}
    </g>
  );
}
// Vertical cycle bar — shows the panel's total cycle count + a fill indicating progress.
function Timeline({ x, y, w, h, cycles, done, hue, totalCycles, label }) {
  const cellH = h / Math.max(1, totalCycles);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="3" fill="var(--bg-card)" stroke="var(--line-strong)" strokeWidth="0.7" />
      {Array.from({ length: totalCycles }, (_, i) => {
        // Filled if cycle index i has been used by this panel. SIMD uses just
        // cycle 0 → fills entire bar when done. Scalar fills one cell per step.
        const filled = cycles === 1 ? done >= 1 : i < done;
        return (
          <rect key={i} x={x + 1.5} y={y + i * cellH + 1.5}
            width={w - 3} height={cellH - 2.5}
            fill={filled ? `oklch(0.60 0.16 ${hue})` : "transparent"}
            opacity={filled ? 0.55 : 1} />
        );
      })}
      <text x={x + w / 2} y={y - 7} textAnchor="middle" fontSize="9.5"
        fontFamily="var(--font-mono)" fontWeight="600" fill={`oklch(0.40 0.16 ${hue})`}>
        {label}
      </text>
      <text x={x + w / 2} y={y + h + 12} textAnchor="middle" fontSize="8.5"
        fontFamily="var(--font-mono)" fill="var(--text-faint)">
        čas →
      </text>
    </g>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 6px", borderRadius: 3, fontSize: 11 };
function btn(active) {
  return { ...ctrl, background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", cursor: "pointer", padding: "3px 9px" };
}
