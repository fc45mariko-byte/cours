// Progression de l'étudiante, sauvegardée dans le navigateur (localStorage).
// L'application fonctionne même si le stockage est indisponible : la progression reste alors en mémoire.
import type { EtatCarte, Note } from './srs';
import { noter } from './srs';
import type { Tentative } from './maitrise';

export const VERSION = 1;
const CLE = 'cours-l3-lea:progression';

export interface ErreurEnregistree { type: 'qcm' | 'exercice'; notion: string; t: number; reussitesConsecutives: number }
export interface SessionExamen {
  id: string; debut: number; dureeMax: number | null; // secondes, null = sans chronomètre
  questions: string[]; graine: number; reponses: Record<string, string[]>;
  aRevoir: string[]; courante: number; terminee: boolean; fin?: number; filtre: string;
}
export interface Progression {
  version: number;
  qcm: Record<string, Tentative[]>;
  exercices: Record<string, Tentative[]>; // clé : idExercice/idSousQuestion
  cartes: Record<string, EtatCarte>;
  erreurs: Record<string, ErreurEnregistree>;
  examen: SessionExamen | null;
  examensPasses: { id: string; t: number; score: number; total: number; filtre: string }[];
  vues: Record<string, number>;
  activite: Record<string, Record<string, number>>; // jour -> matière -> nombre d'activités
}

export const progressionVide = (): Progression => ({
  version: VERSION, qcm: {}, exercices: {}, cartes: {}, erreurs: {},
  examen: null, examensPasses: [], vues: {}, activite: {},
});

/** Vérifie et complète un objet de progression (import, ancienne version, données corrompues). */
export function migrer(brut: unknown): Progression {
  const base = progressionVide();
  if (!brut || typeof brut !== 'object') return base;
  const p = brut as Partial<Progression>;
  const objet = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? v : {});
  return {
    version: VERSION,
    qcm: objet(p.qcm) as Progression['qcm'],
    exercices: objet(p.exercices) as Progression['exercices'],
    cartes: objet(p.cartes) as Progression['cartes'],
    erreurs: objet(p.erreurs) as Progression['erreurs'],
    examen: p.examen && typeof p.examen === 'object' ? (p.examen as SessionExamen) : null,
    examensPasses: Array.isArray(p.examensPasses) ? p.examensPasses : [],
    vues: objet(p.vues) as Progression['vues'],
    activite: objet(p.activite) as Progression['activite'],
  };
}

type Ecouteur = () => void;

export class Store {
  etat: Progression;
  persistant = true;
  private ecouteurs = new Set<Ecouteur>();
  constructor(private stockage: Pick<Storage, 'getItem' | 'setItem'> | null) {
    this.etat = progressionVide();
    try {
      const brut = stockage?.getItem(CLE);
      if (brut) this.etat = migrer(JSON.parse(brut));
      if (!stockage) this.persistant = false;
    } catch {
      this.persistant = false;
    }
  }
  abonner(f: Ecouteur) { this.ecouteurs.add(f); return () => { this.ecouteurs.delete(f); }; }
  private enregistrer() {
    if (this.stockage) {
      try { this.stockage.setItem(CLE, JSON.stringify(this.etat)); this.persistant = true; }
      catch { this.persistant = false; }
    }
    this.ecouteurs.forEach((f) => f());
  }
  modifier(f: (p: Progression) => void) {
    const copie = structuredClone(this.etat);
    f(copie);
    this.etat = copie;
    this.enregistrer();
  }

  private noterActivite(p: Progression, matiere: string, t: number) {
    const jour = new Date(t).toISOString().slice(0, 10);
    const j = (p.activite[jour] ??= {});
    j[matiere] = (j[matiere] ?? 0) + 1;
  }
  private suivreErreur(p: Progression, id: string, type: 'qcm' | 'exercice', notion: string, ok: boolean, t: number) {
    const e = p.erreurs[id];
    if (!ok) p.erreurs[id] = { type, notion, t, reussitesConsecutives: 0 };
    else if (e) {
      e.reussitesConsecutives += 1;
      if (e.reussitesConsecutives >= 2) delete p.erreurs[id];
    }
  }

  repondreQcm(id: string, notion: string, matiere: string, ok: boolean, t = Date.now()) {
    this.modifier((p) => {
      p.qcm[id] = [...(p.qcm[id] ?? []), { t, ok }].slice(-10);
      this.suivreErreur(p, id, 'qcm', notion, ok, t);
      this.noterActivite(p, matiere, t);
    });
  }
  repondreExercice(cle: string, notion: string, matiere: string, ok: boolean, t = Date.now()) {
    this.modifier((p) => {
      p.exercices[cle] = [...(p.exercices[cle] ?? []), { t, ok }].slice(-10);
      this.suivreErreur(p, cle, 'exercice', notion, ok, t);
      this.noterActivite(p, matiere, t);
    });
  }
  noterCarte(id: string, matiere: string, note: Note, t = Date.now()) {
    this.modifier((p) => { p.cartes[id] = noter(p.cartes[id], note, t); this.noterActivite(p, matiere, t); });
  }
  voir(notion: string) {
    this.modifier((p) => { p.vues[notion] = Date.now(); });
  }
  exporter(): string { return JSON.stringify(this.etat, null, 1); }
  importer(json: string) {
    const brut = JSON.parse(json);
    if (!brut || typeof brut !== 'object' || !('version' in brut)) throw new Error('Fichier de progression non reconnu');
    this.etat = migrer(brut);
    this.enregistrer();
  }
  reinitialiser() { this.etat = progressionVide(); this.enregistrer(); }
}

function stockageNavigateur(): Storage | null {
  try {
    const s = globalThis.localStorage;
    const k = '__test__';
    s.setItem(k, '1'); s.removeItem(k);
    return s;
  } catch { return null; }
}

export const store = new Store(typeof window === 'undefined' ? null : stockageNavigateur());
