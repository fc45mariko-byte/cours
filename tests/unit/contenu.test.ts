import { describe, it, expect } from 'vitest';
// @ts-expect-error module JS sans types
import { construireIndex } from '../../scripts/build-index.mjs';
import { readdirSync, readFileSync } from 'node:fs';
import { corrigerNombre } from '../../app/src/core/correction';

describe('contenu pédagogique', () => {
  it('ne contient aucune erreur de structure', () => {
    const { erreurs } = construireIndex();
    expect(erreurs).toEqual([]);
  });

  it('chaque exercice numérique accepte sa propre valeur attendue, écrite à la française', () => {
    for (const d of readdirSync('content', { withFileTypes: true }).filter((x) => x.isDirectory())) {
      for (const f of readdirSync(`content/${d.name}`)) {
        const data = JSON.parse(readFileSync(`content/${d.name}/${f}`, 'utf8'));
        for (const ex of data.exercices ?? []) for (const sq of ex.questions) {
          if (sq.reponse.type !== 'nombre') continue;
          const saisie = sq.reponse.valeur.toLocaleString('fr-FR');
          expect(corrigerNombre(sq.reponse, saisie).juste, `${ex.id}/${sq.id}`).toBe(true);
        }
      }
    }
  });
});
