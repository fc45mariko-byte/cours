import { Fragment } from 'preact';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { chargerFil, index, LIBELLE_LANGUE, matieresDisponibles } from '../data';
import { aller, useAsync, useProgression } from '../hooks';
import { store } from '../core/store';
import { Charge } from '../ui/communs';
import { CartePublication, LIBELLE_TYPE } from '../ui/Publication';
import { candidatsOnglet, classer, filtrer, FILTRES_VIDES, matieresSuivies, ONGLETS_DYNAMIQUES, type Filtres, type Onglet } from '../classement';
import { DUREE_EDITION, edition, LIBELLE_RAISON, prochaineEdition, recommander, type Raison } from '../recommandation';
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
  // La liste n'est recalculée que sur demande (« Actualiser ») ; le passage à une nouvelle édition
  // pendant la lecture est seulement signalé, pour ne rien déplacer sous les yeux de l'étudiante.
  const p = useProgression();
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
      <Charge c={c}>{(fil) => <ListeFil key={`${lien(onglet)}|${p.fil.actualise}`} fil={fil} onglet={onglet} filtres={filtres} />}</Charge>
    </>
  );
}

function ListeFil({ fil, onglet, filtres }: { fil: Publication[]; onglet: Onglet; filtres: Filtres }) {
  const dynamique = ONGLETS_DYNAMIQUES.includes(onglet);
  return dynamique ? <ListeDynamique fil={fil} onglet={onglet} filtres={filtres} /> : <ListeStatique fil={fil} onglet={onglet} filtres={filtres} />;
}

/** Enregistrés et déjà lus : ordre chronologique. */
function ListeStatique({ fil, onglet, filtres }: { fil: Publication[]; onglet: Onglet; filtres: Filtres }) {
  const liste = useMemo(() => classer(filtrer(fil, filtres), onglet, store.etat), [fil]);
  const [n, setN] = useState(PAS);
  if (!liste.length) {
    return <div class="vide">{onglet === 'enregistres' ? 'Rien d’enregistré pour l’instant. Utilisez « Enregistrer » sous une publication pour la retrouver ici.' : 'Aucune publication ouverte pour l’instant.'}</div>;
  }
  return (
    <>
      <p class="small muted">{liste.length} publication{liste.length > 1 ? 's' : ''}</p>
      <div class="fil-publications">{liste.slice(0, n).map((x) => <CartePublication key={x.id} pub={x} />)}</div>
      {n < liste.length && <div style={{ textAlign: 'center', margin: '24px 0' }}><button class="btn secondaire" onClick={() => setN(n + PAS)}>Afficher la suite</button></div>}
    </>
  );
}

type Affichee = { pub: Publication; raison?: Raison };

/**
 * Fil calculé par le moteur de recommandation.
 * - L'ordre déjà affiché est mémorisé pour l'édition en cours : on le retrouve en revenant.
 * - Chaque nouveau lot est recalculé avec la progression du moment (ce qui vient d'être lu, compris, raté).
 * - Une nouvelle édition (toutes les 3 heures, ou « Actualiser ») renouvelle le fil.
 */
function ListeDynamique({ fil, onglet, filtres }: { fil: Publication[]; onglet: Onglet; filtres: Filtres }) {
  const p = useProgression();
  const cle = `${onglet}|${filtres.matiere}|${filtres.type}|${filtres.niveau}|${filtres.langue}`;
  const ed = edition(store.etat);
  const graine = `${ed}|${cle}`;
  const { entete, pool } = useMemo(() => candidatsOnglet(filtrer(fil, filtres), onglet, store.etat), [fil]);
  const parId = useMemo(() => new Map(fil.map((x) => [x.id, x])), [fil]);
  const total = entete.length + pool.length;

  const [affichees, setAffichees] = useState<Affichee[]>(() => {
    const memo = store.etat.fil.ordre[cle];
    if (memo && memo.edition === ed) {
      const restaurees: Affichee[] = [];
      for (const e of memo.ids) {
        const [id, raison] = e.split('|');
        const pub = parId.get(id);
        if (pub) restaurees.push({ pub, raison: (raison || undefined) as Raison | undefined });
      }
      if (restaurees.length) return restaurees;
    }
    const tete = entete.map((pub) => ({ pub, raison: 'actualite' as Raison }));
    return [...tete, ...recommander(pool, store.etat, { graine, deja: entete, nombre: PAS })];
  });
  const sentinelle = useRef<HTMLDivElement>(null);
  const conteneur = useRef<HTMLDivElement>(null);
  const vues = useRef(new Set<string>());

  // Lot suivant, recalculé avec la progression actuelle.
  const suite = () => setAffichees((a) => a.length >= total ? a : [...a, ...recommander(pool, store.etat, { graine, deja: a.map((x) => x.pub), nombre: PAS })]);

  useEffect(() => { store.memoriserOrdre(cle, ed, affichees.map((x) => `${x.pub.id}|${x.raison ?? ''}`)); }, [affichees.length]);

  useEffect(() => {
    const el = sentinelle.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const o = new IntersectionObserver((e) => { if (e[0].isIntersecting) suite(); }, { rootMargin: '600px' });
    o.observe(el);
    return () => o.disconnect();
  }, [affichees.length]);

  // Impressions (publication visible à plus de 50 %) et position de lecture.
  useEffect(() => {
    const el = conteneur.current;
    if (!el || !('IntersectionObserver' in window)) return;
    let minuterie: ReturnType<typeof setTimeout> | undefined;
    const o = new IntersectionObserver((entrees) => {
      const visibles = entrees.filter((e) => e.isIntersecting);
      for (const e of visibles) { const id = e.target.getAttribute('data-pub'); if (id) vues.current.add(id); }
      const haut = visibles.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]?.target.getAttribute('data-pub');
      if (!haut) return;
      clearTimeout(minuterie);
      minuterie = setTimeout(() => store.positionFil(onglet, haut), 800);
    }, { threshold: 0.5 });
    el.querySelectorAll('[data-pub]').forEach((x) => o.observe(x));
    return () => { o.disconnect(); clearTimeout(minuterie); };
  }, [affichees.length]);
  useEffect(() => {
    const vider = () => { const ids = [...vues.current]; vues.current.clear(); store.noterImpressions(ids); };
    const t = setInterval(vider, 5000);
    return () => { clearInterval(t); vider(); };
  }, []);

  // Une nouvelle édition est signalée sans bouleverser ce qui est en cours de lecture.
  const [nouvelle, setNouvelle] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setNouvelle(true), Math.max(1000, prochaineEdition() - Date.now()));
    return () => clearTimeout(t);
  }, [ed]);
  const actualiser = () => { store.actualiserFil(); window.scrollTo(0, 0); };

  const position = store.etat.lecture.fil[onglet];
  const indexPosition = position ? affichees.findIndex((x) => x.pub.id === position.id) : -1;
  const reprendre = () => document.querySelector(`[data-pub="${CSS.escape(position!.id)}"]`)?.scrollIntoView({ block: 'start' });
  const heure = (t: number) => new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (!total) return <div class="vide">Aucune publication ne correspond à ces filtres.</div>;
  return (
    <>
      {onglet === 'mes-matieres' && !p.preferences.mesMatieres.length && (
        <p class="encadre small">{matieresSuivies(p).length ? 'Matières déduites de votre activité.' : 'Toutes les matières sont affichées.'} <a href="#/reglages">Choisir mes matières</a></p>
      )}
      <div class="edition">
        <span class="small muted">Édition de {heure(prochaineEdition() - DUREE_EDITION)} · renouvelée à {heure(prochaineEdition())} · {total} publications</span>
        <button class="btn petit discret" onClick={actualiser}>Actualiser le fil</button>
      </div>
      {nouvelle && <div class="reprise" role="status"><span>Une nouvelle édition du fil est prête.</span><button class="btn petit" onClick={actualiser}>L’afficher</button></div>}
      {indexPosition > 2 && (
        <div class="reprise"><span>Vous vous étiez arrêté à « {affichees[indexPosition].pub.t} ».</span><button class="btn petit" onClick={reprendre}>Reprendre la lecture</button></div>
      )}
      <div class="fil-publications" ref={conteneur}>
        {affichees.map((x, i) => (
          <Fragment key={x.pub.id}>{onglet === 'pour-vous' && i > 0 && i % 12 === 0 && <CarteJeu rang={i / 12} />}<CartePublication pub={x.pub} raison={x.raison ? LIBELLE_RAISON[x.raison] : undefined} /></Fragment>
        ))}
      </div>
      <div ref={sentinelle} aria-hidden="true" style={{ height: 1 }} />
      {affichees.length < total && <div style={{ textAlign: 'center', margin: '24px 0' }}><button class="btn secondaire" onClick={suite}>Afficher la suite</button></div>}
      {affichees.length >= total && <p class="vide small">Fin du fil · {Object.keys(index.notions).length} notions de cours alimentent ces publications.</p>}
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
