import { describe, it, expect } from 'vitest';
// @ts-expect-error module JS sans types
import { construireIndex } from '../../scripts/build-index.mjs';
import { progressionVide, Store } from '../../app/src/core/store';
import { recommander, scorer, signaux, edition, DUREE_EDITION } from '../../app/src/recommandation';
import type { Publication } from '../../app/src/types';

const { fil, index: idx } = construireIndex() as { fil: Publication[]; index: { questions: { id: string; notion: string; niveau: number }[] } };
const JOUR = 86_400_000;
const T = Date.UTC(2026, 10, 1, 10, 0); // un dimanche, 10 h UTC
const concept = (n: string) => fil.find((x) => x.id === `concept:${n}`)!;
const rang = (liste: { pub: Publication }[], id: string) => liste.findIndex((x) => x.pub.id === id);

/** Donne à une notion des résultats aux QCM (score), à une date donnée. */
function travailler(p: ReturnType<typeof progressionVide>, notion: string, justes: boolean[], t: number) {
  const qs = idx.questions.filter((q) => q.notion === notion);
  justes.forEach((ok, i) => { const q = qs[i % qs.length]; (p.qcm[q.id] ??= []).push({ t: t + i, ok }); });
}

describe('moteur de recommandation du fil', () => {
  it('est reproductible pour une même édition et change d’une édition à l’autre', () => {
    const p = progressionVide();
    const a = recommander(fil, p, { graine: 'e1', nombre: 20, maintenant: T }).map((x) => x.pub.id);
    const b = recommander(fil, p, { graine: 'e1', nombre: 20, maintenant: T }).map((x) => x.pub.id);
    const c = recommander(fil, p, { graine: 'e2', nombre: 20, maintenant: T }).map((x) => x.pub.id);
    expect(a).toEqual(b);
    expect(c.filter((id) => a.includes(id)).length).toBeLessThan(15);
  });

  it('renouvelle l’édition toutes les trois heures et à chaque actualisation', () => {
    const st = new Store(null);
    const e1 = edition(st.etat, T);
    const debut = Math.floor(T / DUREE_EDITION) * DUREE_EDITION;
    expect(edition(st.etat, debut + DUREE_EDITION - 1)).toBe(edition(st.etat, debut));
    expect(edition(st.etat, T + DUREE_EDITION)).not.toBe(e1);
    st.actualiserFil();
    expect(edition(st.etat, T)).not.toBe(e1);
  });

  it('fait revenir une notion comprise quand l’échéance de révision est passée', () => {
    const n1 = 'tci.incoterms.exw', n2 = 'tci.incoterms.fca';
    const p = progressionVide();
    travailler(p, n1, [true, true, true, true], T - 25 * JOUR); // maîtrisée, révisée il y a 25 jours (intervalle : 21)
    travailler(p, n2, [true, true, true, true], T - 1 * JOUR); // révisée hier
    const s = signaux(p, T);
    expect(s.statut.get(n1)).toBe(s.statut.get(n2));
    const r1 = scorer(concept(n1), p, s, 'g', T), r2 = scorer(concept(n2), p, s, 'g', T);
    expect(r1.score).toBeGreaterThan(r2.score);
    expect(r1.raison).toBe('echeance');
  });

  it('met en tête ce qui est marqué « à revoir »', () => {
    const p = progressionVide();
    const cible = concept('cpt.tva.mecanisme');
    p.marques[cible.id] = { aRevoir: T - JOUR };
    const liste = recommander(fil, p, { graine: 'g', nombre: 10, maintenant: T });
    expect(rang(liste, cible.id)).toBeGreaterThanOrEqual(0);
    expect(liste.find((x) => x.pub.id === cible.id)!.raison).toBe('a-revoir');
  });

  it('propose de se tester sur une notion lue mais jamais évaluée', () => {
    const p = progressionVide();
    const n = 'tci.incoterms.transfert-risque';
    p.marques[`concept:${n}`] = { vu: T - JOUR, lu: T - JOUR };
    const s = signaux(p, T);
    const quiz = fil.find((x) => x.id === `quiz:${n}`)!;
    const r = scorer(quiz, p, s, 'g', T);
    expect(r.raison).toBe('tester');
    expect(r.score).toBeGreaterThan(scorer(concept(n), p, s, 'g', T).score);
  });

  it('pénalise une publication déjà montrée sans réaction', () => {
    const p = progressionVide();
    const x = concept('eco.theories.hos');
    const avant = scorer(x, p, signaux(p, T), 'g', T).score;
    p.fil.impressions[x.id] = { n: 3, t: T - 2 * 3_600_000 };
    expect(scorer(x, p, signaux(p, T), 'g', T).score).toBeLessThan(avant - 1);
  });

  it('écarte ce qui est déjà compris ou lu', () => {
    const p = progressionVide();
    const x = concept('mgi.grilles.hofstede');
    const avant = scorer(x, p, signaux(p, T), 'g', T).score;
    p.marques[x.id] = { lu: T - 2 * JOUR, compris: T - 2 * JOUR };
    expect(scorer(x, p, signaux(p, T), 'g', T).score).toBeLessThan(avant - 2);
  });

  it('varie formats et matières : jamais deux fois de suite le même format ou la même matière', () => {
    const liste = recommander(fil, progressionVide(), { graine: 'g', nombre: 40, maintenant: T }).map((x) => x.pub);
    for (let i = 1; i < liste.length; i++) {
      expect(liste[i].type === liste[i - 1].type && liste[i].m === liste[i - 1].m, `${i}`).toBe(false);
    }
    expect(new Set(liste.map((x) => x.m)).size).toBeGreaterThan(10);
    expect(new Set(liste.map((x) => x.n).filter(Boolean)).size).toBe(liste.filter((x) => x.n).length);
  });

  it('s’adapte pendant la lecture : le lot suivant tient compte de ce qui vient d’être compris', () => {
    const p = progressionVide();
    const premier = recommander(fil, p, { graine: 'g', nombre: 10, maintenant: T });
    const suiteAvant = recommander(fil, p, { graine: 'g', deja: premier.map((x) => x.pub), nombre: 10, maintenant: T });
    for (const x of suiteAvant) p.marques[x.pub.id] = { lu: T, compris: T };
    const suiteApres = recommander(fil, p, { graine: 'g', deja: premier.map((x) => x.pub), nombre: 10, maintenant: T });
    expect(suiteApres.map((x) => x.pub.id).filter((id) => suiteAvant.some((y) => y.pub.id === id))).toEqual([]);
    expect(suiteApres.every((x) => !premier.some((y) => y.pub.id === x.pub.id))).toBe(true);
  });

  it('apprend les formats appréciés à partir des lectures', () => {
    const p = progressionVide();
    const frises = fil.filter((x) => x.type === 'frise').slice(0, 8);
    for (const f of frises) p.marques[f.id] = { vu: T - JOUR, lu: T - JOUR };
    const s = signaux(p, T);
    expect(s.affiniteType.get('frise')!).toBeGreaterThan(s.affiniteType.get('concept') ?? 1);
  });

  it('réserve des places à la découverte', () => {
    const liste = recommander(fil, progressionVide(), { graine: 'g', nombre: 18, maintenant: T });
    expect(liste.filter((x) => x.raison === 'decouverte').length).toBeGreaterThanOrEqual(2);
  });
});
