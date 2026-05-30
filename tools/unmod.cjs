const fs = require("fs");
const items = JSON.parse(fs.readFileSync(process.env.TMPDIR + "/worklist-files.json", "utf8"));
const { execSync } = require("child_process");
const mod = new Set(execSync("git status --porcelain").toString().trim().split("\n").map(l => l.slice(3).trim()));
items.forEach((it, i) => { if (!mod.has(it.file)) console.log("UNMODIFIED idx", i, it.file); });
console.log("modified target files:", items.filter(it => mod.has(it.file)).length, "/", items.length);
