// BAC entropy: ICAO 9303 odvozuje 3DES klice z MRZ. Sekvencni passport
// numbery (USA pre-2007) maji ~30 bitu, randomizovane EU ~56 bitu.
import { useMemo, useState } from "react";

const SCHEMES = {
  usa_seq: {
    name: "USA sekvenci (pre-2007)",
    pnEntropy: 14, // ~10000 passports per year × ~year-of-issue → ~14 bits effective
    dobEntropy: 14, // 18-90 yr range, daily granularity → ~14 bits
    expEntropy: 4, // 10yr fixed validity, narrow window → low
    note: "Cisla passportu vydavane sekvenci; utocnik zna lokalne aktualni range.",
  },
  eu_rand: {
    name: "EU randomizovane (od 2009)",
    pnEntropy: 36, // 9 alphanumeric chars, ~36 bits if random
    dobEntropy: 14, // same
    expEntropy: 7, // wider range
    note: "Cisla passportu generovana CSPRNG; uniform v 9-char alphanumeric.",
  },
  cz_eop: {
    name: "CZ eOP (priklad)",
    pnEntropy: 30,
    dobEntropy: 14,
    expEntropy: 7,
    note: "8-9 alphanumeric + check digit; ne plne random ale dostatecne.",
  },
  weak: {
    name: "Slaby system (low-end staty)",
    pnEntropy: 10,
    dobEntropy: 14,
    expEntropy: 4,
    note: "Strukturovana cisla bez randomizace, znamy rocnik vydani.",
  },
};

// Estimated GPU throughput for 3DES BAC key derive + try
const GPU_THROUGHPUT = 1e9; // 10^9 trials/sec per GPU (optimistic)

export default function BacEntropy() {
  const [scheme, setScheme] = useState("usa_seq");
  const s = SCHEMES[scheme];
  const total = s.pnEntropy + s.dobEntropy + s.expEntropy;
  const space = Math.pow(2, total);

  const times = useMemo(() => {
    const T = [
      { name: "1 GPU (RTX 4090)", gpus: 1 },
      { name: "100 GPU (small cluster)", gpus: 100 },
      { name: "1000 GPU (cloud farm)", gpus: 1000 },
      { name: "1M GPU (state-level)", gpus: 1e6 },
    ];
    return T.map((t) => {
      const sec = space / (GPU_THROUGHPUT * t.gpus * 2); // expected (half the space)
      return { ...t, sec };
    });
  }, [space]);

  function fmtTime(sec) {
    if (sec < 1) return (sec * 1000).toFixed(0) + " ms";
    if (sec < 60) return sec.toFixed(1) + " s";
    if (sec < 3600) return (sec / 60).toFixed(1) + " min";
    if (sec < 86400) return (sec / 3600).toFixed(1) + " hod";
    if (sec < 86400 * 365) return (sec / 86400).toFixed(1) + " dni";
    return (sec / (86400 * 365)).toFixed(1) + " let";
  }

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>schema:</label>
        <select value={scheme} onChange={(e) => setScheme(e.target.value)} style={{ ...sel, flex: 1, minWidth: 220 }}>
          {Object.entries(SCHEMES).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
        </select>
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic" }}>{s.note}</div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>passport number (9 znaků)</span><b>{s.pnEntropy} b</b></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>date of birth (YYMMDD)</span><b>{s.dobEntropy} b</b></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>expiry date (YYMMDD)</span><b>{s.expEntropy} b</b></div>
        <div style={{ borderTop: "1px dashed var(--line)", marginTop: 6, paddingTop: 6, display: "flex", justifyContent: "space-between", color: "var(--accent)" }}>
          <span>efektivni entropie</span><b>{total} b</b>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>velikost prostoru</span><b>2^{total} ≈ {space.toExponential(2)}</b>
        </div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={lbl}>ocekavany cas brute-force (poloviční prostor):</div>
        {times.map((t, i) => {
          const tooFast = t.sec < 86400 * 30;
          return (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 11, fontFamily: "var(--font-mono)" }}>
              <span>{t.name}</span>
              <b style={{ color: tooFast ? "#e07a5f" : t.sec < 86400 * 365 * 10 ? "var(--accent)" : "#81b29a" }}>{fmtTime(t.sec)}</b>
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        BAC odvozuje 3DES klice (K_enc, K_mac) z hashe MRZ. Skim trafic (modulujici pole + odposlech UHF)
        umozni offline brute-force. 30 bitu padne za hodiny na GPU; 56 bitu je hranice prakticnosti.
        Od r. 2014 EU pasy pouzivaji <b>PACE</b> (PAKE protokol s ECDH) — nizka entropie hesla nelze do offline utoku.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
