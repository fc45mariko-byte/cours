import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

const catalogue = JSON.parse(readFileSync('content/catalogue.json', 'utf8')) as { matieres: { id: string; completude: string; emploiDuTemps?: unknown; chapitres: { id: string }[] }[] };

describe('cahiers d’exercices imprimables', () => {
  for (const m of catalogue.matieres.filter((x) => x.completude !== 'absente')) {
    it(`${m.id} : un cahier qui couvre tous les chapitres, avec son PDF`, () => {
      const p = `content/cahiers/${m.id}.json`;
      expect(existsSync(p), p).toBe(true);
      const c = JSON.parse(readFileSync(p, 'utf8'));
      const couverts = new Set(c.sections.map((s: { chapitre?: string }) => s.chapitre));
      expect(m.chapitres.filter((ch) => !couverts.has(ch.id))).toEqual([]);
      expect(existsSync(`imprimables/${m.id}.pdf`), `imprimables/${m.id}.pdf`).toBe(true);
    });
  }
});
