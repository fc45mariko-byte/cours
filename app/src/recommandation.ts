// Moteur de recommandation du fil.
//
// Principe : chaque publication reçoit un score qui combine ce qu'il est utile d'apprendre maintenant
// (besoin pédagogique, échéance de révision, prérequis) et ce que l'étudiante lit volontiers
// (affinités par matière et par format, apprises de ses interactions), corrigé par la lassitude
// (publications déjà montrées sans réaction) et par le moment de la journée.
// Le fil est ensuite réordonné pour varier formats, matières et chapitres, avec des places réservées
// à la découverte. Il change :
//   - à chaque « édition » (toutes les 3 heures) ou quand on demande « Actualiser » ;
//   - pendant la lecture : chaque nouveau lot est recalculé avec la progression du moment,
//     sans jamais déplacer ce qui est déjà affiché.
// Tout est calculé sur l'appareil, sans service externe, et chaque recommandation est expliquée.
import { index } from './data';
import { statutNotion } from './jeu';
import { hacher } from './core/hasard';
import { rangStatut, type Statut } from './core/statut';
import type { Progression } from './core/store';
import type { Publication, TypePublication } from './types';

const HEURE = 3_600_000;
const JOUR = 24 * HEURE;
export const DUREE_EDITION = 3 * HEURE;

/** Besoin d'apprentissage selon le statut : on pousse ce qui est en cours d'acquisition. */
const BESOIN: Record<Statut, number> = { inexplore: 0.55, decouvert: 0.85, apprentissage: 1, pratique: 0.85, compris: 0.35, maitrise: 0.12 };
/** Intervalle de révision conseillé (jours) selon le statut, à la manière de la répétition espacée. */
const INTERVALLE: Partial<Record<Statut, number>> = { decouvert: 1, apprentissage: 1, pratique: 2, compris: 6, maitrise: 21 };
/** Formats qui permettent de s'évaluer : privilégiés quand une notion a été lue mais pas testée. */
const EVALUATIFS: TypePublication[] = ['quiz', 'cas', 'exercice', 'comparaison'];
const COURTS: TypePublication[] = ['concept', 'quiz', 'langue', 'comparaison', 'infographie'];

export type Raison =
  | 'a-revoir' | 'echeance' | 'prochaine-etape' | 'tester' | 'en-cours' | 'matiere-suivie'
  | 'decouverte' | 'actualite' | 'format-apprecie' | 'moment';
export const LIBELLE_RAISON: Record<Raison, string> = {
  'a-revoir': 'Vous l’avez marquée « à revoir »',
  echeance: 'C’est le bon moment pour la revoir',
  'prochaine-etape': 'Prochaine étape : ses prérequis sont acquis',
  tester: 'Lue, pas encore testée',
  'en-cours': 'Notion en cours d’apprentissage',
  'matiere-suivie': 'Dans vos matières',
  decouverte: 'Pour élargir vos lectures',
  actualite: 'Monde et économie',
  'format-apprecie': 'Un format que vous lisez volontiers',
  moment: 'Format adapté à ce moment de la journée',
};

const PRIORITE: Raison[] = ['a-revoir', 'tester', 'echeance', 'prochaine-etape', 'actualite', 'en-cours', 'matiere-suivie', 'format-apprecie', 'moment'];

export interface Recommandation { pub: Publication; score: number; raison: Raison }

// ---------- Édition ----------
/** Identifiant de l'édition courante : change toutes les 3 heures et à chaque actualisation demandée. */
export function edition(p: Progression, maintenant = Date.now()) {
  return `${Math.floor(maintenant / DUREE_EDITION)}.${p.fil.actualise}`;
}
export const prochaineEdition = (maintenant = Date.now()) => (Math.floor(maintenant / DUREE_EDITION) + 1) * DUREE_EDITION;

// ---------- Signaux tirés de la progression ----------
export interface Signaux {
  statut: Map<string, Statut>;
  derniere: Map<string, number>; // dernière activité par notion
  affiniteMatiere: Map<string, number>; // 0..1, activité récente (demi-vie 7 jours)
  affiniteType: Map<string, number>; // multiplicateur 0,75..1,3 appris des interactions
  suivies: Set<string>;
  expositionMatiere: Map<string, number>;
}

export function signaux(p: Progression, maintenant = Date.now()): Signaux {
  const statut = new Map<string, Statut>();
  for (const id of Object.keys(index.notions)) if (index.notions[id].redigee) statut.set(id, statutNotion(id, p, maintenant));

  const derniere = new Map<string, number>();
  const noter = (n: string | undefined, t: number | undefined) => { if (n && t && t > (derniere.get(n) ?? 0)) derniere.set(n, t); };
  const notionQ = new Map(index.questions.map((q) => [q.id, q.notion]));
  for (const [id, ts] of Object.entries(p.qcm)) noter(notionQ.get(id), ts.at(-1)?.t);
  const notionsEx = new Map(index.exercices.map((e) => [e.id, e.notions]));
  for (const [cle, ts] of Object.entries(p.exercices)) for (const n of notionsEx.get(cle.split('/')[0]) ?? []) noter(n, ts.at(-1)?.t);
  const notionsF = new Map(index.flashcards.map((f) => [f.id, f.notions]));
  for (const [id, c] of Object.entries(p.cartes)) for (const n of notionsF.get(id) ?? []) noter(n, c.historique.at(-1)?.t);
  for (const [id, m] of Object.entries(p.marques)) {
    const n = index.notions[id] ? id : id.includes(':') && index.notions[id.split(':')[1]] ? id.split(':')[1] : undefined;
    noter(n, Math.max(m.lu ?? 0, m.compris ?? 0));
  }

  // Affinité par matière : activité des 60 derniers jours, pondérée par l'ancienneté (demi-vie 7 jours).
  const brut = new Map<string, number>();
  for (const [j, parMatiere] of Object.entries(p.activite)) {
    const age = (maintenant - Date.parse(j + 'T12:00:00Z')) / JOUR;
    if (age > 60) continue;
    for (const [m, nb] of Object.entries(parMatiere)) brut.set(m, (brut.get(m) ?? 0) + nb * Math.pow(0.5, Math.max(0, age) / 7));
  }
  const max = Math.max(1, ...brut.values());
  const affiniteMatiere = new Map([...brut].map(([m, v]) => [m, v / max]));

  // Affinité par format : (lus, compris ou enregistrés + 2) / (ouverts ou montrés + 4), lissée vers 0,5.
  const engage = new Map<string, number>(), vus = new Map<string, number>();
  const typeDe = (id: string) => id.split(':')[0];
  for (const [id, m] of Object.entries(p.marques)) {
    if (!id.includes(':')) continue;
    const t = typeDe(id);
    vus.set(t, (vus.get(t) ?? 0) + 1);
    if (m.lu || m.compris) engage.set(t, (engage.get(t) ?? 0) + 1);
  }
  for (const id of Object.keys(p.enregistres)) if (id.includes(':')) engage.set(typeDe(id), (engage.get(typeDe(id)) ?? 0) + 1);
  for (const [id, imp] of Object.entries(p.fil.impressions)) vus.set(typeDe(id), (vus.get(typeDe(id)) ?? 0) + Math.min(imp.n, 3) / 3);
  const affiniteType = new Map<string, number>();
  for (const t of new Set([...vus.keys(), ...engage.keys()])) {
    const taux = ((engage.get(t) ?? 0) + 2) / ((vus.get(t) ?? 0) + 4);
    affiniteType.set(t, 0.75 + 0.55 * Math.max(0, Math.min(1, (taux - 0.25) / 0.5)));
  }

  const expositionMatiere = new Map<string, number>();
  for (const id of Object.keys(p.fil.impressions)) {
    const n = id.split(':')[1];
    const m = n?.split('.')[0];
    if (m) expositionMatiere.set(m, (expositionMatiere.get(m) ?? 0) + 1);
  }
  return { statut, derniere, affiniteMatiere, affiniteType, suivies: new Set(p.preferences.mesMatieres), expositionMatiere };
}

// ---------- Score d'une publication ----------
const PREFIXE_TYPE: Record<string, string> = { concept: 'concept', quiz: 'quiz', infographie: 'schema', frise: 'frise', debat: 'debat', comparaison: 'compare', langue: 'mots', dossier: 'dossier', sujet: 'sujet', cas: 'cas', exercice: 'cas' };

export function scorer(x: Publication, p: Progression, s: Signaux, graine: string, maintenant = Date.now()): Recommandation {
  const contributions: [Raison, number][] = [];
  let score = 0;
  const ajouter = (r: Raison | null, v: number) => { score += v; if (r && v > 0) contributions.push([r, v]); };
  const m = p.marques[x.id] ?? {};
  const st = x.n ? s.statut.get(x.n) : undefined;

  // 1. Besoin pédagogique de la notion.
  if (st) {
    ajouter(st === 'apprentissage' || st === 'pratique' ? 'en-cours' : null, BESOIN[st]);
    // 2. Échéance de révision (répétition espacée) : une notion travaillée revient quand il est temps.
    const t = s.derniere.get(x.n!);
    const iv = INTERVALLE[st];
    if (t && iv) {
      const retard = (maintenant - t) / (iv * JOUR);
      if (retard >= 1) ajouter('echeance', Math.min(1.4, 0.5 + 0.45 * (retard - 1)));
      else ajouter(null, -0.6 * (1 - retard)); // trop tôt : on laisse reposer
    }
    // 3. Prérequis : on avance quand les bases sont là, on attend sinon.
    const pre = (index.notions[x.n!]?.prerequis ?? []).filter((q) => s.statut.has(q));
    if (pre.length) {
      const acquis = pre.filter((q) => rangStatut(s.statut.get(q)!) >= rangStatut('compris')).length;
      if (acquis === pre.length && rangStatut(st) < rangStatut('compris')) ajouter('prochaine-etape', 0.55);
      else if (acquis === 0 && st === 'inexplore') ajouter(null, -0.45);
    }
    // 4. Lue mais jamais testée : on propose de s'évaluer plutôt que de relire.
    const lue = p.marques[x.n!]?.lu || p.marques[`concept:${x.n}`]?.lu;
    if (lue && rangStatut(st) <= rangStatut('apprentissage')) {
      if (EVALUATIFS.includes(x.type)) ajouter('tester', 0.7);
      else if (x.type === 'concept') ajouter(null, -0.5);
    }
  } else if (x.edito) {
    const age = x.date ? (maintenant - Date.parse(x.date)) / JOUR : 30;
    ajouter('actualite', 0.55 + Math.max(0, 0.5 - age / 60));
  } else {
    ajouter(null, 0.45);
  }

  // 5. Marques explicites sur la publication.
  if (m.aRevoir) ajouter('a-revoir', 1.6);
  if (m.compris) ajouter(null, -1.6);
  if (m.lu && !m.aRevoir) ajouter(null, -1.2);

  // 6. Intérêts : matières suivies ou travaillées récemment, formats lus volontiers.
  const aff = s.affiniteMatiere.get(x.m) ?? 0;
  ajouter(s.suivies.has(x.m) ? 'matiere-suivie' : null, (s.suivies.has(x.m) ? 0.45 : 0) + 0.4 * aff);
  const at = s.affiniteType.get(PREFIXE_TYPE[x.type] ?? x.type) ?? 1;
  score *= at;
  if (at > 1.12) contributions.push(['format-apprecie', (at - 1) * 2]);

  // 7. Lassitude : déjà montrée plusieurs fois sans réaction, ou montrée très récemment.
  const imp = p.fil.impressions[x.id];
  if (imp && !m.lu && !m.compris && !p.enregistres[x.id]) {
    ajouter(null, -0.32 * Math.min(imp.n, 4));
    if (maintenant - imp.t < 12 * HEURE) ajouter(null, -0.7);
  }

  // 8. Moment de la journée : formats courts aux heures de trajet et de pause, formats longs le soir.
  const h = new Date(maintenant).getHours();
  const trajet = (h >= 7 && h < 9) || (h >= 12 && h < 14) || (h >= 17 && h < 19);
  if (trajet && (COURTS.includes(x.type) || x.min <= 3)) ajouter('moment', 0.25);
  if ((h >= 20 || h < 7) && x.min >= 5) ajouter('moment', 0.25);

  // 9. Part de hasard, renouvelée à chaque édition : deux éditions ne se ressemblent pas.
  ajouter(null, (hacher(x.id + '|' + graine) % 1000) / 1000 * 0.45);

  // La raison affichée suit un ordre de priorité : ce qui est le plus utile à dire à l'étudiante d'abord.
  const presentes = new Set(contributions.map(([r]) => r));
  const raison = PRIORITE.find((r) => presentes.has(r)) ?? 'decouverte';
  return { pub: x, score, raison };
}

// ---------- Mise en page du fil ----------
export interface OptionsFil { graine: string; deja?: Publication[]; nombre?: number; maintenant?: number }

/**
 * Choisit les prochaines publications à afficher.
 * `deja` : publications déjà affichées (elles ne bougent pas et servent au calcul de la diversité).
 */
export function recommander(candidats: Publication[], p: Progression, o: OptionsFil): Recommandation[] {
  const maintenant = o.maintenant ?? Date.now();
  const s = signaux(p, maintenant);
  const affichees = new Set((o.deja ?? []).map((x) => x.id));
  const notionsMontrees = new Set((o.deja ?? []).map((x) => x.n).filter(Boolean));
  const pool = candidats.filter((x) => !affichees.has(x.id)).map((x) => scorer(x, p, s, o.graine, maintenant)).sort((a, b) => b.score - a.score);
  const nombre = Math.min(o.nombre ?? 10, pool.length);
  const choisies: Recommandation[] = [];
  const recents = [...(o.deja ?? [])];
  const fenetre = Math.min(pool.length, 160);

  while (choisies.length < nombre) {
    const position = recents.length;
    // Une place sur six est réservée à la découverte : la matière la moins montrée jusqu'ici.
    if (position > 0 && position % 6 === 5) {
      const expo = (m: string) => (s.expositionMatiere.get(m) ?? 0) + recents.filter((x) => x.m === m).length * 3;
      const candidat = pool.slice(0, Math.min(pool.length, 400))
        .filter((r) => !notionsMontrees.has(r.pub.n) && r.pub.m !== recents.at(-1)?.m)
        .sort((a, b) => expo(a.pub.m) - expo(b.pub.m) || b.score - a.score)[0];
      if (candidat) { prendre(candidat, 'decouverte'); continue; }
    }
    let meilleur = -1, meilleurScore = -Infinity;
    for (let i = 0; i < Math.min(fenetre, pool.length); i++) {
      const r = pool[i];
      let v = r.score;
      const prec = recents.at(-1);
      if (prec && prec.type === r.pub.type) v -= 0.9;
      if (prec && prec.m === r.pub.m) v -= 0.6;
      v -= 0.25 * recents.slice(-4).filter((x) => x.type === r.pub.type).length;
      if (r.pub.c && recents.slice(-6).some((x) => x.c === r.pub.c)) v -= 0.45;
      if (r.pub.n && notionsMontrees.has(r.pub.n)) v -= 1.2;
      if (v > meilleurScore) { meilleurScore = v; meilleur = i; }
    }
    if (meilleur < 0) break;
    prendre(pool[meilleur]);
  }
  return choisies;

  function prendre(r: Recommandation, raison?: Raison) {
    pool.splice(pool.indexOf(r), 1);
    const x = raison ? { ...r, raison } : r;
    choisies.push(x);
    recents.push(r.pub);
    if (r.pub.n) notionsMontrees.add(r.pub.n);
  }
}
