import { index, matiere, matieresDisponibles } from '../data';
import { useProgression } from '../hooks';
import { Fil, Jauge, StatutPastille, ilYa } from '../ui/communs';
import { Anneau } from '../ui/visuels';
import { BADGES, joursActifs, niveau, quetes, serie, statutNotion, statutsPerimetre, xpTotale } from '../jeu';
import { LIBELLE_STATUT, ORDRE_STATUT, rangStatut } from '../core/statut';
import { jour } from '../core/store';
import { estimerSemestre } from '../notes';

const DEFINITIONS: Record<string, string> = {
  inexplore: 'aucune trace d’activité',
  decouvert: 'fiche ou publication ouverte',
  apprentissage: 'marquée « lu », ou premiers essais encore fragiles (moins de 40 %)',
  pratique: 'questions et exercices entre 40 et 75 % de réussite',
  compris: '75 % de réussite, ou déclarée « comprise » avec au moins 40 %',
  maitrise: '75 % ou plus, dont une réussite de niveau 2 ou 3, activité récente',
};

function NotesResume() {
  const p = useProgression();
  const { notes, moyenne } = estimerSemestre(p);
  return (
    <section class="bloc note-synthese">
      <div>
        <p class="meta">Notes estimées · si l’examen avait lieu aujourd’hui</p>
        <p class="note-valeur grande">{moyenne !== null ? <><strong>{moyenne.toLocaleString('fr-FR')}</strong><span>/20</span></> : <span class="muted">—</span>}</p>
      </div>
      <div>
        <p class="small">{notes.filter((n) => n.note !== null).map((n) => `${matiere(n.matiere)!.titre} ${n.note!.toLocaleString('fr-FR')}`).join(' · ') || 'Aucune matière estimée pour l’instant : un test rapide suffit.'}</p>
        <a class="btn" href="#/notes">Voir le détail par matière</a>
      </div>
    </section>
  );
}

export function Progres() {
  const p = useProgression();
  const xp = xpTotale(p);
  const nv = niveau(xp);
  const tous = statutsPerimetre('', p);
  const q = quetes(p);
  const jours = joursActifs(p);
  const journal = Object.entries(p.xp).sort((a, b) => b[1].t - a[1].t).slice(0, 12);
  const lusPub = Object.entries(p.marques).filter(([id, m]) => m.lu && !index.notions[id]).length;
  const chapOuverts = Object.keys(p.chapitres).length;
  const chapTermines = Object.values(p.chapitres).filter((c) => c.termine).length;
  const qcmTentatives = Object.values(p.qcm).reduce((s, t) => s + t.length, 0);
  const qcmJustes = Object.values(p.qcm).reduce((s, t) => s + t.filter((x) => x.ok).length, 0);

  // Calendrier des 16 dernières semaines (colonnes = semaines, lignes = lundi → dimanche).
  const aujourdhui = new Date(); aujourdhui.setHours(12, 0, 0, 0);
  const lundi = new Date(aujourdhui); lundi.setDate(lundi.getDate() - ((lundi.getDay() + 6) % 7) - 15 * 7);
  const cases = Array.from({ length: 16 * 7 }, (_, i) => {
    const d = new Date(lundi); d.setDate(d.getDate() + i);
    const cle = jour(d.getTime());
    const n = Object.values(p.activite[cle] ?? {}).reduce((s, x) => s + x, 0) + (jours.has(cle) ? 1 : 0);
    return { cle, n, futur: d > aujourdhui };
  });

  return (
    <>
      <p class="surtitre">Ce que vous avez réellement appris</p>
      <h1 class="titre-page">Progrès</h1>

      <section class="niveau-carte">
        <div style={{ position: 'relative', width: 132, height: 132 }}>
          <Anneau part={nv.depuis / nv.pour} libelle={`Niveau ${nv.niveau} : ${nv.depuis} XP sur ${nv.pour} pour le niveau suivant`} />
          <span class="grand" style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: '3.4rem' }}>{nv.niveau}</span>
        </div>
        <div>
          <p class="meta">Niveau {nv.niveau}</p>
          <p style={{ fontFamily: 'var(--serif)', fontSize: '1.6rem', margin: '0 0 6px' }}>{xp} XP</p>
          <p class="small muted">{nv.pour - nv.depuis} XP avant le niveau {nv.niveau + 1}. L’XP récompense des activités vérifiables (réponses justes, exercices réussis, chapitres terminés, notions maîtrisées) ; une même action n’est comptée qu’une fois.</p>
        </div>
      </section>

      <NotesResume />

      <div class="section-titre"><h2>Notions</h2><span class="meta">{tous.ids.length} au programme</span></div>
      <div class="chiffres">
        {ORDRE_STATUT.map((s) => <div class="chiffre" key={s}><b>{tous.parStatut[s].length}</b><span>{LIBELLE_STATUT[s]}</span></div>)}
      </div>
      <details class="small" style={{ marginTop: 8 }}><summary>Comment les statuts sont calculés</summary>
        <ul>{ORDRE_STATUT.map((s) => <li key={s}><StatutPastille s={s} /> : {DEFINITIONS[s]}</li>)}</ul>
        <p>Ouvrir ou faire défiler ne suffit jamais à « comprendre » ou « maîtriser » : seuls les résultats et vos marques explicites comptent.</p>
      </details>

      <div class="section-titre"><h2>Par matière</h2><span class="meta">notions maîtrisées, comprises, pratiquées</span></div>
      <div class="barres-matieres">
        {matieresDisponibles().map((m) => {
          const s = statutsPerimetre(m.id, p);
          const t = s.ids.length || 1;
          const w = (n: number) => `${(n / t) * 100}%`;
          return (
            <div class="ligne-m" key={m.id}>
              <a href={`#/progres/arbre/${m.id}`}>{m.titre}</a>
              <div class="pile" role="img" aria-label={`${m.titre} : ${s.parStatut.maitrise.length} maîtrisées, ${s.parStatut.compris.length} comprises, ${s.parStatut.pratique.length} pratiquées sur ${s.ids.length}`}>
                {s.parStatut.maitrise.length > 0 && <span class="s-maitrise" style={{ width: w(s.parStatut.maitrise.length) }} title={`${s.parStatut.maitrise.length} maîtrisées`} />}
                {s.parStatut.compris.length > 0 && <span class="s-compris" style={{ width: w(s.parStatut.compris.length) }} title={`${s.parStatut.compris.length} comprises`} />}
                {s.parStatut.pratique.length > 0 && <span class="s-pratique" style={{ width: w(s.parStatut.pratique.length) }} title={`${s.parStatut.pratique.length} pratiquées`} />}
                <span class="s-reste" />
              </div>
              <span class="small muted">{s.parStatut.maitrise.length + s.parStatut.compris.length}/{s.ids.length}</span>
            </div>
          );
        })}
      </div>
      <div class="legende"><span><i style={{ background: 'var(--donnee)' }} />Maîtrisées</span><span><i style={{ background: 'color-mix(in srgb, var(--donnee) 60%, var(--donnee-fond))' }} />Comprises</span><span><i style={{ background: 'color-mix(in srgb, var(--donnee) 30%, var(--donnee-fond))' }} />Pratiquées</span><span>Cliquez sur une matière pour son arbre de compétences.</span></div>

      <div class="section-titre"><h2>Activité</h2></div>
      <div class="chiffres">
        <div class="chiffre"><b>{chapOuverts}</b><span>chapitres ouverts</span></div>
        <div class="chiffre"><b>{chapTermines}</b><span>chapitres terminés</span></div>
        <div class="chiffre"><b>{lusPub}</b><span>publications lues</span></div>
        <div class="chiffre"><b>{qcmTentatives ? Math.round((qcmJustes / qcmTentatives) * 100) : 0} %</b><span>réussite aux QCM ({qcmTentatives})</span></div>
        <div class="chiffre"><b>{p.examensPasses.length}</b><span>examens blancs</span></div>
      </div>

      <div class="section-titre"><h2>Régularité</h2><span class="meta">série : {serie(p)} jour{serie(p) > 1 ? 's' : ''} · {jours.size} jours actifs</span></div>
      <div class="calendrier" role="img" aria-label={`Calendrier d’activité des seize dernières semaines : ${cases.filter((c) => c.n > 0).length} jours actifs`}>
        {cases.map((c) => <span key={c.cle} class={c.futur ? 'futur' : c.n >= 8 ? 'n3' : c.n >= 3 ? 'n2' : c.n > 0 ? 'n1' : ''} title={`${c.cle} : ${c.n} activité${c.n > 1 ? 's' : ''}`} />)}
      </div>
      <p class="small muted">Un jour de pause isolé n’interrompt pas la série. Rien n’est perdu les jours sans activité.</p>

      <div class="section-titre"><h2>Quêtes</h2></div>
      <div class="colonnes-accueil" style={{ gap: 32 }}>
        {(['jour', 'semaine'] as const).map((per) => (
          <div key={per}>
            <p class="meta">{per === 'jour' ? 'Aujourd’hui' : 'Cette semaine'}</p>
            <ul class="quetes">{q.filter((x) => x.periode === per).map((x) => (
              <li key={x.id} class={x.fait >= x.but ? 'faite' : ''}>
                <a class="q-titre" href={x.lien}>{x.titre}</a><span class="q-xp">{x.fait >= x.but ? '✓ ' : `${Math.min(x.fait, x.but)}/${x.but} · `}{x.xp} XP</span>
                <Jauge valeur={(Math.min(x.fait, x.but) / x.but) * 100} label={`${Math.min(x.fait, x.but)} sur ${x.but}`} />
                <span class="q-detail">{x.detail}</span>
              </li>
            ))}</ul>
          </div>
        ))}
      </div>

      <div class="section-titre"><h2>Collection</h2><span class="meta">{Object.keys(p.badges).length} / {BADGES.length}</span></div>
      <div class="badges">{BADGES.map((b) => {
        const t = p.badges[b.id];
        const recent = t && Date.now() - t < 86_400_000;
        return (
          <div key={b.id} class={`medaille${t ? '' : ' verrouillee'}${recent ? ' nouvelle' : ''}`}>
            <div class="sceau" aria-hidden="true">{b.motif}</div>
            <h4>{b.titre}</h4><p>{b.description}</p>
            <p>{t ? `Obtenu ${ilYa(t)}` : 'À obtenir'}</p>
          </div>
        );
      })}</div>

      <div class="section-titre"><h2>Journal</h2><span class="meta">derniers gains</span></div>
      {journal.length === 0 ? <p class="muted">Rien encore : répondez à quelques questions pour commencer.</p> : (
        <ul class="liste-editoriale">{journal.map(([k, e]) => (
          <li key={k}><a href={k.startsWith('qcm:') || k.startsWith('compris:') || k.startsWith('maitrise:') ? `#/notion/${k.startsWith('qcm:') ? index.questions.find((x) => x.id === k.slice(4))?.notion ?? '' : k.split(':')[1]}` : '#/progres'}>
            <span class="num">+{e.xp}</span><span class="t">{e.motif}</span><span class="m">{ilYa(e.t)}</span></a></li>
        ))}</ul>
      )}
      {p.examensPasses.length > 0 && (
        <>
          <div class="section-titre"><h2>Historique des examens</h2></div>
          <ul class="liste-editoriale">{[...p.examensPasses].reverse().slice(0, 8).map((e) => (
            <li key={e.id}><a href={`#/examen?p=${e.filtre}`}><span class="num">{e.total ? Math.round((e.score / e.total) * 100) : 0} %</span><span class="t">{e.filtre ? (matiere(e.filtre.split('.')[0])?.titre ?? e.filtre) : 'Toutes les matières'}</span><span class="m">{ilYa(e.t)}</span></a></li>
          ))}</ul>
        </>
      )}
    </>
  );
}

/** Arbre de compétences : chapitres en branches, notions en nœuds, liens de prérequis réels. */
export function Arbre({ id }: { id: string }) {
  const p = useProgression();
  const m = matiere(id);
  if (!m) return <div class="vide">Matière introuvable.</div>;
  const s = statutsPerimetre(m.id, p);
  const debloquee = (n: string) => (index.notions[n].prerequis ?? []).every((x) => !index.notions[x] || rangStatut(statutNotion(x, p)) >= rangStatut('apprentissage'));
  return (
    <>
      <Fil elements={[{ label: 'Progrès', href: '#/progres' }, { label: m.titre, href: `#/matiere/${m.id}` }, { label: 'Arbre de compétences' }]} />
      <p class="surtitre">Arbre de compétences</p>
      <h1 class="titre-page">{m.titre}</h1>
      <p class="chapeau">Chaque branche est un chapitre du cours, chaque nœud une notion. Une notion est maîtrisée seulement après une évaluation réussie.</p>
      <div class="chiffres">{(['inexplore', 'decouvert', 'pratique', 'compris', 'maitrise'] as const).map((k) => <div class="chiffre" key={k}><b>{s.parStatut[k].length + (k === 'decouvert' ? s.parStatut.apprentissage.length : 0)}</b><span>{k === 'decouvert' ? 'découvertes ou en cours' : LIBELLE_STATUT[k]}</span></div>)}</div>
      <div class={`arbre ton-${m.couleur}`} style={{ marginTop: 32 }} lang={m.langue}>
        {m.chapitres.map((c) => (
          <div class="branche" key={c.id}>
            <h3><a href={`#/chapitre/${c.id}`} style={{ textDecoration: 'none' }}>{c.titre}</a></h3>
            <ul class="noeuds">{c.notions.map((n) => {
              const st = statutNotion(n.id, p);
              const pre = (index.notions[n.id].prerequis ?? []).filter((x) => index.notions[x]);
              return (
                <li key={n.id} class={`noeud s-${st}`}>
                  <a href={`#/notion/${n.id}`}>{index.notions[n.id].titre}
                    <span style={{ display: 'block' }} lang="fr"><StatutPastille s={st} /></span>
                    {pre.length > 0 && <span class="prereq" lang="fr">{debloquee(n.id) ? 'Prérequis vus' : 'Prérequis conseillés'} : {pre.map((x) => index.notions[x].titre).join(', ')}</span>}
                  </a>
                </li>
              );
            })}</ul>
            <a class="small" lang="fr" href={`#/etudier/session?p=${c.id}`}>Évaluer ce chapitre →</a>
          </div>
        ))}
      </div>
    </>
  );
}
