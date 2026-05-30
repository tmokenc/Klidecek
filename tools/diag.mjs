import fs from 'fs';
import puppeteer from 'puppeteer-core';
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const BASE = 'http://127.0.0.1:5190/';
const AUDIT = fs.readFileSync('tools/audit-fn.js', 'utf8');
const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell',
  args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-crash-reporter','--disable-breakpad',`--user-data-dir=${process.env.TMPDIR}/cdir_diag`] });
const page = await b.newPage();
await page.setViewport({ width: 1100, height: 1400 });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('okruhy.tweaks.v1', JSON.stringify({ dark: true })));
await page.reload({ waitUntil: 'networkidle0' });
await page.evaluate(AUDIT);
const tests = process.argv.slice(2);
for (const hash of tests) {
  await page.evaluate(h => { location.hash = h; }, hash);
  await page.waitForFunction(() => document.querySelector('.block-viz-body, .block-svg'), { timeout: 8000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 400));
  const out = await page.evaluate(() => {
    const res = [];
    document.querySelectorAll('.block-viz, .block-svg').forEach((blk, i) => {
      const head = blk.querySelector('.block-viz-head span');
      const body = blk.classList.contains('block-svg') ? blk : (blk.querySelector('.block-viz-body') || blk);
      res.push({ i, label: head ? head.textContent.trim() : '(svg)', issues: window.__auditBlock(body) });
    });
    return res;
  });
  console.log('\n### ' + hash);
  console.log(JSON.stringify(out, null, 1));
}
await b.close();
process.exit(0);
