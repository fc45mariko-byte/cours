// Sujets de dissertation générés à partir des fiches d'un chapitre, sans IA et de façon reproductible.
// Le résultat est toujours présenté comme « généré » : il ne fait pas partie du cours.
import type { FichierChapitre, Langue, Notion } from './types';
import { lib } from './i18n';
import { index } from './data';

export interface SujetGenere {
  id: string; chapitre: string; langue: Langue;
  sujet: string; problematique: string; plan: string[];
  concepts: { fr: string; trad?: string }[];
  exemples: { texte: string; fictif: boolean; notion: string }[];
  objections: string[]; notions: string[];
}

/** variante : 0 pour le sujet principal du chapitre, 1, 2… pour d'autres angles. */
export function genererSujet(f: FichierChapitre, langue: Langue, variante = 0): SujetGenere | null {
  const L = lib(langue);
  const avecQuestion = f.notions.filter((n) => n.question);
  if (avecQuestion.length < 2) return null;
  const ordre = [...avecQuestion].sort((a, b) => (b.niveau === 'A' ? 1 : 0) - (a.niveau === 'A' ? 1 : 0));
  const pivot = ordre[variante % ordre.length];
  const ids = new Set(f.notions.map((n) => n.id));
  const second: Notion = f.notions.find((n) => n.id !== pivot.id && (pivot.connexes ?? []).includes(n.id))
    ?? f.notions.find((n) => n.id !== pivot.id && (n.prerequis ?? []).includes(pivot.id))
    ?? avecQuestion.find((n) => n.id !== pivot.id)!;
  const lies = [pivot, second];
  const externes = (pivot.connexes ?? []).filter((x) => !ids.has(x) && index.notions[x]).slice(0, 2);
  const concepts = lies.flatMap((n) => (n.termes ?? []).slice(0, 3)).map((t) => ({ fr: t.fr, trad: langue === 'en' ? t.en : langue === 'es' ? t.es : [t.en, t.es].filter(Boolean).join(' / ') }));
  const exemples = lies.filter((n) => n.exemple).map((n) => ({ texte: n.exemple!.texte, fictif: n.exemple!.fictif, notion: n.id }));
  const objections = [
    ...lies.flatMap((n) => (n.confusions ?? []).map((c) => `${c.a} / ${c.b} : ${c.explication}`)),
    ...lies.filter((n) => n.contreExemple).map((n) => n.contreExemple!),
  ].slice(0, 4);
  return {
    id: `${f.chapitre}:${variante % ordre.length}`, chapitre: f.chapitre, langue,
    sujet: pivot.question!,
    problematique: L.problematiqueModele(pivot.titre, second.titre),
    plan: L.planModele(pivot.titre, second.titre),
    concepts, exemples, objections,
    notions: [pivot.id, second.id, ...externes],
  };
}
