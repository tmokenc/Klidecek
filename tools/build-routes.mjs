import fs from 'fs';
import path from 'path';
const manifest = JSON.parse(fs.readFileSync('public/content/manifest.json','utf8'));
const routes = [];
for (const c of manifest.courses||[]) {
  for (const t of c.topics||[]) {
    for (const s of t.subtopics||[]) {
      const src = s.src;
      const file = path.join('public', src);
      let body='';
      try { body = fs.readFileSync(file,'utf8'); } catch { }
      const vizzes = [...body.matchAll(/^:::\s*viz\s+([A-Za-z0-9_-]+)/gm)].map(m=>m[1]);
      const svgs = (body.match(/^:::\s*svg/gm)||[]).length;
      routes.push({ cid:c.id, tid:t.id, sid:s.id, src, file, viz:vizzes, svgCount:svgs });
    }
  }
}
fs.writeFileSync(process.env.TMPDIR+'/routes.json', JSON.stringify(routes,null,0));
const allViz = new Set(); routes.forEach(r=>r.viz.forEach(v=>allViz.add(v)));
const withViz = routes.filter(r=>r.viz.length||r.svgCount);
console.log('subtopics:', routes.length, '| with viz/svg:', withViz.length, '| unique viz ids referenced:', allViz.size);
