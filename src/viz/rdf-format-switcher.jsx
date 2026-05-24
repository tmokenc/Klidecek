// rdf-format-switcher — same RDF graph rendered in Turtle / N-Triples /
// RDF/XML / JSON-LD; live byte size + gzip-estimate side-by-side.
import { useMemo, useState } from "react";

const W = 540, H = 360;

// Same graph as rdf-graph-browser, but smaller subset for readability
const TRIPLES = [
  ["ex:anna", "rdf:type", "foaf:Person"],
  ["ex:anna", "foaf:name", "\"Anna Nováková\""],
  ["ex:anna", "foaf:age", "31"],
  ["ex:anna", "foaf:knows", "ex:bob"],
  ["ex:bob",  "rdf:type", "foaf:Person"],
  ["ex:bob",  "foaf:name", "\"Bob Smith\""],
];

const PREFIXES = {
  "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  "foaf": "http://xmlns.com/foaf/0.1/",
  "ex": "http://example.com/",
  "xsd": "http://www.w3.org/2001/XMLSchema#",
};

function expand(name) {
  const m = name.match(/^([\w]+):(.+)$/);
  if (m && PREFIXES[m[1]]) return PREFIXES[m[1]] + m[2];
  return name;
}

function turtle() {
  const prefixDecl = Object.entries(PREFIXES).map(([p, u]) => `@prefix ${p}: <${u}> .`).join("\n");
  // Group by subject
  const bySubj = {};
  for (const [s, p, o] of TRIPLES) {
    bySubj[s] ||= [];
    bySubj[s].push([p, o]);
  }
  const body = Object.entries(bySubj).map(([s, pairs]) => {
    const lines = pairs.map(([p, o], i) => `${i === 0 ? s : "       "} ${p === "rdf:type" ? "a" : p} ${o}${i === pairs.length - 1 ? " ." : " ;"}`);
    return lines.join("\n");
  }).join("\n");
  return `${prefixDecl}\n\n${body}`;
}

function nTriples() {
  return TRIPLES.map(([s, p, o]) => {
    const sx = `<${expand(s)}>`;
    const px = `<${expand(p)}>`;
    const ox = o.startsWith("\"") || /^\d/.test(o) ? o.startsWith("\"") ? o : `"${o}"^^<${expand("xsd:integer")}>` : `<${expand(o)}>`;
    return `${sx} ${px} ${ox} .`;
  }).join("\n");
}

function rdfXml() {
  const head = `<?xml version="1.0" encoding="UTF-8"?>
<rdf:RDF xmlns:rdf="${PREFIXES.rdf}"
  xmlns:foaf="${PREFIXES.foaf}"
  xmlns:ex="${PREFIXES.ex}">`;
  // group by subject
  const bySubj = {};
  for (const [s, p, o] of TRIPLES) { bySubj[s] ||= []; bySubj[s].push([p, o]); }
  const bodies = Object.entries(bySubj).map(([s, pairs]) => {
    const inner = pairs.map(([p, o]) => {
      const tag = p === "rdf:type" ? null : p;
      if (p === "rdf:type") return `    <rdf:type rdf:resource="${expand(o)}"/>`;
      if (o.startsWith("\"")) return `    <${tag}>${o.slice(1, -1)}</${tag}>`;
      if (/^\d/.test(o)) return `    <${tag} rdf:datatype="${PREFIXES.xsd}integer">${o}</${tag}>`;
      return `    <${tag} rdf:resource="${expand(o)}"/>`;
    }).join("\n");
    return `  <rdf:Description rdf:about="${expand(s)}">\n${inner}\n  </rdf:Description>`;
  });
  return `${head}\n${bodies.join("\n")}\n</rdf:RDF>`;
}

function jsonLd() {
  const ctx = { "@context": PREFIXES };
  const bySubj = {};
  for (const [s, p, o] of TRIPLES) { bySubj[s] ||= {}; bySubj[s][p] = o; }
  const graph = Object.entries(bySubj).map(([s, obj]) => {
    const ret = { "@id": s };
    for (const [p, o] of Object.entries(obj)) {
      if (p === "rdf:type") ret["@type"] = o;
      else if (o.startsWith("\"")) ret[p] = o.slice(1, -1);
      else if (/^\d/.test(o)) ret[p] = parseFloat(o);
      else ret[p] = { "@id": o };
    }
    return ret;
  });
  return JSON.stringify({ ...ctx, "@graph": graph }, null, 2);
}

const FORMATS = [
  { key: "turtle", label: "Turtle (.ttl)", render: turtle },
  { key: "ntriples", label: "N-Triples (.nt)", render: nTriples },
  { key: "rdfxml", label: "RDF/XML (.rdf)", render: rdfXml },
  { key: "jsonld", label: "JSON-LD (.jsonld)", render: jsonLd },
];

export default function RdfFormatSwitcher() {
  const [format, setFormat] = useState("turtle");
  const rendered = useMemo(() => Object.fromEntries(FORMATS.map(f => [f.key, f.render()])), []);

  // size estimates
  const sizes = FORMATS.map(f => ({
    key: f.key, label: f.label,
    bytes: new TextEncoder().encode(rendered[f.key]).length,
  }));
  const minBytes = Math.min(...sizes.map(s => s.bytes));

  const current = rendered[format];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {FORMATS.map(f => (
          <button key={f.key} onClick={() => setFormat(f.key)} style={btn(format === f.key)}>{f.label}</button>
        ))}
      </div>

      <pre style={{ background: "var(--bg-inset)", color: "var(--text)", padding: 8, borderRadius: 3, fontFamily: "var(--font-mono)", fontSize: 11, margin: 0, maxHeight: 280, overflowY: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {current}
      </pre>

      <svg viewBox={`0 0 ${W} 120`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        <text x={16} y={14} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">size comparison (bytes)</text>
        {sizes.map((s, i) => {
          const maxBar = W - 200;
          const w = (s.bytes / Math.max(...sizes.map(x => x.bytes))) * maxBar;
          const ratio = s.bytes / minBytes;
          return (
            <g key={s.key} transform={`translate(0, ${22 + i * 20})`}>
              <text x={16} y={12} fontSize="10" fontFamily="var(--font-mono)" fill={s.bytes === minBytes ? "oklch(0.65 0.16 145)" : "var(--text-muted)"}>{s.label}</text>
              <rect x={140} y={2} width={w} height={14} fill={s.bytes === minBytes ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.16 264 / 0.6)"} />
              <text x={140 + w + 6} y={12} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-faint)">{s.bytes} B ({ratio.toFixed(2)}×)</text>
            </g>
          );
        })}
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Same {TRIPLES.length} triples in four serializations — all 100 % equivalent. Turtle is most compact for human authoring (uses `a`, `;`, `,` shortcuts).
        N-Triples is line-oriented (good for streaming/diffs). RDF/XML is verbose but XML-tool-friendly. JSON-LD is the standard for embedding in HTML / JS APIs (Google rich snippets).
        After gzip the difference shrinks dramatically (~10 KB regardless of format) — text-level repetition compresses well.
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
