#!/usr/bin/env node
// Render-audit the embedded videos. NOTE: a subtopic route renders the WHOLE
// course on one page (all subtopics' embeds present at once, scrolled to the
// anchor), so we verify PER COURSE: load one route per course and confirm the
// exact multiset of that course's video ids is rendered (parsed from each
// facade's "open on YouTube" link), with no bad-id fallbacks and no console
// errors, in dark + light. Read-only. Blocks ytimg images so nav never stalls.
import { spawn } from 'child_process';
import fs from 'fs';
import puppeteer from 'puppeteer-core';
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const ROOT = '/home/tmokenc/workspace/vut/aio';
const PORT = 5198, BASE = `http://127.0.0.1:${PORT}/`;
const SHOTS = process.env.TMPDIR + '/embed-audit-shots';
fs.rmSync(SHOTS, { recursive: true, force: true }); fs.mkdirSync(SHOTS, { recursive: true });

const videos = JSON.parse(fs.readFileSync(ROOT + '/tools/video-data/final-videos.json', 'utf8'));
// expected ids per course (multiset, sorted) + a representative route per course
const byCourse = new Map();
for (const v of videos) {
  if (!byCourse.has(v.course)) byCourse.set(v.course, { ids: [], route: `#/c/${v.course}/${v.topic}/${v.sub}` });
  byCourse.get(v.course).ids.push(v.videoId);
}
for (const c of byCourse.values()) c.ids.sort();
console.log('auditing', byCourse.size, 'courses with videos (', videos.length, 'videos total )');

const sleep = ms => new Promise(r => setTimeout(r, ms));
const vite = spawn('node', ['./node_modules/.bin/vite', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'], { cwd: ROOT, stdio: 'ignore' });
process.on('exit', () => { try { vite.kill('SIGTERM'); } catch {} });
for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await sleep(500); }
const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell', args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-crash-reporter', '--disable-breakpad', `--user-data-dir=${process.env.TMPDIR}/cdir_embaudit3`] });
const page = await b.newPage();
await page.setRequestInterception(true);
page.on('request', req => { if (/ytimg|youtube|googlevideo/.test(req.url())) req.abort().catch(() => {}); else req.continue().catch(() => {}); });
await page.setViewport({ width: 900, height: 1500, deviceScaleFactor: 1 });

const readPage = () => page.evaluate(() => ({
  ids: [...document.querySelectorAll('.embed-cap a')].map(a => (a.href.match(/[?&]v=([\w-]{11})/) || [])[1]).filter(Boolean).sort(),
  embeds: document.querySelectorAll('.block-embed').length,
  facades: document.querySelectorAll('.embed-facade').length,
  bad: document.querySelectorAll('.block-embed-bad').length,
  videaHeadings: [...document.querySelectorAll('.block-heading')].filter(h => /^Videa$/.test(h.textContent.trim())).length,
  notReg: (document.body.innerText.match(/neregistrov|Neznámá vizual/gi) || []).length,
}));

const bad = [];
let shots = 0;
for (const dark of [true, false]) {
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.evaluate(d => localStorage.setItem('okruhy.tweaks.v1', JSON.stringify({ dark: d })), dark);
  for (const [course, exp] of byCourse) {
    process.stderr.write(`[${dark ? 'D' : 'L'}] ${course}\n`);
    const errs = [];
    const onMsg = m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); };
    const onErr = e => errs.push('PAGEERR: ' + String(e).slice(0, 200));
    page.on('console', onMsg); page.on('pageerror', onErr);
    try {
      await page.goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.goto(BASE + exp.route, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForFunction(() => document.querySelector('.block-embed'), { timeout: 12000 }).catch(() => {});
    } catch (e) {
      page.off('console', onMsg); page.off('pageerror', onErr);
      bad.push({ theme: dark ? 'dark' : 'light', course, nav: String(e).slice(0, 80) }); continue;
    }
    await sleep(150);
    const info = await readPage();
    page.off('console', onMsg); page.off('pageerror', onErr);
    const real = errs.filter(e => !/favicon|DevTools|ERR_|net::|ytimg|youtube|429|googlevideo|aborted/i.test(e));
    const idsMatch = JSON.stringify(info.ids) === JSON.stringify(exp.ids);
    if (!idsMatch || info.bad > 0 || info.notReg || real.length || info.embeds !== exp.ids.length) {
      bad.push({ theme: dark ? 'dark' : 'light', course, wantN: exp.ids.length, gotN: info.ids.length, embeds: info.embeds, bad: info.bad, notReg: info.notReg, idsMatch, missing: exp.ids.filter(x => !info.ids.includes(x)).slice(0, 4), extra: info.ids.filter(x => !exp.ids.includes(x)).slice(0, 4), real: real.slice(0, 2) });
    }
    if (dark && shots < 6) { const el = await page.$('.block-embed'); if (el) { await el.screenshot({ path: `${SHOTS}/${course}.png` }); shots++; } }
  }
}
console.log('=== embed audit (per course, dark+light) ===');
console.log('checks:', byCourse.size * 2, '| flagged:', bad.length);
for (const x of bad) console.log('  FLAG', x.theme, x.course, `want ${x.wantN} got ${x.gotN}`, '| embeds', x.embeds, '| bad', x.bad, '| idsMatch', x.idsMatch, x.missing.length ? '| missing ' + JSON.stringify(x.missing) : '', x.extra.length ? '| extra ' + JSON.stringify(x.extra) : '', x.real.length ? '| ERR ' + JSON.stringify(x.real) : '');
await b.close(); try { vite.kill('SIGTERM'); } catch {}
process.exit(bad.length ? 1 : 0);
