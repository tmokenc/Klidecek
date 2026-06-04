// komise.js — "what does the committee ask" data layer.
//
// The committee data is NOT bundled into the app: it is fetched at runtime from one
// or more *repositories* (URLs returning a `klidecek-komise/v1` JSON, produced by
// tools/committee-data/build.py). The list of repositories is remembered in
// localStorage, seeded with a built-in same-origin repo, and users can add more
// (e.g. a friend's raw GitHub URL). All enabled repos are fetched and merged.
//
// This module is pure logic + storage; the React page (komise-page.jsx) drives it.

const BASE = import.meta.env.BASE_URL || "/";

const REPOS_KEY = "okruhy.komise.repos.v1";
const BOARD_KEY = "okruhy.komise.board.v1"; // selected commission member keys

// Default repository (same-origin copy shipped with the site). It is seeded on first
// use and can be disabled OR removed; restoreDefault() brings it back.
export const BUILTIN_REPO = {
  id: "builtin",
  name: "FIT VUT — MSZ komise",
  url: BASE + "repos/fit-msz.json",
  builtin: true,
  enabled: true,
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / disabled — non-fatal */
  }
}

function newId() {
  return "r" + Math.random().toString(36).slice(2, 9);
}

/* ─── Repository list ─────────────────────────────────────────
 * The default (built-in) repo is seeded only on FIRST use — when nothing has ever
 * been saved. After that the stored list is respected verbatim, so the user can
 * remove the default and it stays removed. `restoreDefault()` brings it back. The
 * built-in entry persists as a tiny marker (its url is rebuilt from BUILTIN_REPO at
 * load time, so it survives a change of deploy base). */
function reconstruct(stored) {
  return stored
    .filter((r) => r && (r.builtin || r.url))
    .map((r) => (r.builtin
      ? { ...BUILTIN_REPO, enabled: r.enabled !== false }
      : { id: r.id, name: r.name || "", url: r.url, enabled: r.enabled !== false }));
}
export function loadRepos() {
  const stored = load(REPOS_KEY, null);
  if (!Array.isArray(stored)) return [{ ...BUILTIN_REPO }]; // first use → seed default
  return reconstruct(stored); // may legitimately be empty / without the default
}
export function saveRepos(list) {
  // never persist the built-in entry's defaults beyond its enabled flag
  save(REPOS_KEY, (list || []).map((r) =>
    r.builtin ? { id: "builtin", builtin: true, enabled: r.enabled !== false }
              : { id: r.id, name: r.name || "", url: r.url, enabled: r.enabled !== false }));
}
export function addRepo(url, name) {
  url = String(url || "").trim();
  if (!url) throw new Error("Zadej URL repozitáře.");
  if (!/^https?:\/\//i.test(url) && !url.startsWith("/")) url = "https://" + url;
  const list = loadRepos();
  if (list.some((r) => r.url === url)) throw new Error("Tento repozitář už je v seznamu.");
  const next = [...list, { id: newId(), name: (name || "").trim(), url, enabled: true }];
  saveRepos(next);
  return next;
}
export function removeRepo(id) {
  // anything is removable now — including the default
  const next = loadRepos().filter((r) => r.id !== id);
  saveRepos(next);
  return next;
}
export function setRepoEnabled(id, enabled) {
  const next = loadRepos().map((r) => (r.id === id ? { ...r, enabled: !!enabled } : r));
  saveRepos(next);
  return next;
}
export function hasBuiltin() {
  return loadRepos().some((r) => r.builtin);
}
// Re-add the default repo (first, enabled) if it isn't already present.
export function restoreDefault() {
  const list = loadRepos();
  if (list.some((r) => r.builtin)) return list;
  const next = [{ ...BUILTIN_REPO }, ...list];
  saveRepos(next);
  return next;
}

/* ─── Commission selection (persisted) ────────────────────── */
export function loadBoard() {
  const v = load(BOARD_KEY, []);
  return Array.isArray(v) ? v : [];
}
export function saveBoard(keys) {
  save(BOARD_KEY, Array.isArray(keys) ? keys : []);
}

/* ─── Fetch + merge ───────────────────────────────────────── */
const _cache = new Map(); // url -> payload (per session)

export async function fetchRepo(url) {
  if (_cache.has(url)) return _cache.get(url);
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data || !Array.isArray(data.records)) {
    throw new Error("Neplatný formát — chybí pole records[].");
  }
  _cache.set(url, data);
  return data;
}
export function clearRepoCache() {
  _cache.clear();
}

// Fetch every enabled repo. Returns { payloads:[{repo,data}], errors:[{repo,error}] }.
export async function fetchAll(repos) {
  const enabled = (repos || loadRepos()).filter((r) => r.enabled !== false);
  const settled = await Promise.all(
    enabled.map((repo) =>
      fetchRepo(repo.url).then(
        (data) => ({ repo, data }),
        (error) => ({ repo, error: error.message || String(error) })
      )
    )
  );
  return {
    payloads: settled.filter((s) => s.data),
    errors: settled.filter((s) => s.error),
  };
}

/* ─── Index ───────────────────────────────────────────────── */
function pushTo(map, key, value) {
  let arr = map.get(key);
  if (!arr) map.set(key, (arr = []));
  arr.push(value);
}

// Merge payloads into a single index. Members with the same key across repos merge;
// records are tagged with their source repo.
export function buildIndex(payloads) {
  const members = new Map();
  const records = [];
  for (const { repo, data } of payloads) {
    const meta = new Map((data.members || []).map((m) => [m.key, m]));
    const repoName = data.name || repo.name || repo.url;
    for (const r of data.records || []) {
      const rec = { ...r, repoId: repo.id, repoName };
      records.push(rec);
      const k = r.memberKey;
      if (!k) continue;
      let m = members.get(k);
      if (!m) {
        const mm = meta.get(k) || {};
        m = {
          key: k,
          display: mm.display || mm.surname || k,
          surname: mm.surname || k,
          first: mm.first || "",
          titles: mm.titles || "",
          aliases: mm.aliases || [],
          count: 0,
          courses: new Set(),
        };
        members.set(k, m);
      }
      m.count++;
      if (r.course) m.courses.add(r.course);
    }
  }

  const byMember = new Map();
  const byTopic = new Map(); // "COURSE/topic" -> records
  const byCourse = new Map();
  for (const r of records) {
    if (r.memberKey) pushTo(byMember, r.memberKey, r);
    if (r.course) pushTo(byCourse, r.course, r);
    if (r.map && r.map.topic) pushTo(byTopic, r.course + "/" + r.map.topic, r);
  }

  const memberList = [...members.values()]
    .map((m) => ({ ...m, courses: [...m.courses].sort() }))
    .sort((a, b) => b.count - a.count || a.surname.localeCompare(b.surname, "cs"));

  return { members: memberList, records, byMember, byTopic, byCourse };
}

const weightOf = (rec) => (rec.map && rec.map.confidence === "high" ? 1 : 0.6);

/* ─── Min-max: rank topics for a chosen commission ────────── */
// memberKeys = the people who will sit on your board. Returns the exam topics those
// people historically asked, ranked by how strongly (frequency × confidence), so you
// know what to prioritise. `topics` are mappable; `loose` are course-known-but-unmapped
// or other-specialisation records by your board (still worth a glance).
export function rankForCommission(index, memberKeys) {
  const set = new Set(memberKeys || []);
  const topics = new Map();
  const loose = new Map(); // course -> { course, records, members:Set }
  let totalRecords = 0;

  for (const r of index.records) {
    if (!set.has(r.memberKey)) continue;
    totalRecords++;
    if (r.map && r.map.topic) {
      const id = r.course + "/" + r.map.topic;
      let t = topics.get(id);
      if (!t) {
        t = {
          id,
          course: r.course,
          topic: r.map.topic,
          examTitle: r.map.examTitle,
          score: 0,
          hits: 0,
          members: new Map(), // key -> count
          records: [],
          anyHigh: false,
        };
        topics.set(id, t);
      }
      t.hits++;
      t.score += weightOf(r);
      t.anyHigh = t.anyHigh || (r.map.confidence === "high");
      t.members.set(r.memberKey, (t.members.get(r.memberKey) || 0) + 1);
      t.records.push(r);
    } else {
      const c = r.course || "?";
      let g = loose.get(c);
      if (!g) loose.set(c, (g = { course: c, records: [], members: new Set() }));
      g.records.push(r);
      if (r.memberKey) g.members.add(r.memberKey);
    }
  }

  const topicList = [...topics.values()]
    .map((t) => ({
      ...t,
      members: [...t.members.entries()]
        .map(([key, count]) => ({ key, count }))
        .sort((a, b) => b.count - a.count),
    }))
    .sort((a, b) => b.score - a.score || b.hits - a.hits || b.members.length - a.members.length);

  const looseList = [...loose.values()]
    .map((g) => ({ ...g, members: [...g.members], count: g.records.length }))
    .sort((a, b) => b.count - a.count);

  return { topics: topicList, loose: looseList, totalRecords };
}

// For the browse view: a single member's record set grouped by mapped topic.
export function topicsForMember(index, memberKey) {
  const recs = index.byMember.get(memberKey) || [];
  const topics = new Map();
  const loose = [];
  for (const r of recs) {
    if (r.map && r.map.topic) {
      const id = r.course + "/" + r.map.topic;
      let t = topics.get(id);
      if (!t) t = topics.set(id, { id, course: r.course, topic: r.map.topic, examTitle: r.map.examTitle, records: [] }).get(id);
      t.records.push(r);
    } else {
      loose.push(r);
    }
  }
  const list = [...topics.values()].sort((a, b) => b.records.length - a.records.length);
  return { topics: list, loose, total: recs.length };
}
