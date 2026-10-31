// Génère les publications du fil à partir du contenu existant.
// Une publication ne recopie pas le cours : elle référence une notion, un bloc, des questions ou un exercice,
// et l'application va chercher le contenu dans le fichier de chapitre au moment de l'afficher.
// Seuls un titre et un chapeau courts (extraits) sont stockés, pour l'affichage de la liste.

const ANNEE = /\b(1[5-9]\d\d|20\d\d)\b/;
const DEBAT = /^(pour|contre|avantages?|inconv[ée]nients?|arguments?|for|against|pros?|cons?|ventajas?|desventajas?|a favor|en contra|partisans|opposants|risques?)\b/i;

const mots = (s) => (s ?? '').split(/\s+/).filter(Boolean).length;
const court = (s, n = 170) => {
  const t = (s ?? '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const coupe = t.slice(0, n);
  return coupe.slice(0, coupe.lastIndexOf(' ')) + '…';
};
const premierePhrase = (s) => court((s ?? '').split(/(?<=[.!?])\s/)[0], 170);
const minutes = (n) => Math.max(1, Math.round(n / 200));
const NIV = { P: 1, F: 2, A: 3 };

function texteNotion(n) {
  let t = [n.question, n.definition, n.explication, n.contreExemple, n.exemple?.texte].join(' ');
  for (const b of n.fonctionnement ?? []) t += ' ' + JSON.stringify(b);
  return t;
}

/** Publications dérivées d'un fichier de chapitre. */
export function publicationsDuChapitre(matiere, chapitreCat, data) {
  const L = matiere.langue ?? 'fr';
  const base = (n) => ({ m: matiere.id, c: chapitreCat.id, l: L });
  const pubs = [];
  const notions = data.notions ?? [];
  const qParNotion = {};
  for (const q of data.questions ?? []) (qParNotion[q.notion] ??= []).push(q);

  for (const n of notions) {
    const niv = NIV[n.niveau] ?? 2;
    pubs.push({ id: `concept:${n.id}`, type: 'concept', ...base(n), n: n.id, t: n.titre, x: n.question ? court(n.question) : premierePhrase(n.definition), min: minutes(mots(texteNotion(n))), niv });

    const blocs = n.fonctionnement ?? [];
    const iEtapes = blocs.findIndex((b) => b.type === 'etapes' && b.etapes.length >= 3);
    if (iEtapes >= 0) {
      const b = blocs[iEtapes];
      pubs.push({ id: `schema:${n.id}`, type: 'infographie', ...base(n), n: n.id, b: iEtapes, t: b.titre || n.titre, x: court(n.question ?? n.definition), min: 1, niv });
    }
    const iFrise = blocs.findIndex((b) => b.type === 'tableau' && b.lignes.length >= 3 && b.lignes.filter((l) => ANNEE.test(l[0])).length >= Math.ceil(b.lignes.length * 0.6));
    if (iFrise >= 0) {
      const b = blocs[iFrise];
      pubs.push({ id: `frise:${n.id}`, type: 'frise', ...base(n), n: n.id, b: iFrise, t: b.titre || n.titre, x: court(n.question ?? n.definition), min: 2, niv });
    }
    const iDebat = blocs.findIndex((b) => b.type === 'tableau' && b.entetes.filter((h) => DEBAT.test(h.trim())).length >= 2);
    if (iDebat >= 0) {
      const b = blocs[iDebat];
      pubs.push({ id: `debat:${n.id}`, type: 'debat', ...base(n), n: n.id, b: iDebat, t: b.titre || n.titre, x: court(n.question ?? n.definition), min: 2, niv: Math.max(2, niv) });
    }
    if ((n.confusions ?? []).length) {
      const c = n.confusions[0];
      pubs.push({ id: `compare:${n.id}`, type: 'comparaison', ...base(n), n: n.id, t: `${court(c.a, 70)} ≠ ${court(c.b, 70)}`, x: court(c.explication), min: 1, niv });
    }
    const qs = qParNotion[n.id] ?? [];
    if (qs.length >= 2) {
      pubs.push({ id: `quiz:${n.id}`, type: 'quiz', ...base(n), n: n.id, q: qs.map((q) => q.id), t: n.titre, x: court(qs[0].enonce), min: Math.max(1, Math.round(qs.length * 0.75)), niv: Math.round(qs.reduce((s, q) => s + q.niveau, 0) / qs.length) });
    }
    const termes = (n.termes ?? []).filter((t) => t.en && t.es);
    if (termes.length >= 2) {
      pubs.push({ id: `mots:${n.id}`, type: 'langue', ...base(n), n: n.id, t: termes.slice(0, 3).map((t) => t.fr).join(' · '), x: court(termes[0].definition), min: 1, niv: 1 });
    }
  }

  for (const ex of data.exercices ?? []) {
    const type = ex.type === 'traduction' ? 'langue' : ex.type === 'calcul' || ex.type === 'ecriture' ? 'exercice' : 'cas';
    pubs.push({ id: `cas:${ex.id}`, type, ...base(), n: ex.notions[0], e: ex.id, t: ex.titre, x: court(ex.enonce), min: Math.max(2, ex.questions.length * 2), niv: ex.niveau, fictif: ex.fictif !== false });
  }

  if (notions.length) {
    const total = notions.reduce((s, n) => s + mots(texteNotion(n)), 0);
    pubs.push({ id: `dossier:${chapitreCat.id}`, type: 'dossier', ...base(), t: chapitreCat.titre, x: court(notions.map((n) => n.titre).join(' · '), 190), min: minutes(total), niv: 2 });
  }
  if (notions.filter((n) => n.question).length >= 2) {
    pubs.push({ id: `sujet:${chapitreCat.id}`, type: 'sujet', ...base(), t: chapitreCat.titre, x: court((notions.find((n) => n.niveau === 'A' && n.question) ?? notions.find((n) => n.question)).question), min: 3, niv: 3, genere: true });
  }
  return pubs;
}

const TYPES_EDITO = ['monde', 'dossier', 'donnees', 'debat', 'cas', 'comparaison', 'frise'];

/** Valide un article éditorial (hors cours) et renvoie son entrée de fil. */
export function publicationEditoriale(a, { err, notions, sourceIds, chemin }) {
  const ou = `${chemin} (${a.id ?? '?'})`;
  if (!a.id || !/^[a-z0-9-]+$/.test(a.id)) err(ou, 'identifiant invalide (a-z, 0-9, tirets)');
  if (!TYPES_EDITO.includes(a.type)) err(ou, `type inconnu ${a.type}`);
  if (!a.titre || !a.chapeau) err(ou, 'titre ou chapeau manquant');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.publieLe ?? '')) err(ou, 'date de publication manquante (AAAA-MM-JJ)');
  if (!['historique', 'actuel', 'permanent'].includes(a.portee)) err(ou, 'portée manquante (historique, actuel ou permanent)');
  if (!a.sources?.length) err(ou, 'aucune source');
  for (const s of a.sources ?? []) if (!sourceIds.has(s)) err(ou, `source inconnue ${s}`);
  if (!a.faits?.length) err(ou, 'aucun fait');
  if (!a.notions?.length) err(ou, 'aucune notion de cours liée');
  for (const n of a.notions ?? []) if (!notions[n]) err(ou, `notion inconnue ${n}`);
  if (a.donnees) {
    if (!a.donnees.source) err(ou, 'données sans source');
    if (typeof a.donnees.fictif !== 'boolean') err(ou, 'données sans indication fictif / réel');
  }
  const corps = [a.chapeau, ...(a.faits ?? []), ...(a.analyse ?? []), ...(a.sections ?? []).map((s) => s.texte)].join(' ');
  const premiere = notions[a.notions?.[0]];
  return {
    id: `ed:${a.id}`, type: a.type, edito: true, m: premiere?.matiere ?? 'eco', c: premiere?.chapitre, n: a.notions?.[0],
    l: a.langue ?? 'fr', t: a.titre, x: court(a.chapeau, 200), min: minutes(mots(corps)), niv: a.niveau ?? 2,
    date: a.publieLe, portee: a.portee,
  };
}
