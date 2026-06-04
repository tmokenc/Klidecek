# committee-data — MSZ komise → JSON repository

Converts the committee Excel into the JSON "repository" the app fetches at runtime
for the **Komise** feature (what each examiner asks at the state exam, mapped onto
study topics, with a "min-max by commission" view).

```
python3 tools/committee-data/build.py
```

**Input**

- `materials/MSZ 2026 ALL KOMISE.xlsx` — only the `List 1` sheet is read; it carries
  every year (MSZ 2023/2024/2025) with a per-row session label. The standalone `2024`
  sheet is an exact duplicate of List 1's 2024 block and is intentionally skipped so
  frequencies aren't double-counted.
- `public/content/manifest.json` — the topic / sub-topic / exam-question titles used to
  map each record onto a concrete `{course, topic}`.

**Output** → `public/repos/fit-msz.json` (`schema: "klidecek-komise/v1"`)

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

**Member normalisation** — 183 raw strings (full titles, surname-only, diacritic and
word-order variants, nicknames like "Rogalo") collapse to ~62 canonical people via the
curated `PEOPLE` table keyed by diacritic-folded surname. Two distinct people who share
a surname (e.g. Lukáš vs Radek Burget) are kept under one key with both first names noted.

**Topic mapping** — keyword matcher (IDF-weighted, accent-insensitive) scores each
record's text against every topic of its course. `high` ≈ confident, `low` ≈ approximate
(verify against the record text, always shown in the UI), `course` = course known but no
topic, `null` = course not covered by the app (other specialisation). Re-run after editing
content titles so the mapping stays in sync.

This file is **not** imported into the JS bundle — the app fetches it like any external
repository, and users can add more repository URLs in the Komise → Repozitáře tab.
