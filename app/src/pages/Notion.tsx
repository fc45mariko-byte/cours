import { useEffect } from 'preact/hooks';
import { index, matiereDe, chapitreCatalogue, chapitreExiste, langueDe } from '../data';
import { useChapitre, useProgression } from '../hooks';
import { store } from '../core/store';
import { Charge, Fil, LienNotion, StatutPastille, Texte } from '../ui/communs';
import { ActionsPublication } from '../ui/Publication';
import { statutNotion } from '../jeu';
import { lib } from '../i18n';
import type { Bloc, Notion as N, Langue } from '../types';

export function RenduBloc({ b }: { b: Bloc }) {
  switch (b.type) {
    case 'texte': return <p><Texte t={b.texte} /></p>;
    case 'attention': return <div class="encadre attention" role="note"><Texte t={b.texte} /></div>;
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

export function Termes({ n, langue }: { n: N; langue: Langue }) {
  if (!n.termes?.length) return null;
  return (
    <div class="termes">{n.termes.map((t) => (
      <div class="terme" key={t.fr}>
        <strong lang="fr">{t.fr}</strong>{(t.en || t.es) && <span class="trad"> · {t.en && <>EN <em lang="en">{t.en}</em></>}{t.en && t.es && ' · '}{t.es && <>ES <em lang="es">{t.es}</em></>}</span>}
        <div lang={langue}><Texte t={t.definition} /></div>
        {t.distinction && <div class="small muted">↔ {t.distinction}</div>}
      </div>))}
    </div>
  );
}

export function Exemple({ n, langue }: { n: N; langue: Langue }) {
  if (!n.exemple) return null;
  const L = lib(langue);
  const src = n.exemple.source ? index.sources.find((s) => s.id === n.exemple!.source) : undefined;
  return (
    <div class="encadre exemple">
      {n.exemple.fictif && <span class="tag-fictif" style={{ marginLeft: 0, marginRight: 8 }}>{L.exempleFictif}</span>}
      <Texte t={n.exemple.texte} />
      {n.exemple.source && <div class="small muted" style={{ marginTop: 6 }}>{L.source} : {src ? `${src.auteur}, ${src.titre}` : n.exemple.source}</div>}
    </div>
  );
}

export function Sources({ n, langue }: { n: N; langue: Langue }) {
  const L = lib(langue);
  const sources = (n.sources ?? []).map((s) => index.sources.find((x) => x.id === s)).filter(Boolean);
  if (!sources.length) return null;
  return (
    <>
      <ul class="small">{sources.map((s) => (
        <li key={s!.id}>{s!.auteur}, <em>{s!.titre}</em>{s!.url && <> — <a href={s!.url} target="_blank" rel="noopener">{s!.url.replace(/^https?:\/\//, '')}</a></>}
          <span class="muted" lang="fr"> ({s!.acces === 'lu' ? 'lu' : s!.acces === 'extrait' ? 'consulté par extrait' : 'référence non consultée'}{s!.consulte ? `, ${s!.consulte}` : ''})</span></li>))}
      </ul>
      {n.verifieLe && <p class="small muted">{L.verifieeLe} {new Date(n.verifieLe).toLocaleDateString(langue === 'fr' ? 'fr-FR' : langue === 'en' ? 'en-GB' : 'es-ES')}.</p>}
    </>
  );
}

function Fiche({ n }: { n: N }) {
  const p = useProgression();
  const ix = index.notions[n.id];
  const langue = langueDe(n.id);
  const L = lib(langue);
  const dependants = Object.values(index.notions).filter((x) => x.prerequis.includes(n.id));
  const mat = matiereDe(n.id)!;
  return (
    <article class={`fiche ton-${mat.couleur}`} lang={langue}>
      <div class="surtitre"><span class="ton-trait">{mat.titre}</span><span>{L.niveau} {L.niveaux[n.niveau]}</span><StatutPastille s={statutNotion(n.id, p)} /></div>
      <h1 class="titre-page">{n.titre}</h1>
      {(n.prerequis?.length ?? 0) > 0 && <div class="small" style={{ marginBottom: 4 }}><span class="muted">{L.prerequis} : </span>{n.prerequis!.map((x) => <LienNotion key={x} id={x} />)}</div>}

      {n.question && <><h2>{L.questionCentrale}</h2><p class="question-centrale">{n.question}</p></>}
      {n.definition && <><h2>{L.definition}</h2><p class="definition"><Texte t={n.definition} /></p></>}
      {n.explication && <><h2>{L.enClair}</h2><p><Texte t={n.explication} /></p></>}
      {n.fonctionnement?.length ? <><h2>{L.fonctionnement}</h2>{n.fonctionnement.map((b, i) => <RenduBloc key={i} b={b} />)}</> : null}
      {n.termes?.length ? <><h2>{L.terminologie}</h2><Termes n={n} langue={langue} /></> : null}
      {n.exemple && <><h2>{L.exemple}</h2><Exemple n={n} langue={langue} /></>}
      {n.contreExemple && <><h2>{L.contreExemple}</h2><div class="encadre contre"><Texte t={n.contreExemple} /></div></>}
      {n.confusions?.length ? (
        <><h2>{L.confusions}</h2>
          {n.confusions.map((c, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div class="confusion"><span>{c.a}</span><span aria-label={L.aNePasConfondre}>≠</span><span>{c.b}</span></div>
              <p class="small" style={{ margin: '8px 0 0' }}><Texte t={c.explication} /></p>
            </div>))}</>
      ) : null}

      <h2>{L.miseEnPratique}</h2>
      <div class="ligne" lang="fr">
        <a class={`btn${ix.nbQuestions ? '' : ' secondaire'}`} href={`#/entrainer/qcm?p=${n.id}`}>QCM ({ix.nbQuestions})</a>
        <a class="btn secondaire" href={`#/flashcards?p=${n.id}`}>Flashcards ({ix.nbFlashcards})</a>
        <a class="btn secondaire" href={`#/entrainer?p=${n.id}&onglet=exercices`}>Exercices ({ix.nbExercices})</a>
      </div>

      {n.verification?.length ? (
        <><h2>{L.verifier}</h2>
          <div class="encadre verif"><p class="small">{L.verifierAide}</p><ol>{n.verification.map((v, i) => <li key={i}>{v}</li>)}</ol></div></>
      ) : null}

      {(n.connexes?.length || dependants.length) ? (
        <><h2>{L.notionsLiees}</h2>
          {n.connexes?.length ? <p class="small"><span class="muted">{L.connexes} : </span>{n.connexes.map((x) => <LienNotion key={x} id={x} />)}</p> : null}
          {dependants.length ? <p class="small"><span class="muted">{L.dependants} : </span>{dependants.map((x) => <LienNotion key={x.id} id={x.id} />)}</p> : null}
        </>
      ) : null}

      {n.aVerifier && <div class="encadre a-verifier">{L.aVerifier} : {n.aVerifier}</div>}
      {n.sources?.length ? <><h2>{L.references}</h2><Sources n={n} langue={langue} /></> : null}
      <div lang="fr"><ActionsPublication id={n.id} notion={n.id} titre={n.titre} chapitre={ix.chapitre} /></div>
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
  const fil = <Fil elements={[{ label: 'Bibliothèque', href: '#/bibliotheque' }, { label: mat.titre, href: `#/matiere/${mat.id}` }, { label: chap.titre, href: `#/chapitre/${chap.id}` }]} />;
  if (!ix.redigee || !chapitreExiste(ix.chapitre)) {
    return <>{fil}<h1 class="titre-page">{ix.titre}</h1><div class="bloc vide">Cette fiche est en cours de rédaction.</div></>;
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
