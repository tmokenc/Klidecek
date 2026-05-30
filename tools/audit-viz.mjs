// Render every course page in DARK mode and detect, from the live DOM:
//  - invisible / low-contrast text vs the shape actually behind it
//  - glaring pure-white / pure-black fills
//  - clipping: SVG content past its viewBox, DOM horizontal overflow
// One route per course renders the whole course (all topics/subtopics), so we
// dedupe to ~16 pages. Each flagged block is mapped back to its source via the
// enclosing <article class="subtopic" id="sub-{tid}-{sid}"> and the viz id.
import fs from 'fs';
import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';

const PORT = 5190;
const BASE = process.env.AUDIT_BASE || `http://127.0.0.1:${PORT}/`;
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const AUDIT = fs.readFileSync('tools/audit-fn.js', 'utf8');
const allRoutes = JSON.parse(fs.readFileSync(process.env.TMPDIR + '/routes.json', 'utf8'));

// one representative route per course (first subtopic)
const byCourse = new Map();
for (const r of allRoutes) if (!byCourse.has(r.cid)) byCourse.set(r.cid, r);
const routes = [...byCourse.values()];

const vite = spawn('node', ['./node_modules/.bin/vite', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function waitServer() { for (let i = 0; i < 60; i++) { try { const res = await fetch(BASE); if (res.ok) return; } catch {} await sleep(500); } throw new Error('vite down'); }
await waitServer();
process.on('exit', () => { try { vite.kill('SIGTERM'); } catch {} });

const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell',
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-crash-reporter', '--disable-breakpad', `--user-data-dir=${process.env.TMPDIR}/cdir2`] });
const page = await b.newPage();
await page.setViewport({ width: 1100, height: 1600, deviceScaleFactor: 1 });
page.setDefaultTimeout(20000);
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('okruhy.tweaks.v1', JSON.stringify({ dark: true })));
await page.reload({ waitUntil: 'networkidle0' });

const report = [];
for (const r of routes) {
  const hash = `#/c/${r.cid}/${r.tid}/${r.sid}`;
  try {
    await page.evaluate(h => { location.hash = h; }, hash);
    await page.waitForFunction(() => document.querySelector('.block-viz-body, .block-svg'), { timeout: 12000 }).catch(() => {});
    // scroll through to trigger any lazy rendering, then back to top
    await page.evaluate(async () => { const H = document.body.scrollHeight; for (let y = 0; y < H; y += 800) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } window.scrollTo(0, 0); });
    await sleep(400);
    await page.evaluate(AUDIT);
    const blocks = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('.block-viz, .block-svg').forEach((blk) => {
        const head = blk.querySelector('.block-viz-head span');
        const vizId = head ? head.textContent.replace(/^interactive\s*·\s*/i, '').trim() : null;
        const art = blk.closest('article.subtopic');
        const srcId = art ? art.id : null; // sub-{tid}-{sid}
        const body = blk.classList.contains('block-svg') ? blk : (blk.querySelector('.block-viz-body') || blk);
        const issues = window.__auditBlock(body);
        if (issues.length) out.push({ vizId, srcId, type: blk.classList.contains('block-svg') ? 'svg' : 'viz', issues });
      });
      return out;
    });
    report.push({ cid: r.cid, route: hash, blockCount: blocks.length, blocks });
    process.stdout.write(`${r.cid}:${blocks.length} `);
  } catch (e) {
    report.push({ cid: r.cid, route: hash, error: String(e).slice(0, 140) });
    process.stdout.write(`${r.cid}:ERR `);
  }
}
process.stdout.write('\n');

fs.writeFileSync(process.env.TMPDIR + '/audit-report.json', JSON.stringify(report, null, 2));

// per-viz aggregation (viz id -> issue kinds)
const byViz = {};
const counts = {};
for (const r of report) for (const blk of (r.blocks || [])) {
  const key = blk.vizId || (blk.srcId + ' (inline-svg)');
  byViz[key] = byViz[key] || { kinds: {}, srcId: blk.srcId, type: blk.type, cid: r.cid };
  for (const is of blk.issues) { byViz[key].kinds[is.kind] = (byViz[key].kinds[is.kind] || 0) + 1; counts[is.kind] = (counts[is.kind] || 0) + 1; }
}
fs.writeFileSync(process.env.TMPDIR + '/audit-byviz.json', JSON.stringify(byViz, null, 2));

console.log('\n=== AUDIT SUMMARY (dark mode) ===');
console.log('courses:', routes.length, '| flagged blocks:', Object.keys(byViz).length, '| errors:', report.filter(r => r.error).length);
console.log('issue counts by kind:', JSON.stringify(counts));
console.log('\nflagged units:');
for (const [k, v] of Object.entries(byViz).sort()) console.log(`  ${k}  [${v.type}]  ${JSON.stringify(v.kinds)}  <- ${v.srcId}`);
await b.close();
try { vite.kill('SIGTERM'); } catch {}
process.exit(0);
