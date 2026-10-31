import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

// Chaque matière est rédigée dans sa langue d'enseignement (champ « langue » du catalogue).
// Mesure : part des mots-outils propres à chaque langue dans le texte de cours et dans les QCM.
// Les mots communs à plusieurs langues (« la », « que », « en »…) sont exclus de la mesure.
const MOTS = {
  fr: ['le', 'les', 'des', 'une', 'est', 'dans', 'pour', 'qui', 'sur', 'avec', 'par', 'sont', 'pas', 'plus', 'ce', 'cette', 'aux', 'du', 'au', 'il', 'elle', 'leur', 'ou', 'où', 'être', 'peut'],
  en: ['the', 'of', 'and', 'is', 'in', 'to', 'that', 'for', 'with', 'are', 'on', 'as', 'by', 'this', 'it', 'be', 'which', 'from', 'an', 'or', 'not', 'was', 'its', 'their', 'can'],
  es: ['el', 'los', 'las', 'del', 'una', 'es', 'para', 'con', 'por', 'su', 'sus', 'al', 'lo', 'como', 'más', 'pero', 'sobre', 'este', 'esta', 'y', 'muy', 'también', 'puede', 'entre', 'cuando'],
} as const;
type L = keyof typeof MOTS;

function mesurer(texte: string): Record<L, number> & { mots: number } {
  const c = { fr: 0, en: 0, es: 0 };
  for (const m of texte.toLowerCase().split(/[^a-zàâçéèêëîïôûùüÿñáíóú]+/)) for (const l of ['fr', 'en', 'es'] as L[]) if ((MOTS[l] as readonly string[]).includes(m)) c[l]++;
  const t = c.fr + c.en + c.es;
  return { fr: c.fr / (t || 1), en: c.en / (t || 1), es: c.es / (t || 1), mots: t };
}

const catalogue = JSON.parse(readFileSync('content/catalogue.json', 'utf8')) as { matieres: { id: string; langue: L; languesEtudiees?: L[]; chapitres: { id: string }[] }[] };

describe('langue d’enseignement de chaque matière', () => {
  for (const m of catalogue.matieres) {
    for (const c of m.chapitres) {
      const p = `content/${m.id}/${c.id}.json`;
      if (!existsSync(p)) continue;
      it(`${c.id} est rédigé en ${m.langue}`, () => {
        const f = JSON.parse(readFileSync(p, 'utf8'));
        const cours = f.notions.map((n: Record<string, string>) => [n.question, n.definition, n.explication].join(' ')).join(' ');
        const qcm = (f.questions ?? []).map((q: { enonce: string; choix: { explication: string }[] }) => `${q.enonce} ${q.choix.map((x) => x.explication).join(' ')}`).join(' ');
        const corrections = (f.exercices ?? []).flatMap((e: { questions: { correction: string[] }[] }) => e.questions.flatMap((q) => q.correction)).join(' ');
        expect(mesurer(cours)[m.langue], 'fiches').toBeGreaterThan(0.6);
        // Matières de traduction : les QCM mettent par nature deux langues en regard (exception prévue par les règles).
        const seuilQcm = m.languesEtudiees ? 0.35 : 0.6;
        if (mesurer(qcm).mots >= 20) expect(mesurer(qcm)[m.langue], 'QCM et corrections').toBeGreaterThan(seuilQcm);
        if (mesurer(corrections).mots >= 20) expect(mesurer(corrections)[m.langue], 'corrigés d’exercices').toBeGreaterThan(m.languesEtudiees ? 0.35 : 0.5);
      });
    }
  }
});
