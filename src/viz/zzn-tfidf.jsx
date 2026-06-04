// TF-IDF a kosinová podobnost na malé kolekci dokumentů.
// Vyber termín → živě se spočte tf, idf a tf-idf váha; ukáže se kosinová
// podobnost dotazu s každým dokumentem.
import { useState } from "react";

// Malá kolekce 3 krátkých (předzpracovaných) dokumentů + dotaz.
const DOCS = [
  { id: "d1", words: ["data", "data", "mining", "text"] },
  { id: "d2", words: ["text", "mining", "search"] },
  { id: "d3", words: ["data", "search", "search", "index"] },
];
const QUERY = ["data", "mining"];
const VOCAB = ["data", "mining", "text", "search", "index"];
const N = DOCS.length;

// počet dokumentů obsahujících term
function df(term) {
  return DOCS.filter((d) => d.words.includes(term)).length;
}
// tf = počet výskytů termu v dokumentu
function tf(term, doc) {
  return doc.words.filter((w) => w === term).length;
}
// idf = log(N / df)  (přirozený základ — pro pořadí nezáleží)
function idf(term) {
  return Math.log(N / df(term));
}
function tfidf(term, doc) {
  return tf(term, doc) * idf(term);
}
// vektor tf-idf vah přes celý slovník
function vec(words) {
  const doc = { words };
  return VOCAB.map((t) => tf(t, doc) * idf(t));
}
function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export default function ZznTfidf() {
  const [term, setTerm] = useState("data");

  const W = 520, H = 250;
  const colX = [150, 260, 370, 470]; // d1, d2, d3 + idf sloupec
  const docX = [150, 260, 370];

  const qVec = vec(QUERY);
  const sims = DOCS.map((d) => ({ id: d.id, s: cosine(qVec, vec(d.words)) }));
  const maxSim = Math.max(...sims.map((x) => x.s), 0.0001);
  const idfVal = idf(term);
  const dfVal = df(term);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
        <rect width={W} height={H} fill="var(--bg-inset)" />

        {/* hlavička sloupců */}
        <text x={20} y={26} fontSize="12" fontFamily="var(--font-mono)" fill="var(--text-muted)">termín</text>
        {DOCS.map((d, j) => (
          <text key={d.id} x={docX[j]} y={26} textAnchor="middle" fontSize="12"
            fontFamily="var(--font-mono)" fill="var(--text-muted)">{d.id}</text>
        ))}
        <text x={colX[3]} y={26} textAnchor="middle" fontSize="12"
          fontFamily="var(--font-mono)" fill="var(--text-muted)">idf</text>

        {/* řádky slovníku, vybraný termín zvýrazněn */}
        {VOCAB.map((t, i) => {
          const y = 50 + i * 28;
          const active = t === term;
          return (
            <g key={t} onClick={() => setTerm(t)} style={{ cursor: "pointer" }}>
              <rect x={12} y={y - 16} width={W - 24} height={24} rx={3}
                fill={active ? "color-mix(in oklch, var(--accent) 22%, var(--bg-inset))" : "transparent"} />
              <text x={20} y={y} fontSize="12" fontFamily="var(--font-mono)"
                fill={active ? "var(--accent)" : "var(--text)"} fontWeight={active ? "700" : "400"}>{t}</text>
              {DOCS.map((d, j) => {
                const v = tfidf(t, d);
                const tfv = tf(t, d);
                return (
                  <text key={d.id} x={docX[j]} y={y} textAnchor="middle" fontSize="11"
                    fontFamily="var(--font-mono)"
                    fill={tfv === 0 ? "var(--text-faint)" : (active ? "var(--accent)" : "var(--text-muted)")}>
                    {tfv === 0 ? "·" : `${v.toFixed(2)}`}
                  </text>
                );
              })}
              <text x={colX[3]} y={y} textAnchor="middle" fontSize="11" fontFamily="var(--font-mono)"
                fill={active ? "var(--accent)" : "var(--text-faint)"}>{idf(t).toFixed(2)}</text>
            </g>
          );
        })}
      </svg>

      {/* živý rozpis pro vybraný termín */}
      <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
        <div>
          termín <b style={{ color: "var(--accent)" }}>{term}</b>: df = {dfVal} ze {N} dok. ·
          {" "}idf = ln({N}/{dfVal}) = {idfVal.toFixed(3)}
        </div>
        <div>buňka = tf · idf (tečka = termín v dokumentu chybí)</div>
      </div>

      {/* kosinová podobnost dotazu */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ fontSize: 12, color: "var(--text)", fontFamily: "var(--font-mono)" }}>
          dotaz q = {"{ " + QUERY.join(", ") + " }"} — kosinová podobnost s dokumenty:
        </div>
        {sims.map((x) => (
          <div key={x.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 26, fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{x.id}</span>
            <div style={{ flex: 1, height: 12, background: "var(--bg-card)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                width: `${(x.s / maxSim) * 100}%`, height: "100%",
                background: x.s === maxSim ? "var(--accent)" : "var(--accent-line)",
              }} />
            </div>
            <span style={{ width: 42, textAlign: "right", fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              {x.s.toFixed(3)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
