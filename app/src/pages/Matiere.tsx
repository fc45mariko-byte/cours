import { index, maitriseNotion, maitrisePerimetre, matiere } from '../data';
import { useProgression } from '../hooks';
import { EtatMaitrise, Fil, Jauge, STATUT_MATIERE } from '../ui/communs';
import { Icone, ICONE_CATEGORIE } from '../ui/Icone';

export function Matiere({ id }: { id: string }) {
  const p = useProgression();
  const m = matiere(id);
  if (!m) return <div class="vide">Matière introuvable.</div>;
  const mp = maitrisePerimetre(m.id, p);
  const nbQ = index.questions.filter((q) => q.notion.startsWith(m.id + '.')).length;
  const nbF = index.flashcards.filter((f) => f.notions.some((n) => n.startsWith(m.id + '.'))).length;
  const nbE = index.exercices.filter((e) => e.notions.some((n) => n.startsWith(m.id + '.'))).length;

  return (
    <>
      <Fil elements={[{ label: 'Accueil', href: '#/' }, { label: m.titre }]} />
      <div class={`carte bg-${m.couleur}`} style={{ marginTop: 12, minHeight: 0 }}>
        <div class="haut">
          <span class="cat"><span class="ico"><Icone nom={ICONE_CATEGORIE[m.categorie]} taille={18} /></span>{m.categorie}</span>
          <span class="badge">{STATUT_MATIERE[m.statut]}</span>
        </div>
        <h1 class="titre-page" style={{ margin: '8px 0' }}>{m.titre}</h1>
        <div class="small">
          {m.semestres.length > 0 && <>Semestre{m.semestres.length > 1 ? 's' : ''} {m.semestres.join(' et ')} · </>}
          {m.enseignant && <>Enseignement : {m.enseignant} · </>}
          {mp.redigees}/{mp.total} notions rédigées
        </div>
        {mp.redigees > 0 && <div style={{ marginTop: 10 }}><Jauge valeur={mp.score} label={`Maîtrise moyenne ${mp.score} %`} /><span class="small">Maîtrise moyenne : {mp.score} % · {mp.commencees} notions travaillées</span></div>}
      </div>

      <div class="ligne" style={{ margin: '16px 0' }}>
        <a class={`btn${nbQ ? '' : ' secondaire'}`} href={`#/entrainer/qcm?p=${m.id}`} aria-disabled={!nbQ}>QCM ({nbQ})</a>
        <a class="btn secondaire" href={`#/flashcards?p=${m.id}`}>Flashcards ({nbF})</a>
        <a class="btn secondaire" href={`#/entrainer?p=${m.id}&onglet=exercices`}>Exercices ({nbE})</a>
        <a class="btn secondaire" href={`#/examen?p=${m.id}`}>Examen blanc</a>
      </div>

      {m.statut === 'COMP' && <p class="encadre attention">Cette matière n'apparaît pas dans la maquette de la L3 LEA d'Orléans consultée. Elle est proposée comme complément, car elle est fréquente dans d'autres licences LEA Commerce international.</p>}
      {m.statut === 'ORL?' && <p class="encadre attention">La place exacte de cette matière dans la maquette en vigueur reste à confirmer.</p>}

      {m.chapitres.map((c) => {
        const redigees = c.notions.filter((n) => index.notions[n.id].redigee).length;
        return (
          <details class="chapitre" key={c.id} open={redigees > 0}>
            <summary>
              <span>{c.titre}</span>
              <span class="small muted">{redigees}/{c.notions.length} rédigées</span>
            </summary>
            <ul class="notions">
              {c.notions.map((n) => {
                const ix = index.notions[n.id];
                return (
                  <li key={n.id}>
                    {ix.redigee ? (
                      <a href={`#/notion/${n.id}`}>
                        <span><span class="niveau" title="Niveau : P prérequis, F fondamental, A avancé">{ix.niveau}</span>{ix.titre}</span>
                        <EtatMaitrise m={maitriseNotion(n.id, p)} />
                      </a>
                    ) : (
                      <span class="non-redigee"><span><span class="niveau">{n.niveau}</span>{n.titre}</span><span class="small">en rédaction</span></span>
                    )}
                  </li>
                );
              })}
            </ul>
          </details>
        );
      })}
    </>
  );
}
