// Notes estimées pour chaque matière du semestre, si l'examen avait lieu aujourd'hui.
import { useProgression } from '../hooks';
import { Fil } from '../ui/communs';
import { matiere } from '../data';
import { appreciation, estimerSemestre, LIBELLE_CONFIANCE, type EstimationNote } from '../notes';

const fr = (x: number) => x.toLocaleString('fr-FR', { maximumFractionDigits: 1 });

function Barre({ e }: { e: EstimationNote }) {
  if (e.note === null) return null;
  return (
    <div class="note-barre" role="img" aria-label={`Note estimée ${fr(e.note)} sur 20, fourchette de ${fr(e.min)} à ${fr(e.max)}`}>
      <span class="fourchette" style={{ left: `${e.min * 5}%`, width: `${(e.max - e.min) * 5}%` }} />
      <span class="moyenne-trait" style={{ left: '50%' }} />
      <span class="point" style={{ left: `${e.note * 5}%` }} />
    </div>
  );
}

function LigneNote({ e }: { e: EstimationNote }) {
  const m = matiere(e.matiere)!;
  const a = e.note !== null ? appreciation(e.note) : null;
  const faibles = e.chapitres.slice(0, 3);
  return (
    <section class={`bloc note-matiere ton-${m.couleur}`} id={`note-${m.id}`}>
      <div class="note-entete">
        <div>
          <p class="surtitre"><span>{m.emploiDuTemps?.seances.join(' + ')}</span>{m.enseignant && <span>{m.enseignant}</span>}</p>
          <h2 class="rubrique" style={{ margin: 0 }}><a href={`#/matiere/${m.id}`}>{m.titre}</a></h2>
        </div>
        <div class="note-valeur">
          {e.note !== null
            ? <><strong>{fr(e.note)}</strong><span>/20</span></>
            : <span class="muted">—</span>}
        </div>
      </div>
      {e.indisponible ? <p class="small muted">{e.indisponible}</p> : e.note === null ? (
        <p class="small">Pas encore de données sur cette matière : passez un test rapide pour obtenir une première estimation.</p>
      ) : (
        <>
          <Barre e={e} />
          <p class="small note-details">
            <span class={`note-appreciation ${a!.ton}`}>{a!.libelle}</span>
            <span>probablement entre {fr(e.min)} et {fr(e.max)}</span>
            <span>{LIBELLE_CONFIANCE[e.confiance]}</span>
            <span>{Math.round(e.couverture * 100)} % des notions mesurées · {e.essais} essai{e.essais > 1 ? 's' : ''}</span>
            {e.examen && <span>examen blanc récent : {e.examen.score}/{e.examen.total}</span>}
          </p>
          {faibles.length > 0 && (
            <p class="small">Pour gagner des points : {faibles.map((c, i) => (
              <span key={c.id}>{i > 0 && ' · '}<a href={`#/synthese/${m.id}?ch=${c.id}&reciter=1`}>{c.titre}</a> <span class="muted">({Math.round(c.niveau * 100)} %)</span></span>
            ))}</p>
          )}
        </>
      )}
      {e.limite && !e.indisponible && <p class="small muted">{e.limite}</p>}
      {!e.indisponible && (
        <div class="ligne" style={{ gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
          <a class="btn" href={`#/examen?p=${m.id}`}>{e.note === null ? 'Passer un test rapide' : 'Affiner : examen blanc'}</a>
          <a class="btn discret" href={`#/entrainer/qcm?p=${m.id}&n=10`}>10 QCM</a>
          <a class="btn discret" href={`#/synthese/${m.id}?reciter=1`}>Réciter la synthèse</a>
        </div>
      )}
    </section>
  );
}

export function Notes() {
  const p = useProgression();
  const { notes, moyenne, chiffrees } = estimerSemestre(p);
  const sansDonnees = notes.filter((n) => n.note === null && !n.indisponible).length;
  return (
    <>
      <Fil elements={[{ label: 'Progrès', href: '#/progres' }, { label: 'Notes estimées' }]} />
      <p class="surtitre">Si les examens avaient lieu aujourd’hui · semestre 5</p>
      <h1 class="titre-page">Mes notes estimées</h1>
      <p class="chapeau">Pour chaque matière de l’emploi du temps, la note que vous obtiendriez probablement à l’examen maintenant, calculée à partir de vos résultats réels (QCM, exercices, flashcards, examens blancs). Tout le programme compte : un chapitre jamais travaillé compte zéro.</p>

      <section class="bloc note-synthese">
        <div>
          <p class="meta">Moyenne indicative</p>
          <p class="note-valeur grande">{moyenne !== null ? <><strong>{fr(moyenne)}</strong><span>/20</span></> : <span class="muted">—</span>}</p>
        </div>
        <p class="small muted">Moyenne simple des {chiffrees} matière{chiffrees > 1 ? 's' : ''} estimée{chiffrees > 1 ? 's' : ''} sur {notes.length}, sans coefficients (ils ne sont pas dans l’application).{sansDonnees ? ` ${sansDonnees} matière${sansDonnees > 1 ? 's' : ''} sans données : un test rapide suffit pour les estimer.` : ''}</p>
      </section>

      {notes.map((e) => <LigneNote key={e.matiere} e={e} />)}

      <div class="section-titre"><h2>Comment la note est calculée</h2></div>
      <ul class="small">
        <li>Chaque notion du cours reçoit un niveau de 0 à 100 %. Notion travaillée : votre taux de réussite récent, les questions difficiles pesant plus ; prudent tant qu’il y a moins de trois essais ; en baisse après 30 jours sans activité.</li>
        <li>Notion jamais testée : seuls vos indices (« Je sais » sur la synthèse, « lu », « compris ») comptent, plafonnés à 50 %, car se sentir prêt n’est pas réussir.</li>
        <li>La note de la matière est la moyenne de toutes ses notions × 20. Un examen blanc sur toute la matière, de moins de 21 jours (5 questions ou plus), est un échantillon du programme : il sert de niveau aux notions qu’il n’a pas interrogées et compte pour moitié.</li>
        <li>La fourchette est large quand peu de notions ont été mesurées ; elle se resserre à mesure que vous vous testez. La fiabilité indique la part du programme réellement mesurée.</li>
        <li>C’est une estimation de vos connaissances : le barème de l’enseignant, l’oral et la qualité de la rédaction ne sont pas pris en compte.</li>
      </ul>
    </>
  );
}
