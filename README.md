# aio — Klideček exam prep framework

A study / exam-prep app (the **Klideček** site) where the **content** is plain
Markdown files and the **interactive demos** are plain React components. Built with
Vite, deployed to GitHub Pages. Content is in Czech and covers the VUT FIT master's
state-exam (MSZ) topics across 24 courses.

```
npm install
npm run dev      # dev server with hot reload
npm run build    # static bundle in dist/
npm run preview  # preview the built bundle
```

## Study modes

- **By course** → topic → subtopic, with deep-linkable anchors and per-subtopic progress.
- **By specialization** — filter to your master's track and its exam areas.
- **By final-exam topics** (okruhy), cross-referenced to the course material.
- **Global mindmap** — how all courses connect; each course also has its own mindmap.
- **Komise** — what each examiner historically asked at the state exam, mapped onto
  okruhy, with a *min-max by commission* view: type the names of who will examine you and
  see which topics to prioritise. The committee data is **not bundled** — it is fetched
  at runtime from a remembered, user-editable list of repositories (the default one is
  removable/restorable). See [FRAMEWORK.md](./FRAMEWORK.md) §11.

Press `S` anywhere (or `/`, `⌘K` / `Ctrl-K`) to search.

## What goes where

```
src/
  framework/        the engine — router, parser, loader, pages, blocks; Komise data layer
                    (komise.js) + page (komise-page.jsx)
  viz/              interactive visualisations (one file per viz, self-registered)
public/
  content/
    manifest.json   declares every course, topic, subtopic, exam set
    courses/<id>/<topic>/<subtopic>.md
    mindmaps/<id>.json, _global.json
  repos/
    fit-msz.json    default Komise repository (committee questions), fetched at runtime
tools/
  committee-data/   builds public/repos/fit-msz.json from the committee Excel (+ smoke test)
  video-data/       curated-video data pipeline
```

To add or edit content, see **[FRAMEWORK.md](./FRAMEWORK.md)**. You will not
normally touch `src/framework/` — that's the engine.

## Committee data (Komise)

`public/repos/fit-msz.json` is generated from the source Excel by
`python3 tools/committee-data/build.py` (member-name normalisation + question→topic
mapping). Re-run it after renaming content topics so the mapping stays in sync. The
repository format and pipeline are documented in
[tools/committee-data/README.md](./tools/committee-data/README.md) and FRAMEWORK.md §11;
verify the page with `node tools/committee-data/smoke.mjs`.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with
`VITE_BASE=/<repo>/` and publishes `dist/` to GitHub Pages.
