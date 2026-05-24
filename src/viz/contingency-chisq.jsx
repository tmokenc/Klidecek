// 2x2 / r×c contingency table χ² test of independence.
import { useState } from "react";
import * as S from "./_msp-stats.js";

const PRESETS = {
  smoking: { label: "kuřáctví × rakovina", data: [[80, 120], [20, 280]], rowLabels: ["kuřák", "nekuřák"], colLabels: ["rakovina", "bez"] },
  treatment: { label: "lék × výsledek", data: [[35, 15], [25, 25]], rowLabels: ["lék", "placebo"], colLabels: ["zlepšení", "bez"] },
  three: { label: "3 produkty × 3 regiony", data: [[40, 25, 35], [30, 40, 30], [25, 35, 40]], rowLabels: ["A", "B", "C"], colLabels: ["sever", "stř", "jih"] },
};

export default function ContingencyChisq() {
  const [preset, setPreset] = useState("smoking");
  const [data, setData] = useState(PRESETS.smoking.data);
  const rowLabels = PRESETS[preset].rowLabels;
  const colLabels = PRESETS[preset].colLabels;
  const r = data.length;
  const c = data[0].length;

  // Row/col sums and total
  const rowSums = data.map((row) => row.reduce((a, b) => a + b, 0));
  const colSums = data[0].map((_, j) => data.reduce((s, row) => s + row[j], 0));
  const total = rowSums.reduce((a, b) => a + b, 0);

  // Expected and chi-squared
  const expected = data.map((row, i) => row.map((_, j) => (rowSums[i] * colSums[j]) / total));
  let chi2 = 0, minE = Infinity;
  for (let i = 0; i < r; i++) {
    for (let j = 0; j < c; j++) {
      const e = expected[i][j];
      if (e < minE) minE = e;
      if (e > 0) chi2 += ((data[i][j] - e) ** 2) / e;
    }
  }
  const df = (r - 1) * (c - 1);
  const pval = 1 - S.chi2CDF(chi2, df);
  const crit05 = S.chi2Quantile(0.95, df);
  const reject = chi2 > crit05;

  // Cramér's V
  const cramerV = Math.sqrt(chi2 / (total * Math.min(r - 1, c - 1)));

  function setCell(i, j, v) {
    const v2 = Math.max(0, Math.round(+v) || 0);
    const newData = data.map((row, ii) => row.map((c, jj) => (ii === i && jj === j ? v2 : c)));
    setData(newData);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {Object.entries(PRESETS).map(([k, p]) => (
          <button key={k} onClick={() => { setPreset(k); setData(p.data); }}
            style={btn(preset === k)}>{p.label}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Observed table */}
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-mono)" }}>pozorované Oᵢⱼ</div>
          <table style={{ borderCollapse: "collapse", fontFamily: "var(--font-mono)" }}>
            <thead>
              <tr>
                <th style={th()}></th>
                {colLabels.map((l, j) => <th key={j} style={th()}>{l}</th>)}
                <th style={{ ...th(), color: "var(--text-muted)" }}>Σ</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>
                  <th style={{ ...th(), textAlign: "right" }}>{rowLabels[i]}</th>
                  {row.map((v, j) => (
                    <td key={j} style={tdInput()}>
                      <input type="number" min={0} value={v} onChange={(e) => setCell(i, j, e.target.value)}
                        style={{ width: 50, padding: "2px 4px", fontSize: 11, textAlign: "center", fontFamily: "var(--font-mono)", background: "var(--bg-card)", color: "var(--text)", border: "1px solid var(--line)" }} />
                    </td>
                  ))}
                  <td style={tdSum()}>{rowSums[i]}</td>
                </tr>
              ))}
              <tr>
                <th style={{ ...th(), color: "var(--text-muted)", textAlign: "right" }}>Σ</th>
                {colSums.map((v, j) => <td key={j} style={tdSum()}>{v}</td>)}
                <td style={{ ...tdSum(), fontWeight: "600" }}>{total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Expected table */}
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4, fontFamily: "var(--font-mono)" }}>očekávané Eᵢⱼ = nᵢ·n_·ⱼ/n</div>
          <table style={{ borderCollapse: "collapse", fontFamily: "var(--font-mono)" }}>
            <thead>
              <tr>
                <th style={th()}></th>
                {colLabels.map((l, j) => <th key={j} style={th()}>{l}</th>)}
              </tr>
            </thead>
            <tbody>
              {expected.map((row, i) => (
                <tr key={i}>
                  <th style={{ ...th(), textAlign: "right" }}>{rowLabels[i]}</th>
                  {row.map((v, j) => (
                    <td key={j} style={{ padding: "4px 8px", fontSize: 11, textAlign: "center", color: v < 5 ? "var(--accent-line)" : "var(--text-muted)" }}>{v.toFixed(2)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--text)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
        χ² = Σ (O−E)²/E = <strong>{chi2.toFixed(3)}</strong> · df = (r−1)(c−1) = {df} · χ²₀.₉₅,{df} = {crit05.toFixed(3)} · p = <strong style={{ color: reject ? "var(--accent-line)" : "var(--text)" }}>{pval.toExponential(3)}</strong>
        <br />→ {reject ? <strong style={{ color: "var(--accent-line)" }}>zamítáme nezávislost</strong> : <span>nezamítáme nezávislost</span>}
        {" · "}Cramérovo V = {cramerV.toFixed(3)}
        {minE < 5 && <><br /><span style={{ color: "var(--accent-line)" }}>Pozor:</span> min Eᵢⱼ = {minE.toFixed(2)} &lt; 5; χ² aproximace nemusí platit. Doporučení: Fisherův exaktní test.</>}
      </div>
    </div>
  );
}

function btn(active) { return { padding: "3px 9px", fontSize: 11, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--bg-inset)" : "var(--bg-card)", color: active ? "var(--accent)" : "var(--text)", borderRadius: 4, cursor: "pointer", fontFamily: "var(--font-mono)" }; }
function th() { return { padding: "3px 8px", fontSize: 11, fontWeight: "normal", color: "var(--text-muted)", borderBottom: "1px solid var(--line)" }; }
function tdInput() { return { padding: "2px 4px", textAlign: "center" }; }
function tdSum() { return { padding: "3px 8px", fontSize: 11, textAlign: "center", color: "var(--text-muted)", borderTop: "1px solid var(--line)" }; }
