// content-blocks.jsx — renderers for each block kind: text, heading, math, code,
// link, diagram, image, svg, viz, quiz, table, list, quote, hr.
// `text` body supports a small inline-markdown pass: **bold**, *italic*, `code`,
// ~~strike~~, [label](url), [[wiki-link]], [[wiki-link|alias]], $inline math$.
//
// Wiki links navigate within the app via a React context populated by BlockList.
// Math (inline and block) is rendered with KaTeX.

import { createContext, useContext, useCallback, useState, useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import * as viz from "./viz-registry.js";

const BASE = import.meta.env.BASE_URL || "/";
function resolveAsset(src) {
  if (!src) return src;
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  return (BASE.endsWith("/") ? BASE : BASE + "/") + src.replace(/^\//, "");
}

/* ─── Context: { content, navigate } so wiki-links can resolve a target ── */
export const BlockContext = createContext({ content: null, navigate: null });

/* ─── Context: per-subtopic anchor base so figures get shareable deep-links ──
 * subAnchor = "sub-<tid>-<sid>" (the enclosing <article> id); a figure's DOM id
 * is `${subAnchor}--fig<N>` and its shareable URL is `#${routeBase}/fig<N>`. */
export const FigureContext = createContext({ subAnchor: null, routeBase: null });

// Small "copy link to this figure" button, shown on image/svg/viz blocks.
function FigureAnchor({ figId }) {
  const { routeBase } = useContext(FigureContext);
  const [copied, setCopied] = useState(false);
  if (!routeBase || !figId) return null;
  const onCopy = (e) => {
    e.stopPropagation();
    const url = location.origin + location.pathname + "#" + routeBase + "/" + figId;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    if (typeof window !== "undefined" && window.toast) window.toast("Figure link copied to clipboard");
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button className={"fig-anchor" + (copied ? " copied" : "")} onClick={onCopy}
      title="Copy link to this figure" aria-label="Copy link to this figure">
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 5 5 9-11"/></svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
      )}
    </button>
  );
}

// Resolve a figure's stable DOM id + short key from its 1-based index in the subtopic.
function useFigureId(figIndex) {
  const { subAnchor } = useContext(FigureContext);
  if (!subAnchor || !figIndex) return {};
  const figKey = "fig" + figIndex;
  return { domId: subAnchor + "--" + figKey, figKey };
}

/* ─── Escapes / inline markdown ────────────────────────────────────────── */
function escapeHtml(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderMath(tex, displayMode) {
  try {
    return katex.renderToString(tex, {
      displayMode,
      throwOnError: false,
      strict: "ignore",
      output: "html",
      trust: false,
    });
  } catch (e) {
    return `<span class="math-error" title="${escapeHtml(e.message || String(e))}">${escapeHtml(tex)}</span>`;
  }
}

// Replace each sentinel `\x00N\x00` produced by stash() with its stored HTML.
function unstash(s, stash) {
  return s.replace(/\x00(\d+)\x00/g, (_, n) => stash[+n] || "");
}

// Tiny inline-markdown → HTML. Stash code spans and math first so other rules
// don't munge their contents (e.g. `**` inside a code span must stay literal).
// `content` is optional; when present, `[[id]]` resolves to the subtopic's
// title so readers see the real heading instead of the raw id.
function inline(s, content) {
  const stash = [];
  const keep = (html) => {
    stash.push(html);
    return `\x00${stash.length - 1}\x00`;
  };

  let out = s;

  // 1) Inline code spans `…`
  out = out.replace(/`([^`\n]+?)`/g, (_, t) => keep(`<code>${escapeHtml(t)}</code>`));

  // 2) Inline math $…$  (single $, not $$ — block math is its own block kind)
  //    A literal `$` can be escaped as `\$` to opt out.
  out = out.replace(/(^|[^\\$])\$([^\n$]+?)\$(?!\$)/g, (_, pre, tex) =>
    pre + keep(`<span class="math math-inline">${renderMath(tex, false)}</span>`)
  );
  out = out.replace(/\\\$/g, "$");

  // 3) Now safe to HTML-escape the remaining prose
  out = escapeHtml(out);
  // Restore the sentinels (`\x00N\x00` survives the escape because it has no special chars)

  // 4) Wiki links: [[target]] and [[target|label]]
  out = out.replace(/\[\[([^\[\]|]+?)(?:\|([^\[\]]+?))?\]\]/g, (_, target, label) => {
    const t = target.trim();
    let l = label ? label.trim() : "";
    if (!l && content && content.findSubtopicById) {
      const hit = content.findSubtopicById(t);
      if (hit && hit.sub && hit.sub.title) l = hit.sub.title;
    }
    if (!l) l = t;
    return `<a class="wikilink" data-wikilink="${escapeHtml(t)}" href="#">${escapeHtml(l)}</a>`;
  });

  // 5) Standard markdown links [label](url)
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    const safeHref = href.replace(/"/g, "&quot;");
    return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });

  // 5b) Backslash-escaped asterisk `\*` → literal `*`, protected from the
  //     emphasis passes below (e.g. algorithm names like `A\*`, `D\* Lite`).
  out = out.replace(/\\\*/g, () => keep("*"));

  // 6) Bold: **text** — content may contain single-`*` italics, including a
  //    trailing one (`**uzel hledá *medián***`). The `(?!\*)` on the close picks
  //    the last two of a `***` run as the bold delimiter, so consecutive bolds
  //    (`**B**asically **A**vailable`) and nested italics both parse. Step 7
  //    then turns the inner `*…*` into <em>.
  out = out.replace(/\*\*(.+?)\*\*(?!\*)/g, "<strong>$1</strong>");

  // 7) Italic: *text*  (avoid eating ** by requiring a non-* boundary)
  out = out.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, "$1<em>$2</em>");

  // 8) Strikethrough: ~~text~~
  out = out.replace(/~~([^~\n]+?)~~/g, "<s>$1</s>");

  // Restore code spans / math last
  return unstash(out, stash);
}

/* ─── Click delegation for wiki-links ──────────────────────────────────── */
function useWikiLinkHandler() {
  const { content, navigate } = useContext(BlockContext);
  return useCallback((e) => {
    const a = e.target.closest && e.target.closest("a.wikilink");
    if (!a) return;
    e.preventDefault();
    const id = a.getAttribute("data-wikilink");
    if (!id || !content || !navigate) return;
    const hit = content.findSubtopicById && content.findSubtopicById(id);
    if (hit) {
      navigate(`/c/${hit.courseId}/${hit.topicId}/${id}`);
    } else if (typeof window !== "undefined" && window.toast) {
      window.toast(`Wiki link not found: ${id}`);
    }
  }, [content, navigate]);
}

/* ─── Block renderers ──────────────────────────────────────────────────── */
function useContent() {
  return useContext(BlockContext).content;
}

function TextBlock({ block }) {
  const content = useContent();
  return <p className="block-text" dangerouslySetInnerHTML={{ __html: inline(block.body, content) }} />;
}

function HeadingBlock({ block }) {
  const content = useContent();
  const level = Math.min(6, Math.max(1, block.level || 2));
  const Tag = `h${level}`;
  return <Tag className={`block-heading block-heading-h${level}`}
    dangerouslySetInnerHTML={{ __html: inline(block.body, content) }} />;
}

function MathBlock({ block }) {
  return (
    <div className="block-math"
      dangerouslySetInnerHTML={{ __html: renderMath(block.body, true) }} />
  );
}

function HrBlock() {
  return <hr className="block-hr" />;
}

function QuoteBlock({ block }) {
  return (
    <blockquote className="block-quote">
      <BlockList blocks={block.children || []} />
    </blockquote>
  );
}

function TableBlock({ block }) {
  const content = useContent();
  const aligns = block.aligns || [];
  return (
    <div className="block-table-wrap">
      <table className="block-table">
        <thead>
          <tr>
            {(block.header || []).map((cell, i) => (
              <th key={i} style={aligns[i] ? { textAlign: aligns[i] } : undefined}
                dangerouslySetInnerHTML={{ __html: inline(cell, content) }} />
            ))}
          </tr>
        </thead>
        <tbody>
          {(block.rows || []).map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} style={aligns[ci] ? { textAlign: aligns[ci] } : undefined}
                  dangerouslySetInnerHTML={{ __html: inline(cell, content) }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Lists may include nested items via `depth` (0 = top level). Group consecutive
// items with depth > parent into a sublist so the DOM reflects the hierarchy.
function renderListItems(items, ordered, content, startIdx = 0, depth = 0, start = 1) {
  const out = [];
  let i = startIdx;
  while (i < items.length && items[i].depth >= depth) {
    if (items[i].depth > depth) {
      // children of the previous item — handled below
      i++;
      continue;
    }
    const cur = items[i];
    // Collect children whose depth > cur.depth as a nested list
    const childStart = i + 1;
    let childEnd = childStart;
    while (childEnd < items.length && items[childEnd].depth > cur.depth) childEnd++;
    const children = items.slice(childStart, childEnd);
    out.push({ cur, children });
    i = childEnd;
  }
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className="block-list" {...(ordered && start > 1 ? { start } : {})}>
      {out.map(({ cur, children }, idx) => (
        <li key={idx}>
          <span dangerouslySetInnerHTML={{ __html: inline(cur.text, content) }} />
          {children.length > 0 && renderListItems(children, ordered, content, 0, children[0].depth)}
        </li>
      ))}
    </Tag>
  );
}

function ListBlock({ block }) {
  const content = useContent();
  const items = block.items || [];
  if (items.length === 0) return null;
  return renderListItems(items, !!block.ordered, content, 0, items[0].depth, block.start || 1);
}

/* ─── Syntax highlighting ────────────────────────────────────────────────
 * A small single-pass tokenizer. Because each emitted chunk is HTML-escaped
 * and wrapped exactly once, tokens can never nest or double-wrap (the old
 * regex-on-HTML approach coloured keywords/numbers *inside* strings). */
const KW = (s) => new Set(s.split(/\s+/).filter(Boolean));
const C_KW = "auto break case char const continue default do double else enum extern float for goto if inline int long register return short signed sizeof static struct switch typedef union unsigned void volatile while bool true false NULL size_t int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t";
const CUDA_KW = C_KW + " __global__ __device__ __host__ __shared__ __constant__ __syncthreads threadIdx blockIdx blockDim gridDim dim3 cudaMalloc cudaMemcpy cudaFree";
const JAVA_KW = "abstract assert boolean break byte case catch char class const continue default do double else enum extends final finally float for goto if implements import instanceof int interface long native new package private protected public return short static strictfp super switch synchronized this throw throws transient try void volatile while var record sealed permits yield true false null";
const JS_KW = "abstract arguments await break case catch class const continue debugger default delete do else export extends finally for function if import in instanceof let new return static super switch this throw try typeof var void while with yield async of from get set null true false undefined NaN Infinity";
const RUST_KW = "as async await break const continue crate dyn else enum extern false fn for if impl in let loop match mod move mut pub ref return self Self static struct super trait true type unsafe use where while box";
const PY_KW = "False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case";
const HS_KW = "module import where let in do case of if then else data type newtype class instance deriving default infixl infixr infix foreign family forall qualified hiding as";
const PROLOG_KW = "is mod rem div true fail false not dynamic discontiguous module use_module assert asserta assertz retract findall bagof setof forall halt write writeln nl read";
const BASH_KW = "if then else elif fi for while until do done case esac function in return select local export readonly declare unset echo printf read cd exit set source eval exec trap shift getopts test";
const SQL_KW = "select from where group by order having join left right inner outer full cross natural on using create alter drop table view index insert into update delete values set primary key references foreign unique constraint distinct limit offset union all between like in is null not and or case when then else end as with explain analyze begin commit rollback count sum avg min max coalesce cast int integer varchar char text date timestamp boolean";
const SPARQL_KW = "select where prefix base filter optional distinct reduced order by limit offset group having construct ask describe union bind values service graph from named minus exists not as a";
const PHP_KW = "abstract and array as break callable case catch class clone const continue declare default do echo else elseif empty endif endfor endforeach endwhile extends final finally fn for foreach function global goto if implements include include_once instanceof insteadof interface isset list namespace new or print private protected public require require_once return static switch throw trait try unset use var while xor yield true false null";
const CS_KW = "abstract as base bool break byte case catch char checked class const continue decimal default delegate do double else enum event explicit extern false finally fixed float for foreach goto if implicit in int interface internal is lock long namespace new null object operator out override params private protected public readonly ref return sbyte sealed short sizeof static string struct switch this throw true try typeof uint ulong unchecked unsafe ushort using var virtual void volatile while async await record";
const GRAPHQL_KW = "query mutation subscription fragment on type input enum interface union scalar schema implements extend directive true false null";
const PROTO_KW = "syntax message service rpc returns repeated optional required reserved enum import package option oneof map int32 int64 uint32 uint64 sint32 sint64 fixed32 fixed64 bool string bytes double float";

const C_LIKE = { line: ["//"], block: [["/*", "*/"]], str: ['"'], charLit: true, type: true };
const HASH = (kw) => ({ line: ["#"], block: [], str: ['"', "'"], type: false, kw: KW(kw) });
function langConfig(lang) {
  const M = {
    c: { ...C_LIKE, kw: KW(C_KW) }, "c++": { ...C_LIKE, kw: KW(C_KW) }, cpp: { ...C_LIKE, kw: KW(C_KW) },
    cuda: { ...C_LIKE, kw: KW(CUDA_KW) }, p4: { ...C_LIKE, kw: KW(C_KW) },
    java: { ...C_LIKE, kw: KW(JAVA_KW) }, csharp: { ...C_LIKE, kw: KW(CS_KW) },
    js: { ...C_LIKE, str: ['"', "'", "`"], kw: KW(JS_KW) }, javascript: { ...C_LIKE, str: ['"', "'", "`"], kw: KW(JS_KW) },
    ts: { ...C_LIKE, str: ['"', "'", "`"], kw: KW(JS_KW + " interface type enum implements namespace declare readonly") },
    typescript: { ...C_LIKE, str: ['"', "'", "`"], kw: KW(JS_KW + " interface type enum implements namespace declare readonly") },
    rust: { ...C_LIKE, kw: KW(RUST_KW), cmd: /^[A-Za-z_][A-Za-z0-9_]*!/ },
    php: { ...C_LIKE, str: ['"', "'"], charLit: false, kw: KW(PHP_KW) },
    css: { line: [], block: [["/*", "*/"]], str: ['"', "'"], type: false, kw: KW("") },
    protobuf: { ...C_LIKE, kw: KW(PROTO_KW) },
    python: { line: ["#"], block: [], str: ['"', "'"], type: true, kw: KW(PY_KW) },
    bash: HASH(BASH_KW), sh: HASH(BASH_KW), shell: HASH(BASH_KW), zsh: HASH(BASH_KW),
    ruby: HASH("def end if elsif else unless while until for in do begin rescue ensure class module return yield self nil true false require attr_accessor puts"),
    r: HASH("if else for while function return in next break TRUE FALSE NULL NA NaN Inf library require"),
    yaml: { line: ["#"], block: [], str: ['"', "'"], type: false, kw: KW("true false null yes no on off") },
    toml: HASH("true false"), ini: { line: [";", "#"], block: [], str: ['"', "'"], type: false, kw: KW("true false") },
    properties: { line: ["#", "!"], block: [], str: [], type: false, kw: KW("") },
    nginx: HASH("server location listen root index proxy_pass upstream events http worker_processes include if return"),
    nft: HASH("table chain rule set map type hook priority policy accept drop"),
    apache: HASH(""), rego: HASH("package import default allow deny some every in with as not"), conf: HASH(""),
    haskell: { line: ["--"], block: [["{-", "-}"]], str: ['"'], charLit: true, type: true, kw: KW(HS_KW) },
    sql: { line: ["--"], block: [["/*", "*/"]], str: ["'", '"'], type: false, kw: KW(SQL_KW), kwCI: true },
    jpql: { line: ["--"], block: [["/*", "*/"]], str: ["'"], type: false, kw: KW(SQL_KW), kwCI: true },
    cypher: { line: ["//"], block: [["/*", "*/"]], str: ["'", '"'], type: false, kwCI: true,
      kw: KW("match optional where return create merge delete detach set remove with unwind order by limit skip as and or not in starts ends contains distinct union call yield") },
    sparql: { line: ["#"], block: [], str: ['"', "'"], type: false, kw: KW(SPARQL_KW), kwCI: true },
    turtle: { line: ["#"], block: [], str: ['"', "'"], type: false, kw: KW("a prefix base true false") },
    prolog: { line: ["%"], block: [["/*", "*/"]], str: ["'", '"'], type: false, kw: KW(PROLOG_KW) },
    erlang: { line: ["%"], block: [], str: ['"', "'"], type: false, kw: KW("module export import if case of end fun receive after when begin try catch") },
    latex: { line: ["%"], block: [], str: [], type: false, kw: KW(""), cmd: /^\\[A-Za-z@]+\*?/ },
    asm: { line: [";", "#"], block: [], str: ['"', "'"], type: false, kw: KW("mov add sub mul div push pop jmp je jne jg jl call ret cmp lea xor and or nop int section global extern db dw dd resb") },
    assembly: { line: [";", "#"], block: [], str: ['"', "'"], type: false, kw: KW("mov add sub mul div push pop jmp je jne jg jl call ret cmp lea xor and or nop int") },
    fortran: { line: ["!"], block: [], str: ['"', "'"], type: false, kwCI: true,
      kw: KW("program end subroutine function if then else do while integer real double precision character logical call return print write read implicit none allocate deallocate") },
    graphql: { line: ["#"], block: [], str: ['"'], type: true, kw: KW(GRAPHQL_KW) },
    xml: { markup: true }, html: { markup: true }, xhtml: { markup: true }, svg: { markup: true },
    json: { json: true }, jsonc: { json: true },
    text: { plain: true }, txt: { plain: true }, http: { plain: true }, math: { plain: true }, "": { plain: true },
  };
  return M[lang] || { line: ["//", "#"], block: [["/*", "*/"]], str: ['"', "'", "`"], type: false, kw: KW("") };
}

const CHAR_LIT = /^'(\\(?:u\{[0-9a-fA-F]+\}|x[0-9a-fA-F]{1,2}|[^])|[^'\\\n])'/;
const NUM = /^(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.\d+)?(?:[eEdD][+-]?\d+)?[fFlLuU]*)/;
const IDENT = /^[A-Za-z_$][A-Za-z0-9_$']*/;

function highlightCode(code, lang) {
  const cfg = langConfig((lang || "").toLowerCase());
  if (cfg.plain) return escapeHtml(code);
  if (cfg.markup) return highlightMarkup(code);
  if (cfg.json) return highlightJson(code);
  let out = "", i = 0;
  const n = code.length;
  const push = (cls, text) => { out += cls ? `<span class="tok-${cls}">${escapeHtml(text)}</span>` : escapeHtml(text); };
  while (i < n) {
    const rest = code.slice(i), ch = code[i];
    // block comments
    let m = false;
    for (const [o, c] of (cfg.block || [])) if (rest.startsWith(o)) {
      let e = code.indexOf(c, i + o.length); e = e === -1 ? n : e + c.length;
      push("com", code.slice(i, e)); i = e; m = true; break;
    }
    if (m) continue;
    // line comments
    for (const lc of (cfg.line || [])) if (rest.startsWith(lc)) {
      let e = code.indexOf("\n", i); e = e === -1 ? n : e;
      push("com", code.slice(i, e)); i = e; m = true; break;
    }
    if (m) continue;
    // macro / command tokens (rust foo!, latex \cmd)
    if (cfg.cmd) { const cm = cfg.cmd.exec(rest); if (cm) { push("kw", cm[0]); i += cm[0].length; continue; } }
    // char literals ('a') where ' is not a string delimiter (C/Rust/Haskell/Java)
    if (ch === "'" && cfg.charLit && !(cfg.str || []).includes("'")) {
      const cm = CHAR_LIT.exec(rest);
      if (cm) { push("str", cm[0]); i += cm[0].length; continue; }
      push(null, ch); i++; continue; // lone ' = rust lifetime / haskell prime tick
    }
    // strings
    if ((cfg.str || []).includes(ch)) {
      let j = i + 1;
      while (j < n) { const cj = code[j]; if (cj === "\\") { j += 2; continue; } if (cj === ch) { j++; break; } if (cj === "\n") break; j++; }
      push("str", code.slice(i, j)); i = j; continue;
    }
    // numbers
    if (ch >= "0" && ch <= "9") { const nm = NUM.exec(rest); if (nm) { push("num", nm[0]); i += nm[0].length; continue; } }
    // identifiers / keywords / types
    const im = IDENT.exec(rest);
    if (im) {
      const w = im[0];
      const isKw = cfg.kw && (cfg.kw.has(w) || (cfg.kwCI && cfg.kw.has(w.toLowerCase())));
      if (isKw) push("kw", w);
      else if (cfg.type && /^[A-Z]/.test(w)) push("type", w);
      else push(null, w);
      i += w.length; continue;
    }
    push(null, ch); i++;
  }
  return out;
}

// Markup (xml/html): tags -> kw, attribute names -> type, values -> str, <!-- --> -> com.
// Everything is HTML-escaped as it is emitted (so the markup shows as text).
function highlightMarkup(code) {
  let out = "", i = 0; const n = code.length;
  while (i < n) {
    if (code.startsWith("<!--", i)) { let e = code.indexOf("-->", i); e = e === -1 ? n : e + 3; out += `<span class="tok-com">${escapeHtml(code.slice(i, e))}</span>`; i = e; continue; }
    if (code[i] === "<") {
      let e = code.indexOf(">", i); e = e === -1 ? n : e + 1;
      out += highlightTag(code.slice(i, e)); i = e; continue;
    }
    let e = code.indexOf("<", i); e = e === -1 ? n : e;
    out += escapeHtml(code.slice(i, e)); i = e;
  }
  return out;
}
function highlightTag(tag) {
  let r = "", p = 0; const L = tag.length;
  const head = (/^<\/?/.exec(tag) || ["<"])[0]; r += escapeHtml(head); p = head.length;
  const nameM = /^[A-Za-z_!?][\w:.?-]*/.exec(tag.slice(p));
  if (nameM) { r += `<span class="tok-kw">${escapeHtml(nameM[0])}</span>`; p += nameM[0].length; }
  while (p < L) {
    const s = tag.slice(p);
    const str = /^"[^"]*"|^'[^']*'/.exec(s);
    const attr = /^[A-Za-z_][\w:.-]*/.exec(s);
    if (str) { r += `<span class="tok-str">${escapeHtml(str[0])}</span>`; p += str[0].length; }
    else if (attr) { r += `<span class="tok-type">${escapeHtml(attr[0])}</span>`; p += attr[0].length; }
    else { r += escapeHtml(tag[p]); p++; }
  }
  return r;
}

function highlightJson(code) {
  let out = "", i = 0; const n = code.length;
  while (i < n) {
    const ch = code[i];
    if (ch === '"') {
      let j = i + 1; while (j < n) { if (code[j] === "\\") { j += 2; continue; } if (code[j] === '"') { j++; break; } j++; }
      const s = code.slice(i, j);
      let k = j; while (k < n && /\s/.test(code[k])) k++;
      const cls = code[k] === ":" ? "type" : "str"; // key vs value
      out += `<span class="tok-${cls}">${escapeHtml(s)}</span>`; i = j; continue;
    }
    if ((ch >= "0" && ch <= "9") || (ch === "-" && /\d/.test(code[i + 1] || ""))) { const nm = /^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/.exec(code.slice(i)); if (nm) { out += `<span class="tok-num">${nm[0]}</span>`; i += nm[0].length; continue; } }
    const kwm = /^(true|false|null)\b/.exec(code.slice(i));
    if (kwm) { out += `<span class="tok-kw">${kwm[0]}</span>`; i += kwm[0].length; continue; }
    out += escapeHtml(ch); i++;
  }
  return out;
}

function CodeBlock({ block }) {
  const html = highlightCode(block.body, block.lang || "");
  return (
    <div className="block-code">
      <div className="block-code-head"><span>{block.lang || "code"}</span></div>
      <pre dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function LinkBlock({ block }) {
  let host = "";
  try { host = new URL(block.href).host.replace(/^www\./, ""); } catch {}
  return (
    <a className="block-link" href={block.href} target="_blank" rel="noopener noreferrer">
      <svg className="lnk-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.72"/>
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
      </svg>
      <span>{block.label}</span>
      <span className="lnk-host">{host}</span>
    </a>
  );
}

function DiagramBlock({ block }) {
  return (
    <div className="block-diagram">
      <div className="dg-label">{block.label || "Diagram"}</div>
      {block.caption && <span className="dg-cap">{block.caption}</span>}
    </div>
  );
}

function ImageBlock({ block, figIndex }) {
  const { domId, figKey } = useFigureId(figIndex);
  return (
    <figure className="block-image" id={domId}>
      <img src={resolveAsset(block.src)} alt={block.alt || ""} loading="lazy" />
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <FigureAnchor figId={figKey} />
    </figure>
  );
}

// Inline SVG block. Body is author-controlled markup from the local repo's
// MD files (no user input), so dangerouslySetInnerHTML is acceptable here.
function SvgBlock({ block, figIndex }) {
  const { domId, figKey } = useFigureId(figIndex);
  return (
    <figure className="block-svg" id={domId}>
      <div dangerouslySetInnerHTML={{ __html: block.body || "" }} />
      {block.caption && <figcaption>{block.caption}</figcaption>}
      <FigureAnchor figId={figKey} />
    </figure>
  );
}

// YouTube embed. Renders a lightweight facade (thumbnail + play button + title)
// and only loads the privacy-mode iframe once the reader clicks play — so a page
// with many videos stays fast and makes no third-party request until asked.
function EmbedBlock({ block }) {
  const [playing, setPlaying] = useState(false);
  const id = block.videoId;
  if (!id) {
    return (
      <div className="block-embed block-embed-bad">
        Nelze vložit video: neznámé YouTube ID ({block.src || "?"}).
      </div>
    );
  }
  const thumb = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const watch = `https://www.youtube.com/watch?v=${id}`;
  // cc → turn English captions on by default (for videos whose audio isn't EN/CS)
  const embedParams = "autoplay=1&rel=0" + (block.cc ? "&cc_load_policy=1&cc_lang_pref=en&hl=en" : "");
  const ytGlyph = (
    <svg className="embed-yt-icon" width="18" height="13" viewBox="0 0 24 17" fill="currentColor" aria-hidden="true">
      <path d="M23.5 2.6a3 3 0 00-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.5A3 3 0 00.5 2.6 31 31 0 000 8.5a31 31 0 00.5 5.9 3 3 0 002.1 2.1C4.5 17 12 17 12 17s7.5 0 9.4-.5a3 3 0 002.1-2.1 31 31 0 00.5-5.9 31 31 0 00-.5-5.9z"/>
      <path d="M9.5 12.2 15.8 8.5 9.5 4.8z" fill="var(--bg-soft)"/>
    </svg>
  );
  return (
    <figure className="block-embed">
      {playing ? (
        <div className="embed-frame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?${embedParams}`}
            title={block.title || "YouTube video"}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      ) : (
        <button
          type="button"
          className="embed-facade"
          style={{ backgroundImage: `url("${thumb}")` }}
          onClick={() => setPlaying(true)}
          aria-label={`Přehrát video${block.title ? ": " + block.title : ""}`}
        >
          <span className="embed-scrim" />
          <span className="embed-play" aria-hidden="true">
            <svg viewBox="0 0 68 48" width="60" height="42">
              <path className="embed-play-bg" d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.63 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"/>
              <path d="M45 24 27 14v20z" fill="#fff"/>
            </svg>
          </span>
          {(block.title || block.channel) && (
            <span className="embed-meta">
              {block.title && <span className="embed-title">{block.title}</span>}
              {block.channel && <span className="embed-channel">{block.channel}</span>}
            </span>
          )}
        </button>
      )}
      <figcaption className="embed-cap">
        {ytGlyph}
        <a href={watch} target="_blank" rel="noopener noreferrer">
          {block.channel ? `${block.channel} · YouTube` : "Otevřít na YouTube"}
        </a>
        {block.cc && <span className="embed-cc-badge" title="Anglické titulky zapnuty">CC&nbsp;EN</span>}
      </figcaption>
    </figure>
  );
}

function QuizBlock({ block }) {
  const [picked, setPicked] = useState(null);
  return (
    <div className="block-quiz">
      <p className="block-quiz-q">{block.q}</p>
      <div className="quiz-choices">
        {block.choices.map((c, i) => {
          let state;
          const letter = String.fromCharCode(65 + i);
          if (picked === null) state = undefined;
          else if (picked === i && c.correct) state = "correct";
          else if (picked === i && !c.correct) state = "wrong";
          else if (c.correct) state = "reveal-correct";
          return (
            <button
              key={i}
              className="quiz-choice"
              data-state={state}
              onClick={() => picked === null && setPicked(i)}
            >
              <span className="qc-letter">{letter}</span>
              <span>{c.t}</span>
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div className="quiz-why">
          {block.choices[picked].correct ? "✓ " : "✗ "}
          {block.choices[picked].why}
        </div>
      )}
    </div>
  );
}

function VizBlock({ block, figIndex }) {
  const Component = viz.get(block.id);
  const { domId, figKey } = useFigureId(figIndex);
  return (
    <div className="block-viz" id={domId}>
      <div className="block-viz-head">
        <span>interactive · {block.id || "?"}</span>
        <span className="block-viz-head-right">
          <FigureAnchor figId={figKey} />
          <span className="block-viz-hint">drag · click · tap</span>
        </span>
      </div>
      <div className="block-viz-body">
        {Component
          ? <Component />
          : (
            <div style={{ padding: 24, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-faint)" }}>
              viz "{block.id}" not registered. Add it in <code>src/viz/index.js</code>.
            </div>
          )}
      </div>
      {block.caption && <div className="block-viz-cap">{block.caption}</div>}
    </div>
  );
}

export function Block({ block, figIndex }) {
  switch (block.kind) {
    case "text":    return <TextBlock block={block} />;
    case "heading": return <HeadingBlock block={block} />;
    case "math":    return <MathBlock block={block} />;
    case "code":    return <CodeBlock block={block} />;
    case "link":    return <LinkBlock block={block} />;
    case "diagram": return <DiagramBlock block={block} />;
    case "image":   return <ImageBlock block={block} figIndex={figIndex} />;
    case "svg":     return <SvgBlock block={block} figIndex={figIndex} />;
    case "viz":     return <VizBlock block={block} figIndex={figIndex} />;
    case "quiz":    return <QuizBlock block={block} />;
    case "embed":   return <EmbedBlock block={block} />;
    case "table":   return <TableBlock block={block} />;
    case "list":    return <ListBlock block={block} />;
    case "quote":   return <QuoteBlock block={block} />;
    case "hr":      return <HrBlock />;
    default:        return <div style={{ color: "var(--text-faint)", fontSize: 12 }}>unknown block: {block.kind}</div>;
  }
}

export function BlockList({ blocks, courseId, topicId, subId }) {
  const onClick = useWikiLinkHandler();
  const figCtx = useMemo(
    () => (courseId && topicId && subId)
      ? { subAnchor: `sub-${topicId}-${subId}`, routeBase: `/c/${courseId}/${topicId}/${subId}` }
      : { subAnchor: null, routeBase: null },
    [courseId, topicId, subId]
  );
  // Number figures (image / svg / viz) in document order so each gets a stable
  // `fig<N>` id for deep-linking.
  let figN = 0;
  return (
    <FigureContext.Provider value={figCtx}>
      <div className="blocks" onClick={onClick}>
        {(blocks || []).map((b, i) => {
          const figIndex = (b.kind === "image" || b.kind === "svg" || b.kind === "viz") ? ++figN : undefined;
          return <Block key={i} block={b} figIndex={figIndex} />;
        })}
      </div>
    </FigureContext.Provider>
  );
}
