import { Fragment } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { chargerFil, index, LIBELLE_LANGUE, matieresDisponibles } from '../data';
import { aller, useAsync, useProgression } from '../hooks';
import { store } from '../core/store';
import { Charge } from '../ui/communs';
import { CartePublication, LIBELLE_TYPE } from '../ui/Publication';
import { classer, filtrer, FILTRES_VIDES, matieresSuivies, type Filtres, type Onglet } from '../classement';
import type { Publication, TypePublication } from '../types';
import { BADGES, quetes } from '../jeu';
import { Jauge } from '../ui/communs';
import { estDue } from '../core/srs';

const ONGLETS: { id: Onglet; label: string }[] = [
  { id: 'pour-vous', label: 'Pour vous' }, { id: 'mes-matieres', label: 'Mes matières' }, { id: 'monde', label: 'Monde et économie' },
  { id: 'enregistres', label: 'Enregistrés' }, { id: 'historique', label: 'Déjà lus' },
];
const PAS = 10;

export function Fil({ params }: { params: URLSearchParams }) {
  const c = useAsync(() => chargerFil(), []);
  const onglet = (ONGLETS.find((o) => o.id === params.get('onglet'))?.id ?? 'pour-vous') as Onglet;
  const filtres: Filtres = { matiere: params.get('m') ?? '', type: params.get('type') ?? '', niveau: params.get('niv') ?? '', langue: params.get('l') ?? '' };
  const lien = (o: Onglet, f: Filtres = filtres) => `#/fil?onglet=${o}${f.matiere ? `&m=${f.matiere}` : ''}${f.type ? `&type=${f.type}` : ''}${f.niveau ? `&niv=${f.niveau}` : ''}${f.langue ? `&l=${f.langue}` : ''}`;
  const changer = (k: keyof Filtres, v: string) => aller(lien(onglet, { ...filtres, [k]: v }));
  const actifs = Object.values(filtres).filter(Boolean).length;

  return (
    <>
      <p class="surtitre">Le fil · des cours, des dossiers, des questions</p>
      <h1 class="titre-page">Fil</h1>
      <nav class="onglets" role="tablist" aria-label="Sections du fil">
        {ONGLETS.map((o) => <a key={o.id} role="tab" aria-selected={o.id === onglet} href={lien(o.id)}>{o.label}</a>)}
      </nav>
      <details open={actifs > 0}>
        <summary class="small" style={{ cursor: 'pointer' }}>Filtres{actifs ? ` (${actifs})` : ''}</summary>
        <div class="filtres">
          <label class="champ">Matière
            <select value={filtres.matiere} onChange={(e) => changer('matiere', (e.target as HTMLSelectElement).value)}>
              <option value="">Toutes</option>{matieresDisponibles().map((m) => <option key={m.id} value={m.id}>{m.titre}</option>)}
            </select></label>
          <label class="champ">Format
            <select value={filtres.type} onChange={(e) => changer('type', (e.target as HTMLSelectElement).value)}>
              <option value="">Tous</option>{(Object.keys(LIBELLE_TYPE) as TypePublication[]).map((t) => <option key={t} value={t}>{LIBELLE_TYPE[t]}</option>)}
            </select></label>
          <label class="champ">Difficulté
            <select value={filtres.niveau} onChange={(e) => changer('niveau', (e.target as HTMLSelectElement).value)}>
              <option value="">Toutes</option><option value="1">1 · découverte</option><option value="2">2 · fondamental</option><option value="3">3 · approfondi</option>
            </select></label>
          <label class="champ">Langue
            <select value={filtres.langue} onChange={(e) => changer('langue', (e.target as HTMLSelectElement).value)}>
              <option value="">Toutes les langues</option>{(['fr', 'en', 'es'] as const).map((l) => <option key={l} value={l}>{LIBELLE_LANGUE[l]}</option>)}
            </select></label>
        </div>
        {actifs > 0 && <a class="small" href={lien(onglet, FILTRES_VIDES)}>Effacer les filtres</a>}
      </details>
      <Charge c={c}>{(fil) => <ListeFil key={lien(onglet)} fil={fil} onglet={onglet} filtres={filtres} />}</Charge>
    </>
  );
}

function ListeFil({ fil, onglet, filtres }: { fil: Publication[]; onglet: Onglet; filtres: Filtres }) {
  const p = useProgression();
  // Ordre figé à l'ouverture : on ne réordonne pas pendant la lecture.
  const liste = useMemo(() => classer(filtrer(fil, filtres), onglet, store.etat), [fil]);
  const position = store.etat.lecture.fil[onglet];
  const [n, setN] = useState(PAS);
  const sentinelle = useRef<HTMLDivElement>(null);
  const conteneur = useRef<HTMLDivElement>(null);
  const indexPosition = position ? liste.findIndex((x) => x.id === position.id) : -1;

  useEffect(() => {
    const el = sentinelle.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const o = new IntersectionObserver((e) => { if (e[0].isIntersecting) setN((v) => Math.min(liste.length, v + PAS)); }, { rootMargin: '600px' });
    o.observe(el);
    return () => o.disconnect();
  }, [liste.length]);

  // Position de lecture : la publication la plus haute visible à l'écran.
  useEffect(() => {
    const el = conteneur.current;
    if (!el || !('IntersectionObserver' in window)) return;
    let minuterie: ReturnType<typeof setTimeout> | undefined;
    const o = new IntersectionObserver((entrees) => {
      const visibles = entrees.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      const id = visibles[0]?.target.getAttribute('data-pub');
      if (!id) return;
      clearTimeout(minuterie);
      minuterie = setTimeout(() => store.positionFil(onglet, id), 800);
    }, { threshold: 0.4 });
    el.querySelectorAll('[data-pub]').forEach((x) => o.observe(x));
    return () => { o.disconnect(); clearTimeout(minuterie); };
  }, [n]);

  const reprendre = () => {
    setN(Math.max(n, indexPosition + PAS));
    setTimeout(() => document.querySelector(`[data-pub="${CSS.escape(position!.id)}"]`)?.scrollIntoView({ block: 'start' }), 60);
  };

  if (!liste.length) {
    return (
      <div class="vide">
        {onglet === 'enregistres' ? 'Rien d’enregistré pour l’instant. Utilisez « Enregistrer » sous une publication pour la retrouver ici.'
          : onglet === 'historique' ? 'Aucune publication ouverte pour l’instant.'
            : 'Aucune publication ne correspond à ces filtres.'}
      </div>
    );
  }
  return (
    <>
      {onglet === 'mes-matieres' && !p.preferences.mesMatieres.length && (
        <p class="encadre small">{matieresSuivies(p).length ? 'Matières déduites de votre activité.' : 'Toutes les matières sont affichées.'} <a href="#/reglages">Choisir mes matières</a></p>
      )}
      {indexPosition > 2 && (
        <div class="reprise"><span>Vous vous étiez arrêté à « {liste[indexPosition].t} ».</span><button class="btn petit" onClick={reprendre}>Reprendre la lecture</button></div>
      )}
      <p class="small muted">{liste.length} publication{liste.length > 1 ? 's' : ''}</p>
      <div class="fil-publications" ref={conteneur}>
        {liste.slice(0, n).map((x, i) => (
          <Fragment key={x.id}>{onglet === 'pour-vous' && i > 0 && i % 12 === 0 && <CarteJeu rang={i / 12} />}<CartePublication pub={x} /></Fragment>
        ))}
      </div>
      <div ref={sentinelle} aria-hidden="true" style={{ height: 1 }} />
      {n < liste.length && <div style={{ textAlign: 'center', margin: '24px 0' }}><button class="btn secondaire" onClick={() => setN(n + PAS)}>Afficher la suite</button></div>}
      {n >= liste.length && <p class="vide small">Fin du fil · {Object.keys(index.notions).length} notions de cours alimentent ces publications.</p>}
    </>
  );
}

/** Carte de progression insérée de loin en loin dans le fil : elle renvoie toujours vers une activité réelle. */
function CarteJeu({ rang }: { rang: number }) {
  const p = useProgression();
  const q = quetes(p).filter((x) => x.periode === 'jour');
  const erreurs = Object.keys(p.erreurs).length;
  const dues = index.flashcards.filter((f) => p.cartes[f.id] && estDue(p.cartes[f.id])).length;
  const badge = Object.entries(p.badges).sort((a, b) => b[1] - a[1])[0];
  const choix = rang % 3;
  if (choix === 1 && (erreurs || dues)) {
    return (
      <aside class="pub large" aria-label="Défi de révision">
        <p class="surtitre"><span class="ton-trait">Défi de révision</span></p>
        <h2 class="pub-titre">{erreurs ? `${erreurs} question${erreurs > 1 ? 's' : ''} ratée${erreurs > 1 ? 's' : ''} à reprendre` : `${dues} flashcard${dues > 1 ? 's' : ''} à revoir`}</h2>
        <p class="pub-chapeau">Une erreur disparaît après deux réussites consécutives.</p>
        <a class="btn" href={erreurs ? '#/reviser' : '#/flashcards'}>Relever le défi</a>
      </aside>
    );
  }
  if (choix === 2 && badge) {
    const b = BADGES.find((x) => x.id === badge[0]);
    return (
      <aside class="pub large" aria-label="Dernier badge">
        <p class="surtitre"><span class="ton-trait">Collection</span></p>
        <h2 class="pub-titre">Badge obtenu : {b?.titre}</h2>
        <p class="pub-chapeau">{b?.description}</p>
        <a class="lire" href="#/progres">Voir la collection</a>
      </aside>
    );
  }
  const faites = q.filter((x) => x.fait >= x.but).length;
  return (
    <aside class="pub large" aria-label="Quêtes du jour">
      <p class="surtitre"><span class="ton-trait">Quêtes du jour</span><span>{faites} / {q.length}</span></p>
      <ul class="quetes">{q.map((x) => (
        <li key={x.id} class={x.fait >= x.but ? 'faite' : ''}><a class="q-titre" href={x.lien}>{x.titre}</a><span class="q-xp">{x.xp} XP</span>
          <Jauge valeur={(Math.min(x.fait, x.but) / x.but) * 100} label={`${Math.min(x.fait, x.but)} sur ${x.but}`} /></li>
      ))}</ul>
    </aside>
  );
}
