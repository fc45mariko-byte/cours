import type { Question, ReponseAttendue } from '../types';

export type EtatChoix = 'bonne-cochee' | 'bonne-oubliee' | 'fausse-cochee' | 'fausse-ignoree';

/** Corrige un QCM. Une question à réponses multiples n'est juste que si l'ensemble coché est exactement l'ensemble attendu. */
export function corrigerQcm(q: Question, selection: string[]): { juste: boolean; detail: Record<string, EtatChoix> } {
  const sel = new Set(selection);
  const detail: Record<string, EtatChoix> = {};
  let juste = sel.size > 0;
  for (const c of q.choix) {
    const coche = sel.has(c.id);
    if (c.correct && coche) detail[c.id] = 'bonne-cochee';
    else if (c.correct) { detail[c.id] = 'bonne-oubliee'; juste = false; }
    else if (coche) { detail[c.id] = 'fausse-cochee'; juste = false; }
    else detail[c.id] = 'fausse-ignoree';
  }
  return { juste, detail };
}

/**
 * Lit un nombre saisi à la française ou à l'anglaise :
 * « 12 500,50 », « 12500.5 », « 12 500 € », « -3,5 % ».
 * Retourne null si la saisie n'est pas un nombre.
 */
export function lireNombre(saisie: string): number | null {
  let s = saisie.trim().replace(/[€%$£\s  ]/g, '');
  if (!s) return null;
  const virgules = (s.match(/,/g) ?? []).length;
  const points = (s.match(/\./g) ?? []).length;
  if (virgules && points) {
    // Le dernier séparateur rencontré est le séparateur décimal.
    s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  } else if (virgules === 1) {
    s = s.replace(',', '.');
  } else if (virgules > 1) {
    s = s.replace(/,/g, '');
  } else if (points > 1) {
    s = s.replace(/\./g, '');
  }
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
}

export function corrigerNombre(r: Extract<ReponseAttendue, { type: 'nombre' }>, saisie: string): { juste: boolean; lu: number | null } {
  const lu = lireNombre(saisie);
  if (lu === null) return { juste: false, lu };
  const tol = r.tolerance ?? 0.01;
  return { juste: Math.abs(lu - r.valeur) <= tol, lu };
}

export interface LigneSaisie { compte: string; debit: string; credit: string }

/**
 * Corrige une écriture comptable : chaque ligne attendue doit être retrouvée (même compte, même sens, même montant),
 * sans ligne en trop, et l'écriture saisie doit être équilibrée.
 */
export function corrigerEcriture(
  r: Extract<ReponseAttendue, { type: 'ecriture' }>,
  saisie: LigneSaisie[],
): { juste: boolean; equilibree: boolean; manquantes: string[]; enTrop: string[] } {
  const lignes = saisie
    .filter((l) => l.compte.trim() || l.debit.trim() || l.credit.trim())
    .map((l) => ({ compte: l.compte.trim(), debit: lireNombre(l.debit) ?? 0, credit: lireNombre(l.credit) ?? 0 }));
  const totD = lignes.reduce((s, l) => s + l.debit, 0);
  const totC = lignes.reduce((s, l) => s + l.credit, 0);
  const equilibree = lignes.length > 0 && Math.abs(totD - totC) < 0.005;
  const restantes = [...lignes];
  const manquantes: string[] = [];
  for (const a of r.lignes) {
    const i = restantes.findIndex((l) =>
      l.compte === a.compte && Math.abs(l.debit - (a.debit ?? 0)) < 0.005 && Math.abs(l.credit - (a.credit ?? 0)) < 0.005);
    if (i >= 0) restantes.splice(i, 1);
    else manquantes.push(`${a.compte} ${a.debit ? 'débit ' + a.debit : 'crédit ' + a.credit}`);
  }
  const enTrop = restantes.map((l) => `${l.compte} ${l.debit ? 'débit ' + l.debit : 'crédit ' + l.credit}`);
  return { juste: equilibree && !manquantes.length && !enTrop.length, equilibree, manquantes, enTrop };
}

/** Formate un nombre à la française (espaces fines insécables, virgule décimale). */
export function fr(n: number, decimales = 2): string {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: decimales });
}
