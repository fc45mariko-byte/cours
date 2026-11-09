// Synthèses : l'essentiel d'une matière en 2 ou 3 pages, pour apprendre vite (content/syntheses/<matière>.json).
// Les limites de longueur sont contrôlées : une synthèse doit rester courte.
//
// {
//   "matiere": "cpt", "titre": "…",
//   "essentiel": "La matière en 2-3 phrases : de quoi elle parle, ce qu'il faut savoir faire.",
//   "chapitres": [{
//     "chapitre": "cpt.tva", "titre": "…",
//     "idee": "L'idée clé du chapitre en une phrase.",
//     "points": ["4 à 7 points essentiels, une ligne chacun"],
//     "formules": ["…"] (facultatif), "dates": [{ "date": "1986", "fait": "…" }] (facultatif),
//     "distinctions": [{ "a": "…", "b": "…", "difference": "…" }] (facultatif),
//     "memo": "Moyen mnémotechnique ou image pour retenir" (facultatif),
//     "questions": [{ "q": "Question de récitation", "r": "Réponse courte" }]  (2 à 4)
//   }],
//   "parCoeur": ["8 à 12 éléments à savoir par cœur"],
//   "pieges": ["3 à 6 pièges d'examen"]
// }
const MAX = { essentiel: 450, idee: 220, point: 230, question: 200, reponse: 300, parCoeur: 200, piege: 230, memo: 220 };

export function validerSynthese(s, { err, chapitres, matieres, chemin }) {
  const ou = (x) => `${chemin}${x ? ` (${x})` : ''}`;
  const m = matieres.find((x) => x.id === s.matiere);
  if (!m) { err(ou(), `matière inconnue ${s.matiere}`); return null; }
  if (chemin !== `content/syntheses/${s.matiere}.json`) err(ou(), `le fichier doit s'appeler ${s.matiere}.json`);
  const trop = (texte, max, ici) => { if (typeof texte !== 'string' || !texte.trim()) err(ou(ici), 'texte manquant'); else if (texte.length > max) err(ou(ici), `trop long (${texte.length} > ${max} caractères) : une synthèse doit rester brève`); };
  if (!s.titre) err(ou(), 'titre manquant');
  trop(s.essentiel, MAX.essentiel, 'essentiel');
  const vus = new Set();
  for (const c of s.chapitres ?? []) {
    if (!chapitres.has(c.chapitre) || !c.chapitre.startsWith(s.matiere + '.')) err(ou(c.chapitre), 'chapitre inconnu ou d’une autre matière');
    vus.add(c.chapitre);
    if (!c.titre) err(ou(c.chapitre), 'titre manquant');
    trop(c.idee, MAX.idee, `${c.chapitre} idée`);
    if (!c.points?.length || c.points.length > 7) err(ou(c.chapitre), `4 à 7 points attendus (${c.points?.length ?? 0})`);
    for (const p of c.points ?? []) trop(p, MAX.point, `${c.chapitre} point`);
    if (c.memo) trop(c.memo, MAX.memo, `${c.chapitre} mémo`);
    if (!c.questions?.length || c.questions.length > 4) err(ou(c.chapitre), `2 à 4 questions attendues (${c.questions?.length ?? 0})`);
    for (const q of c.questions ?? []) { trop(q.q, MAX.question, `${c.chapitre} question`); trop(q.r, MAX.reponse, `${c.chapitre} réponse`); }
    for (const d of c.distinctions ?? []) if (!d.a || !d.b || !d.difference) err(ou(c.chapitre), 'distinction incomplète');
    for (const d of c.dates ?? []) if (!d.date || !d.fait) err(ou(c.chapitre), 'date incomplète');
  }
  const manquants = m.chapitres.map((c) => c.id).filter((id) => !vus.has(id));
  if (manquants.length) err(ou(), `chapitres non couverts : ${manquants.join(', ')}`);
  if (!s.parCoeur?.length || s.parCoeur.length > 12) err(ou(), `8 à 12 éléments « par cœur » attendus (${s.parCoeur?.length ?? 0})`);
  for (const p of s.parCoeur ?? []) trop(p, MAX.parCoeur, 'par cœur');
  if (!s.pieges?.length || s.pieges.length > 6) err(ou(), `3 à 6 pièges attendus (${s.pieges?.length ?? 0})`);
  for (const p of s.pieges ?? []) trop(p, MAX.piege, 'piège');
  const questions = (s.chapitres ?? []).reduce((n, c) => n + (c.questions?.length ?? 0), 0);
  return { matiere: s.matiere, titre: s.titre, chapitres: (s.chapitres ?? []).length, questions };
}
