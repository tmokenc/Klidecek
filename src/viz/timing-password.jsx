// Naivni vs. constant-time porovnani hesla. Naivni vraci po prvnim mismatch
// → cas roste s delkou shody. CT vzdy stejny cas.
import { useState } from "react";

const SECRET = "Correct1";
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function naiveCompareTime(entered, secret) {
  // returns "time in cycles" = position of first mismatch + 1, or 8 if all match
  for (let i = 0; i < secret.length; i++) {
    if (entered[i] !== secret[i]) return i + 1;
  }
  return secret.length + 1;
}

function ctCompareTime(entered, secret) {
  return secret.length + 1;
}

function ctMatches(entered, secret) {
  if (entered.length !== secret.length) return false;
  let diff = 0;
  for (let i = 0; i < secret.length; i++) diff |= entered.charCodeAt(i) ^ secret.charCodeAt(i);
  return diff === 0;
}

export default function TimingPassword() {
  const [guess, setGuess] = useState("");
  const [secret, setSecret] = useState(SECRET);
  const [attackPos, setAttackPos] = useState(0);
  const [recovered, setRecovered] = useState("");

  const padGuess = guess.padEnd(secret.length, " ").slice(0, secret.length);
  const tNaive = naiveCompareTime(padGuess, secret);
  const tCt = ctCompareTime(padGuess, secret);
  const matchNaive = guess === secret;
  const matchCt = ctMatches(guess, secret);

  // Attacker simulation: for each char, find the one giving max naive time at this position
  function attackerStep() {
    const prefix = recovered;
    let bestC = null, bestT = -1;
    for (const c of CHARSET) {
      const candidate = (prefix + c).padEnd(secret.length, " ");
      const t = naiveCompareTime(candidate, secret);
      if (t > bestT) { bestT = t; bestC = c; }
    }
    if (bestT > recovered.length) {
      setRecovered(recovered + bestC);
    }
  }

  function resetAttack() {
    setRecovered("");
  }

  const W = 500, H = 80;
  const maxT = secret.length + 1;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>secret =</label>
        <input value={secret} onChange={(e) => { setSecret(e.target.value); setRecovered(""); }}
          style={{ ...sel, width: 140, fontFamily: "var(--font-mono)" }} />
        <label style={lbl}>tvuj tip =</label>
        <input value={guess} onChange={(e) => setGuess(e.target.value)}
          style={{ ...sel, width: 140, fontFamily: "var(--font-mono)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: "#e07a5f", marginBottom: 4, fontWeight: 600 }}>naivni memcmp (rana exit)</div>
          <svg viewBox={`0 0 ${W/2 - 20} 40`} style={{ width: "100%" }}>
            <rect x={2} y={8} width={(W/2 - 24) * (tNaive / maxT)} height={20} fill="#e07a5f" rx={3} />
            <text x={4} y={22} fontSize="10" fill="var(--bg-inset)" fontFamily="var(--font-mono)" fontWeight="bold">{tNaive} cyklu</text>
          </svg>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", marginTop: 4 }}>match: {matchNaive ? "✓" : "✗"}</div>
        </div>
        <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: "#81b29a", marginBottom: 4, fontWeight: 600 }}>constant-time (cely loop)</div>
          <svg viewBox={`0 0 ${W/2 - 20} 40`} style={{ width: "100%" }}>
            <rect x={2} y={8} width={(W/2 - 24) * (tCt / maxT)} height={20} fill="#81b29a" rx={3} />
            <text x={4} y={22} fontSize="10" fill="var(--bg-inset)" fontFamily="var(--font-mono)" fontWeight="bold">{tCt} cyklu</text>
          </svg>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", marginTop: 4 }}>match: {matchCt ? "✓" : "✗"}</div>
        </div>
      </div>

      <div style={{ borderTop: "1px dashed var(--line)", paddingTop: 8 }}>
        <div style={lbl}>Utocnik (naivni implementace):</div>
        <div style={{ ...row, marginTop: 4 }}>
          <button style={btn} onClick={attackerStep} disabled={recovered.length >= secret.length}>
            ↳ zjisti znak {recovered.length + 1} ({CHARSET.length} pokusu)
          </button>
          <button style={btn} onClick={resetAttack}>reset</button>
        </div>
        <div style={{ fontSize: 14, fontFamily: "var(--font-mono)", marginTop: 6 }}>
          obnoveno: <span style={{ color: "#e07a5f", letterSpacing: 2, fontWeight: "bold" }}>{recovered || "—"}</span>
          {recovered.length > 0 && recovered.length < secret.length && (
            <span style={{ color: "var(--text-muted)" }}>{"_".repeat(secret.length - recovered.length)}</span>
          )}
          {recovered.length === secret.length && (
            <span style={{ color: "#81b29a", marginLeft: 8 }}> ✓ heslo obnoveno za {secret.length} × {CHARSET.length} = {secret.length * CHARSET.length} dotazu</span>
          )}
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Pro 8-znakove heslo: brute-force {CHARSET.length}^8 ≈ 2^48 vs. <b>8 × {CHARSET.length} ≈ 2^9</b> pres timing.
        Zrychleni 10^14×. Constant-time loop (XOR-akumulator) eliminuje leak — pouzij <span style={{ fontFamily: "var(--font-mono)" }}>CRYPTO_memcmp</span> nebo <span style={{ fontFamily: "var(--font-mono)" }}>sodium_memcmp</span>.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
