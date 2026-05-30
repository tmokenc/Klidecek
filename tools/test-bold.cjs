const fs = require('fs'), ex = require('child_process').execSync;
const files = ex("find public/content -name '*.md'").toString().trim().split('\n');
function passes(s) {
  s = s.replace(/\*\*(\S(?:[^\n]*?\S)?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
  return s;
}
function mangled(html) {
  const stack = []; const re = /<(\/?)(strong|em)>/g; let m;
  while ((m = re.exec(html))) {
    if (m[1]) { if (stack.pop() !== m[2]) return true; }
    else stack.push(m[2]);
  }
  return stack.length > 0;
}
let leftover = 0, mang = 0, samples = [];
for (const f of files) {
  fs.readFileSync(f, 'utf8').split('\n').forEach((line, idx) => {
    if (!/\*\*/.test(line)) return;
    if (line.trim().startsWith('```')) return;
    const out = passes(line);
    const lo = (out.match(/\*\*/g) || []).length >= 2;
    const mg = mangled(out);
    const loc = f.replace('public/content/courses/', '') + ':' + (idx + 1);
    if (lo) { leftover++; if (samples.length < 12) samples.push('LEFTOVER ' + loc + '  ' + out.trim().slice(0, 120)); }
    if (mg) { mang++; samples.push('MANGLED  ' + loc + '  ' + line.trim().slice(0, 120)); }
  });
}
console.log('after fix -> leftover-bold lines:', leftover, '| mangled-nesting lines:', mang);
samples.forEach(s => console.log('  ' + s));
