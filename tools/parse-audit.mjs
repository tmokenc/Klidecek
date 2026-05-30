// Load every course page and flag, in the *rendered* DOM:
//  - literal "**bold**" that never became <strong> (broken bold)
//  - raw LaTeX backslash-commands sitting in prose / code (broken math)
import fs from 'fs';
import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';
const PORT = 5190;
const BASE = `http://127.0.0.1:${PORT}/`;
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const allRoutes = JSON.parse(fs.readFileSync(process.env.TMPDIR + '/routes.json', 'utf8'));
const byCourse = new Map();
for (const r of allRoutes) if (!byCourse.has(r.cid)) byCourse.set(r.cid, r);
const routes = [...byCourse.values()];

const vite = spawn('node', ['./node_modules/.bin/vite', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await sleep(500); }
process.on('exit', () => { try { vite.kill('SIGTERM'); } catch {} });

const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell', args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-crash-reporter', '--disable-breakpad', `--user-data-dir=${process.env.TMPDIR}/cdir_parse`] });
const page = await b.newPage();
await page.setViewport({ width: 1100, height: 1400 });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('okruhy.tweaks.v1', JSON.stringify({ dark: true })));
await page.reload({ waitUntil: 'networkidle0' });

const LATEX = /\\(times|rightarrow|leftarrow|Rightarrow|geq|leq|neq|cdot|ldots|subseteq|mathbb|mathcal|mathbf|frac|sqrt|sum|prod|forall|exists|alpha|beta|gamma|delta|lambda|sigma|theta|epsilon|infty|partial|nabla|log|circ|in\b|notin|cup|cap|to\b|mapsto|langle|rangle)/;
const findings = [];
for (const r of routes) {
  const hash = `#/c/${r.cid}/${r.tid}/${r.sid}`;
  await page.evaluate(h => { location.hash = h; }, hash);
  await page.waitForFunction(() => document.querySelector('.subtopic'), { timeout: 12000 }).catch(() => {});
  await sleep(350);
  const res = await page.evaluate((latexSrc) => {
    const LATEX = new RegExp(latexSrc);
    const out = [];
    // walk prose blocks, excluding katex-rendered math + code highlight tokens we expect
    const proseSel = '.block-text, .block-list, .block-table, .block-quote, .block-heading, .block-viz-cap, figcaption';
    document.querySelectorAll(proseSel).forEach(el => {
      // clone and strip katex to inspect only un-rendered text
      const clone = el.cloneNode(true);
      clone.querySelectorAll('.katex, .math').forEach(k => k.remove());
      const txt = clone.textContent || '';
      const art = el.closest('article.subtopic');
      const sid = art ? art.id : '?';
      // literal bold: **word** with non-space inside
      const bold = txt.match(/\*\*\S[^\n]*?\S?\*\*/);
      if (bold) out.push({ sid, kind: 'literal-bold', sample: bold[0].slice(0, 60) });
      const lx = txt.match(LATEX);
      if (lx) {
        const i = txt.indexOf(lx[0]);
        out.push({ sid, kind: 'raw-latex', sample: txt.slice(Math.max(0, i - 20), i + 30).replace(/\s+/g, ' ') });
      }
    });
    // code blocks that are actually math (leftover ```math style)
    document.querySelectorAll('.block-code').forEach(el => {
      const txt = el.textContent || '';
      if (LATEX.test(txt) && /\\(rightarrow|times|mapsto|forall|exists|geq|leq)/.test(txt)) {
        const art = el.closest('article.subtopic');
        out.push({ sid: art ? art.id : '?', kind: 'math-in-codeblock', sample: txt.slice(0, 50).replace(/\s+/g, ' ') });
      }
    });
    return out;
  }, LATEX.source);
  for (const f of res) findings.push({ cid: r.cid, ...f });
  process.stdout.write(`${r.cid}:${res.length} `);
}
process.stdout.write('\n');
fs.writeFileSync(process.env.TMPDIR + '/parse-findings.json', JSON.stringify(findings, null, 2));
const byKind = {};
for (const f of findings) byKind[f.kind] = (byKind[f.kind] || 0) + 1;
console.log('\n=== PARSE AUDIT ===');
console.log('total findings:', findings.length, JSON.stringify(byKind));
for (const f of findings) console.log(`  [${f.kind}] ${f.cid} ${f.sid}: ${f.sample}`);
await b.close();
try { vite.kill('SIGTERM'); } catch {}
process.exit(0);
