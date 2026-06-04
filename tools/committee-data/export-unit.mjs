// Unit test for the REAL komise.js export helpers (esbuild-bundled so import.meta.env
// resolves). Exercises CSV formula-injection guard + RFC-4180 quoting + buildCommissionExport
// on adversarial inputs that the live dataset doesn't currently contain.
//   node tools/committee-data/export-unit.mjs
import esbuild from 'esbuild';
import { pathToFileURL } from 'url';

const out = (process.env.TMPDIR || '/tmp') + '/komise-bundle.mjs';
await esbuild.build({
  entryPoints: ['src/framework/komise.js'],
  bundle: true, format: 'esm', outfile: out,
  define: { 'import.meta.env.BASE_URL': '"/"' },
  logLevel: 'silent',
});
const K = await import(pathToFileURL(out).href);

let pass = 0, fail = 0;
const ok = (name, cond) => { (cond ? pass++ : fail++); console.log(`  ${cond ? 'PASS' : 'FAIL'}  ${name}`); };

function parseCSV(text) {
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
  const rows = []; let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// ── CSV: formula injection + quoting ──
const data = { records: [
  { examiner: '=cmd|calc', course: 'AIS', examTopic: 'X', confidence: 'high', session: '2025', asked: 'plain' },
  { examiner: 'Normal', course: 'WAP', examTopic: 'Y', confidence: 'low', session: '2024', asked: '+1+1 danger' },
  { examiner: '@SUM(A1)', course: '-neg', examTopic: '\t=tab', confidence: 'high', session: '2025', asked: 'x' },
  { examiner: 'Quotey', course: 'B', examTopic: 'C', confidence: 'high', session: '2025', asked: 'a, "b", line1\nline2' },
] };
const csv = K.exportToCSV(data);
const rows = parseCSV(csv);

ok('BOM present', csv.charCodeAt(0) === 0xFEFF);
ok('header row + 4 data rows', rows.length === 5);
ok('every row has 6 columns (quoting handles commas/quotes/newlines)', rows.every(r => r.length === 6));
const dangerous = /^[=+@\-\t\r]/;
const allCells = rows.slice(1).flat();
ok('no data cell starts with a bare formula trigger', allCells.every(c => !dangerous.test(c)));
ok("formula cells are apostrophe-escaped (=cmd → '=cmd)",
   rows[1][0] === "'=cmd|calc" && rows[2][5] === "'+1+1 danger" && rows[3][0] === "'@SUM(A1)" && rows[3][1] === "'-neg");
ok('embedded quotes + comma + newline round-trip intact', rows[4][5] === 'a, "b", line1\nline2');

// ── buildCommissionExport ──
const index = {
  byKey: new Map([['a', { key: 'a', display: 'Ada Aová', titles: 'Ing.' }], ['b', { key: 'b', display: 'Bob Bový', titles: '' }]]),
  records: [
    { memberKey: 'a', course: 'AIS', session: '2025', text: 'q1', map: { topic: 'oo-navrh', examTitle: 'OO', confidence: 'high' } },
    { memberKey: 'b', course: 'WAP', session: '2024', text: 'q2', map: null },
    { memberKey: null, course: 'X', session: '2025', text: 'anon', map: null },            // must be dropped
    { memberKey: 'a', course: null, session: '2025', text: 'q3', map: { topic: 't', examTitle: null, confidence: 'low' } }, // mappedTopic must stay null
  ],
};
const exp = K.buildCommissionExport(index, ['a'], { exportedAt: 'X' });
ok('exports only board members (a), drops null memberKey', exp.records.length === 2 && exp.records.every(r => r.examinerKey === 'a'));
ok('count matches records', exp.count === exp.records.length);
ok('schema tag', exp.schema === 'klidecek-komise-export/v1');
ok('mappedTopic guarded when course is null', exp.records.find(r => r.session === '2025' && r.asked === 'q3').mappedTopic === null);
ok('commission carries display + titles', exp.commission[0].name === 'Ada Aová');

// empty board → exports all (still drops null memberKey)
const expAll = K.buildCommissionExport(index, [], {});
ok('empty board exports all attributable records (no null examiner)', expAll.records.length === 3 && expAll.records.every(r => r.examinerKey));

// ── parseBoardParam hardening ──
ok('parses simple param', JSON.stringify(K.parseBoardParam('?komise=krivka,bartik')) === JSON.stringify(['krivka', 'bartik']));
ok('rejects markup / junk keys', K.parseBoardParam('?komise=<script>,DROP TABLE') === null);
ok('caps the number of keys at 64', K.parseBoardParam('?komise=' + Array.from({ length: 200 }, (_, i) => 'k' + i).join(',')).length === 64);
ok('dedupes + lowercases', JSON.stringify(K.parseBoardParam('?komise=Krivka,krivka,BARTIK')) === JSON.stringify(['krivka', 'bartik']));
ok('no param → null', K.parseBoardParam('?x=1') === null);

console.log(`\n${pass}/${pass + fail} passed`);
process.exit(fail ? 1 : 0);
