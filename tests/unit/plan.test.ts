import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { construirePlan, jourDuPlan, JOURS_APPRENTISSAGE } from '../../app/src/plan';
import type { MatiereCatalogue } from '../../app/src/types';

const index = JSON.parse(readFileSync('app/src/generated/index.json', 'utf8')) as { matieres: MatiereCatalogue[] };
const plan = construirePlan(index.matieres);
const edt = index.matieres.filter((m) => m.emploiDuTemps && m.completude !== 'absente' && m.chapitres.length);

describe('plan de révision en 14 jours', () => {
  it('compte 14 jours : 10 pour apprendre, 2 pour consolider, 2 pour finir', () => {
    expect(plan).toHaveLength(14);
    expect(plan.filter((j) => j.phase === 'apprendre')).toHaveLength(JOURS_APPRENTISSAGE);
    expect(plan.filter((j) => j.phase === 'consolider')).toHaveLength(2);
    expect(plan.filter((j) => j.phase === 'final')).toHaveLength(2);
  });
  it('chaque chapitre des matières de l’emploi du temps est appris une seule fois', () => {
    const appris = plan.flatMap((j) => j.nouveaux.flatMap((b) => b.chapitres));
    expect(new Set(appris).size).toBe(appris.length);
    expect(appris.sort()).toEqual(edt.flatMap((m) => m.chapitres.map((c) => c.id)).sort());
  });
  it('chaque jour d’apprentissage a du contenu et mêle les deux pistes quand c’est possible', () => {
    for (const j of plan.filter((x) => x.phase === 'apprendre')) expect(j.nouveaux.length).toBeGreaterThan(0);
  });
  it('les révisions espacées reviennent à J+1, J+3 et J+7', () => {
    expect(plan[0].revisions).toEqual([]);
    expect(plan[7].revisions.map((r) => r.jour)).toEqual([7, 5, 1]);
    expect(plan[13].revisions.map((r) => r.jour)).toEqual([7]);
    expect(plan[10].revisions.map((r) => r.jour)).toEqual([10, 8, 4]);
  });
  it('le jour du plan se calcule à partir de la date de début', () => {
    const debut = new Date(2026, 10, 2, 20).getTime();
    expect(jourDuPlan(undefined)).toBe(0);
    expect(jourDuPlan(debut, new Date(2026, 10, 2, 8).getTime())).toBe(1);
    expect(jourDuPlan(debut, new Date(2026, 10, 4, 23).getTime())).toBe(3);
    expect(jourDuPlan(debut, new Date(2026, 11, 30).getTime())).toBe(14);
  });
});
