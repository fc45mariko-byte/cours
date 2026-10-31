import { useEffect, useRef } from 'preact/hooks';
import { chapitreCatalogue, chargerQuestions, index, LIBELLE_LANGUE, matiereDe } from '../data';
import { useAsync, useChapitre, useProgression } from '../hooks';
import { store } from '../core/store';
import { Charge, Fil, LienNotion, StatutPastille, Texte } from '../ui/communs';
import { Motif } from '../ui/visuels';
import { QuestionQcm } from '../ui/Qcm';
import { RenduBloc, Termes, Exemple } from './Notion';
import { statutNotion } from '../jeu';
import { lib } from '../i18n';
import type { Bloc, FichierChapitre, Langue, MatiereCatalogue, Notion } from '../types';

const ANNEE = /\b(1[5-9]\d\d|20\d\d)\b/;
const estFrise = (b: Bloc) => b.type === 'tableau' && b.lignes.length >= 3 && b.lignes.filter((l) => ANNEE.test(l[0])).length >= Math.ceil(b.lignes.length * 0.6);
const mots = (n: Notion) => JSON.stringify(n).split(/\s+/).length;

/** Bloc de fonctionnement, avec une mise en forme propre aux chronologies et aux procédures. */
function BlocEditorial({ b }: { b: Bloc }) {
  if (estFrise(b) && b.type === 'tableau') {
    return <>{b.titre && <h4>{b.titre}</h4>}<ol class="frise">{b.lignes.map((l, i) => <li key={i}><span class="date">{l[0]}</span><span><Texte t={l.slice(1).join(' — ')} /></span></li>)}</ol></>;
  }
  if (b.type === 'etapes') return <>{b.titre && <h4>{b.titre}</h4>}<ol class="processus">{b.etapes.map((e, i) => <li key={i}><Texte t={e} /></li>)}</ol></>;
  return <RenduBloc b={b} />;
}

/** Ordre des rubriques selon la discipline : les compositions varient d'une matière à l'autre. */
function SectionNotion({ n, m, langue, i }: { n: Notion; m: MatiereCatalogue; langue: Langue; i: number }) {
  const p = useProgression();
  const L = lib(langue);
  const blocs = n.fonctionnement ?? [];
  const chronologies = blocs.filter(estFrise);
  const autres = blocs.filter((b) => !estFrise(b));
  const langueDabord = m.categorie === 'Anglais' || m.categorie === 'Espagnol';
  const histoire = m.categorie === 'Civilisations';
  const termes = n.termes?.length ? <><h4>{L.terminologie}</h4><Termes n={n} langue={langue} /></> : null;
  return (
    <section class="section-notion" id={`n-${n.id}`} data-notion={n.id}>
      <div class="entre" style={{ marginTop: 32 }}><span class="meta">{String(i + 1).padStart(2, '0')} · {L.niveaux[n.niveau]}</span><span lang="fr"><StatutPastille s={statutNotion(n.id, p)} /></span></div>
      <h3 style={{ marginTop: 8 }}>{n.titre}</h3>
      {n.question && <p class="question-centrale" style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '1.15rem' }}>{n.question}</p>}
      {histoire && chronologies.map((b, k) => <BlocEditorial key={`c${k}`} b={b} />)}
      {n.definition && <p class="definition"><Texte t={n.definition} /></p>}
      {langueDabord && termes}
      {n.explication && <p><Texte t={n.explication} /></p>}
      {(histoire ? autres : blocs).map((b, k) => <BlocEditorial key={k} b={b} />)}
      {!langueDabord && termes}
      {n.exemple && <><h4>{L.exemple}</h4><Exemple n={n} langue={langue} /></>}
      {n.contreExemple && <><h4>{L.contreExemple}</h4><div class="encadre contre"><Texte t={n.contreExemple} /></div></>}
      {n.confusions?.map((c, k) => (
        <div key={k} style={{ margin: '16px 0' }}>
          <div class="confusion"><span>{c.a}</span><span aria-label={L.aNePasConfondre}>≠</span><span>{c.b}</span></div>
          <p class="small" style={{ margin: '6px 0 0' }}><Texte t={c.explication} /></p>
        </div>
      ))}
      {n.aVerifier && <div class="encadre a-verifier">{L.aVerifier} : {n.aVerifier}</div>}
      <p class="small" lang="fr"><a href={`#/notion/${n.id}`}>Fiche complète</a> · <a href={`#/entrainer/qcm?p=${n.id}`}>S’entraîner sur cette notion</a></p>
    </section>
  );
}

function Controle({ chapitre }: { chapitre: string }) {
  const ids = index.questions.filter((q) => q.chapitre === chapitre).map((q) => q.id).slice(0, 5);
  const c = useAsync(() => chargerQuestions(ids), [chapitre]);
  if (!ids.length) return null;
  return (
    <Charge c={c}>{(qs) => <>{qs.map((q, i) => (
      <QuestionQcm key={q.id} q={q} graine={i + 3} numero={`${i + 1}/${qs.length}`} onRepondu={(juste) => store.repondreQcm(q.id, q.notion, q.notion.split('.')[0], juste)} />
    ))}</>}</Charge>
  );
}

function Lecteur({ f, params }: { f: FichierChapitre; params: URLSearchParams }) {
  const p = useProgression();
  const m = matiereDe(f.chapitre)!;
  const chap = chapitreCatalogue(f.chapitre)!;
  const langue = m.langue;
  const L = lib(langue);
  const num = m.chapitres.findIndex((c) => c.id === chap.id) + 1;
  const minutes = Math.max(2, Math.round(f.notions.reduce((s, n) => s + mots(n), 0) / 200));
  const position = p.lecture.chapitres[f.chapitre]?.notion;
  const cible = params.get('n');
  const racine = useRef<HTMLDivElement>(null);
  const termine = !!p.chapitres[f.chapitre]?.termine;
  const sources = [...new Set(f.notions.flatMap((n) => n.sources ?? []))].map((s) => index.sources.find((x) => x.id === s)).filter(Boolean);
  const exemplesReels = f.notions.filter((n) => n.exemple && !n.exemple.fictif);
  const exercices = index.exercices.filter((e) => e.chapitre === f.chapitre);

  useEffect(() => {
    if (cible) setTimeout(() => document.getElementById(`n-${cible}`)?.scrollIntoView({ block: 'start' }), 80);
  }, [cible]);
  useEffect(() => {
    const el = racine.current;
    if (!el || !('IntersectionObserver' in window)) return;
    let minuterie: ReturnType<typeof setTimeout> | undefined;
    const o = new IntersectionObserver((es) => {
      const v = es.filter((e) => e.isIntersecting)[0];
      const id = v?.target.getAttribute('data-notion');
      if (!id) return;
      clearTimeout(minuterie);
      minuterie = setTimeout(() => store.positionChapitre(f.chapitre, id), 700);
    }, { rootMargin: '0px 0px -60% 0px' });
    el.querySelectorAll('[data-notion]').forEach((x) => o.observe(x));
    return () => { o.disconnect(); clearTimeout(minuterie); };
  }, [f.chapitre]);

  return (
    <article class={`lecteur ton-${m.couleur}`} lang={langue} ref={racine}>
      <header class="couverture-chapitre">
        <Motif categorie={m.categorie} graine={f.chapitre} />
        <p class="surtitre" lang="fr"><a href={`#/matiere/${m.id}`}>{m.titre}</a><span>Chapitre {num} sur {m.chapitres.length}</span><span>{LIBELLE_LANGUE[langue]}</span></p>
        <div class="numero-chap" aria-hidden="true">{String(num).padStart(2, '0')}</div>
        <h1 class="titre-page">{chap.titre}</h1>
        <p class="meta">{f.notions.length} notions · {L.minutes(minutes)}</p>
      </header>

      {position && !cible && position !== f.notions[0]?.id && index.notions[position] && (
        <div class="reprise" lang="fr"><span>Vous vous étiez arrêté à « {index.notions[position].titre} ».</span>
          <button class="btn petit" onClick={() => document.getElementById(`n-${position}`)?.scrollIntoView({ block: 'start' })}>Reprendre</button></div>
      )}

      <h2 class="rubrique">{L.introduction}</h2>
      <p class="chapeau">{L.introChapitre(chap.titre, f.notions.length, m.titre)}</p>

      <h2 class="rubrique">{L.objectifs}</h2>
      <ul>{f.notions.filter((n) => n.question).map((n) => <li key={n.id}>{n.question}</li>)}</ul>

      <h2 class="rubrique">{L.conceptsCles}</h2>
      <ol class="sommaire-chap">{f.notions.map((n) => (
        <li key={n.id}><a href={`#/chapitre/${f.chapitre}?n=${n.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(`n-${n.id}`)?.scrollIntoView({ block: 'start' }); }}>
          <span>{n.titre}</span><span lang="fr"><StatutPastille s={statutNotion(n.id, p)} /></span></a></li>
      ))}</ol>

      <h2 class="rubrique">{L.explications}</h2>
      {f.notions.map((n, i) => <SectionNotion key={n.id} n={n} m={m} langue={langue} i={i} />)}

      {exemplesReels.length > 0 && (
        <><h2 class="rubrique">{L.exemplesReels}</h2>
          {exemplesReels.map((n) => <div key={n.id}><p class="small muted" style={{ margin: '12px 0 0' }}>{n.titre}</p><Exemple n={n} langue={langue} /></div>)}</>
      )}

      {exercices.length > 0 && (
        <><h2 class="rubrique">{L.etudesDeCas}</h2>
          <ul class="liste-editoriale">{exercices.map((e, i) => (
            <li key={e.id}><a href={`#/exercice/${e.id}`}><span class="num">{String(i + 1).padStart(2, '0')}</span><span class="t">{e.titre}</span><span class="m" lang="fr">Niveau {e.niveau}</span></a></li>
          ))}</ul></>
      )}

      <h2 class="rubrique">{L.synthese}</h2>
      <div class="tableau-wrap"><table><tbody>{f.notions.map((n) => (
        <tr key={n.id}><th scope="row" style={{ width: '32%' }}>{n.titre}</th><td><Texte t={(n.definition ?? n.explication ?? '').split(/(?<=[.!?])\s/)[0]} /></td></tr>
      ))}</tbody></table></div>

      <h2 class="rubrique">{L.controle}</h2>
      <Controle chapitre={f.chapitre} />
      {f.notions.some((n) => n.verification?.length) && (
        <div class="encadre verif"><p class="small">{L.verifierAide}</p><ol>{f.notions.flatMap((n) => n.verification ?? []).slice(0, 8).map((v, i) => <li key={i}>{v}</li>)}</ol></div>
      )}

      {sources.length > 0 && (
        <><h2 class="rubrique">{L.lectures}</h2>
          <ul class="small">{sources.map((s) => <li key={s!.id}>{s!.auteur}, <em>{s!.titre}</em>{s!.url && <> — <a href={s!.url} target="_blank" rel="noopener">{s!.url.replace(/^https?:\/\//, '')}</a></>}</li>)}</ul></>
      )}
      <p class="small muted">{L.prerequis} : {[...new Set(f.notions.flatMap((n) => n.prerequis ?? []))].filter((x) => !x.startsWith(f.chapitre)).map((x) => <LienNotion key={x} id={x} />)}</p>

      <div class="reprise" lang="fr" style={{ marginTop: 40 }}>
        <span>{termine ? 'Chapitre terminé. Vous pouvez le relire à tout moment.' : 'Vous avez lu tout le chapitre ? Marquez-le comme terminé.'}</span>
        <button class={`btn${termine ? ' secondaire' : ''}`} onClick={() => store.terminerChapitre(f.chapitre, m.id, !termine)}>{termine ? 'Terminé ✓' : 'Marquer comme terminé'}</button>
      </div>
      <nav class="entre" lang="fr" aria-label="Chapitres de la matière">
        {num > 1 ? <a class="btn discret" href={`#/chapitre/${m.chapitres[num - 2].id}`}>← {m.chapitres[num - 2].titre}</a> : <span />}
        {num < m.chapitres.length ? <a class="btn discret" href={`#/chapitre/${m.chapitres[num].id}`}>{m.chapitres[num].titre} →</a> : <span />}
      </nav>
    </article>
  );
}

export function Chapitre({ id, params }: { id: string; params: URLSearchParams }) {
  const chap = chapitreCatalogue(id);
  const m = matiereDe(id);
  const c = useChapitre(id);
  useEffect(() => { if (chap) store.ouvrirChapitre(id); }, [id]);
  if (!chap || !m) return <div class="vide">Chapitre introuvable. <a href="#/bibliotheque">Bibliothèque</a></div>;
  return (
    <>
      <Fil elements={[{ label: 'Bibliothèque', href: '#/bibliotheque' }, { label: m.titre, href: `#/matiere/${m.id}` }, { label: chap.titre }]} />
      <Charge c={c}>{(f) => <Lecteur f={f} params={params} />}</Charge>
    </>
  );
}
