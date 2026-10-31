import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
// @ts-expect-error module JS sans types
import { construireIndex } from '../../scripts/build-index.mjs';
import { Store, migrer, progressionVide, CLE } from '../../app/src/core/store';
import { statutDepuis } from '../../app/src/core/statut';
import { evenementsDerives, niveau, seuilNiveau, serie, quetes, badgesObtenus } from '../../app/src/jeu';
import { classer } from '../../app/src/classement';
import { genererSujet } from '../../app/src/sujets';
import type { Publication, FichierChapitre } from '../../app/src/types';

const memoire = (init: Record<string, string> = {}) => {
  const m = new Map(Object.entries(init));
  return { m, getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); } };
};
const JOUR = 86_400_000;
const { index: idx, fil } = construireIndex() as { index: { notions: Record<string, { chapitre: string }>; questions: { id: string }[]; exercices: { id: string }[]; matieres: { id: string; langue: string; chapitres: { id: string }[] }[] }; fil: Publication[] };

describe('migration de la progression (v1 → v2)', () => {
  const v1 = JSON.stringify({ version: 1, qcm: { 'q.tci.incoterms.001': [{ t: 1, ok: true }] }, cartes: {}, erreurs: {}, examen: null, examensPasses: [], vues: { 'tci.incoterms.exw': 5 }, activite: { '2026-10-01': { tci: 3 } }, champFutur: 42 });
  it('conserve toutes les données existantes et ajoute les nouveaux champs', () => {
    const s = memoire({ [CLE]: v1 });
    const st = new Store(s);
    expect(st.etat.version).toBe(2);
    expect(st.etat.qcm['q.tci.incoterms.001']).toHaveLength(1);
    expect(st.etat.vues['tci.incoterms.exw']).toBe(5);
    expect(st.etat.activite['2026-10-01'].tci).toBe(3);
    expect(st.etat.enregistres).toEqual({});
    expect((st.etat as Record<string, unknown>).champFutur).toBe(42);
  });
  it('garde une copie brute de la version 1 avant la première écriture', () => {
    const s = memoire({ [CLE]: v1 });
    const st = new Store(s);
    st.basculerEnregistre('concept:tci.incoterms.exw');
    expect(s.m.get(`${CLE}:v1`)).toBe(v1);
    expect(JSON.parse(s.m.get(CLE)!).enregistres['concept:tci.incoterms.exw']).toBeDefined();
    expect(JSON.parse(s.m.get(CLE)!).qcm['q.tci.incoterms.001']).toHaveLength(1);
  });
  it('relit correctement une sauvegarde v2', () => {
    const s = memoire();
    const a = new Store(s);
    a.marquer('concept:x', 'lu', true);
    a.positionFil('pour-vous', 'concept:x');
    const b = new Store(s);
    expect(b.etat.marques['concept:x'].lu).toBeDefined();
    expect(b.etat.lecture.fil['pour-vous'].id).toBe('concept:x');
    expect(b.copieAvantMigration).toBeNull();
  });
  it('répare des champs v2 corrompus sans perdre le reste', () => {
    const p = migrer({ version: 2, qcm: { a: [] }, marques: 'x', historique: 3, preferences: { mesMatieres: 'tci' } });
    expect(p.qcm).toEqual({ a: [] });
    expect(p.marques).toEqual({});
    expect(p.historique).toEqual([]);
    expect(p.preferences.mesMatieres).toEqual([]);
  });
});

describe('XP et niveaux', () => {
  it('ne compte jamais deux fois la même action', () => {
    const st = new Store(memoire());
    expect(st.ajouterXp({ 'qcm:a': { t: 1, xp: 5, motif: 'x' } })).toBe(5);
    expect(st.ajouterXp({ 'qcm:a': { t: 2, xp: 5, motif: 'x' } })).toBe(0);
  });
  it('ne donne de l’XP qu’à la première réussite d’une question', () => {
    const p = progressionVide();
    const q = idx.questions[0].id;
    p.qcm[q] = [{ t: 1, ok: false }, { t: 2, ok: true }, { t: 3, ok: true }];
    const ev = Object.keys(evenementsDerives(p)).filter((k) => k.startsWith('qcm:'));
    expect(ev).toEqual([`qcm:${q}`]);
  });
  it('n’accorde rien pour une simple ouverture de fiche', () => {
    const p = progressionVide();
    p.vues['tci.incoterms.exw'] = 1;
    p.marques['tci.incoterms.exw'] = { vu: 1 };
    expect(Object.keys(evenementsDerives(p))).toEqual([]);
  });
  it('calcule des seuils de niveau croissants', () => {
    expect(seuilNiveau(1)).toBe(0);
    expect(niveau(0).niveau).toBe(1);
    expect(niveau(100).niveau).toBe(2);
    expect(niveau(299).niveau).toBe(2);
    expect(seuilNiveau(4) - seuilNiveau(3)).toBeGreaterThan(seuilNiveau(3) - seuilNiveau(2));
  });
});

describe('statuts d’apprentissage', () => {
  const m = (score: number, etat: 'nouvelle' | 'fragile' | 'en-cours' | 'maitrisee', tentatives = 3) => ({ score, etat, tentatives, derniere: 0 });
  it('distingue les six statuts', () => {
    expect(statutDepuis(m(0, 'nouvelle', 0), [], false)).toBe('inexplore');
    expect(statutDepuis(m(0, 'nouvelle', 0), [], true)).toBe('decouvert');
    expect(statutDepuis(m(0, 'nouvelle', 0), [{ lu: 1 }], true)).toBe('apprentissage');
    expect(statutDepuis(m(30, 'fragile'), [], true)).toBe('apprentissage');
    expect(statutDepuis(m(60, 'en-cours'), [], true)).toBe('pratique');
    expect(statutDepuis(m(80, 'en-cours'), [], true)).toBe('compris');
    expect(statutDepuis(m(90, 'maitrisee'), [], true)).toBe('maitrise');
  });
  it('n’accorde jamais « maîtrisé » sans évaluation', () => {
    expect(statutDepuis(m(0, 'nouvelle', 0), [{ compris: 1, lu: 1 }], true)).toBe('compris');
  });
});

describe('régularité et quêtes', () => {
  it('tolère un jour de pause isolé', () => {
    const p = progressionVide();
    const t = Date.UTC(2026, 9, 20, 12);
    for (const d of [0, 1, 3, 4]) p.activite[new Date(t - d * JOUR).toISOString().slice(0, 10)] = { tci: 1 };
    expect(serie(p, t)).toBe(4);
    p.activite = {};
    for (const d of [0, 3]) p.activite[new Date(t - d * JOUR).toISOString().slice(0, 10)] = { tci: 1 };
    expect(serie(p, t)).toBe(1);
  });
  it('propose des quêtes fondées sur du contenu existant', () => {
    const q = quetes(progressionVide());
    expect(q.filter((x) => x.periode === 'jour')).toHaveLength(4);
    const ex = q.find((x) => x.id === 'langue1')!.lien!;
    expect(idx.exercices.some((e) => ex.endsWith(e.id))).toBe(true);
  });
  it('n’attribue aucun badge sans activité', () => {
    expect(badgesObtenus(progressionVide(), new Map())).toEqual([]);
  });
});

describe('fil de publications', () => {
  it('chaque publication renvoie à un contenu de cours existant', () => {
    const chapitres = new Set(idx.matieres.flatMap((m) => m.chapitres.map((c) => c.id)));
    const questions = new Set(idx.questions.map((q) => q.id));
    const exercices = new Set(idx.exercices.map((e) => e.id));
    for (const p of fil) {
      if (p.n) expect(idx.notions[p.n], p.id).toBeDefined();
      if (p.c) expect(chapitres.has(p.c), p.id).toBe(true);
      for (const q of p.q ?? []) expect(questions.has(q), p.id).toBe(true);
      if (p.e) expect(exercices.has(p.e), p.id).toBe(true);
    }
  });
  it('chaque chapitre rédigé a son dossier dans le fil', () => {
    const dossiers = new Set(fil.filter((p) => p.type === 'dossier').map((p) => p.c));
    for (const m of idx.matieres) for (const c of m.chapitres) expect(dossiers.has(c.id), c.id).toBe(true);
  });
  it('chaque publication garde la langue de sa matière', () => {
    const langue = new Map(idx.matieres.map((m) => [m.id, m.langue]));
    for (const p of fil.filter((x) => !x.edito)) expect(p.l, p.id).toBe(langue.get(p.m));
  });
  it('les articles hors cours sont datés et sourcés', () => {
    for (const p of fil.filter((x) => x.edito)) { expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); expect(p.portee).toBeTruthy(); }
  });
  it('l’onglet « Enregistrés » ne montre que les publications enregistrées', () => {
    const p = progressionVide();
    p.enregistres[fil[3].id] = { t: 2 };
    p.enregistres[fil[9].id] = { t: 5 };
    expect(classer(fil, 'enregistres', p).map((x) => x.id)).toEqual([fil[9].id, fil[3].id]);
  });
  it('le fil « Pour vous » contient toutes les publications et varie les formats', () => {
    const liste = classer(fil, 'pour-vous', progressionVide());
    expect(new Set(liste.map((x) => x.id)).size).toBe(fil.length);
    const repetitions = liste.slice(0, 60).filter((x, i, a) => i > 0 && a[i - 1].type === x.type).length;
    expect(repetitions).toBe(0);
  });
});

describe('sujets de dissertation générés', () => {
  it('partent toujours d’une question réelle d’une fiche du chapitre', () => {
    for (const d of ['eco', 'cvb', 'cve', 'tci']) for (const f of readdirSync(`content/${d}`)) {
      const data = JSON.parse(readFileSync(`content/${d}/${f}`, 'utf8')) as FichierChapitre;
      const s = genererSujet(data, 'fr');
      if (!s) continue;
      expect(data.notions.some((n) => n.question === s.sujet), f).toBe(true);
      expect(s.plan.length).toBeGreaterThanOrEqual(3);
    }
  });
});
