// Valide le contenu pédagogique et génère l'index léger chargé au démarrage.
// Usage : node scripts/build-index.mjs  (échoue avec un code 1 si une erreur est trouvée)
import { readFileSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');
const OUT = join(ROOT, 'app', 'src', 'generated');

const erreurs = [];
const err = (ou, msg) => erreurs.push(`${ou} : ${msg}`);
const lire = (f) => {
  try { return JSON.parse(readFileSync(f, 'utf8')); }
  catch (e) { err(f, `JSON invalide (${e.message})`); return null; }
};

export function construireIndex() {
  erreurs.length = 0;
  const catalogue = lire(join(CONTENT, 'catalogue.json'));
  const sources = lire(join(CONTENT, 'sources.json')) ?? [];
  const sourceIds = new Set(sources.map((s) => s.id));

  const notions = {};
  const chapitreDeNotion = {};
  for (const m of catalogue.matieres) {
    for (const c of m.chapitres) {
      if (!c.id.startsWith(m.id + '.')) err(c.id, `chapitre hors de la matière ${m.id}`);
      for (const n of c.notions) {
        if (!n.id.startsWith(c.id + '.')) err(n.id, `notion hors du chapitre ${c.id}`);
        if (notions[n.id]) err(n.id, 'identifiant de notion dupliqué dans le catalogue');
        notions[n.id] = {
          ...n, matiere: m.id, chapitre: c.id, redigee: false,
          prerequis: [], connexes: [], nbQuestions: 0, nbFlashcards: 0, nbExercices: 0,
        };
        chapitreDeNotion[n.id] = c.id;
      }
    }
  }

  const notionsVerifiees = {};
  const ids = new Set();
  const unique = (id, ou) => { if (ids.has(id)) err(ou, `identifiant dupliqué ${id}`); ids.add(id); };
  const questionsParNotion = {};
  const flashcards = [], exercices = [], questions = [], glossaire = [];
  const liens = [];

  const dossiers = readdirSync(CONTENT).filter((d) => statSync(join(CONTENT, d)).isDirectory());
  for (const d of dossiers) {
    for (const f of readdirSync(join(CONTENT, d)).filter((x) => x.endsWith('.json'))) {
      const chemin = `content/${d}/${f}`;
      const data = lire(join(CONTENT, d, f));
      if (!data) continue;
      const chap = data.chapitre;
      if (!Object.values(chapitreDeNotion).includes(chap)) { err(chemin, `chapitre inconnu ${chap}`); continue; }
      if (f !== `${chap}.json`) err(chemin, `le fichier doit s'appeler ${chap}.json`);

      for (const n of data.notions ?? []) {
        unique(n.id, chemin);
        const idx = notions[n.id];
        if (!idx) { err(chemin, `notion ${n.id} absente du catalogue`); continue; }
        if (idx.chapitre !== chap) err(chemin, `notion ${n.id} rangée dans le mauvais chapitre`);
        if (!n.definition && !n.explication) err(n.id, 'ni définition ni explication');
        if (n.exemple && typeof n.exemple.fictif !== 'boolean') err(n.id, 'exemple sans indication fictif/réel');
        if (n.exemple && n.exemple.fictif === false && !n.exemple.source) err(n.id, 'exemple réel sans source');
        for (const s of n.sources ?? []) if (!sourceIds.has(s)) err(n.id, `source inconnue ${s}`);
        idx.redigee = true;
        if (n.verifieLe) notionsVerifiees[n.id] = n.verifieLe;
        idx.titre = n.titre;
        idx.niveau = n.niveau;
        idx.prerequis = n.prerequis ?? [];
        idx.connexes = n.connexes ?? [];
        idx.definition = n.definition ?? n.explication?.slice(0, 220);
        for (const p of idx.prerequis) liens.push([n.id, p, 'prérequis']);
        for (const p of idx.connexes) liens.push([n.id, p, 'connexe']);
        for (const t of n.termes ?? []) {
          if (!t.fr || !t.definition) err(n.id, 'terme incomplet');
          glossaire.push({ ...t, notion: n.id, matiere: idx.matiere });
        }
        for (const b of n.fonctionnement ?? []) {
          if (b.type === 'tableau') for (const l of b.lignes) if (l.length !== b.entetes.length) err(n.id, `ligne de tableau de ${l.length} cellules pour ${b.entetes.length} en-têtes`);
        }
      }

      for (const q of data.questions ?? []) {
        unique(q.id, chemin);
        if (!notions[q.notion]) { err(q.id, `notion inconnue ${q.notion}`); continue; }
        const bonnes = q.choix.filter((c) => c.correct).length;
        if (bonnes < 1) err(q.id, 'aucune bonne réponse');
        if ((q.format === 'unique' || q.format === 'vrai-faux') && bonnes !== 1) err(q.id, `format ${q.format} avec ${bonnes} bonnes réponses`);
        if (q.format === 'vrai-faux' && q.choix.length !== 2) err(q.id, 'vrai-faux sans exactement 2 choix');
        if (q.choix.length < 2) err(q.id, 'moins de 2 choix');
        const textes = new Set();
        for (const c of q.choix) {
          if (!c.explication) err(q.id, `choix ${c.id} sans explication`);
          if (textes.has(c.texte)) err(q.id, `choix dupliqué « ${c.texte} »`);
          textes.add(c.texte);
        }
        if (![1, 2, 3].includes(q.niveau)) err(q.id, 'niveau invalide');
        (questionsParNotion[q.notion] ??= []).push(q.id);
        notions[q.notion].nbQuestions++;
        questions.push({ id: q.id, notion: q.notion, chapitre: chap, niveau: q.niveau, competence: q.competence });
      }

      for (const fc of data.flashcards ?? []) {
        unique(fc.id, chemin);
        if (!fc.indispensables?.length) err(fc.id, 'aucun critère indispensable');
        if (!fc.reponse) err(fc.id, 'réponse de référence manquante');
        for (const n of fc.notions) { if (!notions[n]) err(fc.id, `notion inconnue ${n}`); else notions[n].nbFlashcards++; }
        flashcards.push({ id: fc.id, notions: fc.notions, chapitre: chap });
      }

      for (const ex of data.exercices ?? []) {
        unique(ex.id, chemin);
        for (const n of ex.notions) { if (!notions[n]) err(ex.id, `notion inconnue ${n}`); else notions[n].nbExercices++; }
        for (const sq of ex.questions) {
          const r = sq.reponse;
          if (!sq.correction?.length) err(`${ex.id}/${sq.id}`, 'correction manquante');
          if (r.type === 'nombre' && typeof r.valeur !== 'number') err(`${ex.id}/${sq.id}`, 'valeur numérique manquante');
          if (r.type === 'ecriture') {
            const d = r.lignes.reduce((s, l) => s + (l.debit ?? 0), 0);
            const c = r.lignes.reduce((s, l) => s + (l.credit ?? 0), 0);
            if (Math.abs(d - c) > 0.005) err(`${ex.id}/${sq.id}`, `écriture déséquilibrée (D ${d} / C ${c})`);
          }
          if (r.type === 'choix' && !(r.correcte >= 0 && r.correcte < r.options.length)) err(`${ex.id}/${sq.id}`, 'index de bonne option invalide');
          if (r.type === 'libre' && (!r.criteres?.length || !r.corrige)) err(`${ex.id}/${sq.id}`, 'réponse libre sans critères ou corrigé');
        }
        exercices.push({ id: ex.id, notions: ex.notions, chapitre: chap, titre: ex.titre, niveau: ex.niveau, type: ex.type });
      }
    }
  }

  for (const [de, vers, type] of liens) if (!notions[vers]) err(de, `${type} inconnu ${vers}`);

  glossaire.sort((a, b) => a.fr.localeCompare(b.fr, 'fr'));
  return {
    erreurs: [...erreurs],
    index: {
      // Date déterministe (dernière vérification de contenu) pour un build reproductible.
      genereLe: Object.values(notionsVerifiees).sort().at(-1) ?? '',
      matieres: catalogue.matieres, notions, questionsParNotion,
      flashcards, exercices, questions, glossaire, sources,
    },
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { erreurs: e, index } = construireIndex();
  if (e.length) {
    console.error(`✗ ${e.length} erreur(s) dans le contenu :\n  ` + e.join('\n  '));
    process.exit(1);
  }
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, 'index.json'), JSON.stringify(index));
  const red = Object.values(index.notions).filter((n) => n.redigee).length;
  console.log(`✓ contenu valide : ${red}/${Object.keys(index.notions).length} notions rédigées, ${index.questions.length} QCM, ${index.flashcards.length} flashcards, ${index.exercices.length} exercices, ${index.glossaire.length} termes`);
}
