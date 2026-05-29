# Framework guide (for future agents and contributors)

This document is the contract between the **engine** (code in `src/framework/`)
and the **content** (Markdown files and viz components). The engine is generic.
Everything specific to a particular school, course, or domain lives outside it.

Read this end-to-end before changing anything. Most tasks (add a course, add a
subtopic, add a quiz, add a new interactive demo) require zero changes to the
engine.

---

## 0. Content quality — read this before authoring

This section is for agents/humans **adding study material**. It is non-negotiable.

### 0.1 Analyse the source material completely before decomposing

Before you create a single MD file, read the entire source (the syllabus, the
slides, the textbook chapter, the exam topic list — whatever you're working
from) end-to-end. Skim-then-write produces lopsided structure: one topic with
fifteen subtopics, another with two, missing concepts that link them.

Concretely, before touching the manifest:

* List every concept the source covers, in your own notes.
* Group concepts into **topics** — coherent themes a student would study as a
  unit (e.g. "Graph algorithms", "Symmetric cryptography", not "Slide deck 3").
* Within each topic, define **subtopics** at roughly the same granularity —
  each one should be ~1 study session's worth of material. If one subtopic
  would be 5× the size of its neighbours, split it. If two are tiny and
  related, merge them.
* Identify cross-topic dependencies that matter for the exam — those become
  candidates for the `sharedWith` exam-topic feature.

Do not start writing MD files until the decomposition is on paper. Restructuring
after the fact is more work than getting it right once.

### 0.2 Do not hallucinate. Verify everything.

This is study material — wrong content actively harms students. Therefore:

* **Anything you can't verify from a primary source, don't write.** If you're
  unsure whether a definition is exactly right, whether an algorithm has the
  complexity you remember, whether a formula's signs are correct — look it up
  before writing it down.
* **Use the web.** If the source material is incomplete or ambiguous, search
  authoritative references (textbooks: CLRS, PBRT, Tanenbaum, Stallings, etc.;
  curated resources: cp-algorithms.com, Scratchapixel, PBR-Book, RFC documents,
  official language specs and standards; well-regarded university course
  notes).
* **Cross-check across at least two independent sources** for any claim that's
  numeric (complexity, constants, year), nuanced (the exact statement of a
  theorem, the precise difference between two algorithms), or
  counter-intuitive.
* If a source contradicts another, note the disagreement explicitly in the
  text rather than picking one silently.

### 0.3 Cite external material — include the links

If you used a reference to verify or expand a subtopic, link it. The reader
benefits twice: they trust the content more, and they have a path to deeper
study. Use either:

```markdown
::: link "PBRT v4 — Bounding Volume Hierarchies" "https://pbr-book.org/4ed/..."
:::
```

or an inline link inside the prose for incidental references.

Aim for at least one external link per subtopic when one exists. Prefer:

* Original/authoritative sources (papers, RFCs, language specs, the PBR Book,
  CLRS, etc.) over secondary explainers.
* Stable URLs (DOIs, official docs, archive.org snapshots for ephemeral pages)
  over personal blogs.
* Long-form references over Wikipedia (Wikipedia is a fine starting point but
  not a primary citation).

If a topic has a widely-used canonical interactive resource (e.g.
[setosa.io](https://setosa.io/) visual explanations, observable notebooks),
link those too — they complement the in-page viz components.

### 0.4 Build the mindmap deliberately

Per-course and global mindmaps are **curated** in `public/content/mindmaps/`
(see §8 for the full data model). The manifest's topic/subtopic decomposition
drives the on-page reading view and the fallback mindmap layout, while the
curated JSON drives the radial mindmap with its conceptual three-level
hierarchy and the global cross-course view.

When you author or restructure either layer:

* **Manifest topics follow the lecture.** Group subtopics by lecture theme so
  the reading-mode TOC and the on-page progress make sense as a study unit.
* **Curated mindmap branches follow the concept.** The mindmap can — and
  should — rearrange subtopics across lecture boundaries to match the
  student's mental model ("CPU foundations · Memory hierarchy · Parallelism"
  is a better mindmap shape than "Lecture 1 · Lecture 2 · …"). A subtopic
  appears in *exactly one* mindmap leaf even when it could fit in two.
* **Each course should have a mindmap JSON.** Missing files fall back to a
  two-ring auto-layout from the manifest; that's the prototyping path, not
  the shipping path.
* **The global mindmap is the catalogue's storefront.** Cross-course
  "bridges" (the Spectre/Meltdown link from AVS to BIS, MDP→RL from MSP to
  SUI, etc.) are the highest-leverage cells of the whole site — they're how
  students discover that two of their courses are studying the same idea
  from different angles. Add a bridge whenever you find one of those
  "wait, that comes back here?" moments.
* **Test the mindmap visually after adding content** — open `#/c/<id>/mm`
  and `#/mm`. Labels should not overlap heavily and arcs should look
  balanced. If a branch is much bigger than its peers, that's a signal
  either to split it or to demote some leaves to a less-emphasised cluster.

A subtopic that doesn't fit any existing mindmap branch is a signal that you
need a new branch — not that you should jam it into the closest one. The
inverse also holds: a near-empty branch with one leaf is a signal to merge.

### 0.5 Cross-references and exam sets

When adding final-exam topic sets (`manifest.json` → `exam`), each `refs` entry
must point at a subtopic that exists in the catalogue. The reference is
**by-id**, so if a subtopic's content shifts to a different topic, its id
should not change — fix the path, not the id.

Use `sharedWith` honestly: only list specs whose exam genuinely covers the
*same* area. Over-sharing pollutes the "Also in exam for" jumps.

### 0.6 Default to interactive visualisation — build a viz whenever possible

This is the single highest-leverage rule for authors. Reading walls of prose
is a poor way to learn spatial, algorithmic, or dynamic concepts; a tiny
draggable demo teaches in seconds what paragraphs can't. **Treat an
interactive viz as the default, not the exception.** When in doubt, build it.

Before you write a subtopic, ask:

1. Does the concept have a *moving part* — a parameter that varies, an
   algorithm that runs in steps, a structure that can be manipulated, a state
   that transitions, a numeric input that yields a visible output? If yes,
   **build an interactive viz** (`::: viz <id>`). Even a minimal one (one
   slider, one toggle, one step button) is worth more than the cleanest
   static diagram.

2. Does the concept have *spatial structure* but no moving parts — geometry,
   a state machine, a network topology, a data layout, a layered model?
   Build an **inline SVG** figure.

3. Is the concept genuinely a-visual (pure prose argument, definition list,
   citation)? Then no figure is needed — but verify there really is nothing
   to show before defaulting to prose.

Default is "yes, build the viz." Common excuses to push back on:

* "*The concept is simple enough without a demo.*" Simple concepts make the
  best small visualisations — fewer affordances to design, faster to ship,
  and they let the reader build intuition for free. Build it.
* "*Adding a viz feels like over-engineering for two paragraphs of content.*"
  A 50-line component is the right size for two paragraphs of content. The
  bar is "is the component meaningful?", not "is it elaborate?".
* "*I'd need to build a new component.*" Yes — that's the workflow. New viz
  components are cheap (see §5), and the registry has no opinion on count.
  When in doubt, look at existing components in `src/viz/` for shape: most
  are 60–150 lines.
* "*An SVG would be enough.*" Then ask whether even a single tweakable
  parameter would help the reader. If yes, lift it to a viz. Static SVGs are
  for cases where there is genuinely nothing to interact with.

When you do build, the framework supports four ways to show a visual; use
them in this priority order:

1. **Interactive viz component** (`::: viz <id>`). The strongest option when
   the concept has a moving part — a parameter to slide, a structure to
   manipulate, steps to step through. Build a new component in `src/viz/`
   (see §5) and register it. Existing ones: `rasterize`, `ray`, `bfs`,
   `btree`, `handshake`, `biasvar`. Prefer SVG for components unless you
   genuinely need pixel-level work (then Canvas).

2. **Inline SVG** (`::: svg "caption" … :::`). For static figures you want
   to redraw cleanly — diagrams, geometry, plots, state machines. Inline SVG
   is theme-aware (use `var(--accent)`, `var(--text)`, etc. inside the SVG)
   and scales sharply on every screen.

3. **Image file** (`![alt](path/to/img.png "caption")` or `::: image …`).
   Use when the figure is genuinely best as raster (a photo, a screenshot of
   real output, an SEM micrograph). Put the file in
   `public/content/courses/<id>/_assets/` and reference its path relative to
   `public/`.

4. **Slide screenshot** as a temporary fallback. Acceptable only when (a) a
   redraw would take more effort than it's worth right now, and (b) the
   figure is essential to the explanation. Treat this as a TODO: prefer
   redrawing as SVG when you have time. When you do use one, include a
   source attribution in the caption (course name + lecture number) so the
   provenance is clear, and don't include figures whose redistribution is
   restricted by an explicit notice on the original.

`::: diagram` (placeholder block) is for cases where you've identified that a
figure is needed but haven't drawn it yet — it renders a striped placeholder
in the app, which serves as a visible TODO until you replace it with one of
the four above.

Rules of thumb:

* If a concept has *any* dynamic behaviour (an algorithm running, a parameter
  varying, a structure being built up), build a viz, even a tiny one. The
  "even a tiny one" is not a hedge — it's the explicit standard.
* If a concept has *any* spatial relationship (geometry, network topology,
  data layout, state-machine), draw an SVG. Don't substitute prose. And ask
  yourself whether a slider or toggle would lift it to a viz; usually it
  would.
* If a textbook or course slide deck has a famous canonical figure (the
  rasterization pipeline diagram, a TCP state machine, the OSI cake), either
  redraw it from scratch in SVG (better) or link to the authoritative source
  (next best). Don't paraphrase a famous diagram in words.
* A "good" subtopic in this project has at least one figure or viz. A
  *great* subtopic has an interactive one. Aim for great.

#### Sizing — keep figures tight and text body-sized

A figure that fills the column with tiny embedded text is worse than a
compact diagram with text the reader can read at a glance. Practical
constraints:

* **viewBox heights** — keep modest. Around 140–200 for simple diagrams,
  up to ~260 for richer ones. Avoid 280+ unless content really demands it.
* **Text inside SVG** — should render close to body-text size. With the
  global CSS cap (`.block-svg svg { max-width: min(100%, 580px) }`) and a
  viewBox width of 500–540, a `font-size` of 12–14 yields rendered text
  roughly the size of surrounding paragraphs.
* **Don't stretch figures to the column edge.** The SVG block is capped at
  ~580px wide by CSS; if you need a tighter cap, set `style="max-width:…"`
  on the `<svg>` itself.
* **Test the result** — render the page locally and check that figures don't
  dominate the screen and that text is readable without zoom.

### 0.7 Don't duplicate the framework's navigation

The framework already exposes the topic/subtopic tree on the topic detail
page, and `[[wikilinks]]` cross-reference adjacent material. Reproducing that
structure inside a markdown file is pure boilerplate that the reader has
already seen on the previous screen.

* **No `## Souhrn přednášky` (lecture recap) sections** that list all
  subtopics of the same topic with `[[links]]`. The navigation shows them.
  If a genuine comparison table or key insight sits inside such a section,
  salvage it into its own heading (`## Srovnání algoritmů`, `## Klíčový
  poznatek`) and drop the surrounding list + forward-pointer narrative.
* **No `## Co dále` sections that contain a numbered or bulleted list** of
  upcoming subtopics with `[[links]]`. A single-sentence narrative bridge
  to the next subtopic by name is fine ("Detekce přes sekvenční čísla je
  jasná. Otázka je *jak dlouho čekat* — viz [[timeouty-rtt]]."). Anything
  list-shaped is index duplication.
* **No "this topic will cover X, Y, Z" intro enumerations.** Write a
  narrative orientation paragraph. Prose with 2–3 items in comma form
  ("Tato sekce probere A, B a C — …") is fine; a bulleted preview list of
  upcoming sections is not.
* The `*Zdroj: ... Externí reference: ...*` footer at the very bottom is
  a citation block, not navigation — that stays.

### 0.8 Don't name the source institution or instructor in body text

Some instructors don't want to be named in derivative material. Keep the
home institution and named instructors out of the prose.

* **OK at the bottom:** the final `*Zdroj: PDS přednáška N, [Prof Name],
  [Degrees], FIT VUT v Brně. Externí reference: ...*` citation footer.
  Scholarly attribution is expected there.
* **Not in body text:** any in-prose mention of the instructor by name,
  the university by name, or example hostnames/URLs that point to
  instructor-specific resources (e.g. `pc01.fit.vutbr.cz`,
  `nes.fit.vutbr.cz/<username>/`). Use generic placeholders like
  `pc01.example.com`. If a personal course-page URL slipped into the
  citation list, remove that one URL but keep the rest of the citation.
* **Academic citations are fine** even if the cited author teaches the
  course — citing a published paper or book is different from name-dropping
  a professor in the explanation prose.

### 0.9 Failure modes to avoid

* **Drive-by additions**: dropping one MD file without slotting it into the
  mindmap structure or the exam set. Either the content matters and belongs
  in the catalogue, or it doesn't — there is no in-between.
* **Copy-paste from the prototype**: the `school-helper-design/` directory in
  this repo is the original mockup. Its content is placeholder text. Do not
  paste from it without verifying every claim against a real source.
* **Wall-of-text subtopics**: a subtopic that is one giant text block is
  worse than the same content split into 2–4 paragraphs, a math block, a
  diagram, and a link. Use the block types.
* **Inventing a viz that doesn't exist**: `::: viz <id>` only works for ids
  registered in `src/viz/index.js`. If you want a new viz, build it (§5) —
  don't reference a phantom id.
* **Shipping a subtopic without a viz when the concept clearly has moving
  parts**: re-read §0.6. The default is "build the viz." If you decide not
  to, the reason should be in your head before you start writing, not after.
  "I forgot to add one" is a defect, not a style choice.
* **Leaving a viz next to the static figure it replaces**: when you add a
  `::: viz <id>` block that covers what an ASCII-art / inline-SVG / placeholder
  diagram already shows, delete the old figure in the same edit. Duplicate
  figures clutter and contradict the interactive version.
* **Boilerplate recap/preview lists**: see §0.7. End-of-file "Souhrn
  přednášky" or numbered "Co dále" lists, and top-of-file "this section
  covers X, Y, Z" enumerations, duplicate the navigation.
* **Name-dropping the home institution or instructor in prose**: see §0.8.
  The citation footer at the bottom is the appropriate place for source
  attribution; the body of the page should be source-agnostic study material.

---

## 1. How the pieces wire together

```
                         ┌─────────────────────────────────┐
                         │ public/content/manifest.json    │  ← single source of
                         │   (specs, courses, exam sets,   │    truth for the
                         │    pointers to MD files)        │    course catalogue
                         └─────────────────┬───────────────┘
                                           │ fetch
                                           ▼
                         ┌─────────────────────────────────┐
                         │ src/framework/content-loader.js │
                         │   • fetches manifest            │
                         │   • fetches every .md it lists  │
                         │   • runs md-parser on each      │
                         └─────────────────┬───────────────┘
                                           │
                                           ▼
            content = {                                                   src/viz/index.js
              SPECIALIZATIONS,                                            ─────────────────
              COURSES (with .topics, subtopics, blocks),                  registers viz
              EXAM_TOPICS,                                                components by id
              findSpec / findCourse / findSubtopic
            }                                                             ::: viz <id>
                                           │                                       ▲
                                           ▼                                       │
                         ┌─────────────────────────────────┐                       │
                         │ src/app.jsx (router + chrome)   │                       │
                         │  routes hash → page component   │                       │
                         └─────────────────┬───────────────┘                       │
                                           │                                       │
                                           ▼                                       │
                         ┌─────────────────────────────────┐                       │
                         │ src/framework/pages.jsx         │                       │
                         │  CoursesPage, CourseDetailPage, │                       │
                         │  SpecPage, ExamPage, …          │                       │
                         └─────────────────┬───────────────┘                       │
                                           │                                       │
                                           ▼                                       │
                         ┌─────────────────────────────────┐                       │
                         │ content-blocks.jsx              │  ─── viz block ──────►│
                         │  text · math · code · link ·    │                       │
                         │  diagram · quiz · viz           │                       │
                         └─────────────────────────────────┘
```

**Boot sequence (`src/app.jsx`):**

1. `loadContent()` fetches `public/content/manifest.json`, then fetches every
   `.md` file declared inside, parses each into a `blocks[]` array, and returns
   the hydrated model.
2. `src/viz/index.js` is imported for its side effects; each viz module calls
   `register("<id>", Component)` once.
3. React renders the App, which routes off `location.hash` and passes
   `content` down into every page.

**Where progress lives:** `localStorage` under `okruhy.progress.v1`. Keys are
`<courseId>/<topicId>/<subtopicId>`. Implemented in
`src/framework/progress.js`.

---

## 2. How to add a course

1. Decide an id (short, uppercase, like `IZG`, `IAL`, `KRY`). The id is used
   in URLs (`#/c/IZG`) and as a localStorage prefix, so do not rename later.
2. Append an entry to `public/content/manifest.json` → `courses[]`:

   ```json
   {
     "id": "KRY",
     "name": "Cryptography",
     "credits": 5,
     "semester": "Winter",
     "specializations": ["NSEC", "NISD"],
     "blurb": "Symmetric and public-key cryptography, hash functions, protocols.",
     "topics": [ /* see §3 */ ]
   }
   ```
3. The `specializations` array must reference ids that exist in the
   manifest's top-level `specializations[]`. Each id you list there shows the
   course as a colored dot.

You don't need to touch any code under `src/`.

---

## 3. How to add a topic or subtopic

A **topic** is a folder-level grouping inside a course. A **subtopic** is a
single Markdown file.

Inside the course entry in `manifest.json`:

```json
"topics": [
  {
    "id": "symmetric",
    "title": "Symmetric Cryptography",
    "subtopics": [
      { "id": "aes",   "src": "content/courses/KRY/symmetric/aes.md" },
      { "id": "modes", "src": "content/courses/KRY/symmetric/modes.md" }
    ]
  }
]
```

Then create the matching `.md` files under `public/content/courses/KRY/symmetric/`.

**File paths are relative to the site root (`public/`)**. The loader resolves
them with Vite's `BASE_URL`, so the same manifest works locally and on GitHub
Pages.

A subtopic's display title comes from the MD frontmatter `title:` field — fall
back to the subtopic `id` if missing.

---

## 4. Markdown format (`*.md`)

Every subtopic is one Markdown file. The parser is in
`src/framework/md-parser.js`. Supported syntax:

### Frontmatter (optional)

```markdown
---
title: Triangle rasterization
---
```

Only `title:` is read currently. The block is delimited by `---` lines at the
very top of the file.

### Paragraphs → text blocks

Blank lines separate paragraphs. Each paragraph becomes one `text` block.
Inline markdown understood: `**bold**`, `*italic*`, `` `code` ``,
`[label](url)`.

### Fenced code blocks → code blocks

````markdown
```python
def edge(a, b, p):
    ...
```
````

The language tag (`python`, `c`, `sql`, `latex`, `js`, `rust`, …) enables
syntax highlighting via a regex-based tokenizer in `content-blocks.jsx`. Add
new languages by extending the `kw` map in `highlightCode`.

### Typed fences `:::`

```markdown
::: math
E[(y − f̂(x))²] = (Bias[f̂])² + Var[f̂] + σ²
:::

::: diagram "Pipeline overview" "Vertex → Tessellation → Geometry → Rasterizer"
:::

::: link "PBRT v4 — BVHs" "https://pbr-book.org/4ed/..."
:::

::: viz rasterize "Drag the vertices to see which pixels light up."
:::

::: svg "BFS expands in waves from the source"
<svg viewBox="0 0 200 100">
  <circle cx="40" cy="50" r="14" fill="var(--accent)" />
  <text x="40" y="54" text-anchor="middle" fill="white" font-size="11">s</text>
  <!-- …rest of the figure… -->
</svg>
:::

::: image "content/courses/IZG/_assets/pipeline.png" "Graphics pipeline stages" "Modern rasterization pipeline (redraw of slide 12)"
:::

::: quiz "Why use edge functions on a modern GPU?"
- [x] Edge functions are easy to parallelize per-pixel.
  > Yes — each pixel test is independent, perfect for SIMD/SIMT.
- [ ] They produce more accurate barycentric coordinates.
  > Both methods can produce exact barycentrics. The win is parallelism.
- [ ] They avoid floating-point math.
  > Edge functions still use float; the advantage is independence.
:::
```

Argument parsing: tokens after `:::` are split on whitespace, with
double-quoted runs kept together. So `::: viz rasterize "Drag the vertices."`
yields args `["rasterize", "Drag the vertices."]`.

| Fence       | Required args                                | Body content                          |
|-------------|----------------------------------------------|---------------------------------------|
| `math`      | —                                            | the formula (preformatted)            |
| `diagram`   | `"label"` (optional `"caption"`)             | empty or caption — placeholder/TODO marker |
| `image`     | `"src"` (optional `"alt"`, `"caption"`)      | optional caption (overridden by 3rd arg) |
| `svg`       | optional `"caption"`                         | raw inline SVG markup                 |
| `link`      | `"label" "url"`                              | empty (or `[label](url)` instead)     |
| `viz`       | `<id>` then optional `"caption"`             | empty                                 |
| `quiz`      | `"question"`                                 | a list of `- [x] / - [ ]` choices, each optionally followed by an indented `> reason` line |

### Standalone link line

A line containing only `[label](url)` becomes a link block. (Inline links inside
paragraphs stay inline.)

### Standalone image line

A line containing only `![alt](src "optional caption")` becomes an image block.
`src` is resolved relative to `public/` and Vite's `BASE_URL`, so the same path
works locally and on GitHub Pages. The natural place to store assets is
`public/content/courses/<course-id>/_assets/`.

```markdown
![Rasterization pipeline overview](content/courses/IZG/_assets/pipeline.svg "Stages of the modern pipeline")
```

For raw inline SVG (preferred over a file when feasible), use the `::: svg` fence
above. Body markup goes through `dangerouslySetInnerHTML` — only acceptable
because the MD files in this repo are author-controlled. Don't accept SVG from
untrusted sources without sanitization.

---

## 5. How to add an interactive visualisation

Visualisations live in `src/viz/`. Each is a normal React component.

1. **Create a new component file** in `src/viz/`. It must default-export a
   React component:

   ```jsx
   // src/viz/heap.jsx
   import { useState } from "react";

   export default function Heap() {
     const [keys, setKeys] = useState([7, 3, 9, 1]);
     // …draw your demo. Use CSS variables (var(--accent), var(--bg-inset))
     // so it works in both light and dark themes.
     return <svg viewBox="0 0 280 180">…</svg>;
   }
   ```

   Conventions to keep visual coherence with other demos:
   * Use a 280×180 viewBox unless you have a strong reason otherwise.
   * Stroke/fill from CSS vars: `var(--accent)`, `var(--accent-line)`,
     `var(--bg-inset)`, `var(--bg-card)`, `var(--line)`, `var(--line-strong)`,
     `var(--text)`, `var(--text-faint)`, `var(--text-muted)`.
   * For pointer/drag handlers, attach window listeners while dragging and
     remove them in cleanup (see `rasterize.jsx` for the pattern).

2. **Register it** in `src/viz/index.js`:

   ```js
   import Heap from "./heap.jsx";
   register("heap", Heap);
   ```

3. **Reference it from any MD file**:

   ```markdown
   ::: viz heap "Insert keys. The tree re-heapifies on each push."
   :::
   ```

The id you pass to `register()` is the same string MD authors will write.
Use lowercase, no spaces.

If a markdown file references an unregistered id, the block renders a friendly
"viz not registered" notice instead of crashing.

### 5.1 Pitfall — never put raw LaTeX in JSX text content

JSX treats `{X}` between tags as a JavaScript expression, **not** as literal
braces. Writing LaTeX with curly braces directly in viz prose will crash the
page at runtime with `X is not defined` — and `npm run build` will NOT catch it
because it is a runtime `ReferenceError`, not a syntax error.

```jsx
// ❌ JSX parses {F} as expression → "F is not defined"
<div>Nad konečným tělesem $\mathbb{F}_p$ není geometrie</div>

// ✓ Plain math notation
<div>Nad konečným tělesem F_p není geometrie</div>

// ✓ If LaTeX is truly needed, escape as a string in an expression
<div>{"Nad konečným tělesem $\\mathbb{F}_p$ není geometrie"}</div>
```

Same trap applies to `\mathcal{X}`, `\mathbf{X}`, `\frac{a}{b}`, `\sqrt{n}`,
`\binom{n}{k}`, `\sum_{...}^{...}`, `\{0,1\}^*`, etc. — anything with `{...}`
inside JSX text.

LaTeX in `*.md` files via `::: math` blocks or inline `$…$` is fine — that
goes through the math renderer, not JSX.

Audit before shipping a viz batch:

```sh
grep -nE 'mathbb|mathcal|mathbf|\\frac\{|\\sqrt\{|\\binom\{' src/viz/*.jsx
```

---

## 6. How to add a specialization

In `manifest.json`, append to `specializations[]`:

```json
{ "id": "NBIO", "name": "Bioinformatics", "short": "Bio", "hue": 110,
  "blurb": "Sequence analysis, structural biology, omics pipelines." }
```

* `id` — short uppercase code. Used in URLs (`#/s/NBIO`).
* `hue` — OKLCH hue (0–360) used everywhere this spec is shown (dots, chips,
  hero card gradient). Pick one that doesn't clash with neighbours; existing
  specs use 22 / 80 / 142 / 200 / 264 / 340.
* `short` — one- or two-word label shown next to the id.

Once added, the new spec automatically appears on `/s` and `/x` and can be
listed in any course's `specializations` array.

---

## 7. How to add an exam-topic set

Each specialization can declare a list of state-exam topic areas, where each
area aggregates one or more existing subtopics across courses.

In `manifest.json` → `exam`:

```json
"exam": {
  "NBIO": [
    {
      "id": "bio-1",
      "n": 1,
      "title": "Sequence alignment & search",
      "refs": [
        ["IAL", "graphs", "bfs-dfs"],
        ["BIO", "alignment", "needleman-wunsch"]
      ],
      "sharedWith": ["NMAL"]
    }
  ]
}
```

* `n` — display number (1, 2, 3, …) shown as `01`, `02`, …
* `refs` — list of `[courseId, topicId, subtopicId]` triples. Each ref must
  point at a subtopic that exists in the catalogue, otherwise it's silently
  skipped at render time.
* `sharedWith` (optional) — list of other spec ids that have an equivalent
  exam area. Renders colored badges. The "Also in exam for" jump on the topic
  detail page tries to find a matching topic in those specs by title.

---

## 8. How the mindmap works

There are **two** mindmap views in the app:

1. **Per-course mindmap** at `#/c/<id>/mm` — a radial map of one course.
2. **Global mindmap** at `#/mm` — every course on one canvas, grouped by
   conceptual domain, with cross-course "bridge" edges for shared concepts.

Both render from JSON files in `public/content/mindmaps/`. The data is
**curated**, not derived from the manifest, because:

* The manifest's `topics[]` reflects **lecture order** ("Pipelining" → "OoO"
  → "Cache"). A *good mindmap* groups by **concept** ("CPU foundations",
  "Memory hierarchy", "Parallelism") — those don't have to match lecture
  topics. A mindmap branch can pull subtopics from multiple lecture topics
  if they belong to the same conceptual cluster.
* A 3-level hierarchy (branch → cluster → leaf) is too rich for a 2-level
  manifest. Putting it in a separate file keeps the manifest small and the
  mindmap restructurable without disturbing URLs.

If the JSON file is missing the renderer falls back to an auto-layout that
uses the manifest's topic/subtopic structure (the old behaviour). This is the
"good enough" path for a new course; replace it with a curated mindmap once
the course has settled.

### 8.1 Per-course mindmap — `public/content/mindmaps/<COURSE>.json`

Shape:

```json
{
  "courseId": "PDS",
  "title": "Computer networks & protocols",
  "summary": "From link layer through transport to SDN and P4",
  "branches": [
    {
      "id": "transport",
      "label": "Transport layer",
      "hue": 142,
      "summary": "End-to-end reliable delivery",
      "clusters": [
        {
          "id": "connection-oriented",
          "label": "Connection-oriented",
          "leaves": [
            { "ref": "tcp-spojeni-hlavicka" },
            { "ref": "sctp", "label": "SCTP (optional override)" }
          ]
        },
        {
          "id": "connectionless",
          "label": "Connectionless",
          "leaves": [{ "ref": "udp-dccp" }]
        }
      ]
    }
  ]
}
```

* **`branches[]`** — top-level conceptual groups (3–9 per course). These
  become the inner ring of chips around the course node.
* **`clusters[]`** inside each branch — sub-groups (1–5 per branch). They
  become labels on the middle ring.
* **`leaves[]`** inside each cluster — individual subtopics. `ref` must
  match a `subtopic.id` somewhere in the manifest catalogue (any course is
  fine; cross-references resolve through the global subtopic index). The
  optional `label` overrides the displayed text — useful when the subtopic
  title is long.
* **`hue`** on a branch — OKLCH hue (0–360) used to colour that branch's
  arcs and chips. Pick values that distinguish neighbours. If omitted, the
  renderer auto-rotates through the palette.
* **`summary`** strings on the course and branches — short context lines.
  Currently only the course-level summary renders; branch summaries are
  reserved for future tooltip/hover use.

### 8.2 Global mindmap — `public/content/mindmaps/_global.json`

Shows how the courses fit together. Shape:

```json
{
  "title": "FIT MIT — common backbone",
  "summary": "Cross-course concept map.",
  "domains": [
    {
      "id": "crypto",
      "label": "Cryptography",
      "hue": 80,
      "summary": "Algorithms, hash, signature, PKI",
      "courses": [
        {
          "id": "KRY",
          "weight": 1.0,
          "highlights": [
            { "ref": "3des-aes", "label": "AES" },
            { "ref": "rsa", "label": "RSA" }
          ]
        },
        {
          "id": "BIS",
          "weight": 0.35,
          "highlights": [{ "ref": "kryptografie-role", "label": "Crypto in IS" }]
        }
      ]
    }
  ],
  "bridges": [
    {
      "id": "spectre",
      "label": "Spectre / Meltdown",
      "from": { "domain": "architecture", "ref": "spekulace-vyjimky" },
      "to":   { "domain": "infosec",      "ref": "hw-zranitelnosti" }
    }
  ]
}
```

* **`domains[]`** — top-level conceptual clusters that span courses (e.g.
  "Cryptography" covers KRY, BIS and BZA). Each domain becomes an inner-ring
  chip.
* **`courses[]`** inside a domain — courses that contribute to that
  domain. `weight` (0–1) pulls a secondary course closer to the centre
  (lower weight = closer to its domain chip, away from the perimeter).
  `highlights` are the **emblematic subtopics** that justify the course's
  membership; 4–7 each is a reasonable target. A course can appear in
  multiple domains (e.g. AVS contributes to both "Architecture" and
  "Parallelism").
* **`bridges[]`** — explicit cross-domain concept links. Each bridge points
  from one (domain, subtopic) to another and is rendered as a curved arc
  with a hover label. Use bridges for the genuinely surprising "wait, that
  comes back here?" cross-references: Spectre in AVS that resurfaces in
  BIS, MDP in MSP that becomes RL in SUI, CAP in UPA that ties back to
  Paxos in PRL.

### 8.3 Authoring guidelines

When you add or restructure a course mindmap:

* **Group by concept, not by lecture.** "Foundations · Search · Sort ·
  Matrix · Tree algorithms · Distributed systems" beats "Lecture 1 ·
  Lecture 2 · …". The same lecture topic can split into multiple branches
  if its subtopics naturally split, and two lecture topics can collapse
  into one branch if the concepts are tightly related.
* **Balance.** 3–9 branches, 1–5 clusters per branch, 1–7 leaves per
  cluster. Bigger imbalances are a smell — you probably need to split a
  branch or merge a sparse one.
* **Verify the refs.** Every `ref` must match a real subtopic `id` in the
  manifest. Use the validator below.
* **Don't repeat leaves.** A subtopic belongs in one cluster of one branch.
  If two clusters both want it, your branches overlap conceptually — fix
  the structure.
* **Use the `hue` field** so neighbouring branches have visually distinct
  colours. The renderer rotates hues by default, but explicit hues let you
  match colour to meaning (security = pink/red, theory = purple, etc.).

When you edit the global mindmap:

* **Domains are not the same as specializations.** Specializations are
  administrative ("which courses count for NSEC"). Domains are conceptual
  ("Cryptography spans KRY, BIS, BZA"). Don't confuse them.
* **Membership signals proximity, not equivalence.** KRY is the *primary*
  source of cryptography (weight 1.0); BIS uses crypto but isn't primarily
  a crypto course (weight ~0.3).
* **Reserve bridges for the most pedagogically useful cross-refs.** Bridges
  are visually expensive — 15–30 is enough. Don't connect every shared
  concept; let the domain memberships do that work.

### 8.4 Validate before shipping

```sh
node --input-type=module -e '
import fs from "node:fs";
const m = JSON.parse(fs.readFileSync("public/content/manifest.json", "utf8"));
const ids = new Set();
for (const c of m.courses) for (const t of c.topics) for (const s of t.subtopics) ids.add(s.id);
const mmDir = "public/content/mindmaps";
const broken = [];
for (const f of fs.readdirSync(mmDir)) {
  const d = JSON.parse(fs.readFileSync(`${mmDir}/${f}`, "utf8"));
  const refs = [];
  if (f === "_global.json") {
    for (const dom of d.domains || []) for (const c of dom.courses || []) for (const h of c.highlights || []) refs.push(h.ref);
    for (const b of d.bridges || []) { refs.push(b.from?.ref, b.to?.ref); }
  } else {
    for (const br of d.branches || []) for (const cl of br.clusters || []) for (const lf of cl.leaves || []) refs.push(lf.ref);
  }
  for (const r of refs) if (r && !ids.has(r)) broken.push(`${f}: ${r}`);
}
console.log("broken refs:", broken.length);
if (broken.length) console.log(broken.join("\n"));
'
```

`broken refs: 0` is the only acceptable outcome.

### 8.5 Rendering internals

| File | Purpose |
|------|---------|
| `src/framework/mindmap.jsx`        | Per-course renderer. `StructuredMindmap` for curated JSON, `AutoMindmap` fallback for manifest-only. |
| `src/framework/global-mindmap.jsx` | Global cross-course renderer with bridges. |
| `src/framework/content-loader.js`  | Fetches `mindmaps/*.json`; exposes `content.findMindmap(id)` and `content.GLOBAL_MINDMAP`. |

The renderers share a pan + zoom shell, theme-aware colours via `oklch(…)`
expressions, and the same click-to-navigate contract: `onNavigate(courseId,
topicId, subtopicId)`. Subtopic completion (from `localStorage`) fills the
leaf dot.

---

## 9. Sanity checklist before submitting a content change

* [ ] `manifest.json` parses (`node -e 'JSON.parse(require("fs").readFileSync("public/content/manifest.json"))'`).
* [ ] Every `src:` path in the manifest resolves to a real file under `public/`.
* [ ] Every `["course", "topic", "subtopic"]` ref in `exam` resolves.
* [ ] `npm run build` succeeds.
* [ ] Opening the course in dev shows the subtopics and any vizs render.

---

## 10. Engine internals (only relevant if you're changing the framework)

| File | What it owns |
|------|--------------|
| `src/framework/content-loader.js` | Fetching manifest + MD files, hydrating the in-memory model. |
| `src/framework/md-parser.js`      | Parsing one MD string into `{ frontmatter, blocks[] }`. |
| `src/framework/content-blocks.jsx`| Rendering every block kind. New block kind? Add a renderer and a case in `Block`. |
| `src/framework/viz-registry.js`   | `register(id, Component)` + `get(id)`. |
| `src/framework/mindmap.jsx`       | Radial course-mindmap layout. |
| `src/framework/pages.jsx`         | All route page components (courses, specs, exam, course detail). |
| `src/framework/progress.js`       | localStorage + React hooks for progress & user tweaks. |
| `src/app.jsx`                     | Hash router, theme application, sheets, app shell. |
| `src/main.jsx`                    | React mount, removes the boot fade. |

**Adding a new block kind** (e.g. `embed` for YouTube):

1. In `md-parser.js`, add a case in `makeTypedBlock` returning
   `{ kind: "embed", … }`.
2. In `content-blocks.jsx`, add a renderer component and a case in `Block`.
3. Add any required CSS to `src/styles.css`.

The block shape is freeform — only `kind` is required.
