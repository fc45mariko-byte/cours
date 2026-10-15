// Copie le site construit (dist/) à la racine du dépôt, pour GitHub Pages en mode « branche ».
import { cpSync, rmSync, existsSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
if (!existsSync(join(DIST, 'index.html'))) { console.error('dist/index.html absent : lancer vite build'); process.exit(1); }
rmSync(join(ROOT, 'assets'), { recursive: true, force: true });
cpSync(join(DIST, 'assets'), join(ROOT, 'assets'), { recursive: true });
cpSync(join(DIST, 'index.html'), join(ROOT, 'index.html'));
writeFileSync(join(ROOT, '.nojekyll'), '');
console.log('✓ site publié à la racine (index.html, assets/)');
