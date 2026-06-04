// Headless smoke test for the Komise page. Spawns vite, drives the /k route.
//   node tools/committee-data/smoke.mjs
import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';

const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const PORT = 5197, BASE = `http://127.0.0.1:${PORT}/`;
const ROOT = process.cwd();

const vite = spawn('node', ['./node_modules/.bin/vite', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
process.on('exit', () => { try { vite.kill('SIGTERM'); } catch {} });

async function waitServer() {
  for (let i = 0; i < 80; i++) {
    try { const r = await fetch(BASE); if (r.ok) return; } catch {}
    await new Promise(r => setTimeout(r, 250));
  }
  throw new Error('vite did not start');
}

const results = [];
const ok = (n, c) => results.push([c ? 'PASS' : 'FAIL', n]);

await waitServer();
const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell', args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-crash-reporter', '--disable-breakpad', `--user-data-dir=${process.env.TMPDIR}/cdir_komise`] });
const page = await b.newPage();
await page.setViewport({ width: 920, height: 1100 });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));

try {
  // start from a clean slate (a prior run may have persisted a board selection)
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.removeItem('okruhy.komise.board.v1'); localStorage.removeItem('okruhy.komise.repos.v1'); });
  await page.goto(BASE + 'k', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.komise-tab', { timeout: 20000 });
  ok('komise page renders tabs', true);

  // data loads from the repository — combobox suggests examiners on focus
  await page.waitForSelector('.komise-picker-input', { timeout: 25000 });
  await page.click('.komise-picker-input');
  await page.waitForSelector('.komise-suggest-item', { timeout: 25000 });
  const sugg = await page.$$eval('.komise-suggest-item', els => els.length);
  ok(`type-ahead suggests examiners (${sugg})`, sugg > 0);

  // type a name -> filtered suggestions -> pick it (mousedown adds)
  await page.type('.komise-picker-input', 'kriv');
  await page.waitForFunction(() => {
    const el = document.querySelector('.komise-suggest-item .komise-suggest-name');
    return el && /Křivka/.test(el.textContent);
  }, { timeout: 5000 });
  ok('typing filters suggestions to the match', true);
  await page.evaluate(() => document.querySelector('.komise-suggest-item')
    .dispatchEvent(new MouseEvent('mousedown', { bubbles: true })));
  await page.waitForSelector('.komise-topic', { timeout: 8000 });
  const topics = await page.$$eval('.komise-topic', els => els.length);
  ok(`min-max ranks topics for the board (${topics})`, topics > 0);

  // board badge shows on the tab
  const badge = await page.$eval('.komise-tab-badge', el => el.textContent).catch(() => null);
  ok('board count badge appears', badge === '1');

  // expand the first topic's question notes
  await page.evaluate(() => document.querySelector('.komise-expand')?.click());
  await page.waitForSelector('.komise-notes', { timeout: 5000 });
  const notes = await page.$$eval('.komise-notes li', els => els.length);
  ok(`question notes expand (${notes})`, notes > 0);

  // click a resolvable topic title -> navigates into study content
  const navd = await page.evaluate(() => {
    const t = [...document.querySelectorAll('.komise-topic-title')].find(b => !b.disabled);
    if (!t) return null;
    t.click();
    return location.pathname;
  });
  await new Promise(r => setTimeout(r, 600));
  const path = await page.evaluate(() => location.pathname);
  const onCourse = /\/c\//.test(path);
  await page.waitForSelector('.page-title', { timeout: 8000 }).catch(() => {});
  ok(`topic links into study content (${path})`, onCourse);

  // back to komise, Repozitáře tab shows the built-in repo + record count
  await page.goto(BASE + 'k', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.komise-tab', { timeout: 8000 });
  await page.evaluate(() => [...document.querySelectorAll('.komise-tab')].find(t => /Repozit/.test(t.textContent))?.click());
  await page.waitForSelector('.komise-repo', { timeout: 8000 });
  const repoTag = await page.$eval('.komise-tag.ok', el => el.textContent).catch(() => null);
  ok(`repo tab lists built-in repo with count (${repoTag})`, !!repoTag && /záznam/.test(repoTag));

  // Komisaři (browse) tab: members list, expand one -> notes
  await page.evaluate(() => [...document.querySelectorAll('.komise-tab')].find(t => /Komisaři/.test(t.textContent))?.click());
  await page.waitForSelector('.komise-member', { timeout: 8000 });
  await page.evaluate(() => document.querySelector('.komise-member-toggle')?.click());
  await page.waitForSelector('.komise-member-body', { timeout: 5000 });
  const browseLinks = await page.$$eval('.komise-member-body .komise-topic-title', els => els.length);
  ok(`browse view expands a member (${browseLinks} topics)`, browseLinks > 0);

  // default repo is removable in-app, then restorable
  await page.evaluate(() => [...document.querySelectorAll('.komise-tab')].find(t => /Repozit/.test(t.textContent))?.click());
  await page.waitForSelector('.komise-repo', { timeout: 8000 });
  const before = await page.$$eval('.komise-repo', e => e.length);
  await page.evaluate(() => {
    const row = [...document.querySelectorAll('.komise-repo')].find(r => /MSZ komise/.test(r.textContent));
    [...row.querySelectorAll('button')].find(b => /Odebrat/.test(b.textContent)).click();
  });
  await page.waitForSelector('.komise-restore', { timeout: 6000 });
  const afterRemove = await page.$$eval('.komise-repo', e => e.length);
  ok(`default repo removable in-app (${before}→${afterRemove})`, afterRemove === before - 1);
  await page.evaluate(() => document.querySelector('.komise-restore').click());
  await page.waitForSelector('.komise-tag.ok', { timeout: 8000 });
  const afterRestore = await page.$$eval('.komise-repo', e => e.length);
  ok(`default repo restorable (${afterRestore})`, afterRestore === before);

} catch (e) {
  ok('exception: ' + e.message, false);
}

ok(`no console/page errors (${errors.length})`, errors.length === 0);
await b.close();
vite.kill('SIGTERM');

console.log('\n── Komise smoke test ──');
for (const [s, n] of results) console.log(`  ${s}  ${n}`);
if (errors.length) { console.log('\nerrors:'); errors.slice(0, 8).forEach(e => console.log('  ! ' + e)); }
const failed = results.filter(r => r[0] === 'FAIL').length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
