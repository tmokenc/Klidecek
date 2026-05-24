// auto-vectorization-tracer — mini loops; show which GCC/Clang accept.
import { useState } from "react";

const SNIPS = [
  {
    id: "clean",
    label: "(a) čistá smyčka",
    src: "for (int i=0;i<N;i++)\n  c[i] = a[i] + b[i];",
    ok: true,
    reason: "lineární přístup, žádné dependencies",
    asm: "vmovups ymm0, [a+i]\nvaddps  ymm0, ymm0, [b+i]\nvmovups [c+i], ymm0",
  },
  {
    id: "alias",
    label: "(b) možný aliasing ptr",
    src: "void f(int *a,int *b,int *c){\n  for(int i=0;i<N;i++)\n    c[i] = a[i] + b[i];\n}",
    ok: false,
    reason: "kompilátor neví, zda c se nepřekrývá s a/b → potřeba __restrict",
    asm: "// gcc: skalární smyčka\n// + s __restrict: vmovups/vaddps ...",
    fix: "void f(int *__restrict a, int *__restrict b, int *__restrict c){ ... }",
  },
  {
    id: "loopdep",
    label: "(c) loop-carried dep",
    src: "for (int i=1;i<N;i++)\n  a[i] = a[i-1] + b[i];",
    ok: false,
    reason: "a[i] závisí na a[i-1] → nelze parallelizovat",
    asm: "// scalar; prefix-sum vyžaduje speciální algoritmus",
  },
  {
    id: "stride",
    label: "(d) runtime stride",
    src: "for (int i=0;i<N;i++)\n  c[i*s] = a[i] + b[i];",
    ok: false,
    reason: "neznámý stride → gather/scatter (drahé)",
    asm: "// gcc: scalar\n// AVX-512: vscatter — pomalejší než consecutive",
  },
  {
    id: "fcall",
    label: "(e) funkce uvnitř",
    src: "for (int i=0;i<N;i++)\n  c[i] = sqrtf(a[i]);",
    ok: true,
    reason: "intrinsic-friendly funkce — vektorizováno přes SVML",
    asm: "vsqrtps ymm0, [a+i]\nvmovups [c+i], ymm0",
  },
  {
    id: "reduce",
    label: "(f) redukce",
    src: "float s=0;\nfor (int i=0;i<N;i++) s+=a[i];",
    ok: true,
    reason: "horizontální add tree (potřeba -ffast-math pro float)",
    asm: "vaddps ymm_acc, ymm_acc, [a+i]\n// pak vhaddps + vextract",
  },
];

export default function AutoVectorizationTracer() {
  const [sel, setSel] = useState("clean");
  const cur = SNIPS.find(s => s.id === sel);

  const okCount = SNIPS.filter(s => s.ok).length;

  const W = 580, H = 320;
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
        {SNIPS.map(s => (
          <button key={s.id} onClick={() => setSel(s.id)}
            style={{ ...btn(sel === s.id), borderLeft: `4px solid ${s.ok ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.18 22)"}` }}>
            {s.label}
          </button>
        ))}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: 720, background: "var(--bg-card)", borderRadius: 4, fontFamily: "ui-sans-serif, system-ui" }}>
        <text x={20} y={20} fontSize="11" fill="var(--text)" fontWeight="600">zdroj:</text>
        <rect x={20} y={28} width={W - 40} height={90} fill="var(--bg-inset)" stroke="var(--line)" rx="3" />
        <g fontSize="11" fontFamily="ui-monospace, monospace" fill="var(--text)">
          {cur.src.split("\n").map((line, i) => (
            <text key={i} x={28} y={46 + i * 16}>{line}</text>
          ))}
        </g>

        <text x={20} y={140} fontSize="11" fill="var(--text)" fontWeight="600">verdict:</text>
        <rect x={20} y={148} width={W - 40} height={26}
          fill={cur.ok ? "oklch(0.65 0.16 145 / 0.2)" : "oklch(0.65 0.18 22 / 0.2)"}
          stroke={cur.ok ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.18 22)"} rx="3" />
        <text x={30} y={166} fontSize="11" fontWeight="600"
          fill={cur.ok ? "oklch(0.65 0.16 145)" : "oklch(0.65 0.18 22)"}>
          {cur.ok ? "✓ vektorizováno" : "✗ kompilátor odmítá"} — {cur.reason}
        </text>

        <text x={20} y={196} fontSize="11" fill="var(--text)" fontWeight="600">asm (AVX2):</text>
        <rect x={20} y={204} width={W - 40} height={80} fill="var(--bg-inset)" stroke="var(--line)" rx="3" />
        <g fontSize="10.5" fontFamily="ui-monospace, monospace" fill={cur.ok ? "oklch(0.65 0.16 145)" : "var(--text-muted)"}>
          {cur.asm.split("\n").map((line, i) => (
            <text key={i} x={28} y={222 + i * 16}>{line}</text>
          ))}
        </g>

        {cur.fix && (
          <text x={20} y={304} fontSize="10" fill="var(--text-faint)" fontFamily="ui-monospace, monospace">
            fix: {cur.fix.slice(0, 70)}
          </text>
        )}
        <text x={W - 20} y={H - 6} textAnchor="end" fontSize="9" fill="var(--text-faint)">
          {okCount}/{SNIPS.length} smyček vektorizováno auto (GCC -O3 -mavx2 -ftree-vectorize)
        </text>
      </svg>
    </div>
  );
}

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 11, padding: "4px 9px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "white" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer",
  };
}
