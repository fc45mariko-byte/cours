import { useEffect, useRef, useState } from 'preact/hooks';
import { chargerChapitre, chapitreCatalogue, matiereDe } from '../data';
import { aller, useAsync, useProgression } from '../hooks';
import { store, type Dissertation as D } from '../core/store';
import { Charge, Fil, LienNotion, Texte, ilYa } from '../ui/communs';
import { SelecteurPerimetre } from './Entrainer';
import { genererSujet } from '../sujets';
import { lib } from '../i18n';

export function Dissertation({ params }: { params: URLSearchParams }) {
  const p = useProgression();
  const id = params.get('id');
  if (id && p.dissertations[id]) return <Atelier d={p.dissertations[id]} />;
  const chap = params.get('c') ?? '';
  const variante = Number(params.get('v') ?? 0);
  const liste = Object.values(p.dissertations).sort((a, b) => b.modifie - a.modifie);
  return (
    <>
      <Fil elements={[{ label: 'Étudier', href: '#/etudier' }, { label: 'Atelier de dissertation' }]} />
      <h1 class="titre-page">Atelier de dissertation</h1>
      <p class="chapeau">Choisissez un chapitre : un sujet, une problématique et un plan sont proposés à partir des fiches. Vous travaillez ensuite le plan et la rédaction, enregistrés sur cet appareil.</p>
      <div class="bloc">
        <SelecteurPerimetre valeur={chap} onChange={(v) => aller(`#/etudier/dissertation?c=${v.split('.').slice(0, 2).join('.')}`)} />
        {chap && !chap.includes('.') && <p class="small muted" style={{ marginTop: 8 }}>Choisissez aussi un chapitre.</p>}
      </div>
      {chap.includes('.') && <Proposition chapitre={chap} variante={variante} />}
      {liste.length > 0 && (
        <>
          <div class="section-titre"><h2>Mes dissertations</h2></div>
          <ul class="liste-editoriale">{liste.map((d) => (
            <li key={d.id}><a href={`#/etudier/dissertation?id=${encodeURIComponent(d.id)}`}><span class="num">{d.planTermine ? '✓' : '·'}</span>
              <span><span class="t">{d.sujet}</span><br /><span class="small muted">{chapitreCatalogue(d.chapitre ?? '')?.titre}</span></span><span class="m">{ilYa(d.modifie)}</span></a></li>
          ))}</ul>
        </>
      )}
    </>
  );
}

function Proposition({ chapitre, variante }: { chapitre: string; variante: number }) {
  const c = useAsync(() => chargerChapitre(chapitre), [chapitre]);
  const m = matiereDe(chapitre);
  return (
    <Charge c={c}>{(f) => {
      const s = genererSujet(f, m?.langue ?? 'fr', variante);
      if (!s) return <div class="vide">Ce chapitre ne contient pas assez de notions pour proposer un sujet.</div>;
      const L = lib(s.langue);
      const commencer = () => {
        const id = `${s.id}:${Date.now()}`;
        const t = Date.now();
        store.enregistrerDissertation({ id, sujet: s.sujet, problematique: s.problematique, matiere: m!.id, chapitre, plan: s.plan.map((x) => ({ titre: x, notes: '' })), texte: '', cree: t, modifie: t });
        aller(`#/etudier/dissertation?id=${encodeURIComponent(id)}`);
      };
      return (
        <article class={`pub pub--sujet ton-${m?.couleur}`} lang={s.langue} style={{ marginTop: 24 }}>
          <p class="surtitre" lang="fr"><span class="ton-trait">Sujet généré</span><span>{m?.titre}</span><span>{chapitreCatalogue(chapitre)?.titre}</span></p>
          <p class="citation">{s.sujet}</p>
          <h3>{L.problematique}</h3><p>{s.problematique}</p>
          <h3>{L.plan}</h3><ol>{s.plan.map((x, i) => <li key={i}>{x}</li>)}</ol>
          {s.concepts.length > 0 && <><h3>{L.conceptsMobiliser}</h3><p>{s.concepts.map((x) => x.fr + (x.trad ? ` (${x.trad})` : '')).join(' · ')}</p></>}
          {s.exemples.length > 0 && <><h3>{L.exemplesUtiles}</h3><ul>{s.exemples.map((x, i) => <li key={i}>{x.fictif && <span class="tag-fictif" style={{ marginLeft: 0, marginRight: 6 }}>{L.exempleFictif}</span>}<Texte t={x.texte} /></li>)}</ul></>}
          {s.objections.length > 0 && <><h3>{L.contreArguments}</h3><ul>{s.objections.map((x, i) => <li key={i}><Texte t={x} /></li>)}</ul></>}
          <p class="small">{s.notions.map((n) => <LienNotion key={n} id={n} />)}</p>
          <p class="encadre genere">{L.sujetGenere}</p>
          <div class="ligne" lang="fr">
            <button class="btn" onClick={commencer}>Travailler ce sujet</button>
            <a class="btn discret" href={`#/etudier/dissertation?c=${chapitre}&v=${variante + 1}`}>Autre angle</a>
          </div>
        </article>
      );
    }}</Charge>
  );
}

function Atelier({ d }: { d: D }) {
  const [brouillon, setBrouillon] = useState(d);
  const minuterie = useRef<ReturnType<typeof setTimeout>>();
  const L = lib(matiereDe(d.matiere)?.langue);
  useEffect(() => () => clearTimeout(minuterie.current), []);
  const maj = (f: (x: D) => D) => {
    const n = f(brouillon);
    setBrouillon(n);
    clearTimeout(minuterie.current);
    minuterie.current = setTimeout(() => store.enregistrerDissertation({ ...n, modifie: Date.now() }), 600);
  };
  const mots = brouillon.texte.trim() ? brouillon.texte.trim().split(/\s+/).length : 0;
  const exporter = () => {
    const txt = `${brouillon.sujet}\n\n${L.problematique} : ${brouillon.problematique}\n\n${brouillon.plan.map((x, i) => `${L.partie(i)}. ${x.titre}\n${x.notes}`).join('\n\n')}\n\n---\n\n${brouillon.texte}\n`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([txt], { type: 'text/plain;charset=utf-8' }));
    a.download = 'dissertation.txt'; a.click(); URL.revokeObjectURL(a.href);
  };
  const lang = matiereDe(d.matiere)?.langue ?? 'fr';
  return (
    <>
      <Fil elements={[{ label: 'Étudier', href: '#/etudier' }, { label: 'Atelier de dissertation', href: '#/etudier/dissertation' }, { label: 'Brouillon' }]} />
      <p class="surtitre">{matiereDe(d.matiere)?.titre} · enregistré automatiquement sur cet appareil</p>
      <h1 class="titre-page" lang={lang} style={{ fontStyle: 'italic' }}>{brouillon.sujet}</h1>
      <div class="atelier" lang={lang}>
        <label class="champ">{L.problematique}<textarea value={brouillon.problematique} onInput={(e) => maj((x) => ({ ...x, problematique: (e.target as HTMLTextAreaElement).value }))} style={{ minHeight: 80 }} /></label>
        <h2 style={{ margin: '8px 0 0' }}>{L.plan}</h2>
        {brouillon.plan.map((partie, i) => (
          <div class="partie" key={i}>
            <label class="champ">{L.partie(i)}.
              <input type="text" value={partie.titre} onInput={(e) => maj((x) => ({ ...x, plan: x.plan.map((y, j) => (j === i ? { ...y, titre: (e.target as HTMLInputElement).value } : y)) }))} /></label>
            <textarea aria-label={`Notes de la partie ${L.partie(i)}`} placeholder="Arguments, exemples, transitions…" value={partie.notes} onInput={(e) => maj((x) => ({ ...x, plan: x.plan.map((y, j) => (j === i ? { ...y, notes: (e.target as HTMLTextAreaElement).value } : y)) }))} style={{ marginTop: 6 }} />
          </div>
        ))}
        <div class="ligne" lang="fr">
          <button class="btn petit discret" onClick={() => maj((x) => ({ ...x, plan: [...x.plan, { titre: '', notes: '' }] }))}>+ Ajouter une partie</button>
          <button class={`btn petit${brouillon.planTermine ? ' secondaire' : ''}`} onClick={() => { const n = { ...brouillon, planTermine: brouillon.planTermine ? undefined : Date.now(), modifie: Date.now() }; setBrouillon(n); store.enregistrerDissertation(n); }}>
            {brouillon.planTermine ? 'Plan terminé ✓' : 'Marquer le plan comme terminé'}</button>
        </div>
        <h2 style={{ margin: '16px 0 0' }} lang="fr">Rédaction</h2>
        <textarea aria-label="Rédaction" value={brouillon.texte} onInput={(e) => maj((x) => ({ ...x, texte: (e.target as HTMLTextAreaElement).value }))} style={{ minHeight: 360, fontFamily: 'var(--serif)', fontSize: '1.08rem' }} />
        <div class="compteur" lang="fr">{mots} mot{mots > 1 ? 's' : ''}</div>
      </div>
      <div class="ligne" lang="fr" style={{ marginTop: 16 }}>
        <button class="btn secondaire" onClick={exporter}>Exporter en texte</button>
        <button class="btn discret" onClick={() => { if (confirm('Supprimer ce brouillon ?')) { store.supprimerDissertation(d.id); aller('#/etudier/dissertation'); } }}>Supprimer</button>
      </div>
    </>
  );
}
