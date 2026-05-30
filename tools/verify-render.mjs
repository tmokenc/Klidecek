// Dump rendered HTML/text of specific subtopic articles to confirm parsing.
import { spawn } from 'child_process';
import puppeteer from 'puppeteer-core';
const EXE = process.env.HOME + '/.cache/ms-playwright/chromium_headless_shell-1223/chrome-headless-shell-linux64/chrome-headless-shell';
const BASE = 'http://127.0.0.1:5190/';
const vite = spawn('node', ['./node_modules/.bin/vite', '--port', '5190', '--host', '127.0.0.1', '--strictPort'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
for (let i = 0; i < 60; i++) { try { if ((await fetch(BASE)).ok) break; } catch {} await sleep(500); }
process.on('exit', () => { try { vite.kill('SIGTERM'); } catch {} });
const b = await puppeteer.launch({ executablePath: EXE, headless: 'shell', args: ['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-crash-reporter','--disable-breakpad',`--user-data-dir=${process.env.TMPDIR}/cdir_vr`] });
const page = await b.newPage();
await page.setViewport({ width: 1100, height: 1400 });
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.setItem('okruhy.tweaks.v1', JSON.stringify({ dark: true })));
await page.reload({ waitUntil: 'networkidle0' });
// args: hash  artId  needle...
const [hash, artId, ...needles] = process.argv.slice(2);
await page.evaluate(h => { location.hash = h; }, hash);
await page.waitForFunction(() => document.querySelector('.subtopic'), { timeout: 12000 }).catch(()=>{});
await sleep(500);
const res = await page.evaluate((artId) => {
  const art = document.getElementById(artId);
  if (!art) return { err: 'no article ' + artId };
  // math blocks: did katex render?
  const maths = [...art.querySelectorAll('.block-math')].map(m => ({ katex: !!m.querySelector('.katex'), text: (m.textContent||'').trim().slice(0,80) }));
  const strongs = [...art.querySelectorAll('strong')].slice(0,8).map(s => s.outerHTML.slice(0,90));
  return { text: (art.innerText||'').slice(0, 500), maths, strongs };
}, artId);
console.log(JSON.stringify(res, null, 1));
await b.close();
try { vite.kill('SIGTERM'); } catch {}
process.exit(0);
