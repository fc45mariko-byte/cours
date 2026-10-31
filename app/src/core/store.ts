// Progression de l'étudiante, sauvegardée dans le navigateur (localStorage).
// L'application fonctionne même si le stockage est indisponible : la progression reste alors en mémoire.
// Règles de migration : on ajoute des champs, on n'en retire jamais ; les champs inconnus sont conservés ;
// une copie brute de l'ancienne version est gardée sous une clé de secours avant la première écriture.
import type { EtatCarte, Note } from './srs';
import { noter } from './srs';
import type { Tentative } from './maitrise';

export const VERSION = 2;
export const CLE = 'cours-l3-lea:progression';

export interface ErreurEnregistree { type: 'qcm' | 'exercice'; notion: string; t: number; reussitesConsecutives: number }
export interface SessionExamen {
  id: string; debut: number; dureeMax: number | null; // secondes, null = sans chronomètre
  questions: string[]; graine: number; reponses: Record<string, string[]>;
  aRevoir: string[]; courante: number; terminee: boolean; fin?: number; filtre: string;
}
/** Marques posées explicitement par l'étudiante sur une notion ou une publication. */
export interface Marques { vu?: number; lu?: number; compris?: number; aRevoir?: number }
export interface EvenementXp { t: number; xp: number; motif: string }
export interface Dissertation {
  id: string; sujet: string; problematique: string; matiere: string; chapitre?: string;
  plan: { titre: string; notes: string }[]; texte: string; cree: number; modifie: number; planTermine?: number;
}

export interface Progression {
  version: number;
  // Version 1
  qcm: Record<string, Tentative[]>;
  exercices: Record<string, Tentative[]>; // clé : idExercice/idSousQuestion
  cartes: Record<string, EtatCarte>;
  erreurs: Record<string, ErreurEnregistree>;
  examen: SessionExamen | null;
  examensPasses: { id: string; t: number; score: number; total: number; filtre: string }[];
  vues: Record<string, number>;
  activite: Record<string, Record<string, number>>; // jour -> matière -> nombre d'activités
  // Version 2
  marques: Record<string, Marques>;
  enregistres: Record<string, { t: number; collection?: string }>;
  historique: { id: string; t: number }[];
  lecture: { fil: Record<string, { id: string; t: number }>; chapitres: Record<string, { notion?: string; t: number }> };
  chapitres: Record<string, { ouvert: number; termine?: number }>;
  xp: Record<string, EvenementXp>; // clé unique = action comptée une seule fois
  badges: Record<string, number>;
  dissertations: Record<string, Dissertation>;
  preferences: { mesMatieres: string[]; animations: boolean };
  [cle: string]: unknown;
}

export const progressionVide = (): Progression => ({
  version: VERSION, qcm: {}, exercices: {}, cartes: {}, erreurs: {},
  examen: null, examensPasses: [], vues: {}, activite: {},
  marques: {}, enregistres: {}, historique: [], lecture: { fil: {}, chapitres: {} }, chapitres: {},
  xp: {}, badges: {}, dissertations: {}, preferences: { mesMatieres: [], animations: true },
});

/** Vérifie et complète un objet de progression (import, ancienne version, données corrompues). */
export function migrer(brut: unknown): Progression {
  const base = progressionVide();
  if (!brut || typeof brut !== 'object' || Array.isArray(brut)) return base;
  const p = brut as Partial<Progression>;
  const objet = <T,>(v: unknown, d: T): T => (v && typeof v === 'object' && !Array.isArray(v) ? (v as T) : d);
  const lecture = objet(p.lecture, base.lecture);
  const prefs = objet(p.preferences, base.preferences);
  return {
    ...(brut as object), // champs inconnus (versions futures) conservés
    version: VERSION,
    qcm: objet(p.qcm, {}),
    exercices: objet(p.exercices, {}),
    cartes: objet(p.cartes, {}),
    erreurs: objet(p.erreurs, {}),
    examen: p.examen && typeof p.examen === 'object' ? (p.examen as SessionExamen) : null,
    examensPasses: Array.isArray(p.examensPasses) ? p.examensPasses : [],
    vues: objet(p.vues, {}),
    activite: objet(p.activite, {}),
    marques: objet(p.marques, {}),
    enregistres: objet(p.enregistres, {}),
    historique: Array.isArray(p.historique) ? p.historique : [],
    lecture: { fil: objet(lecture.fil, {}), chapitres: objet(lecture.chapitres, {}) },
    chapitres: objet(p.chapitres, {}),
    xp: objet(p.xp, {}),
    badges: objet(p.badges, {}),
    dissertations: objet(p.dissertations, {}),
    preferences: {
      mesMatieres: Array.isArray(prefs.mesMatieres) ? prefs.mesMatieres : [],
      animations: typeof prefs.animations === 'boolean' ? prefs.animations : true,
    },
  };
}

type Ecouteur = () => void;
export const jour = (t: number) => new Date(t).toISOString().slice(0, 10);

export class Store {
  etat: Progression;
  persistant = true;
  /** Clé où la sauvegarde illisible trouvée au démarrage a été mise à l'abri (null si aucune). */
  sauvegardeIllisible: string | null = null;
  /** Clé de la copie de sécurité faite avant la migration d'une ancienne version (null si aucune). */
  copieAvantMigration: string | null = null;
  /** Vrai si une sauvegarde n'a pas pu être mise à l'abri : on n'écrit alors plus rien par-dessus. */
  private ecritureBloquee = false;
  private ecouteurs = new Set<Ecouteur>();
  constructor(private stockage: Pick<Storage, 'getItem' | 'setItem'> | null) {
    this.etat = progressionVide();
    if (!stockage) { this.persistant = false; return; }
    let brut: string | null = null;
    try { brut = stockage.getItem(CLE); } catch { this.persistant = false; return; }
    if (!brut) return;
    let lu: unknown;
    try {
      lu = JSON.parse(brut);
    } catch {
      // Sauvegarde illisible : on la copie sous une autre clé avant toute écriture, pour ne jamais l'écraser.
      const secours = `${CLE}:illisible:${Date.now()}`;
      try { stockage.setItem(secours, brut); this.sauvegardeIllisible = secours; }
      catch { this.ecritureBloquee = true; this.persistant = false; }
      return;
    }
    const version = (lu as { version?: number })?.version ?? 0;
    if (version < VERSION) {
      // Copie brute de l'ancienne version, faite une seule fois, avant toute écriture au nouveau format.
      const copie = `${CLE}:v${version}`;
      try {
        if (!stockage.getItem(copie)) stockage.setItem(copie, brut);
        this.copieAvantMigration = copie;
      } catch { this.ecritureBloquee = true; this.persistant = false; }
    }
    this.etat = migrer(lu);
    // La copie de l'ancienne version étant faite, on enregistre tout de suite au nouveau format.
    if (version < VERSION && !this.ecritureBloquee) {
      try { stockage.setItem(CLE, JSON.stringify(this.etat)); } catch { this.persistant = false; }
    }
  }
  abonner(f: Ecouteur) { this.ecouteurs.add(f); return () => { this.ecouteurs.delete(f); }; }
  private enregistrer() {
    if (this.stockage && !this.ecritureBloquee) {
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
    const j = (p.activite[jour(t)] ??= {});
    j[matiere] = (j[matiere] ?? 0) + 1;
  }
  private suivreErreur(p: Progression, id: string, type: 'qcm' | 'exercice', notion: string, ok: boolean, t: number) {
    const e = p.erreurs[id];
    if (!ok) p.erreurs[id] = { type, notion, t, reussitesConsecutives: 0 };
    else if (e) {
      e.reussitesConsecutives += 1;
      if (e.reussitesConsecutives >= 2) {
        delete p.erreurs[id];
        p.xp[`reprise:${id}`] ??= { t, xp: 15, motif: 'Erreur corrigée deux fois de suite' };
      }
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
  voir(notion: string, t = Date.now()) {
    this.modifier((p) => { p.vues[notion] = t; (p.marques[notion] ??= {}).vu ??= t; });
  }

  // ---------- Version 2 : lecture, fil, enregistrements ----------
  /** Publication ouverte : marquée « vue » et ajoutée à l'historique (sans doublon consécutif). */
  ouvrirPublication(id: string, t = Date.now()) {
    this.modifier((p) => {
      (p.marques[id] ??= {}).vu ??= t;
      p.historique = [{ id, t }, ...p.historique.filter((h) => h.id !== id)].slice(0, 120);
    });
  }
  /** Marque explicite : lu, compris ou à revoir (bascule). */
  marquer(id: string, marque: 'lu' | 'compris' | 'aRevoir', valeur: boolean, matiere?: string, t = Date.now()) {
    this.modifier((p) => {
      const m = (p.marques[id] ??= {});
      if (valeur) {
        m[marque] = t;
        if (marque === 'compris') { m.lu ??= t; delete m.aRevoir; }
        if (marque === 'aRevoir') delete m.compris;
        if (matiere) this.noterActivite(p, matiere, t);
      } else delete m[marque];
    });
  }
  basculerEnregistre(id: string, t = Date.now()) {
    this.modifier((p) => {
      if (p.enregistres[id]) delete p.enregistres[id];
      else p.enregistres[id] = { t };
    });
  }
  positionFil(onglet: string, id: string, t = Date.now()) {
    if (this.etat.lecture.fil[onglet]?.id === id) return;
    this.modifier((p) => { p.lecture.fil[onglet] = { id, t }; });
  }
  ouvrirChapitre(id: string, t = Date.now()) {
    this.modifier((p) => {
      const c = (p.chapitres[id] ??= { ouvert: t });
      c.ouvert = t;
    });
  }
  positionChapitre(chapitre: string, notion: string, t = Date.now()) {
    if (this.etat.lecture.chapitres[chapitre]?.notion === notion) return;
    this.modifier((p) => { p.lecture.chapitres[chapitre] = { notion, t }; });
  }
  terminerChapitre(id: string, matiere: string, valeur = true, t = Date.now()) {
    this.modifier((p) => {
      const c = (p.chapitres[id] ??= { ouvert: t });
      if (valeur) { c.termine ??= t; this.noterActivite(p, matiere, t); } else delete c.termine;
    });
  }

  // ---------- Version 2 : jeu ----------
  /** Ajoute des événements d'XP ; une clé déjà présente n'est jamais recomptée. Renvoie l'XP réellement ajoutée. */
  ajouterXp(evenements: Record<string, EvenementXp>): number {
    const nouveaux = Object.entries(evenements).filter(([k]) => !this.etat.xp[k]);
    if (!nouveaux.length) return 0;
    this.modifier((p) => { for (const [k, e] of nouveaux) p.xp[k] = e; });
    return nouveaux.reduce((s, [, e]) => s + e.xp, 0);
  }
  ajouterBadges(ids: string[], t = Date.now()) {
    const nouveaux = ids.filter((id) => !this.etat.badges[id]);
    if (!nouveaux.length) return;
    this.modifier((p) => { for (const id of nouveaux) p.badges[id] = t; });
  }
  enregistrerDissertation(d: Dissertation) {
    this.modifier((p) => { p.dissertations[d.id] = d; });
  }
  supprimerDissertation(id: string) {
    this.modifier((p) => { delete p.dissertations[id]; });
  }
  preferences(f: (pr: Progression['preferences']) => void) {
    this.modifier((p) => f(p.preferences));
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
