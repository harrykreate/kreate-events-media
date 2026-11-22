// Lists every file of the team page with its size and checksum, for the deploy-time download check.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const walk = d => readdirSync(d).flatMap(n => { const f = path.join(d, n); return statSync(f).isDirectory() ? walk(f) : [f]; });
const files = walk(here).map(f => path.relative(here, f).split(path.sep).join('/')).filter(f => f !== 'manifest.json' && !f.startsWith('.')).sort()
  .map(f => { const b = readFileSync(path.join(here, f)); return { path: f, bytes: b.length, sha256: createHash('sha256').update(b).digest('hex') }; });
writeFileSync(path.join(here, 'manifest.json'), JSON.stringify({ files }, null, 1) + '\n');
console.log(`${files.length} files, ${(files.reduce((s, f) => s + f.bytes, 0) / 1048576).toFixed(1)} MB`);
