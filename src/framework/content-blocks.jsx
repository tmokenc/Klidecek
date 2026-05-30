// content-blocks.jsx — renderers for each block kind: text, heading, math, code,
// link, diagram, image, svg, viz, quiz, table, list, quote, hr.
// `text` body supports a small inline-markdown pass: **bold**, *italic*, `code`,
// ~~strike~~, [label](url), [[wiki-link]], [[wiki-link|alias]], $inline math$.
//
// Wiki links navigate within the app via a React context populated by BlockList.
// Math (inline and block) is rendered with KaTeX.

import { createContext, useContext, useCallback, useState } from "react";
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

function highlightCode(code, lang) {
  const escaped = escapeHtml(code);
  let html = escaped;
  html = html.replace(/("([^"\\]|\\.)*"|'([^'\\]|\\.)*')/g, '<span class="tok-str">$1</span>');
  if (lang === "python") html = html.replace(/(#[^\n]*)/g, '<span class="tok-com">$1</span>');
  else if (lang === "sql") html = html.replace(/(--[^\n]*)/g, '<span class="tok-com">$1</span>');
  else html = html.replace(/(\/\/[^\n]*)/g, '<span class="tok-com">$1</span>');
  html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-num">$1</span>');
  const kw = {
    python: ["def","return","if","else","elif","for","while","in","not","and","or","import","from","as","class","with","try","except","finally","lambda","yield","is","None","True","False"],
    c:      ["int","float","double","char","void","return","if","else","for","while","struct","typedef","static","const","sizeof","unsigned","signed","long","short","switch","case","break","continue","goto","extern","auto","register","inline","discard"],
    sql:    ["select","from","where","group","by","order","having","join","left","right","inner","outer","on","create","table","insert","into","update","delete","values","primary","key","references","foreign","not","null","int","char","varchar","explain","analyze","count","as","and","or"],
    latex:  [],
    js:     ["const","let","var","function","return","if","else","for","while","import","export","from","as","class","new","this","async","await","try","catch","finally","throw","typeof","instanceof","true","false","null","undefined"],
    rust:   ["fn","let","mut","const","struct","enum","impl","trait","pub","use","mod","match","if","else","for","while","loop","return","self","Self","ref","as","in","where","Some","None","Ok","Err","true","false"],
  };
  const list = kw[lang] || [];
  if (list.length) {
    const re = new RegExp("\\b(" + list.join("|") + ")\\b", lang === "sql" ? "gi" : "g");
    html = html.replace(re, '<span class="tok-kw">$1</span>');
  }
  if (lang === "latex") html = html.replace(/(\\[A-Za-z]+)/g, '<span class="tok-kw">$1</span>');
  return html;
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

function ImageBlock({ block }) {
  return (
    <figure className="block-image">
      <img src={resolveAsset(block.src)} alt={block.alt || ""} loading="lazy" />
      {block.caption && <figcaption>{block.caption}</figcaption>}
    </figure>
  );
}

// Inline SVG block. Body is author-controlled markup from the local repo's
// MD files (no user input), so dangerouslySetInnerHTML is acceptable here.
function SvgBlock({ block }) {
  return (
    <figure className="block-svg">
      <div dangerouslySetInnerHTML={{ __html: block.body || "" }} />
      {block.caption && <figcaption>{block.caption}</figcaption>}
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

function VizBlock({ block }) {
  const Component = viz.get(block.id);
  return (
    <div className="block-viz">
      <div className="block-viz-head">
        <span>interactive · {block.id || "?"}</span>
        <span>drag · click · tap</span>
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

export function Block({ block }) {
  switch (block.kind) {
    case "text":    return <TextBlock block={block} />;
    case "heading": return <HeadingBlock block={block} />;
    case "math":    return <MathBlock block={block} />;
    case "code":    return <CodeBlock block={block} />;
    case "link":    return <LinkBlock block={block} />;
    case "diagram": return <DiagramBlock block={block} />;
    case "image":   return <ImageBlock block={block} />;
    case "svg":     return <SvgBlock block={block} />;
    case "viz":     return <VizBlock block={block} />;
    case "quiz":    return <QuizBlock block={block} />;
    case "table":   return <TableBlock block={block} />;
    case "list":    return <ListBlock block={block} />;
    case "quote":   return <QuoteBlock block={block} />;
    case "hr":      return <HrBlock />;
    default:        return <div style={{ color: "var(--text-faint)", fontSize: 12 }}>unknown block: {block.kind}</div>;
  }
}

export function BlockList({ blocks }) {
  const onClick = useWikiLinkHandler();
  return (
    <div className="blocks" onClick={onClick}>
      {(blocks || []).map((b, i) => <Block key={i} block={b} />)}
    </div>
  );
}
