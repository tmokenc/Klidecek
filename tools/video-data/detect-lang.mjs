#!/usr/bin/env node
// Probe the audio language of every video in final-videos.json via yt-dlp's
// `language` (defaultAudioLanguage) field, so we can drop anything not en/cs.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
const DIR = '/home/tmokenc/workspace/vut/aio/tools/video-data';
const CACHE = DIR + '/cache';
const videos = JSON.parse(fs.readFileSync(DIR + '/final-videos.json', 'utf8'));
const ids = [...new Set(videos.map(v => v.videoId))];

function ytdlp(args, key) {
  const cf = CACHE + '/' + crypto.createHash('sha1').update(key).digest('hex') + '.txt';
  if (fs.existsSync(cf)) return Promise.resolve(fs.readFileSync(cf, 'utf8'));
  return new Promise(res => execFile('yt-dlp', args, { maxBuffer: 64 * 1024 * 1024, timeout: 90000 }, (e, out) => { out = out || ''; if (!e) fs.writeFileSync(cf, out); res(out); }));
}
async function pool(items, n, fn) { const r = []; let i = 0; await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; r[k] = await fn(items[k]); } })); return r; }

const fields = '%(id)s\t%(language)s\t%(channel)s\t%(title)s';
const meta = new Map();
await pool(ids, 5, async (id) => {
  const out = await ytdlp(['--skip-download', '--no-warnings', '--print', fields, `https://www.youtube.com/watch?v=${id}`], 'lang::' + id);
  const line = (out.trim().split('\n').filter(Boolean))[0];
  if (!line) return;
  const [vid, lang, channel, ...t] = line.split('\t');
  if (vid === id) meta.set(id, { lang: (lang || '').trim(), channel: (channel || '').trim(), title: t.join(' ') });
});

const byLang = {};
for (const id of ids) { const m = meta.get(id); const l = m ? (m.lang || 'NA') : 'FETCH_FAIL'; byLang[l] = (byLang[l] || 0) + 1; }
console.log('unique ids:', ids.length, '| language distribution:', JSON.stringify(byLang));

// videos by channel for those that are non-en/cs or NA
const okLang = new Set(['en', 'cs', 'en-US', 'en-GB', 'cs-CZ']);
console.log('\n=== NON-en/cs (declared) ===');
for (const id of ids) { const m = meta.get(id); if (m && m.lang && !okLang.has(m.lang) && m.lang !== 'NA') console.log(`  [${m.lang}] ${m.channel} :: ${m.title.slice(0, 55)} (${id})`); }
console.log('\n=== language NA (undeclared) — by channel ===');
const naByCh = {};
for (const id of ids) { const m = meta.get(id); if (m && (!m.lang || m.lang === 'NA')) (naByCh[m.channel] = naByCh[m.channel] || []).push(m.title.slice(0, 45)); }
for (const [ch, ts] of Object.entries(naByCh).sort((a, b) => b[1].length - a[1].length)) console.log(`  ${ch} (${ts.length}): ${ts.slice(0, 3).join(' | ')}`);
fs.writeFileSync(DIR + '/lang-map.json', JSON.stringify([...meta], null, 2));
