export const meta = {
  name: 'content-fix-v2',
  description: 'Apply verified content fixes — robust v2, each agent reads only its own small findings file',
  phases: [{ title: 'Fix', detail: 'one self-verifying agent per content file' }],
}

const RESULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    file: { type: 'string' },
    appliedCount: { type: 'number' },
    rejectedCount: { type: 'number' },
    summary: { type: 'string' },
  },
  required: ['file', 'appliedCount', 'rejectedCount', 'summary'],
}

const items = (typeof args === 'string' ? JSON.parse(args) : args) || []

const GUIDE = `Handle each finding by type:
 - readability: fix typos/duplicated words/garbled or contradictory wording. Safe — apply.
 - broken-reference: apply only if the [[link]]/claim is genuinely broken.
 - redundancy: trim duplicated text to a short back-reference ONLY if no unique info is lost; else reject.
 - factual-error: STUDY MATERIAL — independently verify with your own CS/math knowledge. Apply ONLY if confident the original is wrong AND the suggested fix is right; otherwise reject. Never make a concrete claim vaguer.
Rules: minimal surgical edits only; preserve Czech wording, Markdown, math ($…$, $$, \`\`\`math), inline SVG, escaped \\*, and the "Zdroj:" footer. If a finding's location no longer matches (already fixed), reject as "already resolved".`

const results = await pipeline(
  items,
  (it) => agent(
    `Correct one study-content Markdown file by applying its review findings, verifying each before changing it.

TARGET FILE: ${it.file}
FINDINGS FILE (small JSON array, just this file's findings): ${it.findingsPath}

1. Read the findings: cat ${it.findingsPath}
2. Read ${it.file}
3. For each finding {type,severity,confidence,location,issue,fix}, verify then apply per:
${GUIDE}
4. Edit ${it.file} with the confirmed fixes, then return the structured result (appliedCount, rejectedCount, one-line summary). You MUST end by calling the StructuredOutput tool.`,
    { label: `fix:${it.file.split('/').slice(-2).join('/')}`, phase: 'Fix', schema: RESULT_SCHEMA }
  )
)

const done = results.filter(Boolean)
const applied = done.reduce((s, r) => s + (r.appliedCount || 0), 0)
const rejected = done.reduce((s, r) => s + (r.rejectedCount || 0), 0)
log(`content-fix-v2: ${done.length}/${items.length} files processed; ${applied} applied, ${rejected} rejected`)
return { files: items.length, processed: done.length, applied, rejected, results: done }
