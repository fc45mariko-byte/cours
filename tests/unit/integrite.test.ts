import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { inventaire, REFERENCE } from '../../scripts/inventaire.mjs';

// Aucun contenu ni aucun identifiant ne doit disparaître : la progression enregistrée y est rattachée.
// Un ajout est accepté ; une suppression ou un renommage fait échouer le test.
describe('intégrité du contenu', () => {
  const reference = JSON.parse(readFileSync(REFERENCE, 'utf8')) as Record<string, string[]>;
  const actuel = inventaire() as Record<string, string[]>;
  for (const type of ['matieres', 'chapitres', 'notions', 'questions', 'flashcards', 'exercices']) {
    it(`conserve toutes les entrées de type « ${type} »`, () => {
      const presents = new Set(actuel[type]);
      expect(reference[type].filter((id) => !presents.has(id))).toEqual([]);
    });
  }
});
