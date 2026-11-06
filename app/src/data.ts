// Accès aux données : index léger chargé au démarrage, chapitres chargés à la demande.
import indexBrut from './generated/index.json';
import type { FichierChapitre, IndexGenere, Question, Flashcard, Exercice, MatiereCatalogue, Publication, Article, IndexGlossaire, Langue, Cahier } from './types';
import { calculerMaitrise, type Maitrise } from './core/maitrise';
import type { Progression } from './core/store';

export const index = indexBrut as unknown as IndexGenere;

const fichiers = import.meta.glob<FichierChapitre>(['../../content/*/*.json', '!../../content/publications/*.json', '!../../content/cahiers/*.json'], { import: 'default' });
const fichiersCahiers = import.meta.glob<Cahier>('../../content/cahiers/*.json', { import: 'default' });

/** Cahier d'exercices d'une matière (chargé à la demande). */
export function chargerCahier(matiere: string): Promise<Cahier> {
  const f = fichiersCahiers[`../../content/cahiers/${matiere}.json`];
  return f ? f() : Promise.reject(new Error(`Pas encore de cahier d'exercices pour ${matiere}`));
}
/** Matières à l'emploi du temps du semestre en cours, dans l'ordre du catalogue. */
export const matieresEmploiDuTemps = () => index.matieres.filter((m) => m.emploiDuTemps);
const cache = new Map<string, Promise<FichierChapitre>>();

export function chapitreExiste(chapitre: string): boolean {
  const mat = chapitre.split('.')[0];
  return `../../content/${mat}/${chapitre}.json` in fichiers;
}

export function chargerChapitre(chapitre: string): Promise<FichierChapitre> {
  const mat = chapitre.split('.')[0];
  const cle = `../../content/${mat}/${chapitre}.json`;
  if (!cache.has(cle)) {
    const f = fichiers[cle];
    const p = f ? f() : Promise.reject(new Error(`Chapitre ${chapitre} non rédigé`));
    p.catch(() => cache.delete(cle));
    cache.set(cle, p);
  }
  return cache.get(cle)!;
}

async function chargerChapitres(chapitres: Iterable<string>) {
  const uniques = [...new Set(chapitres)];
  return Promise.all(uniques.map(chargerChapitre));
}

export async function chargerQuestions(ids: string[]): Promise<Question[]> {
  const chap = new Map(index.questions.map((q) => [q.id, q.chapitre]));
  const fichiersCh = await chargerChapitres(ids.map((id) => chap.get(id)!).filter(Boolean));
  const toutes = new Map(fichiersCh.flatMap((f) => f.questions ?? []).map((q) => [q.id, q]));
  return ids.map((id) => toutes.get(id)).filter((q): q is Question => !!q);
}

export async function chargerFlashcards(ids: string[]): Promise<Flashcard[]> {
  const chap = new Map(index.flashcards.map((f) => [f.id, f.chapitre]));
  const fichiersCh = await chargerChapitres(ids.map((id) => chap.get(id)!).filter(Boolean));
  const toutes = new Map(fichiersCh.flatMap((f) => f.flashcards ?? []).map((c) => [c.id, c]));
  return ids.map((id) => toutes.get(id)).filter((c): c is Flashcard => !!c);
}

export async function chargerExercice(id: string): Promise<Exercice | undefined> {
  const e = index.exercices.find((x) => x.id === id);
  if (!e) return undefined;
  const f = await chargerChapitre(e.chapitre);
  return f.exercices?.find((x) => x.id === id);
}

export const matiere = (id: string): MatiereCatalogue | undefined => index.matieres.find((m) => m.id === id);
export const matiereDe = (notionOuChapitre: string) => matiere(notionOuChapitre.split('.')[0]);
export const chapitreCatalogue = (id: string) => matiereDe(id)?.chapitres.find((c) => c.id === id);

/** Identifiants des notions couvertes par un périmètre (matière, chapitre ou notion). */
export function notionsDuPerimetre(perimetre: string[]): string[] {
  if (!perimetre.length) return Object.keys(index.notions);
  return Object.keys(index.notions).filter((n) => perimetre.some((p) => n === p || n.startsWith(p + '.')));
}

// Tables de correspondance calculées une fois (évite des recherches linéaires répétées).
export const niveauQuestion = new Map(index.questions.map((q) => [q.id, q.niveau]));
const exercicesParNotion = new Map<string, IndexGenere['exercices']>();
for (const e of index.exercices) for (const n of e.notions) { const l = exercicesParNotion.get(n) ?? []; l.push(e); exercicesParNotion.set(n, l); }
const cartesParNotion = new Map<string, string[]>();
for (const f of index.flashcards) for (const n of f.notions) { const l = cartesParNotion.get(n) ?? []; l.push(f.id); cartesParNotion.set(n, l); }
export const exerciceDeCle = (cle: string) => index.exercices.find((e) => e.id === cle.split('/')[0]);

export function maitriseNotion(notion: string, p: Progression, maintenant = Date.now()): Maitrise {
  const qcm = (index.questionsParNotion[notion] ?? []).map((id) => ({ niveau: niveauQuestion.get(id) ?? 1, tentatives: p.qcm[id] ?? [] }));
  const cles = Object.keys(p.exercices);
  const exercices = (exercicesParNotion.get(notion) ?? []).flatMap((e) =>
    cles.filter((k) => k.startsWith(e.id + '/')).map((k) => ({ niveau: e.niveau, tentatives: p.exercices[k] })));
  const cartes = (cartesParNotion.get(notion) ?? []).map((id) => p.cartes[id]);
  return calculerMaitrise({ qcm, exercices, cartes }, maintenant);
}

/** Maîtrise moyenne des notions rédigées d'un périmètre. */
export function maitrisePerimetre(perimetre: string, p: Progression) {
  const ids = notionsDuPerimetre([perimetre]).filter((n) => index.notions[n].redigee);
  if (!ids.length) return { score: 0, redigees: 0, total: notionsDuPerimetre([perimetre]).length, fragiles: [] as string[], commencees: 0 };
  const m = ids.map((id) => ({ id, m: maitriseNotion(id, p) }));
  return {
    score: Math.round(m.reduce((s, x) => s + x.m.score, 0) / m.length),
    redigees: ids.length,
    total: notionsDuPerimetre([perimetre]).length,
    fragiles: m.filter((x) => x.m.etat === 'fragile').map((x) => x.id),
    commencees: m.filter((x) => x.m.etat !== 'nouvelle').length,
  };
}

export const CATEGORIES = [...new Set(index.matieres.map((m) => m.categorie))];

// ---------- Données chargées à la demande (fil, articles, glossaire) ----------
let filP: Promise<Publication[]> | null = null;
export const chargerFil = () => (filP ??= import('./generated/fil.json').then((m) => m.default as unknown as Publication[]));
let artP: Promise<Article[]> | null = null;
export const chargerArticles = () => (artP ??= import('./generated/articles.json').then((m) => m.default as unknown as Article[]));
let gloP: Promise<IndexGlossaire[]> | null = null;
export const chargerGlossaire = () => (gloP ??= import('./generated/glossaire.json').then((m) => m.default as unknown as IndexGlossaire[]));

/** Langue du contenu d'une matière, d'un chapitre ou d'une notion (héritée de la matière). */
export const langueDe = (id: string): Langue => matiereDe(id)?.langue ?? 'fr';
export const LIBELLE_LANGUE: Record<Langue, string> = { fr: 'Français', en: 'English', es: 'Español' };
export const matieresDisponibles = () => index.matieres.filter((m) => m.completude !== 'absente');
