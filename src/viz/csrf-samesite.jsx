// csrf-samesite — Cross-origin form POST. Toggle SameSite cookie attribute
// (None / Lax / Strict) + CSRF token. See request blocked or allowed.
import { useState } from "react";

const SAMESITE_OPTS = [
  { v: "None",   note: "no SameSite — cookie posíláno vždy" },
  { v: "Lax",    note: "ne cross-origin POST; GET nav ano (modern default)" },
  { v: "Strict", note: "nikdy cross-origin — i top-level navigation" },
];

export default function CsrfSamesite() {
  const [sameSite, setSameSite] = useState("Lax");
  const [csrfToken, setCsrfToken] = useState(false);
  const [requestType, setRequestType] = useState("post-form"); // post-form, get-img, top-nav

  // Decide: does browser send cookie + does server accept?
  let cookieSent, serverAccepts, blocked;
  if (sameSite === "None") {
    cookieSent = true;
  } else if (sameSite === "Lax") {
    cookieSent = requestType === "top-nav"; // GET top-level navigation only
  } else { // Strict
    cookieSent = false;
  }
  serverAccepts = csrfToken ? false : true; // attacker can't generate token
  if (csrfToken) serverAccepts = false;     // token mismatch

  let verdict, color, explain;
  if (!cookieSent) {
    verdict = "BLOKOVÁNO (cookie nepřiposlaná browserem)";
    color = "oklch(0.7 0.15 145)";
    explain = `SameSite=${sameSite} bránil cross-origin přenos`;
  } else if (csrfToken) {
    verdict = "BLOKOVÁNO (CSRF token mismatch)";
    color = "oklch(0.7 0.15 145)";
    explain = "attacker neumí přečíst session token (same-origin policy) → server odmítne";
  } else {
    verdict = "⚠ ÚTOK ÚSPĚŠNÝ — peníze odeslány";
    color = "oklch(0.65 0.18 22)";
    explain = "browser poslal cookie automaticky; server přijal";
  }

  const W = 580, H = 250;

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 8, fontSize: 11 }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 3 }}>SameSite attribute</div>
          {SAMESITE_OPTS.map(o => (
            <label key={o.v} style={{ display: "block" }}>
              <input type="radio" checked={sameSite === o.v} onChange={() => setSameSite(o.v)} /> {o.v}
            </label>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 3 }}>CSRF token</div>
          <label><input type="checkbox" checked={csrfToken} onChange={e => setCsrfToken(e.target.checked)} /> require token</label>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 3 }}>Útok</div>
          <select value={requestType} onChange={e => setRequestType(e.target.value)} style={ctrl}>
            <option value="post-form">POST form (evil.com)</option>
            <option value="get-img">GET via &lt;img src&gt;</option>
            <option value="top-nav">top-level navigation</option>
          </select>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        {/* Attacker → Victim */}
        <rect x={20} y={30} width={120} height={50} rx="4" fill="oklch(0.65 0.18 22 / 0.15)" stroke="oklch(0.65 0.18 22)" />
        <text x={80} y={48} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--text)">evil.com</text>
        <text x={80} y={64} textAnchor="middle" fontSize="9" fill="var(--text-muted)">attacker site</text>

        <rect x={220} y={30} width={140} height={50} rx="4" fill="oklch(0.65 0.16 245 / 0.15)" stroke="oklch(0.65 0.16 245)" />
        <text x={290} y={48} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--text)">Victim's browser</text>
        <text x={290} y={64} textAnchor="middle" fontSize="9" fill="var(--text-muted)">logged in to bank.com</text>

        <rect x={440} y={30} width={120} height={50} rx="4" fill="oklch(0.7 0.15 145 / 0.15)" stroke="oklch(0.7 0.15 145)" />
        <text x={500} y={48} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="var(--text)">bank.com</text>
        <text x={500} y={64} textAnchor="middle" fontSize="9" fill="var(--text-muted)">target service</text>

        {/* Arrows */}
        <line x1={140} y1={55} x2={220} y2={55} stroke="var(--accent)" strokeWidth="1.5" markerEnd="url(#cs-ar)" />
        <text x={180} y={50} textAnchor="middle" fontSize="9" fill="var(--text-muted)">trigger</text>

        <g stroke={cookieSent ? "oklch(0.65 0.18 22)" : "var(--text-faint)"} strokeWidth="1.5" fill="none">
          <line x1={360} y1={55} x2={440} y2={55} strokeDasharray={cookieSent ? "0" : "3 2"} markerEnd="url(#cs-ar)" />
        </g>
        <text x={400} y={50} textAnchor="middle" fontSize="9"
          fill={cookieSent ? "oklch(0.65 0.18 22)" : "var(--text-faint)"}>
          {cookieSent ? "cookie ✓" : "no cookie"}
        </text>
        <defs>
          <marker id="cs-ar" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L5,3 L0,6 z" fill="currentColor" /></marker>
        </defs>

        {/* Request inspector */}
        <rect x={20} y={100} width={W - 40} height={90} rx="3" fill="var(--bg-inset)" stroke="var(--line)" />
        <text x={30} y={118} fontSize="10.5" fontWeight="700" fill="var(--text)">request inspector</text>
        <g fontFamily="ui-monospace, monospace" fontSize="9.5">
          <text x={30} y={134} fill="var(--text)">POST https://bank.com/transfer HTTP/1.1</text>
          <text x={30} y={148} fill="var(--text)">Origin: https://evil.com</text>
          <text x={30} y={162} fill={cookieSent ? "var(--text)" : "var(--text-faint)"}>
            Cookie: session=abc123 {!cookieSent && "(omitted — SameSite blocked)"}
          </text>
          <text x={30} y={176} fill={csrfToken ? "oklch(0.65 0.18 22)" : "var(--text-muted)"}>
            X-CSRF-Token: {csrfToken ? "—missing—" : "(not required by server)"}
          </text>
        </g>

        {/* Verdict */}
        <rect x={20} y={200} width={W - 40} height={42} rx="3"
          fill={color === "oklch(0.7 0.15 145)" ? "oklch(0.7 0.15 145 / 0.2)" : "oklch(0.65 0.18 22 / 0.2)"}
          stroke={color} strokeWidth="1.5" />
        <text x={W / 2} y={222} textAnchor="middle" fontSize="11" fontWeight="700" fill={color}>{verdict}</text>
        <text x={W / 2} y={236} textAnchor="middle" fontSize="9" fill="var(--text-muted)">{explain}</text>
      </svg>

      <div style={{ marginTop: 6, fontSize: 10.5, color: "var(--text-faint)" }}>
        Klasický CSRF: image / form na evil.com → browser pošle cookies k bank.com → akce za uživatele.
        Moderní default: <b>SameSite=Lax</b> (most browsers since 2020). Pro POST/Strict actions + CSRF token = double-defense.
      </div>
    </div>
  );
}

const ctrl = { background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", padding: "2px 5px", borderRadius: 3, fontSize: 11 };
