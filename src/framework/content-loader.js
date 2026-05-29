// content-loader.js — fetches manifest.json and every referenced MD file,
// then builds the in-memory model that the rest of the app consumes.
//
// Manifest shape (see public/content/manifest.json):
//   {
//     "specializations": [{ id, name, short, hue, blurb }, ...],
//     "courses": [
//       { id, name, credits, semester, specializations: ["NVIZ", ...], blurb,
//         topics: [
//           { id, title, subtopics: [ { id, title?, src } ] }
//         ]
//       }
//     ],
//     "exam": { "NVIZ": [{ id, n, title, refs: [[cid,tid,sid], ...], sharedWith? }] }
//   }
//
// `src` is a path relative to BASE_URL (Vite sets this) and points at an MD file.
// Each MD subtopic can also override its title via frontmatter `title:`.

import { parseMarkdown } from "./md-parser.js";

const BASE = import.meta.env.BASE_URL || "/";

function joinBase(p) {
  if (/^https?:/.test(p)) return p;
  return (BASE.endsWith("/") ? BASE : BASE + "/") + p.replace(/^\//, "");
}

export async function loadContent(manifestUrl = "content/manifest.json") {
  const manifestResp = await fetch(joinBase(manifestUrl), { cache: "no-cache" });
  if (!manifestResp.ok) throw new Error(`Failed to load manifest: ${manifestResp.status}`);
  const manifest = await manifestResp.json();

  // Verified-content list. Optional file — missing → nothing is verified.
  let verifiedSet = new Set();
  try {
    const vr = await fetch(joinBase("content/verified.json"), { cache: "no-cache" });
    if (vr.ok) {
      const vd = await vr.json();
      for (const k of (vd.verified || [])) verifiedSet.add(k);
    }
  } catch { /* ignore — verified list is optional */ }

  // Hydrate each subtopic with the parsed MD content.
  const courses = await Promise.all(
    (manifest.courses || []).map(async (course) => {
      const courseVerified = verifiedSet.has(course.id);
      const topics = await Promise.all(
        (course.topics || []).map(async (topic) => {
          const topicVerified = courseVerified || verifiedSet.has(`${course.id}/${topic.id}`);
          const subtopics = await Promise.all(
            (topic.subtopics || []).map(async (sub) => {
              const subVerified = topicVerified || verifiedSet.has(`${course.id}/${topic.id}/${sub.id}`);
              if (!sub.src) {
                return { ...sub, blocks: [], verified: subVerified };
              }
              try {
                const r = await fetch(joinBase(sub.src), { cache: "no-cache" });
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const text = await r.text();
                const { frontmatter, blocks } = parseMarkdown(text);
                // Pick a human title in this order: explicit manifest > frontmatter
                // > first H1 in the body > the id. If we used the body's H1, drop
                // it from the rendered blocks so the page doesn't show the same
                // title twice.
                let title = sub.title || frontmatter.title;
                let body = blocks;
                if (!title && body[0] && body[0].kind === "heading" && body[0].level === 1) {
                  title = body[0].body;
                  body = body.slice(1);
                }
                if (!title) title = sub.id;
                return { ...sub, title, blocks: body, verified: subVerified };
              } catch (err) {
                console.error(`failed to load ${sub.src}`, err);
                return {
                  ...sub,
                  title: sub.title || sub.id,
                  verified: subVerified,
                  blocks: [{
                    kind: "text",
                    body: `_Failed to load content for ${sub.id} (${sub.src}): ${err.message || err}_`,
                  }],
                };
              }
            })
          );
          return { ...topic, subtopics, verified: topicVerified };
        })
      );
      return { ...course, topics, verified: courseVerified };
    })
  );

  // Build a global subtopic-id → location index for wiki-style links ([[id]]).
  // Manifest IDs are unique across the catalogue, so this lookup is unambiguous.
  const subById = new Map();
  for (const course of courses) {
    for (const topic of course.topics || []) {
      for (const sub of topic.subtopics || []) {
        if (!subById.has(sub.id)) {
          subById.set(sub.id, { courseId: course.id, topicId: topic.id, sub });
        }
      }
    }
  }

  // Mindmaps — curated multi-level hierarchies (course → branch → cluster → leaf)
  // are optional. Missing files are not an error; the renderer falls back to
  // auto-layout based on the manifest topic/subtopic structure.
  const mindmaps = {};
  await Promise.all(
    courses.map(async (course) => {
      try {
        const r = await fetch(joinBase(`content/mindmaps/${course.id}.json`), { cache: "no-cache" });
        if (!r.ok) return;
        mindmaps[course.id] = await r.json();
      } catch { /* ignore — mindmap json is optional */ }
    })
  );

  let globalMindmap = null;
  try {
    const r = await fetch(joinBase("content/mindmaps/_global.json"), { cache: "no-cache" });
    if (r.ok) globalMindmap = await r.json();
  } catch { /* ignore — global mindmap is optional */ }

  return {
    SPECIALIZATIONS: manifest.specializations || [],
    COURSES: courses,
    EXAM_TOPICS: manifest.exam || {},
    MINDMAPS: mindmaps,
    GLOBAL_MINDMAP: globalMindmap,
    REPO_URL: "https://github.com/tmokenc/Klidecek",
    hasAnyVerified: verifiedSet.size > 0,
    findSpec: (id) => (manifest.specializations || []).find((s) => s.id === id),
    findCourse: (id) => courses.find((c) => c.id === id),
    findSubtopic: (courseId, topicId, subtopicId) => {
      const course = courses.find((c) => c.id === courseId);
      const topic = course && course.topics.find((t) => t.id === topicId);
      const sub = topic && topic.subtopics.find((s) => s.id === subtopicId);
      return { course, topic, sub };
    },
    findSubtopicById: (id) => subById.get(id) || null,
    findMindmap: (courseId) => mindmaps[courseId] || null,
  };
}
