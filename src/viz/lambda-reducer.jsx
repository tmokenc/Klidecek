// Step-through beta reducer over a small lambda calculus.
// Highlights redexes; toggle normal vs applicative order; tracks alpha-renames.
import { useMemo, useState } from "react";

// AST: { t:"var", n } | { t:"abs", p, b } | { t:"app", f, a }

function parse(src) {
  let i = 0;
  const tok = () => { while (src[i] === " ") i++; };
  const ident = () => {
    tok();
    let s = "";
    while (i < src.length && /[A-Za-z0-9_]/.test(src[i])) s += src[i++];
    return s;
  };
  function parseExpr() {
    tok();
    let head = parseAtom();
    while (true) {
      tok();
      if (i >= src.length || src[i] === ")" || src[i] === ".") break;
      const arg = parseAtom();
      head = { t: "app", f: head, a: arg };
    }
    return head;
  }
  function parseAtom() {
    tok();
    if (src[i] === "(") { i++; const e = parseExpr(); tok(); if (src[i] === ")") i++; return e; }
    if (src[i] === "\\" || src[i] === "λ") {
      i++;
      const params = [];
      while (true) { tok(); const n = ident(); if (!n) break; params.push(n); tok(); if (src[i] === ".") { i++; break; } }
      let body = parseExpr();
      for (let k = params.length - 1; k >= 0; k--) body = { t: "abs", p: params[k], b: body };
      return body;
    }
    const n = ident();
    return { t: "var", n };
  }
  return parseExpr();
}

function show(e, p = 0) {
  if (e.t === "var") return e.n;
  if (e.t === "abs") {
    const params = [e.p];
    let body = e.b;
    while (body.t === "abs") { params.push(body.p); body = body.b; }
    const s = "λ" + params.join(" ") + ". " + show(body, 0);
    return p > 0 ? "(" + s + ")" : s;
  }
  // app
  const fs = show(e.f, 1);
  const as = show(e.a, 2);
  const s = fs + " " + as;
  return p > 1 ? "(" + s + ")" : s;
}

function fv(e) {
  if (e.t === "var") return new Set([e.n]);
  if (e.t === "abs") { const s = fv(e.b); s.delete(e.p); return s; }
  return new Set([...fv(e.f), ...fv(e.a)]);
}

let counter = 0;
function fresh(base, avoid) {
  let n = base + "'";
  while (avoid.has(n)) { n = base + (counter++); }
  return n;
}

function sub(e, x, v) {
  if (e.t === "var") return e.n === x ? v : e;
  if (e.t === "abs") {
    if (e.p === x) return e;
    const vfv = fv(v);
    if (vfv.has(e.p)) {
      const p2 = fresh(e.p, new Set([...vfv, ...fv(e.b), x]));
      const renamed = sub(e.b, e.p, { t: "var", n: p2 });
      return { t: "abs", p: p2, b: sub(renamed, x, v) };
    }
    return { t: "abs", p: e.p, b: sub(e.b, x, v) };
  }
  return { t: "app", f: sub(e.f, x, v), a: sub(e.a, x, v) };
}

// Returns [newExpr, didReduce] using normal or applicative order
function step(e, normal) {
  if (e.t === "var") return [e, false];
  if (normal) {
    if (e.t === "app" && e.f.t === "abs") return [sub(e.f.b, e.f.p, e.a), true];
    if (e.t === "app") {
      const [nf, ok] = step(e.f, true);
      if (ok) return [{ t: "app", f: nf, a: e.a }, true];
      const [na, ok2] = step(e.a, true);
      if (ok2) return [{ t: "app", f: e.f, a: na }, true];
    }
    if (e.t === "abs") {
      const [nb, ok] = step(e.b, true);
      if (ok) return [{ t: "abs", p: e.p, b: nb }, true];
    }
    return [e, false];
  }
  // applicative: reduce args first
  if (e.t === "app") {
    const [nf, ok] = step(e.f, false);
    if (ok) return [{ t: "app", f: nf, a: e.a }, true];
    const [na, ok2] = step(e.a, false);
    if (ok2) return [{ t: "app", f: e.f, a: na }, true];
    if (e.f.t === "abs") return [sub(e.f.b, e.f.p, e.a), true];
  }
  if (e.t === "abs") {
    const [nb, ok] = step(e.b, false);
    if (ok) return [{ t: "abs", p: e.p, b: nb }, true];
  }
  return [e, false];
}

const PRESETS = {
  "id-app":   { src: "(\\x. x) y",                              desc: "identita aplikovaná na y" },
  "k-comb":   { src: "(\\x y. x) a b",                          desc: "K kombinátor (FIRST)" },
  "skk":      { src: "(\\f g x. f x (g x)) (\\x y. x) (\\x y. x) z", desc: "S K K z = z (SKK = I)" },
  "succ-two": { src: "(\\n f x. f (n f x)) (\\f x. f (f x))",   desc: "SUCC TWO → THREE" },
  "omega":    { src: "(\\x. x x) (\\x. x x)",                   desc: "Omega (nekonečně se redukuje)" },
  "and-tt":   { src: "(\\p q. p q (\\x y. y)) (\\x y. x) (\\x y. x)", desc: "AND TRUE TRUE → TRUE" },
};

export default function LambdaReducer() {
  const [preset, setPreset] = useState("succ-two");
  const [src, setSrc] = useState(PRESETS["succ-two"].src);
  const [normal, setNormal] = useState(true);
  const [maxSteps, setMaxSteps] = useState(20);

  const reduce = useMemo(() => {
    try {
      counter = 0;
      let e = parse(src);
      const trace = [show(e)];
      let i = 0;
      let stuck = false;
      while (i < maxSteps) {
        const [ne, ok] = step(e, normal);
        if (!ok) { stuck = true; break; }
        e = ne;
        trace.push(show(e));
        i++;
      }
      return { trace, stuck, final: show(e) };
    } catch (err) {
      return { trace: ["<parse error>"], stuck: true, final: "" };
    }
  }, [src, normal, maxSteps]);

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>preset:</label>
        <select value={preset} onChange={(e) => { setPreset(e.target.value); setSrc(PRESETS[e.target.value].src); }} style={sel}>
          {Object.entries(PRESETS).map(([k, v]) => <option key={k} value={k}>{v.desc}</option>)}
        </select>
      </div>
      <input value={src} onChange={(e) => setSrc(e.target.value)} style={inp} spellCheck={false} />
      <div style={row}>
        <label style={lbl}>strategie:</label>
        <button style={normal ? btnOn : btn} onClick={() => setNormal(true)}>normal-order</button>
        <button style={!normal ? btnOn : btn} onClick={() => setNormal(false)}>applicative</button>
        <span style={{ ...lbl, marginLeft: 12 }}>max kroků:</span>
        <input type="number" value={maxSteps} min="1" max="200" onChange={(e) => setMaxSteps(parseInt(e.target.value) || 1)} style={{ ...inp, width: 70 }} />
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, maxHeight: 280, overflowY: "auto" }}>
        {reduce.trace.map((t, i) => (
          <div key={i} style={{ display: "flex", gap: 8, fontFamily: "var(--font-mono)", fontSize: 12, padding: "2px 0", borderBottom: i < reduce.trace.length - 1 ? "1px dashed var(--line)" : "none" }}>
            <span style={{ color: "var(--text-muted)", minWidth: 28 }}>{i === 0 ? "in:" : "β" + i}</span>
            <span style={{ color: i === reduce.trace.length - 1 ? "var(--accent)" : "var(--text)" }}>{t}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        {reduce.stuck ? "→ normální forma (nelze redukovat dál)" : `→ zastaveno na ${maxSteps} krocích — možná divergence (Ω, Y g)`}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Syntax: <code style={mono}>\x. x</code> nebo <code style={mono}>λx. x</code>; aplikace levo-asociativní; vícero parametrů <code style={mono}>\x y z. ...</code>
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const sel = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12 };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const btnOn = { ...btn, background: "var(--accent)", color: "var(--bg-card)", borderColor: "var(--accent)" };
const inp = { padding: "4px 8px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, fontFamily: "var(--font-mono)", flex: 1, minWidth: 200 };
const mono = { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" };
