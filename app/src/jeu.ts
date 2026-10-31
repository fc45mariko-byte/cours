// Progression ludique : XP, niveaux, quêtes, badges, régularité.
// Tout est dérivé d'activités pédagogiques réelles enregistrées dans la progression.
// Chaque gain d'XP a une clé unique : la même action n'est jamais comptée deux fois.
import { index, maitriseNotion, niveauQuestion, exerciceDeCle, notionsDuPerimetre } from './data';
import { statutDepuis, rangStatut, type Statut } from './core/statut';
import { jour, store, type EvenementXp, type Progression } from './core/store';
import { hacher } from './core/hasard';

const JOUR = 86_400_000;
const LANGUES = new Set(['aec', 'tra', 'cea', 'eec', 'tve']);

// ---------- Statuts ----------
export function statutNotion(id: string, p: Progression, maintenant = Date.now()): Statut {
  const marques = [p.marques[id], p.marques[`concept:${id}`], p.marques[`quiz:${id}`]].filter(Boolean) as NonNullable<Progression['marques'][string]>[];
  return statutDepuis(maitriseNotion(id, p, maintenant), marques, !!p.vues[id]);
}
export function statutsPerimetre(perimetre: string, p: Progression) {
  const ids = notionsDuPerimetre(perimetre ? [perimetre] : []).filter((n) => index.notions[n].redigee);
  const parStatut: Record<Statut, string[]> = { inexplore: [], decouvert: [], apprentissage: [], pratique: [], compris: [], maitrise: [] };
  for (const id of ids) parStatut[statutNotion(id, p)].push(id);
  return { ids, parStatut };
}

// ---------- Niveaux ----------
/** XP cumulée nécessaire pour atteindre le niveau n (n ≥ 1). */
export const seuilNiveau = (n: number) => 50 * (n - 1) * n;
export function niveau(xp: number) {
  let n = 1;
  while (xp >= seuilNiveau(n + 1)) n++;
  const bas = seuilNiveau(n), haut = seuilNiveau(n + 1);
  return { niveau: n, xp, depuis: xp - bas, pour: haut - bas, prochain: haut };
}
export const xpTotale = (p: Progression) => Object.values(p.xp).reduce((s, e) => s + e.xp, 0);

// ---------- Événements dérivés de l'activité ----------
export function evenementsDerives(p: Progression, maintenant = Date.now()): Record<string, EvenementXp> {
  const ev: Record<string, EvenementXp> = {};
  for (const [id, ts] of Object.entries(p.qcm)) {
    const ok = ts.find((t) => t.ok);
    if (ok) ev[`qcm:${id}`] = { t: ok.t, xp: 5 * (niveauQuestion.get(id) ?? 1), motif: 'Question réussie' };
  }
  for (const [cle, ts] of Object.entries(p.exercices)) {
    const ok = ts.find((t) => t.ok);
    const e = exerciceDeCle(cle);
    if (ok && e) {
      const mat = e.chapitre.split('.')[0];
      const motif = e.type === 'traduction' || mat === 'tra' || mat === 'tve' ? 'Traduction réussie' : e.type === 'cas' || e.type === 'analyse' ? 'Étude de cas résolue' : 'Exercice réussi';
      ev[`ex:${cle}`] = { t: ok.t, xp: 10 * e.niveau, motif };
    }
  }
  for (const [id, c] of Object.entries(p.cartes)) {
    for (const h of c.historique) if (h.note === 'correct' || h.note === 'facile') ev[`fc:${id}:${jour(h.t)}`] ??= { t: h.t, xp: 3, motif: 'Rappel réussi' };
  }
  for (const [id, m] of Object.entries(p.marques)) {
    if (m.lu && !index.notions[id]) ev[`lu:${id}`] = { t: m.lu, xp: id.startsWith('dossier:') || id.startsWith('ed:') ? 20 : 8, motif: 'Publication lue en entier' };
  }
  for (const [id, c] of Object.entries(p.chapitres)) if (c.termine) ev[`chap:${id}`] = { t: c.termine, xp: 40, motif: 'Chapitre terminé' };
  for (const e of p.examensPasses) {
    ev[`examen:${e.id}`] = { t: e.t, xp: 10, motif: 'Examen blanc terminé' };
    if (e.total && e.score / e.total >= 0.8) ev[`examen80:${e.id}`] = { t: e.t, xp: 30, motif: 'Examen réussi à 80 % ou plus' };
  }
  for (const d of Object.values(p.dissertations)) if (d.planTermine) ev[`dissert:${d.id}`] = { t: d.planTermine, xp: 30, motif: 'Plan de dissertation terminé' };
  for (const id of Object.keys(index.notions)) {
    if (!index.notions[id].redigee) continue;
    const s = statutNotion(id, p, maintenant);
    // Seuls les statuts obtenus par évaluation rapportent de l'XP (pas un « compris » déclaré sans essai).
    const m = maitriseNotion(id, p, maintenant);
    if (m.tentatives && m.score >= 75) ev[`compris:${id}`] = { t: m.derniere, xp: 15, motif: 'Notion comprise' };
    if (s === 'maitrise') ev[`maitrise:${id}`] = { t: m.derniere, xp: 40, motif: 'Notion maîtrisée' };
  }
  return ev;
}

// ---------- Quêtes ----------
export interface Quete { id: string; cle: string; titre: string; detail: string; fait: number; but: number; xp: number; lien?: string; periode: 'jour' | 'semaine' }

const debutJour = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const debutSemaine = (t: number) => { const d = new Date(debutJour(t)); const j = (d.getDay() + 6) % 7; d.setDate(d.getDate() - j); return d.getTime(); };
export const cleSemaine = (t: number) => `s:${jour(debutSemaine(t) + 12 * 3600_000)}`;

function choisir<T>(liste: T[], graine: string): T | undefined {
  return liste.length ? liste[hacher(graine) % liste.length] : undefined;
}

export function quetes(p: Progression, maintenant = Date.now()): Quete[] {
  const dj = debutJour(maintenant), ds = debutSemaine(maintenant);
  const kj = `j:${jour(dj + 12 * 3600_000)}`, ks = cleSemaine(maintenant);
  const dansJour = (t?: number) => !!t && t >= dj;
  const dansSemaine = (t?: number) => !!t && t >= ds;

  const lusJour = Object.values(p.marques).filter((m) => dansJour(m.lu)).length;
  const qcmJour = Object.values(p.qcm).reduce((s, ts) => s + ts.filter((t) => dansJour(t.t)).length, 0);
  const langueJour = Object.entries(p.exercices).some(([k, ts]) => LANGUES.has(k.split('.')[1]) && ts.some((t) => dansJour(t.t)))
    || Object.entries(p.qcm).some(([k, ts]) => LANGUES.has(k.split('.')[1]) && ts.some((t) => dansJour(t.t)));
  const notionJour = Object.entries(p.marques).some(([id, m]) => (index.notions[id] || id.startsWith('concept:')) && (dansJour(m.lu) || dansJour(m.compris)));

  const exLangue = index.exercices.filter((e) => LANGUES.has(e.chapitre.split('.')[0]));
  const ex = choisir(exLangue, kj);
  const notionsNonVues = Object.keys(index.notions).filter((n) => index.notions[n].redigee && !p.marques[n]?.lu && !p.marques[`concept:${n}`]?.lu);
  const notion = choisir(notionsNonVues, kj + 'n');

  const chapSemaine = Object.values(p.chapitres).filter((c) => dansSemaine(c.termine)).length;
  const comprisSemaine = Object.entries(p.xp).filter(([k, e]) => (k.startsWith('compris:')) && dansSemaine(e.t)).length;
  const planSemaine = Object.values(p.dissertations).some((d) => dansSemaine(d.planTermine));
  const examenSemaine = p.examensPasses.some((e) => dansSemaine(e.t) && e.total && e.score / e.total >= 0.8)
    || Object.entries(p.xp).some(([k, e]) => k.startsWith('serie:') && dansSemaine(e.t));
  const reprisesSemaine = Object.entries(p.xp).filter(([k, e]) => k.startsWith('reprise:') && dansSemaine(e.t)).length;

  return [
    { id: 'lire3', cle: kj, periode: 'jour', titre: 'Lire trois publications', detail: 'Ouvrez des publications du fil et marquez-les « Lu » une fois terminées.', fait: lusJour, but: 3, xp: 30, lien: '#/fil' },
    { id: 'langue1', cle: kj, periode: 'jour', titre: 'Faire un exercice de langue', detail: ex ? `Suggestion : ${ex.titre}` : 'Anglais, espagnol ou traduction.', fait: langueJour ? 1 : 0, but: 1, xp: 25, lien: ex ? `#/exercice/${ex.id}` : '#/etudier' },
    { id: 'qcm5', cle: kj, periode: 'jour', titre: 'Répondre à cinq questions', detail: 'Une session de révision suffit.', fait: qcmJour, but: 5, xp: 25, lien: '#/etudier/session' },
    { id: 'notion1', cle: kj, periode: 'jour', titre: 'Étudier une notion', detail: notion ? `Suggestion : ${index.notions[notion].titre}` : 'Lisez une fiche et marquez-la « Lu ».', fait: notionJour ? 1 : 0, but: 1, xp: 20, lien: notion ? `#/pub/concept:${notion}` : '#/bibliotheque' },
    { id: 'chap2', cle: ks, periode: 'semaine', titre: 'Terminer deux chapitres', detail: 'Lisez un chapitre jusqu’au bout et marquez-le terminé.', fait: chapSemaine, but: 2, xp: 80, lien: '#/bibliotheque' },
    { id: 'comprendre5', cle: ks, periode: 'semaine', titre: 'Comprendre cinq notions', detail: 'Atteindre 75 % de réussite aux questions et exercices d’une notion.', fait: comprisSemaine, but: 5, xp: 100, lien: '#/etudier/session' },
    { id: 'plan1', cle: ks, periode: 'semaine', titre: 'Terminer un plan de dissertation', detail: 'Dans l’atelier de dissertation.', fait: planSemaine ? 1 : 0, but: 1, xp: 60, lien: '#/etudier/dissertation' },
    { id: 'score80', cle: ks, periode: 'semaine', titre: 'Obtenir 80 % ou plus', detail: 'À un examen blanc ou une série parfaite de QCM.', fait: examenSemaine ? 1 : 0, but: 1, xp: 60, lien: '#/examen' },
    { id: 'reprise3', cle: ks, periode: 'semaine', titre: 'Corriger trois erreurs passées', detail: 'Une erreur est corrigée après deux réussites consécutives.', fait: reprisesSemaine, but: 3, xp: 50, lien: '#/reviser' },
  ];
}

// ---------- Badges ----------
export interface Badge { id: string; titre: string; description: string; motif: string }
export const BADGES: Badge[] = [
  { id: 'premier-chapitre', titre: 'Premier chapitre', description: 'Terminer un premier chapitre.', motif: 'I' },
  { id: 'serie-parfaite', titre: 'Sans faute', description: 'Une série d’au moins cinq QCM sans erreur, ou un examen blanc parfait.', motif: '✓' },
  { id: 'commerce', titre: 'Explorateur du commerce international', description: 'Comprendre dix notions de commerce international (TCI, introduction, droit des affaires).', motif: '⟷' },
  { id: 'langues', titre: 'Spécialiste des langues', description: 'Réussir vingt-cinq questions d’anglais ou d’espagnol.', motif: '¶' },
  { id: 'traduction', titre: 'Traducteur', description: 'Réussir cinq questions d’exercices de traduction.', motif: '⇄' },
  { id: 'economie', titre: 'Analyste économique', description: 'Comprendre huit notions d’économie ou de gestion financière.', motif: '%' },
  { id: 'civilisations', titre: 'Lecteur des civilisations', description: 'Comprendre dix notions de civilisation.', motif: '§' },
  { id: 'comptable', titre: 'Comptable', description: 'Réussir dix questions d’exercices de comptabilité.', motif: '=' },
  { id: 'regularite', titre: 'Régularité', description: 'Apprendre sept jours différents (pas forcément consécutifs).', motif: '7' },
  { id: 'maitre-chapitre', titre: 'Maître d’un chapitre', description: 'Maîtriser toutes les notions d’un chapitre.', motif: '★' },
  { id: 'plan', titre: 'Premier plan', description: 'Terminer un plan de dissertation.', motif: 'P' },
  { id: 'lecteur', titre: 'Grand lecteur', description: 'Lire vingt-cinq publications en entier.', motif: '25' },
];

export function badgesObtenus(p: Progression, statuts: Map<string, Statut>): string[] {
  const compris = (pref: string[]) => [...statuts].filter(([id, s]) => pref.includes(id.split('.')[0]) && rangStatut(s) >= rangStatut('compris')).length;
  const qcmOk = (pref: string[]) => Object.entries(p.qcm).filter(([id, ts]) => pref.includes(id.split('.')[1]) && ts.some((t) => t.ok)).length;
  const exOk = (pref: string[]) => Object.entries(p.exercices).filter(([k, ts]) => pref.includes(k.split('.')[1]) && ts.some((t) => t.ok)).length;
  const ok: string[] = [];
  if (Object.values(p.chapitres).some((c) => c.termine)) ok.push('premier-chapitre');
  if (Object.keys(p.xp).some((k) => k.startsWith('serie:')) || p.examensPasses.some((e) => e.total >= 5 && e.score === e.total)) ok.push('serie-parfaite');
  if (compris(['tci', 'ici', 'dai']) >= 10) ok.push('commerce');
  if (qcmOk(['aec', 'cea', 'eec', 'tve', 'tra']) >= 25) ok.push('langues');
  if (exOk(['tra', 'tve']) >= 5) ok.push('traduction');
  if (compris(['eco', 'gfi', 'odg']) >= 8) ok.push('economie');
  if (compris(['cvb', 'cve', 'cva', 'cvl']) >= 10) ok.push('civilisations');
  if (exOk(['cpt']) >= 10) ok.push('comptable');
  if (joursActifs(p).size >= 7) ok.push('regularite');
  for (const m of index.matieres) for (const c of m.chapitres) {
    if (c.notions.length && c.notions.every((n) => statuts.get(n.id) === 'maitrise')) { ok.push('maitre-chapitre'); break; }
  }
  if (Object.values(p.dissertations).some((d) => d.planTermine)) ok.push('plan');
  if (Object.entries(p.marques).filter(([id, m]) => m.lu && !index.notions[id]).length >= 25) ok.push('lecteur');
  return [...new Set(ok)];
}

// ---------- Régularité ----------
export function joursActifs(p: Progression): Set<string> {
  const s = new Set(Object.keys(p.activite));
  for (const m of Object.values(p.marques)) { if (m.lu) s.add(jour(m.lu)); if (m.compris) s.add(jour(m.compris)); }
  for (const e of Object.values(p.xp)) s.add(jour(e.t));
  return s;
}
/** Série en cours : un jour de pause isolé ne la casse pas ; aujourd'hui non travaillé ne la casse pas non plus. */
export function serie(p: Progression, maintenant = Date.now()) {
  const jours = joursActifs(p);
  let n = 0, trou = 0, t = debutJour(maintenant) + 12 * 3600_000;
  if (!jours.has(jour(t))) t -= JOUR;
  for (let i = 0; i < 400; i++, t -= JOUR) {
    if (jours.has(jour(t))) { n++; trou = 0; } else if (++trou > 1) break;
  }
  return n;
}

// ---------- Synchronisation ----------
export type Gain = { xp: number; badges: string[] };
/** Enregistre les gains nouveaux (XP dérivée, quêtes terminées, badges). Idempotent. */
export function synchroniser(maintenant = Date.now()): Gain {
  const p = store.etat;
  const ev = evenementsDerives(p, maintenant);
  for (const q of quetes(p, maintenant)) {
    if (q.fait >= q.but) ev[`quete:${q.cle}:${q.id}`] = { t: maintenant, xp: q.xp, motif: `Quête : ${q.titre}` };
  }
  const xp = store.ajouterXp(ev);
  const statuts = new Map(Object.keys(index.notions).filter((n) => index.notions[n].redigee).map((n) => [n, statutNotion(n, store.etat, maintenant)]));
  const avant = new Set(Object.keys(store.etat.badges));
  const badges = badgesObtenus(store.etat, statuts).filter((b) => !avant.has(b));
  store.ajouterBadges(badges, maintenant);
  return { xp, badges };
}
