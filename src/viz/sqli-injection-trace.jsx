// sqli-injection-trace — Type username/password. Side-by-side: concatenated
// SQL (vulnerable) vs parameterized prepared statement (safe). Toggle defense.
import { useState } from "react";

const PRESETS = {
  normal:    { u: "alice",        p: "secret" },
  bypass:    { u: "admin'--",     p: "anything" },
  always:    { u: "' OR '1'='1",  p: "x" },
  unionx:    { u: "' UNION SELECT user,password FROM users--", p: "x" },
};

function detectInjection(s) {
  return /['";]|--|\bOR\b|\bUNION\b|\bDROP\b/i.test(s);
}

function buildVulnerable(u, p) {
  return `SELECT * FROM users\n  WHERE username='${u}'\n    AND password='${p}'`;
}

function evalVulnerable(u, p) {
  // Heuristic evaluation: if comment present, password part stripped.
  const sqlInjected = detectInjection(u) || detectInjection(p);
  let result;
  if (u.includes("--")) {
    result = "comment strips AND password → MATCH first user (admin?)";
  } else if (/'\s*OR\s*'?\d?'?\s*=\s*'?\d?'?/i.test(u)) {
    result = "tautology '1'='1' → MATCH all users";
  } else if (/UNION/i.test(u)) {
    result = "UNION → returns extra rows (exfiltration)";
  } else if (u === "alice" && p === "secret") {
    result = "no match (heslo nesedí)";
  } else if (sqlInjected) {
    result = "syntax error or no match";
  } else {
    result = "no match";
  }
  return { sqlInjected, result };
}

export default function SqliInjectionTrace() {
  const [u, setU] = useState("admin'--");
  const [p, setP] = useState("anything");
  const [defended, setDefended] = useState(false);

  const vuln = evalVulnerable(u, p);

  const W = 580, H = 240;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center", fontSize: 11 }}>
        <span>username:</span>
        <input value={u} onChange={e => setU(e.target.value)} style={inp} />
        <span>password:</span>
        <input value={p} onChange={e => setP(e.target.value)} style={inp} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", fontSize: 11 }}>
        <span style={{ color: "var(--text-muted)" }}>preset:</span>
        {Object.entries(PRESETS).map(([k, v]) => (
          <button key={k} onClick={() => { setU(v.u); setP(v.p); }} style={btn(false)}>{k}</button>
        ))}
        <label style={{ marginLeft: 10 }}>
          <input type="checkbox" checked={defended} onChange={e => setDefended(e.target.checked)} /> parameterized query
        </label>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Vulnerable side */}
        <rect x={20} y={20} width={270} height={200} rx="4" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={155} y={38} textAnchor="middle" fontSize="11" fontWeight="700" fill={defended ? "var(--text-faint)" : "oklch(0.65 0.18 22)"}>
          {defended ? "vulnerable (off)" : "vulnerable concat"}
        </text>
        <text x={155} y={52} textAnchor="middle" fontSize="9" fill="var(--text-muted)">query = "..." + input + "..."</text>
        <text x={30} y={75} fontSize="9.5" fontFamily="ui-monospace, monospace" fill="var(--text)">cursor.execute(</text>
        {buildVulnerable(u, p).split("\n").map((line, i) => (
          <text key={i} x={40} y={90 + i * 13} fontSize="9.5" fontFamily="ui-monospace, monospace"
            fill={vuln.sqlInjected ? "oklch(0.65 0.18 22)" : "var(--text)"}>
            {line}
          </text>
        ))}
        <text x={30} y={143} fontSize="9.5" fontFamily="ui-monospace, monospace" fill="var(--text)">)</text>
        <rect x={30} y={160} width={240} height={50} rx="3"
          fill={vuln.sqlInjected ? "oklch(0.65 0.18 22 / 0.3)" : "oklch(0.7 0.15 145 / 0.2)"}
          stroke={vuln.sqlInjected ? "oklch(0.65 0.18 22)" : "oklch(0.7 0.15 145)"} />
        <text x={155} y={178} textAnchor="middle" fontSize="10.5" fontWeight="700"
          fill={vuln.sqlInjected ? "oklch(0.65 0.18 22)" : "oklch(0.7 0.15 145)"}>
          {vuln.sqlInjected ? "⚠ SQL INJECTION" : "✓ normal"}
        </text>
        <text x={155} y={193} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{vuln.result}</text>

        {/* Defended side */}
        <rect x={300} y={20} width={260} height={200} rx="4" fill="var(--bg-inset)" stroke="var(--line)" opacity={defended ? 1 : 0.55} />
        <text x={430} y={38} textAnchor="middle" fontSize="11" fontWeight="700" fill={defended ? "oklch(0.7 0.15 145)" : "var(--text-faint)"}>
          parameterized
        </text>
        <text x={430} y={52} textAnchor="middle" fontSize="9" fill="var(--text-muted)">DB driver escape, ne string concat</text>
        <g fontSize="9.5" fontFamily="ui-monospace, monospace" fill={defended ? "var(--text)" : "var(--text-faint)"}>
          <text x={310} y={75}>cursor.execute(</text>
          <text x={320} y={89}>"SELECT * FROM users</text>
          <text x={320} y={103}>   WHERE username = %s</text>
          <text x={320} y={117}>     AND password = %s",</text>
          <text x={320} y={131}>(<tspan fill="var(--accent)">"{u}"</tspan>, <tspan fill="var(--accent)">"{p}"</tspan>))</text>
        </g>
        <text x={320} y={148} fontSize="9" fill="var(--text-faint)">→ values bound as DATA, not SQL</text>
        <rect x={315} y={160} width={230} height={50} rx="3"
          fill="oklch(0.7 0.15 145 / 0.25)"
          stroke="oklch(0.7 0.15 145)" opacity={defended ? 1 : 0.4} />
        <text x={430} y={178} textAnchor="middle" fontSize="10.5" fontWeight="700"
          fill={defended ? "oklch(0.7 0.15 145)" : "var(--text-faint)"}>
          ✓ SAFE
        </text>
        <text x={430} y={193} textAnchor="middle" fontSize="9" fill="var(--text-muted)">input nikdy nezmění SQL strukturu</text>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Concatenace + uživatelský vstup = klasická OWASP A03 injection. Defense: <b>parameterized queries</b> (DB driver odděluje query od dat),
        ORM, prepared statements. <i>Input validation</i> samo nestačí.
      </div>
    </div>
  );
}

const inp = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "3px 6px", borderRadius: 3, fontSize: 11, fontFamily: "ui-monospace, monospace", width: 180 };
function btn(active) {
  return { background: active ? "var(--accent)" : "var(--bg-inset)", color: active ? "white" : "var(--text)", border: "1px solid var(--line)", padding: "2px 7px", borderRadius: 3, fontSize: 10.5, cursor: "pointer" };
}
