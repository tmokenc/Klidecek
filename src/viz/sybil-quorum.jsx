// Sybil attack na quorum: jeden utocnik vygeneruje N falesnych identit
// a prevazne hlasovani.
import { useMemo, useState } from "react";

export default function SybilQuorum() {
  const [honest, setHonest] = useState(10);
  const [sybil, setSybil] = useState(0);
  const [defense, setDefense] = useState("none");

  // Quorum thresholds
  const totalRaw = honest + sybil;
  const totalEffective = useMemo(() => {
    if (defense === "none") return totalRaw;
    if (defense === "pow") return honest + Math.floor(sybil / 5); // PoW makes Sybil 5x more expensive
    if (defense === "central") return honest; // central authority filters Sybil
    if (defense === "stake") return honest + Math.floor(sybil / 10); // proof-of-stake
    return totalRaw;
  }, [honest, sybil, defense, totalRaw]);

  const sybilEffective = totalEffective - honest;
  const sybilFrac = totalEffective > 0 ? sybilEffective / totalEffective : 0;
  const pbftSafe = sybilFrac < 1/3;
  const majoritySafe = sybilFrac < 1/2;

  const R = 18; // radius of node circles
  const cx = 280, cy = 130;
  const ringR = 95;

  function placeNode(i, n) {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + ringR * Math.cos(angle), y: cy + ringR * Math.sin(angle) };
  }

  const totalDisplay = Math.min(40, honest + sybil);
  const honestDisplay = Math.min(honest, totalDisplay);
  const sybilDisplay = totalDisplay - honestDisplay;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>obrana:</label>
        <select value={defense} onChange={(e) => setDefense(e.target.value)} style={{ ...sel, minWidth: 200 }}>
          <option value="none">žádná (open P2P)</option>
          <option value="pow">Proof-of-Work (Bitcoin-style)</option>
          <option value="stake">Proof-of-Stake (Ethereum-style)</option>
          <option value="central">Central authority (PKI)</option>
        </select>
      </div>

      <div style={row}>
        <label style={lbl}>honest uzly:</label>
        <input type="range" min={3} max={30} value={honest} onChange={(e) => setHonest(+e.target.value)} style={{ flex: 1, minWidth: 120 }} />
        <span style={lbl}>{honest}</span>
      </div>
      <div style={row}>
        <label style={lbl}>Sybil identity:</label>
        <input type="range" min={0} max={50} value={sybil} onChange={(e) => setSybil(+e.target.value)} style={{ flex: 1, minWidth: 120 }} />
        <span style={lbl}>{sybil}</span>
      </div>

      <svg viewBox="0 0 560 260" style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* central attacker */}
        {sybilDisplay > 0 && (
          <>
            <circle cx={cx} cy={cy} r={26} fill="#e07a5f" stroke="#e07a5f" />
            <text x={cx} y={cy + 4} fontSize="11" textAnchor="middle" fill="var(--bg-inset)" fontWeight="bold">attacker</text>
          </>
        )}
        {/* nodes around */}
        {Array.from({ length: totalDisplay }).map((_, i) => {
          const isHonest = i < honestDisplay;
          const p = placeNode(i, totalDisplay);
          return (
            <g key={i}>
              {!isHonest && <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e07a5f" strokeWidth="0.6" strokeDasharray="2 2" />}
              <circle cx={p.x} cy={p.y} r={R/1.5} fill={isHonest ? "#81b29a" : "#e07a5f"} stroke={isHonest ? "#81b29a" : "#e07a5f"} />
              <text x={p.x} y={p.y + 3} fontSize="9" textAnchor="middle" fill="var(--bg-inset)" fontWeight="bold">
                {isHonest ? "H" : "S"}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <div>raw nodes: {honest} honest + {sybil} sybil = {totalRaw}</div>
        <div>efektivni hlasy po obrane '{defense}': {honest} honest + {sybilEffective} sybil = {totalEffective}</div>
        <div>sybil podíl: <b style={{ color: sybilFrac >= 0.5 ? "#e07a5f" : sybilFrac >= 0.33 ? "var(--accent)" : "#81b29a" }}>
          {(sybilFrac * 100).toFixed(1)} %
        </b></div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Konsenzus:</div>
        <div style={{ fontSize: 11 }}>
          <div style={{ color: pbftSafe ? "#81b29a" : "#e07a5f", padding: "2px 0" }}>
            {pbftSafe ? "✓" : "✗"} PBFT (Byzantine fault tolerance) — vyzaduje sybil &lt; 1/3
          </div>
          <div style={{ color: majoritySafe ? "#81b29a" : "#e07a5f", padding: "2px 0" }}>
            {majoritySafe ? "✓" : "✗"} Nakamoto majority — vyzaduje sybil &lt; 1/2
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Sybil utok (Douceur 2002): jeden fyzicky uzel se prezentuje jako N entitam → ovládne hlasovani, routing tables, P2P DHT.
        Obrana je cost-based: aby fake identity byla draha (PoW: výpočetní cena; PoS: kapital; central authority: identita ověřena PKI).
        V IoT sítích bez identity je sybil snadny — proto ZigBee a Thread vyžaduji per-device install codes nebo certifikaty.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
