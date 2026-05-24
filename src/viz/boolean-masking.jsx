// Boolean masking: tajny byte s = s0 XOR s1 (... XOR sd). Kazdy share je
// uniform random; utocnik s d probe musi merit vsechny shares soucasne.
import { useMemo, useState } from "react";

function toBin(n) {
  return n.toString(2).padStart(8, "0");
}

export default function BooleanMasking() {
  const [secret, setSecret] = useState(0xa5);
  const [d, setD] = useState(1); // masking order (d=1 → 2 shares)
  const [seed, setSeed] = useState(1);

  // Generate d random shares + last share = XOR
  const shares = useMemo(() => {
    let s = seed >>> 0;
    const random = [];
    for (let i = 0; i < d; i++) {
      s = (Math.imul(s, 1664525) + 1013904223) | 0;
      random.push((s >>> 0) & 0xff);
    }
    let last = secret;
    for (const r of random) last ^= r;
    return [...random, last];
  }, [secret, d, seed]);

  function refresh() { setSeed(Math.floor(Math.random() * 1e6)); }

  // Statistics: with random seed, each share alone has full entropy
  // Display recovery: XOR all shares
  const recovered = shares.reduce((a, b) => a ^ b, 0);
  const sumAllButOne = shares.slice(0, -1).reduce((a, b) => a ^ b, 0);

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>tajny byte s =</label>
        <input type="number" min={0} max={255} value={secret} onChange={(e) => setSecret(Math.max(0, Math.min(255, +e.target.value || 0)))}
          style={{ ...sel, width: 80, fontFamily: "var(--font-mono)" }} />
        <span style={{ ...lbl, color: "var(--accent)" }}>0x{secret.toString(16).padStart(2, "0")} = {toBin(secret)}</span>
        <label style={lbl}>rad d =</label>
        <select value={d} onChange={(e) => setD(+e.target.value)} style={sel}>
          <option value={1}>1 (2 shares)</option>
          <option value={2}>2 (3 shares)</option>
          <option value={3}>3 (4 shares)</option>
        </select>
        <button style={btn} onClick={refresh}>↻ nove masky</button>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
          shares (s_0 = nahodne, ..., s_d = s XOR s_0 XOR ... XOR s_(d−1)):
        </div>
        {shares.map((sh, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "3px 0", fontFamily: "var(--font-mono)", fontSize: 11 }}>
            <span style={{ minWidth: 30, color: "var(--text-muted)" }}>s_{i}</span>
            <span style={{ minWidth: 36, color: "var(--accent)" }}>0x{sh.toString(16).padStart(2, "0")}</span>
            <span style={{ letterSpacing: 1 }}>{toBin(sh)}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 10 }}>{i < shares.length - 1 ? "random" : "= s ⊕ ostatni"}</span>
          </div>
        ))}
        <div style={{ borderTop: "1px dashed var(--line)", marginTop: 6, paddingTop: 6, fontFamily: "var(--font-mono)", fontSize: 11 }}>
          <div>s_0 ⊕ ... ⊕ s_{d} = <b style={{ color: "#81b29a" }}>0x{recovered.toString(16).padStart(2, "0")}</b> {recovered === secret ? "✓ obnoveno" : "✗"}</div>
        </div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>co utocnik vidi (jednotlive probe):</div>
        {shares.map((sh, i) => (
          <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "2px 0", fontFamily: "var(--font-mono)", fontSize: 11 }}>
            <span style={{ minWidth: 60, color: "var(--text-muted)" }}>probe @ s_{i}:</span>
            <span style={{ color: "#e07a5f" }}>0x{sh.toString(16).padStart(2, "0")}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 10 }}>(uniform; bez ostatnich share nic neodhalí)</span>
          </div>
        ))}
        <div style={{ marginTop: 6, fontSize: 11 }}>
          <div style={{ color: "#e07a5f" }}>
            {d}-tý řád: utocnik musí měřit <b>{d + 1}</b> probe SOUCASNE.
            S {d} probe (1. řád DPA na {d + 1}-share masking) → vidi jen XOR {d} sharů = {sumAllButOne.toString(16).padStart(2, "0")} (random, nezávislý na s).
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        d-th order masking je <b>provably secure</b> proti utocnikovi s d−1 probe; <b>d+1</b> probe ho zlomi.
        Cena: AES s 1. radem ≈ 5× pomalejsi, s 2. radem ≈ 25× pomalejsi.
        Linearni operace (XOR, AddRoundKey) jsou snadne; nelinearni (S-box) vyzaduji <i>masked S-box</i> (tabulky × shares).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
