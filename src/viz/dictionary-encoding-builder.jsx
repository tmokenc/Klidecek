// dictionary-encoding-builder — input a column of strings, show sorted/
// unsorted dictionary, attribute vector with bit-packed valueIDs, and
// total compression ratio.
import { useMemo, useState } from "react";

const W = 552, H = 320;

const INIT = "CZE USA CZE DEU CZE USA GBR CZE FRA CZE USA DEU CZE USA CZE";

function parse(s) {
  return s.split(/[\s,;]+/).map(x => x.trim()).filter(Boolean);
}

function buildDict(values, sorted) {
  const uniq = Array.from(new Set(values));
  if (sorted) uniq.sort();
  const map = new Map(uniq.map((v, i) => [v, i]));
  return { uniq, map };
}

export default function DictionaryEncodingBuilder() {
  const [input, setInput] = useState(INIT);
  const [sorted, setSorted] = useState(true);

  const values = useMemo(() => parse(input), [input]);
  const dict = useMemo(() => buildDict(values, sorted), [values, sorted]);

  const bitsPerId = Math.max(1, Math.ceil(Math.log2(Math.max(1, dict.uniq.length))));
  const avgStrLen = values.reduce((s, v) => s + v.length, 0) / Math.max(1, values.length);

  // Sizes
  const plainBytes = values.reduce((s, v) => s + v.length, 0);
  const dictBytes = dict.uniq.reduce((s, v) => s + v.length, 0);
  const attrBits = values.length * bitsPerId;
  const attrBytes = Math.ceil(attrBits / 8);
  const totalDictEnc = dictBytes + attrBytes;
  const ratio = plainBytes > 0 ? plainBytes / Math.max(1, totalDictEnc) : 0;

  const ids = values.map(v => dict.map.get(v));

  // Visual: dictionary panel + attribute vector strip
  const PAD = 16;
  const dictX = PAD;
  const dictW = 200;
  const dictY = 20;

  const avX = PAD;
  const avY = 200;
  const cellW = Math.max(14, Math.min(28, (W - PAD * 2) / values.length));

  // Bit-packed representation example
  function bitstring(id, bits) {
    return id.toString(2).padStart(bits, "0");
  }
  const allBits = ids.map(id => bitstring(id, bitsPerId)).join("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={2}
        style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line-strong)", padding: 4, resize: "vertical" }} />
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => setSorted(true)} style={btn(sorted)}>sorted dict</button>
        <button onClick={() => setSorted(false)} style={btn(!sorted)}>append-only dict</button>
        <button onClick={() => setInput("anna anna bob carol anna bob anna dave anna anna eve")} style={btn(false)}>names</button>
        <button onClick={() => setInput("M F F M F M F F F M M F F M F F M M F")} style={btn(false)}>gender</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {/* Dictionary panel */}
        <text x={dictX} y={dictY - 4} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">Dictionary ({dict.uniq.length} unique → {bitsPerId} bits/ID)</text>
        <rect x={dictX} y={dictY} width={dictW} height={dict.uniq.length * 16 + 4} fill="var(--bg-inset)" stroke="var(--line)" />
        {dict.uniq.map((v, i) => (
          <g key={v}>
            <text x={dictX + 6} y={dictY + 14 + i * 16} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">{i}:</text>
            <text x={dictX + 26} y={dictY + 14 + i * 16} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">"{v}"</text>
            <text x={dictX + dictW - 6} y={dictY + 14 + i * 16} textAnchor="end" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">{bitstring(i, bitsPerId)}</text>
          </g>
        ))}

        {/* Stats panel */}
        <g transform={`translate(${dictX + dictW + 30}, ${dictY})`}>
          <text x={0} y={0} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">size comparison</text>
          <text x={0} y={18} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">plain (N · avg)</text>
          <text x={140} y={18} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">{plainBytes} B</text>
          <rect x={0} y={22} width={140 * Math.min(1, plainBytes / Math.max(plainBytes, totalDictEnc))} height={8} fill="oklch(0.6 0.18 22)" />

          <text x={0} y={46} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">dict ({dict.uniq.length} strings)</text>
          <text x={140} y={46} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">{dictBytes} B</text>
          <rect x={0} y={50} width={140 * (dictBytes / Math.max(plainBytes, totalDictEnc))} height={8} fill="oklch(0.65 0.16 145)" />

          <text x={0} y={74} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">attr vector ({values.length} × {bitsPerId} bits)</text>
          <text x={140} y={74} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">{attrBytes} B</text>
          <rect x={0} y={78} width={140 * (attrBytes / Math.max(plainBytes, totalDictEnc))} height={8} fill="oklch(0.65 0.16 264)" />

          <text x={0} y={106} fontSize="10" fontFamily="var(--font-mono)" fill="var(--accent)">total encoded = {totalDictEnc} B</text>
          <text x={0} y={124} fontSize="11" fontFamily="var(--font-mono)" fill="var(--accent)">ratio = {ratio.toFixed(2)}× smaller</text>

          <text x={0} y={150} fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">avg str len = {avgStrLen.toFixed(1)} B</text>
        </g>

        {/* Attribute vector */}
        <text x={avX} y={avY - 4} fontSize="11" fontFamily="var(--font-mono)" fill="var(--text)">Attribute vector — bit-packed value IDs</text>
        {values.map((v, i) => (
          <g key={i} transform={`translate(${avX + i * cellW}, ${avY})`}>
            <rect x={0} y={0} width={cellW - 1} height={28} fill="var(--bg-inset)" stroke="var(--line)" />
            <text x={cellW / 2} y={12} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text)">{dict.map.get(v)}</text>
            <text x={cellW / 2} y={24} textAnchor="middle" fontSize="8" fontFamily="var(--font-mono)" fill="var(--text-faint)">{bitstring(dict.map.get(v), bitsPerId)}</text>
          </g>
        ))}

        {/* Bit-packed result */}
        <text x={avX} y={avY + 50} fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">packed bitstream ({allBits.length} bits ≈ {Math.ceil(allBits.length / 8)} bytes):</text>
        <text x={avX} y={avY + 66} fontSize="9" fontFamily="var(--font-mono)" fill="var(--text)">{allBits.match(new RegExp(`.{1,${Math.max(8, bitsPerId * 4)}}`, "g"))?.slice(0, 8).join(" ")}{allBits.length > 64 ? "…" : ""}</text>

        <text x={avX} y={avY + 86} fontSize="9" fontFamily="var(--font-mono)" fill={sorted ? "var(--text-muted)" : "oklch(0.7 0.15 22)"}>
          {sorted
            ? "sorted → O(log n) lookup, range queries possible, but INSERT of new value may resort all IDs."
            : "append-only → fast INSERT (just append), but lookup is O(n) and no range queries on IDs."}
        </text>
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Plain encoding stores each string in full per row (N × avg). Dictionary encoding stores each unique string once + a compact ID per row.
        Compression grows with redundancy: 200 countries → 47× over plain; UUID-like high-cardinality data → no benefit.
      </div>
    </div>
  );
}

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 8px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "var(--bg-card)" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer",
  };
}
