// Compare Functor / Applicative / Monad over Maybe, List, Either, IO.
import { useState } from "react";

const TYPES = {
  Maybe: {
    functor:     { lhs: "fmap (*2) (Just 5)",                    rhs: "Just 10" },
    fmapNone:    { lhs: "fmap (*2) Nothing",                      rhs: "Nothing" },
    applicative: { lhs: "(+) <$> Just 3 <*> Just 5",              rhs: "Just 8" },
    apFail:      { lhs: "(+) <$> Just 3 <*> Nothing",             rhs: "Nothing" },
    monad:       { lhs: "Just 5 >>= \\x -> Just (x + 1)",         rhs: "Just 6" },
    monadFail:   { lhs: "Nothing >>= \\x -> Just (x + 1)",        rhs: "Nothing" },
    note: "Maybe propaguje Nothing přes celý řetězec.",
  },
  List: {
    functor:     { lhs: "fmap (*2) [1,2,3]",                       rhs: "[2,4,6]" },
    applicative: { lhs: "[(+1), (*2)] <*> [10, 20]",               rhs: "[11, 21, 20, 40]" },
    monad:       { lhs: "[1,2] >>= \\x -> [x, x*10]",              rhs: "[1, 10, 2, 20]" },
    note: "List monad = nedeterminismus, vrací VŠECHNY možnosti.",
  },
  "Either e": {
    functor:     { lhs: "fmap (*2) (Right 5)",                     rhs: "Right 10" },
    fmapL:       { lhs: "fmap (*2) (Left \"err\")",                rhs: "Left \"err\"" },
    applicative: { lhs: "(+) <$> Right 3 <*> Right 5",             rhs: "Right 8" },
    apFail:      { lhs: "(+) <$> Right 3 <*> Left \"oops\"",        rhs: "Left \"oops\"" },
    monad:       { lhs: "Right 5 >>= \\x -> Right (x+1)",          rhs: "Right 6" },
    monadFail:   { lhs: "Left \"e\" >>= \\x -> Right (x+1)",        rhs: "Left \"e\"" },
    note: "Either nese error zprávu, jinak chování jako Maybe.",
  },
  IO: {
    functor:     { lhs: "fmap show getLine",                        rhs: "IO String" },
    applicative: { lhs: "(++) <$> getLine <*> getLine",              rhs: "IO String — 2 řádky vstupu" },
    monad:       { lhs: "getLine >>= putStrLn",                      rhs: "IO () — echo" },
    note: "IO sekvencuje akce. >>= zaručí pořadí (kritické u efektů).",
  },
};

export default function FunctorApplicativeMonad() {
  const [type, setType] = useState("Maybe");
  const cur = TYPES[type];

  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>typ:</label>
        {Object.keys(TYPES).map((t) => (
          <button key={t} style={type === t ? btnOn : btn} onClick={() => setType(t)}>{t}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
        <div style={layer}>
          <div style={layerHd}>Functor — <code style={mono}>fmap :: (a -&gt; b) -&gt; f a -&gt; f b</code></div>
          <div style={ex}>{cur.functor.lhs} <span style={arr}>→</span> <span style={res}>{cur.functor.rhs}</span></div>
          {cur.fmapNone && <div style={ex}>{cur.fmapNone.lhs} <span style={arr}>→</span> <span style={resGray}>{cur.fmapNone.rhs}</span></div>}
          {cur.fmapL && <div style={ex}>{cur.fmapL.lhs} <span style={arr}>→</span> <span style={resGray}>{cur.fmapL.rhs}</span></div>}
        </div>
        <div style={layer}>
          <div style={layerHd}>Applicative — <code style={mono}>(&lt;*&gt;) :: f (a -&gt; b) -&gt; f a -&gt; f b</code></div>
          <div style={ex}>{cur.applicative.lhs} <span style={arr}>→</span> <span style={res}>{cur.applicative.rhs}</span></div>
          {cur.apFail && <div style={ex}>{cur.apFail.lhs} <span style={arr}>→</span> <span style={resGray}>{cur.apFail.rhs}</span></div>}
        </div>
        <div style={layer}>
          <div style={layerHd}>Monad — <code style={mono}>(&gt;&gt;=) :: m a -&gt; (a -&gt; m b) -&gt; m b</code></div>
          <div style={ex}>{cur.monad.lhs} <span style={arr}>→</span> <span style={res}>{cur.monad.rhs}</span></div>
          {cur.monadFail && <div style={ex}>{cur.monadFail.lhs} <span style={arr}>→</span> <span style={resGray}>{cur.monadFail.rhs}</span></div>}
        </div>
      </div>

      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6, fontSize: 11, color: "var(--text-muted)" }}>
        {cur.note}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Síla roste: Functor ⊂ Applicative ⊂ Monad. Monad umí volit <em>další krok podle hodnoty předchozího</em> (a -&gt; m b), Applicative jen kombinuje paralelně. Functor jen aplikuje čistou funkci dovnitř.
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const btnOn = { ...btn, background: "var(--accent)", color: "var(--bg-card)", borderColor: "var(--accent)" };
const layer = { background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
const layerHd = { fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 };
const ex = { fontFamily: "var(--font-mono)", fontSize: 12, padding: "2px 0", color: "var(--text)" };
const arr = { color: "var(--text-muted)", margin: "0 6px" };
const res = { color: "rgb(64,192,87)" };
const resGray = { color: "var(--text-muted)" };
const mono = { fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)" };
