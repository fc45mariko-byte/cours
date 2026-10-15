import type { Question } from '../types';
import { corrigerQcm } from './correction';

export interface BilanExamen {
  score: number; total: number; pourcentage: number;
  parNotion: Record<string, { justes: number; total: number }>;
  parCompetence: Record<string, { justes: number; total: number }>;
  resultats: { id: string; juste: boolean; repondue: boolean }[];
}

export function bilanExamen(questions: Question[], reponses: Record<string, string[]>): BilanExamen {
  const parNotion: BilanExamen['parNotion'] = {};
  const parCompetence: BilanExamen['parCompetence'] = {};
  const resultats: BilanExamen['resultats'] = [];
  let score = 0;
  for (const q of questions) {
    const sel = reponses[q.id] ?? [];
    const juste = sel.length > 0 && corrigerQcm(q, sel).juste;
    if (juste) score++;
    const n = (parNotion[q.notion] ??= { justes: 0, total: 0 });
    n.total++; if (juste) n.justes++;
    const c = (parCompetence[q.competence] ??= { justes: 0, total: 0 });
    c.total++; if (juste) c.justes++;
    resultats.push({ id: q.id, juste, repondue: sel.length > 0 });
  }
  const total = questions.length;
  return { score, total, pourcentage: total ? Math.round((score / total) * 100) : 0, parNotion, parCompetence, resultats };
}
