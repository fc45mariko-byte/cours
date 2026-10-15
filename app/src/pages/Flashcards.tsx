import { useMemo, useState } from 'preact/hooks';
import { chargerFlashcards, index, notionsDuPerimetre } from '../data';
import { useAsync, useProgression } from '../hooks';
import { estDue, type Note } from '../core/srs';
import { store } from '../core/store';
import { Charge, LienNotion, Texte } from '../ui/communs';
import { SelecteurPerimetre } from './Entrainer';
import type { Flashcard } from '../types';

const NOTES: { note: Note; label: string; aide: string }[] = [
  { note: 'revoir', label: 'À revoir', aide: 'Je ne savais pas ou j’ai fait une erreur de fond' },
  { note: 'difficile', label: 'Difficile', aide: 'Réponse incomplète ou très hésitante' },
  { note: 'correct', label: 'Correct', aide: 'Les éléments indispensables y étaient' },
  { note: 'facile', label: 'Facile', aide: 'Réponse complète et immédiate' },
];

function Carte({ f, onNote }: { f: Flashcard; onNote: (n: Note) => void }) {
  const [reponse, setReponse] = useState('');
  const [vue, setVue] = useState(false);
  const [coches, setCoches] = useState<boolean[]>([]);
  const manque = vue && coches.filter(Boolean).length < f.indispensables.length;
  return (
    <div class="bloc carte-flash">
      <div class="small muted">Notion{f.notions.length > 1 ? 's' : ''} : {f.notions.map((n) => <LienNotion key={n} id={n} />)}</div>
      <h2 style={{ marginTop: 12 }}>{f.question}</h2>
      <label class="champ">Votre réponse (facultatif, non analysée automatiquement)
        <textarea value={reponse} disabled={vue} onInput={(e) => setReponse((e.target as HTMLTextAreaElement).value)} placeholder="Rédigez ou formulez mentalement votre réponse, puis comparez." />
      </label>
      {!vue && <button class="btn" style={{ marginTop: 12 }} onClick={() => setVue(true)}>Voir la réponse de référence</button>}
      {vue && (
        <div aria-live="polite">
          <h3>Réponse de référence</h3>
          <p><Texte t={f.reponse} /></p>
          <div class="bloc plat" style={{ padding: 16 }}>
            <strong>Éléments indispensables — cochez ceux que contenait votre réponse</strong>
            <div class="criteres">{f.indispensables.map((c, i) => (
              <label key={i}><input type="checkbox" checked={!!coches[i]} onChange={() => { const v = [...coches]; v[i] = !v[i]; setCoches(v); }} />{c}</label>
            ))}</div>
            {f.complementaires?.length ? <><strong class="small">Éléments complémentaires (bonus)</strong><ul class="small">{f.complementaires.map((c, i) => <li key={i}>{c}</li>)}</ul></> : null}
            {f.erreurs?.length ? <><strong class="small">Erreurs conceptuelles à éviter</strong><ul class="small">{f.erreurs.map((c, i) => <li key={i}>{c}</li>)}</ul></> : null}
          </div>
          {manque && f.relance && <div class="encadre attention"><strong>Question de relance :</strong> {f.relance}</div>}
          <p class="small muted" style={{ marginTop: 12 }}>Évaluez-vous honnêtement : la date de la prochaine révision en dépend.</p>
          <div class="notes-carte">
            {NOTES.map((n) => (
              <button key={n.note} class={`btn ${n.note === 'revoir' ? 'secondaire' : n.note === 'facile' ? '' : 'discret'}`} title={n.aide} onClick={() => onNote(n.note)}
                disabled={n.note === 'facile' && manque}>
                {n.label}
              </button>
            ))}
          </div>
          {manque && <p class="small muted">« Facile » n'est pas proposé tant qu'un élément indispensable manque.</p>}
        </div>
      )}
    </div>
  );
}

export function Flashcards({ params }: { params: URLSearchParams }) {
  const p = useProgression();
  const [perimetre, setPerimetre] = useState(params.get('p') ?? '');
  const [session, setSession] = useState<string[] | null>(null);
  const [i, setI] = useState(0);
  const notions = new Set(notionsDuPerimetre(perimetre ? [perimetre] : []));
  const cartes = index.flashcards.filter((f) => f.notions.some((n) => notions.has(n)));
  const dues = cartes.filter((f) => p.cartes[f.id] && estDue(p.cartes[f.id]));
  const nouvelles = cartes.filter((f) => !p.cartes[f.id]);
  const ids = useMemo(() => session ?? [], [session]);
  const c = useAsync(() => chargerFlashcards(ids), [ids.join()]);

  if (!session) {
    return (
      <>
        <h1 class="titre-page">Flashcards</h1>
        <p class="muted">Questions ouvertes : répondez d'abord, puis comparez avec la réponse de référence et cochez les éléments présents. Les cartes reviennent selon votre évaluation (répétition espacée).</p>
        <div class="bloc"><SelecteurPerimetre valeur={perimetre} onChange={setPerimetre} /></div>
        <div class="grille">
          <div class="bloc" style={{ margin: 0 }}><strong style={{ fontSize: '2rem' }}>{dues.length}</strong><div class="muted">à revoir maintenant</div></div>
          <div class="bloc" style={{ margin: 0 }}><strong style={{ fontSize: '2rem' }}>{nouvelles.length}</strong><div class="muted">jamais vues</div></div>
          <div class="bloc" style={{ margin: 0 }}><strong style={{ fontSize: '2rem' }}>{cartes.length - dues.length - nouvelles.length}</strong><div class="muted">programmées plus tard</div></div>
        </div>
        <div class="ligne" style={{ marginTop: 16 }}>
          <button class="btn" disabled={!dues.length && !nouvelles.length} onClick={() => { setSession([...dues, ...nouvelles].slice(0, 20).map((f) => f.id)); setI(0); }}>
            Commencer ({Math.min(20, dues.length + nouvelles.length)} cartes)
          </button>
          <button class="btn secondaire" disabled={!cartes.length} onClick={() => { setSession(cartes.map((f) => f.id).slice(0, 30)); setI(0); }}>Tout revoir quand même</button>
        </div>
      </>
    );
  }
  return (
    <Charge c={c}>{(liste) => {
      if (i >= liste.length) return (
        <div class="bloc vide">
          <h1 class="titre-page">Session terminée</h1>
          <p>{liste.length} carte{liste.length > 1 ? 's' : ''} travaillée{liste.length > 1 ? 's' : ''}. Les cartes « À revoir » reviendront dans quelques minutes.</p>
          <button class="btn" onClick={() => setSession(null)}>Retour</button>
        </div>
      );
      const f = liste[i];
      return (
        <>
          <div class="entre"><h1 class="titre-page">Flashcards</h1><span class="badge contour">{i + 1}/{liste.length}</span></div>
          <Carte key={f.id + i} f={f} onNote={(n) => { store.noterCarte(f.id, f.notions[0].split('.')[0], n); setI(i + 1); }} />
        </>
      );
    }}</Charge>
  );
}
