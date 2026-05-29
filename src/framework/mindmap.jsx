// mindmap.jsx — radial mindmap of a course. If a curated structured mindmap
// (public/content/mindmaps/<COURSE>.json) is provided, render the deeper
// hierarchy: center = course, ring 1 = branches, ring 2 = clusters, ring 3 =
// leaf subtopics. Otherwise fall back to a 2-level auto-layout derived from
// the manifest topic/subtopic structure.
//
// Layout adapts to content density: canvas size, ring radii, and leaf
// staggering are all derived from the total leaf count so a 60-leaf mindmap
// doesn't pack labels on top of each other.

import { useState, useMemo, useRef, useEffect, useCallback } from "react";

// Wrap a label into 1–N lines of roughly equal width, capped at maxChars.
function wrapLabel(text, maxChars = 18, maxLines = 2) {
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

// Compute adaptive canvas + ring radii from total leaf count. Goal: at least
// ~46 px of arc per leaf on the outer ring (after 2-ring stagger doubles
// effective density), so 2-line labels don't collide.
function adaptiveDims(totalLeaves, branchCount) {
  // Each leaf "owns" ~46 px of perimeter on average (the worst case is a
  // densely-packed branch; the stagger gives us extra room there).
  const perimNeeded = Math.max(totalLeaves, 18) * 46;
  // perim = 2π * R_LEAF — solve for R_LEAF, clamp to a sensible range.
  const R_LEAF = Math.max(380, Math.min(620, perimNeeded / (2 * Math.PI)));
  // Branch ring has to fit branchCount chips (each ~150 px wide) without overlap.
  const R_BRANCH = Math.max(180, (branchCount * 150) / (2 * Math.PI));
  const R_CLUSTER = R_LEAF * 0.62;
  const R_STAGGER = 44; // outward offset for every-other leaf
  // Canvas: room for labels (~120 px gutter each side) + chrome.
  const W = Math.round((R_LEAF + R_STAGGER) * 2 + 320);
  const H = Math.round((R_LEAF + R_STAGGER) * 2 + 240);
  return { R_BRANCH, R_CLUSTER, R_LEAF, R_STAGGER, W, H };
}

function MindmapShell({ W, H, children, hint = "drag to pan · scroll to zoom · tap a leaf to open" }) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState([0, 0]);
  const dragRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const CX = W / 2;
  const CY = H / 2;

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

  return (
    <div style={{ position: "relative", border: "0.5px solid var(--line)", borderRadius: "var(--r-lg)", overflow: "hidden", background: "var(--bg-card)" }}>
      <div style={{
        position: "absolute", top: 8, left: 12, zIndex: 5,
        fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--text-faint)",
        textTransform: "uppercase", letterSpacing: "0.06em",
      }}>
        mindmap · {hint}
      </div>
      <div style={{ position: "absolute", top: 6, right: 8, zIndex: 5, display: "flex", gap: 4 }}>
        <button className="icon-btn" onClick={() => setZoom((z) => Math.min(3.5, z * 1.2))} aria-label="zoom in">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M8 11h6M11 8v6"/><path d="m20 20-3.5-3.5"/></svg>
        </button>
        <button className="icon-btn" onClick={() => setZoom((z) => Math.max(0.3, z / 1.2))} aria-label="zoom out">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M8 11h6"/><path d="m20 20-3.5-3.5"/></svg>
        </button>
        <button className="icon-btn" onClick={() => { setZoom(1); setPan([0, 0]); }} aria-label="reset">
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
          <pattern id="mmgrid" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="0.8" fill="var(--line)" />
          </pattern>
          <filter id="softshadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="1" />
            <feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect width={W} height={H} fill="url(#mmgrid)" opacity="0.5" />

        <g transform={`translate(${pan[0]} ${pan[1]}) translate(${CX} ${CY}) scale(${zoom}) translate(${-CX} ${-CY})`}>
          {children}
        </g>
      </svg>
    </div>
  );
}

// Pick a text-anchor based on the leaf's angle. We split the circle into 4
// 90°-wide quadrants so labels never sit in awkward middle-ground.
function anchorForAngle(angle) {
  const cos = Math.cos(angle);
  if (cos > 0.3) return "start";
  if (cos < -0.3) return "end";
  return "middle";
}

/* ─── structured 4-level mindmap (course → branch → cluster → leaf) ──── */
function StructuredMindmap({ data, course, completedSet, onNavigate, findSubtopicById }) {
  const branches = data.branches || [];
  const totalLeaves = branches.reduce(
    (s, b) => s + (b.clusters || []).reduce((sc, c) => sc + (c.leaves?.length || 0), 0),
    0
  ) || 1;

  const { R_BRANCH, R_CLUSTER, R_LEAF, R_STAGGER, W, H } = useMemo(
    () => adaptiveDims(totalLeaves, branches.length || 1),
    [totalLeaves, branches.length]
  );
  const CX = W / 2;
  const CY = H / 2;

  // Each branch gets angular span ∝ its leaf count, with a small gap on
  // either side so the branch chips don't visually collide.
  const branchRanges = useMemo(() => {
    const BRANCH_GAP = 0.035; // ~2° gap each side
    let acc = -Math.PI / 2;
    return branches.map((b) => {
      const totalBranchLeaves = (b.clusters || []).reduce((sc, c) => sc + (c.leaves?.length || 0), 0) || 1;
      const span = (totalBranchLeaves / totalLeaves) * Math.PI * 2;
      const from = acc + BRANCH_GAP;
      const to = acc + span - BRANCH_GAP;
      acc = acc + span;
      return { branch: b, from, to, mid: (from + to) / 2, totalBranchLeaves };
    });
  }, [branches, totalLeaves]);

  const [hover, setHover] = useState(null);

  const resolveLeaf = useCallback((ref) => {
    const found = findSubtopicById ? findSubtopicById(ref) : null;
    if (found) return { id: ref, title: found.sub.title || ref, courseId: found.courseId, topicId: found.topicId };
    for (const t of course.topics) {
      for (const s of t.subtopics) {
        if (s.id === ref) return { id: ref, title: s.title || ref, courseId: course.id, topicId: t.id };
      }
    }
    return null;
  }, [findSubtopicById, course]);

  return (
    <MindmapShell W={W} H={H}>
      {branchRanges.map((br, bi) => {
        const branch = br.branch;
        const hue = branch.hue ?? (264 + bi * (360 / Math.max(1, branches.length)));
        const color = `oklch(0.62 0.14 ${hue})`;
        const colorSoft = `oklch(0.62 0.14 ${hue} / 0.12)`;
        const colorLine = `oklch(0.62 0.14 ${hue} / 0.55)`;

        const bx = CX + Math.cos(br.mid) * R_BRANCH;
        const by = CY + Math.sin(br.mid) * R_BRANCH;

        // Distribute clusters within the branch's angular span proportional
        // to their leaf count, with a small padding so cluster pills breathe.
        const branchSpan = Math.max(0.3, br.to - br.from);
        const clusters = branch.clusters || [];
        const clusterRanges = clusters.map((cl) => {
          const leafCount = (cl.leaves || []).length || 1;
          return { cl, leafCount, weight: leafCount };
        });
        const totalW = clusterRanges.reduce((s, x) => s + x.weight, 0) || 1;
        // Pad both ends by 4% of the branch span so adjacent branch chips
        // don't visually collide with the first/last cluster.
        let cAcc = br.from + branchSpan * 0.04;
        const usable = branchSpan * 0.92;
        for (const cr of clusterRanges) {
          cr.from = cAcc;
          cr.span = (cr.weight / totalW) * usable;
          cr.to = cAcc + cr.span;
          cr.mid = (cr.from + cr.to) / 2;
          cAcc = cr.to;
        }

        return (
          <g key={branch.id}>
            {/* center → branch spoke */}
            <path
              d={`M${CX} ${CY} Q ${(CX + bx) / 2 - Math.sin(br.mid) * 18} ${(CY + by) / 2 + Math.cos(br.mid) * 18} ${bx} ${by}`}
              stroke={color} strokeWidth="2" fill="none" opacity="0.78"
            />

            {clusterRanges.map((cr) => {
              const cl = cr.cl;
              const cx = CX + Math.cos(cr.mid) * R_CLUSTER;
              const cy = CY + Math.sin(cr.mid) * R_CLUSTER;
              const leaves = cl.leaves || [];

              // Within a cluster, place leaves across its arc with a tiny
              // edge buffer so they don't visually touch the cluster pill.
              const leafEdgePad = Math.min(0.06, cr.span * 0.10);
              const leafFrom = cr.from + leafEdgePad;
              const leafTo = cr.to - leafEdgePad;
              const leafSpan = Math.max(0.0001, leafTo - leafFrom);

              return (
                <g key={cl.id}>
                  {/* branch → cluster spoke */}
                  <path
                    d={`M${bx} ${by} Q ${(bx + cx) / 2 + Math.cos(cr.mid) * 8} ${(by + cy) / 2 + Math.sin(cr.mid) * 8} ${cx} ${cy}`}
                    stroke={color} strokeWidth="1.3" fill="none" opacity="0.55"
                  />

                  {leaves.map((leaf, li) => {
                    const ref = leaf.ref;
                    const resolved = resolveLeaf(ref);
                    const n = leaves.length;
                    const a = n === 1
                      ? cr.mid
                      : leafFrom + (li / (n - 1)) * leafSpan;
                    // Stagger every other leaf radially — doubles the effective
                    // density of the outer ring so labels don't collide.
                    const r = R_LEAF + (li % 2 === 1 ? R_STAGGER : 0);
                    const lx = CX + Math.cos(a) * r;
                    const ly = CY + Math.sin(a) * r;
                    const cos = Math.cos(a), sin = Math.sin(a);
                    const labelGap = 14;
                    const tx = lx + cos * labelGap;
                    const ty = ly + sin * labelGap;
                    const anchor = anchorForAngle(a);
                    const isHover = hover && hover.bid === branch.id && hover.cid === cl.id && hover.lid === ref;
                    const labelText = leaf.label || (resolved ? resolved.title : ref);
                    const lines = wrapLabel(labelText, 20, 2);
                    const done = resolved && completedSet.has(`${resolved.courseId}/${resolved.topicId}/${resolved.id}`);

                    return (
                      <g
                        key={ref}
                        style={{ cursor: resolved ? "pointer" : "not-allowed" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (resolved) onNavigate(resolved.courseId, resolved.topicId, resolved.id);
                        }}
                        onMouseEnter={() => setHover({ bid: branch.id, cid: cl.id, lid: ref })}
                        onMouseLeave={() => setHover(null)}
                      >
                        <path
                          d={`M${cx} ${cy} Q ${(cx + lx) / 2 + cos * 6} ${(cy + ly) / 2 + sin * 6} ${lx} ${ly}`}
                          stroke={color} strokeWidth={isHover ? 1.8 : 0.9} fill="none"
                          opacity={isHover ? 0.95 : 0.42}
                        />
                        <circle cx={lx} cy={ly} r={isHover ? 8 : 6}
                          fill={done ? color : "var(--bg-card)"}
                          stroke={color} strokeWidth="1.4"
                          filter={isHover ? "url(#softshadow)" : undefined}
                        />
                        {done && (
                          <path d={`M${lx - 2.6} ${ly} L${lx - 0.4} ${ly + 2.2} L${lx + 2.6} ${ly - 2.2}`}
                            stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        )}
                        {lines.map((ln, i) => (
                          <text key={i}
                            x={tx} y={ty + i * 13 - (lines.length - 1) * 6.5}
                            textAnchor={anchor} dominantBaseline="middle"
                            fontSize="11.5" fontFamily="var(--font-sans)"
                            fontWeight={isHover ? 600 : 500}
                            fill={isHover ? color : "var(--text)"}
                            style={{ paintOrder: "stroke" }}
                            stroke="var(--bg-card)" strokeWidth="3" strokeLinejoin="round">
                            {ln}
                          </text>
                        ))}
                        {lines.map((ln, i) => (
                          <text key={`f${i}`}
                            x={tx} y={ty + i * 13 - (lines.length - 1) * 6.5}
                            textAnchor={anchor} dominantBaseline="middle"
                            fontSize="11.5" fontFamily="var(--font-sans)"
                            fontWeight={isHover ? 600 : 500}
                            fill={isHover ? color : "var(--text)"}>
                            {ln}
                          </text>
                        ))}
                      </g>
                    );
                  })}

                  {/* cluster pill */}
                  <g>
                    <rect x={cx - 70} y={cy - 13} width="140" height="26" rx="13"
                      fill="var(--bg-card)" stroke={colorLine} strokeWidth="1.3"
                      filter="url(#softshadow)"
                    />
                    <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="middle"
                      fontSize="11.5" fontWeight="600" fontFamily="var(--font-sans)" fill={color}>
                      {cl.label.length > 22 ? cl.label.slice(0, 21) + "…" : cl.label}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* branch chip */}
            <g style={{ cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                const firstLeaf = (branch.clusters?.[0]?.leaves?.[0]?.ref);
                if (!firstLeaf) return;
                const r = resolveLeaf(firstLeaf);
                if (r) onNavigate(r.courseId, r.topicId, r.id);
              }}>
              <rect
                x={bx - 78} y={by - 16} width="156" height="32" rx="16"
                fill={colorSoft} stroke={color} strokeWidth="1.6"
                filter="url(#softshadow)"
              />
              <text x={bx} y={by + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="12.5" fontWeight="700" fontFamily="var(--font-sans)" fill={color}>
                {branch.label.length > 22 ? branch.label.slice(0, 21) + "…" : branch.label}
              </text>
            </g>
          </g>
        );
      })}

      {/* center */}
      <circle cx={CX} cy={CY} r={64} fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="2.5" filter="url(#softshadow)" />
      <text x={CX} y={CY - 9} textAnchor="middle" dominantBaseline="middle"
        fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--text-faint)">
        {course.id}
      </text>
      <text x={CX} y={CY + 11} textAnchor="middle" dominantBaseline="middle"
        fontSize="11.5" fontWeight="600" fill="var(--text)">
        {branches.length} větví
      </text>
    </MindmapShell>
  );
}

/* ─── legacy 2-level auto-layout (no structured mindmap data) ────────── */
function AutoMindmap({ course, completedSet, onNavigate }) {
  const topics = course.topics;
  const totalSubs = topics.reduce((s, t) => s + t.subtopics.length, 0) || 1;
  const { R_BRANCH, R_LEAF, R_STAGGER, W, H } = useMemo(
    () => adaptiveDims(totalSubs, topics.length || 1),
    [totalSubs, topics.length]
  );
  const CX = W / 2;
  const CY = H / 2;

  const ranges = useMemo(() => {
    const TOPIC_GAP = 0.04;
    let acc = -Math.PI / 2;
    return topics.map((t) => {
      const span = (t.subtopics.length / totalSubs) * Math.PI * 2;
      const from = acc + TOPIC_GAP;
      const to = acc + span - TOPIC_GAP;
      acc = acc + span;
      return { topic: t, from, to, mid: (from + to) / 2 };
    });
  }, [topics, totalSubs]);

  const hueFor = (i) => 264 + i * (360 / Math.max(1, topics.length));
  const [hover, setHover] = useState(null);

  return (
    <MindmapShell W={W} H={H}>
      {ranges.map((r, ti) => {
        const tx = CX + Math.cos(r.mid) * R_BRANCH;
        const ty = CY + Math.sin(r.mid) * R_BRANCH;
        const hue = hueFor(ti);
        const color = `oklch(0.62 0.14 ${hue})`;
        const colorSoft = `oklch(0.62 0.14 ${hue} / 0.10)`;
        const span = Math.max(0.001, r.to - r.from);
        const innerPad = Math.min(0.06, span * 0.10);
        const leafFrom = r.from + innerPad;
        const leafTo = r.to - innerPad;
        const leafSpan = Math.max(0.0001, leafTo - leafFrom);

        return (
          <g key={r.topic.id}>
            <path
              d={`M${CX} ${CY} Q ${(CX + tx) / 2} ${(CY + ty) / 2} ${tx} ${ty}`}
              stroke={color} strokeWidth="1.5" fill="none" opacity="0.7"
            />

            {r.topic.subtopics.map((sub, si) => {
              const subCount = r.topic.subtopics.length;
              const a = subCount === 1
                ? r.mid
                : leafFrom + (si / (subCount - 1)) * leafSpan;
              const rad = R_LEAF + (si % 2 === 1 ? R_STAGGER : 0);
              const sx = CX + Math.cos(a) * rad;
              const sy = CY + Math.sin(a) * rad;
              const done = completedSet.has(`${course.id}/${r.topic.id}/${sub.id}`);
              const isHover = hover && hover.tid === r.topic.id && hover.sid === sub.id;

              const cos = Math.cos(a), sin = Math.sin(a);
              const labelOffset = 14;
              const lx = sx + cos * labelOffset;
              const ly = sy + sin * labelOffset;
              const anchor = anchorForAngle(a);
              const lines = wrapLabel(sub.title || sub.id, 20, 2);

              return (
                <g
                  key={sub.id}
                  style={{ cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); onNavigate(course.id, r.topic.id, sub.id); }}
                  onMouseEnter={() => setHover({ tid: r.topic.id, sid: sub.id })}
                  onMouseLeave={() => setHover(null)}
                >
                  <path
                    d={`M${tx} ${ty} Q ${(tx + sx) / 2 + cos * 8} ${(ty + sy) / 2 + sin * 8} ${sx} ${sy}`}
                    stroke={color} strokeWidth={isHover ? 2 : 1} fill="none"
                    opacity={isHover ? 0.95 : 0.55}
                  />
                  <circle cx={sx} cy={sy} r={isHover ? 9 : 7}
                    fill={done ? color : "var(--bg-card)"}
                    stroke={color} strokeWidth="1.5"
                    filter={isHover ? "url(#softshadow)" : undefined}
                  />
                  {done && (
                    <path d={`M${sx - 3} ${sy} L${sx - 0.5} ${sy + 2.5} L${sx + 3} ${sy - 2.5}`}
                      stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                  {lines.map((ln, i) => (
                    <text key={`bg${i}`} x={lx} y={ly + i * 13 - (lines.length - 1) * 6.5}
                      textAnchor={anchor} dominantBaseline="middle"
                      fontSize="11.5" fontFamily="var(--font-sans)"
                      fontWeight={isHover ? 600 : 500}
                      style={{ paintOrder: "stroke" }}
                      stroke="var(--bg-card)" strokeWidth="3" strokeLinejoin="round"
                      fill={isHover ? color : "var(--text)"}>
                      {ln}
                    </text>
                  ))}
                  {lines.map((ln, i) => (
                    <text key={i} x={lx} y={ly + i * 13 - (lines.length - 1) * 6.5}
                      textAnchor={anchor} dominantBaseline="middle"
                      fontSize="11.5" fontFamily="var(--font-sans)"
                      fontWeight={isHover ? 600 : 500}
                      fill={isHover ? color : "var(--text)"}>
                      {ln}
                    </text>
                  ))}
                </g>
              );
            })}

            <g style={{ cursor: "pointer" }}
              onClick={(e) => { e.stopPropagation(); onNavigate(course.id, r.topic.id, r.topic.subtopics[0]?.id); }}>
              <rect
                x={tx - 72} y={ty - 15} width="144" height="30" rx="15"
                fill={colorSoft} stroke={color} strokeWidth="1.5"
                filter="url(#softshadow)"
              />
              <text x={tx} y={ty + 1} textAnchor="middle" dominantBaseline="middle"
                fontSize="12" fontWeight="600" fontFamily="var(--font-sans)" fill={color}>
                {r.topic.title.length > 22 ? r.topic.title.slice(0, 21) + "…" : r.topic.title}
              </text>
            </g>
          </g>
        );
      })}

      <circle cx={CX} cy={CY} r={56} fill="var(--bg-card)" stroke="var(--accent)" strokeWidth="2" filter="url(#softshadow)" />
      <text x={CX} y={CY - 7} textAnchor="middle" dominantBaseline="middle"
        fontFamily="var(--font-mono)" fontSize="12" fill="var(--text-faint)">
        {course.id}
      </text>
      <text x={CX} y={CY + 10} textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontWeight="600" fill="var(--text)">
        {course.topics.length} topics
      </text>
    </MindmapShell>
  );
}

export function Mindmap({ course, completedSet, onNavigate, content }) {
  const data = content && content.findMindmap ? content.findMindmap(course.id) : null;
  const findSubtopicById = content && content.findSubtopicById ? content.findSubtopicById : null;

  if (data && data.branches && data.branches.length > 0) {
    return (
      <StructuredMindmap
        data={data}
        course={course}
        completedSet={completedSet}
        onNavigate={onNavigate}
        findSubtopicById={findSubtopicById}
      />
    );
  }
  return (
    <AutoMindmap
      course={course}
      completedSet={completedSet}
      onNavigate={onNavigate}
    />
  );
}
