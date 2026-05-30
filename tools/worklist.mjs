import fs from 'fs';
const report = JSON.parse(fs.readFileSync(process.env.TMPDIR + '/audit-report.json', 'utf8'));
const routes = JSON.parse(fs.readFileSync(process.env.TMPDIR + '/routes.json', 'utf8'));
// srcId (sub-{tid}-{sid}) + cid -> md file
const srcMap = new Map();
for (const r of routes) srcMap.set(r.cid + '|sub-' + r.tid + '-' + r.sid, r.file);
// viz id -> file (parse index.js imports)
const idx = fs.readFileSync('src/viz/index.js', 'utf8');
const reg = {};
for (const m of idx.matchAll(/register\(\s*["']([^"']+)["']\s*,\s*(\w+)/g)) reg[m[1]] = m[2];
const imp = {};
for (const m of idx.matchAll(/import\s+(\w+)\s+from\s+["']\.\/([^"']+)["']/g)) imp[m[1]] = m[2];

const work = [];
for (const entry of report) {
  for (const blk of (entry.blocks || [])) {
    let file = null;
    if (blk.type === 'viz' && blk.vizId) {
      const comp = reg[blk.vizId];
      file = comp && imp[comp] ? 'src/viz/' + imp[comp] : 'src/viz/' + blk.vizId + '.jsx';
    } else if (blk.srcId) {
      file = srcMap.get(entry.cid + '|' + blk.srcId) || null;
    }
    work.push({
      unit: blk.vizId || blk.srcId,
      type: blk.type,
      cid: entry.cid,
      file,
      fileExists: file ? fs.existsSync(file) : false,
      issues: blk.issues,
    });
  }
}
fs.writeFileSync(process.env.TMPDIR + '/worklist.json', JSON.stringify(work, null, 2));
const missing = work.filter(w => !w.fileExists);
console.log('work units:', work.length, '| unresolved files:', missing.length);
for (const m of missing) console.log('  UNRESOLVED:', m.type, m.unit, '->', m.file);
// quick severity view
const big = work.filter(w => w.issues.some(i => i.kind === 'svg-overflow' && i.sides && i.sides.some(s => parseInt(s.split('+')[1]) > 20)));
console.log('\nlarge-overflow (>20px) units:', big.length);
