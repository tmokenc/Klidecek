// global-mindmap.jsx — cross-course mindmap. Shows conceptual domains
// (Cryptography, Networking, Theory of computation, …) as inner ring chips,
// the courses that contribute to each domain as outer-ring chips, the most
// emblematic subtopics inside each course as small leaf dots, and "bridge"
// arcs connecting subtopics in different domains that build on the same
// concept (e.g. AVS spekulace-vyjimky → BIS hw-zranitelnosti: Spectre).
//
// Canvas + ring radii adapt to the number of domains, courses, and
// highlights so labels don't pile up.

import { useState, useMemo, useRef, useEffect } from "react";

function wrap(text, maxChars = 16, maxLines = 2) {
  const words = (text || "").split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars) {
      if (line) lines.push(line.trim());
      line = w;
    } else {
      line += " " + w;
    }
  }
  if (line.trim()) lines.push(line.trim());
  if (lines.length <= maxLines) return lines;
  const head = lines.slice(0, maxLines - 1);
  head.push(lines.slice(maxLines - 1).join(" ").slice(0, maxChars - 1) + "…");
  return head;
}

function anchorForAngle(angle) {
  const cos = Math.cos(angle);
  if (cos > 0.3) return "start";
  if (cos < -0.3) return "end";
  return "middle";
}

// Adaptive layout: scale all radii + canvas to the largest population on
// each ring. Domain chips need ~190 px wide; course chips ~70 px; leaves
// need ~26 px arc each (they wrap on hover so they're tighter than in the
// per-course map).
function globalDims(domainCount, maxCoursesPerDomain, maxLeavesPerCourse) {
  const R_DOMAIN  = Math.max(220, (domainCount * 200) / (2 * Math.PI));
  const R_COURSE  = R_DOMAIN + Math.max(180, (domainCount * maxCoursesPerDomain * 75) / (2 * Math.PI));
  const R_LEAF    = R_COURSE + Math.max(110, maxLeavesPerCourse * 16);
  const W = Math.round(R_LEAF * 2 + 320);
  const H = Math.round(R_LEAF * 2 + 240);
  return { R_DOMAIN, R_COURSE, R_LEAF, W, H };
}

export function GlobalMindmap({ data, content, completedSet, navigate }) {
  const domains = data.domains || [];
  const bridges = data.bridges || [];

  const maxCoursesPerDomain = Math.max(1, ...domains.map((d) => (d.courses || []).length));
  const maxLeavesPerCourse = Math.max(
    1,
    ...domains.flatMap((d) => (d.courses || []).map((c) => (c.highlights || []).length))
  );
  const { R_DOMAIN, R_COURSE, R_LEAF, W, H } = useMemo(
    () => globalDims(domains.length, maxCoursesPerDomain, maxLeavesPerCourse),
    [domains.length, maxCoursesPerDomain, maxLeavesPerCourse]
  );
  const CX = W / 2;
  const CY = H / 2;

  const [zoom, setZoom] = useState(0.7);
  const [pan, setPan] = useState([0, 0]);
  const [hoverDomain, setHoverDomain] = useState(null);
  const [hoverBridge, setHoverBridge] = useState(null);
  const [hoverNode, setHoverNode] = useState(null); // { kind: "leaf"|"course", id }
  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  // Layout: each domain gets an angular slice ∝ its course count (heavier
  // domains get more room). Within a slice, courses span 70%, leaves span
  // the cluster's 80%. Small gaps between domains keep chips legible.
  const layout = useMemo(() => {
    const totalCourses = domains.reduce((s, d) => s + (d.courses || []).length, 0) || 1;
    const DOMAIN_GAP = 0.04; // ~2.3°
    let acc = -Math.PI / 2;
    return domains.map((dom, i) => {
      const cN = (dom.courses || []).length || 1;
      const sliceAngle = (cN / totalCourses) * Math.PI * 2;
      const from = acc + DOMAIN_GAP;
      const to = acc + sliceAngle - DOMAIN_GAP;
      const mid = (from + to) / 2;
      const span = Math.max(0.001, to - from);
      acc = acc + sliceAngle;

      const dx = CX + Math.cos(mid) * R_DOMAIN;
      const dy = CY + Math.sin(mid) * R_DOMAIN;

      const courses = (dom.courses || []).map((cm, ci, arr) => {
        const courseN = arr.length;
        // Courses span 80% of the slice
        const courseSpan = span * 0.8;
        const a = courseN === 1
          ? mid
          : (mid - courseSpan / 2) + (ci / (courseN - 1)) * courseSpan;
        // Course-weight pulls the chip inward (heavier = closer to its domain)
        const courseRadius = R_COURSE - (1 - (cm.weight ?? 1)) * (R_LEAF - R_COURSE) * 0.45;
        const cx = CX + Math.cos(a) * courseRadius;
        const cy = CY + Math.sin(a) * courseRadius;

        const highlights = (cm.highlights || []).map((hl, hi, hlArr) => {
          const hN = hlArr.length;
          // Each course owns a sub-arc of its parent slice, leaves spread
          // within. Wider for crowded courses so highlights don't pile up.
          const perCourse = courseSpan / Math.max(1, courseN);
          const hSpan = Math.max(0.18, perCourse * 0.85);
          const ha = hN === 1
            ? a
            : (a - hSpan / 2) + (hi / (hN - 1)) * hSpan;
          // Stagger every other leaf radially for breathing room
          const rad = R_LEAF + (hi % 2 === 1 ? 28 : 0);
          const hx = CX + Math.cos(ha) * rad;
          const hy = CY + Math.sin(ha) * rad;
          return { ...hl, angle: ha, x: hx, y: hy };
        });

        return { ...cm, angle: a, x: cx, y: cy, highlights };
      });

      return { ...dom, sliceFrom: from, sliceTo: to, mid, x: dx, y: dy, courses };
    });
  }, [domains, CX, CY, R_DOMAIN, R_COURSE, R_LEAF]);

  const findSub = content && content.findSubtopicById ? content.findSubtopicById : () => null;

  const bridgeArcs = useMemo(() => {
    const findEndpoint = (ep) => {
      const dom = layout.find((d) => d.id === ep.domain);
      if (!dom) return null;
      for (const c of dom.courses) {
        const hl = c.highlights.find((h) => h.ref === ep.ref);
        if (hl) return { x: hl.x, y: hl.y, courseId: c.id, ref: ep.ref, hue: dom.hue };
      }
      return null;
    };
    return bridges.map((b) => {
      const from = findEndpoint(b.from);
      const to = findEndpoint(b.to);
      if (!from || !to) return null;
      return { ...b, from, to };
    }).filter(Boolean);
  }, [layout, bridges]);

  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.3, Math.min(3.5, z * delta)));
  };

  const onPanStart = (e) => {
    const p = e.touches ? e.touches[0] : e;
    dragRef.current = { x: p.clientX, y: p.clientY, px: pan[0], py: pan[1] };
    setDragging(true);
  };

  useEffect(() => {
    const move = (e) => {
      if (!dragRef.current) return;
      const p = e.touches ? e.touches[0] : e;
      setPan([
        dragRef.current.px + (p.clientX - dragRef.current.x),
        dragRef.current.py + (p.clientY - dragRef.current.y),
      ]);
    };
    const up = () => { dragRef.current = null; setDragging(false); };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, []);

  const navigateToLeaf = (ref) => {
    const found = findSub(ref);
    if (found) navigate(`/c/${found.courseId}/${found.topicId}/${ref}`);
  };
  const navigateToCourse = (cid) => {
    navigate(`/c/${cid}`);
  };

  const bridgeIsActive = (b) => {
    if (hoverBridge === b.id) return true;
    if (hoverNode && hoverNode.kind === "leaf") {
      return b.from.ref === hoverNode.id || b.to.ref === hoverNode.id;
    }
    return false;
  };

  return (
    <div style={{ position: "relative", border: "0.5px solid var(--line)", borderRadius: "var(--r-lg)", overflow: "hidden", background: "var(--bg-card)" }}>
      <div style={{
        position: "absolute", top: 8, left: 12, zIndex: 5,
        fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)",
        textTransform: "uppercase", letterSpacing: "0.06em",
      }}>
        global mindmap · drag · scroll-zoom · {bridges.length} mostů přes obory
      </div>
      <div style={{ position: "absolute", top: 6, right: 8, zIndex: 5, display: "flex", gap: 4 }}>
        <button className="icon-btn" onClick={() => setZoom((z) => Math.min(3.5, z * 1.2))} aria-label="zoom in">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M8 11h6M11 8v6"/><path d="m20 20-3.5-3.5"/></svg>
        </button>
        <button className="icon-btn" onClick={() => setZoom((z) => Math.max(0.3, z / 1.2))} aria-label="zoom out">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M8 11h6"/><path d="m20 20-3.5-3.5"/></svg>
        </button>
        <button className="icon-btn" onClick={() => { setZoom(0.7); setPan([0, 0]); }} aria-label="reset">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5"/></svg>
        </button>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block", width: "100%", touchAction: "none", cursor: dragging ? "grabbing" : "grab", aspectRatio: `${W}/${H}` }}
        onWheel={onWheel}
        onMouseDown={onPanStart}
        onTouchStart={onPanStart}
      >
        <defs>
          <pattern id="gmgrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="0.8" fill="var(--line)" />
          </pattern>
          <filter id="gmshadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.4" />
            <feOffset dx="0" dy="1.5" />
            <feComponentTransfer><feFuncA type="linear" slope="0.20" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect width={W} height={H} fill="url(#gmgrid)" opacity="0.6" />

        <g transform={`translate(${pan[0]} ${pan[1]}) translate(${CX} ${CY}) scale(${zoom}) translate(${-CX} ${-CY})`}>
          {/* Bridges first — they should sit beneath all nodes */}
          {bridgeArcs.map((b) => {
            const active = bridgeIsActive(b);
            const dx = b.to.x - b.from.x;
            const dy = b.to.y - b.from.y;
            const mid = { x: (b.from.x + b.to.x) / 2, y: (b.from.y + b.to.y) / 2 };
            const dist = Math.hypot(dx, dy);
            const toCenter = { x: CX - mid.x, y: CY - mid.y };
            const cLen = Math.hypot(toCenter.x, toCenter.y) || 1;
            const curve = Math.min(200, dist * 0.35);
            const cp = {
              x: mid.x + (toCenter.x / cLen) * curve,
              y: mid.y + (toCenter.y / cLen) * curve,
            };
            const hue = b.from.hue ?? 200;
            const stroke = active ? `oklch(0.65 0.18 ${hue})` : `oklch(0.65 0.10 ${hue} / 0.30)`;
            return (
              <g key={b.id}
                style={{ cursor: "help" }}
                onMouseEnter={() => setHoverBridge(b.id)}
                onMouseLeave={() => setHoverBridge(null)}
              >
                <path d={`M${b.from.x} ${b.from.y} Q ${cp.x} ${cp.y} ${b.to.x} ${b.to.y}`}
                  stroke={stroke} strokeWidth={active ? 2.2 : 1.1} fill="none"
                  strokeDasharray={active ? "0" : "3 3"}
                  opacity={active ? 1 : 0.7}
                />
                {active && (
                  <g>
                    <rect x={cp.x - 100} y={cp.y - 13} width="200" height="26" rx="13"
                      fill="var(--bg-card)" stroke={`oklch(0.65 0.16 ${hue})`} strokeWidth="1"
                      filter="url(#gmshadow)" />
                    <text x={cp.x} y={cp.y + 1} textAnchor="middle" dominantBaseline="middle"
                      fontSize="11.5" fontFamily="var(--font-sans)" fontWeight="600"
                      fill={`oklch(0.45 0.15 ${hue})`}>
                      {b.label.length > 32 ? b.label.slice(0, 31) + "…" : b.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Domains, courses and leaves */}
          {layout.map((dom, di) => {
            const hue = dom.hue ?? (264 + di * (360 / Math.max(1, layout.length)));
            const color = `oklch(0.62 0.16 ${hue})`;
            const colorSoft = `oklch(0.62 0.16 ${hue} / 0.14)`;
            const isHov = hoverDomain === dom.id;

            return (
              <g key={dom.id}>
                <path d={`M${CX} ${CY} L ${dom.x} ${dom.y}`}
                  stroke={color} strokeWidth={isHov ? 2.5 : 1.5} fill="none" opacity={isHov ? 1 : 0.55} />

                {dom.courses.map((c) => {
                  const cSpec = content && content.findCourse ? content.findCourse(c.id) : null;
                  const isCourseHov = hoverNode && hoverNode.kind === "course" && hoverNode.id === c.id;

                  return (
                    <g key={`${dom.id}:${c.id}`}>
                      <path d={`M${dom.x} ${dom.y} Q ${(dom.x + c.x) / 2 + Math.cos(c.angle) * 6} ${(dom.y + c.y) / 2 + Math.sin(c.angle) * 6} ${c.x} ${c.y}`}
                        stroke={color} strokeWidth={isCourseHov ? 2 : 1} fill="none" opacity={isCourseHov ? 0.95 : 0.5} />

                      {c.highlights.map((hl) => {
                        const isLeafHov = hoverNode && hoverNode.kind === "leaf" && hoverNode.id === hl.ref;
                        const cos = Math.cos(hl.angle), sin = Math.sin(hl.angle);
                        const found = findSub(hl.ref);
                        const done = found && completedSet.has(`${found.courseId}/${found.topicId}/${hl.ref}`);
                        const labelText = hl.label || (found ? found.sub.title : hl.ref);
                        const labelOffset = 12;
                        const lx = hl.x + cos * labelOffset;
                        const ly = hl.y + sin * labelOffset;
                        const anchor = anchorForAngle(hl.angle);
                        const lines = wrap(labelText, 16, 2);

                        return (
                          <g key={`${c.id}:${hl.ref}`}
                            style={{ cursor: "pointer" }}
                            onClick={(e) => { e.stopPropagation(); navigateToLeaf(hl.ref); }}
                            onMouseEnter={() => setHoverNode({ kind: "leaf", id: hl.ref })}
                            onMouseLeave={() => setHoverNode(null)}
                          >
                            <path d={`M${c.x} ${c.y} L ${hl.x} ${hl.y}`}
                              stroke={color} strokeWidth={isLeafHov ? 1.5 : 0.7} fill="none" opacity={isLeafHov ? 0.85 : 0.32} />
                            <circle cx={hl.x} cy={hl.y} r={isLeafHov ? 7 : 5}
                              fill={done ? color : "var(--bg-card)"}
                              stroke={color} strokeWidth="1.3"
                              filter={isLeafHov ? "url(#gmshadow)" : undefined}
                            />
                            {done && (
                              <path d={`M${hl.x - 2.4} ${hl.y} L${hl.x - 0.3} ${hl.y + 2} L${hl.x + 2.4} ${hl.y - 2}`}
                                stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            )}
                            {isLeafHov && lines.map((ln, i) => (
                              <text key={`bg${i}`}
                                x={lx} y={ly + i * 12 - (lines.length - 1) * 6}
                                textAnchor={anchor} dominantBaseline="middle"
                                fontSize="11.5" fontFamily="var(--font-sans)" fontWeight="600"
                                style={{ paintOrder: "stroke" }}
                                stroke="var(--bg-card)" strokeWidth="3" strokeLinejoin="round"
                                fill={color}>
                                {ln}
                              </text>
                            ))}
                            {isLeafHov && lines.map((ln, i) => (
                              <text key={i}
                                x={lx} y={ly + i * 12 - (lines.length - 1) * 6}
                                textAnchor={anchor} dominantBaseline="middle"
                                fontSize="11.5" fontFamily="var(--font-sans)" fontWeight="600"
                                fill={color}>
                                {ln}
                              </text>
                            ))}
                          </g>
                        );
                      })}

                      {/* course chip */}
                      <g
                        style={{ cursor: "pointer" }}
                        onClick={(e) => { e.stopPropagation(); navigateToCourse(c.id); }}
                        onMouseEnter={() => setHoverNode({ kind: "course", id: c.id })}
                        onMouseLeave={() => setHoverNode(null)}
                      >
                        <circle cx={c.x} cy={c.y} r={isCourseHov ? 28 : 24}
                          fill="var(--bg-card)" stroke={color} strokeWidth={isCourseHov ? 2.5 : 2}
                          filter="url(#gmshadow)" />
                        <text x={c.x} y={c.y - 2} textAnchor="middle" dominantBaseline="middle"
                          fontSize="11.5" fontFamily="var(--font-mono)" fontWeight="700" fill={color}>
                          {c.id}
                        </text>
                        <text x={c.x} y={c.y + 10} textAnchor="middle" dominantBaseline="middle"
                          fontSize="9" fontFamily="var(--font-sans)" fill="var(--text-faint)">
                          {cSpec ? `${cSpec.topics.reduce((s, t) => s + t.subtopics.length, 0)}` : ""}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* domain chip */}
                <g
                  style={{ cursor: "default" }}
                  onMouseEnter={() => setHoverDomain(dom.id)}
                  onMouseLeave={() => setHoverDomain(null)}
                >
                  <rect x={dom.x - 92} y={dom.y - 19} width="184" height="38" rx="19"
                    fill={colorSoft} stroke={color} strokeWidth="1.8"
                    filter="url(#gmshadow)" />
                  <text x={dom.x} y={dom.y - 4} textAnchor="middle" dominantBaseline="middle"
                    fontSize="12.5" fontFamily="var(--font-sans)" fontWeight="700" fill={color}>
                    {dom.label.length > 26 ? dom.label.slice(0, 25) + "…" : dom.label}
                  </text>
                  <text x={dom.x} y={dom.y + 10} textAnchor="middle" dominantBaseline="middle"
                    fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--text-faint)">
                    {dom.courses.map((c) => c.id).join(" · ")}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Center anchor */}
          <circle cx={CX} cy={CY} r={70} fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="2.5" filter="url(#gmshadow)" />
          <text x={CX} y={CY - 14} textAnchor="middle" dominantBaseline="middle"
            fontFamily="var(--font-mono)" fontSize="10" fill="var(--text-faint)" letterSpacing="0.08em">
            FIT MIT
          </text>
          <text x={CX} y={CY + 2} textAnchor="middle" dominantBaseline="middle"
            fontSize="13" fontFamily="var(--font-sans)" fontWeight="700" fill="var(--text)">
            {(content && content.COURSES) ? content.COURSES.length : 13} kurzů
          </text>
          <text x={CX} y={CY + 18} textAnchor="middle" dominantBaseline="middle"
            fontSize="10.5" fontFamily="var(--font-sans)" fill="var(--text-muted)">
            {domains.length} domén · {bridges.length} mostů
          </text>
        </g>
      </svg>

      {/* legend / context strip */}
      <div style={{
        padding: "10px 14px",
        borderTop: "0.5px solid var(--line)",
        background: "var(--bg-inset)",
        fontSize: 12,
        color: "var(--text-muted)",
        display: "flex",
        gap: 18,
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-faint)" }}>
          legenda
        </span>
        <span><b style={{ color: "var(--text)" }}>Doména</b> — konceptuální oblast napříč kurzy</span>
        <span><b style={{ color: "var(--text)" }}>Kurz</b> — uzel s vahou v doméně (silnější = bližší)</span>
        <span><b style={{ color: "var(--text)" }}>Leaf</b> — emblematický subtopic v kurzu (hover pro popis)</span>
        <span><b style={{ color: "var(--text)" }}>Most</b> — sdílený koncept mezi doménami</span>
      </div>
    </div>
  );
}
