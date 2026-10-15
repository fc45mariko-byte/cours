// Recherche plein texte côté client, insensible à la casse et aux accents.

export const normaliser = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, ' ');

export interface Document { id: string; type: 'notion' | 'terme'; titre: string; champs: { texte: string; poids: number }[]; lien: string; sousTitre?: string }
export interface Resultat { doc: Document; score: number }

export function rechercher(docs: Document[], requete: string, limite = 30): Resultat[] {
  const mots = normaliser(requete).split(/[^a-z0-9®]+/).filter((m) => m.length >= 2);
  if (!mots.length) return [];
  const res: Resultat[] = [];
  for (const doc of docs) {
    let score = 0;
    let tousTrouves = true;
    for (const mot of mots) {
      let trouve = false;
      for (const c of doc.champs) {
        const t = normaliser(c.texte);
        const i = t.indexOf(mot);
        if (i >= 0) {
          trouve = true;
          // Bonus si le mot est trouvé en début de mot.
          score += c.poids * (i === 0 || /\W/.test(t[i - 1]) ? 2 : 1);
        }
      }
      if (!trouve) tousTrouves = false;
    }
    if (tousTrouves && score > 0) res.push({ doc, score });
  }
  return res.sort((a, b) => b.score - a.score || a.doc.titre.localeCompare(b.doc.titre, 'fr')).slice(0, limite);
}
