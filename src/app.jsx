// app.jsx — root: hash router, content boot, theme application, settings.

import {
  memo,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useLayoutEffect,
} from "react";
import {
  HomePage,
  CoursesPage,
  CourseDetailPage,
  SpecsPage,
  SpecDetailPage,
  ExamPage,
  ExamSpecPage,
  ExamTopicPage,
  GlobalMindmapPage,
} from "./framework/pages.jsx";
import { KomisePage } from "./framework/komise-page.jsx";
import { KomiseProvider } from "./framework/komise-context.jsx";
import {
  useProgress,
  useTweaks,
  loadProgress,
  saveProgress,
  exportProgress,
  importProgress,
  loadLastExamSpec,
  saveLastExamSpec,
} from "./framework/progress.js";
import { loadContent } from "./framework/content-loader.js";
import { BlockContext } from "./framework/content-blocks.jsx";
import { buildIndex, search, highlight } from "./framework/search.js";
import { VerifiedBadge } from "./framework/pages.jsx";
// Import viz registry side-effects — every component self-registers
import "./viz/index.js";

/* ─── Router (clean paths via the History API) ─────────────────
 * Served under BASE_URL ("/" locally, "/<repo>/" on GitHub Pages). Hard loads of
 * deep links work because the build also emits 404.html (a copy of index.html) —
 * see vite.config.js. Legacy "#/..." links are still parsed and get rewritten to
 * a clean path on load, so old shared/bookmarked URLs keep working. */
const BASE = import.meta.env.BASE_URL || "/";

function parseRoute(raw) {
  const parts = (raw || "").replace(/^\/+/, "").split("/").filter(Boolean);
  if (parts.length === 0) return { mode: "home" };
  const [head, ...rest] = parts;
  if (head === "c") {
    if (rest.length === 0) return { mode: "courses" };
    const [cid, second, third, fourth] = rest;
    if (second === "mm") return { mode: "course", courseId: cid, view: "mm" };
    return {
      mode: "course",
      courseId: cid,
      focusTopic: second,
      focusSub: third,
      focusFig: fourth,
    };
  }
  if (head === "s") {
    if (rest.length === 0) return { mode: "specs" };
    return { mode: "spec", specId: rest[0] };
  }
  if (head === "x") {
    if (rest.length === 0) return { mode: "exam" };
    if (rest.length === 1) return { mode: "exam-spec", specId: rest[0] };
    return { mode: "exam-topic", specId: rest[0], topicId: rest[1] };
  }
  if (head === "mm") {
    return { mode: "global-mindmap" };
  }
  if (head === "k") {
    return { mode: "komise" };
  }
  return { mode: "home" };
}

// Route string for the current URL: a legacy "#/..." hash wins (old links),
// otherwise the pathname with the base prefix stripped.
function currentRouteRaw() {
  if (location.hash && location.hash.length > 1)
    return location.hash.replace(/^#/, "");
  let p = location.pathname || "/";
  if (BASE !== "/" && p.startsWith(BASE)) p = p.slice(BASE.length);
  else if (BASE !== "/" && p === BASE.replace(/\/$/, "")) p = "";
  return p;
}

// "/c/AVS" -> "<BASE>c/AVS"
function toUrl(path) {
  return BASE + String(path).replace(/^\/+/, "");
}

function routeSection(route) {
  if (["courses", "course"].includes(route.mode)) return "courses";
  if (["specs", "spec"].includes(route.mode)) return "specs";
  if (["exam", "exam-spec", "exam-topic"].includes(route.mode)) return "exam";
  if (route.mode === "komise") return "komise";
  if (route.mode === "global-mindmap") return "global-mindmap";
  return "home";
}

function routeToPath(route) {
  switch (route.mode) {
    case "home":
      return "/";
    case "courses":
      return "/c";
    case "course": {
      if (route.view === "mm") return `/c/${route.courseId}/mm`;
      const parts = [
        "c",
        route.courseId,
        route.focusTopic,
        route.focusSub,
        route.focusFig,
      ].filter(Boolean);
      return `/${parts.join("/")}`;
    }
    case "specs":
      return "/s";
    case "spec":
      return `/s/${route.specId}`;
    case "exam":
      return "/x";
    case "exam-spec":
      return `/x/${route.specId}`;
    case "exam-topic":
      return `/x/${route.specId}/${route.topicId}`;
    case "global-mindmap":
      return "/mm";
    case "komise":
      return "/k";
    default:
      return "/";
  }
}

function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(currentRouteRaw()));
  useEffect(() => {
    const sync = () => {
      // Adopt a legacy "#/…" URL (a fresh load of an old bookmark, or an in-app
      // hashchange) and rewrite it to the clean path so the redundant "#" doesn't
      // linger. Keep any query string (e.g. the audit's ?eager=1).
      if (location.hash && location.hash.length > 1) {
        const raw = location.hash.replace(/^#/, "");
        history.replaceState(null, "", toUrl(raw) + location.search);
        setRoute(parseRoute(raw));
        return;
      }
      setRoute(parseRoute(currentRouteRaw()));
    };
    sync(); // normalize the URL on first load
    window.addEventListener("popstate", sync); // back / forward
    window.addEventListener("hashchange", sync); // legacy hash links
    return () => {
      window.removeEventListener("popstate", sync);
      window.removeEventListener("hashchange", sync);
    };
  }, []);
  const navigate = useCallback((path, opts = {}) => {
    const url = toUrl(path);
    if (opts.replace) history.replaceState(null, "", url);
    else history.pushState(null, "", url);
    setRoute(parseRoute(String(path)));
  }, []);
  return { route, navigate };
}

/* ─── Topbar ──────────────────────────────────────────────── */
function Topbar({
  navigate,
  onOpenSearch,
  onOpenProgress,
  onOpenSettings,
  hasProgress,
  dark,
  onToggleDark,
  repoUrl,
}) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <button
          className="brand"
          onClick={() => navigate("/")}
          style={{
            appearance: "none",
            border: "none",
            background: "transparent",
            cursor: "default",
            padding: 0,
          }}
        >
          <span className="mark mark-img">
            <img
              src={(import.meta.env.BASE_URL || "/") + "klidecek.webp"}
              alt="Klideček"
            />
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: 1.1,
              alignItems: "flex-start",
            }}
          >
            <span className="name">Klideček</span>
            <span className="sub">exam prep</span>
          </div>
        </button>
        <div className="topbar-actions">
          <button
            className="icon-btn search-btn"
            onClick={onOpenSearch}
            title="Search — press S anywhere (⇧S for all courses)"
            aria-label="Search"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <kbd className="search-btn-kbd">S</kbd>
          </button>
          {repoUrl && (
            <a
              className="icon-btn"
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View source on GitHub"
              aria-label="GitHub repository"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .5A12 12 0 0 0 .5 12.6c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.3.8-.6v-2c-3.3.7-4-1.5-4-1.5-.6-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.6-.3-5.4-1.3-5.4-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2 1-.3 2-.4 3-.4s2 .1 3 .4c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.7-2.8 5.7-5.4 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6 4.8-1.6 8.2-6.1 8.2-11.4A12 12 0 0 0 12 .5z" />
              </svg>
            </a>
          )}
          <button
            className="icon-btn"
            onClick={onToggleDark}
            title={dark ? "Light mode" : "Dark mode"}
          >
            {dark ? (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            ) : (
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
          <button
            className="icon-btn"
            data-active={hasProgress}
            onClick={onOpenProgress}
            title="Progress"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </button>
          <button
            className="icon-btn"
            onClick={onOpenSettings}
            title="Settings"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

/* ─── Search sheet ────────────────────────────────────────── */
function HighlightedLabel({ text, query }) {
  const segs = highlight(text, query);
  return (
    <>
      {segs.map((s, i) =>
        s.hit ? <mark key={i}>{s.text}</mark> : <span key={i}>{s.text}</span>,
      )}
    </>
  );
}

function SearchSheet({
  content,
  defaultScopeCourseId,
  initialScope,
  navigate,
  onClose,
}) {
  const [q, setQ] = useState("");
  // ⇧S passes initialScope="all" to force the global scope even on a course page.
  const [scope, setScope] = useState(
    initialScope || (defaultScopeCourseId ? "course" : "all"),
  );
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const index = useMemo(() => buildIndex(content), [content]);
  const scopeCourse =
    scope === "course" && defaultScopeCourseId
      ? content.findCourse(defaultScopeCourseId)
      : null;
  const results = useMemo(
    () =>
      search(index, q, {
        scopeCourseId: scope === "course" ? defaultScopeCourseId : null,
      }),
    [index, q, scope, defaultScopeCourseId],
  );

  useEffect(() => {
    inputRef.current && inputRef.current.focus();
  }, []);
  useEffect(() => {
    setActiveIdx(0);
  }, [q, scope]);
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector(`[data-row="${activeIdx}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const open = (r) => {
    navigate(r.route);
    onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(results.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      if (results[activeIdx]) {
        e.preventDefault();
        open(results[activeIdx]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="overlay search-overlay" onClick={onClose}>
      <div className="sheet search-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="search-head">
          <svg
            className="search-head-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={
              scopeCourse
                ? `Search ${scopeCourse.id}…`
                : "Search topics, subtopics, courses…"
            }
            className="search-input"
            spellCheck={false}
            autoComplete="off"
          />
          <kbd className="search-kbd">esc</kbd>
        </div>
        {defaultScopeCourseId && (
          <div className="search-scope">
            <button
              data-active={scope === "course"}
              onClick={() => setScope("course")}
            >
              {scopeCourse ? scopeCourse.id : "This course"}
            </button>
            <button
              data-active={scope === "all"}
              onClick={() => setScope("all")}
            >
              All courses
            </button>
          </div>
        )}
        <div className="search-results" ref={listRef}>
          {q.trim() === "" ? (
            <div className="search-empty">
              Type to search topics, subtopics, and courses. Diacritics are
              ignored — "rizeni" finds "Řízení". Press{" "}
              <kbd className="search-kbd">S</kbd> anywhere to open this;{" "}
              <kbd className="search-kbd">⇧ S</kbd> searches all courses.
              <div className="search-hint">
                ↑ ↓ to move · ↵ to open · esc to close
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="search-empty">No matches for "{q}".</div>
          ) : (
            results.map((r, i) => (
              <button
                key={i}
                data-row={i}
                className="search-result"
                data-active={i === activeIdx}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => open(r)}
              >
                <span className="search-result-kind">
                  {r.kind === "sub"
                    ? "sub"
                    : r.kind === "topic"
                      ? "topic"
                      : "course"}
                </span>
                <div className="search-result-text">
                  <div className="search-result-title">
                    <HighlightedLabel text={r.label} query={q} />
                    {r.verified && <VerifiedBadge />}
                  </div>
                  {r.kind !== "course" && (
                    <div className="search-result-path">
                      <span className="search-chip">{r.courseId}</span>
                      {r.kind === "sub" && r.topicTitle && (
                        <span>{r.topicTitle}</span>
                      )}
                    </div>
                  )}
                </div>
                <svg
                  className="search-result-arrow"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Mode switcher (bottom nav) ──────────────────────────── */
function ModeSwitcher({ currentTop, onSwitch }) {
  const items = [
    {
      id: "courses",
      label: "Courses",
      to: "/c",
      icon: "M4 6h16M4 12h16M4 18h10",
    },
    {
      id: "specs",
      label: "Specializations",
      to: "/s",
      icon: "M12 2 4 6v6c0 5 8 10 8 10s8-5 8-10V6z",
    },
    {
      id: "exam",
      label: "Final exam",
      to: "/x",
      icon: "M9 11h6M9 15h6M5 4h14v16H5z",
    },
    {
      id: "komise",
      label: "Komise",
      to: "/k",
      icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    },
  ];
  return (
    <nav className="modeswitch-wrap">
      <div className="modeswitch">
        {items.map((i) => (
          <button
            key={i.id}
            data-active={currentTop === i.id}
            onClick={() => onSwitch(i.id)}
            title={i.label}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d={i.icon} />
            </svg>
            {i.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ─── Progress / Settings sheets ──────────────────────────── */
function ProgressSheet({ onClose }) {
  const [text, setText] = useState("");
  const [imported, setImported] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("export");
  const raw = loadProgress();
  const exportText = exportProgress();
  const count = Object.keys(raw).length;

  const doImport = () => {
    setError(null);
    try {
      const n = importProgress(text);
      setImported(n);
      setText("");
    } catch (e) {
      setError(e.message || String(e));
    }
  };
  const doDownload = () => {
    const blob = new Blob([exportText], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `klidecek-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  };
  const doClear = () => {
    if (confirm("Reset all progress? This cannot be undone.")) saveProgress({});
  };
  const doCopy = () => {
    navigator.clipboard && navigator.clipboard.writeText(exportText);
    window.toast && window.toast("Copied to clipboard");
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3 className="sheet-title">Progress</h3>
          <button className="icon-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 13.5,
            color: "var(--text-muted)",
          }}
        >
          Your progress is saved in this browser's storage. Export it as JSON to
          back up or move to another device.
        </p>
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 14,
            padding: 3,
            background: "var(--bg-inset)",
            borderRadius: 8,
          }}
        >
          <button
            className="btn ghost"
            style={{
              flex: 1,
              justifyContent: "center",
              background: tab === "export" ? "var(--bg-card)" : "transparent",
              boxShadow: tab === "export" ? "var(--shadow-sm)" : "none",
            }}
            onClick={() => setTab("export")}
          >
            Export
          </button>
          <button
            className="btn ghost"
            style={{
              flex: 1,
              justifyContent: "center",
              background: tab === "import" ? "var(--bg-card)" : "transparent",
              boxShadow: tab === "import" ? "var(--shadow-sm)" : "none",
            }}
            onClick={() => setTab("import")}
          >
            Import
          </button>
        </div>

        {tab === "export" ? (
          <>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 10,
              }}
            >
              <strong style={{ color: "var(--text)" }}>{count}</strong> subtopic
              {count === 1 ? "" : "s"} marked complete.
            </div>
            <textarea
              readOnly
              value={exportText}
              style={{
                width: "100%",
                minHeight: 160,
                maxHeight: 240,
                padding: 10,
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
                background: "var(--bg-inset)",
                border: "0.5px solid var(--line)",
                borderRadius: 8,
                color: "var(--text)",
                resize: "vertical",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                flexWrap: "wrap",
              }}
            >
              <button className="btn primary" onClick={doDownload}>
                Download .json
              </button>
              <button className="btn" onClick={doCopy}>
                Copy
              </button>
              <span style={{ flex: 1 }} />
              <button
                className="btn ghost"
                onClick={doClear}
                style={{ color: "var(--warn)" }}
              >
                Reset
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 10,
              }}
            >
              Paste a previously-exported JSON file. Existing progress is
              preserved — only newer marks overwrite.
            </div>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError(null);
                setImported(null);
              }}
              placeholder='{"version":1,"progress":{...}}'
              style={{
                width: "100%",
                minHeight: 160,
                padding: 10,
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
                background: "var(--bg-inset)",
                border: "0.5px solid var(--line)",
                borderRadius: 8,
                color: "var(--text)",
                resize: "vertical",
              }}
            />
            {error && (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  background: "oklch(0.68 0.16 65 / 0.10)",
                  border: "0.5px solid var(--warn)",
                  borderRadius: 8,
                  color: "var(--warn)",
                  fontSize: 13,
                }}
              >
                {error}
              </div>
            )}
            {imported !== null && (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  background: "oklch(0.62 0.15 145 / 0.10)",
                  border: "0.5px solid var(--ok)",
                  borderRadius: 8,
                  color: "var(--ok)",
                  fontSize: 13,
                }}
              >
                Merged {imported} entries.
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                alignItems: "center",
              }}
            >
              <label className="btn">
                Load file
                <input
                  type="file"
                  accept=".json,application/json"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = () => setText(reader.result);
                    reader.readAsText(f);
                  }}
                />
              </label>
              <button
                className="btn primary"
                onClick={doImport}
                disabled={!text.trim()}
              >
                Import
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SettingsSheet({ t, setTweak, onClose }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h3 className="sheet-title">Settings</h3>
          <button className="icon-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-faint)",
                marginBottom: 8,
              }}
            >
              Theme
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: 3,
                background: "var(--bg-inset)",
                borderRadius: 8,
                width: "fit-content",
              }}
            >
              {[
                { v: false, label: "Light" },
                { v: true, label: "Dark" },
              ].map((o) => (
                <button
                  key={o.label}
                  className="btn ghost"
                  style={{
                    background:
                      t.dark === o.v ? "var(--bg-card)" : "transparent",
                    boxShadow: t.dark === o.v ? "var(--shadow-sm)" : "none",
                    padding: "6px 14px",
                  }}
                  onClick={() => setTweak("dark", o.v)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-faint)",
                marginBottom: 8,
              }}
            >
              Accent color
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {[264, 22, 142, 340, 80].map((h) => (
                <button
                  key={h}
                  aria-label={`accent ${h}`}
                  onClick={() => setTweak("accentHue", h)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: `oklch(0.55 0.18 ${h})`,
                    border:
                      t.accentHue === h
                        ? "2.5px solid var(--text)"
                        : "0.5px solid var(--line)",
                    cursor: "default",
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "var(--text-faint)",
                marginBottom: 8,
              }}
            >
              Density
            </div>
            <div
              style={{
                display: "flex",
                gap: 6,
                padding: 3,
                background: "var(--bg-inset)",
                borderRadius: 8,
                width: "fit-content",
              }}
            >
              {["compact", "regular"].map((d) => (
                <button
                  key={d}
                  className="btn ghost"
                  style={{
                    background:
                      t.density === d ? "var(--bg-card)" : "transparent",
                    boxShadow: t.density === d ? "var(--shadow-sm)" : "none",
                    padding: "6px 14px",
                    textTransform: "capitalize",
                  }}
                  onClick={() => setTweak("density", d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}

const SectionPage = memo(function SectionPage({ route, content, navigate }) {
  switch (route.mode) {
    case "courses":
      return <CoursesPage content={content} navigate={navigate} />;
    case "course":
      return (
        <CourseDetailPage
          content={content}
          courseId={route.courseId}
          focusTopic={route.focusTopic}
          focusSub={route.focusSub}
          focusFig={route.focusFig}
          view={route.view}
          navigate={navigate}
        />
      );
    case "specs":
      return <SpecsPage content={content} navigate={navigate} />;
    case "spec":
      return (
        <SpecDetailPage
          content={content}
          specId={route.specId}
          navigate={navigate}
        />
      );
    case "exam":
      return <ExamPage content={content} navigate={navigate} />;
    case "exam-spec":
      return (
        <ExamSpecPage
          content={content}
          specId={route.specId}
          navigate={navigate}
        />
      );
    case "exam-topic":
      return (
        <ExamTopicPage
          content={content}
          specId={route.specId}
          topicId={route.topicId}
          navigate={navigate}
        />
      );
    case "komise":
      return <KomisePage content={content} navigate={navigate} />;
    default:
      return null;
  }
});

const TWEAK_DEFAULTS = {
  dark: true,
  accentHue: 264,
  density: "regular",
};

export function App() {
  const [content, setContent] = useState(null);
  const [bootError, setBootError] = useState(null);
  const { route, navigate } = useRoute();
  const [showProgress, setShowProgress] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchInitialScope, setSearchInitialScope] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Keyboard: ⌘K/Ctrl-K opens search anywhere. With no text field focused, `S`
  // opens search (⇧S forces the all-courses scope) and `/` also opens it.
  useEffect(() => {
    const onKey = (e) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setSearchInitialScope(null);
        setShowSearch(true);
        return;
      }
      if (meta || e.altKey) return; // leave other modified combos to the browser
      const tag = e.target && e.target.tagName;
      if (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        (e.target && e.target.isContentEditable)
      )
        return;
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        setSearchInitialScope(e.shiftKey ? "all" : null); // ⇧S → always global
        setShowSearch(true);
      } else if (e.key === "/") {
        e.preventDefault();
        setSearchInitialScope(null);
        setShowSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    loadContent()
      .then(setContent)
      .catch((e) => {
        console.error(e);
        setBootError(e.message || String(e));
      });
  }, []);

  useEffect(() => {
    if (!content) return;
    if (route.mode === "exam") {
      const last = loadLastExamSpec();
      if (last && content.findSpec(last)) {
        navigate(`/x/${last}`, { replace: true });
      }
    }
    if (
      (route.mode === "exam-spec" || route.mode === "exam-topic") &&
      route.specId
    ) {
      saveLastExamSpec(route.specId);
    }
  }, [route.mode, route.specId, content, navigate]);

  useEffect(() => {
    window.toast = (m, ms = 1600) => {
      setToastMsg(m);
      clearTimeout(window.__toast_t);
      window.__toast_t = setTimeout(() => setToastMsg(null), ms);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", t.dark ? "dark" : "light");
    root.setAttribute("data-density", t.density);
    if (t.dark) {
      root.style.setProperty("--accent", `oklch(0.72 0.18 ${t.accentHue})`);
      root.style.setProperty(
        "--accent-soft",
        `oklch(0.72 0.18 ${t.accentHue} / 0.18)`,
      );
      root.style.setProperty(
        "--accent-line",
        `oklch(0.72 0.18 ${t.accentHue} / 0.40)`,
      );
    } else {
      root.style.setProperty("--accent", `oklch(0.55 0.18 ${t.accentHue})`);
      root.style.setProperty(
        "--accent-soft",
        `oklch(0.55 0.18 ${t.accentHue} / 0.10)`,
      );
      root.style.setProperty(
        "--accent-line",
        `oklch(0.55 0.18 ${t.accentHue} / 0.25)`,
      );
    }
  }, [t.dark, t.density, t.accentHue]);

  const { set } = useProgress(content);
  const hasProgress = set.size > 0;

  const currentTop = routeSection(route);
  const [sectionRoutes, setSectionRoutes] = useState(() => ({
    courses: routeSection(route) === "courses" ? route : { mode: "courses" },
    specs: routeSection(route) === "specs" ? route : { mode: "specs" },
    exam: routeSection(route) === "exam" ? route : { mode: "exam" },
    komise: routeSection(route) === "komise" ? route : { mode: "komise" },
  }));
  const contentRef = useRef(null);
  const scrollBySection = useRef({
    home: 0,
    courses: 0,
    specs: 0,
    exam: 0,
    komise: 0,
    "global-mindmap": 0,
  });
  const prevTopRef = useRef(currentTop);
  const preSavedSectionRef = useRef(null);

  useEffect(() => {
    if (!["courses", "specs", "exam", "komise"].includes(currentTop)) return;
    setSectionRoutes((prev) =>
      prev[currentTop] === route ? prev : { ...prev, [currentTop]: route },
    );
  }, [route, currentTop]);

  useLayoutEffect(() => {
    const prevTop = prevTopRef.current;
    if (prevTop === currentTop) return;
    const scroller = contentRef.current;
    if (scroller) {
      if (preSavedSectionRef.current !== prevTop) {
        scrollBySection.current[prevTop] = scroller.scrollTop;
      }
      scroller.scrollTo({
        top: scrollBySection.current[currentTop] || 0,
        left: 0,
        behavior: "auto",
      });
    }
    preSavedSectionRef.current = null;
    prevTopRef.current = currentTop;
  }, [currentTop]);

  const handleModeSwitch = useCallback(
    (section) => {
      if (section === currentTop) return;
      const target =
        sectionRoutes[section] ||
        {
          courses: { mode: "courses" },
          specs: { mode: "specs" },
          exam: { mode: "exam" },
          komise: { mode: "komise" },
        }[section];
      const scroller = contentRef.current;
      if (scroller) {
        scrollBySection.current[currentTop] = scroller.scrollTop;
        preSavedSectionRef.current = currentTop;
      }
      navigate(routeToPath(target));
    },
    [currentTop, sectionRoutes, navigate],
  );

  let standalonePage = null;
  if (content) {
    switch (route.mode) {
      case "home":
        standalonePage = <HomePage content={content} navigate={navigate} />;
        break;
      case "global-mindmap":
        standalonePage = (
          <GlobalMindmapPage content={content} navigate={navigate} />
        );
        break;
      default:
        standalonePage = null;
    }
  }

  const blockContextValue = useMemo(
    () => ({ content, navigate }),
    [content, navigate],
  );

  if (bootError) {
    return (
      <div className="loading">
        <div
          style={{
            color: "var(--warn)",
            maxWidth: 400,
            textAlign: "center",
            padding: "0 20px",
          }}
        >
          <strong>Failed to load content.</strong>
          <br />
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            {bootError}
          </span>
        </div>
      </div>
    );
  }
  if (!content) {
    return (
      <div className="loading">
        <div className="spinner" />
        Loading content…
      </div>
    );
  }

  return (
    <KomiseProvider>
      <div className="app">
        <Topbar
          navigate={navigate}
          onOpenSearch={() => setShowSearch(true)}
          onOpenProgress={() => setShowProgress(true)}
          onOpenSettings={() => setShowSettings(true)}
          hasProgress={hasProgress}
          dark={t.dark}
          onToggleDark={() => setTweak("dark", !t.dark)}
          repoUrl={content.REPO_URL}
        />
        <main ref={contentRef} className="content">
          <BlockContext.Provider value={blockContextValue}>
            <div
              hidden={currentTop !== "courses"}
              aria-hidden={currentTop !== "courses"}
            >
              <SectionPage
                route={sectionRoutes.courses}
                content={content}
                navigate={navigate}
              />
            </div>
            <div
              hidden={currentTop !== "specs"}
              aria-hidden={currentTop !== "specs"}
            >
              <SectionPage
                route={sectionRoutes.specs}
                content={content}
                navigate={navigate}
              />
            </div>
            <div
              hidden={currentTop !== "exam"}
              aria-hidden={currentTop !== "exam"}
            >
              <SectionPage
                route={sectionRoutes.exam}
                content={content}
                navigate={navigate}
              />
            </div>
            <div
              hidden={currentTop !== "komise"}
              aria-hidden={currentTop !== "komise"}
            >
              <SectionPage
                route={sectionRoutes.komise}
                content={content}
                navigate={navigate}
              />
            </div>
            {standalonePage}
          </BlockContext.Provider>
        </main>
        <ModeSwitcher
          currentTop={
            ["courses", "specs", "exam", "komise"].includes(currentTop)
              ? currentTop
              : null
          }
          onSwitch={handleModeSwitch}
        />
        {showProgress && (
          <ProgressSheet onClose={() => setShowProgress(false)} />
        )}
        {showSettings && (
          <SettingsSheet
            t={t}
            setTweak={setTweak}
            onClose={() => setShowSettings(false)}
          />
        )}
        {showSearch && (
          <SearchSheet
            content={content}
            defaultScopeCourseId={
              route.mode === "course" ? route.courseId : null
            }
            initialScope={searchInitialScope}
            navigate={navigate}
            onClose={() => setShowSearch(false)}
          />
        )}
        <Toast msg={toastMsg} />
      </div>
    </KomiseProvider>
  );
}
