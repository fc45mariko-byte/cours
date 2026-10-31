// Statut d'apprentissage d'une notion, en six niveaux.
// L'activité (ouvrir, lire) fait avancer jusqu'à « En apprentissage » ; au-delà, seuls les résultats comptent,
// sauf « Compris » qui peut aussi être déclaré explicitement. « Maîtrisé » exige une évaluation réussie.
import type { Maitrise } from './maitrise';
import type { Marques } from './store';

export type Statut = 'inexplore' | 'decouvert' | 'apprentissage' | 'pratique' | 'compris' | 'maitrise';
export const ORDRE_STATUT: Statut[] = ['inexplore', 'decouvert', 'apprentissage', 'pratique', 'compris', 'maitrise'];
export const LIBELLE_STATUT: Record<Statut, string> = {
  inexplore: 'Non exploré', decouvert: 'Découvert', apprentissage: 'En apprentissage',
  pratique: 'Pratiqué', compris: 'Compris', maitrise: 'Maîtrisé',
};
export const rangStatut = (s: Statut) => ORDRE_STATUT.indexOf(s);

export function statutDepuis(m: Maitrise, marques: Marques[], vue: boolean): Statut {
  const declareCompris = marques.some((x) => x.compris);
  const lu = marques.some((x) => x.lu || x.compris);
  if (m.tentatives > 0) {
    if (m.etat === 'maitrisee') return 'maitrise';
    if (m.score >= 75) return 'compris';
    if (m.score >= 40) return declareCompris ? 'compris' : 'pratique';
    return 'apprentissage';
  }
  if (declareCompris) return 'compris';
  if (lu) return 'apprentissage';
  if (vue || marques.some((x) => x.vu)) return 'decouvert';
  return 'inexplore';
}
