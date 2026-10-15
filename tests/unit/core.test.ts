import { describe, it, expect } from 'vitest';
import { corrigerQcm, lireNombre, corrigerNombre, corrigerEcriture } from '../../app/src/core/correction';
import { noter, carteNeuve, estDue } from '../../app/src/core/srs';
import { calculerMaitrise } from '../../app/src/core/maitrise';
import { rechercher, normaliser } from '../../app/src/core/recherche';
import { melanger, melangerChoix } from '../../app/src/core/hasard';
import { Store, migrer } from '../../app/src/core/store';
import { bilanExamen } from '../../app/src/core/examen';
import type { Question } from '../../app/src/types';

const JOUR = 86_400_000;
const q: Question = {
  id: 'q1', notion: 'n', format: 'multiple', niveau: 2, competence: 'distinguer', enonce: '?',
  choix: [
    { id: 'a', texte: 'A', correct: true, explication: '' },
    { id: 'b', texte: 'B', correct: true, explication: '' },
    { id: 'c', texte: 'C', correct: false, explication: '' },
  ],
};

describe('correction des QCM', () => {
  it('exige exactement l’ensemble des bonnes réponses', () => {
    expect(corrigerQcm(q, ['a', 'b']).juste).toBe(true);
    expect(corrigerQcm(q, ['a']).juste).toBe(false);
    expect(corrigerQcm(q, ['a', 'b', 'c']).juste).toBe(false);
    expect(corrigerQcm(q, []).juste).toBe(false);
    expect(corrigerQcm(q, ['a']).detail).toEqual({ a: 'bonne-cochee', b: 'bonne-oubliee', c: 'fausse-ignoree' });
  });
});

describe('lecture des nombres', () => {
  it.each([
    ['12 500,50', 12500.5], ['12500.5', 12500.5], ['12 500 €', 12500], ['1.234,56', 1234.56],
    ['1,234.56', 1234.56], ['-3,5 %', -3.5], ['1 000 000', 1000000], ['0,075', 0.075], ['1.000.000', 1000000],
  ])('%s → %d', (s, n) => expect(lireNombre(s)).toBe(n));
  it('refuse le texte', () => { expect(lireNombre('douze')).toBeNull(); expect(lireNombre('')).toBeNull(); });
  it('applique la tolérance', () => {
    expect(corrigerNombre({ type: 'nombre', valeur: 489.9, tolerance: 1 }, '490').juste).toBe(true);
    expect(corrigerNombre({ type: 'nombre', valeur: 600000 }, '600 000').juste).toBe(true);
    expect(corrigerNombre({ type: 'nombre', valeur: 600000 }, '60 000').juste).toBe(false);
  });
});

describe('correction des écritures', () => {
  const attendu = { type: 'ecriture' as const, lignes: [
    { compte: '601', debit: 800 }, { compte: '44566', debit: 160 }, { compte: '401', credit: 960 }] };
  it('accepte une écriture complète dans un autre ordre', () => {
    const r = corrigerEcriture(attendu, [
      { compte: '401', debit: '', credit: '960' }, { compte: '601', debit: '800', credit: '' },
      { compte: '44566', debit: '160,00', credit: '' }, { compte: '', debit: '', credit: '' }]);
    expect(r.juste).toBe(true);
  });
  it('signale les lignes manquantes et le déséquilibre', () => {
    const r = corrigerEcriture(attendu, [{ compte: '601', debit: '960', credit: '' }, { compte: '401', debit: '', credit: '960' }]);
    expect(r.juste).toBe(false);
    expect(r.equilibree).toBe(true);
    expect(r.manquantes.length).toBe(2);
    expect(r.enTrop).toEqual(['601 débit 960']);
  });
});

describe('répétition espacée', () => {
  it('allonge les intervalles quand la réponse est correcte', () => {
    let c = noter(undefined, 'correct', 0);
    expect(c.intervalle).toBe(1);
    c = noter(c, 'correct', c.due);
    expect(c.intervalle).toBe(3);
    c = noter(c, 'facile', c.due);
    expect(c.intervalle).toBeGreaterThan(6);
  });
  it('remet à zéro une carte à revoir et la rend due rapidement', () => {
    const c = noter(noter(carteNeuve(), 'correct', 0), 'revoir', JOUR);
    expect(c.repetitions).toBe(0);
    expect(estDue(c, JOUR + 11 * 60_000)).toBe(true);
  });
  it('borne le facteur de facilité', () => {
    let c = carteNeuve();
    for (let i = 0; i < 20; i++) c = noter(c, 'revoir', i);
    expect(c.ef).toBe(1.3);
  });
});

describe('maîtrise', () => {
  const t0 = 1_000 * JOUR;
  it('est nulle sans activité, même si la fiche a été ouverte', () => {
    expect(calculerMaitrise({ qcm: [], exercices: [], cartes: [] }, t0).etat).toBe('nouvelle');
  });
  it('reste prudente avec une seule bonne réponse', () => {
    const m = calculerMaitrise({ qcm: [{ niveau: 1, tentatives: [{ t: t0, ok: true }] }], exercices: [], cartes: [] }, t0);
    expect(m.score).toBeLessThan(75);
  });
  it('exige une réussite de niveau 2 ou plus pour être maîtrisée', () => {
    const ok = (n: number) => Array.from({ length: n }, (_, i) => ({ t: t0 - i, ok: true }));
    const n1 = calculerMaitrise({ qcm: [{ niveau: 1, tentatives: ok(5) }], exercices: [], cartes: [] }, t0);
    expect(n1.score).toBeGreaterThanOrEqual(75);
    expect(n1.etat).toBe('en-cours');
    const n2 = calculerMaitrise({ qcm: [{ niveau: 2, tentatives: ok(5) }], exercices: [], cartes: [] }, t0);
    expect(n2.etat).toBe('maitrisee');
  });
  it('baisse après une longue période sans révision', () => {
    const e = { qcm: [{ niveau: 2, tentatives: [1, 2, 3, 4].map((i) => ({ t: t0 - i, ok: true })) }], exercices: [], cartes: [] };
    expect(calculerMaitrise(e, t0 + 120 * JOUR).score).toBeLessThan(calculerMaitrise(e, t0).score);
    expect(calculerMaitrise(e, t0 + 120 * JOUR).etat).not.toBe('maitrisee');
  });
  it('donne plus de poids aux erreurs récentes', () => {
    const recentFaux = calculerMaitrise({ qcm: [{ niveau: 1, tentatives: [{ t: t0 - 10, ok: true }, { t: t0 - 9, ok: true }, { t: t0, ok: false }] }], exercices: [], cartes: [] }, t0);
    const ancienFaux = calculerMaitrise({ qcm: [{ niveau: 1, tentatives: [{ t: t0 - 10, ok: false }, { t: t0 - 9, ok: true }, { t: t0, ok: true }] }], exercices: [], cartes: [] }, t0);
    expect(recentFaux.score).toBeLessThan(ancienFaux.score);
  });
});

describe('recherche', () => {
  const docs = [
    { id: '1', type: 'notion' as const, titre: 'Crédit documentaire', champs: [{ texte: 'Crédit documentaire', poids: 3 }], lien: '' },
    { id: '2', type: 'notion' as const, titre: 'Remise documentaire', champs: [{ texte: 'Remise documentaire', poids: 3 }], lien: '' },
  ];
  it('ignore accents et casse', () => {
    expect(normaliser('Crédit DOCUMENTAIRE')).toBe('credit documentaire');
    expect(rechercher(docs, 'credit').map((r) => r.doc.id)).toEqual(['1']);
    expect(rechercher(docs, 'documentaire').length).toBe(2);
  });
  it('exige tous les mots', () => { expect(rechercher(docs, 'remise credit')).toEqual([]); });
});

describe('hasard reproductible', () => {
  it('donne le même mélange pour la même graine', () => {
    expect(melanger([1, 2, 3, 4, 5], 42)).toEqual(melanger([1, 2, 3, 4, 5], 42));
    expect(melanger([1, 2, 3, 4, 5], 42).sort()).toEqual([1, 2, 3, 4, 5]);
  });
  it('laisse « Aucune de ces réponses » en dernier', () => {
    const c = melangerChoix([{ texte: 'Aucune de ces réponses' }, { texte: 'x' }, { texte: 'y' }], 7);
    expect(c[2].texte).toBe('Aucune de ces réponses');
  });
});

describe('sauvegarde de la progression', () => {
  const memoire = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); } }; };
  it('enregistre et relit la progression', () => {
    const s = memoire();
    const a = new Store(s);
    a.repondreQcm('q1', 'n', 'tci', false);
    const b = new Store(s);
    expect(b.etat.qcm.q1.length).toBe(1);
    expect(b.etat.erreurs.q1).toBeDefined();
  });
  it('retire une erreur après deux réussites consécutives', () => {
    const a = new Store(memoire());
    a.repondreQcm('q1', 'n', 'tci', false);
    a.repondreQcm('q1', 'n', 'tci', true);
    expect(a.etat.erreurs.q1).toBeDefined();
    a.repondreQcm('q1', 'n', 'tci', true);
    expect(a.etat.erreurs.q1).toBeUndefined();
  });
  it('survit à un stockage inutilisable', () => {
    const casse = { getItem: () => { throw new Error('bloqué'); }, setItem: () => { throw new Error('plein'); } };
    const a = new Store(casse);
    a.repondreQcm('q1', 'n', 'tci', true);
    expect(a.etat.qcm.q1.length).toBe(1);
    expect(a.persistant).toBe(false);
  });
  it('répare des données corrompues et refuse un fichier inconnu', () => {
    expect(migrer({ version: 1, qcm: 'x', examensPasses: 3 }).qcm).toEqual({});
    const a = new Store(memoire());
    expect(() => a.importer('{"foo":1}')).toThrow();
    a.importer(JSON.stringify({ version: 1, qcm: { q9: [{ t: 1, ok: true }] } }));
    expect(a.etat.qcm.q9.length).toBe(1);
  });
});

describe('bilan d’examen', () => {
  it('compte par notion et par compétence', () => {
    const b = bilanExamen([q, { ...q, id: 'q2', competence: 'appliquer' }], { q1: ['a', 'b'], q2: ['a'] });
    expect(b.score).toBe(1);
    expect(b.pourcentage).toBe(50);
    expect(b.parCompetence.appliquer).toEqual({ justes: 0, total: 1 });
    expect(b.resultats[1]).toEqual({ id: 'q2', juste: false, repondue: true });
  });
});
