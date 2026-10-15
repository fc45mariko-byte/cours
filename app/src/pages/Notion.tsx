import { useEffect } from 'preact/hooks';
import { index, maitriseNotion, matiereDe, chapitreCatalogue, chapitreExiste } from '../data';
import { useChapitre, useProgression } from '../hooks';
import { store } from '../core/store';
import { Charge, EtatMaitrise, Fil, LienNotion, Texte } from '../ui/communs';
import type { Bloc, Notion as N } from '../types';

function RenduBloc({ b }: { b: Bloc }) {
  switch (b.type) {
    case 'texte': return <p><Texte t={b.texte} /></p>;
    case 'attention': return <div class="encadre attention" role="note">⚠️ <Texte t={b.texte} /></div>;
    case 'etapes': return <>{b.titre && <h3>{b.titre}</h3>}<ol class="etapes">{b.etapes.map((e, i) => <li key={i}><Texte t={e} /></li>)}</ol></>;
    case 'liste': return <>{b.titre && <h3>{b.titre}</h3>}<ul>{b.items.map((e, i) => <li key={i}><Texte t={e} /></li>)}</ul></>;
    case 'formule': return <>{b.titre && <h3>{b.titre}</h3>}<div class="formule">{b.formule}</div>{b.legende && <p class="small muted" style={{ marginTop: 6 }}>{b.legende}</p>}</>;
    case 'calcul': return (
      <>{b.titre && <h3>{b.titre}</h3>}
        <div class="tableau-wrap"><table><tbody>{b.lignes.map((l, i) => <tr key={i}><td>{l.libelle}</td><td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{l.valeur}</td></tr>)}</tbody></table></div></>
    );
    case 'tableau': return (
      <>{b.titre && <h3>{b.titre}</h3>}
        <div class="tableau-wrap" tabIndex={0} role="region" aria-label={b.titre ?? 'Tableau'}>
          <table>
            <thead><tr>{b.entetes.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
            <tbody>{b.lignes.map((l, i) => <tr key={i}>{l.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}</tr>)}</tbody>
          </table>
        </div></>
    );
  }
}

function Fiche({ n }: { n: N }) {
  const p = useProgression();
  const ix = index.notions[n.id];
  const m = maitriseNotion(n.id, p);
  const sources = (n.sources ?? []).map((s) => index.sources.find((x) => x.id === s)).filter(Boolean);
  const dependants = Object.values(index.notions).filter((x) => x.prerequis.includes(n.id));
  return (
    <article class="fiche">
      <div class="entre" style={{ marginTop: 8 }}>
        <span class="small muted">Niveau {n.niveau === 'P' ? 'prérequis' : n.niveau === 'F' ? 'fondamental' : 'avancé'}</span>
        <EtatMaitrise m={m} />
      </div>
      <h1 class="titre-page">{n.titre}</h1>

      {(n.prerequis?.length ?? 0) > 0 && <div class="small" style={{ marginBottom: 4 }}><span class="muted">Prérequis : </span>{n.prerequis!.map((x) => <LienNotion key={x} id={x} />)}</div>}

      {n.question && <><h2>❓ Question centrale</h2><p class="question-centrale">{n.question}</p></>}
      {n.definition && <><h2>📌 Définition</h2><p class="definition"><Texte t={n.definition} /></p></>}
      {n.explication && <><h2>💬 En clair</h2><p><Texte t={n.explication} /></p></>}
      {n.fonctionnement?.length ? <><h2>⚙️ Fonctionnement</h2>{n.fonctionnement.map((b, i) => <RenduBloc key={i} b={b} />)}</> : null}
      {n.termes?.length ? (
        <><h2>🔤 Terminologie</h2>
          <div class="termes">{n.termes.map((t) => (
            <div class="terme" key={t.fr}>
              <strong>{t.fr}</strong>{(t.en || t.es) && <span class="trad"> · {t.en && <>EN <em lang="en">{t.en}</em></>}{t.en && t.es && ' · '}{t.es && <>ES <em lang="es">{t.es}</em></>}</span>}
              <div><Texte t={t.definition} /></div>
              {t.distinction && <div class="small muted">↔ {t.distinction}</div>}
            </div>))}
          </div></>
      ) : null}
      {n.exemple && (
        <><h2>💡 Exemple{n.exemple.fictif && <span class="tag-fictif">exemple fictif</span>}</h2>
          <div class="encadre exemple"><Texte t={n.exemple.texte} />{n.exemple.source && <div class="small" style={{ marginTop: 6 }}>Source : {n.exemple.source}</div>}</div></>
      )}
      {n.contreExemple && <><h2>↔️ Contre-exemple</h2><div class="encadre contre"><Texte t={n.contreExemple} /></div></>}
      {n.confusions?.length ? (
        <><h2>⚠️ Confusions fréquentes</h2>
          {n.confusions.map((c, i) => (
            <div class="bloc plat" key={i} style={{ marginBottom: 8, padding: 16 }}>
              <div class="confusion"><span>{c.a}</span><span aria-label="à ne pas confondre avec">≠</span><span>{c.b}</span></div>
              <p class="small" style={{ margin: '8px 0 0' }}><Texte t={c.explication} /></p>
            </div>))}</>
      ) : null}

      <h2>✏️ Mise en pratique</h2>
      <div class="ligne">
        <a class={`btn${ix.nbQuestions ? '' : ' secondaire'}`} href={`#/entrainer/qcm?p=${n.id}`}>QCM ({ix.nbQuestions})</a>
        <a class="btn secondaire" href={`#/flashcards?p=${n.id}`}>Flashcards ({ix.nbFlashcards})</a>
        <a class="btn secondaire" href={`#/entrainer?p=${n.id}&onglet=exercices`}>Exercices ({ix.nbExercices})</a>
      </div>

      {n.verification?.length ? (
        <><h2>🧠 Vérifier sa compréhension</h2>
          <div class="encadre verif"><p class="small">Répondez sans regarder la fiche, à voix haute ou par écrit, puis relisez la fiche pour vérifier.</p><ol>{n.verification.map((v, i) => <li key={i}>{v}</li>)}</ol></div></>
      ) : null}

      {(n.connexes?.length || dependants.length) ? (
        <><h2>🔗 Notions liées</h2>
          {n.connexes?.length ? <p class="small"><span class="muted">Connexes : </span>{n.connexes.map((x) => <LienNotion key={x} id={x} />)}</p> : null}
          {dependants.length ? <p class="small"><span class="muted">Notions qui s'appuient sur celle-ci : </span>{dependants.map((x) => <LienNotion key={x.id} id={x.id} />)}</p> : null}
        </>
      ) : null}

      {n.aVerifier && <div class="encadre a-verifier">🔎 À vérifier : {n.aVerifier}</div>}
      {sources.length > 0 && (
        <><h2>📚 Références</h2>
          <ul class="small">{sources.map((s) => (
            <li key={s!.id}>{s!.auteur}, <em>{s!.titre}</em>{s!.url && <> — <a href={s!.url} target="_blank" rel="noopener">{s!.url}</a></>}
              <span class="muted"> ({s!.acces === 'lu' ? 'lu' : s!.acces === 'extrait' ? 'consulté par extrait' : 'texte de référence'}{s!.consulte ? `, ${s!.consulte}` : ''})</span></li>))}
          </ul>
          {n.verifieLe && <p class="small muted">Fiche vérifiée le {new Date(n.verifieLe).toLocaleDateString('fr-FR')}.</p>}</>
      )}
    </article>
  );
}

export function Notion({ id }: { id: string }) {
  const ix = index.notions[id];
  const chap = ix ? chapitreCatalogue(ix.chapitre) : undefined;
  const mat = matiereDe(id);
  const c = useChapitre(ix?.chapitre ?? '');
  useEffect(() => { if (ix?.redigee) store.voir(id); }, [id]);
  if (!ix || !mat || !chap) return <div class="vide">Notion introuvable.</div>;
  const fil = <Fil elements={[{ label: 'Accueil', href: '#/' }, { label: mat.titre, href: `#/matiere/${mat.id}` }, { label: chap.titre }]} />;
  if (!ix.redigee || !chapitreExiste(ix.chapitre)) {
    return <>{fil}<h1 class="titre-page">{ix.titre}</h1><div class="bloc vide">Cette fiche est en cours de rédaction. Elle figure dans la cartographie du programme, mais son contenu n'est pas encore disponible.</div></>;
  }
  const notions = chap.notions.filter((n) => index.notions[n.id].redigee);
  const i = notions.findIndex((n) => n.id === id);
  return (
    <>
      {fil}
      <Charge c={c}>{(f) => {
        const n = f.notions.find((x) => x.id === id);
        return n ? <Fiche n={n} /> : <div class="erreur-box">Contenu indisponible.</div>;
      }}</Charge>
      <nav class="entre" style={{ marginTop: 32 }} aria-label="Notions du chapitre">
        {i > 0 ? <a class="btn discret" href={`#/notion/${notions[i - 1].id}`}>← {index.notions[notions[i - 1].id].titre}</a> : <span />}
        {i < notions.length - 1 ? <a class="btn discret" href={`#/notion/${notions[i + 1].id}`}>{index.notions[notions[i + 1].id].titre} →</a> : <span />}
      </nav>
    </>
  );
}
