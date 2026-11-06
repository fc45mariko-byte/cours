// Cahiers d'exercices imprimables : un fichier par matière, content/cahiers/<matière>.json.
// Chaque exercice part des bases (rappel, méthode guidée) puis va vers l'application, avec un corrigé expliqué.
//
// Format :
// {
//   "matiere": "cpt", "titre": "…", "introduction": "…",
//   "sections": [{
//     "id": "cpt-s1", "titre": "…", "chapitre": "cpt.mecanisme", "notions": ["cpt.mecanisme.partie-double"],
//     "rappel": ["point essentiel du cours", "…"],
//     "exercices": [{
//       "id": "cpt-1", "niveau": "bases" | "application" | "approfondissement",
//       "titre": "…", "objectif": "Ce que l'exercice fait comprendre",
//       "enonce": "…", "donnees": { "entetes": [], "lignes": [[]] } (facultatif),
//       "methode": ["étape 1", "…"], "questions": ["…"], "lignes": 6,
//       "corrige": ["étape expliquée", "…"], "erreurs": ["piège fréquent"] (facultatif), "fictif": true
//     }]
//   }]
// }
export const NIVEAUX = ['bases', 'application', 'approfondissement'];

export function validerCahier(c, { err, notions, chapitres, matieres, chemin }) {
  const ou = (x) => `${chemin}${x ? ` (${x})` : ''}`;
  const m = matieres.find((x) => x.id === c.matiere);
  if (!m) { err(ou(), `matière inconnue ${c.matiere}`); return null; }
  if (chemin !== `content/cahiers/${c.matiere}.json`) err(ou(), `le fichier doit s'appeler ${c.matiere}.json`);
  if (!c.titre || !c.introduction) err(ou(), 'titre ou introduction manquant');
  if (!Array.isArray(c.sections) || !c.sections.length) { err(ou(), 'aucune section'); return null; }
  const ids = new Set();
  const compte = { bases: 0, application: 0, approfondissement: 0 };
  for (const s of c.sections) {
    if (!s.id || ids.has(s.id)) err(ou(s.id), 'identifiant de section manquant ou dupliqué');
    ids.add(s.id);
    if (!s.titre) err(ou(s.id), 'section sans titre');
    if (s.chapitre && !chapitres.has(s.chapitre)) err(ou(s.id), `chapitre inconnu ${s.chapitre}`);
    if (s.chapitre && !s.chapitre.startsWith(c.matiere + '.')) err(ou(s.id), `chapitre d'une autre matière ${s.chapitre}`);
    for (const n of s.notions ?? []) if (!notions[n]) err(ou(s.id), `notion inconnue ${n}`);
    if (!s.rappel?.length) err(ou(s.id), 'rappel de cours manquant');
    if (!s.exercices?.length) err(ou(s.id), 'section sans exercice');
    for (const e of s.exercices ?? []) {
      if (!e.id || ids.has(e.id)) err(ou(e.id), 'identifiant d’exercice manquant ou dupliqué');
      ids.add(e.id);
      if (!NIVEAUX.includes(e.niveau)) err(ou(e.id), `niveau invalide ${e.niveau}`);
      else compte[e.niveau]++;
      for (const k of ['titre', 'objectif', 'enonce']) if (!e[k]) err(ou(e.id), `${k} manquant`);
      if (!e.questions?.length) err(ou(e.id), 'aucune question');
      if (!e.methode?.length) err(ou(e.id), 'méthode guidée manquante');
      if (!e.corrige?.length) err(ou(e.id), 'corrigé manquant');
      if (e.corrige && e.questions && e.corrige.length < Math.min(e.questions.length, 2)) err(ou(e.id), 'corrigé plus court que le nombre de questions');
      if (typeof e.fictif !== 'boolean') err(ou(e.id), 'indication fictif / réel manquante');
      if (e.donnees) for (const l of e.donnees.lignes ?? []) if (l.length !== e.donnees.entetes.length) err(ou(e.id), 'ligne de données de longueur incorrecte');
      if (e.lignes !== undefined && !(e.lignes >= 0 && e.lignes <= 30)) err(ou(e.id), 'nombre de lignes de réponse invalide (0 à 30)');
    }
  }
  if (compte.bases < 3) err(ou(), `au moins 3 exercices « bases » attendus (${compte.bases})`);
  if (compte.application < 3) err(ou(), `au moins 3 exercices « application » attendus (${compte.application})`);
  const nbEx = compte.bases + compte.application + compte.approfondissement;
  return { matiere: c.matiere, titre: c.titre, langue: m.langue, sections: c.sections.length, exercices: nbEx };
}
