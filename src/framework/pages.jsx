// pages.jsx — page components for each route.
// All pages take the loaded `content` model and a `navigate` callback.

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useProgress, useCollapsed, loadTweaks, saveTweaks } from "./progress.js";
import { BlockList } from "./content-blocks.jsx";
import { Mindmap } from "./mindmap.jsx";
import { GlobalMindmap } from "./global-mindmap.jsx";

function useTweak(key, defaultValue) {
  const [val, setVal] = useState(() => {
    const t = loadTweaks();
    return t[key] === undefined ? defaultValue : t[key];
  });
  useEffect(() => {
    const on = () => setVal(loadTweaks()[key] ?? defaultValue);
    window.addEventListener("okruhy:tweaks-changed", on);
    return () => window.removeEventListener("okruhy:tweaks-changed", on);
  }, [key, defaultValue]);
  const update = (v) => { saveTweaks({ ...loadTweaks(), [key]: v }); setVal(v); };
  return [val, update];
}

export function VerifiedBadge({ size = 14, title = "Verified — reviewed by a human" }) {
  return (
    <span className="verified-badge" title={title} aria-label={title} role="img">
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="8" fill="currentColor"/>
        <path d="m4.5 8.2 2.4 2.4 5-5.2" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </svg>
    </span>
  );
}

function ChevronToggle({ collapsed, onClick, label }) {
  return (
    <button
      className="collapse-toggle"
      data-collapsed={collapsed}
      onClick={onClick}
      aria-label={collapsed ? `Expand ${label}` : `Collapse ${label}`}
      aria-expanded={!collapsed}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

/* ─── small helpers ─────────────────────────────────────────── */
export function SpecDots({ content, specs }) {
  return (
    <span className="spec-dots">
      {specs.map((id) => {
        const s = content.findSpec(id);
        if (!s) return null;
        return <span key={id} className="spec-dot" style={{ "--h": s.hue }} title={s.name} />;
      })}
    </span>
  );
}

export function SpecChip({ content, id }) {
  const s = content.findSpec(id);
  if (!s) return null;
  return <span className="chip spec" style={{ "--h": s.hue }}>{s.id}</span>;
}

export function ProgressBar({ pct }) {
  return (
    <div className="progress-track" aria-label={`${Math.round(pct * 100)}% complete`}>
      <div className="progress-fill" style={{ width: `${pct * 100}%` }} />
    </div>
  );
}

/* Small "Not yet available" pill, used on dimmed exam topics + spec cards. */
function UnavailPill({ label = "not yet available" }) {
  return <span className="unavail-pill" title="This exam-topic content hasn't been authored yet.">{label}</span>;
}

// True iff this spec has at least one exam topic whose refs resolve to a real subtopic.
function specHasAnyContent(content, specId) {
  const topics = content.EXAM_TOPICS[specId] || [];
  return topics.some((t) => (t.refs || []).some(([c, tp, s]) => {
    const r = content.findSubtopic(c, tp, s);
    return !!(r && r.sub);
  }));
}

// True iff a single exam topic resolves to anything in the catalogue.
function topicHasContent(content, topic) {
  return (topic.refs || []).some(([c, tp, s]) => {
    const r = content.findSubtopic(c, tp, s);
    return !!(r && r.sub);
  });
}

function AiNotice({ repoUrl }) {
  const [dismissed, setDismissed] = useTweak("aiNoticeDismissed", false);
  if (dismissed) return null;
  return (
    <div className="ai-notice" role="note">
      <div className="ai-notice-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 8v4M12 16h.01" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
      <div className="ai-notice-body">
        <strong>Most of this content is AI-generated.</strong> Items marked with a blue <VerifiedBadge size={12} title="" /> have been reviewed by a human; everything else is best treated as a study aid — cross-check against the course slides, RFCs, or textbooks.{" "}
        {repoUrl && (
          <>
            Spotted something wrong, have an improvement, or verified a topic yourself? <a href={repoUrl + "/issues/new/choose"} target="_blank" rel="noopener noreferrer">Open an issue</a> or <a href={repoUrl + "/pulls"} target="_blank" rel="noopener noreferrer">send a PR</a>.
          </>
        )}
      </div>
      <button className="ai-notice-close" onClick={() => setDismissed(true)} aria-label="Dismiss notice">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12" /></svg>
      </button>
    </div>
  );
}

// Ping a once-per-session toast the first time the user opens any content page.
// `sessionStorage` resets when the tab closes, so the reminder shows once per
// new study session without nagging during normal navigation.
function useAiSessionToast() {
  useEffect(() => {
    try { if (sessionStorage.getItem("okruhy.aiToastShown")) return; } catch { return; }
    // Mark the flag inside the timeout (not before scheduling it) so React StrictMode's
    // mount→cleanup→mount double-invocation in dev doesn't swallow the toast.
    const id = setTimeout(() => {
      try { sessionStorage.setItem("okruhy.aiToastShown", "1"); } catch {}
      if (window.toast) window.toast("AI-generated unless marked ✓ — verify with primary sources or contribute on GitHub", 6500);
    }, 600);
    return () => clearTimeout(id);
  }, []);
}

/* ─── HOME ─────────────────────────────────────────────────── */
export function HomePage({ content, navigate }) {
  const { specStats } = useProgress(content);
  const tot = content.SPECIALIZATIONS.reduce((s, sp) => s + specStats(sp.id).done, 0);
  return (
    <>
      <div className="page-head" style={{ marginTop: 24 }}>
        <div className="page-eyebrow">Exam prep</div>
        <h1 className="page-title" style={{ fontSize: 34, marginBottom: 12 }}>Three ways to study.</h1>
        <p className="page-blurb">Browse by course, by your specialization, or straight from the final-exam topic list. Progress lives in your browser — export it as JSON to keep it.</p>
      </div>

      <AiNotice repoUrl={content.REPO_URL} />

      <div className="cards" style={{ marginTop: 12 }}>
        <button className="card" onClick={() => navigate("/c")} style={{ padding: 20 }}>
          <div className="card-top">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="card-code">Mode 1</div>
              <h3 className="card-title" style={{ fontSize: 18 }}>By course</h3>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>{content.COURSES.length} courses</span>
          </div>
          <p className="card-blurb">All material organized by individual course → topic → subtopic.</p>
        </button>

        <button className="card" onClick={() => navigate("/s")} style={{ padding: 20 }}>
          <div className="card-top">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="card-code">Mode 2</div>
              <h3 className="card-title" style={{ fontSize: 18 }}>By specialization</h3>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>{content.SPECIALIZATIONS.length} tracks</span>
          </div>
          <p className="card-blurb">Filter to your master's track — see only its courses and its final-exam topics.</p>
        </button>

        <button className="card" onClick={() => navigate("/x")} style={{ padding: 20 }}>
          <div className="card-top">
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div className="card-code">Mode 3</div>
              <h3 className="card-title" style={{ fontSize: 18 }}>By final-exam topics</h3>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>okruhy</span>
          </div>
          <p className="card-blurb">Drill straight into state-exam topic areas. Shared areas across specializations are color-badged.</p>
        </button>
      </div>

      {content.GLOBAL_MINDMAP && (
        <button
          className="card"
          onClick={() => navigate("/mm")}
          style={{ marginTop: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}
        >
          <span style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-soft)", color: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/>
              <path d="m7 7 3 4M17 7l-3 4M7 17l3-4M17 17l-3-4"/>
            </svg>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 className="card-title" style={{ marginBottom: 2 }}>Global mindmap</h3>
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
              See how all {content.COURSES.length} courses connect — shared concepts, prerequisites, and crossover topics.
            </p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--text-faint)" }}><path d="m9 6 6 6-6 6"/></svg>
        </button>
      )}

      {tot > 0 && (
        <div style={{ marginTop: 24, padding: 14, background: "var(--bg-inset)", borderRadius: "var(--r-md)", fontSize: 13, color: "var(--text-muted)" }}>
          You've checked off <strong style={{ color: "var(--text)" }}>{tot}</strong> subtopics. Keep going.
        </div>
      )}
    </>
  );
}

/* ─── GLOBAL MINDMAP ───────────────────────────────────────── */
export function GlobalMindmapPage({ content, navigate }) {
  const { set } = useProgress(content);
  const data = content.GLOBAL_MINDMAP;
  if (!data) return <div className="empty">Global mindmap not available — content/mindmaps/_global.json missing.</div>;
  return (
    <>
      <div className="page-head">
        <button className="detail-back" onClick={() => navigate("/")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 6-6 6 6 6"/></svg>
          Home
        </button>
        <div className="page-eyebrow">Catalog overview</div>
        <h1 className="page-title">{data.title || "Global mindmap"}</h1>
        {data.summary && <p className="page-blurb">{data.summary}</p>}
      </div>
      <GlobalMindmap data={data} content={content} completedSet={set} navigate={navigate} />
    </>
  );
}

/* ─── COURSES LIST ─────────────────────────────────────────── */
export function CoursesPage({ content, navigate }) {
  const [q, setQ] = useState("");
  const { courseStats } = useProgress(content);

  const courses = content.COURSES.filter((c) => {
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return c.name.toLowerCase().includes(needle)
        || c.id.toLowerCase().includes(needle)
        || (c.blurb || "").toLowerCase().includes(needle);
  });

  return (
    <>
      <div className="page-head">
        <div className="page-eyebrow">Browse</div>
        <h1 className="page-title">Courses</h1>
        <p className="page-blurb">Every course you can study. Drill in to see topics and subtopics, jump to specific material via deep-linkable anchors, or open the mindmap.</p>
        {content.GLOBAL_MINDMAP && (
          <button className="btn" style={{ marginTop: 8 }} onClick={() => navigate("/mm")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2.5"/><circle cx="5" cy="6" r="1.5"/><circle cx="19" cy="6" r="1.5"/><circle cx="5" cy="18" r="1.5"/><circle cx="19" cy="18" r="1.5"/><path d="m7 7 3.5 3.5M17 7l-3.5 3.5M7 17l3.5-3.5M17 17l-3.5-3.5"/></svg>
            Global mindmap
          </button>
        )}
      </div>

      <div className="search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input placeholder="Search courses…" value={q} onChange={(e) => setQ(e.target.value)} />
        {q && <button className="icon-btn" onClick={() => setQ("")} title="Clear">×</button>}
      </div>

      <div className="cards">
        {courses.map((c) => {
          const st = courseStats(c);
          const subCount = c.topics.reduce((s, t) => s + t.subtopics.length, 0);
          return (
            <button key={c.id} className="card" onClick={() => navigate(`/c/${c.id}`)}>
              <div className="card-top">
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 0 }}>
                  <div className="card-code">{c.id}{c.semester ? ` · ${c.semester}` : ""}{c.credits ? ` · ${c.credits} cr` : ""}</div>
                  <h3 className="card-title">{c.name}</h3>
                </div>
                <SpecDots content={content} specs={c.specializations || []} />
              </div>
              {c.blurb && <p className="card-blurb">{c.blurb}</p>}
              <div className="card-meta">
                <span>{c.topics.length} topics · {subCount} subtopics</span>
                <span style={{ flex: 1 }} />
                {st.total > 0 && (
                  <>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{st.done}/{st.total}</span>
                    <ProgressBar pct={st.pct} />
                  </>
                )}
              </div>
            </button>
          );
        })}
        {courses.length === 0 && <div className="empty">No matches</div>}
      </div>
    </>
  );
}

function TocSidebar({ course, activeTopic, activeSub, hidden, onToggle, onJumpTopic, onJumpSub }) {
  // Auto-scroll the active row into view as the user scrolls through the page.
  const sideRef = useRef(null);
  useEffect(() => {
    if (!sideRef.current || !activeSub) return;
    const row = sideRef.current.querySelector(`[data-sub-key="${activeSub}"]`);
    if (row) row.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeSub]);

  return (
    <aside className="toc-sidebar" data-hidden={hidden} aria-hidden={hidden} ref={sideRef}>
      <div className="toc-sidebar-head">
        <span>On this page</span>
        <button className="icon-btn" onClick={onToggle} aria-label={hidden ? "Show table of contents" : "Hide table of contents"} title={hidden ? "Show TOC" : "Hide TOC"}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {hidden
              ? <path d="M4 6h16M4 12h16M4 18h10" />
              : <path d="M18 6 6 18M6 6l12 12" />}
          </svg>
        </button>
      </div>
      <nav className="toc-sidebar-body">
        {course.topics.map((t, i) => {
          const isActive = activeTopic === t.id;
          return (
            <div key={t.id} className="toc-side-topic" data-active={isActive}>
              <button className="toc-side-topic-btn" onClick={() => onJumpTopic(t.id)}>
                <span className="toc-side-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="toc-side-text">
                  {t.title}
                  {t.verified && <VerifiedBadge size={11} />}
                </span>
              </button>
              <div className="toc-side-subs">
                {t.subtopics.map((s) => {
                  const key = `${t.id}/${s.id}`;
                  return (
                    <button key={s.id} className="toc-side-sub" data-active={activeSub === key} data-sub-key={key}
                      onClick={() => onJumpSub(t.id, s.id)}>
                      {s.title}
                      {s.verified && <VerifiedBadge size={11} />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

function TocSidebarReopen({ onToggle, hidden }) {
  if (!hidden) return null;
  return (
    <button className="toc-sidebar-reopen" onClick={onToggle} aria-label="Show table of contents" title="Show TOC">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 12h16M4 18h10" />
      </svg>
    </button>
  );
}

/* ─── COURSE DETAIL ────────────────────────────────────────── */
export function CourseDetailPage({ content, courseId, focusTopic, focusSub, view, navigate }) {
  const course = content.findCourse(courseId);
  const { set, toggle, courseStats } = useProgress(content);
  const { isCollapsed, setCollapsed, toggle: toggleCollapsed } = useCollapsed();
  useAiSessionToast();
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTopic, setActiveTopic] = useState(focusTopic || (course && course.topics[0] && course.topics[0].id));
  const [activeSub, setActiveSub] = useState(focusSub || null);
  const [sidebarHidden, setSidebarHidden] = useTweak("tocSidebarHidden", false);
  const topicObserverRef = useRef(null);
  const subObserverRef = useRef(null);
  const tocBarRef = useRef(null);

  const isMindmap = view === "mm";

  // Force-expand the focused topic + subtopic from the URL so it's visible after navigation.
  useEffect(() => {
    if (!course) return;
    if (focusTopic) setCollapsed(`topic:${course.id}/${focusTopic}`, false);
    if (focusTopic && focusSub) setCollapsed(`sub:${course.id}/${focusTopic}/${focusSub}`, false);
  }, [course, focusTopic, focusSub]);

  useLayoutEffect(() => {
    if (!course || isMindmap) return;
    if (focusSub && focusTopic) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const el = document.getElementById(`sub-${focusTopic}-${focusSub}`);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          setActiveTopic(focusTopic);
        }
      }));
    } else if (focusTopic) {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const el = document.getElementById(`top-${focusTopic}`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }));
    } else {
      window.scrollTo({ top: 0 });
    }
  }, [courseId, focusTopic, focusSub, isMindmap, course]);

  useEffect(() => {
    if (!course || isMindmap) return;
    const els = course.topics.map((t) => document.getElementById(`top-${t.id}`)).filter(Boolean);
    if (topicObserverRef.current) topicObserverRef.current.disconnect();
    topicObserverRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const id = visible[0].target.id.replace("top-", "");
          setActiveTopic(id);
        }
      },
      { rootMargin: "-120px 0px -50% 0px", threshold: 0 }
    );
    els.forEach((el) => topicObserverRef.current.observe(el));
    return () => topicObserverRef.current && topicObserverRef.current.disconnect();
  }, [courseId, isMindmap, course]);

  // Track the currently-visible subtopic — feeds the sidebar's active-row highlight.
  useEffect(() => {
    if (!course || isMindmap) return;
    const subEls = [];
    for (const t of course.topics) for (const s of t.subtopics) {
      const el = document.getElementById(`sub-${t.id}-${s.id}`);
      if (el) subEls.push({ el, key: `${t.id}/${s.id}` });
    }
    if (subObserverRef.current) subObserverRef.current.disconnect();
    subObserverRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          const hit = subEls.find(({ el }) => el === visible[0].target);
          if (hit) setActiveSub(hit.key);
        }
      },
      { rootMargin: "-130px 0px -60% 0px", threshold: 0 }
    );
    subEls.forEach(({ el }) => subObserverRef.current.observe(el));
    return () => subObserverRef.current && subObserverRef.current.disconnect();
  }, [courseId, isMindmap, course]);

  // Auto-scroll the horizontal pill bar so the active topic stays in view.
  useEffect(() => {
    const bar = tocBarRef.current;
    if (!bar || !activeTopic) return;
    const pill = bar.querySelector(`[data-pill-id="${activeTopic}"]`);
    if (!pill) return;
    const barRect = bar.getBoundingClientRect();
    const pillRect = pill.getBoundingClientRect();
    const offset = (pillRect.left + pillRect.width / 2) - (barRect.left + barRect.width / 2);
    bar.scrollBy({ left: offset, behavior: "smooth" });
  }, [activeTopic]);

  // While the sidebar tweak is on AND the user is on this page, mark the body so
  // wide-screen CSS can reserve room. Cleanup on unmount → other pages stay full-width.
  useEffect(() => {
    if (isMindmap) return;
    document.body.dataset.tocSidebar = sidebarHidden ? "hidden" : "open";
    return () => { delete document.body.dataset.tocSidebar; };
  }, [sidebarHidden, isMindmap]);

  if (!course) return <div className="empty">Course not found</div>;

  const copyAnchor = (topicId, subId) => {
    const url = location.origin + location.pathname + `#/c/${course.id}/${topicId}/${subId}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    const key = `${topicId}/${subId}`;
    setCopiedKey(key);
    window.toast && window.toast("Link copied to clipboard");
    setTimeout(() => setCopiedKey((k) => (k === key ? null : k)), 1600);
  };

  const st = courseStats(course);
  const scrollToTopic = (tid) => {
    const el = document.getElementById(`top-${tid}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <div className="detail-head">
        <button className="detail-back" onClick={() => navigate("/c")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 6-6 6 6 6"/></svg>
          Courses
        </button>
        <div className="page-eyebrow">{course.id}{course.semester ? ` · ${course.semester}` : ""}{course.credits ? ` · ${course.credits} credits` : ""}</div>
        <h1 className="page-title">{course.name}</h1>
        {course.blurb && <p className="page-blurb">{course.blurb}</p>}
        <div className="detail-meta">
          {(course.specializations || []).map((id) => <SpecChip key={id} content={content} id={id} />)}
          <span style={{ flex: 1 }} />
          {st.total > 0 && (
            <div className="hist">
              <span style={{ fontFamily: "var(--font-mono)" }}>{st.done}/{st.total}</span>
              <ProgressBar pct={st.pct} />
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <button className="btn" style={!isMindmap ? { background: "var(--accent)", color: "var(--accent-text-on)", borderColor: "var(--accent)" } : {}}
            onClick={() => navigate(`/c/${course.id}`)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h10"/></svg>
            List
          </button>
          <button className="btn" style={isMindmap ? { background: "var(--accent)", color: "var(--accent-text-on)", borderColor: "var(--accent)" } : {}}
            onClick={() => navigate(`/c/${course.id}/mm`)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2.5"/><circle cx="5" cy="6" r="1.5"/><circle cx="19" cy="6" r="1.5"/><circle cx="5" cy="18" r="1.5"/><circle cx="19" cy="18" r="1.5"/><path d="m7 7 3.5 3.5M17 7l-3.5 3.5M7 17l3.5-3.5M17 17l-3.5-3.5"/></svg>
            Mindmap
          </button>
        </div>
      </div>

      {isMindmap ? (
        <Mindmap
          course={course}
          completedSet={set}
          content={content}
          onNavigate={(cid, tid, sid) => navigate(`/c/${cid}/${tid}${sid ? "/" + sid : ""}`)}
        />
      ) : (
        <>
          <div className="toc-bar" ref={tocBarRef}>
            <div className="toc-bar-inner">
              {course.topics.map((t, i) => (
                <button key={t.id} className="toc-pill" data-active={activeTopic === t.id}
                  data-pill-id={t.id}
                  onClick={() => scrollToTopic(t.id)}>
                  <span className="toc-counter">{String(i + 1).padStart(2, "0")}</span>
                  {t.title}
                </button>
              ))}
            </div>
          </div>

          <TocSidebar
            course={course}
            activeTopic={activeTopic}
            activeSub={activeSub}
            hidden={sidebarHidden}
            onToggle={() => setSidebarHidden(!sidebarHidden)}
            onJumpTopic={(tid) => scrollToTopic(tid)}
            onJumpSub={(tid, sid) => {
              // Make sure the subtopic is expanded, then scroll to it.
              setCollapsed(`topic:${course.id}/${tid}`, false);
              setCollapsed(`sub:${course.id}/${tid}/${sid}`, false);
              requestAnimationFrame(() => requestAnimationFrame(() => {
                const el = document.getElementById(`sub-${tid}-${sid}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }));
            }}
          />
          <TocSidebarReopen onToggle={() => setSidebarHidden(false)} hidden={sidebarHidden} />

          {course.topics.map((t, ti) => {
            const topicKey = `topic:${course.id}/${t.id}`;
            const topicCollapsed = isCollapsed(topicKey);
            return (
              <section className="topic" id={`top-${t.id}`} key={t.id} data-collapsed={topicCollapsed}>
                <h2 className="topic-title">
                  <ChevronToggle collapsed={topicCollapsed} onClick={() => toggleCollapsed(topicKey)} label={t.title} />
                  <span className="topic-num">{String(ti + 1).padStart(2, "0")}</span>
                  <span className="topic-title-text">
                    {t.title}
                    {t.verified && <VerifiedBadge />}
                  </span>
                  <span className="topic-count">{t.subtopics.length}</span>
                </h2>
                {!topicCollapsed && t.subtopics.map((sub) => {
                  const key = `${course.id}/${t.id}/${sub.id}`;
                  const subKey = `sub:${course.id}/${t.id}/${sub.id}`;
                  const isDone = set.has(key);
                  const isCopied = copiedKey === `${t.id}/${sub.id}`;
                  const subCollapsed = isCollapsed(subKey);
                  return (
                    <article className="subtopic" id={`sub-${t.id}-${sub.id}`} key={sub.id} data-collapsed={subCollapsed}>
                      <header className="subtopic-head">
                        <div className="subtopic-title-row">
                          <ChevronToggle collapsed={subCollapsed} onClick={() => toggleCollapsed(subKey)} label={sub.title} />
                          <button className="subtopic-check" data-checked={isDone}
                            onClick={() => toggle(key)}
                            aria-label={isDone ? "Mark not done" : "Mark done"}>
                            {isDone && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5 9-11"/></svg>}
                          </button>
                          <h3 className="subtopic-title" onClick={() => toggleCollapsed(subKey)}>
                            {sub.title}
                            {sub.verified && <VerifiedBadge />}
                          </h3>
                        </div>
                        <button className={"subtopic-anchor" + (isCopied ? " copied" : "")}
                          onClick={() => copyAnchor(t.id, sub.id)}
                          title="Copy link to this subtopic">
                          {isCopied ? (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m5 12 5 5 9-11"/></svg>
                              copied
                            </>
                          ) : (
                            <>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.72"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                              link
                            </>
                          )}
                        </button>
                      </header>
                      {!subCollapsed && <BlockList blocks={sub.blocks} />}
                    </article>
                  );
                })}
              </section>
            );
          })}

          {course.resources && course.resources.length > 0 && (
            <section className="see-more">
              <header className="see-more-head">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.72"/>
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                </svg>
                <h3>Further reading — external resources for {course.id}</h3>
              </header>
              <ul className="see-more-list">
                {course.resources.map((r, i) => (
                  <li key={i}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="see-more-link">
                      <div className="see-more-link-text">
                        <span className="see-more-link-title">{r.title}</span>
                        {r.note && <span className="see-more-link-note">{r.note}</span>}
                      </div>
                      {r.kind && <span className="see-more-kind">{r.kind}</span>}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M7 17 17 7M7 7h10v10"/>
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}

/* ─── SPECIALIZATIONS ─────────────────────────────────────── */
export function SpecsPage({ content, navigate }) {
  const { specStats } = useProgress(content);
  return (
    <>
      <div className="page-head">
        <div className="page-eyebrow">Browse by</div>
        <h1 className="page-title">Specializations</h1>
        <p className="page-blurb">Filter material by your master's specialization. Each track has its own course set and final-exam topic areas.</p>
      </div>
      <div className="cards">
        {content.SPECIALIZATIONS.map((s) => {
          const courseCount = content.COURSES.filter((c) => (c.specializations || []).includes(s.id)).length;
          const topics = content.EXAM_TOPICS[s.id] || [];
          const examCount = topics.length;
          const coveredCount = topics.filter((t) => topicHasContent(content, t)).length;
          const blank = courseCount === 0 && coveredCount === 0;
          const st = specStats(s.id);
          return (
            <button key={s.id} className="card" data-blank={blank} onClick={() => navigate(`/s/${s.id}`)} style={{ "--h": s.hue }}>
              <div className="card-top">
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div className="card-code">{s.id}{s.short ? ` · ${s.short}` : ""}</div>
                  <h3 className="card-title">{s.name}</h3>
                </div>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: `oklch(0.62 0.14 ${s.hue})`, flexShrink: 0, opacity: blank ? 0.5 : 1 }} />
              </div>
              {s.blurb && <p className="card-blurb">{s.blurb}</p>}
              <div className="card-meta">
                <span>{courseCount} courses · {examCount} exam topics{examCount > 0 && coveredCount < examCount ? ` (${coveredCount} with content)` : ""}</span>
                <span style={{ flex: 1 }} />
                {blank && <UnavailPill />}
                {st.total > 0 && (
                  <>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{Math.round(st.pct * 100)}%</span>
                    <ProgressBar pct={st.pct} />
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

export function SpecDetailPage({ content, specId, navigate }) {
  const spec = content.findSpec(specId);
  const { courseStats, specStats, examStats } = useProgress(content);
  if (!spec) return <div className="empty">Specialization not found</div>;
  const courses = content.COURSES.filter((c) => (c.specializations || []).includes(specId));
  const examTopics = content.EXAM_TOPICS[specId] || [];
  const coveredCount = examTopics.filter((t) => topicHasContent(content, t)).length;
  const specBlank = courses.length === 0 && coveredCount === 0;
  const st = specStats(specId);
  const ex = examStats(specId);

  return (
    <>
      <button className="detail-back" onClick={() => navigate("/s")}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 6-6 6 6 6"/></svg>
        Specializations
      </button>

      <div className="spec-hero" style={{ "--h": spec.hue }}>
        <div className="page-eyebrow">Specialization · {spec.id}</div>
        <h1 className="page-title" style={{ marginBottom: 6 }}>{spec.name}</h1>
        {spec.blurb && <p className="page-blurb">{spec.blurb}</p>}
        <div className="detail-meta" style={{ marginTop: 14 }}>
          <span className="chip">{courses.length} courses</span>
          <span className="chip">{examTopics.length} exam topics</span>
          {examTopics.length > 0 && coveredCount < examTopics.length && (
            <span className="chip">{coveredCount} with content</span>
          )}
          <span style={{ flex: 1 }} />
          {st.total > 0 && (
            <div className="hist">
              <span style={{ fontFamily: "var(--font-mono)" }}>{Math.round(st.pct * 100)}%</span>
              <ProgressBar pct={st.pct} />
            </div>
          )}
        </div>
      </div>

      {specBlank && (
        <div className="unavail-banner">
          <strong>Coming soon.</strong> This specialization's exam topics are listed below for reference, but study material hasn't been authored yet. Shared topics that overlap with other specs may already have content — open one to find out.
        </div>
      )}

      {courses.length > 0 && (
        <>
          <h2 className="section-title">Courses in this specialization</h2>
          <div className="cards">
            {courses.map((c) => {
              const cst = courseStats(c);
              return (
                <button key={c.id} className="card" onClick={() => navigate(`/c/${c.id}`)}>
                  <div className="card-top">
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div className="card-code">{c.id}{c.semester ? ` · ${c.semester}` : ""}{c.credits ? ` · ${c.credits} cr` : ""}</div>
                      <h3 className="card-title">{c.name}</h3>
                    </div>
                    <SpecDots content={content} specs={c.specializations || []} />
                  </div>
                  {c.blurb && <p className="card-blurb">{c.blurb}</p>}
                  {cst.total > 0 && (
                    <div className="card-meta">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{cst.done}/{cst.total}</span>
                      <ProgressBar pct={cst.pct} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}

      <h2 className="section-title">Final exam topics</h2>
      <div className="exam-topiclist">
        {examTopics.map((t) => {
          const blank = !topicHasContent(content, t);
          const hasLinks = (t.resources && t.resources.length > 0);
          return (
            <button key={t.id} className="exam-topic-card" data-blank={blank} onClick={() => navigate(`/x/${specId}/${t.id}`)}>
              <span className="exam-topic-n">{String(t.n).padStart(2, "0")}</span>
              <span className="exam-topic-title">{t.title}</span>
              {blank && (hasLinks
                ? <span className="exam-links-pill" title={`${t.resources.length} external resources`}>{t.resources.length} link{t.resources.length === 1 ? "" : "s"}</span>
                : <UnavailPill label="empty" />)}
              <span className="exam-topic-tags">
                {t.sharedWith && t.sharedWith.length > 0 && <SpecDots content={content} specs={t.sharedWith} />}
              </span>
            </button>
          );
        })}
      </div>
      {ex.total > 0 && (
        <div className="hist" style={{ marginTop: 12 }}>
          <span style={{ fontFamily: "var(--font-mono)" }}>{ex.done}/{ex.total} sub-areas covered</span>
          <ProgressBar pct={ex.pct} />
        </div>
      )}
    </>
  );
}

/* ─── EXAM ────────────────────────────────────────────────── */
function ExamSpecPicker({ content, specId, navigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const spec = content.findSpec(specId);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);
  if (!spec) return null;
  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button className="detail-back" style={{ background: "var(--bg-card)", border: "0.5px solid var(--line)", borderRadius: 8, padding: "6px 10px 6px 12px", gap: 8, fontWeight: 500, color: "var(--text)" }}
        onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: `oklch(0.62 0.14 ${spec.hue})`, display: "inline-block" }} />
        <span>{spec.id}</span>
        {spec.short && <span style={{ color: "var(--text-faint)", fontSize: 12 }}>· {spec.short}</span>}
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          style={{ marginLeft: 2, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div role="listbox" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 30, minWidth: 280, maxWidth: 340, background: "var(--bg-card)", border: "0.5px solid var(--line)", borderRadius: "var(--r-md)", boxShadow: "var(--shadow-lg)", padding: 4, maxHeight: "60vh", overflowY: "auto" }}>
          <div style={{ padding: "6px 10px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)", fontWeight: 500 }}>Switch specialization</div>
          {content.SPECIALIZATIONS.map((s) => {
            const active = s.id === specId;
            const count = (content.EXAM_TOPICS[s.id] || []).length;
            return (
              <button key={s.id} role="option" aria-selected={active}
                onClick={() => { setOpen(false); navigate(`/x/${s.id}`); }}
                style={{ appearance: "none", border: "none", width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 6, background: active ? "var(--accent-soft)" : "transparent", color: active ? "var(--accent)" : "var(--text)", cursor: "default", font: "inherit", fontSize: 13 }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: `oklch(0.62 0.14 ${s.hue})`, flexShrink: 0 }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: active ? "var(--accent)" : "var(--text-faint)", width: 44 }}>{s.id}</span>
                <span style={{ flex: 1, fontWeight: active ? 600 : 500 }}>{s.name}</span>
                <span style={{ fontSize: 11, color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ExamPage({ content, navigate }) {
  const { examStats } = useProgress(content);
  return (
    <>
      <div className="page-head">
        <div className="page-eyebrow">Final exam</div>
        <h1 className="page-title">Pick your specialization</h1>
        <p className="page-blurb">State-exam topic areas are grouped by specialization. Some areas are shared across multiple specializations — marked with colored badges.</p>
      </div>
      <div className="cards">
        {content.SPECIALIZATIONS.map((s) => {
          const topics = content.EXAM_TOPICS[s.id] || [];
          const sharedCount = topics.filter((t) => t.sharedWith && t.sharedWith.length).length;
          const coveredCount = topics.filter((t) => topicHasContent(content, t)).length;
          const blank = topics.length > 0 && coveredCount === 0;
          const st = examStats(s.id);
          return (
            <button key={s.id} className="card" data-blank={blank} onClick={() => navigate(`/x/${s.id}`)} style={{ "--h": s.hue }}>
              <div className="card-top">
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div className="card-code">{s.id}</div>
                  <h3 className="card-title">{s.name}</h3>
                </div>
                <span style={{ width: 28, height: 28, borderRadius: "50%", background: `oklch(0.62 0.14 ${s.hue})`, flexShrink: 0, opacity: blank ? 0.5 : 1 }} />
              </div>
              <div className="card-meta">
                <span>{topics.length} topics</span>
                {sharedCount > 0 && <span>· {sharedCount} shared</span>}
                {coveredCount > 0 && coveredCount < topics.length && (
                  <span>· {coveredCount} with content</span>
                )}
                <span style={{ flex: 1 }} />
                {blank && <UnavailPill />}
                {st.total > 0 && (
                  <>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{Math.round(st.pct * 100)}%</span>
                    <ProgressBar pct={st.pct} />
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}

export function ExamSpecPage({ content, specId, navigate }) {
  const spec = content.findSpec(specId);
  const { examStats, set } = useProgress(content);
  if (!spec) return <div className="empty">Not found</div>;
  const topics = content.EXAM_TOPICS[specId] || [];
  const st = examStats(specId);
  return (
    <>
      <ExamSpecPicker content={content} specId={specId} navigate={navigate} />
      <div className="spec-hero" style={{ "--h": spec.hue, marginTop: 14 }}>
        <div className="page-eyebrow">Final exam · {spec.id}</div>
        <h1 className="page-title" style={{ marginBottom: 6 }}>{spec.name}</h1>
        <p className="page-blurb">{topics.length} topic areas. Open any to study. Use ← → on desktop or the buttons on mobile to move between areas.</p>
        <div className="detail-meta" style={{ marginTop: 14 }}>
          {st.total > 0 && (
            <div className="hist">
              <span style={{ fontFamily: "var(--font-mono)" }}>{st.done}/{st.total} sub-areas covered</span>
              <ProgressBar pct={st.pct} />
            </div>
          )}
        </div>
      </div>

      <div className="exam-topiclist">
        {topics.map((t) => {
          const total = t.refs.length;
          const done = t.refs.filter(([c, tp, s]) => set.has(`${c}/${tp}/${s}`)).length;
          const blank = !topicHasContent(content, t);
          const hasLinks = (t.resources && t.resources.length > 0);
          return (
            <button key={t.id} className="exam-topic-card" data-blank={blank} onClick={() => navigate(`/x/${specId}/${t.id}`)}>
              <span className="exam-topic-n">{String(t.n).padStart(2, "0")}</span>
              <span className="exam-topic-title">{t.title}</span>
              {blank
                ? (hasLinks
                  ? <span className="exam-links-pill" title={`${t.resources.length} external resources`}>{t.resources.length} link{t.resources.length === 1 ? "" : "s"}</span>
                  : <UnavailPill label="empty" />)
                : <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>{done}/{total}</span>}
              <span className="exam-topic-tags">
                {t.sharedWith && t.sharedWith.length > 0 && <SpecDots content={content} specs={t.sharedWith} />}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}

export function ExamTopicPage({ content, specId, topicId, navigate }) {
  const spec = content.findSpec(specId);
  const topics = content.EXAM_TOPICS[specId] || [];
  const idx = topics.findIndex((t) => t.id === topicId);
  const topic = topics[idx];
  const [showJump, setShowJump] = useState(false);
  const { set, toggle } = useProgress(content);
  const { isCollapsed, toggle: toggleCollapsed } = useCollapsed();
  useAiSessionToast();

  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft" && idx > 0) navigate(`/x/${specId}/${topics[idx - 1].id}`);
      if (e.key === "ArrowRight" && idx < topics.length - 1) navigate(`/x/${specId}/${topics[idx + 1].id}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx, specId, topicId, topics]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [topicId]);

  if (!spec || !topic) return <div className="empty">Topic not found</div>;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <ExamSpecPicker content={content} specId={specId} navigate={navigate} />
        <button className="btn ghost" style={{ padding: "6px 10px" }} onClick={() => navigate(`/x/${specId}`)} title="All topics in this specialization">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h10"/></svg>
          all topics
        </button>
      </div>

      <div className="exam-nav">
        <button className="exam-nav-prev" disabled={idx === 0} onClick={() => idx > 0 && navigate(`/x/${specId}/${topics[idx - 1].id}`)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 6-6 6 6 6"/></svg>
        </button>
        <button className="exam-nav-list-btn" onClick={() => setShowJump(true)}>
          <span style={{ fontFamily: "var(--font-mono)" }}>{idx + 1}/{topics.length}</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
        </button>
        <div className="exam-nav-info">
          <span className="en-eyebrow">{spec.id} · topic {topic.n}</span>
          <span className="en-title">{topic.title}</span>
        </div>
        <button className="exam-nav-next" disabled={idx === topics.length - 1} onClick={() => idx < topics.length - 1 && navigate(`/x/${specId}/${topics[idx + 1].id}`)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 6 6 6-6 6"/></svg>
        </button>
      </div>

      <header className="exam-topic-hero" style={{ "--h": spec.hue }}>
        <div className="exam-topic-hero-eyebrow">
          <span className="exam-topic-hero-spec">{spec.id}</span>
          <span className="exam-topic-hero-sep">·</span>
          <span>okruh č. {topic.n} / {topics.length}</span>
        </div>
        <h1 className="exam-topic-hero-title">{topic.title}</h1>
      </header>

      {topic.sharedWith && topic.sharedWith.length > 0 && (
        <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Also in exam for:</span>
          {topic.sharedWith.map((sid) => (
            <button key={sid} className="chip spec" style={{ "--h": (content.findSpec(sid) || {}).hue || 264, cursor: "default" }}
              onClick={() => {
                const otherTopics = content.EXAM_TOPICS[sid] || [];
                const match = otherTopics.find((o) => o.title === topic.title)
                  || otherTopics.find((o) => o.refs.some((r) => topic.refs.some((tr) => tr[0] === r[0] && tr[1] === r[1] && tr[2] === r[2])));
                if (match) navigate(`/x/${sid}/${match.id}`); else navigate(`/x/${sid}`);
              }}>{sid}</button>
          ))}
        </div>
      )}

      {(() => {
        const resolved = topic.refs.filter(([c, tp, s]) => {
          const r = content.findSubtopic(c, tp, s);
          return !!(r && r.sub);
        });
        if (resolved.length > 0) return null;
        const hasResources = topic.resources && topic.resources.length > 0;
        return (
          <div className="unavail-banner">
            <strong>{hasResources ? "No in-app study material yet" : "Content not yet available."}</strong>{" "}
            {hasResources
              ? <>— this exam topic is in the PDF but hasn't been authored in the app. Curated external references are listed below to get you started.</>
              : <>This exam topic is listed in the official PDF (<em>{spec.id} — okruh č.&nbsp;{topic.n}</em>) but no study material has been authored for it in this app yet.</>}
            {topic.sharedWith && topic.sharedWith.length > 0 && !hasResources && (
              <> Some <strong>other specializations</strong> may already cover this material — check the related-specs badges above.</>
            )}
          </div>
        );
      })()}

      {topic.refs.map(([cid, tid, sid], i) => {
        const { course, topic: t, sub } = content.findSubtopic(cid, tid, sid);
        if (!sub) return null;
        const key = `${cid}/${tid}/${sid}`;
        const subKey = `sub:${cid}/${tid}/${sid}`;
        const done = set.has(key);
        const subCollapsed = isCollapsed(subKey);
        return (
          <article className="subtopic" key={i} id={`exam-${i}`} data-collapsed={subCollapsed}>
            <header className="subtopic-head">
              <div className="subtopic-title-row">
                <ChevronToggle collapsed={subCollapsed} onClick={() => toggleCollapsed(subKey)} label={sub.title} />
                <button className="subtopic-check" data-checked={done} onClick={() => toggle(key)}>
                  {done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="m5 12 5 5 9-11"/></svg>}
                </button>
                <div onClick={() => toggleCollapsed(subKey)} style={{ cursor: "pointer" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)" }}>{course.id} · {t.title}</div>
                  <h3 className="subtopic-title" style={{ marginTop: 2 }}>
                    {sub.title}
                    {sub.verified && <VerifiedBadge />}
                  </h3>
                </div>
              </div>
              <button className="subtopic-anchor" style={{ opacity: 1 }} onClick={() => navigate(`/c/${cid}/${tid}/${sid}`)}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 17 17 7M7 7h10v10"/></svg>
                open
              </button>
            </header>
            {!subCollapsed && <BlockList blocks={sub.blocks} />}
          </article>
        );
      })}

      {topic.resources && topic.resources.length > 0 && (
        <section className="see-more">
          <header className="see-more-head">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.72"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
            </svg>
            <h3>See more — external resources</h3>
          </header>
          <ul className="see-more-list">
            {topic.resources.map((r, i) => (
              <li key={i}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="see-more-link">
                  <div className="see-more-link-text">
                    <span className="see-more-link-title">{r.title}</span>
                    {r.note && <span className="see-more-link-note">{r.note}</span>}
                  </div>
                  {r.kind && <span className="see-more-kind">{r.kind}</span>}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M7 17 17 7M7 7h10v10"/>
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 32, paddingTop: 24, borderTop: "0.5px solid var(--line)" }}>
        <button className="btn" disabled={idx === 0} onClick={() => idx > 0 && navigate(`/x/${specId}/${topics[idx - 1].id}`)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 6-6 6 6 6"/></svg>
          {idx > 0 ? `Topic ${topics[idx - 1].n}` : "First"}
        </button>
        <button className="btn primary" disabled={idx === topics.length - 1} onClick={() => idx < topics.length - 1 && navigate(`/x/${specId}/${topics[idx + 1].id}`)}>
          {idx < topics.length - 1 ? `Topic ${topics[idx + 1].n}` : "Last"}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 6 6 6-6 6"/></svg>
        </button>
      </div>

      {showJump && (
        <div className="overlay" onClick={() => setShowJump(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head">
              <h3 className="sheet-title">Jump to topic</h3>
              <button className="icon-btn" onClick={() => setShowJump(false)}>×</button>
            </div>
            <div className="exam-topiclist">
              {topics.map((t) => (
                <button key={t.id} className="exam-topic-card" data-active={t.id === topicId}
                  onClick={() => { setShowJump(false); navigate(`/x/${specId}/${t.id}`); }}>
                  <span className="exam-topic-n">{String(t.n).padStart(2, "0")}</span>
                  <span className="exam-topic-title">{t.title}</span>
                  <span className="exam-topic-tags">
                    {t.sharedWith && t.sharedWith.length > 0 && <SpecDots content={content} specs={t.sharedWith} />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
