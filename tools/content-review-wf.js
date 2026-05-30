export const meta = {
  name: 'content-review',
  description: 'Review every topic for factual errors, missing info, readability, and redundancy (findings only)',
  phases: [{ title: 'Review', detail: 'one agent per topic' }],
}

const FINDINGS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    topic: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          file: { type: 'string' },
          type: { type: 'string', enum: ['factual-error', 'missing-info', 'readability', 'redundancy', 'broken-reference'] },
          severity: { type: 'string', enum: ['high', 'medium', 'low'] },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
          location: { type: 'string', description: 'short quote or heading locating the issue' },
          issue: { type: 'string' },
          fix: { type: 'string', description: 'concrete suggested correction' },
        },
        required: ['file', 'type', 'severity', 'confidence', 'issue', 'fix'],
      },
    },
  },
  required: ['topic', 'findings'],
}

const topics = (typeof args === 'string' ? JSON.parse(args) : args) || []

const results = await pipeline(
  topics,
  (t) => agent(
    `You are a meticulous subject-matter reviewer for a university master's-exam study app (VUT FIT, Brno). Content is in Czech with English technical terms. It was AI-generated from one student's lecture notes, so it may contain factual errors, gaps, unclear passages, or repetition. Your job: REVIEW (do not edit) one topic and report concrete, defensible issues.

COURSE: ${t.cid}   TOPIC: "${t.title}"
SUBTOPIC FILES (read them all):
${t.files.map(f => '  - ' + f).join('\n')}

For each genuine issue, add a finding with type:
 - factual-error  — a definition, formula, complexity, theorem statement, constant, date, or claim that is WRONG. Use your CS/math domain knowledge. Cross-check anything numeric or counter-intuitive. ONLY report with confidence high/medium when you are sure; do NOT flag stylistic choices or defensible simplifications as errors.
 - missing-info   — a key concept the subtopic clearly should cover but omits (judge against the subtopic's own stated scope; do NOT flag a short intro/transition subtopic for being short).
 - readability    — a passage that is genuinely confusing, garbled, contradictory, or hard to follow.
 - redundancy     — substantial content repeated across these subtopics, or restated needlessly within one (NOT the per-file source-citation footer, which is expected).
 - broken-reference — a [[wikilink]] or claim that points to something that doesn't exist / is wrong.

Rules:
 - Be precise: 'location' must quote the offending text or name the heading so it can be found and fixed.
 - 'fix' must be a concrete correction, not "clarify this".
 - Prefer FEW high-quality findings over many speculative ones. If the topic is solid, return an empty findings array — that is a valid, good result.
 - Set file to the exact path from the list above.

Return the structured findings.`,
    { label: `review:${t.cid}/${t.tid}`, phase: 'Review', schema: FINDINGS_SCHEMA }
  )
)

const all = results.filter(Boolean).flatMap(r => (r.findings || []).map(f => ({ ...f, cid: topics.find(t => r.topic && (t.title === r.topic || t.tid === r.topic))?.cid })))
const byType = {}, bySev = {}
for (const f of all) { byType[f.type] = (byType[f.type] || 0) + 1; bySev[f.severity] = (bySev[f.severity] || 0) + 1 }
log(`reviewed ${results.filter(Boolean).length}/${topics.length} topics; ${all.length} findings — by type ${JSON.stringify(byType)}, by severity ${JSON.stringify(bySev)}`)
return { topicsReviewed: results.filter(Boolean).length, totalFindings: all.length, byType, bySeverity: bySev, findings: all }
