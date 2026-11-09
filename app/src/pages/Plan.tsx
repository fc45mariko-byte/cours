// Plan de révision en 14 jours : apprendre (synthèse puis récitation), revoir à J+1, J+3, J+7, consolider, finir.
import { useMemo, useState } from 'preact/hooks';
import { index, matiere, chapitreCatalogue } from '../data';
import { useProgression } from '../hooks';
import { store } from '../core/store';
import { Fil } from '../ui/communs';
import { construirePlan, jourDuPlan, type Bloc, type JourPlan } from '../plan';

interface Tache { id: string; titre: string; detail?: string; href: string; lien: string }

const titres = (b: Bloc) => b.chapitres.map((c) => chapitreCatalogue(c)?.titre ?? c).join(' · ');
const nomM = (id: string) => matiere(id)?.titre ?? id;

export function tachesDuJour(j: JourPlan, aRevoir: string[]): Tache[] {
  const t: Tache[] = [];
  for (const b of j.nouveaux) {
    t.push({ id: `lire:${b.matiere}`, titre: `Apprendre · ${nomM(b.matiere)}`, detail: `${titres(b)} — lire la synthèse une fois, attentivement`, href: `#/synthese/${b.matiere}?ch=${b.chapitres.join(',')}`, lien: 'Lire' });
    t.push({ id: `reciter:${b.matiere}`, titre: `Réciter sans regarder · ${nomM(b.matiere)}`, detail: 'Répondre de tête, puis vérifier ; cocher « Je sais » ou « À revoir »', href: `#/synthese/${b.matiere}?ch=${b.chapitres.join(',')}&reciter=1`, lien: 'Réciter' });
  }
  if (j.nouveaux.length) {
    const ms = [...new Set(j.nouveaux.map((b) => b.matiere))];
    t.push({ id: 'exo', titre: 'Appliquer · un exercice express', detail: ms.map(nomM).join(', '), href: `#/cahier/${ms[0]}`, lien: 'Exercices' });
  }
  for (const r of j.revisions) {
    for (const b of r.blocs) {
      t.push({ id: `rev:${r.jour}:${b.matiere}`, titre: `Revoir (appris au jour ${r.jour}) · ${nomM(b.matiere)}`, detail: titres(b), href: `#/synthese/${b.matiere}?ch=${b.chapitres.join(',')}&reciter=1`, lien: 'Réciter' });
    }
  }
  if (j.phase === 'apprendre') t.push({ id: 'cartes', titre: 'Flashcards dues', detail: '10 minutes de répétition espacée', href: '#/flashcards', lien: 'Cartes' });
  if (j.phase === 'consolider') {
    t.push({ id: 'parcoeur', titre: 'Par cœur', detail: 'Réciter tout le « par cœur » et les pièges des matières du jour', href: '#/syntheses/parcoeur', lien: 'Réciter' });
    for (const m of j.matieres) {
      t.push({ id: `synth:${m}`, titre: `Récitation complète · ${nomM(m)}`, detail: 'Toute la synthèse en mode récitation', href: `#/synthese/${m}?reciter=1`, lien: 'Réciter' });
      t.push({ id: `examen:${m}`, titre: `Examen blanc · ${nomM(m)}`, detail: 'Série chronométrée, sans correction immédiate', href: `#/examen?p=${m}`, lien: 'Examen' });
    }
  }
  if (j.phase === 'final') {
    t.push({ id: 'faibles', titre: 'Points faibles', detail: aRevoir.length ? `${aRevoir.length} chapitre(s) marqué(s) « À revoir » : ${aRevoir.slice(0, 6).map((c) => chapitreCatalogue(c)?.titre ?? c).join(' · ')}${aRevoir.length > 6 ? '…' : ''}` : 'Aucun chapitre marqué « À revoir » : reprenez les questions ratées', href: aRevoir.length ? `#/synthese/${aRevoir[0].split('.')[0]}?ch=${aRevoir.filter((c) => c.startsWith(aRevoir[0].split('.')[0] + '.')).join(',')}&reciter=1` : '#/reviser', lien: 'Revoir' });
    t.push({ id: 'erreurs', titre: 'Mes erreurs', detail: 'Questions ratées jusqu’à deux réussites consécutives', href: '#/reviser', lien: 'Erreurs' });
    t.push({ id: 'final', titre: 'Récitation finale', detail: j.n === 14 ? 'Tout le « par cœur » du semestre, une dernière fois' : 'Par cœur de chaque matière, puis les pièges', href: '#/syntheses/parcoeur', lien: 'Réciter' });
  }
  return t;
}

const PHASE = { apprendre: 'Apprendre', consolider: 'Consolider', final: 'Finaliser' } as const;

function Jour({ j, actuel }: { j: JourPlan; actuel: boolean }) {
  const p = useProgression();
  const aRevoir = Object.keys(p.marques).filter((k) => k.startsWith('synth:') && p.marques[k].aRevoir).map((k) => k.slice(6));
  const taches = tachesDuJour(j, aRevoir);
  const faites = taches.filter((t) => p.marques[`plan:${j.n}:${t.id}`]?.lu).length;
  return (
    <section class={`bloc plan-jour${actuel ? ' actuel' : ''}`} id={`jour-${j.n}`}>
      <header class="plan-jour-entete">
        <h2 class="rubrique">Jour {j.n} <span class="muted">· {PHASE[j.phase]}</span></h2>
        <span class="small muted">{faites}/{taches.length} fait{faites > 1 ? 's' : ''}</span>
      </header>
      <ul class="plan-taches">{taches.map((t) => {
        const k = `plan:${j.n}:${t.id}`;
        const fait = !!p.marques[k]?.lu;
        return (
          <li key={t.id} class={fait ? 'fait' : ''}>
            <label><input type="checkbox" checked={fait} onChange={() => store.marquer(k, 'lu', !fait, t.href.match(/synthese\/(\w+)/)?.[1])} />
              <span><span class="t">{t.titre}</span>{t.detail && <><br /><span class="small muted">{t.detail}</span></>}</span></label>
            <a class="btn discret" href={t.href}>{t.lien}</a>
          </li>
        );
      })}</ul>
    </section>
  );
}

export function Plan() {
  const p = useProgression();
  const plan = useMemo(() => construirePlan(index.matieres), []);
  const debut = p.preferences.planDebut;
  const n = jourDuPlan(debut);
  const [tout, setTout] = useState(false);
  const commencer = () => store.preferences((pr) => { pr.planDebut = Date.now(); });
  const recommencer = () => { if (confirm('Recommencer le plan à partir d’aujourd’hui ? Les cases cochées sont conservées.')) commencer(); };
  const affiches = !n || tout ? plan : plan.filter((j) => j.n === n);
  return (
    <>
      <Fil elements={[{ label: 'Étudier', href: '#/etudier' }, { label: 'Plan 14 jours' }]} />
      <p class="surtitre">Rappel actif · répétition espacée · alternance des matières</p>
      <h1 class="titre-page">{n ? `Plan 14 jours — jour ${n}` : 'Plan de révision en 14 jours'}</h1>
      <p class="chapeau">Les matières de l’emploi du temps, réparties en 10 jours d’apprentissage. Chaque jour : lire la synthèse des chapitres du jour, réciter sans regarder, appliquer, puis revoir ce qui a été appris la veille, trois jours et sept jours plus tôt. Jours 11 et 12 : par cœur et examens blancs. Jours 13 et 14 : points faibles et récitation finale.</p>
      <div class="ligne" style={{ gap: 12, flexWrap: 'wrap', marginBottom: 'var(--e4)' }}>
        {!debut ? <button class="btn" onClick={commencer}>Commencer aujourd’hui</button> : <>
          <button class="btn discret" onClick={() => setTout(!tout)}>{tout ? 'Seulement aujourd’hui' : 'Voir les 14 jours'}</button>
          <button class="btn discret" onClick={recommencer}>Recommencer à partir d’aujourd’hui</button>
        </>}
        <a class="btn discret" href="#/syntheses">Toutes les synthèses</a>
      </div>
      {affiches.map((j) => <Jour key={j.n} j={j} actuel={j.n === n} />)}
    </>
  );
}
