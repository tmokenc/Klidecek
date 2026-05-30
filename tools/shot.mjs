import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const BASE = 'http://127.0.0.1:5190/';
const [hash, ...labels] = process.argv.slice(2);
const vite = spawn('node', ['./node_modules/.bin/vite', '--port', '5190', '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
const _sleep = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await _sleep(500); }
process.on('exit', () => { try { vite.kill('SIGTERM'); } catch {} });
const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell',
  args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-crash-reporter','--disable-breakpad',`--user-data-dir=${process.env.TMPDIR}/cdir_shot`] });
const page = await b.newPage();
await page.setViewport({ width: 1100, height: 1400, deviceScaleFactor: 2 });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('okruhy.tweaks.v1', JSON.stringify({ dark: true })));
await page.reload({ waitUntil: 'networkidle0' });
await page.evaluate(h => { location.hash = h; }, hash);
await page.waitForFunction(() => document.querySelector('.block-viz-body, .block-svg'), { timeout: 8000 }).catch(()=>{});
await new Promise(r => setTimeout(r, 500));
for (const label of labels) {
  const info = await page.evaluate((label) => {
    const blks = [...document.querySelectorAll('.block-viz, .block-svg')];
    const blk = blks.find(b => (b.textContent||'').toLowerCase().includes(label.toLowerCase()));
    if (!blk) return null;
    blk.scrollIntoView();
    const svg = blk.querySelector('svg');
    const cs = svg ? getComputedStyle(svg) : null;
    let bbox=null, vb=null; try{ bbox=svg.getBBox(); vb=svg.getAttribute('viewBox'); }catch(e){}
    return { overflow: cs && cs.overflow, vb, bbox: bbox&&[bbox.x,bbox.y,bbox.width,bbox.height].map(n=>+n.toFixed(1)) };
  }, label);
  console.log(label, '->', JSON.stringify(info));
  const el = await page.evaluateHandle((label) => {
    const blks = [...document.querySelectorAll('.block-viz, .block-svg')];
    return blks.find(b => (b.textContent||'').toLowerCase().includes(label.toLowerCase()));
  }, label);
  const box = el.asElement();
  if (box) { await box.screenshot({ path: `${process.env.TMPDIR}/shots/${label}.png` }); console.log('  saved', `${process.env.TMPDIR}/shots/${label}.png`); }
}
await b.close();
process.exit(0);
