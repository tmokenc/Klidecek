// Bellcore RSA-CRT fault attack: jeden chybny podpis stací k faktorizaci n.
// gcd(S - S', n) = q, pak p = n/q, phi, d.
import { useMemo, useState } from "react";

function modPow(base, exp, mod) {
  let r = 1n;
  base = ((base % mod) + mod) % mod;
  while (exp > 0n) {
    if (exp & 1n) r = (r * base) % mod;
    exp >>= 1n;
    base = (base * base) % mod;
  }
  return r;
}

function gcdBig(a, b) {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) { [a, b] = [b, a % b]; }
  return a;
}

function modInverse(a, m) {
  a = ((a % m) + m) % m;
  let [old_r, r] = [a, m];
  let [old_s, s] = [1n, 0n];
  while (r !== 0n) {
    const q = old_r / r;
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  if (old_r !== 1n) return null;
  return ((old_s % m) + m) % m;
}

const PRESETS = [
  { name: "p=251, q=257  (mala demo)", p: 251n, q: 257n },
  { name: "p=1009, q=1013  (4-cifr.)", p: 1009n, q: 1013n },
  { name: "p=65521, q=65537  (16-bit)", p: 65521n, q: 65537n },
];

export default function BellcoreRsaCrt() {
  const [presetIdx, setPresetIdx] = useState(0);
  const { p, q } = PRESETS[presetIdx];
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  const e = 65537n;
  const d = modInverse(e, phi) || 1n;
  const d_p = d % (p - 1n);
  const d_q = d % (q - 1n);
  const q_inv_p = modInverse(q, p) || 0n;

  const [m, setM] = useState(42n);
  const [faulty, setFaulty] = useState(false);

  // Correct CRT
  const S_p = modPow(m, d_p, p);
  const S_q = modPow(m, d_q, q);
  // Garner: S = S_q + q * ((S_p - S_q) * q_inv_p mod p)
  const h = (((S_p - S_q) % p + p) % p * q_inv_p) % p;
  const S = (S_q + q * h) % n;

  // Faulty: corrupt S_p
  const S_p_bad = (S_p + 1n) % p; // bit-flip equivalent
  const h_bad = (((S_p_bad - S_q) % p + p) % p * q_inv_p) % p;
  const S_bad = (S_q + q * h_bad) % n;

  const diff = S > S_bad ? S - S_bad : S_bad - S;
  const recoveredQ = faulty ? gcdBig(diff, n) : null;
  const recoveredP = recoveredQ && recoveredQ !== 0n ? n / recoveredQ : null;
  const recoveredPhi = recoveredP ? (recoveredP - 1n) * (recoveredQ - 1n) : null;
  const recoveredD = recoveredPhi ? modInverse(e, recoveredPhi) : null;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>preset:</label>
        <select value={presetIdx} onChange={(e) => { setPresetIdx(+e.target.value); setFaulty(false); }} style={{ ...sel, flex: 1, minWidth: 220 }}>
          {PRESETS.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
        </select>
        <label style={lbl}>plaintext m =</label>
        <input type="number" min={2} value={m.toString()} onChange={(e) => setM(BigInt(Math.max(2, Math.min(Number(n) - 1, +e.target.value || 2))))}
          style={{ ...sel, width: 100, fontFamily: "var(--font-mono)" }} />
      </div>

      <div style={{ background: "var(--bg-inset)", borderRadius: 6, padding: 10, fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <div>p = {p.toString()} &nbsp; q = {q.toString()}</div>
        <div>n = p·q = {n.toString()} &nbsp; phi = {phi.toString()}</div>
        <div>e = {e.toString()} &nbsp; d = {d.toString()}</div>
        <div>d_p = d mod (p−1) = {d_p.toString()} &nbsp; d_q = d mod (q−1) = {d_q.toString()}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={panel}>
          <div style={{ fontSize: 11, color: "#81b29a", marginBottom: 4 }}>Korektni CRT vypocet</div>
          <div style={mono}>S_p = m^d_p mod p = {S_p.toString()}</div>
          <div style={mono}>S_q = m^d_q mod q = {S_q.toString()}</div>
          <div style={mono}>S = CRT(S_p, S_q) = <b>{S.toString()}</b></div>
        </div>
        <div style={panel}>
          <div style={{ fontSize: 11, color: "#e07a5f", marginBottom: 4 }}>S chybou v S_p (bit-flip)</div>
          <div style={mono}>S_p' = {S_p_bad.toString()} <span style={{ color: "#e07a5f" }}>← faulted</span></div>
          <div style={mono}>S_q' = {S_q.toString()} <span style={{ color: "var(--text-muted)" }}>(nedoteceno)</span></div>
          <div style={mono}>S' = CRT(S_p', S_q) = <b>{S_bad.toString()}</b></div>
        </div>
      </div>

      <button style={{ ...btn, background: faulty ? "#81b29a" : "var(--accent)", color: "var(--bg-inset)", padding: "8px 16px", fontWeight: 600 }}
        onClick={() => setFaulty(true)} disabled={faulty}>
        {faulty ? "✓ utok proveden" : "→ spocti gcd(S − S', n)"}
      </button>

      {faulty && (
        <div style={{ background: "var(--bg-inset)", borderRadius: 6, padding: 10, fontFamily: "var(--font-mono)", fontSize: 11, borderLeft: "3px solid #81b29a" }}>
          <div>|S − S'| = {diff.toString()}</div>
          <div style={{ color: "#81b29a", fontWeight: 600 }}>gcd(|S − S'|, n) = {recoveredQ.toString()} = q ✓</div>
          <div>p = n / q = {recoveredP.toString()}</div>
          <div>phi = (p−1)(q−1) = {recoveredPhi.toString()}</div>
          <div style={{ color: "#81b29a", fontWeight: 600 }}>
            obnoveny d = e^(−1) mod phi = {recoveredD.toString()} &nbsp;
            {recoveredD === d ? "✓ shodne s puvodnim d" : "✗"}
          </div>
        </div>
      )}

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Klicove pozorovani: S a S' jsou shodne mod q (S_q nezustal nezasaženy), ale lisi se mod p.
        Proto q | (S − S') ale p ∤ (S − S'), takze gcd(|S − S'|, n) = q. <b>Jediny</b> chybny podpis stací
        pro plnou faktorizaci n. Obrana: verify podpisu pred odeslanim (jednou navic exponent e, ktery je maly).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const panel = { background: "var(--bg-inset)", padding: 8, borderRadius: 6, fontSize: 11 };
const mono = { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text)", padding: "1px 0" };
