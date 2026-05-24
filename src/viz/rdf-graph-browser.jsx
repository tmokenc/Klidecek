// rdf-graph-browser — force-laid-out RDF graph; click a node to focus
// and reveal its neighborhood. Switch labels between full URIs and Turtle prefixes.
import { useMemo, useState } from "react";

const W = 540, H = 360;

const TRIPLES = [
  ["ex:anna",  "rdf:type", "foaf:Person"],
  ["ex:anna",  "foaf:name", "\"Anna Nováková\""],
  ["ex:anna",  "foaf:knows", "ex:bob"],
  ["ex:anna",  "ex:livesIn", "ex:brno"],
  ["ex:bob",   "rdf:type", "foaf:Person"],
  ["ex:bob",   "foaf:name", "\"Bob Smith\""],
  ["ex:bob",   "foaf:knows", "ex:carol"],
  ["ex:bob",   "ex:livesIn", "ex:praha"],
  ["ex:carol", "rdf:type", "foaf:Person"],
  ["ex:carol", "ex:livesIn", "ex:brno"],
  ["ex:brno",  "rdf:type", "ex:City"],
  ["ex:brno",  "ex:country", "ex:cz"],
  ["ex:praha", "rdf:type", "ex:City"],
  ["ex:praha", "ex:country", "ex:cz"],
  ["ex:cz",    "rdf:type", "ex:Country"],
];

const PREFIXES = {
  "rdf:": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  "foaf:": "http://xmlns.com/foaf/0.1/",
  "ex:": "http://example.com/",
};

function expand(name) {
  for (const [pre, full] of Object.entries(PREFIXES)) {
    if (name.startsWith(pre)) return `<${full}${name.slice(pre.length)}>`;
  }
  return name;
}

const POS = {
  "ex:anna":     [130, 100],
  "ex:bob":      [270, 80],
  "ex:carol":    [410, 110],
  "ex:brno":     [130, 240],
  "ex:praha":    [410, 240],
  "ex:cz":       [270, 290],
  "foaf:Person": [50, 30],
  "ex:City":     [50, 290],
  "ex:Country":  [490, 290],
  "\"Anna Nováková\"": [70, 150],
  "\"Bob Smith\"":     [310, 30],
};

export default function RdfGraphBrowser() {
  const [focus, setFocus] = useState("ex:anna");
  const [expandFull, setExpandFull] = useState(false);

  const neighbors = useMemo(() => {
    const n = new Set([focus]);
    for (const [s, p, o] of TRIPLES) {
      if (s === focus) n.add(o);
      if (o === focus) n.add(s);
    }
    return n;
  }, [focus]);

  const nodes = Array.from(new Set(TRIPLES.flatMap(t => [t[0], t[2]])));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button onClick={() => setExpandFull(s => !s)} style={btn(expandFull)}>{expandFull ? "show prefixes" : "show full URIs"}</button>
        <button onClick={() => setFocus("ex:anna")} style={btn(false)}>focus anna</button>
        <button onClick={() => setFocus("ex:brno")} style={btn(false)}>focus brno</button>
        <button onClick={() => setFocus(null)} style={btn(false)}>clear focus</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* edges */}
        {TRIPLES.map(([s, p, o], i) => {
          if (!POS[s] || !POS[o]) return null;
          const inNeighborhood = focus && neighbors.has(s) && neighbors.has(o);
          const dim = focus && !inNeighborhood;
          return (
            <g key={i} opacity={dim ? 0.18 : 1}>
              <line x1={POS[s][0]} y1={POS[s][1]} x2={POS[o][0]} y2={POS[o][1]}
                stroke={inNeighborhood ? "oklch(0.6 0.18 22)" : "var(--line)"}
                strokeWidth={inNeighborhood ? 1.5 : 0.7} />
              <text x={(POS[s][0] + POS[o][0]) / 2} y={(POS[s][1] + POS[o][1]) / 2 - 3}
                textAnchor="middle" fontSize="9" fontFamily="var(--font-mono)" fill={inNeighborhood ? "oklch(0.6 0.18 22)" : "var(--text-faint)"}>
                {p}
              </text>
            </g>
          );
        })}

        {/* nodes */}
        {nodes.filter(n => POS[n]).map(n => {
          const isFocus = n === focus;
          const inN = focus && neighbors.has(n);
          const dim = focus && !inN;
          const isLiteral = n.startsWith("\"");
          const isClass = ["foaf:Person", "ex:City", "ex:Country"].includes(n);
          return (
            <g key={n} transform={`translate(${POS[n][0]}, ${POS[n][1]})`} opacity={dim ? 0.3 : 1} style={{ cursor: "pointer" }}
              onClick={() => setFocus(focus === n ? null : n)}>
              {isLiteral ? (
                <rect x={-44} y={-10} width={88} height={20} fill="var(--bg-inset)" stroke={isFocus ? "var(--accent)" : "var(--line-strong)"}
                  strokeWidth={isFocus ? 1.5 : 0.8} strokeDasharray="2 2" />
              ) : isClass ? (
                <rect x={-40} y={-10} width={80} height={20} fill="var(--bg-inset)" stroke={isFocus ? "var(--accent)" : "var(--line-strong)"}
                  strokeWidth={isFocus ? 1.5 : 0.8} rx={2} />
              ) : (
                <circle r={18} fill="var(--bg-inset)" stroke={isFocus ? "var(--accent)" : "oklch(0.65 0.16 264)"}
                  strokeWidth={isFocus ? 2 : 1} />
              )}
              <text x={0} y={3} textAnchor="middle" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text)">
                {expandFull ? expand(n) : n}
              </text>
            </g>
          );
        })}
      </svg>

      {focus && (
        <div style={{ background: "var(--bg-inset)", padding: 6, borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 11 }}>
          <div style={{ color: "var(--accent)" }}>focus: {focus}</div>
          {TRIPLES.filter(t => t[0] === focus || t[2] === focus).map(([s, p, o], i) => (
            <div key={i} style={{ color: "var(--text-muted)" }}>
              {s === focus ? "→ " : "← "}{s === focus ? `${p} ${o}` : `${p} from ${s}`}
            </div>
          ))}
        </div>
      )}
      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Each edge is one RDF triple (s, p, o). URIs are global identifiers; Turtle prefixes are syntactic shorthand expanding via `@prefix`.
        Click a node to focus on its neighborhood. Classes (rectangles) are reached via `rdf:type`; literals (dashed boxes) are leaf values.
      </div>
    </div>
  );
}

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 8px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "var(--bg-card)" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer",
  };
}
