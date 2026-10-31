// Ordre des publications dans le fil. Calculé une fois à l'ouverture (l'ordre ne bouge pas pendant la lecture).
import type { Progression } from './core/store';
import type { Publication, TypePublication } from './types';
import { hacher } from './core/hasard';
import { jour } from './core/store';

export type Onglet = 'pour-vous' | 'mes-matieres' | 'monde' | 'enregistres' | 'historique';
export interface Filtres { matiere: string; type: string; niveau: string; langue: string }
export const FILTRES_VIDES: Filtres = { matiere: '', type: '', niveau: '', langue: '' };

const POIDS_TYPE: Partial<Record<TypePublication, number>> = {
  dossier: 1.2, concept: 1, quiz: 1.1, infographie: 1.2, frise: 1.3, comparaison: 0.8, langue: 0.7, cas: 1.1, exercice: 0.9,
  sujet: 0.6, monde: 1.5, donnees: 1.4, debat: 1.3,
};
const MATIERES_MONDE = new Set(['eco', 'mks', 'tci', 'ici', 'mgi']);

export function filtrer(liste: Publication[], f: Filtres): Publication[] {
  return liste.filter((x) => (!f.matiere || x.m === f.matiere) && (!f.type || x.type === f.type)
    && (!f.niveau || String(x.niv) === f.niveau) && (!f.langue || x.l === f.langue));
}

/** Matières préférées : choix explicite, sinon matières travaillées, sinon toutes. */
export function matieresSuivies(p: Progression): string[] {
  if (p.preferences.mesMatieres.length) return p.preferences.mesMatieres;
  const compte: Record<string, number> = {};
  for (const j of Object.values(p.activite)) for (const [m, n] of Object.entries(j)) compte[m] = (compte[m] ?? 0) + n;
  return Object.keys(compte);
}

export function classer(liste: Publication[], onglet: Onglet, p: Progression, maintenant = Date.now()): Publication[] {
  const jourCle = jour(maintenant);
  if (onglet === 'enregistres') return liste.filter((x) => p.enregistres[x.id]).sort((a, b) => p.enregistres[b.id].t - p.enregistres[a.id].t);
  if (onglet === 'historique') {
    const pos = new Map(p.historique.map((h, i) => [h.id, i]));
    return liste.filter((x) => pos.has(x.id)).sort((a, b) => pos.get(a.id)! - pos.get(b.id)!);
  }
  const suivies = new Set(matieresSuivies(p));
  let base = liste;
  if (onglet === 'mes-matieres' && suivies.size) base = liste.filter((x) => suivies.has(x.m));
  if (onglet === 'monde') {
    const edito = liste.filter((x) => x.edito).sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
    const cours = liste.filter((x) => !x.edito && MATIERES_MONDE.has(x.m) && ['dossier', 'cas', 'frise', 'comparaison', 'infographie', 'debat', 'concept'].includes(x.type));
    return [...edito, ...diversifier(trier(cours, p, suivies, jourCle))];
  }
  return diversifier(trier(base, p, suivies, jourCle));
}

function trier(liste: Publication[], p: Progression, suivies: Set<string>, jourCle: string) {
  const score = (x: Publication) => {
    const m = p.marques[x.id] ?? {};
    let s = (POIDS_TYPE[x.type] ?? 1) + (hacher(x.id + jourCle) % 1000) / 400; // part de découverte, renouvelée chaque jour
    if (suivies.has(x.m)) s += 1.2;
    if (m.aRevoir) s += 2.5;
    if (m.compris) s -= 3;
    if (m.lu) s -= 2.2;
    if (m.vu && !m.lu) s -= 0.4;
    if (x.edito) s += 0.8;
    return s;
  };
  return liste.map((x) => ({ x, s: score(x) })).sort((a, b) => b.s - a.s).map((e) => e.x);
}

/** Évite deux publications du même type ou de la même matière à la suite. */
function diversifier(liste: Publication[]): Publication[] {
  const reste = [...liste];
  const out: Publication[] = [];
  while (reste.length) {
    const prec = out[out.length - 1];
    let i = reste.findIndex((x) => !prec || (x.type !== prec.type && x.m !== prec.m));
    if (i < 0) i = 0;
    out.push(reste.splice(i, 1)[0]);
    if (out.length > 400) { out.push(...reste); break; }
  }
  return out;
}
