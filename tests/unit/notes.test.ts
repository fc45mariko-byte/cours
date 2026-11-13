import { describe, it, expect } from 'vitest';
import { index } from '../../app/src/data';
import { progressionVide } from '../../app/src/core/store';
import { estimerNote, estimerSemestre, appreciation } from '../../app/src/notes';

const T = Date.UTC(2026, 10, 13, 12);
const cpt = index.matieres.find((m) => m.id === 'cpt')!;
const questionsCpt = Object.entries(index.questionsParNotion).filter(([n]) => n.startsWith('cpt.')).flatMap(([, q]) => q);

describe('notes estimées', () => {
  it('sans aucune donnée : pas de note inventée', () => {
    const e = estimerNote(cpt, progressionVide(), T);
    expect(e.note).toBeNull();
    expect(e.confiance).toBe('aucune');
  });
  it('matière sans contenu (tourisme) : indisponible', () => {
    const tou = index.matieres.find((m) => m.id === 'tou')!;
    expect(estimerNote(tou, progressionVide(), T).indisponible).toBeTruthy();
  });
  it('toutes les questions réussies plusieurs fois : note haute, bonne fiabilité', () => {
    const p = progressionVide();
    for (const q of questionsCpt) p.qcm[q] = [1, 2, 3].map((k) => ({ t: T - k * 3_600_000, ok: true }));
    const e = estimerNote(cpt, p, T);
    expect(e.note).toBeGreaterThanOrEqual(16);
    expect(e.confiance).toBe('bonne');
    expect(e.min).toBeLessThanOrEqual(e.note!);
    expect(e.max).toBeGreaterThanOrEqual(e.note!);
  });
  it('tout raté : note basse', () => {
    const p = progressionVide();
    for (const q of questionsCpt) p.qcm[q] = [1, 2, 3].map((k) => ({ t: T - k * 3_600_000, ok: false }));
    expect(estimerNote(cpt, p, T).note).toBeLessThanOrEqual(2);
  });
  it('un seul chapitre travaillé : le reste du programme compte zéro', () => {
    const p = progressionVide();
    const ch = cpt.chapitres[0].id;
    for (const q of questionsCpt.filter((id) => index.questions.find((x) => x.id === id)?.chapitre === ch)) p.qcm[q] = [{ t: T, ok: true }, { t: T, ok: true }, { t: T, ok: true }];
    const e = estimerNote(cpt, p, T);
    expect(e.note).not.toBeNull();
    expect(e.note!).toBeLessThan(8);
    expect(e.max - e.min).toBeGreaterThan(5);
    expect(e.chapitres[e.chapitres.length - 1].id).toBe(ch);
  });
  it('« Je sais » sans test : plafonné, fiabilité faible', () => {
    const p = progressionVide();
    for (const c of cpt.chapitres) p.marques[`synth:${c.id}`] = { compris: T };
    const e = estimerNote(cpt, p, T);
    expect(e.note).toBe(10);
    expect(e.confiance).toBe('faible');
  });
  it('un examen blanc récent sur la matière sert d’échantillon du programme', () => {
    const p = progressionVide();
    p.examensPasses.push({ id: 'x', t: T - 86_400_000, score: 16, total: 20, filtre: 'cpt' });
    const e = estimerNote(cpt, p, T);
    expect(e.note).toBe(16);
    expect(e.examen?.score).toBe(16);
    p.examensPasses.push({ id: 'y', t: T, score: 5, total: 5, filtre: cpt.chapitres[0].id });
    expect(estimerNote(cpt, p, T).note).toBe(16); // un examen sur un seul chapitre ne vaut pas pour toute la matière
    p.examensPasses[0].t = T - 30 * 86_400_000;
    expect(estimerNote(cpt, p, T).note).toBeNull();
  });
  it('semestre : une estimation par matière de l’emploi du temps, moyenne des matières estimées', () => {
    const p = progressionVide();
    p.examensPasses.push({ id: 'x', t: T, score: 10, total: 10, filtre: 'cpt' });
    const s = estimerSemestre(p, T);
    expect(s.notes.map((n) => n.matiere)).toEqual(index.matieres.filter((m) => m.emploiDuTemps).map((m) => m.id));
    expect(s.chiffrees).toBe(1);
    expect(s.moyenne).toBe(20);
  });
  it('appréciations', () => {
    expect(appreciation(7.5).libelle).toBe('Non validé');
    expect(appreciation(10).libelle).toBe('Validé de justesse');
    expect(appreciation(16).libelle).toBe('Très bien');
  });
});
