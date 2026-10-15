// Accès aux données : index léger chargé au démarrage, chapitres chargés à la demande.
import indexBrut from './generated/index.json';
import type { FichierChapitre, IndexGenere, Question, Flashcard, Exercice, MatiereCatalogue } from './types';
import { calculerMaitrise, type Maitrise } from './core/maitrise';
import type { Progression } from './core/store';

export const index = indexBrut as unknown as IndexGenere;

const fichiers = import.meta.glob<FichierChapitre>('../../content/*/*.json', { import: 'default' });
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

export function maitriseNotion(notion: string, p: Progression, maintenant = Date.now()): Maitrise {
  const qcm = (index.questionsParNotion[notion] ?? []).map((id) => ({
    niveau: index.questions.find((q) => q.id === id)?.niveau ?? 1, tentatives: p.qcm[id] ?? [],
  }));
  const exercices = index.exercices.filter((e) => e.notions.includes(notion)).flatMap((e) =>
    Object.entries(p.exercices).filter(([k]) => k.startsWith(e.id + '/')).map(([, t]) => ({ niveau: e.niveau, tentatives: t })));
  const cartes = index.flashcards.filter((f) => f.notions.includes(notion)).map((f) => p.cartes[f.id]);
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
