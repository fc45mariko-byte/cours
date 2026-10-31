// Inventaire des identifiants du contenu pédagogique (matières, chapitres, notions, QCM, flashcards, exercices).
// La progression des utilisateurs repose sur ces identifiants : aucun ne doit disparaître pendant la refonte.
// Usage : node scripts/inventaire.mjs            → affiche le résumé
//         node scripts/inventaire.mjs --ecrire   → met à jour tests/reference/inventaire-contenu.json
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const REFERENCE = join(ROOT, 'tests/reference/inventaire-contenu.json');

export function inventaire() {
  const cat = JSON.parse(readFileSync(join(ROOT, 'content/catalogue.json'), 'utf8'));
  const inv = { matieres: [], chapitres: [], notions: [], questions: [], flashcards: [], exercices: [] };
  for (const m of cat.matieres) {
    inv.matieres.push(m.id);
    for (const c of m.chapitres) {
      inv.chapitres.push(c.id);
      inv.notions.push(...c.notions.map((n) => n.id));
      const p = join(ROOT, 'content', m.id, `${c.id}.json`);
      if (!existsSync(p)) continue;
      const f = JSON.parse(readFileSync(p, 'utf8'));
      inv.questions.push(...(f.questions ?? []).map((q) => q.id));
      inv.flashcards.push(...(f.flashcards ?? []).map((x) => x.id));
      inv.exercices.push(...(f.exercices ?? []).flatMap((e) => [e.id, ...e.questions.map((q) => `${e.id}/${q.id}`)]));
    }
  }
  for (const k of Object.keys(inv)) inv[k].sort();
  return inv;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const inv = inventaire();
  console.log(Object.entries(inv).map(([k, v]) => `${k} : ${v.length}`).join(' · '));
  if (process.argv.includes('--ecrire')) {
    mkdirSync(dirname(REFERENCE), { recursive: true });
    writeFileSync(REFERENCE, JSON.stringify({ etabliLe: new Date().toISOString().slice(0, 10), ...inv }, null, 1) + '\n');
    console.log(`✓ référence écrite : ${REFERENCE}`);
  }
}
