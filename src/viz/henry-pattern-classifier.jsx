// Henry classification + global pattern detection.
// Toggle core/delta points → classify arch/loop/whorl + compute Henry primary.
import { useState } from "react";

const PATTERNS = {
  arch:  { label: "Arch (oblouk)",        deltas: 0, cores: [{x:140,y:80}],            ridgePaths: ["M40,130 C80,80 140,70 200,80 C260,90 320,130 360,130","M40,150 C80,100 140,90 200,100 C260,110 320,150 360,150","M40,170 C80,120 140,110 200,120 C260,130 320,170 360,170"] },
  loop:  { label: "Loop (smyčka)",        deltas: 1, cores: [{x:140,y:80}],            ridgePaths: ["M40,170 C100,80 180,70 220,90 C250,110 280,160 360,170","M40,180 C100,100 180,90 220,110 C250,130 280,170 360,180"], deltaPos: [{x:230,y:130}] },
  whorl: { label: "Whorl (závit)",         deltas: 2, cores: [{x:200,y:100}],           extraSpiral: true, deltaPos: [{x:120,y:140},{x:280,y:140}] },
};

// Henry primary calculation: 10 fingers labeled by pattern
const FINGER_NAMES = ["R1","R2","R3","R4","R5","L1","L2","L3","L4","L5"];
const FINGER_WEIGHTS = [16, 16, 8, 8, 4, 4, 2, 2, 1, 1];

export default function HenryPatternClassifier() {
  const [pattern, setPattern] = useState("loop");
  const [fingers, setFingers] = useState(["arch","loop","whorl","loop","arch","loop","loop","whorl","arch","loop"]);

  const cur = PATTERNS[pattern];

  // Henry numerator/denominator
  const numerator = 1 + fingers.reduce((sum, p, i) => p === "whorl" && i % 2 === 1 ? sum + FINGER_WEIGHTS[i] : sum, 0);
  const denominator = 1 + fingers.reduce((sum, p, i) => p === "whorl" && i % 2 === 0 ? sum + FINGER_WEIGHTS[i] : sum, 0);

  function setFinger(i, p) {
    const arr = fingers.slice();
    arr[i] = p;
    setFingers(arr);
  }

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>vzor:</label>
        {Object.entries(PATTERNS).map(([k, v]) => (
          <button key={k} style={{ ...btn, background: pattern === k ? "var(--accent)" : "var(--bg-inset)", color: pattern === k ? "#fff" : "var(--text)" }} onClick={() => setPattern(k)}>{v.label}</button>
        ))}
      </div>

      <svg viewBox="0 0 400 220" style={{ width: "100%", maxWidth: 540, background: "var(--bg-inset)", borderRadius: 6 }}>
        {/* draw ridges */}
        {cur.ridgePaths && cur.ridgePaths.map((d, i) => (
          <path key={i} d={d} stroke="var(--text)" strokeWidth="1.2" fill="none" />
        ))}
        {pattern === "whorl" && (
          <g stroke="var(--text)" strokeWidth="1.2" fill="none">
            <circle cx="200" cy="100" r="50" />
            <circle cx="200" cy="100" r="38" />
            <circle cx="200" cy="100" r="26" />
            <circle cx="200" cy="100" r="14" />
            <path d="M40,180 C80,170 100,150 120,140" />
            <path d="M40,200 C80,190 100,170 120,160" />
            <path d="M360,180 C320,170 300,150 280,140" />
            <path d="M360,200 C320,190 300,170 280,160" />
          </g>
        )}

        {/* core */}
        {cur.cores.map((c, i) => (
          <g key={`c${i}`}>
            <circle cx={c.x} cy={c.y} r="6" fill="rgb(64,192,87)" stroke="#000" strokeWidth="1" />
            <text x={c.x + 10} y={c.y - 8} fontSize="11" fill="rgb(64,192,87)">core</text>
          </g>
        ))}
        {/* deltas */}
        {cur.deltaPos && cur.deltaPos.map((d, i) => (
          <g key={`d${i}`}>
            <polygon points={`${d.x},${d.y - 7} ${d.x - 6},${d.y + 5} ${d.x + 6},${d.y + 5}`} fill="rgb(220,80,80)" stroke="#000" strokeWidth="1" />
            <text x={d.x + 10} y={d.y + 4} fontSize="11" fill="rgb(220,80,80)">δ</text>
          </g>
        ))}
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, fontSize: 12 }}>
          <div style={statBox}><div style={statLbl}>cores</div><div style={statVal}>{cur.cores.length}</div></div>
          <div style={statBox}><div style={statLbl}>deltas</div><div style={statVal}>{cur.deltas}</div></div>
          <div style={statBox}><div style={statLbl}>klasifikace</div><div style={{ ...statVal, color: "var(--accent)" }}>{cur.label}</div></div>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
          <b>Pravidlo:</b> arch = 0 delta · loop = 1 delta · whorl = 2+ delta.
          Ridges v loop vstupují a vystupují ze stejné strany; ve whorl tvoří uzavřené kruhy/spirály.
        </div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", marginBottom: 6 }}>Henry primary (10 prstů)</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 2, marginBottom: 8 }}>
          {fingers.map((p, i) => (
            <div key={i} style={{ textAlign: "center", fontSize: 10 }}>
              <div style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{FINGER_NAMES[i]}</div>
              <select value={p} onChange={(e) => setFinger(i, e.target.value)} style={{ ...sel, width: "100%", padding: 2 }}>
                <option value="arch">A</option><option value="loop">L</option><option value="whorl">W</option>
              </select>
              <div style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>w={FINGER_WEIGHTS[i]}</div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, textAlign: "center" }}>
          Henry = ({numerator}) / ({denominator}) = <b style={{ color: "var(--accent)" }}>{(numerator / denominator).toFixed(4)}</b>
        </div>
        <div style={{ fontSize: 10, color: "var(--text-muted)", textAlign: "center", marginTop: 2 }}>
          čitatel: Σ váhy sudých prstů s whorl + 1 · jmenovatel: Σ váhy lichých s whorl + 1
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Henry classification dělí AFIS databázi do <b>1024 primary classes</b> — search jen v ~1/1000 records.
        Distribuce v populaci: ~65% loops, ~30% whorls, ~5% arches. Loop je nejběžnější, kompozitní typy (5%) Henryho znevýhodňují.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 4, fontSize: 11 };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const statBox = { background: "var(--bg-card)", padding: 8, borderRadius: 5, textAlign: "center" };
const statLbl = { fontSize: 10, color: "var(--text-muted)" };
const statVal = { fontSize: 14, fontWeight: 600, marginTop: 2 };
