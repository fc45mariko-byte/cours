// Génère les PDF A4 dans imprimables/, à la racine publiée par GitHub Pages :
// - <matière>.pdf : exercices express (un par chapitre, corrigés en fin de document) ;
// - complet/<matière>.pdf : cahier complet ;
// - syntheses/<matière>.pdf et syntheses/semestre.pdf : synthèses.
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
const pied = (texte) => `<div style="font-size:8px;width:100%;padding:0 14mm;display:flex;justify-content:space-between;color:#666;font-family:sans-serif"><span>${texte} · LEA, The Learning Journal</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`;
const syntheses = index.syntheses.filter((s) => !seulement.length || seulement.includes(s.matiere));
mkdirSync(join(SORTIE, 'complet'), { recursive: true });
mkdirSync(join(SORTIE, 'syntheses'), { recursive: true });

try {
  await attendre();
  const navigateur = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await navigateur.newPage();
  const imprimer = async (url, selecteur, chemin, texte) => {
    await page.emulateMedia({ media: 'screen' });
    await page.goto(`http://127.0.0.1:${PORT}/${url}`);
    await page.waitForSelector(selecteur, { timeout: 20000 });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: chemin, format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true, headerTemplate: '<span></span>', footerTemplate: pied(texte) });
  };
  for (const c of cahiers) {
    const m = index.matieres.find((x) => x.id === c.matiere);
    await imprimer(`#/cahier/${c.matiere}`, '.cahier .corriges', join(SORTIE, `${c.matiere}.pdf`), `${m.titre} · exercices express`);
    await imprimer(`#/cahier/${c.matiere}?format=complet`, '.cahier .corriges', join(SORTIE, 'complet', `${c.matiere}.pdf`), `${m.titre} · cahier d’exercices complet`);
    console.log(`✓ ${c.matiere}.pdf (express) et complet/${c.matiere}.pdf (${c.exercices} exercices)`);
  }
  for (const s of syntheses) {
    const m = index.matieres.find((x) => x.id === s.matiere);
    await imprimer(`#/synthese/${s.matiere}`, '.synthese .synthese-fin', join(SORTIE, 'syntheses', `${s.matiere}.pdf`), `${m.titre} · synthèse`);
    console.log(`✓ syntheses/${s.matiere}.pdf`);
  }
  if (!seulement.length) {
    await imprimer('#/syntheses/imprimer', '.syntheses-semestre .synthese-fin', join(SORTIE, 'syntheses', 'semestre.pdf'), 'Synthèses du semestre (emploi du temps S5)');
    console.log('✓ syntheses/semestre.pdf');
  }
  await navigateur.close();
} finally {
  serveur.kill();
}
