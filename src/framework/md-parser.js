// md-parser.js — minimal markdown → block-array parser.
// Recognises:
//   • YAML-ish frontmatter at the top, delimited by `---` lines
//   • triple-backtick code fences with optional language tag
//   • `:::` typed fences for math / diagram / link / viz / quiz / svg / image
//   • ATX headings (`#` through `######`) → heading blocks
//   • `$$ ... $$` standalone math (single- or multi-line) → math blocks
//   • pipe tables (`| a | b |` + `| --- | --- |` separator) → table blocks
//   • unordered (`-`, `*`, `+`) and ordered (`1.`) lists → list blocks
//   • blockquotes (`> …`) → quote blocks (recursively parsed)
//   • horizontal rules (`---`, `***`, `___` on a line) → hr blocks
//   • blank-line separated paragraphs → text blocks (with inline markdown)
//
// The output is the `blocks` shape the design's content-blocks renderer expects:
//   { kind: "text" | "heading" | "math" | "code" | "link" | "diagram" |
//           "image" | "svg" | "viz" | "quiz" | "table" | "list" |
//           "quote" | "hr", ... }

export function parseFrontmatter(md) {
  const lines = md.split("\n");
  const fm = {};
  let bodyStart = 0;
  if (lines[0] === "---") {
    let i = 1;
    while (i < lines.length && lines[i] !== "---") {
      const line = lines[i];
      const m = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
      if (m) fm[m[1]] = stripQuotes(m[2].trim());
      i++;
    }
    bodyStart = i + 1;
  }
  return { frontmatter: fm, body: lines.slice(bodyStart).join("\n") };
}

function stripQuotes(s) {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

// Parse args like:  rasterize "Drag the vertices."   →  ["rasterize", "Drag the vertices."]
// or:  "Pipeline overview" "Vertex → Tessellation"   →  ["Pipeline overview", "Vertex → Tessellation"]
function parseArgs(s) {
  const out = [];
  let i = 0;
  while (i < s.length) {
    while (i < s.length && /\s/.test(s[i])) i++;
    if (i >= s.length) break;
    if (s[i] === '"') {
      let j = i + 1;
      let buf = "";
      while (j < s.length && s[j] !== '"') {
        if (s[j] === "\\" && j + 1 < s.length) { buf += s[j + 1]; j += 2; }
        else { buf += s[j]; j++; }
      }
      out.push(buf);
      i = j + 1;
    } else {
      let j = i;
      while (j < s.length && !/\s/.test(s[j])) j++;
      out.push(s.slice(i, j));
      i = j;
    }
  }
  return out;
}

// Pull an 11-char YouTube video id out of a bare id or any common URL form
// (watch?v=, youtu.be/, /embed/, /shorts/, /live/). Returns "" if none found.
export function parseYouTubeId(s) {
  if (!s) return "";
  const t = s.trim();
  if (/^[\w-]{11}$/.test(t)) return t;
  const m =
    t.match(/[?&]v=([\w-]{11})/) ||
    t.match(/youtu\.be\/([\w-]{11})/) ||
    t.match(/\/(?:embed|shorts|live|v)\/([\w-]{11})/);
  return m ? m[1] : "";
}

function parseTableRow(line) {
  // Split on unescaped `|` outside of inline math (`$…$`) and wikilinks (`[[…|…]]`).
  // Math uses pandoc-style rules so currency like `$50` stays literal:
  // opening `$` must be followed by non-space; closing `$` must be preceded by
  // non-space and not followed by a digit.
  let t = line.trim();
  if (t.startsWith("|")) t = t.slice(1);
  if (t.endsWith("|")) t = t.slice(0, -1);
  const cells = [];
  let buf = "";
  let i = 0;
  while (i < t.length) {
    if (t[i] === "\\" && t[i + 1] === "|") { buf += "|"; i += 2; continue; }
    if (t[i] === "[" && t[i + 1] === "[") {
      const end = t.indexOf("]]", i + 2);
      if (end > i) { buf += t.slice(i, end + 2); i = end + 2; continue; }
    }
    if (t[i] === "$" && i + 1 < t.length && !/\s/.test(t[i + 1])) {
      let j = i + 1;
      let close = -1;
      while (j < t.length) {
        if (t[j] === "$" && !/\s/.test(t[j - 1]) && !/[0-9]/.test(t[j + 1] || "")) {
          close = j; break;
        }
        j++;
      }
      if (close > i) { buf += t.slice(i, close + 1); i = close + 1; continue; }
    }
    if (t[i] === "|") { cells.push(buf.trim()); buf = ""; i++; continue; }
    buf += t[i];
    i++;
  }
  cells.push(buf.trim());
  return cells;
}

function parseTableAlign(sep) {
  return parseTableRow(sep).map((cell) => {
    const c = cell.trim();
    const left = c.startsWith(":");
    const right = c.endsWith(":");
    if (left && right) return "center";
    if (right) return "right";
    if (left) return "left";
    return null;
  });
}

const TABLE_SEP_RE = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/;
const LIST_ITEM_RE = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;

export function parseBlocks(body) {
  const lines = body.split("\n");
  const blocks = [];
  let buf = [];

  const flushText = () => {
    const text = buf.join("\n").replace(/^\n+|\n+$/g, "");
    if (text.length) blocks.push({ kind: "text", body: text });
    buf = [];
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Custom typed fence ::: kind args...  (indent-tolerant: an indented fence
    // under a list item is its own block, see the list parser below)
    if (/^\s*:::/.test(line)) {
      flushText();
      const header = line.trim().replace(/^:::\s*/, "").trim();
      const tokens = header.split(/\s+/);
      const kind = tokens[0] || "text";
      const rest = header.slice(kind.length).trim();
      const args = parseArgs(rest);
      const inner = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ":::") {
        inner.push(lines[i]);
        i++;
      }
      blocks.push(makeTypedBlock(kind, args, inner.join("\n")));
      i++;
      continue;
    }

    // Triple-backtick code fence
    if (/^```/.test(line)) {
      flushText();
      const lang = line.replace(/^```/, "").trim();
      const code = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        code.push(lines[i]);
        i++;
      }
      // A ```math fence (GitHub-flavoured math) is a math block, not code —
      // otherwise the LaTeX renders as raw monospace text.
      if (/^math$/i.test(lang)) {
        blocks.push({ kind: "math", body: code.join("\n").trim() });
      } else {
        blocks.push({ kind: "code", lang, body: code.join("\n") });
      }
      i++;
      continue;
    }

    // Block math: $$ ... $$  (single-line or multi-line)
    const trimmed = line.trim();
    if (trimmed.startsWith("$$")) {
      // Single-line form: $$ formula $$
      if (trimmed.length > 4 && trimmed.endsWith("$$")) {
        flushText();
        blocks.push({ kind: "math", body: trimmed.slice(2, -2).trim() });
        i++;
        continue;
      }
      // Multi-line form: opens with $$ (optionally with content), closes with $$ on its own line or at end of line
      flushText();
      const inner = [];
      const head = trimmed.slice(2).trim();
      if (head) inner.push(head);
      i++;
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t.endsWith("$$")) {
          const tail = t.slice(0, -2).trim();
          if (tail) inner.push(tail);
          i++;
          break;
        }
        inner.push(lines[i]);
        i++;
      }
      blocks.push({ kind: "math", body: inner.join("\n").trim() });
      continue;
    }

    // ATX heading: # … ######
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (heading) {
      flushText();
      blocks.push({ kind: "heading", level: heading[1].length, body: heading[2] });
      i++;
      continue;
    }

    // Horizontal rule: ---, ***, or ___ on its own line (3+ chars, optional spaces)
    if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) {
      flushText();
      blocks.push({ kind: "hr" });
      i++;
      continue;
    }

    // Blockquote: one or more contiguous lines starting with `>` (any indent)
    if (/^\s{0,3}>/.test(line)) {
      flushText();
      const quoted = [];
      while (i < lines.length && /^\s{0,3}>/.test(lines[i])) {
        quoted.push(lines[i].replace(/^\s{0,3}>\s?/, ""));
        i++;
      }
      // Recursively parse the unwrapped content so nested formatting works
      blocks.push({ kind: "quote", children: parseBlocks(quoted.join("\n")) });
      continue;
    }

    // Pipe table: header row immediately followed by separator row
    if (/^\s*\|/.test(line) && i + 1 < lines.length && TABLE_SEP_RE.test(lines[i + 1])) {
      flushText();
      const header = parseTableRow(line);
      const aligns = parseTableAlign(lines[i + 1]);
      const rows = [];
      i += 2;
      while (i < lines.length && /^\s*\|/.test(lines[i])) {
        rows.push(parseTableRow(lines[i]));
        i++;
      }
      blocks.push({ kind: "table", header, aligns, rows });
      continue;
    }

    // Lists: -, *, +, or `N.`
    if (LIST_ITEM_RE.test(line)) {
      flushText();
      const ordered = /^\s*\d+\./.test(line);
      // Starting number for ordered lists (so a list resumed after an
      // interrupting block — e.g. display math — keeps its numbering).
      const startM = ordered && line.match(/^\s*(\d+)\./);
      const start = startM ? parseInt(startM[1], 10) : 1;
      const items = [];
      let baseIndent = -1;
      while (i < lines.length) {
        const cur = lines[i];
        const m = cur.match(LIST_ITEM_RE);
        if (m) {
          const indent = m[1].length;
          if (baseIndent < 0) baseIndent = indent;
          items.push({ depth: Math.max(0, indent - baseIndent), text: m[3] });
          i++;
          continue;
        }
        if (cur.trim() === "") {
          // blank line — peek next non-blank; continue only if another list item follows
          let j = i + 1;
          while (j < lines.length && lines[j].trim() === "") j++;
          if (j < lines.length && LIST_ITEM_RE.test(lines[j])) {
            i = j;
            continue;
          }
          break;
        }
        // A typed fence (:::) or display-math ($$) opener ends the list rather
        // than being swallowed as item text — it is parsed as its own block.
        // This lets an indented `::: math` / `$$` under a list item render.
        if (/^\s*(:::|\$\$)/.test(cur)) break;
        // Continuation line (indented) appends to the current item
        if (items.length && /^\s{2,}/.test(cur)) {
          items[items.length - 1].text += " " + cur.trim();
          i++;
          continue;
        }
        break;
      }
      blocks.push({ kind: "list", ordered, items, start });
      continue;
    }

    // Standalone image line: ![alt](src "optional caption") → image block
    const standaloneImg = line.match(/^\s*!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/);
    if (standaloneImg && buf.length === 0) {
      blocks.push({
        kind: "image",
        alt: standaloneImg[1],
        src: standaloneImg[2],
        caption: standaloneImg[3] || "",
      });
      i++;
      continue;
    }

    // Standalone link line: [label](url) on its own → link block
    const standaloneLink = line.match(/^\s*\[([^\]]+)\]\(([^)]+)\)\s*$/);
    if (standaloneLink && buf.length === 0) {
      blocks.push({ kind: "link", label: standaloneLink[1], href: standaloneLink[2] });
      i++;
      continue;
    }

    // Blank line ends the current paragraph
    if (line.trim() === "") {
      flushText();
      i++;
      continue;
    }

    buf.push(line);
    i++;
  }
  flushText();
  return blocks;
}

function makeTypedBlock(kind, args, body) {
  switch (kind) {
    case "math":
      return { kind: "math", body: body.trim() };
    case "image": {
      // ::: image "src" "alt?" "caption?"   — explicit form when ![](.) is awkward
      const src = args[0] || "";
      const alt = args[1] || "";
      const caption = args[2] || body.trim();
      return { kind: "image", src, alt, caption };
    }
    case "svg": {
      // ::: svg "caption?"   — body is raw inline SVG markup
      const caption = args[0] || "";
      return { kind: "svg", body: body.trim(), caption };
    }
    case "diagram": {
      const label = args[0] || "Diagram";
      const caption = args[1] || body.trim();
      return { kind: "diagram", label, caption };
    }
    case "link": {
      const inline = body.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (inline) return { kind: "link", label: inline[1], href: inline[2] };
      const label = args[0] || "link";
      const href = (args[1] || body.trim()).trim();
      return { kind: "link", label, href };
    }
    case "viz": {
      const id = args[0];
      const caption = args[1] || body.trim() || undefined;
      return { kind: "viz", id, caption };
    }
    case "quiz":
      return parseQuiz(args, body);
    case "youtube":
    case "video":
    case "embed": {
      // ::: youtube "<url-or-id>" "Title?" "Channel?" "cc?"   (body may hold the url too)
      // 4th arg "cc" turns on English captions by default (for non-English audio).
      const raw = (args[0] || body.trim()).trim();
      const videoId = parseYouTubeId(raw);
      const title = args[1] || "";
      const channel = args[2] || "";
      const cc = /^cc$/i.test((args[3] || "").trim());
      return { kind: "embed", provider: "youtube", videoId, src: raw, title, channel, cc };
    }
    default:
      return { kind: "text", body: body.trim() };
  }
}

// quiz format:
//   ::: quiz "Question text?"
//   - [x] Correct choice
//     > Reason it's correct.
//   - [ ] Wrong choice
//     > Reason this is wrong.
//   :::
function parseQuiz(args, body) {
  const q = args[0] || "Question";
  const choices = [];
  let cur = null;
  for (const raw of body.split("\n")) {
    const choiceMatch = raw.match(/^\s*-\s*\[([xX ])\]\s+(.+?)\s*$/);
    if (choiceMatch) {
      if (cur) choices.push(cur);
      cur = {
        t: choiceMatch[2],
        correct: choiceMatch[1].toLowerCase() === "x",
        why: "",
      };
      continue;
    }
    const whyMatch = raw.match(/^\s+>\s+(.+?)\s*$/);
    if (whyMatch && cur) {
      cur.why = cur.why ? cur.why + " " + whyMatch[1] : whyMatch[1];
    }
  }
  if (cur) choices.push(cur);
  return { kind: "quiz", q, choices };
}

// Convenience: parse full file → { frontmatter, blocks }
export function parseMarkdown(md) {
  const { frontmatter, body } = parseFrontmatter(md);
  const blocks = parseBlocks(body);
  return { frontmatter, blocks };
}
