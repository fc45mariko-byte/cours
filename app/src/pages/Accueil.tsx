import { chargerFil, chapitreCatalogue, index, matiere, matieresDisponibles } from '../data';
import { useAsync, useProgression } from '../hooks';
import { Charge, Jauge, StatutPastille, ilYa } from '../ui/communs';
import { Motif } from '../ui/visuels';
import { LIBELLE_TYPE } from '../ui/Publication';
import { Couverture } from './Bibliotheque';
import { niveau, quetes, serie, statutNotion, xpTotale, statutsPerimetre } from '../jeu';
import { matieresSuivies } from '../classement';
import { hacher } from '../core/hasard';
import { jour } from '../core/store';
import { rangStatut } from '../core/statut';
import type { Publication } from '../types';
import { construirePlan, jourDuPlan } from '../plan';

function salutation() {
  const h = new Date().getHours();
  return h < 5 ? 'Bonne nuit' : h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir';
}

function ALaUne({ fil }: { fil: Publication[] }) {
  const candidats = fil.filter((x) => x.edito || x.type === 'dossier');
  const pub = candidats[hacher(jour(Date.now())) % candidats.length];
  if (!pub) return null;
  const m = matiere(pub.m)!;
  const chap = pub.c ? chapitreCatalogue(pub.c) : undefined;
  const num = chap ? m.chapitres.findIndex((c) => c.id === chap.id) + 1 : 0;
  return (
    <section class={`une ton-${m.couleur}`} aria-label="À la une">
      <div>
        <p class="surtitre"><span class="ton-trait">À la une</span><span>{LIBELLE_TYPE[pub.type]}</span><span>{pub.edito ? 'Monde et économie' : m.titre}</span><span>{pub.min} min</span></p>
        <h2 class="display" style={{ fontSize: 'clamp(2.2rem, 6vw, 4rem)' }} lang={pub.l}><a href={`#/pub/${encodeURIComponent(pub.id)}`} style={{ textDecoration: 'none' }}>{pub.t}</a></h2>
        <p class="chapeau" lang={pub.l}>{pub.x}</p>
        <a class="btn" href={`#/pub/${encodeURIComponent(pub.id)}`}>{pub.type === 'dossier' ? 'Lire le dossier' : 'Lire l’article'}</a>
      </div>
      <a class="visuel" href={`#/pub/${encodeURIComponent(pub.id)}`} aria-hidden="true" tabIndex={-1}>
        <Motif categorie={m.categorie} graine={pub.id} />
        {num > 0 && <span class="grand">{String(num).padStart(2, '0')}</span>}
      </a>
    </section>
  );
}

function CartePlan() {
  const p = useProgression();
  const n = jourDuPlan(p.preferences.planDebut);
  const plan = construirePlan(index.matieres);
  const j = n ? plan[n - 1] : plan[0];
  const ms = [...new Set([...j.nouveaux.map((b) => b.matiere), ...j.matieres])].map((id) => matiere(id)?.titre).filter(Boolean);
  return (
    <section class="bloc carte-plan" aria-label="Plan de révision">
      <p class="surtitre"><span class="ton-trait">{n ? `Plan 14 jours · jour ${n}` : 'Plan 14 jours'}</span><span>synthèse · récitation · révisions espacées</span></p>
      <p style={{ margin: '4px 0 12px' }}>{n ? <>Aujourd’hui : <strong>{ms.join(', ') || 'récitation finale'}</strong>{j.revisions.length ? `, et les révisions des jours ${j.revisions.map((r) => r.jour).join(', ')}` : ''}.</> : <>Apprendre les {plan.flatMap((x) => x.nouveaux).reduce((s, b) => s + b.chapitres.length, 0)} chapitres du semestre en 14 jours, avec des synthèses courtes et de la récitation.</>}</p>
      <div class="ligne" style={{ gap: 12, flexWrap: 'wrap' }}><a class="btn" href="#/plan">{n ? 'Voir les tâches du jour' : 'Découvrir le plan'}</a><a class="btn discret" href="#/syntheses">Synthèses</a></div>
    </section>
  );
}

export function Accueil() {
  const p = useProgression();
  const c = useAsync(() => chargerFil(), []);
  const nv = niveau(xpTotale(p));
  const q = quetes(p).filter((x) => x.periode === 'jour');
  const aujourdhui = Object.values(p.activite[jour(Date.now())] ?? {}).reduce((s, n) => s + n, 0);
  const tous = statutsPerimetre('', p);
  const compris = tous.parStatut.compris.length + tous.parStatut.maitrise.length;
  const suivies = matieresSuivies(p);
  const edt = matieresDisponibles().filter((m) => m.emploiDuTemps);
  const enCours = edt.length ? edt : (suivies.length ? suivies.map((id) => matiere(id)!).filter(Boolean) : matieresDisponibles().filter((m) => m.semestres.includes('S5')));
  const recents = Object.entries(p.chapitres).sort((a, b) => b[1].ouvert - a[1].ouvert).slice(0, 5);
  const derniere = p.historique[0];
  const dernierChap = recents[0];

  return (
    <>
      <p class="surtitre">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · L3 LEA anglais-espagnol, commerce international</p>
      <h1 class="display">{salutation()}.<br /><em>Qu’apprend-on aujourd’hui ?</em></h1>

      <CartePlan />

      <Charge c={c}>{(fil) => <ALaUne fil={fil} />}</Charge>

      <div class="colonnes-accueil">
        <div>
          {(derniere || dernierChap) && (
            <>
              <div class="section-titre"><h2>Reprendre</h2></div>
              <ul class="liste-editoriale">
                {dernierChap && (() => {
                  const ch = chapitreCatalogue(dernierChap[0]);
                  const pos = p.lecture.chapitres[dernierChap[0]]?.notion;
                  return ch ? <li><a href={`#/chapitre/${ch.id}${pos ? `?n=${pos}` : ''}`}><span class="num">Ch.</span><span class="t">{ch.titre}</span><span class="m">{ilYa(dernierChap[1].ouvert)}</span></a></li> : null;
                })()}
                <Charge c={c}>{(fil) => {
                  const pub = derniere && fil.find((x) => x.id === derniere.id);
                  return pub ? <li><a href={`#/pub/${encodeURIComponent(pub.id)}`}><span class="num">Fil</span><span class="t" lang={pub.l}>{pub.t}</span><span class="m">{ilYa(derniere.t)}</span></a></li> : null;
                }}</Charge>
              </ul>
            </>
          )}

          <div class="section-titre"><h2>Concepts recommandés</h2><a href="#/fil">Tout le fil →</a></div>
          <Charge c={c}>{(fil) => {
            const aRevoir = fil.filter((x) => x.type === 'concept' && p.marques[x.id]?.aRevoir);
            const autres = fil.filter((x) => x.type === 'concept' && (!suivies.length || suivies.includes(x.m)) && x.n && rangStatut(statutNotion(x.n, p)) < rangStatut('compris') && !p.marques[x.id]?.aRevoir);
            const debut = hacher(jour(Date.now())) % Math.max(1, autres.length - 5);
            const choix = [...aRevoir.slice(0, 2), ...autres.slice(debut, debut + 5)].slice(0, 5);
            return (
              <ul class="liste-editoriale">{choix.map((x, i) => (
                <li key={x.id}><a href={`#/pub/${encodeURIComponent(x.id)}`}><span class="num">{String(i + 1).padStart(2, '0')}</span>
                  <span><span class="t" lang={x.l}>{x.t}</span><br /><span class="small muted">{matiere(x.m)?.titre}{p.marques[x.id]?.aRevoir ? ' · à revoir' : ''}</span></span>
                  {x.n && <StatutPastille s={statutNotion(x.n, p)} />}</a></li>
              ))}</ul>
            );
          }}</Charge>

          {recents.length > 1 && (
            <>
              <div class="section-titre"><h2>Chapitres récemment ouverts</h2></div>
              <ul class="liste-editoriale">{recents.map(([id, v]) => {
                const ch = chapitreCatalogue(id);
                const m = matiere(id.split('.')[0]);
                return ch ? <li key={id}><a href={`#/chapitre/${id}`}><span class="num">{v.termine ? '✓' : '·'}</span><span class="t">{ch.titre}<br /><span class="small muted">{m?.titre}</span></span><span class="m">{ilYa(v.ouvert)}</span></a></li> : null;
              })}</ul>
            </>
          )}
        </div>

        <aside>
          <div class="section-titre"><h2>Aujourd’hui</h2><span class="meta">{aujourdhui} activité{aujourdhui > 1 ? 's' : ''}</span></div>
          <ul class="quetes">{q.map((x) => (
            <li key={x.id} class={x.fait >= x.but ? 'faite' : ''}>
              <a class="q-titre" href={x.lien}>{x.titre}</a><span class="q-xp">{x.fait >= x.but ? '✓ ' : ''}{x.xp} XP</span>
              <Jauge valeur={(Math.min(x.fait, x.but) / x.but) * 100} label={`${Math.min(x.fait, x.but)} sur ${x.but}`} />
              <span class="q-detail">{x.detail}</span>
            </li>
          ))}</ul>
          <p class="small muted" style={{ marginTop: 8 }}>Les quêtes se renouvellent chaque jour ; une journée sans activité ne fait rien perdre.</p>

          <div class="section-titre"><h2>Ma progression</h2><a href="#/progres">Détails →</a></div>
          <div class="chiffres">
            <div class="chiffre"><b>{nv.niveau}</b><span>niveau</span></div>
            <div class="chiffre"><b>{nv.xp}</b><span>XP</span></div>
            <div class="chiffre"><b>{compris}</b><span>notions comprises</span></div>
            <div class="chiffre"><b>{serie(p)}</b><span>jours de suite</span></div>
          </div>
          <Jauge valeur={(nv.depuis / nv.pour) * 100} label={`Niveau suivant : ${nv.depuis} sur ${nv.pour} XP`} />
          <p class="small muted">{nv.pour - nv.depuis} XP avant le niveau {nv.niveau + 1}.</p>

          {Object.keys(p.enregistres).length > 0 && (
            <>
              <div class="section-titre"><h2>Enregistrés</h2><a href="#/fil?onglet=enregistres">Tout voir →</a></div>
              <Charge c={c}>{(fil) => (
                <ul class="liste-editoriale">{Object.entries(p.enregistres).sort((a, b) => b[1].t - a[1].t).slice(0, 4).map(([id]) => {
                  const x = fil.find((y) => y.id === id) ?? (index.notions[id] ? { id: `concept:${id}`, t: index.notions[id].titre, type: 'concept', l: 'fr' } as Publication : undefined);
                  return x ? <li key={id}><a href={index.notions[id] ? `#/notion/${id}` : `#/pub/${encodeURIComponent(x.id)}`}><span class="num">☆</span><span class="t" lang={x.l}>{x.t}</span><span class="m">{LIBELLE_TYPE[x.type]}</span></a></li> : null;
                })}</ul>
              )}</Charge>
            </>
          )}
        </aside>
      </div>

      <div class="section-titre"><h2>{edt.length ? 'Au programme ce semestre' : suivies.length ? 'Mes matières' : 'Matières du semestre 5'}</h2><a href="#/bibliotheque">Bibliothèque →</a></div>
      <div class="bibliotheque">{enCours.map((m) => <Couverture key={m!.id} m={m!} />)}</div>
    </>
  );
}
