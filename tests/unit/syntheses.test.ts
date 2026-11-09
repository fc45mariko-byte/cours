import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { versionExpress } from '../../app/src/pages/Cahier';

const catalogue = JSON.parse(readFileSync('content/catalogue.json', 'utf8')) as { matieres: { id: string; completude: string; chapitres: { id: string }[] }[] };

describe('synthèses et exercices express', () => {
  for (const m of catalogue.matieres.filter((x) => x.completude !== 'absente')) {
    it(`${m.id} : synthèse couvrant tous les chapitres, PDF synthèse, express et complet`, () => {
      const s = JSON.parse(readFileSync(`content/syntheses/${m.id}.json`, 'utf8'));
      expect(s.chapitres.map((c: { chapitre: string }) => c.chapitre)).toEqual(m.chapitres.map((c) => c.id));
      for (const f of [`imprimables/syntheses/${m.id}.pdf`, `imprimables/${m.id}.pdf`, `imprimables/complet/${m.id}.pdf`]) expect(existsSync(f), f).toBe(true);
      const cahier = JSON.parse(readFileSync(`content/cahiers/${m.id}.json`, 'utf8'));
      const ex = versionExpress(cahier);
      expect(ex.sections.every((x) => x.exercices.length === 1)).toBe(true);
    });
  }
  it('PDF de toutes les synthèses du semestre', () => expect(existsSync('imprimables/syntheses/semestre.pdf')).toBe(true));
});
