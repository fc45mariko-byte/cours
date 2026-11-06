// Génère un PDF A4 par cahier d'exercices (avec corrigés en fin de document) dans imprimables/, à la racine
// publiée par GitHub Pages (lien ./imprimables/<matière>.pdf).
// Usage : npm run build, puis npm run imprimables [matière…].
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SORTIE = join(ROOT, 'imprimables');
const PORT = 4179;
const index = JSON.parse(readFileSync(join(ROOT, 'app', 'src', 'generated', 'index.json'), 'utf8'));
const seulement = process.argv.slice(2);
const cahiers = index.cahiers.filter((c) => !seulement.length || seulement.includes(c.matiere));
mkdirSync(SORTIE, { recursive: true });

const serveur = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
const attendre = async () => {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(`http://127.0.0.1:${PORT}/`)).ok) return; } catch { /* pas encore prêt */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('serveur de prévisualisation indisponible');
};

try {
  await attendre();
  const navigateur = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await navigateur.newPage();
  for (const c of cahiers) {
    const m = index.matieres.find((x) => x.id === c.matiere);
    await page.goto(`http://127.0.0.1:${PORT}/#/cahier/${c.matiere}`);
    await page.waitForSelector('.cahier .corriges', { timeout: 20000 });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({
      path: join(SORTIE, `${c.matiere}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true,
      displayHeaderFooter: true, headerTemplate: '<span></span>',
      footerTemplate: `<div style="font-size:8px;width:100%;padding:0 14mm;display:flex;justify-content:space-between;color:#666;font-family:sans-serif"><span>${m.titre} · cahier d’exercices · LEA, The Learning Journal</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    });
    console.log(`✓ ${c.matiere}.pdf (${c.exercices} exercices)`);
  }
  await navigateur.close();
} finally {
  serveur.kill();
}
