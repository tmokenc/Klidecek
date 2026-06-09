// One-shot corrective pass for the MSZ-2019 "merged two-okruh" historical records.
// Each listed student row had its recollection copied across both examiners' records (and
// sometimes the 2nd okruh inherited the 1st's topic). This splits the text per okruh and
// re-maps the 2nd okruh to its correct topic (or null), and drops one exact duplicate.
// Run: node tools/committee-data/fix-2019-merges.mjs        (dry-run, prints diff)
//      node tools/committee-data/fix-2019-merges.mjs --apply (writes the file)
import { readFileSync, writeFileSync } from 'fs';
const HIST = 'tools/committee-data/historical-2018-2020.json';
const arr = JSON.parse(readFileSync(HIST, 'utf8'));
const fit = JSON.parse(readFileSync('public/repos/fit-msz.json', 'utf8'));
const man = JSON.parse(readFileSync('public/content/manifest.json', 'utf8'));

// course/topic -> examTitle (from existing records; 1:1 in practice), fallback to manifest topic title
const examTitleByKey = new Map();
for (const r of fit.records) if (r.map && r.map.topic && r.map.examTitle) examTitleByKey.set(r.course + '/' + r.map.topic, r.map.examTitle);
const topicTitleByKey = new Map();
for (const c of man.courses) for (const t of (c.topics || [])) topicTitleByKey.set(c.id + '/' + t.id, t.title);
const examTitleFor = (course, topic) => examTitleByKey.get(course + '/' + topic) || topicTitleByKey.get(course + '/' + topic) || topic;

const cut = (text, marker, keepMarker) => {
  const i = text.indexOf(marker);
  if (i < 0) throw new Error('marker not found: ' + JSON.stringify(marker) + ' in ' + JSON.stringify(text.slice(0, 60)));
  const first = text.slice(0, i).replace(/[\s,/]+$/, '').trim();
  const second = (keepMarker ? text.slice(i) : text.slice(i + marker.length)).replace(/^[\s,/]+/, '').trim();
  return [first, second];
};

// PLAN: groups with a split marker; each record gets 'first' or 'second' half + a map directive
// map: 'keep' | null | [course, topic, confidence]   num: optional override
const GROUPS = [
  { marker: ' / ', keep: false, recs: [
    { idx: 399, mk: 'rogalewicz', half: 'first', num: 33, map: 'keep' },
    { idx: 400, mk: 'herout', half: 'second', num: 61, map: null } ] },
  { marker: '/ ', keep: false, recs: [
    { idx: 393, mk: 'ruzicka', half: 'first', map: 'keep' },
    { idx: 394, mk: 'zemcik', half: 'second', map: null } ] },
  { marker: ' / ', keep: false, recs: [
    { idx: 397, mk: 'bartik', half: 'first', num: 12, map: 'keep' },
    { idx: 398, mk: 'rogalewicz', half: 'second', num: 19, map: ['TIN', 'regularni', 'high'] } ] },
  { marker: 'Pri druhej otázke', keep: true, recs: [
    { idx: 264, mk: 'zeman', half: 'first', map: 'keep' },
    { idx: 265, mk: 'vesely', half: 'second', map: ['PDS', 'smerovani', 'low'] } ] },
  { marker: ', ', keep: false, recs: [
    { idx: 391, mk: 'rogalewicz', half: 'first', map: ['TIN', 'regularni', 'low'] },
    { idx: 392, mk: 'rysavy', half: 'second', map: ['BIS', 'wifi-bezpecnost', 'high'] } ] },
  { marker: '14.', keep: true, recs: [
    { idx: 266, mk: 'drabek', half: 'first', map: null },
    { idx: 267, mk: 'lengal', half: 'second', map: 'keep' } ] },
  { marker: '52 získávání', keep: true, recs: [
    { idx: 389, mk: 'rogalewicz', half: 'first', map: 'keep' },
    { idx: 390, mk: 'bartik', half: 'second', map: ['AIS', 'pozadavky', 'high'] } ] },
  { marker: 'SIMD,SIMT', keep: true, recs: [
    { idx: 158, mk: null, half: 'first', map: null },
    { idx: 159, mk: null, half: 'second', map: 'keep' } ] },
  { marker: 'Přepínače', keep: true, recs: [
    { idx: 224, mk: null, half: 'first', map: 'keep' },
    { idx: 225, mk: null, half: 'second', map: ['PDS', 'prepinace', 'high'] } ] },
  { marker: '2) DTW', keep: true, recs: [
    { idx: 236, mk: null, half: 'first', map: null },
    { idx: 237, mk: null, half: 'second', map: null } ] },
  { marker: '2) Kompresia', keep: true, recs: [
    { idx: 238, mk: null, half: 'first', map: 'keep' },
    { idx: 239, mk: null, half: 'second', map: null } ] },
  { marker: ', 7.', keep: true, recs: [
    { idx: 262, mk: null, half: 'first', map: 'keep' },
    { idx: 263, mk: null, half: 'second', map: null } ] },
];
const REMOVE = { idx: 620, mk: 'zboril', prefix: 'je to logický jazyk' };

let problems = 0;
for (const g of GROUPS) {
  const orig = arr[g.recs[0].idx].text;
  // sanity: both records in the group share the same original text
  if (arr[g.recs[1].idx].text !== orig) { console.log('!! group text mismatch at', g.recs[0].idx, g.recs[1].idx); problems++; continue; }
  let firstHalf, secondHalf;
  try { [firstHalf, secondHalf] = cut(orig, g.marker, g.keep); }
  catch (e) { console.log('!!', e.message); problems++; continue; }
  for (const r of g.recs) {
    const rec = arr[r.idx];
    const gotMk = rec.memberKey || null;
    if (gotMk !== r.mk) { console.log(`!! idx ${r.idx} memberKey ${gotMk} != ${r.mk}`); problems++; }
    r._newText = r.half === 'first' ? firstHalf : secondHalf;
    if (r._newText.length < 4) { console.log(`!! idx ${r.idx} split produced tiny text: ${JSON.stringify(r._newText)}`); problems++; }
  }
}
// removal sanity
const rm = arr[REMOVE.idx];
if (!rm || rm.memberKey !== REMOVE.mk || !(rm.text || '').startsWith(REMOVE.prefix)) { console.log('!! removal target mismatch at', REMOVE.idx); problems++; }

// print the diff
console.log('\n===== PROPOSED EDITS =====');
for (const g of GROUPS) for (const r of g.recs) {
  const rec = arr[r.idx];
  const oldMap = rec.map ? rec.map.course + '/' + rec.map.topic : 'null';
  const newMap = r.map === 'keep' ? oldMap + ' (keep)' : r.map === null ? 'null' : r.map.join('/');
  console.log(`\n[idx ${r.idx}] ${rec.memberKey || 'anon'} ${r.num != null ? '(num ' + r.num + ')' : ''}`);
  console.log(`  map: ${oldMap}  ->  ${newMap}`);
  console.log(`  text: ${JSON.stringify(r._newText)}`);
}
console.log(`\n[REMOVE idx ${REMOVE.idx}] ${rm && rm.memberKey} duplicate of idx 614`);
console.log(`\nproblems: ${problems}`);

if (process.argv.includes('--apply')) {
  if (problems) { console.log('REFUSING to apply: fix problems first'); process.exit(1); }
  for (const g of GROUPS) for (const r of g.recs) {
    const rec = arr[r.idx];
    rec.text = r._newText;
    if (r.num != null) rec.num = r.num;
    if (r.map === null) rec.map = null;
    else if (r.map !== 'keep') {
      const [course, topic, confidence] = r.map;
      rec.map = { course, topic, examTitle: examTitleFor(course, topic), confidence };
    }
  }
  // remove duplicate by identity (after edits, since we used indices above and removal is last)
  const before = arr.length;
  const out = arr.filter((rec, i) => i !== REMOVE.idx);
  if (out.length !== before - 1) { console.log('!! removal failed'); process.exit(1); }
  writeFileSync(HIST, JSON.stringify(out, null, 2) + '\n');
  console.log(`\nAPPLIED. records ${before} -> ${out.length}`);
} else {
  console.log('\n(dry-run — re-run with --apply to write)');
}
