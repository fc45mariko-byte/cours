// Répétition espacée : variante simplifiée de SM-2.

export type Note = 'revoir' | 'difficile' | 'correct' | 'facile';
export interface EtatCarte { ef: number; repetitions: number; intervalle: number; due: number; historique: { t: number; note: Note }[] }

const JOUR = 86_400_000;
const Q: Record<Note, number> = { revoir: 1, difficile: 3, correct: 4, facile: 5 };

export const carteNeuve = (): EtatCarte => ({ ef: 2.5, repetitions: 0, intervalle: 0, due: 0, historique: [] });

export function noter(etat: EtatCarte | undefined, note: Note, maintenant = Date.now()): EtatCarte {
  const e = { ...(etat ?? carteNeuve()) };
  const q = Q[note];
  e.ef = Math.min(2.8, Math.max(1.3, e.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))));
  if (q < 3) {
    e.repetitions = 0;
    e.intervalle = 0;
    e.due = maintenant + 10 * 60_000; // revient dans la même session
  } else {
    e.repetitions += 1;
    e.intervalle = e.repetitions === 1 ? 1 : e.repetitions === 2 ? 3 : Math.round(e.intervalle * e.ef);
    if (note === 'difficile') e.intervalle = Math.max(1, Math.round(e.intervalle * 0.6));
    e.due = maintenant + e.intervalle * JOUR;
  }
  e.historique = [...e.historique, { t: maintenant, note }].slice(-20);
  return e;
}

export const estDue = (e: EtatCarte | undefined, maintenant = Date.now()) => !e || e.due <= maintenant;
