// css-xpath-playground — tiny HTML DOM rendered as a tree; type a CSS
// selector or XPath, see matched nodes highlighted. Side-by-side regex
// example showing how a small markup change breaks it.
import { useMemo, useState } from "react";

const W = 540, H = 360;

// Sample DOM as nested object
const DOM = {
  tag: "html",
  children: [
    { tag: "head", children: [{ tag: "title", text: "Catalog" }] },
    { tag: "body", children: [
      { tag: "h1", text: "Products" },
      { tag: "div", attrs: { id: "list", class: "products" }, children: [
        { tag: "div", attrs: { class: "product", "data-id": "1" }, children: [
          { tag: "h2", text: "Pilsner Urquell" },
          { tag: "span", attrs: { class: "price" }, text: "50 Kč" },
        ]},
        { tag: "div", attrs: { class: "product featured", "data-id": "2" }, children: [
          { tag: "h2", text: "Budvar" },
          { tag: "span", attrs: { class: "price" }, text: "45 Kč" },
        ]},
        { tag: "div", attrs: { class: "product", "data-id": "3" }, children: [
          { tag: "h2", text: "Becherovka" },
          { tag: "span", attrs: { class: "price discounted" }, text: "120 Kč" },
        ]},
      ]},
      { tag: "footer", text: "© 2025" },
    ]},
  ],
};

function walk(node, parent = null, depth = 0, path = [], all = []) {
  const enriched = { ...node, parent, depth, path };
  all.push(enriched);
  if (node.children) {
    node.children.forEach((c, i) => walk(c, enriched, depth + 1, [...path, i], all));
  }
  return all;
}

// Tiny CSS selector matcher: supports tag, .class, #id, [attr], [attr=value], > descendant
function matchCss(selector, all) {
  selector = selector.trim();
  if (!selector) return new Set();
  const tokens = selector.split(/\s+/);
  function matchSimple(node, tok) {
    if (tok === "*") return true;
    let s = tok;
    if (/^[a-z]+/.test(s)) {
      const m = s.match(/^([a-z]+)/);
      if (m && node.tag !== m[1]) return false;
      s = s.replace(/^[a-z]+/, "");
    }
    while (s.length > 0) {
      if (s[0] === "#") {
        const m = s.match(/^#([\w-]+)/);
        if (!m || node.attrs?.id !== m[1]) return false;
        s = s.slice(m[0].length);
      } else if (s[0] === ".") {
        const m = s.match(/^\.([\w-]+)/);
        if (!m) return false;
        const classes = (node.attrs?.class || "").split(/\s+/);
        if (!classes.includes(m[1])) return false;
        s = s.slice(m[0].length);
      } else if (s[0] === "[") {
        const m = s.match(/^\[([\w-]+)(?:[=](["']?)([^"'\]]+)\2)?\]/);
        if (!m) return false;
        const [, k, , v] = m;
        if (node.attrs?.[k] === undefined) return false;
        if (v !== undefined && String(node.attrs[k]) !== v) return false;
        s = s.slice(m[0].length);
      } else {
        return false;
      }
    }
    return true;
  }
  // For multi-token "a b" — descendant; "a > b" — child
  function matches(node) {
    let n = node;
    for (let i = tokens.length - 1; i >= 0; i--) {
      const t = tokens[i];
      if (t === ">") continue;
      if (!matchSimple(n, t)) {
        // climb ancestors only if not direct-child requirement
        if (i + 1 < tokens.length && tokens[i + 1] === ">") return false;
        let anc = n.parent;
        while (anc) {
          if (matchSimple(anc, t)) { n = anc; break; }
          anc = anc.parent;
        }
        if (!anc) return false;
      } else {
        if (i > 0) {
          if (tokens[i - 1] === ">") { n = n.parent; i--; }
          else n = n.parent;
        }
      }
    }
    return true;
  }
  return new Set(all.filter(matches));
}

// Tiny XPath matcher: //tag, //tag[@attr], //tag[@attr="value"], //tag/text(),
// /html/body/div[1], //*[contains(@class, "x")]
function matchXpath(expr, all) {
  expr = expr.trim();
  if (!expr) return new Set();
  // Absolute /html/...
  let path = expr;
  let recursive = false;
  if (path.startsWith("//")) { recursive = true; path = path.slice(2); }
  else if (path.startsWith("/")) { path = path.slice(1); }
  const steps = [];
  // tokenize by /
  let depth = 0, buf = "";
  for (const ch of path) {
    if (ch === "[") depth++;
    if (ch === "]") depth--;
    if (ch === "/" && depth === 0) { steps.push(buf); buf = ""; }
    else buf += ch;
  }
  if (buf) steps.push(buf);

  function matchStep(node, step) {
    const m = step.match(/^([a-z*]+|\*)?\s*(\[.+\])?$/i);
    if (!m) return false;
    const [, tag, predicate] = m;
    if (tag && tag !== "*" && node.tag !== tag) return false;
    if (predicate) {
      // [@attr=value]
      const a = predicate.match(/\[@([\w-]+)(?:\s*=\s*(["'])([^"']*)\2)?\]/);
      if (a) {
        const [, k, , v] = a;
        if (node.attrs?.[k] === undefined) return false;
        if (v !== undefined && String(node.attrs[k]) !== v) return false;
        return true;
      }
      // [contains(@attr, "val")]
      const c = predicate.match(/\[contains\(@([\w-]+),\s*(["'])([^"']+)\2\)\]/);
      if (c) {
        const [, k, , v] = c;
        return (node.attrs?.[k] || "").includes(v);
      }
      // [position]
      const p = predicate.match(/\[(\d+)\]/);
      if (p) {
        // position among siblings of same tag
        if (!node.parent) return false;
        const siblings = (node.parent.children || []).filter(c => !tag || c.tag === tag);
        // Build enriched siblings to find index of this node
        const idx = siblings.findIndex(sib => sib === all.find(n => n.tag === sib.tag && JSON.stringify(n.path) === JSON.stringify([...(node.parent?.path || []), siblings.indexOf(sib)])));
        // simpler: index by node.path last element
        const pos = node.path[node.path.length - 1] + 1;
        return pos === parseInt(p[1], 10);
      }
    }
    return true;
  }

  if (recursive) {
    // //tag[...]/childTag[...]
    return new Set(all.filter(n => {
      // last step must match n
      const lastStep = steps[steps.length - 1];
      if (!matchStep(n, lastStep)) return false;
      // walk up: previous step must match an ancestor (any depth for // case)
      let parent = n.parent;
      for (let i = steps.length - 2; i >= 0; i--) {
        let found = null;
        while (parent) {
          if (matchStep(parent, steps[i])) { found = parent; break; }
          parent = parent.parent;
        }
        if (!found) return false;
        parent = found.parent;
      }
      return true;
    }));
  } else {
    return new Set(all.filter(n => {
      if (n.path.length !== steps.length) return false;
      // walk from root through steps
      let cur = all[0]; // html root
      for (let i = 0; i < steps.length; i++) {
        if (!matchStep(cur, steps[i])) return false;
        if (i < steps.length - 1) {
          // pick child matching next step
          const child = (cur.children || []).find(c => matchStep({ ...c, parent: cur, path: [...cur.path || [], 0] }, steps[i + 1]));
          if (!child) return false;
          cur = all.find(n => n.tag === child.tag);
        }
      }
      return matchStep(cur, steps[steps.length - 1]) && cur === n;
    }));
  }
}

export default function CssXpathPlayground() {
  const all = useMemo(() => walk(DOM, null, 0, []), []);
  const [cssSel, setCssSel] = useState(".product .price");
  const [xpath, setXpath] = useState("//div[@class=\"product featured\"]");
  const [mode, setMode] = useState("css");

  const matched = useMemo(() => {
    try {
      if (mode === "css") return matchCss(cssSel, all);
      return matchXpath(xpath, all);
    } catch (e) {
      return new Set();
    }
  }, [mode, cssSel, xpath, all]);

  function renderTree(node, x = 16, y = 24) {
    const lines = [];
    function rec(n, x, y) {
      const sel = matched.has(n);
      lines.push(
        <g key={n.path.join(".")} transform={`translate(${x}, ${y})`}>
          <text x={0} y={0} fontSize="10" fontFamily="var(--font-mono)" fill={sel ? "oklch(0.65 0.16 145)" : "var(--text)"}>
            {sel ? "▸ " : "  "}
            &lt;{n.tag}{n.attrs ? Object.entries(n.attrs).map(([k, v]) => ` ${k}="${v}"`).join("") : ""}&gt;
            {n.text ? ` ${n.text}` : ""}
          </text>
        </g>
      );
      let yy = y + 14;
      if (n.children) for (const c of n.children) { yy = rec({ ...c, parent: n, depth: n.depth + 1, path: [...n.path, n.children.indexOf(c)] }, x + 16, yy); }
      return yy;
    }
    rec(node, x, y);
    return lines;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button onClick={() => setMode("css")} style={btn(mode === "css")}>CSS</button>
        <button onClick={() => setMode("xpath")} style={btn(mode === "xpath")}>XPath</button>
        <button onClick={() => { setCssSel(".product .price"); setXpath("//div[@class=\"product featured\"]"); }} style={btn(false)}>reset</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 4, alignItems: "center", fontFamily: "var(--font-mono)", fontSize: 11 }}>
        <span style={{ color: mode === "css" ? "var(--accent)" : "var(--text-faint)" }}>CSS</span>
        <input value={cssSel} onChange={(e) => { setCssSel(e.target.value); setMode("css"); }}
          style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--bg-inset)", color: "var(--text)", border: `1px solid ${mode === "css" ? "var(--accent)" : "var(--line-strong)"}`, padding: 2 }} />
        <span style={{ color: mode === "xpath" ? "var(--accent)" : "var(--text-faint)" }}>XPath</span>
        <input value={xpath} onChange={(e) => { setXpath(e.target.value); setMode("xpath"); }}
          style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--bg-inset)", color: "var(--text)", border: `1px solid ${mode === "xpath" ? "var(--accent)" : "var(--line-strong)"}`, padding: 2 }} />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", background: "var(--bg-card)", borderRadius: 4 }}>
        {renderTree(all[0])}
        <text x={W / 2} y={H - 8} textAnchor="middle" fontSize="10" fontFamily="var(--font-mono)" fill="var(--text-muted)">
          {matched.size} match{matched.size === 1 ? "" : "es"}
        </text>
      </svg>

      <div style={{ fontSize: 11, color: "var(--text-faint)" }}>
        Try CSS: <code style={code}>div.product</code>, <code style={code}>.product .price</code>, <code style={code}>[data-id="2"]</code>, <code style={code}>div &gt; h2</code>.
        Try XPath: <code style={code}>//span[@class="price"]</code>, <code style={code}>//*[contains(@class, "discounted")]</code>, <code style={code}>//div[@id="list"]/div[2]</code>.
        XPath can climb (axes like <code style={code}>parent::</code>) and use functions; CSS is shorter for tag/class/id selection.
      </div>
    </div>
  );
}

const code = {
  fontFamily: "var(--font-mono)", fontSize: 11, padding: "0 3px",
  background: "var(--bg-inset)", color: "var(--text)", borderRadius: 2,
};

function btn(active) {
  return {
    fontFamily: "var(--font-mono)", fontSize: 11, padding: "2px 8px",
    background: active ? "var(--accent)" : "var(--bg-inset)",
    color: active ? "var(--bg-card)" : "var(--text)",
    border: "1px solid var(--line-strong)", borderRadius: 3, cursor: "pointer",
  };
}
