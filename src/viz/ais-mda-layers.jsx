// MDA vrstvy CIM → PIM → PSM → kód. Klikem na vrstvu vidíš, co řeší a jak
// transformace přidává technologické detaily (oddělení byznysu od platformy).
import { useState } from "react";

const LAYERS = [
  {
    id: "cim",
    label: "CIM",
    full: "Computation Independent Model",
    hue: 264,
    indep: "nezávislý na IT",
    sample: ["Zákazník objedná zboží.", "Sklad ověří dostupnost.", "(jazyk byznysu, žádný kód)"],
    desc: "Čistě byznys a procesy. Srozumitelný i pro zadavatele, kterého kód nezajímá.",
  },
  {
    id: "pim",
    label: "PIM",
    full: "Platform Independent Model",
    hue: 200,
    indep: "nezávislý na platformě",
    sample: ["Order { items, total }", "OrderService.submit(order)", "InventoryRepo (rozhraní)"],
    desc: "Technický návrh a logika — bez vazby na konkrétní jazyk či DB. Zde leží know-how aplikace.",
  },
  {
    id: "psm",
    label: "PSM",
    full: "Platform Specific Model",
    hue: 142,
    indep: "specifický pro platformu",
    sample: ["@Entity class Order { … }", "@Stateless OrderServiceBean", "JPA repo nad PostgreSQL"],
    desc: "PIM doplněný o detaily konkrétní technologie (Java/JPA, SQL). Z něj se generuje kód.",
  },
  {
    id: "code",
    label: "kód",
    full: "vygenerovaná implementace",
    hue: 65,
    indep: "běžící software",
    sample: ["public class Order {", "  @Id Long id; … }", "// vygenerováno transformací"],
    desc: "Výsledný zdrojový kód vygenerovaný z PSM. Poslední transformace model-to-code.",
  },
];

const W = 360, H = 200;
const ROW_H = 38, ROW_X = 14, ROW_W = 150, ROW_Y0 = 16, GAP = 8;

export default function MdaLayers() {
  const [active, setActive] = useState("cim");
  const idx = LAYERS.findIndex((l) => l.id === active);
  const cur = LAYERS[idx];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
        <rect width={W} height={H} fill="var(--bg-inset)" rx="6" />
        <defs>
          <marker id="mdaArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill="var(--text-muted)" />
          </marker>
        </defs>

        {LAYERS.map((l, i) => {
          const y = ROW_Y0 + i * (ROW_H + GAP);
          const isActive = l.id === active;
          const reached = i <= idx;
          return (
            <g key={l.id} onClick={() => setActive(l.id)} style={{ cursor: "pointer" }}>
              <rect
                x={ROW_X} y={y} width={ROW_W} height={ROW_H} rx="5"
                fill={`oklch(0.62 0.14 ${l.hue} / ${isActive ? 0.34 : reached ? 0.16 : 0.07})`}
                stroke={`oklch(0.6 0.14 ${l.hue})`}
                strokeWidth={isActive ? "2" : "1"}
              />
              <text x={ROW_X + 12} y={y + 17} fontSize="13" fontWeight="700" fill="var(--text)">
                {l.label}
              </text>
              <text x={ROW_X + 50} y={y + 16} fontSize="7" textLength={ROW_W - 52} lengthAdjust="spacingAndGlyphs" fill="var(--text-muted)">
                {l.full}
              </text>
              <text x={ROW_X + 50} y={y + 28} fontSize="8.5" fill="var(--text-faint)" fontStyle="italic">
                {l.indep}
              </text>
              {/* transformace mezi vrstvami */}
              {i < LAYERS.length - 1 && (
                <>
                  <line
                    x1={ROW_X + ROW_W / 2} y1={y + ROW_H}
                    x2={ROW_X + ROW_W / 2} y2={y + ROW_H + GAP}
                    stroke="var(--text-muted)" strokeWidth="1.3" markerEnd="url(#mdaArr)"
                  />
                  <text x={ROW_X + ROW_W / 2 + 6} y={y + ROW_H + 7} fontSize="7.5" fill="var(--text-faint)">
                    transformace
                  </text>
                </>
              )}
            </g>
          );
        })}

        {/* pravý panel — ukázka modelu na zvolené vrstvě */}
        <rect x={ROW_X + ROW_W + 18} y={16} width={W - ROW_X * 2 - ROW_W - 18} height={H - 32} rx="5" fill="var(--bg-card)" stroke="var(--line)" />
        <text x={ROW_X + ROW_W + 30} y={34} fontSize="10.5" fontWeight="600" fill={`oklch(0.5 0.14 ${cur.hue})`}>
          {cur.label} · {cur.indep}
        </text>
        {cur.sample.map((s, k) => (
          <text
            key={k}
            x={ROW_X + ROW_W + 30}
            y={56 + k * 16}
            fontSize="9"
            fontFamily="var(--font-mono)"
            fill="var(--text)"
          >
            {s}
          </text>
        ))}
      </svg>

      <div className="viz-controls">
        {LAYERS.map((l) => (
          <button
            key={l.id}
            className="viz-btn"
            data-active={active === l.id}
            onClick={() => setActive(l.id)}
            style={active === l.id ? {
              border: `1px solid oklch(0.6 0.14 ${l.hue})`,
              background: `oklch(0.62 0.14 ${l.hue} / 0.18)`,
              color: "var(--text)",
            } : undefined}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.45, padding: "6px 10px", background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 4 }}>
        {cur.desc}
      </div>
    </div>
  );
}
