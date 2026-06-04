# Framework guide (for future agents and contributors)

This document is the contract between the **engine** (code in `src/framework/`)
and the **content** (Markdown files and viz components). The engine is generic.
Everything specific to a particular school, course, or domain lives outside it.

Read this end-to-end before changing anything. Most tasks (add a course, add a
subtopic, add a quiz, add a new interactive demo) require zero changes to the
engine.

> ### ⚠️ Provenance of existing content — read this before assuming anything
>
> Every course/topic/subtopic decomposition currently in this repo was seeded
> from **one student's personal lecture notes** (annotated slides, captures
> of lectures the student attended, exam-prep summaries) plus the official
> VUT FIT exam-okruhy PDF. That has two unavoidable consequences:
>
> * **Coverage is uneven.** Topics the lecturer dwelled on are deeply
>   broken-down; topics the lecturer skimmed (or that the student attended
>   half-asleep) may be missing entire subtopics that the official syllabus
>   covers. The exam PDF is the authoritative scope — when you find a PDF
>   topic that has no matching subtopic, that's a real gap to fill, not a
>   deliberate omission.
> * **Some material is over-included or off-syllabus.** A subtopic may
>   exist because it was on a slide the student saved, even though it's
>   tangential to the official exam scope. Don't treat the current
>   structure as load-bearing — splitting, merging, or removing subtopics
>   is fine when the official syllabus disagrees.
>
> The AI-generated study text on top of this scaffold inherits both
> problems and adds the usual AI failure modes. §0.2 — "Do not hallucinate.
> Verify everything." — is non-negotiable as a result. The blue ✓ verified
> badge in the UI marks the small subset that a human has reviewed
> end-to-end.

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
* **Test the mindmap visually after adding content** — open `/c/<id>/mm`
  and `/mm`. Labels should not overlap heavily and arcs should look
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

**Supplementary videos.** A subtopic may end with a `### Videa` section — placed
after the `::: link` references and before the `*Zdroj:*` footer — holding one or
more `::: youtube` embeds (see the typed-fences table). Conventions:

* **Audio language: English or Czech only.** Prefer an English explainer when one
  exists. A non-English video may stay *only* if it carries English subtitles —
  flag it with the 4th `"cc"` argument so the player turns captions on by default
  (`cc_load_policy=1&cc_lang_pref=en`).
* **Reputable educational channels only** (Computerphile, 3Blue1Brown, StatQuest,
  Ben Eater, Hussein Nasser, ByteByteGo, Neso Academy, PowerCert, NNgroup, …).
  Avoid Hindi/Hinglish re-teach channels (Gate Smashers, Unacademy, Knowledge Gate).
* **Never hand-type a video id** — resolve and validate real ids with `yt-dlp`. The
  whole pipeline lives in `tools/video-data/` (memory: `youtube-embed-and-video-curation`).

**Keep specialised material in the course that owns it.** If a subtopic's video (or
a deep aside) is really about another course's *specialty* — e.g. the Spectre/Meltdown
*attack* belongs to hardware security (BZA), not the computer-architecture course
(AVS) — host it in the specialist course's matching subtopic and leave only a
`[[cross-reference]]` behind in the origin. When unsure which course owns a topic,
check its scope on the VUT FIT page (`https://www.fit.vut.cz/study/course/<CODE>/.cs`).
Material that several courses *genuinely share* (probability for stats and ML; AES for
crypto and security; REST for web and enterprise IS) may stay duplicated — don't force
a move.

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
* **Over-tagging core content as non-core**: marking a definition, theorem, or
  the primary explanation of a concept with a `tier:` / `{tier=…}` marker (§4)
  hides exam-essential material behind a collapsed card. Tiers are for genuinely
  skippable asides — when unsure, leave it core.

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
                         │  routes path → page component   │                       │
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
3. React renders the App, which routes off the URL path (History API; legacy
   `#/…` links are rewritten to clean paths) and passes `content` into every page.

**Where progress lives:** `localStorage` under `okruhy.progress.v1`. Keys are
`<courseId>/<topicId>/<subtopicId>`. Implemented in
`src/framework/progress.js`.

---

## 2. How to add a course

1. Decide an id (short, uppercase, like `IZG`, `IAL`, `KRY`). The id is used
   in URLs (`/c/IZG`) and as a localStorage prefix, so do not rename later.
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
tier: example
---
```

Read keys: `title:` and `tier:` (see [Content tiers](#content-tiers--marking-non-core-content)
below). The block is delimited by `---` lines at the very top of the file.

### Content tiers — marking non-core content

Some material is **not core exam knowledge** — worked examples, real-world usage,
beyond-syllabus extras. Marking it lets a reader focus on the core and pull the rest up
on demand. A tiered item shows a small **badge**, a **"klikni pro zobrazení"** hint, and
is **collapsible**; **non-core starts collapsed by default**. The reader's expand/collapse
choice persists in `localStorage`, and the *entire* header is the click target. (Deep-
linking straight to a tiered *subtopic* — on the course-detail or exam page — auto-
expands that subtopic, so a shared link lands on visible content.) Tiers render
identically on the course-detail page and the exam pages.

There are two granularities:

**1. A whole subtopic** — a `tier:` line in the file's frontmatter:

```markdown
---
title: Příklady NoSQL databází
tier: example          # example | practice | extra | core ; add `open` → start expanded
---
```

**2. A heading-delimited section ("subsubtopic")** — a `{…}` attribute on the heading.
The section spans every block from that heading until the **next heading of equal-or-
higher level**; that whole run collapses into one card. Three equivalent spellings, plus
an optional `open` flag:

```markdown
## Princip H-můstku                          ← no marker → core, always shown

…core theory…

## Řízení DC motoru v praxi {tier=practice}  ← marked → collapsible, default-collapsed
## Worked example {.example}                 ← `.kind` shorthand
## Edge cases {extra open}                   ← bare kind + `open` (starts expanded)
```

Recognised kinds (defined in `src/framework/tier.js` — each picks a label + hue):

| `tier` | Badge | Use for |
|--------|-------|---------|
| `example`  | Příklad | illustrative worked examples that aren't the core idea |
| `practice` | V praxi | real-world usage / applications beyond the exam core |
| `extra`    | Navíc   | rounding-out detail beyond the official okruhy |
| `core`     | —       | explicit "this *is* core" (the default; rarely needed) |

An unrecognised kind written with an explicit marker (`{.foo}` / `{tier=foo}`) still
renders, with a generic **Doplněk** badge — but prefer the four above.

**Semantics the parser enforces (so markers never misfire):**

* **Default state** — a non-core item is collapsed unless it carries `open`; `core` (or
  no marker) is expanded. `tier: example open` / `{example open}` start expanded.
* **No accidental hijacking** — a heading ending in a *bare unknown* `{…}` (e.g.
  `## Stav {x}`, or inline math like `$\{0,1\}$`) is **not** tiered; the braces stay
  literal. Only a known kind, a `.kind`, or `tier=kind` is recognised as a marker.
* **A heading that is *only* the marker** (`### {tier=practice}`) keeps its literal text
  and is **not** tiered — real heading text must remain after the marker is stripped.
* **Sections group only at the subtopic level.** A `{tier=…}` heading nested inside a
  blockquote renders as a plain heading (no card); don't rely on tiering inside quotes.
* **Don't tag `### Videa`.** That heading is already stripped by the renderer (videos
  fold into the "Další zdroje" list), so a tier on it is a no-op.
* Figure deep-link numbering (`fig<N>`) is computed over the whole subtopic, so a
  collapsed section never shifts a core figure's share-link. (A figure that lives
  *inside* a collapsed section isn't scrolled to until the reader expands that section —
  only the subtopic container auto-expands on a deep-link.)

**Use it conservatively — this is the one rule that matters.** Most content is core;
over-tagging hides exam material behind a collapsed card. Reach for a tier only when a
section is genuinely skippable on a first pass — the worked example *after* the concept
is explained, the "where it's used in industry" aside, the historical tangent. When in
doubt, leave it core. A reader scanning for exam essentials should be able to trust that
everything *not* tiered is something they need.

Implementation: `tier.js` (`parseTier` → `{core,kind,defaultOpen,label,hue}`),
`content-loader.js` (subtopic frontmatter → `sub.tier`), `md-parser.js` (heading `{…}`
attribute → `block.tier`), `content-blocks.jsx` (`TierBadge`, `CollapsibleSection`,
section grouping, the hint), `pages.jsx` (subtopic badge + default-collapse),
`pages.jsx` also auto-expands the deep-linked subtopic; `progress.js`'s `useCollapsed`
stores an explicit collapsed/expanded flag with a per-key default, so non-core can default
to collapsed while everything else defaults to expanded.

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

::: youtube "https://www.youtube.com/watch?v=bpT5AV6j9N0" "Teoretická informatika: Turingovy stroje" "Tomáš Kocourek"
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
| `youtube`   | `"url-or-id"` (optional `"title"`, `"channel"`, `"cc"`) | empty (or the url instead of the 1st arg) — alias `video`/`embed`; 4th arg `cc` → English captions on (§0.5) |
| `quiz`      | `"question"`                                 | a list of `- [x] / - [ ]` choices, each optionally followed by an indented `> reason` line |

The `youtube` fence accepts a full watch/`youtu.be`/`/embed/`/`/shorts/` URL or a
bare 11-char id. At render time a subtopic's videos and its `::: link` references are
gathered out of the inline flow into one compact **"Další zdroje"** list at the end of
the subtopic (videos first); each video is a click-to-play row that mounts the
privacy-mode (`youtube-nocookie.com`) iframe only when the reader clicks, so a page with
many videos makes no third-party request until asked. Authoring is unchanged: place
videos at the end of a subtopic under a `### Videa` heading, after the `::: link`
references (the heading itself is dropped on render) — see any subtopic touched by
`tools/video-integrate.mjs`.

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

### 5.2 Layout pitfalls — what a screenshot will catch but `vite build` won't

The build is happy as long as the file compiles. The browser only complains if
JS throws. So every layout bug below ships unless you actually **render the
viz and look at it.** A scan of 215 viz pages caught these patterns:

**Right/bottom-edge clipping from miscounted cell widths.** A row of `n` cells
with width `cellW` placed after a left-side label gutter of `Lpad` needs
`Lpad + n*cellW + Rpad ≤ W`. If the canvas is too narrow (or the cell width
formula doesn't account for both pads), the last cell prints past the
viewBox and is invisible to the user.

```jsx
// ❌ For n = 8, cellW = 60, Lpad ≈ 80 → cells reach x = 560 but W = 540 → clipped
const W = 540;
const cellW = 60;
…cells.map((c, i) => <rect x={Lpad + i * cellW} … />)

// ✓ Account for both gutters explicitly
const W = 600;
const cellW = (W - Lpad - Rpad) / n;
```

Same trap for the **vertical** direction. `belief-state-vacuum` had 64 mini
grids at 6 per row → 11 rows × 56 px each = 616, but H = 320 sliced off the
bottom 6 rows. Always size the canvas to the *worst-case* preset (max `n`,
deepest tree, biggest grid), not the default.

**Labels positioned at the edge of their parent shape.** Text in SVG anchors
on the baseline, so a label at `y = r - 2` inside a circle of radius `r` has
its descenders crossing the stroke. Keep ~6 px between baseline and the
nearest stroke, or move the label outside the shape entirely.

```jsx
// ❌ Descenders of "term=0" bite the circle border
<circle r={22} … />
<text y={20} fontSize="9">term={n.term}</text>

// ✓ Move below the circle or shrink the y target
<text y={34} fontSize="9">term={n.term}</text>   // outside
<text y={14} fontSize="9">term={n.term}</text>   // inside but clear of stroke
```

**Bidirectional arrow labels stacking on top of each other.** If two arrows
share endpoints (A↔B both with `p = 1.00`), the midpoints are identical and
your two labels print in the same place unless the perpendicular offset is
≥ half the wider label. A 4-px perp offset is not enough for a "1.00"
glyph. Use 8+ px and place each label on its arrow's offset side.

```jsx
const perpX = -dy / d * 8, perpY = dx / d * 8;     // 8, not 4
<text x={(sx+ex)/2 + perpX * 1.5} y={(sy+ey)/2 + perpY * 1.5} … />
```

**Boxes that overlap when placed by absolute coords.** A rectangle drawn at
`x = pos.x - W/2, width = W` extends from `pos.x - W/2` to `pos.x + W/2`. If
two boxes have centers closer than `W`, they overlap and one covers the
other's label. Either widen the canvas + respace, or shrink the box.

```jsx
// ❌ Centers at x = 180 and x = 230, box width 120
//    → box1 ends at 240, box2 starts at 170 → 70 px of overlap
<rect x={pos.x - 60} width={120} …/>

// ✓ Spread centres so |Δx| ≥ box width + small gap
```

**Sharing the same horizontal band between two visual regions.** If the
state graph occupies the left half and the bar chart occupies the right
half but they live at the same y range, node labels collide with bar
labels. Either widen the canvas so the two regions don't overlap, or move
one to a separate `<svg>` and stack vertically.

**Text crossing a polyline.** A `<text>` printed on top of a polyline gets
visually struck through by the line. Add a background rect (matched to the
panel fill) just behind the text, or use the paint-order stroke halo trick:

```jsx
// Background rect
<rect x={3} y={2} width={96} height={14} fill="var(--bg-inset)"
  stroke="var(--line)" strokeWidth="0.5" rx="2" />
<text x={5} y={12} fontSize="9">DTW dist = {d.toFixed(3)}</text>

// Or stroke halo (paints the stroke first as a halo)
<text style={{ paintOrder: "stroke" }}
  stroke="var(--bg-card)" strokeWidth="3" strokeLinejoin="round"
  fill="var(--text)">{label}</text>
```

**`textAnchor="start"` labels near the right edge.** Text width is roughly
`len * 6.5 px` at `fontSize: 11`. If `x + textWidth > W`, the label
overflows. Either right-anchor it, shorten the string, or move x left.

**Multiple `<svg>` elements in one component — coordinates do not share a
space.** A `<marker viewBox="0 0 10 10">` inside `<defs>` has nothing to do
with the outer canvas's viewBox. If you write a static-analysis script that
greps for `viewBox`, take the **first** SVG tag, not the largest viewBox you
find. Similarly, an inner detail `<svg viewBox="0 0 520 140">` next to a
parent `<svg viewBox="0 0 540 70">` are independent coordinate systems —
don't reason about positions across them.

**Comparison viz that don't read as comparisons.** When the viz name or
description says "A vs B", the user must *see* both A and B simultaneously.
Anti-patterns: tab-switcher that only shows one at a time; one side
visualised as a chart and the other reduced to a number in the legend; two
panels with no header or divider so they look like one continuous figure.
The fix: explicit panel headers, a centred "VS" pill or vertical divider,
matched axes/legends on both sides, key-metric callouts on each side so the
two-way trade-off is obvious.

```jsx
// Side-by-side comparison pattern
<rect x={4}             y={4} width={panelW} height={28} … />       // left header
<text x={panelW/2}      y={20}>A · description</text>
<rect x={panelW + 28}   y={4} width={panelW} height={28} … />       // right header
<text x={panelW*1.5+28} y={20}>B · description</text>
<circle cx={panelW + 16} cy={18} r={13} … />                        // VS pill
<text   x={panelW + 16} y={22}>VS</text>
<line   x1={panelW+16} y1={36} x2={panelW+16} y2={H-50}             // divider
  strokeDasharray="3 4" />
```

**Tiny interactivity is fine, fake interactivity is not.** A viz that
re-renders the same picture regardless of state changes is worse than a
static SVG. If the component has a slider or toggle, *something* visible
must change when it moves.

### 5.3 Verify a viz batch by actually rendering it

Static analysis catches none of the bugs above. The only reliable check is
to render every viz in a real browser and look. Subtopics lazy-mount their viz
near the viewport, so append `?eager=1` to the route to force the whole page to
render at once (and wait for the `.block-viz-loading` shimmer to clear). The
cheapest setup:

```python
# requires: pip install playwright && python -m playwright install chromium
from playwright.sync_api import sync_playwright
import json
routes = json.load(open("/tmp/viz_routes.json"))   # vid → [cid, tid, sid]
with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_context(viewport={"width": 1100, "height": 900}).new_page()
    page.set_default_timeout(10000)
    for vid, (cid, tid, sid) in routes.items():
        page.goto(f"http://localhost:5183/c/{cid}/{tid}/{sid}?eager=1",
                  wait_until="domcontentloaded")
        page.wait_for_selector(".block-viz")
        page.wait_for_timeout(400)
        # Match the right block by head text (case-insensitive)
        for blk in page.query_selector_all(".block-viz"):
            head = blk.query_selector(".block-viz-head span:first-child")
            if head and vid.lower() in (head.text_content() or "").lower():
                blk.scroll_into_view_if_needed()
                blk.screenshot(path=f"/tmp/shots/{vid}.png")
                break
    b.close()
```

Two pitfalls in the harness itself:

* **Match the viz block by text, not by index.** A subtopic page can host
  several viz blocks; picking the first one silently mis-names every
  screenshot after the first that matches.
* **Use `text_content()`, not `inner_text()`.** The block header sits under
  `text-transform: uppercase`, so `inner_text()` returns the *rendered*
  uppercase text; `text_content()` returns the original lowercase id and a
  case-insensitive substring match works either way.

Static checks that **do** catch a real subset (run before the screenshot
pass to weed out the obvious cases):

```sh
# Hardcoded coords past the outer SVG's viewBox (per-block, not per-file).
# A viz with multiple <svg> elements needs per-block accounting — see §5.2.
python3 - <<'PY'
import os, re
for f in os.listdir("src/viz"):
    if not f.endswith(".jsx"): continue
    src = open(f"src/viz/{f}").read()
    consts = {m[0]: float(m[1]) for m in re.findall(r'\bconst\s+(\w+)\s*=\s*(\d+(?:\.\d+)?)', src)}
    for block in re.findall(r'<svg[^>]*>.*?</svg>', src, re.DOTALL):
        W = H = None
        if (m := re.search(r'viewBox=["\']`?\s*0\s+0\s+([\d.]+)\s+([\d.]+)', block)):
            W, H = float(m[1]), float(m[2])
        elif (m := re.search(r'viewBox=\{`0 0 \$\{(\w+)\}\s+\$\{(\w+)\}`\}', block)):
            W, H = consts.get(m[1]), consts.get(m[2])
        if not W or W < 16: continue            # skip marker viewBoxes
        for attr, val in re.findall(r'\b(x|y|cx|cy|x1|y1|x2|y2)\s*=\s*"(\d+(?:\.\d+)?)"', block):
            limit = W if attr in ("x","cx","x1","x2") else H
            if float(val) > limit + 5:
                print(f"{f}: {attr}={val} past viewBox {W}×{H}")
PY
```

Don't ship a batch of new/edited viz without running both the static
analysis and the visual sweep — even a single missed offset turns into a
clipped figure in production.

---

## 6. How to add a specialization

In `manifest.json`, append to `specializations[]`:

```json
{ "id": "NBIO", "name": "Bioinformatics", "short": "Bio", "hue": 110,
  "blurb": "Sequence analysis, structural biology, omics pipelines." }
```

* `id` — short uppercase code. Used in URLs (`/s/NBIO`).
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

1. **Per-course mindmap** at `/c/<id>/mm` — a radial map of one course.
2. **Global mindmap** at `/mm` — every course on one canvas, grouped by
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
* [ ] Any `tier:`/`{tier=…}` markers point at genuinely non-core content, and the
      core material above a tiered section still reads complete on its own.

---

## 10. Engine internals (only relevant if you're changing the framework)

| File | What it owns |
|------|--------------|
| `src/framework/content-loader.js` | Fetching manifest + MD files, hydrating the in-memory model (incl. `sub.tier`). |
| `src/framework/md-parser.js`      | Parsing one MD string into `{ frontmatter, blocks[] }` (incl. heading `{tier=…}`). |
| `src/framework/content-blocks.jsx`| Rendering every block kind. New block kind? Add a renderer and a case in `Block`. |
| `src/framework/tier.js`           | `parseTier()` + tier metadata for non-core content markers (§4). |
| `src/framework/viz-registry.js`   | `register(id, Component)` + `get(id)`. |
| `src/framework/mindmap.jsx`       | Radial course-mindmap layout. |
| `src/framework/pages.jsx`         | All route page components (courses, specs, exam, course detail). |
| `src/framework/komise.js`         | Komise data layer — repository list (localStorage), fetch+merge, index, min-max ranking, exam-topic bridge (§11). |
| `src/framework/komise-context.jsx`| `KomiseProvider`/`useKomise` — app-wide shared board + lazily-loaded index (§11). |
| `src/framework/komise-page.jsx`   | The `/k` page: min-max by commission, browse by examiner, manage repositories (§11). |
| `src/framework/komise-exam.jsx`   | Committee histogram + who-asked widgets embedded in the exam-prep pages (§11). |
| `src/framework/progress.js`       | localStorage + React hooks for progress, collapse state (per-key defaults for tiers), and user tweaks. |
| `src/app.jsx`                     | History-API (clean-path) router (legacy `#/…` auto-rewritten), theme, sheets, app shell. |
| `src/main.jsx`                    | React mount, removes the boot fade. |

**Adding a new block kind** (e.g. `embed` for YouTube):

1. In `md-parser.js`, add a case in `makeTypedBlock` returning
   `{ kind: "embed", … }`.
2. In `content-blocks.jsx`, add a renderer component and a case in `Block`.
3. Add any required CSS to `src/styles.css`.

The block shape is freeform — only `kind` is required.

## 11. Komise — what the committee asks (external data repositories)

The **Komise** page (`/k`, bottom-nav "Komise") answers a different question from the
rest of the app: *given who will examine me at the state exam (MSZ), what do those
people historically ask — and which okruhy should I prioritise?* It maps real
student-reported committee questions onto concrete `{course, topic}` study material.

**The data is not bundled.** It is fetched at runtime from one or more *repositories*
— URLs returning a `klidecek-komise/v1` JSON. The list of repositories is remembered in
`localStorage` and is user-extensible (add a friend's raw-GitHub URL, disable or remove a
repo, etc.). A **default** repository ships same-origin at `<BASE>repos/fit-msz.json`; it
is seeded on first use and can be disabled **or removed** like any other (a "↺ Obnovit
výchozí seznam" button restores it). The seed only happens when nothing has ever been
saved — once the list is touched, it is respected verbatim (`loadRepos`/`restoreDefault`
in `komise.js`). All *enabled* repos are fetched and their records merged (members with
the same `key` merge across repos).

### Repository format (`klidecek-komise/v1`)

```jsonc
{
  "schema": "klidecek-komise/v1",
  "name": "...", "description": "...", "version": "...",
  "members": [ { "key", "surname", "first", "titles", "aliases", "count", "display" } ],
  "records": [ {
    "id", "session", "memberKey", "course", "num", "title", "text",
    "map": { "course", "topic", "examTitle", "confidence": "high|low|course" } | null
  } ]
}
```

- `memberKey` references `members[].key` (diacritic-folded surname). `null` = examiner
  couldn't be resolved.
- `map` is the topic mapping. `high`/`low` carry a `topic`; `low` is approximate (the UI
  marks it `≈` — always verify against `record.text`). `course` = course known but no
  topic; `null` = course not covered by the app (another specialisation). Records always
  show their raw `text`, so an imperfect map never hides the ground truth.

### How it's produced

`tools/committee-data/build.py` converts `materials/MSZ 2026 ALL KOMISE.xlsx` →
`public/repos/fit-msz.json`. It (1) normalises ~180 messy examiner strings (full titles,
surname-only, diacritic and word-order variants, nicknames) into canonical people via a
curated `PEOPLE` table, and (2) maps each record onto a course topic with an
IDF-weighted, accent-insensitive keyword matcher built from the manifest's own
topic / sub-topic / exam-question titles. **Re-run it after renaming content topics** so
the mapping stays in sync. See `tools/committee-data/README.md`.

### The page (`komise-page.jsx`)

Three tabs:

- **Tvoje komise** (min-max) — pick the examiners on your board; `rankForCommission()`
  ranks the okruhy those people asked by frequency × confidence. Each row links into the
  study material and expands to the raw question notes. The selection persists
  (`okruhy.komise.board.v1`) **and is encoded in the URL** (`/k?komise=key1,key2`) so it
  can be bookmarked/shared — "Zkopírovat odkaz" copies the current link, and opening such
  a link pre-fills the board. The selection can also be **exported**: "Stáhnout JSON" /
  "Stáhnout CSV" (`buildCommissionExport` + `exportToCSV` — RFC-4180, UTF-8 BOM for Excel)
  dump every question those examiners asked.
- **Komisaři** (browse) — every examiner and the topics they asked; "+ do komise" feeds
  the min-max selection.
- **Repozitáře** — add/remove/enable repository URLs; shows per-repo load status and
  record counts.

### In the exam-prep pages (`komise-exam.jsx`)

The same data is surfaced where you actually revise, driven by the same shared board:

- **`ExamSpecHistogram`** (on `/x/<spec>`, above the topic list) — *when a commission is
  set*, a histogram of how often each okruh in that specialization was asked, sorted
  hot-first, each bar linking to the topic. A **Moje komise / Všichni** toggle widens it
  from your board to all examiners.
- **`ExamTopicAskedBy`** (on `/x/<spec>/<topic>`) — who asked this okruh, **global by
  default** with the same toggle; board members are highlighted (and sorted first) even
  in the global view. Hidden when no examiner is on record for the topic.

`examTopicRecords()` bridges an okruh's `refs` (`[course, topic, sub]`) to the records
mapped to those `course/topic` pairs; `whoAsked()` and `askHistogram()` aggregate them.

### Shared state (`komise-context.jsx`)

`KomiseProvider` (wrapping the app in `app.jsx`) owns the merged index, the repository
list, and the board, so `/k` and the exam pages stay in sync. It loads **lazily** —
nothing is fetched until a consumer calls `ensureLoaded()` (first mount of the Komise
page, an exam topic page, or a spec page with a commission set) — so users who never use
the feature don't pay for the fetch.

`komise.js` is pure logic + storage (no React); the context + pages drive it. localStorage
keys: `okruhy.komise.repos.v1`, `okruhy.komise.board.v1`. Verify with
`node tools/committee-data/smoke.mjs` (spawns vite, drives `/k` and the exam pages headless).
