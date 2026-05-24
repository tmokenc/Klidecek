// Side-by-side same algorithm in Haskell vs Rust.
import { useState } from "react";

const ALGOS = {
  quicksort: {
    haskell: `quicksort :: Ord a =&gt; [a] -&gt; [a]
quicksort []     = []
quicksort (x:xs) = qs smaller ++ [x] ++ qs larger
  where
    smaller = filter (&lt; x) xs
    larger  = filter (&gt;= x) xs
    qs = quicksort`,
    rust: `fn quicksort&lt;T: Ord + Clone&gt;(v: &amp;[T]) -&gt; Vec&lt;T&gt; {
    if v.is_empty() { return vec![]; }
    let x = v[0].clone();
    let smaller: Vec&lt;T&gt; = v[1..].iter()
        .filter(|y| *y &lt; &amp;x).cloned().collect();
    let larger: Vec&lt;T&gt; = v[1..].iter()
        .filter(|y| *y &gt;= &amp;x).cloned().collect();
    let mut out = quicksort(&amp;smaller);
    out.push(x);
    out.extend(quicksort(&amp;larger));
    out
}`,
    diffs: [
      "Haskell: lazy, ADT seznam, pattern match",
      "Rust: ownership + slices + iterator chain",
      "Haskell: ++ je O(n) ale lazy; Rust: Vec::extend in-place",
      "Haskell: Ord type class; Rust: Ord trait + Clone (kvůli ownership)",
    ],
  },
  fib: {
    haskell: `fib :: Int -&gt; Int
fib 0 = 0
fib 1 = 1
fib n = fib (n - 1) + fib (n - 2)

-- Lazy memoization:
fibs :: [Int]
fibs = 0 : 1 : zipWith (+) fibs (tail fibs)`,
    rust: `fn fib(n: u32) -&gt; u64 {
    if n &lt; 2 { return n as u64; }
    fib(n - 1) + fib(n - 2)
}

// Iterativně + memoizace:
fn fibs(n: usize) -&gt; Vec&lt;u64&gt; {
    let mut v = vec![0u64, 1];
    for i in 2..n {
        v.push(v[i - 1] + v[i - 2]);
    }
    v
}`,
    diffs: [
      "Haskell: lazy self-referential definice; Rust: explicit Vec",
      "Haskell: zipWith vrátí lazy stream; Rust: explicit for-loop",
      "Oba: type-safe, ale Haskell má free polymorphism (Num a)",
    ],
  },
  map: {
    haskell: `myMap :: (a -&gt; b) -&gt; [a] -&gt; [b]
myMap _ []     = []
myMap f (x:xs) = f x : myMap f xs

-- Použití:
squares = myMap (^2) [1,2,3,4]`,
    rust: `fn my_map&lt;T, U, F: Fn(&amp;T) -&gt; U&gt;(v: &amp;[T], f: F) -&gt; Vec&lt;U&gt; {
    let mut out = Vec::with_capacity(v.len());
    for x in v {
        out.push(f(x));
    }
    out
}

// Použití:
let squares = my_map(&amp;[1,2,3,4], |x| x * x);

// Idiomaticky:
let squares: Vec&lt;_&gt; = (1..=4).map(|x| x * x).collect();`,
    diffs: [
      "Haskell: rekurze + pattern; Rust: for-loop + Vec",
      "Haskell: HOF přirozené; Rust: F: Fn trait bound",
      "Rust idiomaticky: iterator chain místo manuální rekurze",
    ],
  },
};

export default function RustVsHaskell() {
  const [algo, setAlgo] = useState("quicksort");
  const cur = ALGOS[algo];
  return (
    <div style={ctn}>
      <div style={row}>
        <label style={lbl}>algoritmus:</label>
        {Object.keys(ALGOS).map((k) => (
          <button key={k} style={algo === k ? btnOn : btn} onClick={() => setAlgo(k)}>{k}</button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={col}>
          <div style={colHd}>Haskell</div>
          <pre style={pre} dangerouslySetInnerHTML={{ __html: cur.haskell }} />
        </div>
        <div style={col}>
          <div style={colHd}>Rust</div>
          <pre style={pre} dangerouslySetInnerHTML={{ __html: cur.rust }} />
        </div>
      </div>
      <div style={{ background: "var(--bg-inset)", padding: 10, borderRadius: 6 }}>
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6, fontWeight: 600 }}>klíčové rozdíly:</div>
        {cur.diffs.map((d, i) => (
          <div key={i} style={{ fontSize: 11, color: "var(--text)", padding: "2px 0" }}>• {d}</div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
        Haskell: <em>pure FP, lazy, GC</em>. Rust: <em>multi-paradigm, eager, ownership</em>. Oba sdílejí: <em>strong typing, ADTs, type classes/traits, HOF</em>. Volba podle: výkon (Rust), expresivita (Haskell), ekosystém (oba bohatý).
      </div>
    </div>
  );
}

const ctn = { padding: 14, borderRadius: 10, background: "var(--bg-card)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 10 };
const row = { display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" };
const lbl = { fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" };
const btn = { padding: "4px 10px", background: "var(--bg-inset)", color: "var(--text)", border: "1px solid var(--line)", borderRadius: 5, fontSize: 12, cursor: "pointer" };
const btnOn = { ...btn, background: "var(--accent)", color: "var(--bg-card)", borderColor: "var(--accent)" };
const col = { background: "var(--bg-inset)", padding: 10, borderRadius: 6 };
const colHd = { fontSize: 12, color: "var(--accent)", marginBottom: 6, fontWeight: 600 };
const pre = { fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text)", margin: 0, whiteSpace: "pre" };
