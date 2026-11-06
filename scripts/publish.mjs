// Copie le site construit (dist/) à la racine du dépôt, pour GitHub Pages en mode « branche ».
// Fichiers publiés : index.html, assets/ et les fichiers statiques de app/public. Les PDF des cahiers sont
// écrits directement dans imprimables/ par scripts/imprimables.mjs.
import { cpSync, rmSync, existsSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
if (!existsSync(join(DIST, 'index.html'))) { console.error('dist/index.html absent : lancer vite build'); process.exit(1); }
rmSync(join(ROOT, 'assets'), { recursive: true, force: true });
for (const f of readdirSync(DIST)) {
  const src = join(DIST, f);
  if (statSync(src).isDirectory() && f !== 'assets') continue;
  cpSync(src, join(ROOT, f), { recursive: true });
}
writeFileSync(join(ROOT, '.nojekyll'), '');
console.log('✓ site publié à la racine (index.html, assets/, manifeste, service worker, icônes)');
