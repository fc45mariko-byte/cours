// Notes estimées : la note /20 que l'étudiante obtiendrait probablement si l'examen avait lieu maintenant.
//
// Méthode (transparente, recalculée à chaque affichage) :
// 1. Chaque notion rédigée de la matière reçoit un niveau de 0 à 1.
//    - Si elle a été travaillée (QCM, exercices, flashcards) : la maîtrise mesurée (core/maitrise.ts), qui pondère
//      les essais récents et difficiles, reste prudente avec peu d'essais et baisse après 30 jours sans activité.
//    - Sinon, seuls des indices déclaratifs comptent, plafonnés bas : chapitre de synthèse « Je sais » 0,5,
//      « À revoir » 0,2, notion « comprise » 0,45, « lue » 0,25, chapitre terminé 0,25, fiche ouverte 0,1.
// 2. L'examen couvre tout le programme : le niveau de la matière est la moyenne de toutes ses notions,
//    y compris celles jamais travaillées (qui comptent 0).
// 3. Un examen blanc récent (moins de 21 jours, 5 questions ou plus) sur toute la matière est un échantillon du
//    programme : son taux sert de niveau aux notions qu'il n'a pas interrogées, et il compte pour moitié dans la note.
// 4. Note = 20 × niveau, arrondie au demi-point. La fourchette s'élargit quand peu de notions ont été mesurées.
import { index, maitriseNotion, notionsDuPerimetre } from './data';
import type { Progression } from './core/store';
import type { MatiereCatalogue } from './types';

const JOUR = 86_400_000;
export type Confiance = 'aucune' | 'faible' | 'moyenne' | 'bonne';

export interface NiveauChapitre { id: string; titre: string; niveau: number; mesure: number; total: number }
export interface EstimationNote {
  matiere: string;
  note: number | null;           // null : rien sur quoi s'appuyer
  min: number; max: number;
  confiance: Confiance;
  couverture: number;             // part des notions mesurées par des essais (0 à 1)
  essais: number;
  examen?: { score: number; total: number; t: number };
  chapitres: NiveauChapitre[];    // du plus faible au plus fort
  limite?: string;                // ce que l'estimation ne mesure pas
  indisponible?: string;          // matière sans contenu
}

/** Niveau d'une notion jamais travaillée, d'après les seuls indices déclaratifs. */
export function niveauDeclaratif(notion: string, chapitre: string, p: Progression): number {
  const synth = p.marques[`synth:${chapitre}`];
  const m = p.marques[notion];
  return Math.max(
    synth?.compris ? 0.5 : 0, synth?.aRevoir ? 0.2 : 0,
    m?.compris ? 0.45 : 0, m?.lu ? 0.25 : 0,
    p.chapitres[chapitre]?.termine ? 0.25 : 0,
    m?.vu || p.vues[notion] ? 0.1 : 0,
  );
}

const arrondi = (x: number) => Math.round(x * 2) / 2;
const LANGUES = new Set(['Anglais', 'Espagnol', 'Civilisations', 'Méthodologie']);

export function estimerNote(m: MatiereCatalogue, p: Progression, maintenant = Date.now()): EstimationNote {
  const base = { matiere: m.id, min: 0, max: 20, couverture: 0, essais: 0, chapitres: [] as NiveauChapitre[] };
  if (m.completude === 'absente') return { ...base, note: null, confiance: 'aucune', indisponible: 'Les supports de ce cours ne sont pas encore dans l’application : aucune estimation possible.' };

  const ids = notionsDuPerimetre([m.id]).filter((n) => index.notions[n]?.redigee);
  // Examen blanc sur toute la matière (un examen sur un seul chapitre ne vaut pas pour le reste du programme).
  const examens = p.examensPasses.filter((e) => e.filtre === m.id && e.total >= 5 && maintenant - e.t < 21 * JOUR);
  const dernier = examens.sort((a, b) => b.t - a.t)[0];
  const tauxExamen = dernier ? dernier.score / dernier.total : 0;
  let somme = 0, mesurees = 0, essais = 0, indices = 0;
  const parChap = new Map<string, { s: number; mesure: number; total: number }>();
  for (const n of ids) {
    const ch = index.notions[n].chapitre;
    const mt = maitriseNotion(n, p, maintenant);
    let v: number;
    if (mt.tentatives > 0) { v = mt.score / 100; mesurees++; essais += mt.tentatives; }
    else { v = Math.max(niveauDeclaratif(n, ch, p), tauxExamen); if (v > 0) indices++; }
    somme += v;
    const c = parChap.get(ch) ?? { s: 0, mesure: 0, total: 0 };
    c.s += v; c.total++; if (mt.tentatives > 0) c.mesure++;
    parChap.set(ch, c);
  }
  const chapitres = m.chapitres.filter((c) => parChap.has(c.id)).map((c) => {
    const x = parChap.get(c.id)!;
    return { id: c.id, titre: c.titre, niveau: x.s / x.total, mesure: x.mesure, total: x.total };
  }).sort((a, b) => a.niveau - b.niveau);

  const limite = LANGUES.has(m.categorie) || ['tra', 'tve', 'red'].includes(m.id)
    ? 'L’expression écrite et orale (rédaction, traduction, commentaire) n’est pas corrigée par l’application : l’estimation mesure les connaissances, pas la qualité de la copie.'
    : undefined;

  if (!ids.length || (!mesurees && !indices && !dernier)) {
    return { ...base, note: null, confiance: 'aucune', chapitres, limite };
  }
  const couverture = mesurees / ids.length;
  let niveau = somme / ids.length;
  if (dernier) niveau = 0.5 * niveau + 0.5 * (dernier.score / dernier.total);

  const note = arrondi(20 * niveau);
  const ecart = Math.max(1, 1.5 + 5 * (1 - couverture) - (dernier ? 1.5 : 0));
  const confiance: Confiance = !mesurees && !dernier ? 'faible' : couverture >= 0.6 || (dernier && couverture >= 0.25) ? 'bonne' : couverture >= 0.25 || dernier ? 'moyenne' : 'faible';
  return {
    ...base, note, confiance, couverture, essais, chapitres, limite,
    min: arrondi(Math.max(0, note - ecart)), max: arrondi(Math.min(20, note + ecart)),
    examen: dernier ? { score: dernier.score, total: dernier.total, t: dernier.t } : undefined,
  };
}

/** Matières notées ce semestre : celles de l'emploi du temps. */
export const matieresDuSemestre = () => index.matieres.filter((m) => m.emploiDuTemps);

export function estimerSemestre(p: Progression, maintenant = Date.now()) {
  const notes = matieresDuSemestre().map((m) => estimerNote(m, p, maintenant));
  const chiffrees = notes.filter((n) => n.note !== null);
  const moyenne = chiffrees.length ? arrondi(chiffrees.reduce((s, n) => s + n.note!, 0) / chiffrees.length) : null;
  return { notes, moyenne, chiffrees: chiffrees.length };
}

export function appreciation(note: number): { libelle: string; ton: 'danger' | 'fragile' | 'juste' | 'bien' } {
  if (note < 8) return { libelle: 'Non validé', ton: 'danger' };
  if (note < 10) return { libelle: 'À consolider', ton: 'fragile' };
  if (note < 12) return { libelle: 'Validé de justesse', ton: 'juste' };
  if (note < 14) return { libelle: 'Assez bien', ton: 'bien' };
  if (note < 16) return { libelle: 'Bien', ton: 'bien' };
  return { libelle: 'Très bien', ton: 'bien' };
}

export const LIBELLE_CONFIANCE: Record<Confiance, string> = {
  aucune: 'pas de données', faible: 'fiabilité faible', moyenne: 'fiabilité moyenne', bonne: 'bonne fiabilité',
};
