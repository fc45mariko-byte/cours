// Calcul de la maîtrise d'une notion à partir des résultats, jamais de la simple consultation.
import type { EtatCarte, Note } from './srs';

export interface Tentative { t: number; ok: boolean }
export type EtatMaitrise = 'nouvelle' | 'fragile' | 'en-cours' | 'maitrisee';
export interface Maitrise { score: number; etat: EtatMaitrise; tentatives: number; derniere: number }

const JOUR = 86_400_000;
const POIDS_NIVEAU: Record<number, number> = { 1: 1, 2: 1.5, 3: 2 };
const VALEUR_NOTE: Record<Note, number> = { revoir: 0, difficile: 0.5, correct: 0.8, facile: 1 };

/** Moyenne pondérée des 10 dernières tentatives : les plus récentes et les plus difficiles pèsent davantage. */
function moyenneRecente(items: { t: number; ok: number; poids: number }[]): number | null {
  if (!items.length) return null;
  const recents = [...items].sort((a, b) => b.t - a.t).slice(0, 10);
  let num = 0, den = 0;
  recents.forEach((it, k) => { const w = Math.pow(0.85, k) * it.poids; num += w * it.ok; den += w; });
  return num / den;
}

export interface EntreesMaitrise {
  qcm: { niveau: number; tentatives: Tentative[] }[];
  exercices: { niveau: number; tentatives: Tentative[] }[];
  cartes: (EtatCarte | undefined)[];
}

export function calculerMaitrise(e: EntreesMaitrise, maintenant = Date.now()): Maitrise {
  const q = e.qcm.flatMap((x) => x.tentatives.map((t) => ({ t: t.t, ok: t.ok ? 1 : 0, poids: POIDS_NIVEAU[x.niveau] ?? 1 })));
  const ex = e.exercices.flatMap((x) => x.tentatives.map((t) => ({ t: t.t, ok: t.ok ? 1 : 0, poids: POIDS_NIVEAU[x.niveau] ?? 1 })));
  const fc = e.cartes.flatMap((c) => (c?.historique.length ? [c.historique[c.historique.length - 1]] : []))
    .map((h) => ({ t: h.t, ok: VALEUR_NOTE[h.note], poids: 1 }));

  const tentatives = q.length + ex.length + fc.length;
  if (!tentatives) return { score: 0, etat: 'nouvelle', tentatives: 0, derniere: 0 };

  const composantes: [number | null, number][] = [[moyenneRecente(q), 0.5], [moyenneRecente(ex), 0.35], [moyenneRecente(fc), 0.15]];
  let num = 0, den = 0;
  for (const [v, w] of composantes) if (v !== null) { num += v * w; den += w; }
  let score = den ? num / den : 0;

  // Peu de tentatives : le score reste prudent.
  const preuves = q.length + ex.length;
  if (preuves < 3) score *= 0.6 + 0.4 * (preuves / 3);

  // Oubli progressif après 30 jours sans activité.
  const derniere = Math.max(...[...q, ...ex, ...fc].map((x) => x.t));
  const jours = (maintenant - derniere) / JOUR;
  if (jours > 30) score *= Math.exp(-(jours - 30) / 60);

  const reussiteAvancee =
    e.qcm.some((x) => x.niveau >= 2 && x.tentatives.some((t) => t.ok)) ||
    e.exercices.some((x) => x.niveau >= 2 && x.tentatives.some((t) => t.ok));

  const pct = Math.round(score * 100);
  let etat: EtatMaitrise = pct < 40 ? 'fragile' : pct < 75 ? 'en-cours' : 'maitrisee';
  if (etat === 'maitrisee' && (!reussiteAvancee || jours > 30)) etat = 'en-cours';
  return { score: pct, etat, tentatives, derniere };
}

export const LIBELLE_ETAT: Record<EtatMaitrise, string> = {
  nouvelle: 'Non commencée', fragile: 'Fragile', 'en-cours': 'En cours', maitrisee: 'Maîtrisée',
};
