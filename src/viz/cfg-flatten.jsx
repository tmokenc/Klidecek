// Control-flow flattening: original CFG vs. switch-dispatcher version.
// Klikni do bloku v originalu, vidi se highlights v "spaghetti" verze.
import { useState } from "react";

const ORIGINAL_BLOCKS = [
  { id: "entry", x: 100, y: 30, label: "x = input()" },
  { id: "check", x: 100, y: 80, label: "x > 0?", branch: true },
  { id: "pos", x: 40, y: 140, label: "a = 1" },
  { id: "neg", x: 160, y: 140, label: "a = 2" },
  { id: "join", x: 100, y: 200, label: "b = a + 1" },
  { id: "exit", x: 100, y: 250, label: "return b" },
];

const ORIG_EDGES = [
  ["entry", "check"], ["check", "pos", "true"], ["check", "neg", "false"],
  ["pos", "join"], ["neg", "join"], ["join", "exit"],
];

const FLAT_BLOCKS = [
  { id: "case0", x: 300, y: 30, label: "case 0: x = input()", origMap: "entry" },
  { id: "case1", x: 300, y: 80, label: "case 1: if (x>0) state=2 else state=3", origMap: "check" },
  { id: "case2", x: 220, y: 130, label: "case 2: a = 1; state=4", origMap: "pos" },
  { id: "case3", x: 380, y: 130, label: "case 3: a = 2; state=4", origMap: "neg" },
  { id: "case4", x: 300, y: 180, label: "case 4: b = a + 1; state=5", origMap: "join" },
  { id: "case5", x: 300, y: 230, label: "case 5: return b", origMap: "exit" },
];

// In flattened version, dispatcher loops through cases — all edges go through it
const FLAT_DISPATCHER = { x: 480, y: 130 };

export default function CfgFlatten() {
  const [selected, setSelected] = useState(null);

  function isMatched(flatId) {
    if (!selected) return false;
    return FLAT_BLOCKS.find((b) => b.id === flatId)?.origMap === selected;
  }

  return (
    <div style={ctn}>
      <div style={lbl}>klikni na blok v originalu → odpovidajici case ve flatten verzi se zvyrazni.</div>

      <svg viewBox="0 0 580 300" style={{ width: "100%", maxWidth: 600, background: "var(--bg-inset)", borderRadius: 6 }}>
        <text x={100} y={14} fontSize="11" textAnchor="middle" fill="var(--text-muted)">original CFG</text>
        <text x={300} y={14} fontSize="11" textAnchor="middle" fill="var(--text-muted)">flattened CFG</text>

        {/* Original edges */}
        {ORIG_EDGES.map(([a, b, lbl], i) => {
          const A = ORIGINAL_BLOCKS.find((x) => x.id === a);
          const B = ORIGINAL_BLOCKS.find((x) => x.id === b);
          return <g key={i}>
            <line x1={A.x} y1={A.y + 14} x2={B.x} y2={B.y - 14} stroke="var(--line)" strokeWidth="1" markerEnd="url(#arrL)" />
            {lbl && <text x={(A.x + B.x) / 2 + 6} y={(A.y + B.y) / 2} fontSize="9" fill="var(--text-muted)">{lbl}</text>}
          </g>;
        })}

        {/* Original blocks */}
        {ORIGINAL_BLOCKS.map((b) => {
          const sel = selected === b.id;
          return (
            <g key={b.id} style={{ cursor: "pointer" }} onClick={() => setSelected(selected === b.id ? null : b.id)}>
              <rect x={b.x - 60} y={b.y - 14} width={120} height={28} rx={4}
                fill={sel ? "var(--accent)" : "var(--bg-card)"} stroke={sel ? "#e07a5f" : "var(--accent)"} strokeWidth="1" />
              <text x={b.x} y={b.y + 4} fontSize="10" textAnchor="middle"
                fill={sel ? "var(--bg-inset)" : "var(--text)"} fontFamily="var(--font-mono)">{b.label}</text>
            </g>
          );
        })}

        {/* Dispatcher */}
        <circle cx={FLAT_DISPATCHER.x} cy={FLAT_DISPATCHER.y} r={26} fill="var(--bg-card)" stroke="#e07a5f" strokeWidth="1.5" />
        <text x={FLAT_DISPATCHER.x} y={FLAT_DISPATCHER.y + 4} fontSize="10" textAnchor="middle" fill="#e07a5f">switch</text>

        {/* Flattened: all blocks connect to dispatcher both ways */}
        {FLAT_BLOCKS.map((b, i) => {
          const matched = isMatched(b.id);
          return <g key={b.id}>
            <line x1={b.x + 60} y1={b.y} x2={FLAT_DISPATCHER.x - 26} y2={FLAT_DISPATCHER.y}
              stroke={matched ? "#e07a5f" : "var(--line)"} strokeWidth={matched ? 1.5 : 0.6}
              strokeDasharray="2 2" />
          </g>;
        })}
        {FLAT_BLOCKS.map((b) => {
          const matched = isMatched(b.id);
          return (
            <g key={b.id}>
              <rect x={b.x - 60} y={b.y - 12} width={120} height={24} rx={3}
                fill={matched ? "#e07a5f" : "var(--bg-card)"} stroke={matched ? "#e07a5f" : "var(--accent)"} strokeWidth="0.8" />
              <text x={b.x} y={b.y + 3} fontSize="9" textAnchor="middle"
                fill={matched ? "var(--bg-inset)" : "var(--text)"} fontFamily="var(--font-mono)">{b.label}</text>
            </g>
          );
        })}

        <defs>
          <marker id="arrL" viewBox="0 0 8 8" refX="8" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 z" fill="var(--line)" />
          </marker>
        </defs>
      </svg>

      <div style={{ background: "var(--bg-inset)", padding: 8, borderRadius: 6, fontSize: 11, color: "var(--text-muted)" }}>
        Original: <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>if (x &gt; 0) a = 1 else a = 2; b = a + 1</span>
        — strukturovany flow.
        <br />
        Flattened: <span style={{ fontFamily: "var(--font-mono)", color: "var(--text)" }}>while(true) switch(state) {`{...}`}</span>
        — vsechny prechody jdou pres dispatcher, originalni strukturu rekonstruovat je v IDA/Ghidra obtizne.
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        O-LLVM control-flow flattening prevadi strukturovany kod na <i>spaghetti</i>: každý basic block je <span style={{ fontFamily: "var(--font-mono)" }}>case</span> v gigantickem switch.
        Disassembler vidi place control-flow graf, ne hierarchii smycek a vetveni. Kombinace s opaque predicates a dead code dodatecne zameni anal yzu.
        Cena: 5-10× zpomaleni; deobfuskace existuje (OOAnalyzer, deflat plugins) ale je manualne narocna.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
