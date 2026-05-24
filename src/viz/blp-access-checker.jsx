// blp-access-checker — Bell-LaPadula simple security + *-property. Set
// subject clearance and object label; see read/write verdict instantly.
import { useState } from "react";

const LEVELS = ["U", "C", "S", "TS"];
const LEVEL_NAME = { U: "Unclassified", C: "Confidential", S: "Secret", TS: "Top Secret" };
const CATS = ["NUCLEAR", "CRYPTO"];

function dominates(sLvl, sCats, oLvl, oCats) {
  // sLvl dominates oLvl?
  const levelOk = LEVELS.indexOf(sLvl) >= LEVELS.indexOf(oLvl);
  const catsOk = oCats.every(c => sCats.includes(c));
  return levelOk && catsOk;
}

export default function BlpAccessChecker() {
  const [sLvl, setSLvl] = useState("S");
  const [sCats, setSCats] = useState(["CRYPTO"]);
  const [oLvl, setOLvl] = useState("C");
  const [oCats, setOCats] = useState([]);
  const [action, setAction] = useState("read");

  const subjectDom = dominates(sLvl, sCats, oLvl, oCats);
  const objectDom = dominates(oLvl, oCats, sLvl, sCats);
  // simple security: subj dom obj for read
  // *-prop: obj dom subj for write
  const allowed = action === "read" ? subjectDom : objectDom;
  const reasonRead = subjectDom
    ? "subject ≽ object → no read up ✓"
    : "subject ⊀ object → no read up ✗ (deny)";
  const reasonWrite = objectDom
    ? "object ≽ subject → no write down ✓"
    : "object ⊀ subject → no write down ✗ (deny)";

  function toggleCat(set, setter, c) {
    setter(set.includes(c) ? set.filter(x => x !== c) : [...set, c]);
  }

  const W = 580, H = 240;
  const sLvlIdx = LEVELS.indexOf(sLvl);
  const oLvlIdx = LEVELS.indexOf(oLvl);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8, fontSize: 11 }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 3 }}>Subject (uživatel)</div>
          <div>Clearance:&nbsp;
            <select value={sLvl} onChange={e => setSLvl(e.target.value)} style={ctrl}>
              {LEVELS.map(l => <option key={l} value={l}>{l} — {LEVEL_NAME[l]}</option>)}
            </select>
          </div>
          <div style={{ marginTop: 4 }}>Categories:
            {CATS.map(c => (
              <label key={c} style={{ marginLeft: 6, fontSize: 10.5 }}>
                <input type="checkbox" checked={sCats.includes(c)} onChange={() => toggleCat(sCats, setSCats, c)} /> {c}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 3 }}>Object (soubor)</div>
          <div>Label:&nbsp;
            <select value={oLvl} onChange={e => setOLvl(e.target.value)} style={ctrl}>
              {LEVELS.map(l => <option key={l} value={l}>{l} — {LEVEL_NAME[l]}</option>)}
            </select>
          </div>
          <div style={{ marginTop: 4 }}>Categories:
            {CATS.map(c => (
              <label key={c} style={{ marginLeft: 6, fontSize: 10.5 }}>
                <input type="checkbox" checked={oCats.includes(c)} onChange={() => toggleCat(oCats, setOCats, c)} /> {c}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 6, alignItems: "center" }}>
        <button onClick={() => setAction("read")} style={btn(action === "read")}>read</button>
        <button onClick={() => setAction("write")} style={btn(action === "write")}>write</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* level ladder */}
        {LEVELS.slice().reverse().map((l, i) => {
          const y = 25 + i * 40;
          const isSubj = l === sLvl;
          const isObj = l === oLvl;
          return (
            <g key={l}>
              <rect x={60} y={y} width={460} height={30} rx="3"
                fill={isSubj && isObj ? "oklch(0.7 0.15 245 / 0.3)" : isSubj ? "oklch(0.7 0.15 145 / 0.25)" : isObj ? "oklch(0.65 0.18 22 / 0.2)" : "var(--bg-inset)"}
                stroke="var(--line)" />
              <text x={75} y={y + 19} fontSize="11" fontWeight="600" fill="var(--text)">{l}</text>
              <text x={110} y={y + 19} fontSize="10" fill="var(--text-muted)">{LEVEL_NAME[l]}</text>
              {isSubj && <text x={300} y={y + 19} fontSize="11" fontWeight="600" fill="oklch(0.7 0.15 145)">▲ Subject {sCats.length > 0 ? `{${sCats.join(",")}}` : ""}</text>}
              {isObj && <text x={450} y={y + 19} fontSize="11" fontWeight="600" fill="oklch(0.65 0.18 22)">● Object {oCats.length > 0 ? `{${oCats.join(",")}}` : ""}</text>}
            </g>
          );
        })}

        {/* action arrow */}
        {action === "read" && (
          <g>
            <path d={`M 310 ${25 + (3 - sLvlIdx) * 40 + 15} Q 380 100 460 ${25 + (3 - oLvlIdx) * 40 + 15}`}
              stroke={allowed ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"} strokeWidth="2" fill="none"
              strokeDasharray={allowed ? "0" : "4 3"} markerEnd="url(#blp-ar)" />
          </g>
        )}
        {action === "write" && (
          <g>
            <path d={`M 460 ${25 + (3 - oLvlIdx) * 40 + 15} Q 380 100 310 ${25 + (3 - sLvlIdx) * 40 + 15}`}
              stroke={allowed ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"} strokeWidth="2" fill="none"
              strokeDasharray={allowed ? "0" : "4 3"} markerEnd="url(#blp-ar)" />
          </g>
        )}
        <defs>
          <marker id="blp-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L5,3 L0,6 z" fill="var(--text)" />
          </marker>
        </defs>

        <rect x={20} y={195} width={540} height={36} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={W / 2} y={210} textAnchor="middle" fontSize="12" fontWeight="700"
          fill={allowed ? "oklch(0.7 0.15 145)" : "oklch(0.65 0.18 22)"}>
          {action.toUpperCase()}: {allowed ? "✓ ALLOWED" : "✗ DENIED"}
        </text>
        <text x={W / 2} y={224} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)">
          {action === "read" ? reasonRead : reasonWrite}
        </text>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        BLP rules: <b>no read up</b> (S can't read TS) + <b>no write down</b> (TS can't write S — prevents leak).
        Categories tvoří lattice — pro <i>dominance</i> musí subjekt mít všechny obj kategorie.
      </div>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 5px", borderRadius: 3, fontSize: 11 };
function btn(active) {
  return { ...ctrl, background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", cursor: "pointer", padding: "3px 10px" };
}
