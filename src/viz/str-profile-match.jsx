// STR profile match: 13 CODIS loci, suspect vs crime scene.
// Exclusion test + random match probability.
import { useMemo, useState } from "react";

// 13 core CODIS loci with rough allele frequencies (simplified)
const LOCI = [
  { name: "D3S1358",  alleles: [14, 15, 16, 17, 18], freq: [0.10, 0.25, 0.25, 0.20, 0.20] },
  { name: "vWA",      alleles: [14, 15, 16, 17, 18, 19], freq: [0.10, 0.12, 0.25, 0.28, 0.15, 0.10] },
  { name: "FGA",      alleles: [19, 20, 21, 22, 23, 24], freq: [0.06, 0.10, 0.20, 0.20, 0.22, 0.22] },
  { name: "D8S1179",  alleles: [10, 11, 12, 13, 14, 15], freq: [0.08, 0.07, 0.15, 0.32, 0.22, 0.16] },
  { name: "D21S11",   alleles: [28, 29, 30, 31, 32], freq: [0.12, 0.20, 0.27, 0.08, 0.33] },
  { name: "D18S51",   alleles: [12, 13, 14, 15, 16, 17, 18], freq: [0.13, 0.13, 0.16, 0.15, 0.14, 0.15, 0.14] },
  { name: "D5S818",   alleles: [9, 10, 11, 12, 13], freq: [0.03, 0.06, 0.40, 0.38, 0.13] },
  { name: "D13S317",  alleles: [8, 9, 10, 11, 12, 13], freq: [0.10, 0.07, 0.05, 0.32, 0.32, 0.14] },
  { name: "D7S820",   alleles: [8, 9, 10, 11, 12, 13], freq: [0.16, 0.14, 0.25, 0.20, 0.16, 0.09] },
  { name: "D16S539",  alleles: [9, 10, 11, 12, 13], freq: [0.11, 0.06, 0.32, 0.29, 0.22] },
  { name: "TH01",     alleles: [6, 7, 8, 9, 10], freq: [0.23, 0.18, 0.10, 0.15, 0.34] },
  { name: "TPOX",     alleles: [8, 9, 10, 11], freq: [0.53, 0.10, 0.05, 0.31] },
  { name: "CSF1PO",   alleles: [10, 11, 12, 13], freq: [0.22, 0.31, 0.34, 0.13] },
];

function mulberry32(a) { return function() { a |= 0; a = a + 0x6D2B79F5 | 0; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function sampleAllele(locus, rnd) {
  const r = rnd();
  let cum = 0;
  for (let i = 0; i < locus.freq.length; i++) {
    cum += locus.freq[i];
    if (r < cum) return locus.alleles[i];
  }
  return locus.alleles[locus.alleles.length - 1];
}
function genProfile(seed) {
  const rnd = mulberry32(seed);
  return LOCI.map((L) => {
    const a1 = sampleAllele(L, rnd);
    const a2 = sampleAllele(L, rnd);
    return [Math.min(a1, a2), Math.max(a1, a2)];
  });
}

// Probability of observing allele a at locus L
function pAllele(L, a) {
  const i = L.alleles.indexOf(a);
  return i >= 0 ? L.freq[i] : 0.01;
}
// Random match probability for a genotype (a1, a2) at locus
function genotypeFreq(L, geno) {
  const p1 = pAllele(L, geno[0]);
  const p2 = pAllele(L, geno[1]);
  return geno[0] === geno[1] ? p1 * p1 : 2 * p1 * p2;
}

export default function StrProfileMatch() {
  const [scenario, setScenario] = useState("match");
  const [twins, setTwins] = useState(false);

  const crime = useMemo(() => genProfile(123), []);
  const suspect = useMemo(() => {
    if (scenario === "match" || twins) return crime; // identical
    if (scenario === "exclusion") {
      // Different person — but tweak just one locus for clarity
      const p = genProfile(123).map(g => g.slice());
      p[3] = [12, 14]; // intentionally different at D8S1179
      return p;
    }
    // unrelated
    return genProfile(7777);
  }, [scenario, crime, twins]);

  const compared = LOCI.map((L, i) => ({
    name: L.name,
    crime: crime[i],
    suspect: suspect[i],
    match: crime[i][0] === suspect[i][0] && crime[i][1] === suspect[i][1],
    freq: genotypeFreq(L, crime[i]),
  }));

  const allMatch = compared.every(c => c.match);
  const matchProb = compared.reduce((acc, c) => acc * c.freq, 1);
  // Express as "1 in N"
  const inN = 1 / matchProb;

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>scénář:</label>
        <select value={scenario} onChange={(e) => setScenario(e.target.value)} style={sel}>
          <option value="match">match (podezřelý zanechal stopu)</option>
          <option value="exclusion">vyloučení (1 lokus odlišný)</option>
          <option value="unrelated">unrelated (zcela jiný profil)</option>
        </select>
        <label style={{ ...lbl, display: "flex", alignItems: "center", gap: 4 }}>
          <input type="checkbox" checked={twins} onChange={(e) => setTwins(e.target.checked)} />
          identická dvojčata
        </label>
      </div>

      <div style={{ background: "var(--bg-inset)", borderRadius: 6, padding: 10 }}>
        <table style={tbl}>
          <thead><tr><th style={th}>locus</th><th style={th}>crime scene</th><th style={th}>suspect</th><th style={th}>match?</th><th style={th}>freq</th></tr></thead>
          <tbody>
            {compared.map((c, i) => (
              <tr key={i}>
                <td style={td}>{c.name}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{c.crime[0]},{c.crime[1]}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)" }}>{c.suspect[0]},{c.suspect[1]}</td>
                <td style={{ ...td, color: c.match ? "rgb(64,192,87)" : "rgb(220,80,80)" }}>{c.match ? "✓" : "✗"}</td>
                <td style={{ ...td, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{c.freq.toExponential(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={statBox}>
          <div style={statLbl}>shoda všech 13 loci</div>
          <div style={{ ...statVal, color: allMatch ? "rgb(64,192,87)" : "rgb(220,80,80)" }}>
            {allMatch ? "ANO — žádné vyloučení" : "NE — vyloučení"}
          </div>
        </div>
        <div style={statBox}>
          <div style={statLbl}>random match probability</div>
          <div style={statVal}>
            {allMatch ? <>1 v {inN.toExponential(2)}</> : "N/A"}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Match = všechny lokusy musí mít stejné dva allely. <b>Jeden</b> nesoulad → vyloučení.
        Pro 13 CODIS lokusů RMP ≈ 10⁻¹³–10⁻²⁰ pro unrelated osoby — silnější než populace Země.
        <b>Identická dvojčata</b> mají prakticky identický profil STR — vyžadují SNP / epigenetický rozdíl.
        Allelové frekvence se liší podle populace (CZ ≠ Japan ≠ Africa) — v soudu se používá databáze cílové populace.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const tbl = { width: "100%", borderCollapse: "collapse", fontSize: 11.5 };
const th = { textAlign: "left", padding: "3px 6px", color: "var(--text-muted)", fontSize: 10.5, fontWeight: 500, borderBottom: "1px solid var(--line)" };
const td = { padding: "2px 6px" };
const statBox = { background: "var(--bg-inset)", padding: 10, borderRadius: 6, textAlign: "center" };
const statLbl = { fontSize: 10, color: "var(--text-muted)" };
const statVal = { fontSize: 14, fontWeight: 600, fontFamily: "var(--font-mono)", marginTop: 4 };
