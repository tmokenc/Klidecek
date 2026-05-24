// NIST SP 800-22 playground — monobit, block-frequency, runs, longest-run tests.
// User picks generator + N; sees statistic, p-value, pass/fail.
import { useEffect, useMemo, useState } from "react";

function erf(x) {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1.0 / (1.0 + p * ax);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax);
  return sign * y;
}
function erfc(x) { return 1 - erf(x); }

// Wilson-Hilferty: chi-square upper tail for df=k, value X2
function chi2UpperTail(X2, k) {
  if (X2 <= 0) return 1;
  const z = (Math.cbrt(X2 / k) - (1 - 2 / (9 * k))) / Math.sqrt(2 / (9 * k));
  return 0.5 * erfc(z / Math.SQRT2);
}

// Generators
function genUniform(n) {
  const a = new Array(n);
  for (let i = 0; i < n; i++) a[i] = Math.random() < 0.5 ? 1 : 0;
  return a;
}
function genBiased(n, p) {
  const a = new Array(n);
  for (let i = 0; i < n; i++) a[i] = Math.random() < p ? 1 : 0;
  return a;
}
function genLcg(n, seed) {
  // glibc rand: X = (1103515245*X + 12345) mod 2^31; take bit at position 30 (MSB of 31-bit)
  let x = seed >>> 0;
  const a = new Array(n);
  for (let i = 0; i < n; i++) {
    x = (Math.imul(1103515245, x) + 12345) & 0x7fffffff;
    a[i] = (x >>> 30) & 1;
  }
  return a;
}
function genPeriodic(n, pat) {
  const a = new Array(n);
  for (let i = 0; i < n; i++) a[i] = +pat[i % pat.length];
  return a;
}
function genAesCtr(n) {
  // Pseudo-AES via JS hash-like mixing; passes tests well enough to demo "well-behaved"
  const a = new Array(n);
  let s0 = 0xdeadbeef, s1 = 0x12345678;
  for (let i = 0; i < n; i++) {
    s0 = Math.imul(s0 ^ s1, 0x9e3779b1) | 0;
    s1 = Math.imul(s1 + s0, 0x85ebca6b) | 0;
    a[i] = (s0 >>> 31) & 1;
  }
  return a;
}

// --- Tests ---
function monobit(bits) {
  const n = bits.length;
  let S = 0;
  for (const b of bits) S += b ? 1 : -1;
  const s_obs = Math.abs(S) / Math.sqrt(n);
  const p = erfc(s_obs / Math.SQRT2);
  return { name: "Monobit (frequency)", stat: s_obs, p };
}

function blockFrequency(bits, M) {
  const N = Math.floor(bits.length / M);
  if (N < 2) return null;
  let chi2 = 0;
  for (let i = 0; i < N; i++) {
    let ones = 0;
    for (let j = 0; j < M; j++) ones += bits[i * M + j];
    const pi = ones / M;
    chi2 += (pi - 0.5) ** 2;
  }
  chi2 *= 4 * M;
  const p = chi2UpperTail(chi2, N);
  return { name: `Block frequency (M=${M}, N=${N})`, stat: chi2, p };
}

function runsTest(bits) {
  const n = bits.length;
  const ones = bits.reduce((a, b) => a + b, 0);
  const pi = ones / n;
  if (Math.abs(pi - 0.5) >= 2 / Math.sqrt(n)) {
    return { name: "Runs", stat: pi, p: 0, prereqFail: true };
  }
  let V = 1;
  for (let i = 1; i < n; i++) if (bits[i] !== bits[i - 1]) V++;
  const num = Math.abs(V - 2 * n * pi * (1 - pi));
  const den = 2 * Math.sqrt(2 * n) * pi * (1 - pi);
  const p = erfc(num / den);
  return { name: "Runs", stat: V, p };
}

function longestRunOfOnes(bits) {
  // Simplified for any n: count max run, compare to expected ~log2(n)
  const n = bits.length;
  let maxRun = 0, cur = 0;
  for (const b of bits) {
    if (b === 1) { cur++; if (cur > maxRun) maxRun = cur; }
    else cur = 0;
  }
  const expected = Math.log2(n);
  // Approximate p-value via Gumbel distribution for longest run
  const z = (maxRun - expected) / 1.0;
  const p = Math.exp(-Math.exp(-z * Math.log(2)));
  return { name: "Longest run of ones", stat: maxRun, p, info: `(ocekavano ~${expected.toFixed(1)})` };
}

const GENS = {
  "Uniformni Math.random()": (n) => genUniform(n),
  "Vychyleny min. p=0.55": (n) => genBiased(n, 0.55),
  "Vychyleny min. p=0.7": (n) => genBiased(n, 0.7),
  "LCG glibc-rand": (n) => genLcg(n, 12345),
  "Periodicky 10110100": (n) => genPeriodic(n, "10110100"),
  "Periodicky 1100": (n) => genPeriodic(n, "1100"),
  "AES-like (pseudo)": (n) => genAesCtr(n),
};

export default function NistTestPlayground() {
  const [genKey, setGenKey] = useState(Object.keys(GENS)[0]);
  const [n, setN] = useState(2000);
  const [bits, setBits] = useState(() => GENS[Object.keys(GENS)[0]](2000));

  function regen() {
    setBits(GENS[genKey](n));
  }

  useEffect(() => {
    setBits(GENS[genKey](n));
  }, [genKey, n]);

  const results = useMemo(() => {
    const tests = [
      monobit(bits),
      blockFrequency(bits, Math.max(20, Math.floor(n / 20))),
      runsTest(bits),
      longestRunOfOnes(bits),
    ].filter(Boolean);
    return tests;
  }, [bits, n]);

  const ones = bits.reduce((a, b) => a + b, 0);

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>generator:</label>
        <select value={genKey} onChange={(e) => setGenKey(e.target.value)} style={{ ...sel, flex: 1, minWidth: 200 }}>
          {Object.keys(GENS).map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <label style={lbl}>n =</label>
        <select value={n} onChange={(e) => setN(+e.target.value)} style={sel}>
          <option value={500}>500</option>
          <option value={2000}>2000</option>
          <option value={10000}>10000</option>
        </select>
        <button style={btn} onClick={regen}>↻ nove</button>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
        n_1 = {ones} &nbsp; n_0 = {n - ones} &nbsp; (podil 1: {(ones / n).toFixed(4)})
      </div>

      <div style={{ background: "var(--bg-inset)", borderRadius: 6, padding: 10, fontSize: 12, fontFamily: "var(--font-mono)" }}>
        {results.map((r, i) => {
          const pass = r.p >= 0.01;
          return (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "baseline", padding: "3px 0" }}>
              <span style={{ minWidth: 220 }}>{r.name}:</span>
              <span style={{ minWidth: 80, color: "var(--text-muted)" }}>stat = {typeof r.stat === "number" ? r.stat.toFixed(3) : r.stat}</span>
              <span style={{ minWidth: 100 }}>p = {r.p.toExponential(2)}</span>
              <span style={{ color: pass ? "#81b29a" : "#e07a5f", fontWeight: "bold" }}>{pass ? "PASS" : "FAIL"}</span>
              {r.info && <span style={{ color: "var(--text-muted)", fontSize: 10 }}>{r.info}</span>}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Test prochazi pri p ≥ 0.01 (alpha = 0.01). LCG projde monobit, ale ne dalsi testy s mensimi statistikami;
        periodicky generator selze na runs/longest-run; vychyleny generator selze na monobit i block-frequency.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "5px 12px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
