import { useMemo, useState } from 'preact/hooks';
import { chargerQuestions, index, matiere, notionsDuPerimetre, matiereDe } from '../data';
import { aller, useAsync, useProgression } from '../hooks';
import { melanger } from '../core/hasard';
import { store } from '../core/store';
import { Charge, Fil } from '../ui/communs';
import { QuestionQcm } from '../ui/Qcm';

/** Sélecteur de périmètre réutilisable : matière, puis chapitre facultatif. */
export function SelecteurPerimetre({ valeur, onChange }: { valeur: string; onChange: (v: string) => void }) {
  const mat = valeur.split('.')[0];
  const m = matiere(mat);
  const chap = valeur.split('.').length >= 2 ? valeur.split('.').slice(0, 2).join('.') : '';
  return (
    <div class="grille" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
      <label class="champ">Matière
        <select value={mat} onChange={(e) => onChange((e.target as HTMLSelectElement).value)}>
          <option value="">Toutes les matières</option>
          {index.matieres.filter((x) => Object.values(index.notions).some((n) => n.matiere === x.id && n.redigee)).map((x) => <option key={x.id} value={x.id}>{x.titre}</option>)}
        </select>
      </label>
      <label class="champ">Chapitre
        <select value={chap} disabled={!m} onChange={(e) => onChange((e.target as HTMLSelectElement).value || mat)}>
          <option value="">Tous les chapitres</option>
          {m?.chapitres.filter((c) => c.notions.some((n) => index.notions[n.id].redigee)).map((c) => <option key={c.id} value={c.id}>{c.titre}</option>)}
        </select>
      </label>
    </div>
  );
}

export function questionsDuPerimetre(perimetre: string, niveau: string) {
  const notions = new Set(notionsDuPerimetre(perimetre ? [perimetre] : []));
  return index.questions.filter((q) => notions.has(q.notion) && (!niveau || String(q.niveau) === niveau));
}

export function Entrainer({ params }: { params: URLSearchParams }) {
  const p = useProgression();
  const [perimetre, setPerimetre] = useState(params.get('p') ?? '');
  const [niveau, setNiveau] = useState('');
  const [nombre, setNombre] = useState('10');
  const onglet = params.get('onglet') === 'exercices' ? 'exercices' : 'qcm';
  const dispo = questionsDuPerimetre(perimetre, niveau);
  const notions = new Set(notionsDuPerimetre(perimetre ? [perimetre] : []));
  const exercices = index.exercices.filter((e) => e.notions.some((n) => notions.has(n)) && (!niveau || String(e.niveau) === niveau));
  const reussi = (id: string) => {
    const cles = Object.keys(p.exercices).filter((k) => k.startsWith(id + '/'));
    if (!cles.length) return null;
    return cles.every((k) => p.exercices[k].at(-1)?.ok);
  };

  const lien = (o: string) => `#/entrainer?p=${perimetre}&onglet=${o}`;
  return (
    <>
      <h1 class="titre-page">S'entraîner</h1>
      <p class="muted">Choisissez un périmètre et une difficulté. Chaque réponse est corrigée et expliquée après validation.</p>
      <div class="puces" role="tablist" style={{ margin: '12px 0' }}>
        <a role="tab" aria-selected={onglet === 'qcm'} class={`puce simple${onglet === 'qcm' ? ' active' : ''}`} href={lien('qcm')}>QCM</a>
        <a role="tab" aria-selected={onglet === 'exercices'} class={`puce simple${onglet === 'exercices' ? ' active' : ''}`} href={lien('exercices')}>Exercices corrigés</a>
      </div>
      <div class="bloc">
        <SelecteurPerimetre valeur={perimetre} onChange={setPerimetre} />
        <div class="grille" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: 12 }}>
          <label class="champ">Difficulté
            <select value={niveau} onChange={(e) => setNiveau((e.target as HTMLSelectElement).value)}>
              <option value="">Toutes</option><option value="1">1 · mémoriser</option><option value="2">2 · comprendre, appliquer</option><option value="3">3 · analyser, résoudre</option>
            </select>
          </label>
          {onglet === 'qcm' && (
            <label class="champ">Nombre de questions
              <select value={nombre} onChange={(e) => setNombre((e.target as HTMLSelectElement).value)}>
                {['5', '10', '20', '40'].map((n) => <option key={n}>{n}</option>)}
              </select>
            </label>
          )}
        </div>
      </div>
      {onglet === 'qcm' ? (
        <div class="entre">
          <span class="muted">{dispo.length} question{dispo.length > 1 ? 's' : ''} disponible{dispo.length > 1 ? 's' : ''}</span>
          <button class="btn" disabled={!dispo.length} onClick={() => aller(`#/entrainer/qcm?p=${perimetre}&niveau=${niveau}&n=${nombre}&g=${Date.now() % 100000}`)}>Lancer la série</button>
        </div>
      ) : (
        <>
          {exercices.length === 0 && <div class="vide">Aucun exercice pour ce périmètre pour l'instant.</div>}
          <div class="grille">
            {exercices.map((e) => {
              const mat = matiereDe(e.id.split('.')[1])!;
              const r = reussi(e.id);
              return (
                <a key={e.id} class={`carte bg-${mat.couleur}`} href={`#/exercice/${e.id}`}>
                  <div class="haut"><span class="cat">{mat.titre}</span><span class="badge">{r === null ? 'À faire' : r ? '✔ Réussi' : 'À reprendre'}</span></div>
                  <h3>{e.titre}</h3>
                  <div class="bas"><span>Niveau {e.niveau}</span><span>{e.type}</span></div>
                </a>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

/** Série de QCM corrigés un par un. */
export function SerieQcm({ params }: { params: URLSearchParams }) {
  const graine = Number(params.get('g') ?? 1);
  const ids = useMemo(() => {
    if (params.get('ids')) return params.get('ids')!.split(',');
    const dispo = questionsDuPerimetre(params.get('p') ?? '', params.get('niveau') ?? '').map((q) => q.id);
    return melanger(dispo, graine).slice(0, Number(params.get('n') ?? 10));
  }, [params.toString()]);
  const c = useAsync(() => chargerQuestions(ids), [ids.join()]);
  const [i, setI] = useState(0);
  const [resultats, setResultats] = useState<Record<string, boolean>>({});
  const titre = params.get('titre') ?? 'Série de QCM';

  return (
    <>
      <Fil elements={[{ label: "S'entraîner", href: '#/entrainer' }, { label: titre }]} />
      <Charge c={c}>{(qs) => {
        if (!qs.length) return <div class="vide">Aucune question disponible.</div>;
        if (i >= qs.length) {
          const justes = Object.values(resultats).filter(Boolean).length;
          const fausses = qs.filter((q) => resultats[q.id] === false);
          return (
            <div class="bloc">
              <h1 class="titre-page">Bilan : {justes}/{qs.length}</h1>
              <ul class="notions">
                {qs.map((q) => (
                  <li key={q.id}><a href={`#/notion/${q.notion}`}><span>{resultats[q.id] ? '✔' : '✘'} {q.enonce.slice(0, 110)}{q.enonce.length > 110 ? '…' : ''}</span><span class="small muted">{index.notions[q.notion].titre}</span></a></li>
                ))}
              </ul>
              <div class="ligne" style={{ marginTop: 16 }}>
                {fausses.length > 0 && <a class="btn" href={`#/entrainer/qcm?ids=${fausses.map((q) => q.id).join(',')}&g=${graine + 1}&titre=Reprise des erreurs`}>Refaire les {fausses.length} erreur{fausses.length > 1 ? 's' : ''}</a>}
                <a class="btn secondaire" href="#/entrainer">Nouvelle série</a>
              </div>
            </div>
          );
        }
        const q = qs[i];
        const fait = q.id in resultats;
        return (
          <>
            <div class="entre" style={{ margin: '12px 0' }}>
              <h1 class="titre-page" style={{ margin: 0 }}>{titre}</h1>
              <span class="badge contour">Question {i + 1}/{qs.length}</span>
            </div>
            <QuestionQcm key={q.id} q={q} graine={graine + i} onRepondu={(juste) => {
              setResultats({ ...resultats, [q.id]: juste });
              store.repondreQcm(q.id, q.notion, q.notion.split('.')[0], juste);
            }} />
            {fait && <button class="btn" onClick={() => setI(i + 1)} autoFocus>{i + 1 < qs.length ? 'Question suivante →' : 'Voir le bilan'}</button>}
          </>
        );
      }}</Charge>
    </>
  );
}
