// Synthèses : l'essentiel de chaque matière en 2 ou 3 pages, avec un mode récitation (rappel actif).
import { useState } from 'preact/hooks';
import { chargerSynthese, index, LIBELLE_LANGUE, matiere, matieresDisponibles } from '../data';
import { useAsync, useProgression } from '../hooks';
import { store } from '../core/store';
import { Charge, Fil, Texte } from '../ui/communs';
import { lib } from '../i18n';
import type { MatiereCatalogue, Synthese as S } from '../types';

const pdf = (m: string) => `./imprimables/syntheses/${m}.pdf`;
const cle = (chapitre: string) => `synth:${chapitre}`;

/** Bilan d'auto-évaluation d'une matière : chapitres sus / à revoir. */
export function bilanSynthese(p: ReturnType<typeof useProgression>, m: MatiereCatalogue) {
  const sus = m.chapitres.filter((c) => p.marques[cle(c.id)]?.compris).length;
  const aRevoir = m.chapitres.filter((c) => p.marques[cle(c.id)]?.aRevoir).length;
  return { sus, aRevoir, total: m.chapitres.length };
}

export function Syntheses() {
  const p = useProgression();
  const dispo = new Set(index.syntheses.map((s) => s.matiere));
  const ligne = (m: MatiereCatalogue) => {
    const b = bilanSynthese(p, m);
    const s = index.syntheses.find((x) => x.matiere === m.id);
    return (
      <li key={m.id}>
        {dispo.has(m.id) ? (
          <a href={`#/synthese/${m.id}`}>
            <span class="num">{m.emploiDuTemps ? m.emploiDuTemps.seances.join('+') : '·'}</span>
            <span><span class="t">{m.titre}</span><br /><span class="small muted">{s!.chapitres} chapitres · {s!.questions} questions de récitation{m.langue !== 'fr' ? ` · ${LIBELLE_LANGUE[m.langue]}` : ''}{b.sus ? ` · ${b.sus}/${b.total} sus` : ''}{b.aRevoir ? ` · ${b.aRevoir} à revoir` : ''}</span></span>
            <span class="m">Lire</span>
          </a>
        ) : (
          <span class="non-redigee" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, padding: '12px 0' }}>
            <span class="num">{m.emploiDuTemps ? m.emploiDuTemps.seances.join('+') : '·'}</span><span>{m.titre}</span>
            <span class="m">{m.completude === 'absente' ? 'Supports du cours attendus' : 'En préparation'}</span>
          </span>
        )}
      </li>
    );
  };
  const edt = index.matieres.filter((m) => m.emploiDuTemps);
  const autres = matieresDisponibles().filter((m) => !m.emploiDuTemps);
  return (
    <>
      <Fil elements={[{ label: 'Étudier', href: '#/etudier' }, { label: 'Synthèses' }]} />
      <p class="surtitre">Apprendre vite · 2 à 3 pages par matière</p>
      <h1 class="titre-page">Synthèses</h1>
      <p class="chapeau">L’essentiel de chaque cours : l’idée clé de chaque chapitre, les points à connaître, les formules, dates et distinctions, puis des questions pour réciter sans regarder. Lisez une fois, récitez, cochez ce que vous savez.</p>
      <div class="ligne" style={{ gap: 12, flexWrap: 'wrap' }}>
        <a class="btn" href="#/plan">Plan de révision 14 jours</a>
        <a class="btn discret" href="#/syntheses/parcoeur">Tout le « par cœur » du semestre</a>
        <a class="btn discret" href="#/syntheses/imprimer">Imprimer toutes les synthèses du semestre</a>
        {import.meta.env.PROD && <a class="btn discret" href="./imprimables/syntheses/semestre.pdf" download>PDF du semestre</a>}
      </div>
      <div class="section-titre"><h2>Au programme ce semestre</h2><span class="meta">emploi du temps · S5</span></div>
      <ul class="liste-editoriale">{edt.map(ligne)}</ul>
      <div class="section-titre"><h2>Autres matières</h2></div>
      <ul class="liste-editoriale">{autres.map(ligne)}</ul>
    </>
  );
}

function AutoEval({ chapitre, matiereId }: { chapitre: string; matiereId: string }) {
  const p = useProgression();
  const m = p.marques[cle(chapitre)] ?? {};
  return (
    <div class="auto-eval ecran-seul" lang="fr" role="group" aria-label="Auto-évaluation">
      <button class={`puce${m.compris ? ' actif' : ''}`} aria-pressed={!!m.compris} onClick={() => store.marquer(cle(chapitre), 'compris', !m.compris, matiereId)}>Je sais</button>
      <button class={`puce${m.aRevoir ? ' actif' : ''}`} aria-pressed={!!m.aRevoir} onClick={() => store.marquer(cle(chapitre), 'aRevoir', !m.aRevoir, matiereId)}>À revoir</button>
    </div>
  );
}

/** Rendu d'une synthèse. `reciter` : n'affiche que les questions (réponses repliées). `chapitres` : filtre éventuel. */
export function RenduSynthese({ s, reciter, chapitres, titreNiveau = 1 }: { s: S; reciter: boolean; chapitres?: string[]; titreNiveau?: 1 | 2 }) {
  const m = matiere(s.matiere)!;
  const L = lib(m.langue);
  const chs = chapitres?.length ? s.chapitres.filter((c) => chapitres.includes(c.chapitre)) : s.chapitres;
  const H = titreNiveau === 1 ? 'h1' : 'h2';
  const h = titreNiveau === 1 ? 'h2' : 'h3';
  const H3 = h as 'h2' | 'h3';
  return (
    <article class={`synthese ton-${m.couleur}${reciter ? ' recitation' : ''}`} lang={m.langue}>
      <header class="synthese-entete">
        <p class="surtitre" lang="fr"><span>{m.titre}</span>{m.enseignant && <span>{m.enseignant}</span>}{m.code && <span>{m.code}</span>}</p>
        <H class="titre-page">{s.titre}</H>
        {!reciter && !chapitres?.length && <div class="synthese-essentiel"><strong>{L.enBref}</strong><p><Texte t={s.essentiel} /></p></div>}
      </header>
      <div class="synthese-chapitres">
        {chs.map((c, i) => (
          <section class="synthese-chap" key={c.chapitre} id={c.chapitre}>
            <H3 class="synthese-chap-titre"><span class="num">{String(s.chapitres.indexOf(c) + 1 || i + 1).padStart(2, '0')}</span>{c.titre}</H3>
            {!reciter && (
              <>
                <p class="synthese-idee"><strong>{L.ideeCle} : </strong><Texte t={c.idee} /></p>
                <ul class="synthese-points">{c.points.map((x, k) => <li key={k}><Texte t={x} /></li>)}</ul>
                {c.formules?.length ? <div class="synthese-bloc"><strong>{L.formules}</strong><ul>{c.formules.map((x, k) => <li key={k}><code><Texte t={x} /></code></li>)}</ul></div> : null}
                {c.dates?.length ? <div class="synthese-bloc"><strong>{L.datesCles}</strong><dl class="synthese-dates">{c.dates.map((d, k) => <div key={k}><dt>{d.date}</dt><dd><Texte t={d.fait} /></dd></div>)}</dl></div> : null}
                {c.distinctions?.length ? <div class="synthese-bloc"><strong>{L.aDistinguer}</strong><ul>{c.distinctions.map((d, k) => <li key={k}><em>{d.a}</em> / <em>{d.b}</em> : <Texte t={d.difference} /></li>)}</ul></div> : null}
                {c.memo && <p class="synthese-memo"><strong>{L.memo} : </strong><Texte t={c.memo} /></p>}
              </>
            )}
            <div class="synthese-questions">
              <strong>{L.reciter}</strong>
              <ol>{c.questions.map((q, k) => (
                <li key={k}>
                  <span class="q"><Texte t={q.q} /></span>
                  {reciter
                    ? <details><summary>{L.reponse}</summary><p><Texte t={q.r} /></p></details>
                    : <span class="r"> <Texte t={q.r} /></span>}
                </li>
              ))}</ol>
            </div>
            <AutoEval chapitre={c.chapitre} matiereId={m.id} />
          </section>
        ))}
      </div>
      {!chapitres?.length && (
        <footer class="synthese-fin">
          <div class="synthese-bloc"><strong>{L.parCoeur}</strong>{reciter
            ? <ol>{s.parCoeur.map((x, k) => <li key={k}><details><summary>{k + 1}</summary><Texte t={x} /></details></li>)}</ol>
            : <ol>{s.parCoeur.map((x, k) => <li key={k}><Texte t={x} /></li>)}</ol>}</div>
          {!reciter && <div class="synthese-bloc pieges"><strong>{L.pieges}</strong><ul>{s.pieges.map((x, k) => <li key={k}><Texte t={x} /></li>)}</ul></div>}
        </footer>
      )}
    </article>
  );
}

export function Synthese({ id, params }: { id: string; params: URLSearchParams }) {
  const m = matiere(id);
  const s = useAsync(() => chargerSynthese(id), [id]);
  const [reciter, setReciter] = useState(params.get('reciter') === '1');
  const chapitres = params.get('ch')?.split(',').filter(Boolean);
  const p = useProgression();
  if (!m) return <div class="vide">Matière introuvable.</div>;
  const b = bilanSynthese(p, m);
  return (
    <>
      <div class="ecran-seul"><Fil elements={[{ label: 'Étudier', href: '#/etudier' }, { label: 'Synthèses', href: '#/syntheses' }, { label: m.titre }]} /></div>
      {m.completude === 'absente'
        ? <div class="encadre attention"><p>{m.noteCompletude}</p></div>
        : (
          <>
            <div class="outils-impression ecran-seul" lang="fr">
              <button class={`btn${reciter ? '' : ' discret'}`} aria-pressed={reciter} onClick={() => setReciter(!reciter)}>{reciter ? 'Revenir à la lecture' : 'Mode récitation'}</button>
              <button class="btn discret" onClick={() => window.print()}>Imprimer</button>
              {import.meta.env.PROD && <a class="btn discret" href={pdf(id)} download>PDF</a>}
              <a class="btn discret" href={`#/cahier/${id}`}>Exercices express</a>
              <span class="small muted">{b.sus}/{b.total} chapitres sus{b.aRevoir ? ` · ${b.aRevoir} à revoir` : ''}</span>
              {chapitres?.length ? <a class="small" href={`#/synthese/${id}`}>Voir toute la synthèse</a> : null}
            </div>
            <Charge c={s}>{(x) => <RenduSynthese s={x} reciter={reciter} chapitres={chapitres} />}</Charge>
          </>
        )}
    </>
  );
}

/** Toutes les synthèses de l'emploi du temps à la suite (impression, PDF du semestre). */
export function SynthesesSemestre() {
  const ids = index.matieres.filter((m) => m.emploiDuTemps && index.syntheses.some((s) => s.matiere === m.id)).map((m) => m.id);
  const toutes = useAsync(() => Promise.all(ids.map(chargerSynthese)), [ids.join()]);
  return (
    <>
      <div class="ecran-seul">
        <Fil elements={[{ label: 'Étudier', href: '#/etudier' }, { label: 'Synthèses', href: '#/syntheses' }, { label: 'Semestre' }]} />
        <div class="outils-impression"><button class="btn" onClick={() => window.print()}>Imprimer</button><span class="small muted">{ids.length} synthèses, une matière par page</span></div>
      </div>
      <h1 class="titre-page ecran-seul">Synthèses du semestre</h1>
      <Charge c={toutes}>{(xs) => <div class="syntheses-semestre">{xs.map((s) => <RenduSynthese key={s.matiere} s={s} reciter={false} titreNiveau={2} />)}</div>}</Charge>
    </>
  );
}

/** Tout le « par cœur » et les pièges des matières de l'emploi du temps, en récitation. */
export function ParCoeur() {
  const ids = index.matieres.filter((m) => m.emploiDuTemps && index.syntheses.some((s) => s.matiere === m.id)).map((m) => m.id);
  const toutes = useAsync(() => Promise.all(ids.map(chargerSynthese)), [ids.join()]);
  const [cache, setCache] = useState(true);
  return (
    <>
      <div class="ecran-seul"><Fil elements={[{ label: 'Étudier', href: '#/etudier' }, { label: 'Synthèses', href: '#/syntheses' }, { label: 'Par cœur' }]} /></div>
      <p class="surtitre">Consolider · à réciter jusqu’à le savoir sans hésiter</p>
      <h1 class="titre-page">À savoir par cœur</h1>
      <div class="outils-impression ecran-seul" lang="fr">
        <button class="btn" aria-pressed={cache} onClick={() => setCache(!cache)}>{cache ? 'Tout afficher' : 'Cacher pour réciter'}</button>
        <button class="btn discret" onClick={() => window.print()}>Imprimer</button>
      </div>
      <Charge c={toutes}>{(xs) => (
        <div class="par-coeur">{xs.map((s) => {
          const m = matiere(s.matiere)!;
          const L = lib(m.langue);
          return (
            <section key={s.matiere} class={`synthese-bloc ton-${m.couleur}`} lang={m.langue}>
              <h2 class="rubrique"><a href={`#/synthese/${m.id}`}>{m.titre}</a></h2>
              <ol>{s.parCoeur.map((x, k) => <li key={k}>{cache ? <details><summary>{L.parCoeur} · {k + 1}</summary><Texte t={x} /></details> : <Texte t={x} />}</li>)}</ol>
              <p class="small"><strong>{L.pieges} : </strong>{s.pieges.join(' · ')}</p>
            </section>
          );
        })}</div>
      )}</Charge>
    </>
  );
}
