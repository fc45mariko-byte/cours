// Plan de révision en 14 jours, construit à partir des matières de l'emploi du temps.
//
// Principes (méthodes d'apprentissage dont l'efficacité est la mieux établie) :
// - rappel actif : après chaque lecture de synthèse, on récite sans regarder (questions de récitation) ;
// - répétition espacée : chaque chapitre appris le jour J revient en récitation à J+1, J+3 et J+7 ;
// - alternance : chaque jour mêle une matière « technique » et une matière « langues et civilisations » ;
// - charge régulière : les chapitres sont répartis pour que chaque jour ait à peu près le même volume.
// Jours 1 à 10 : apprendre ; jours 11 et 12 : consolider (par cœur, examens blancs) ; jours 13 et 14 : points faibles et récitation finale.
import type { MatiereCatalogue } from './types';

export interface Bloc { matiere: string; chapitres: string[]; notions: number }
export interface JourPlan {
  n: number;
  phase: 'apprendre' | 'consolider' | 'final';
  nouveaux: Bloc[];
  revisions: { jour: number; blocs: Bloc[] }[]; // récitation espacée (J-1, J-3, J-7)
  matieres: string[]; // matières concernées par la consolidation (jours 11-12)
}

export const JOURS_APPRENTISSAGE = 10;
const LANGUES = new Set(['Anglais', 'Espagnol', 'Civilisations', 'Méthodologie']);

/** Découpe une suite de chapitres en `n` jours de volume comparable (en nombre de notions). */
function repartir(chapitres: { matiere: string; id: string; notions: number }[], n: number): Bloc[][] {
  const total = chapitres.reduce((s, c) => s + c.notions, 0);
  const jours: Bloc[][] = Array.from({ length: n }, () => []);
  let cumul = 0;
  for (const c of chapitres) {
    // Jour choisi selon la position du milieu du chapitre dans le volume total.
    const j = Math.min(n - 1, Math.floor(((cumul + c.notions / 2) / Math.max(1, total)) * n));
    cumul += c.notions;
    const blocs = jours[j];
    const dernier = blocs[blocs.length - 1];
    if (dernier && dernier.matiere === c.matiere) { dernier.chapitres.push(c.id); dernier.notions += c.notions; }
    else blocs.push({ matiere: c.matiere, chapitres: [c.id], notions: c.notions });
  }
  return jours;
}

export function construirePlan(matieres: MatiereCatalogue[]): JourPlan[] {
  const prioritaires = matieres.filter((m) => m.emploiDuTemps && m.completude !== 'absente' && m.chapitres.length);
  const pistes = [prioritaires.filter((m) => !LANGUES.has(m.categorie)), prioritaires.filter((m) => LANGUES.has(m.categorie))];
  const chapitresDe = (ms: MatiereCatalogue[]) => ms.flatMap((m) => m.chapitres.map((c) => ({ matiere: m.id, id: c.id, notions: Math.max(1, c.notions.length) })));
  const [a, b] = pistes.map((ms) => repartir(chapitresDe(ms), JOURS_APPRENTISSAGE));
  const appris: Bloc[][] = Array.from({ length: JOURS_APPRENTISSAGE }, (_, i) => [...a[i], ...b[i]]);

  const plan: JourPlan[] = [];
  for (let n = 1; n <= 14; n++) {
    const revisions = [1, 3, 7].map((d) => n - d).filter((j) => j >= 1 && j <= JOURS_APPRENTISSAGE).map((j) => ({ jour: j, blocs: appris[j - 1] }));
    if (n <= JOURS_APPRENTISSAGE) plan.push({ n, phase: 'apprendre', nouveaux: appris[n - 1], revisions, matieres: [] });
    else if (n <= 12) plan.push({ n, phase: 'consolider', nouveaux: [], revisions, matieres: pistes[n - 11].map((m) => m.id) });
    else plan.push({ n, phase: 'final', nouveaux: [], revisions, matieres: prioritaires.map((m) => m.id) });
  }
  return plan;
}

/** Jour du plan (1 à 14) à une date donnée, d'après la date de début ; 0 si pas commencé. */
export function jourDuPlan(debut: number | undefined, maintenant = Date.now()): number {
  if (!debut) return 0;
  const d = new Date(debut); d.setHours(0, 0, 0, 0);
  const a = new Date(maintenant); a.setHours(0, 0, 0, 0);
  return Math.max(1, Math.min(14, Math.round((a.getTime() - d.getTime()) / 86_400_000) + 1));
}
