import { index, LIBELLE_LANGUE, matiere } from '../data';
import { useProgression } from '../hooks';
import { Fil, Jauge, StatutPastille, STATUT_MATIERE } from '../ui/communs';
import { Motif } from '../ui/visuels';
import { statutNotion, statutsPerimetre } from '../jeu';

export function Matiere({ id }: { id: string }) {
  const p = useProgression();
  const m = matiere(id);
  if (!m) return <div class="vide">Matière introuvable. <a href="#/bibliotheque">Bibliothèque</a></div>;
  const s = statutsPerimetre(m.id, p);
  const acquis = s.parStatut.compris.length + s.parStatut.maitrise.length;
  const nbQ = index.questions.filter((q) => q.notion.startsWith(m.id + '.')).length;
  const nbF = index.flashcards.filter((f) => f.notions.some((n) => n.startsWith(m.id + '.'))).length;
  const nbE = index.exercices.filter((e) => e.notions.some((n) => n.startsWith(m.id + '.'))).length;

  return (
    <>
      <Fil elements={[{ label: 'Bibliothèque', href: '#/bibliotheque' }, { label: m.titre }]} />
      <header class={`une-matiere ton-${m.couleur}`}>
        <Motif categorie={m.categorie} graine={m.id} />
        <p class="surtitre"><span>{m.categorie}</span><span>{m.annee}{m.semestres.length ? ` · ${m.semestres.join(' et ')}` : ''}</span><span>Enseigné en {LIBELLE_LANGUE[m.langue].toLowerCase()}</span></p>
        <h1 class="titre-page" style={{ maxWidth: '16em' }}>{m.titre}</h1>
        <p class="small">{m.enseignant && <>Enseignement : {m.enseignant} · </>}{m.code && <>{m.code} · </>}{STATUT_MATIERE[m.statut]}</p>
        {m.emploiDuTemps && <p class="small"><strong>À l’emploi du temps</strong> : {m.emploiDuTemps.intitule} · {m.emploiDuTemps.seances.join(' et ')}</p>}
        {m.completude !== 'absente' && <div style={{ maxWidth: 420 }}><Jauge valeur={s.ids.length ? (acquis / s.ids.length) * 100 : 0} label="Notions comprises" /><span class="small">{acquis} notion{acquis > 1 ? 's' : ''} comprise{acquis > 1 ? 's' : ''} sur {s.ids.length}</span></div>}
      </header>

      {m.completude === 'absente' && (
        <div class="encadre attention">
          <p><strong>Contenu absent.</strong> {m.noteCompletude}</p>
          <p class="small">Aucun chapitre n’a été inventé. Pour compléter cette matière, il faut le syllabus ou les supports du cours (intitulé exact, ordre des chapitres, contenu).</p>
        </div>
      )}
      {m.statut === 'COMP' && <p class="encadre attention small">Cette matière ne figure pas dans la maquette d’Orléans consultée : c’est un complément fréquent dans d’autres licences LEA commerce international.</p>}
      {m.statut === 'ORL?' && m.completude !== 'absente' && <p class="encadre attention small">Sa place exacte dans la maquette en vigueur reste à confirmer.</p>}
      {m.languesEtudiees && <p class="small muted">Matière de traduction : consignes et méthode en français, textes en {m.languesEtudiees.map((l) => LIBELLE_LANGUE[l].toLowerCase()).join(' et ')}.</p>}

      {m.completude !== 'absente' && (
        <div class="ligne" style={{ margin: '8px 0 0' }}>
          <a class="btn" href={`#/etudier/session?p=${m.id}`}>Session de révision</a>
          {index.cahiers.some((c) => c.matiere === m.id) && <a class="btn secondaire" href={`#/cahier/${m.id}`}>Cahier d’exercices à imprimer</a>}
          <a class="btn secondaire" href={`#/progres/arbre/${m.id}`}>Arbre de compétences</a>
          <a class="btn discret" href={`#/entrainer/qcm?p=${m.id}`}>QCM ({nbQ})</a>
          <a class="btn discret" href={`#/flashcards?p=${m.id}`}>Flashcards ({nbF})</a>
          <a class="btn discret" href={`#/entrainer?p=${m.id}&onglet=exercices`}>Exercices ({nbE})</a>
          <a class="btn discret" href={`#/examen?p=${m.id}`}>Examen blanc</a>
        </div>
      )}

      {m.chapitres.length > 0 && <div class="section-titre"><h2>Chapitres</h2><span class="meta">{m.chapitres.length}</span></div>}
      <ol class="sommaire-chap" lang={m.langue}>
        {m.chapitres.map((c) => {
          const ns = c.notions.map((n) => n.id);
          const ok = ns.filter((n) => ['compris', 'maitrise'].includes(statutNotion(n, p))).length;
          const etat = p.chapitres[c.id];
          return (
            <li key={c.id}>
              <a href={`#/chapitre/${c.id}`}>
                <span><span style={{ fontFamily: 'var(--serif)', fontSize: '1.25rem' }}>{c.titre}</span><br />
                  <span class="small muted">{c.notions.map((n) => index.notions[n.id]?.titre ?? n.titre).join(' · ')}</span></span>
                <span class="meta" lang="fr">{etat?.termine ? 'Terminé' : etat ? 'Commencé' : ''} {ok}/{ns.length}</span>
              </a>
            </li>
          );
        })}
      </ol>

      {m.completude !== 'absente' && (
        <details style={{ marginTop: 32 }}>
          <summary class="small" style={{ cursor: 'pointer' }}>Toutes les notions et leur statut</summary>
          <ul class="notions" lang={m.langue}>{s.ids.map((n) => (
            <li key={n}><a href={`#/notion/${n}`}><span><span class="niveau">{index.notions[n].niveau}</span>{index.notions[n].titre}</span><StatutPastille s={statutNotion(n, p)} /></a></li>
          ))}</ul>
        </details>
      )}
    </>
  );
}
