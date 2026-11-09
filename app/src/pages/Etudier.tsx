import { useMemo, useState } from 'preact/hooks';
import { chargerFlashcards, chargerGlossaire, chargerQuestions, index, langueDe, matiere, matieresDisponibles, notionsDuPerimetre } from '../data';
import { aller, useAsync, useProgression } from '../hooks';
import { store } from '../core/store';
import { estDue } from '../core/srs';
import { melanger } from '../core/hasard';
import { Charge, Fil, LienNotion } from '../ui/communs';
import { QuestionQcm } from '../ui/Qcm';
import { Carte } from './Flashcards';
import { SelecteurPerimetre } from './Entrainer';
import { statutNotion } from '../jeu';
import { jourDuPlan } from '../plan';
import { rangStatut } from '../core/statut';
import type { Flashcard, Question } from '../types';


export function Etudier() {
  const p = useProgression();
  const dues = index.flashcards.filter((f) => p.cartes[f.id] && estDue(p.cartes[f.id])).length;
  const erreurs = Object.keys(p.erreurs).length;
  const nbEx = (pred: (e: typeof index.exercices[number]) => boolean) => index.exercices.filter(pred).length;
  const outils: { href: string; titre: string; texte: string; meta?: string }[] = [
    { href: '#/plan', titre: 'Plan de révision 14 jours', texte: 'Chaque jour : apprendre avec la synthèse, réciter sans regarder, revoir à J+1, J+3 et J+7.', meta: p.preferences.planDebut ? `jour ${jourDuPlan(p.preferences.planDebut)}` : 'à commencer' },
    { href: '#/syntheses', titre: 'Synthèses', texte: 'L’essentiel de chaque matière en 2 à 3 pages, avec questions de récitation et « par cœur ».', meta: `${index.syntheses.length} synthèses` },
    { href: '#/cahiers', titre: 'Exercices express à imprimer', texte: 'Un exercice d’application par chapitre, avec corrigé. Version complète disponible.', meta: `${index.cahiers.length} cahiers` },
    { href: '#/etudier/session', titre: 'Session de révision', texte: 'Choisissez une matière : questions, corrections, explications, renvois au cours et recommandation finale.' },
    { href: '#/entrainer', titre: 'QCM', texte: 'Séries par matière, chapitre ou difficulté, corrigées une à une.', meta: `${index.questions.length} questions` },
    { href: '#/flashcards', titre: 'Flashcards et questions courtes', texte: 'Réponse ouverte, comparaison avec la réponse de référence, répétition espacée.', meta: dues ? `${dues} à revoir` : `${index.flashcards.length} cartes` },
    { href: '#/entrainer?onglet=exercices', titre: 'Exercices corrigés', texte: 'Calculs, écritures comptables, études de cas, rédaction.', meta: `${index.exercices.length} exercices` },
    { href: `#/entrainer?p=tra&onglet=exercices`, titre: 'Traduction', texte: 'Thème et version anglais, thème et version espagnols.', meta: `${nbEx((e) => ['tra', 'tve'].includes(e.chapitre.split('.')[0]))} exercices` },
    { href: '#/entrainer/qcm?p=aec.grammaire&n=10&g=1&titre=Grammar', titre: 'Grammaire', texte: 'Anglais (Useful grammar) et contrastes français-espagnol.', meta: 'anglais · espagnol' },
    { href: '#/etudier/vocabulaire', titre: 'Vocabulaire', texte: 'Retrouver le terme anglais ou espagnol à partir du terme français.', meta: 'glossaire trilingue' },
    { href: `#/entrainer?p=cpt&onglet=exercices`, titre: 'Comptabilité', texte: 'Écritures et calculs corrigés ligne par ligne.', meta: `${nbEx((e) => e.chapitre.startsWith('cpt.'))} exercices` },
    { href: '#/approfondir', titre: 'Cas et notions difficiles', texte: 'Confusions, contre-exemples, questions de niveau 3 et études de cas.' },
    { href: '#/examen', titre: 'Examen blanc', texte: 'Série chronométrée, sans correction immédiate, bilan par notion.' },
    { href: '#/reviser', titre: 'Mes erreurs', texte: 'Questions ratées, jusqu’à deux réussites consécutives.', meta: erreurs ? `${erreurs} en cours` : 'aucune' },
    { href: '#/etudier/dissertation', titre: 'Atelier de dissertation', texte: 'Sujets générés à partir des fiches, plan et rédaction enregistrés sur l’appareil.', meta: `${Object.keys(p.dissertations).length} en cours` },
  ];
  return (
    <>
      <p class="surtitre">Réviser, s’entraîner, rédiger</p>
      <h1 class="titre-page">Étudier</h1>
      <p class="chapeau">Tout l’entraînement s’appuie sur le contenu des cours. Les corrections et les consignes sont dans la langue de chaque matière.</p>
      <div class="section-titre"><h2>Commencer une session</h2></div>
      <DemarrerSession />
      <div class="section-titre"><h2>Outils</h2></div>
      <ul class="liste-editoriale">{outils.map((o, i) => (
        <li key={o.href}><a href={o.href}><span class="num">{String(i + 1).padStart(2, '0')}</span>
          <span><span class="t">{o.titre}</span><br /><span class="small muted">{o.texte}</span></span><span class="m">{o.meta}</span></a></li>
      ))}</ul>
    </>
  );
}

function DemarrerSession({ initial = '' }: { initial?: string }) {
  const [perimetre, setPerimetre] = useState(initial);
  return (
    <div class="bloc">
      <SelecteurPerimetre valeur={perimetre} onChange={setPerimetre} />
      <div class="ligne" style={{ marginTop: 12 }}>
        <button class="btn" onClick={() => aller(`#/etudier/session?p=${perimetre}&g=${Date.now() % 100000}`)}>Lancer la session</button>
        <span class="small muted">8 questions au plus, priorité à vos erreurs et aux notions peu travaillées, puis les flashcards dues.</span>
      </div>
    </div>
  );
}

// ---------- Session de révision ----------
type Element = { type: 'q'; q: Question } | { type: 'f'; f: Flashcard };

function composer(perimetre: string, graine: number) {
  const p = store.etat;
  const ns = new Set(notionsDuPerimetre(perimetre ? [perimetre] : []).filter((n) => index.notions[n].redigee));
  const qs = index.questions.filter((q) => ns.has(q.notion));
  const enErreur = qs.filter((q) => p.erreurs[q.id]);
  const jamais = melanger(qs.filter((q) => !p.qcm[q.id]), graine)
    .sort((a, b) => rangStatut(statutNotion(a.notion, p)) - rangStatut(statutNotion(b.notion, p)));
  const autres = melanger(qs.filter((q) => p.qcm[q.id] && !p.erreurs[q.id]), graine);
  const ids = [...new Set([...enErreur, ...jamais, ...autres].map((q) => q.id))].slice(0, 8);
  const cartes = index.flashcards.filter((f) => f.notions.some((n) => ns.has(n)) && p.cartes[f.id] && estDue(p.cartes[f.id])).slice(0, 3).map((f) => f.id);
  return { ids, cartes };
}

export function Session({ params }: { params: URLSearchParams }) {
  const perimetre = params.get('p');
  if (perimetre === null) {
    return (<><Fil elements={[{ label: 'Étudier', href: '#/etudier' }, { label: 'Session de révision' }]} /><h1 class="titre-page">Session de révision</h1><DemarrerSession /></>);
  }
  return <SessionEnCours key={params.toString()} perimetre={perimetre} graine={Number(params.get('g') ?? 1)} />;
}

function SessionEnCours({ perimetre, graine }: { perimetre: string; graine: number }) {
  const plan = useMemo(() => composer(perimetre, graine), []);
  const c = useAsync(async () => {
    const [qs, fs] = await Promise.all([chargerQuestions(plan.ids), chargerFlashcards(plan.cartes)]);
    return [...qs.map((q) => ({ type: 'q', q }) as Element), ...fs.map((f) => ({ type: 'f', f }) as Element)];
  }, []);
  const [i, setI] = useState(0);
  const [resultats, setResultats] = useState<Record<string, boolean>>({});
  const [repondu, setRepondu] = useState(false);
  const titre = perimetre ? (index.notions[perimetre]?.titre ?? matiere(perimetre.split('.')[0])?.chapitres.find((x) => x.id === perimetre)?.titre ?? matiere(perimetre)?.titre) : 'Toutes les matières';
  return (
    <>
      <Fil elements={[{ label: 'Étudier', href: '#/etudier' }, { label: 'Session de révision' }]} />
      <p class="surtitre">Session de révision · {titre}</p>
      <Charge c={c}>{(elements) => {
        if (!elements.length) return <div class="vide">Aucune question disponible pour ce périmètre.</div>;
        if (i >= elements.length) return <Bilan elements={elements} resultats={resultats} perimetre={perimetre} />;
        const e = elements[i];
        const suivant = () => { setRepondu(false); setI(i + 1); window.scrollTo(0, 0); };
        return (
          <>
            <div class="entre"><h1 class="titre-page" style={{ margin: 0 }}>{e.type === 'q' ? 'Question' : 'Question ouverte'} {i + 1}<span class="muted"> / {elements.length}</span></h1></div>
            {e.type === 'q' ? (
              <QuestionQcm key={e.q.id} q={e.q} graine={graine + i} onRepondu={(juste) => {
                setResultats({ ...resultats, [e.q.id]: juste }); setRepondu(true);
                store.repondreQcm(e.q.id, e.q.notion, e.q.notion.split('.')[0], juste);
              }} />
            ) : (
              <Carte key={e.f.id} f={e.f} onNote={(n) => {
                setResultats({ ...resultats, [e.f.id]: n === 'correct' || n === 'facile' });
                store.noterCarte(e.f.id, e.f.notions[0].split('.')[0], n); suivant();
              }} />
            )}
            {e.type === 'q' && repondu && <button class="btn" onClick={suivant} autoFocus>{i + 1 < elements.length ? 'Suivant →' : 'Voir le bilan'}</button>}
          </>
        );
      }}</Charge>
    </>
  );
}

function Bilan({ elements, resultats, perimetre }: { elements: Element[]; resultats: Record<string, boolean>; perimetre: string }) {
  const justes = Object.values(resultats).filter(Boolean).length;
  const notionsRatees = [...new Set(elements.filter((e) => e.type === 'q' && resultats[e.q.id] === false).map((e) => (e as { q: Question }).q.notion))];
  const pct = Math.round((justes / elements.length) * 100);
  return (
    <>
      <h1 class="titre-page">Bilan : {justes} / {elements.length}</h1>
      <div class="chiffres"><div class="chiffre"><b>{pct} %</b><span>de réussite</span></div><div class="chiffre"><b>{notionsRatees.length}</b><span>notion{notionsRatees.length > 1 ? 's' : ''} à retravailler</span></div></div>
      <div class="section-titre"><h2>Réponses</h2></div>
      <ul class="notions">{elements.map((e) => {
        const id = e.type === 'q' ? e.q.id : e.f.id;
        const notion = e.type === 'q' ? e.q.notion : e.f.notions[0];
        const texte = e.type === 'q' ? e.q.enonce : e.f.question;
        return <li key={id}><a href={`#/notion/${notion}`}><span lang={langueDe(notion)}>{resultats[id] ? '✔' : '✘'} {texte.slice(0, 110)}{texte.length > 110 ? '…' : ''}</span><span class="small muted">{index.notions[notion]?.titre}</span></a></li>;
      })}</ul>
      <div class="section-titre"><h2>Recommandation</h2></div>
      {notionsRatees.length ? (
        <div class="encadre attention">
          <p>Relisez ces fiches, puis refaites une session demain : les questions ratées restent dans « Mes erreurs » jusqu’à deux réussites consécutives.</p>
          <p>{notionsRatees.map((n) => <LienNotion key={n} id={n} />)}</p>
        </div>
      ) : (
        <div class="encadre exemple"><p>Sans faute. Passez aux questions de niveau 3 ou à un examen blanc sur ce périmètre.</p></div>
      )}
      <div class="ligne">
        <a class="btn" href={`#/etudier/session?p=${perimetre}&g=${Date.now() % 100000}`}>Nouvelle session</a>
        <a class="btn secondaire" href={`#/examen?p=${perimetre}`}>Examen blanc</a>
        <a class="btn discret" href="#/reviser">Mes erreurs</a>
      </div>
    </>
  );
}

// ---------- Vocabulaire ----------
const normaliser = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\(.*?\)/g, '').replace(/^(the|a|an|to|el|la|los|las|un|una)\s+/, '').replace(/[^a-z0-9ñ ]/g, '').trim();

export function Vocabulaire({ params }: { params: URLSearchParams }) {
  const langue = params.get('l') === 'es' ? 'es' : 'en';
  const mat = params.get('m') ?? '';
  const [graine] = useState(() => Date.now() % 100000);
  const c = useAsync(() => chargerGlossaire(), []);
  return (
    <>
      <Fil elements={[{ label: 'Étudier', href: '#/etudier' }, { label: 'Vocabulaire' }]} />
      <h1 class="titre-page">Vocabulaire</h1>
      <p class="chapeau">Le terme français et sa définition s’affichent : écrivez l’équivalent {langue === 'en' ? 'anglais' : 'espagnol'}.</p>
      <div class="filtres">
        <label class="champ">Langue<select value={langue} onChange={(e) => aller(`#/etudier/vocabulaire?l=${(e.target as HTMLSelectElement).value}&m=${mat}`)}><option value="en">Anglais</option><option value="es">Espagnol</option></select></label>
        <label class="champ">Matière<select value={mat} onChange={(e) => aller(`#/etudier/vocabulaire?l=${langue}&m=${(e.target as HTMLSelectElement).value}`)}>
          <option value="">Toutes</option>{matieresDisponibles().map((m) => <option key={m.id} value={m.id}>{m.titre}</option>)}</select></label>
      </div>
      <Charge c={c}>{(g) => {
        const termes = melanger(g.filter((t) => (langue === 'en' ? t.en : t.es) && (!mat || t.matiere === mat)), graine).slice(0, 12);
        return <SerieVocabulaire key={`${langue}${mat}`} termes={termes} langue={langue} />;
      }}</Charge>
    </>
  );
}

function SerieVocabulaire({ termes, langue }: { termes: { fr: string; en?: string; es?: string; definition: string; notion: string }[]; langue: 'en' | 'es' }) {
  const [i, setI] = useState(0);
  const [saisie, setSaisie] = useState('');
  const [verdict, setVerdict] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  if (!termes.length) return <div class="vide">Aucun terme pour ce choix.</div>;
  if (i >= termes.length) return <div class="bloc"><h2 style={{ marginTop: 0 }}>{score} / {termes.length}</h2><p>Série terminée.</p><button class="btn" onClick={() => location.reload()}>Nouvelle série</button></div>;
  const t = termes[i];
  const attendu = (langue === 'en' ? t.en : t.es)!;
  const variantes = attendu.split(/\s*[/;,]\s*|\s+or\s+|\s+o\s+/).map(normaliser).filter(Boolean);
  const verifier = () => { const ok = variantes.includes(normaliser(saisie)) || normaliser(attendu) === normaliser(saisie); setVerdict(ok); if (ok) setScore(score + 1); };
  return (
    <div class="bloc">
      <p class="meta">Terme {i + 1} / {termes.length}</p>
      <h2 style={{ marginTop: 4 }} lang="fr">{t.fr}</h2>
      <p class="small muted">{t.definition}</p>
      <label class="champ">Équivalent {langue === 'en' ? 'anglais' : 'espagnol'}
        <input type="text" lang={langue} value={saisie} disabled={verdict !== null} onInput={(e) => setSaisie((e.target as HTMLInputElement).value)} onKeyDown={(e) => { if (e.key === 'Enter' && saisie && verdict === null) verifier(); }} /></label>
      {verdict === null ? <button class="btn" style={{ marginTop: 12 }} disabled={!saisie.trim()} onClick={verifier}>Vérifier</button> : (
        <div aria-live="polite" style={{ marginTop: 12 }}>
          <div class={`verdict ${verdict ? 'ok' : 'ko'}`}>{verdict ? '✔ Juste' : '✘ Attendu'} : <span lang={langue}>{attendu}</span></div>
          <p class="small" style={{ marginTop: 8 }}>Fiche : <LienNotion id={t.notion} /></p>
          <div class="ligne">
            <button class="btn" onClick={() => { setI(i + 1); setSaisie(''); setVerdict(null); }} autoFocus>Suivant →</button>
            {!verdict && <button class="btn discret" onClick={() => { setVerdict(true); setScore(score + 1); }}>J’avais une variante correcte</button>}
          </div>
        </div>
      )}
    </div>
  );
}
