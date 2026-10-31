import { useEffect, useState } from 'preact/hooks';
import { chargerArticles, chargerChapitre, chargerExercice, chargerFil, chargerQuestions, chapitreCatalogue, index, langueDe, LIBELLE_LANGUE, matiere } from '../data';
import { useAsync, useProgression } from '../hooks';
import { store } from '../core/store';
import { Charge, Fil, StatutPastille, Texte, dateLongue } from './communs';
import { Icone } from './Icone';
import { QuestionQcm } from './Qcm';
import { Barres, Motif } from './visuels';
import { lib } from '../i18n';
import { statutNotion } from '../jeu';
import { genererSujet } from '../sujets';
import { RenduBloc, Exemple, Termes } from '../pages/Notion';
import type { Article, Bloc, FichierChapitre, Publication, TypePublication } from '../types';

export const LIBELLE_TYPE: Record<TypePublication, string> = {
  concept: 'Concept', dossier: 'Dossier', infographie: 'Infographie', cas: 'Étude de cas', monde: 'Monde et économie',
  langue: 'Langue', frise: 'Chronologie', quiz: 'Quiz', debat: 'Débat', sujet: 'Sujet de dissertation',
  comparaison: 'Comparaison', donnees: 'Données', exercice: 'Exercice corrigé',
};
const PORTEE: Record<string, string> = { historique: 'Fait historique', actuel: 'Actualité datée', permanent: 'Mécanisme durable' };

// ---------- Actions ----------
export function ActionsPublication({ id, titre, chapitre, notion, matiere: mat }: { id: string; titre: string; chapitre?: string; notion?: string; matiere?: string }) {
  const p = useProgression();
  const m = p.marques[id] ?? {};
  const [message, setMessage] = useState('');
  const matId = mat ?? (notion ?? chapitre ?? '').split('.')[0];
  const partager = async () => {
    const url = `${location.origin}${location.pathname}#/pub/${encodeURIComponent(id)}`;
    try {
      if (navigator.share) { await navigator.share({ title: titre, url }); return; }
      await navigator.clipboard.writeText(url);
      setMessage('Lien copié');
    } catch { setMessage(url); }
    setTimeout(() => setMessage(''), 2500);
  };
  return (
    <div class="actions-pub" role="group" aria-label="Actions sur la publication">
      <button aria-pressed={!!p.enregistres[id]} onClick={() => store.basculerEnregistre(id)} title="Enregistrer pour plus tard">
        <Icone nom="enregistrer" taille={18} /><span class="etiquette">{p.enregistres[id] ? 'Enregistré' : 'Enregistrer'}</span></button>
      <button aria-pressed={!!m.compris} onClick={() => store.marquer(id, 'compris', !m.compris, matId)} title="Je l’ai compris">
        <Icone nom="compris" taille={18} /><span class="etiquette">Compris</span></button>
      <button aria-pressed={!!m.aRevoir} onClick={() => store.marquer(id, 'aRevoir', !m.aRevoir, matId)} title="À revoir plus tard">
        <Icone nom="reviser" taille={18} /><span class="etiquette">À revoir</span></button>
      {chapitre && <a href={`#/chapitre/${chapitre}${notion ? `?n=${notion}` : ''}`} title="Ouvrir le chapitre d’origine"><Icone nom="chapitre" taille={18} /><span class="etiquette">Chapitre</span></a>}
      <button onClick={partager} title="Partager"><Icone nom="partager" taille={18} /><span class="etiquette">Partager</span></button>
      {message && <span class="small muted" role="status">{message}</span>}
    </div>
  );
}

// ---------- Corps par type ----------
function bloc(f: FichierChapitre, pub: Publication): Bloc | undefined {
  return f.notions.find((n) => n.id === pub.n)?.fonctionnement?.[pub.b ?? -1];
}

function CorpsChapitre({ pub, complet }: { pub: Publication; complet: boolean }) {
  const c = useAsync(() => chargerChapitre(pub.c!), [pub.c]);
  const L = lib(pub.l);
  return (
    <Charge c={c}>{(f) => {
      const n = f.notions.find((x) => x.id === pub.n);
      switch (pub.type) {
        case 'concept': return n ? (
          <div class="pub-corps">
            {n.definition && <p class="definition lettrine"><Texte t={complet ? n.definition : n.definition} /></p>}
            {complet && n.explication && <p><Texte t={n.explication} /></p>}
            {complet && n.fonctionnement?.[0] && <RenduBloc b={n.fonctionnement[0]} />}
            {complet && n.termes?.length ? <><h3>{L.terminologie}</h3><Termes n={n} langue={pub.l} /></> : null}
            {complet && n.exemple && <><h3>{L.exemple}</h3><Exemple n={n} langue={pub.l} /></>}
          </div>) : null;
        case 'infographie': {
          const b = bloc(f, pub);
          if (b?.type !== 'etapes') return null;
          const etapes = complet ? b.etapes : b.etapes.slice(0, 4);
          return <><ol class="processus">{etapes.map((e, i) => <li key={i}><Texte t={e} /></li>)}</ol>
            {!complet && b.etapes.length > 4 && <p class="small muted">+ {b.etapes.length - 4} {pub.l === 'fr' ? 'étapes' : pub.l === 'en' ? 'more steps' : 'pasos más'}</p>}</>;
        }
        case 'frise': {
          const b = bloc(f, pub);
          if (b?.type !== 'tableau') return null;
          const lignes = complet ? b.lignes : b.lignes.slice(0, 5);
          return <ol class="frise">{lignes.map((l, i) => <li key={i}><span class="date">{l[0]}</span><span><Texte t={l.slice(1).join(' — ')} /></span></li>)}</ol>;
        }
        case 'debat': {
          const b = bloc(f, pub);
          if (b?.type !== 'tableau') return null;
          return <RenduBloc b={b} />;
        }
        case 'comparaison': {
          const cs = complet ? n?.confusions ?? [] : (n?.confusions ?? []).slice(0, 1);
          return <>{cs.map((c, i) => (
            <div key={i}>
              <div class="duel"><div>{c.a}</div><span class="signe" aria-label={L.aNePasConfondre}>≠</span><div>{c.b}</div></div>
              <p><Texte t={c.explication} /></p>
            </div>))}</>;
        }
        case 'langue': {
          if (!n) return null;
          const ts = (n.termes ?? []).filter((t) => t.en && t.es).slice(0, complet ? 99 : 3);
          return (
            <div>
              {ts.map((t) => (
                <div key={t.fr} style={{ marginBottom: 10 }}>
                  <div class="triplet">
                    <div lang="fr"><span class="lg">FR</span>{t.fr}</div>
                    <div lang="en"><span class="lg">EN</span>{t.en}</div>
                    <div lang="es"><span class="lg">ES</span>{t.es}</div>
                  </div>
                  {complet && <p class="small"><Texte t={t.definition} /></p>}
                </div>
              ))}
            </div>
          );
        }
        case 'sujet': {
          const s = genererSujet(f, pub.l);
          if (!s) return null;
          return (
            <div>
              <p class="citation">{s.sujet}</p>
              {complet && <>
                <h3>{L.problematique}</h3><p>{s.problematique}</p>
                <h3>{L.plan}</h3><ol>{s.plan.map((x, i) => <li key={i}>{x}</li>)}</ol>
                {s.concepts.length > 0 && <><h3>{L.conceptsMobiliser}</h3><p>{s.concepts.map((c) => c.fr + (c.trad ? ` (${c.trad})` : '')).join(' · ')}</p></>}
                {s.objections.length > 0 && <><h3>{L.contreArguments}</h3><ul>{s.objections.map((o, i) => <li key={i}><Texte t={o} /></li>)}</ul></>}
                <a class="btn secondaire" lang="fr" href={`#/etudier/dissertation?c=${pub.c}`}>Travailler ce sujet dans l’atelier</a>
              </>}
              <p class="encadre genere">{L.sujetGenere}</p>
            </div>
          );
        }
        case 'dossier': {
          return (
            <ul class="sommaire">{f.notions.map((x) => <li key={x.id}>{x.titre}</li>)}</ul>
          );
        }
        default: return null;
      }
    }}</Charge>
  );
}

function CorpsQuiz({ pub, complet }: { pub: Publication; complet: boolean }) {
  const ids = complet ? pub.q! : pub.q!.slice(0, 1);
  const c = useAsync(() => chargerQuestions(ids), [ids.join()]);
  return (
    <Charge c={c}>{(qs) => <>{qs.map((q, i) => (
      <QuestionQcm key={q.id} q={q} graine={i + 7} numero={complet ? `${i + 1}/${qs.length}` : undefined}
        onRepondu={(juste) => store.repondreQcm(q.id, q.notion, q.notion.split('.')[0], juste)} />
    ))}{!complet && pub.q!.length > 1 && <a class="lire" href={`#/pub/${pub.id}`}>{pub.q!.length - 1} autre{pub.q!.length > 2 ? 's' : ''} question{pub.q!.length > 2 ? 's' : ''} →</a>}</>}</Charge>
  );
}

function CorpsCas({ pub, complet }: { pub: Publication; complet: boolean }) {
  const c = useAsync(() => chargerExercice(pub.e!), [pub.e]);
  return (
    <Charge c={c}>{(ex) => ex ? (
      <div class="pub-corps">
        {complet ? <p><Texte t={ex.enonce} /></p> : null}
        {complet && ex.donnees && <RenduBloc b={{ type: 'tableau', entetes: ex.donnees.entetes, lignes: ex.donnees.lignes }} />}
        {complet && <ol>{ex.questions.map((q) => <li key={q.id}>{q.consigne}</li>)}</ol>}
        <a class="btn" lang="fr" href={`#/exercice/${ex.id}`}>Résoudre ({ex.questions.length} question{ex.questions.length > 1 ? 's' : ''})</a>
      </div>) : null}</Charge>
  );
}

function CorpsArticle({ pub, complet }: { pub: Publication; complet: boolean }) {
  const c = useAsync(() => chargerArticles(), []);
  return (
    <Charge c={c}>{(liste) => {
      const a = liste.find((x) => `ed:${x.id}` === pub.id);
      return a ? <Article a={a} complet={complet} /> : null;
    }}</Charge>
  );
}

function Article({ a, complet }: { a: Article; complet: boolean }) {
  return (
    <div class="pub-corps">
      {a.donnees && (!complet ? null : <Barres titre={a.donnees.titre} series={a.donnees.series} unite={a.donnees.unite} source={a.donnees.source} note={a.donnees.fictif ? 'données fictives, à visée pédagogique' : a.donnees.note} />)}
      {!complet && a.donnees && <Barres titre={a.donnees.titre} series={a.donnees.series.slice(0, 5)} unite={a.donnees.unite} source={a.donnees.source} note={a.donnees.fictif ? 'données fictives' : undefined} />}
      {complet && a.chronologie && <ol class="frise">{a.chronologie.map((l, i) => <li key={i}><span class="date">{l.date}</span><span>{l.evenement}</span></li>)}</ol>}
      {complet && a.arguments && (
        <div class="debat-colonnes">
          <div><h4>{a.arguments.pour.titre}</h4><ul>{a.arguments.pour.points.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
          <div><h4>{a.arguments.contre.titre}</h4><ul>{a.arguments.contre.points.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
        </div>
      )}
      {complet && (
        <div class="faits-analyse" style={{ marginTop: 24 }}>
          <div><h4>Les faits</h4><ul>{a.faits.map((x, i) => <li key={i}><Texte t={x} /></li>)}</ul></div>
          {a.analyse?.length ? <div><h4>L’analyse</h4><ul>{a.analyse.map((x, i) => <li key={i}><Texte t={x} /></li>)}</ul></div> : null}
        </div>
      )}
      {complet && a.sections?.map((s) => <section key={s.titre}><h3>{s.titre}</h3><p><Texte t={s.texte} /></p></section>)}
      {complet && <>
        <h3>Notions de cours liées</h3>
        <p>{a.notions.filter((n) => index.notions[n]).map((n) => <a key={n} class="lien-notion" href={`#/notion/${n}`}>{index.notions[n].titre}</a>)}</p>
        <h3>Sources</h3>
        <ul class="small">{a.sources.map((s) => { const x = index.sources.find((y) => y.id === s); return x ? <li key={s}>{x.auteur}, <em>{x.titre}</em>{x.url && <> — <a href={x.url} target="_blank" rel="noopener">{x.url.replace(/^https?:\/\//, '')}</a></>} <span class="muted">({x.acces === 'reference' ? 'référence non consultée' : x.acces === 'extrait' ? 'consulté par extrait' : 'lu'})</span></li> : null; })}</ul>
        {a.aVerifier && <div class="encadre a-verifier">À vérifier : {a.aVerifier}</div>}
        <p class="encadre genere">Article éditorial rédigé pour l’application : il complète le cours mais n’en fait pas partie.</p>
      </>}
    </div>
  );
}

function Corps({ pub, complet }: { pub: Publication; complet: boolean }) {
  if (pub.edito) return <CorpsArticle pub={pub} complet={complet} />;
  if (pub.type === 'quiz') return <CorpsQuiz pub={pub} complet={complet} />;
  if (pub.e) return <CorpsCas pub={pub} complet={complet} />;
  if (pub.c) return <CorpsChapitre pub={pub} complet={complet} />;
  return null;
}

// ---------- Carte du fil ----------
const LARGES: TypePublication[] = ['dossier', 'monde', 'donnees', 'infographie', 'frise', 'debat'];

export function CartePublication({ pub, complet = false }: { pub: Publication; complet?: boolean }) {
  const p = useProgression();
  const m = matiere(pub.m);
  const L = lib(pub.l);
  const large = !complet && LARGES.includes(pub.type) || (pub.type === 'cas' && pub.min > 6);
  const statut = pub.n && !pub.edito ? statutNotion(pub.n, p) : null;
  const lu = p.marques[pub.id]?.lu;
  const sansChapeau = ['comparaison', 'sujet'].includes(pub.type) && !pub.edito;
  return (
    <article class={`pub pub--${pub.type}${pub.edito ? ' edito' : ''}${large ? ' large' : ''} ton-${m?.couleur ?? 'sky'}`} lang={pub.l} data-pub={pub.id}>
      <div class="surtitre" lang="fr">
        <span class="ton-trait">{LIBELLE_TYPE[pub.type]}</span>
        <span>{pub.edito ? 'Hors cours' : m?.titre}</span>
        {pub.l !== 'fr' && <span>{LIBELLE_LANGUE[pub.l]}</span>}
        {pub.date && <span class="dateline">{dateLongue(pub.date)}</span>}
        {pub.portee && <span>{PORTEE[pub.portee]}</span>}
        <span>{pub.min} min</span>
        {pub.genere && <span>Généré</span>}
        {lu && <span>✓ Lu</span>}
      </div>
      {pub.type === 'cas' || pub.type === 'exercice' ? <span class="numero" aria-hidden="true">{String(pub.niv)}</span> : null}
      {complet ? <h1 class="titre-page">{pub.t}</h1> : <h2 class="pub-titre"><a href={`#/pub/${encodeURIComponent(pub.id)}`}>{pub.t}</a></h2>}
      {!sansChapeau && pub.x && pub.type !== 'concept' && <p class="pub-chapeau">{pub.x}</p>}
      {pub.type === 'concept' && !complet && pub.x && <p class="pub-chapeau">{pub.x}</p>}
      {pub.type === 'concept' && complet && pub.x && <p class="chapeau" style={{ fontStyle: 'italic' }}>{pub.x}</p>}
      {pub.type === 'dossier' && !complet && <Motif categorie={m?.categorie ?? ''} graine={pub.id} />}
      <Corps pub={pub} complet={complet} />
      {!complet && !['quiz'].includes(pub.type) && <a class="lire" lang="fr" href={`#/pub/${encodeURIComponent(pub.id)}`}>{pub.type === 'dossier' ? 'Ouvrir le dossier' : 'Lire'} · {L.minutes(pub.min).replace(/^\d+ /, `${pub.min} `)}</a>}
      {statut && !complet && <div style={{ marginTop: 10 }} lang="fr"><StatutPastille s={statut} /></div>}
      <div lang="fr"><ActionsPublication id={pub.id} titre={pub.t} chapitre={pub.c} notion={pub.n} matiere={pub.m} /></div>
    </article>
  );
}

// ---------- Page d'une publication ----------
export function PagePublication({ id }: { id: string }) {
  const c = useAsync(() => chargerFil(), []);
  const p = useProgression();
  useEffect(() => { store.ouvrirPublication(id); window.scrollTo(0, 0); }, [id]);
  return (
    <Charge c={c}>{(fil) => {
      const pub = fil.find((x) => x.id === id);
      if (!pub) return <div class="vide">Publication introuvable. <a href="#/fil">Retour au fil</a></div>;
      const m = matiere(pub.m);
      const chap = pub.c ? chapitreCatalogue(pub.c) : undefined;
      const lu = !!p.marques[id]?.lu;
      const liees = fil.filter((x) => x.id !== id && ((pub.n && x.n === pub.n) || (pub.c && x.c === pub.c && x.type !== pub.type))).slice(0, 6);
      return (
        <>
          <Fil elements={[{ label: 'Fil', href: '#/fil' }, ...(m && !pub.edito ? [{ label: m.titre, href: `#/matiere/${m.id}` }] : [{ label: 'Monde et économie', href: '#/fil?onglet=monde' }]), ...(chap ? [{ label: chap.titre, href: `#/chapitre/${chap.id}` }] : [])]} />
          <CartePublication pub={pub} complet />
          <div class="reprise" lang="fr">
            <span>{lu ? 'Vous avez marqué cette publication comme lue.' : 'Arrivé au bout ? Marquez-la comme lue : elle comptera dans votre progression.'}</span>
            <button class={`btn${lu ? ' secondaire' : ''}`} onClick={() => store.marquer(id, 'lu', !lu, pub.m)}>{lu ? 'Lu ✓' : 'Marquer comme lu'}</button>
          </div>
          <div class="ligne" lang="fr">
            {pub.n && index.notions[pub.n] && <a class="btn secondaire" href={`#/notion/${pub.n}`}>{lib(pub.l).lireFiche}</a>}
            {chap && <a class="btn discret" href={`#/chapitre/${chap.id}${pub.n ? `?n=${pub.n}` : ''}`}>Ouvrir le chapitre</a>}
          </div>
          {liees.length > 0 && (
            <>
              <div class="section-titre"><h2>À lire ensuite</h2></div>
              <ul class="liste-editoriale">{liees.map((x, i) => (
                <li key={x.id}><a href={`#/pub/${encodeURIComponent(x.id)}`}><span class="num">{String(i + 1).padStart(2, '0')}</span><span class="t" lang={x.l}>{x.t}</span><span class="m">{LIBELLE_TYPE[x.type]}</span></a></li>
              ))}</ul>
            </>
          )}
        </>
      );
    }}</Charge>
  );
}

export { langueDe };
