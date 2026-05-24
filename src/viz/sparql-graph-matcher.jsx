// sparql-graph-matcher — small editable SPARQL query over a fixed RDF graph
// with live highlighting of matched edges and a result-bindings table.
// Supports basic patterns: ?var pred ?var ., FILTER (numeric/string), LIMIT,
// OPTIONAL, and a single chained path predicate "/" (one level).
import { useMemo, useState } from "react";

// Triples: (s, p, o); URIs shown short.
const GRAPH = [
  ["anna",  "type",    "Person"],
  ["bob",   "type",    "Person"],
  ["carol", "type",    "Person"],
  ["anna",  "knows",   "bob"],
  ["anna",  "knows",   "carol"],
  ["bob",   "knows",   "carol"],
  ["anna",  "livesIn", "brno"],
  ["bob",   "livesIn", "praha"],
  ["carol", "livesIn", "brno"],
  ["brno",  "type",    "City"],
  ["praha", "type",    "City"],
  ["brno",  "country", "cz"],
  ["praha", "country", "cz"],
  ["cz",    "type",    "Country"],
  ["anna",  "age",     31],
  ["bob",   "age",     42],
  ["carol", "age",     28],
];

const NODES = ["anna", "bob", "carol", "brno", "praha", "cz", "Person", "City", "Country"];

const DEFAULT_QUERY =
`SELECT ?p ?city
WHERE {
  ?p type Person .
  ?p livesIn ?city .
  ?city country cz .
}`;

const EXAMPLES = {
  "friends of friends": `SELECT ?p ?ff
WHERE {
  anna knows ?p .
  ?p knows ?ff .
}`,
  "filter age": `SELECT ?p ?age
WHERE {
  ?p type Person .
  ?p age ?age .
  FILTER (?age > 30)
}`,
  "optional": `SELECT ?p ?city
WHERE {
  ?p type Person .
  OPTIONAL { ?p livesIn ?city }
}`,
};

function isVar(x) { return typeof x === "string" && x.startsWith("?"); }

function parseQuery(src) {
  // VERY small parser: ignore PREFIX, find SELECT vars, WHERE block, OPTIONAL { ... },
  // and FILTER (...).
  const errors = [];
  const m = src.match(/SELECT\s+([\s\S]+?)\s+WHERE\s*\{([\s\S]*)\}\s*(?:LIMIT\s+(\d+))?/i);
  if (!m) { errors.push("Need SELECT … WHERE { … }"); return { errors }; }
  const selectVars = m[1].trim().split(/\s+/).filter(v => v.startsWith("?"));
  const body = m[2].trim();
  const limit = m[3] ? parseInt(m[3], 10) : null;

  // Extract OPTIONAL { ... } blocks
  const opts = [];
  let cleaned = body.replace(/OPTIONAL\s*\{([^}]*)\}/g, (_, inside) => {
    opts.push(inside.trim());
    return "";
  });

  // Extract FILTER (...)
  const filters = [];
  cleaned = cleaned.replace(/FILTER\s*\(([^)]*)\)/g, (_, e) => { filters.push(e.trim()); return ""; });

  function parseTriples(text) {
    return text
      .split(/\s*\.\s*/)
      .map(t => t.trim())
      .filter(Boolean)
      .map(t => {
        const tok = t.split(/\s+/);
        if (tok.length !== 3) { errors.push("Expected 3 tokens per triple: " + t); return null; }
        return tok.map(x => {
          if (x.startsWith("?")) return x;
          if (/^-?\d+(\.\d+)?$/.test(x)) return Number(x);
          return x;
        });
      })
      .filter(Boolean);
  }
  const reqs = parseTriples(cleaned);
  const optTriples = opts.flatMap(parseTriples);
  return { errors, selectVars, reqs, optTriples, filters, limit };
}

function matchTriple(triple, env) {
  // triple = [s, p, o]; env binds ?vars; returns list of new envs.
  const out = [];
  for (const [s, p, o] of GRAPH) {
    const ne = { ...env };
    let ok = true;
    [[triple[0], s], [triple[1], p], [triple[2], o]].forEach(([pat, val]) => {
      if (!ok) return;
      if (isVar(pat)) {
        if (ne[pat] !== undefined && ne[pat] !== val) { ok = false; return; }
        ne[pat] = val;
      } else if (pat !== val) ok = false;
    });
    if (ok) out.push({ env: ne, matchedEdge: [s, p, o] });
  }
  return out;
}

function evalFilters(env, filters) {
  for (const f of filters) {
    try {
      // Substitute ?vars with their bound value (JSON-encoded). Only allow
      // simple boolean expressions.
      let expr = f;
      for (const [k, v] of Object.entries(env)) {
        const re = new RegExp("\\" + k + "(?![A-Za-z0-9_])", "g");
        expr = expr.replace(re, typeof v === "string" ? JSON.stringify(v) : String(v));
      }
      // Allow ==, !=, =, <, >, <=, >=, &&, ||
      expr = expr.replace(/=(?!=)/g, "==");
      // Whitelist tokens
      if (!/^[\d\s\-+*/().<>!=&|"'\w]+$/.test(expr)) return false;
      // eslint-disable-next-line no-new-func
      const ok = Function(`"use strict"; return (${expr})`)();
      if (!ok) return false;
    } catch (e) {
      return false;
    }
  }
  return true;
}

function execute(parsed) {
  let envs = [{}];
  let usedEdges = [];
  for (const t of parsed.reqs) {
    const next = [];
    for (const e of envs) {
      for (const m of matchTriple(t, e)) {
        next.push(m.env);
        usedEdges.push({ edge: m.matchedEdge, env: m.env });
      }
    }
    envs = next;
    if (envs.length === 0) break;
  }
  // OPTIONAL — left outer join
  if (parsed.optTriples.length > 0 && envs.length > 0) {
    envs = envs.map(e => {
      let cur = [e];
      for (const t of parsed.optTriples) {
        const next = [];
        for (const env of cur) {
          const ms = matchTriple(t, env);
          if (ms.length === 0) next.push(env);
          else {
            for (const m of ms) {
              next.push(m.env);
              usedEdges.push({ edge: m.matchedEdge, env: m.env });
            }
          }
        }
        cur = next;
      }
      return cur;
    }).flat();
  }
  // FILTERs
  envs = envs.filter(e => evalFilters(e, parsed.filters));
  if (parsed.limit) envs = envs.slice(0, parsed.limit);
  return { rows: envs, edges: usedEdges };
}

const W = 540, H = 380;

const POS = {
  anna:    [110, 80],
  bob:     [180, 150],
  carol:   [110, 220],
  brno:    [30, 150],
  praha:   [240, 220],
  cz:      [160, 290],
  Person:  [50, 30],
  City:    [50, 280],
  Country: [240, 290],
};

export default function SparqlGraphMatcher() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const parsed = useMemo(() => parseQuery(query), [query]);
  const result = useMemo(() => parsed.errors?.length > 0 || !parsed.reqs ? null : execute(parsed), [parsed]);

  const matchedKeys = new Set();
  if (result) {
    for (const me of result.edges) matchedKeys.add(JSON.stringify(me.edge));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.keys(EXAMPLES).map(k => (
          <button key={k} onClick={() => setQuery(EXAMPLES[k])} style={btn(false)}>{k}</button>
        ))}
        <button onClick={() => setQuery(DEFAULT_QUERY)} style={btn(false)}>reset</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <textarea value={query} onChange={(e) => setQuery(e.target.value)}
          rows={10}
          style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line-strong)", padding: 6, resize: "vertical" }} />

        <svg viewBox={`0 0 280 380`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
          {/* edges */}
          {GRAPH.map(([s, p, o], i) => {
            if (!POS[s] || (typeof o === "number")) return null;
            const target = typeof o === "string" && POS[o] ? POS[o] : null;
            if (!target) return null;
            const matched = matchedKeys.has(JSON.stringify([s, p, o]));
            return (
              <g key={i}>
                <line x1={POS[s][0]} y1={POS[s][1]} x2={target[0]} y2={target[1]}
                  stroke={matched ? "oklch(0.6 0.18 22)" : "var(--line)"}
                  strokeWidth={matched ? 1.6 : 0.6}
                  opacity={matched ? 1 : 0.55} />
                <text x={(POS[s][0] + target[0]) / 2} y={(POS[s][1] + target[1]) / 2 - 2}
                  fontSize="8" fontFamily="var(--font-mono)"
                  fill={matched ? "oklch(0.6 0.18 22)" : "var(--text-faint)"} textAnchor="middle">{p}</text>
              </g>
            );
          })}
          {/* literal age labels */}
          {GRAPH.filter(([, , o]) => typeof o === "number").map(([s, p, o], i) => (
            POS[s] && (
              <text key={i} x={POS[s][0]} y={POS[s][1] - 14} textAnchor="middle"
                fontSize="9" fontFamily="var(--font-mono)" fill="var(--text-muted)">{p}={o}</text>
            )
          ))}

          {/* nodes */}
          {NODES.filter(n => POS[n]).map(n => {
            const isClass = ["Person", "City", "Country"].includes(n);
            return (
              <g key={n}>
                {isClass ? (
                  <rect x={POS[n][0] - 26} y={POS[n][1] - 8} width={52} height={16} fill="var(--bg-inset)" stroke="var(--line-strong)" rx={2} />
                ) : (
                  <circle cx={POS[n][0]} cy={POS[n][1]} r={12} fill="var(--bg-inset)" stroke="var(--accent)" strokeWidth="1" />
                )}
                <text x={POS[n][0]} y={POS[n][1] + 3} fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle" fill="var(--text)">{n}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {parsed.errors?.length > 0 ? (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "oklch(0.6 0.18 22)" }}>
          {parsed.errors.join("; ")}
        </div>
      ) : result && (
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, background: "var(--bg-inset)", padding: 6, borderRadius: 3 }}>
          <div style={{ color: "var(--text-muted)", marginBottom: 4 }}>{result.rows.length} bindings</div>
          {result.rows.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>{parsed.selectVars.map(v => <th key={v} style={{ textAlign: "left", color: "var(--text-muted)", borderBottom: "1px solid var(--line)" }}>{v}</th>)}</tr></thead>
              <tbody>{result.rows.map((env, i) => (
                <tr key={i}>{parsed.selectVars.map(v => <td key={v} style={{ color: env[v] !== undefined ? "var(--text)" : "var(--text-faint)" }}>{env[v] ?? "—"}</td>)}</tr>
              ))}</tbody>
            </table>
          ) : <span style={{ color: "var(--text-faint)" }}>no matches</span>}
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Each triple pattern selects matching edges in the RDF graph; bindings join across patterns (JOIN on shared ?var).
        Try filters (`FILTER (?age &gt; 30)`), OPTIONAL for left outer join, or chain another `?p knows ?ff` to step through the graph.
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
