export const meta = {
  name: 'content-fix',
  description: 'Apply verified content fixes (factual/readability/redundancy/refs) one self-verifying agent per file',
  phases: [{ title: 'Fix', detail: 'one agent per content file' }],
}

const RESULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    file: { type: 'string' },
    appliedCount: { type: 'number' },
    rejectedCount: { type: 'number' },
    applied: { type: 'array', items: { type: 'string' } },
    rejected: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['file', 'appliedCount', 'rejectedCount', 'summary'],
}

const files = (typeof args === 'string' ? JSON.parse(args) : args) || []

const GUIDE = `
This is university master's-exam STUDY material (Czech, VUT FIT). Wrong content harms students, and an unverified "fix" can be worse than the original — so verify before you change, and when in doubt, leave it.

Handle each finding by its type:
 - readability — fix typos, duplicated words, garbled/contradictory wording, broken sentences. These are safe; apply the fix.
 - broken-reference — check the [[wikilink]] target or the referenced claim; apply the fix ONLY if it is genuinely broken/wrong. (A [[link]] whose target file exists is fine.)
 - redundancy — trim the duplicated passage per the suggested fix, replacing it with a short back-reference, ONLY if no unique information is lost. If the "duplication" actually carries distinct nuance, reject.
 - factual-error — THE FILE IS STUDY MATERIAL. Independently verify the claim with your own CS/math domain knowledge (definitions, formulas, complexities, theorem statements, constants, dates). Apply the fix ONLY if you are confident (a) the original is actually wrong AND (b) the suggested correction is right. If you cannot confirm, or the original is defensible, DO NOT edit — reject it with a one-line reason. Never replace a concrete claim with vaguer text.

Rules:
 - Make MINIMAL, surgical edits — change only what the finding identifies. Do not rewrite paragraphs, restructure, or "improve style" beyond the finding.
 - Preserve: Czech wording/tone, Markdown structure, math ($…$, $$, \`\`\`math), inline SVG, escaped \\* , and the "Zdroj: …" citation footer.
 - If the finding's 'location' text no longer matches the file (already fixed by an earlier pass), reject as "already resolved".
 - applied[] = short description of each edit made; rejected[] = "<finding> — <reason>".
`

const results = await pipeline(
  files,
  (file) => agent(
    `Correct one study-content file by applying its REVIEW FINDINGS, verifying each before you change it.

TARGET FILE: ${file}

STEP 1 — read the findings for this file:
  cat /tmp/claude-1000/findings-byfile.json
then take the array under the key exactly equal to "${file}". Each finding has {type, severity, confidence, location, issue, fix}.

STEP 2 — read the target file.

STEP 3 — for each finding, verify and apply per this guide:
${GUIDE}

STEP 4 — return the structured result.`,
    { label: `fix:${file.split('/').slice(-2).join('/')}`, phase: 'Fix', schema: RESULT_SCHEMA }
  )
)

const done = results.filter(Boolean)
const applied = done.reduce((s, r) => s + (r.appliedCount || 0), 0)
const rejected = done.reduce((s, r) => s + (r.rejectedCount || 0), 0)
log(`content-fix: ${done.length}/${files.length} files; ${applied} fixes applied, ${rejected} rejected`)
return { files: files.length, processed: done.length, applied, rejected, results: done }
