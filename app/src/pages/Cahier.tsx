import { useState } from 'preact/hooks';
import { chargerCahier, index, LIBELLE_LANGUE, matiere, matieresDisponibles } from '../data';
import { useAsync, useProgression } from '../hooks';
import { store } from '../core/store';
import { Charge, Fil, Texte } from '../ui/communs';
import { lib } from '../i18n';
import type { Cahier as C, ExerciceCahier, MatiereCatalogue } from '../types';

const pdf = (m: string, complet: boolean) => `./imprimables/${complet ? 'complet/' : ''}${m}.pdf`;

/** Version express : un exercice par chapitre (de préférence d'application), méthode et rappel resserrés. */
export function versionExpress(c: C): C {
  return {
    ...c,
    sections: c.sections.map((s) => {
      const e = s.exercices.find((x) => x.niveau === 'application') ?? s.exercices[0];
      return { ...s, rappel: [], exercices: e ? [{ ...e, methode: [], lignes: Math.min(e.lignes ?? 6, 3) }] : [] };
    }),
  };
}

/** Liste des cahiers : d'abord les matières de l'emploi du temps. */
export function Cahiers() {
  const p = useProgression();
  const dispo = new Map(index.cahiers.map((c) => [c.matiere, c]));
  const ligne = (m: MatiereCatalogue) => {
    const c = dispo.get(m.id);
    const faits = c ? Object.keys(p.marques).filter((k) => k.startsWith(`cahier:${m.id}-`) && p.marques[k].lu).length : 0;
    return (
      <li key={m.id}>
        {c ? (
          <a href={`#/cahier/${m.id}`}>
            <span class="num">{m.emploiDuTemps ? m.emploiDuTemps.seances.join('+') : '·'}</span>
            <span><span class="t">{m.titre}</span><br /><span class="small muted">{c.sections} parties · {c.exercices} exercices{m.langue !== 'fr' ? ` · ${LIBELLE_LANGUE[m.langue]}` : ''}{faits ? ` · ${faits} faits` : ''}</span></span>
            <span class="m">Ouvrir</span>
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
      <Fil elements={[{ label: 'Étudier', href: '#/etudier' }, { label: 'Cahiers d’exercices' }]} />
      <p class="surtitre">À imprimer · bases, méthode, application, corrigés expliqués</p>
      <h1 class="titre-page">Cahiers d’exercices</h1>
      <p class="chapeau">Par défaut, la version express : un exercice d’application par chapitre, avec son corrigé, pour vérifier vite que le cours est compris. La version complète reste disponible dans chaque cahier.</p>
      <div class="section-titre"><h2>Au programme ce semestre</h2><span class="meta">emploi du temps · S5</span></div>
      <ul class="liste-editoriale">{edt.map(ligne)}</ul>
      <div class="section-titre"><h2>Autres matières</h2></div>
      <ul class="liste-editoriale">{autres.map(ligne)}</ul>
    </>
  );
}

function Lignes({ n }: { n: number }) {
  if (!n) return null;
  return <div class="lignes-reponse" aria-hidden="true">{Array.from({ length: n }, (_, i) => <span key={i} />)}</div>;
}

function Exercice({ e, num, L, matiereId }: { e: ExerciceCahier; num: string; L: ReturnType<typeof lib>; matiereId: string }) {
  const p = useProgression();
  const fait = !!p.marques[`cahier:${e.id}`]?.lu;
  return (
    <article class="exo" id={e.id}>
      <header class="exo-entete">
        <span class="exo-num">{L.exerciceCahier} {num}</span>
        <span class={`exo-niveau niv-${e.niveau}`}>{L.niveauxCahier[e.niveau]}</span>
        {e.fictif && <span class="tag-fictif">{L.situationFictive}</span>}
      </header>
      <h3 class="exo-titre">{e.titre}</h3>
      <p class="exo-objectif"><strong>{L.objectif} : </strong>{e.objectif}</p>
      <div class="exo-enonce"><Texte t={e.enonce} /></div>
      {e.donnees && (
        <div class="tableau-wrap"><table>
          <thead><tr>{e.donnees.entetes.map((h, i) => <th key={i} scope="col">{h}</th>)}</tr></thead>
          <tbody>{e.donnees.lignes.map((l, i) => <tr key={i}>{l.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table></div>
      )}
      {e.methode.length > 0 && <div class="exo-methode"><strong>{L.methode}</strong><ol>{e.methode.map((m, i) => <li key={i}><Texte t={m} /></li>)}</ol></div>}
      <div class="exo-questions"><strong>{L.questionsCahier}</strong><ul>{e.questions.map((q, i) => <li key={i}><Texte t={q} /></li>)}</ul></div>
      <Lignes n={e.lignes ?? 6} />
      <label class="exo-fait ecran-seul" lang="fr"><input type="checkbox" checked={fait} onChange={() => store.marquer(`cahier:${e.id}`, 'lu', !fait, matiereId)} /> J’ai fait cet exercice</label>
    </article>
  );
}

function Rendu({ c, complet }: { c: C; complet: boolean }) {
  const m = matiere(c.matiere)!;
  const L = lib(m.langue);
  const [corriges, setCorriges] = useState(true);
  const numeros = new Map<string, string>();
  c.sections.forEach((s, i) => s.exercices.forEach((e, j) => numeros.set(e.id, `${i + 1}.${j + 1}`)));
  const total = c.sections.reduce((s, x) => s + x.exercices.length, 0);
  return (
    <div class={`cahier ton-${m.couleur}${corriges ? '' : ' sans-corriges'}${complet ? '' : ' express'}`} lang={m.langue}>
      <div class="outils-impression ecran-seul" lang="fr">
        <button class="btn" onClick={() => window.print()}>Imprimer</button>
        <label class="criteres"><span style={{ display: 'flex', gap: 8 }}><input type="checkbox" checked={corriges} onChange={() => setCorriges(!corriges)} />Inclure les corrigés</span></label>
        <span class="puces" role="group" aria-label="Format">
          <a class="puce" aria-pressed={!complet} href={`#/cahier/${c.matiere}`}>Express · 1 exercice par chapitre</a>
          <a class="puce" aria-pressed={complet} href={`#/cahier/${c.matiere}?format=complet`}>Complet</a>
        </span>
        {import.meta.env.PROD && <a class="btn discret" href={pdf(c.matiere, complet)} download>PDF</a>}
        <a class="btn discret" href={`#/synthese/${c.matiere}`}>Synthèse</a>
      </div>

      <section class="cahier-couverture">
        <p class="surtitre" lang="fr"><span>L3 LEA · {m.semestres.join(' · ') || 'Complément'}</span>{m.enseignant && <span>{m.enseignant}</span>}{m.code && <span>{m.code}</span>}</p>
        <p class="cahier-matiere" lang="fr">{m.titre}</p>
        <h1 class="titre-page">{c.titre}</h1>
        {!complet && <p class="surtitre" lang="fr">Version express · un exercice d’application par chapitre</p>}
        <p class="meta">{c.sections.length} · {total} {L.exerciceCahier.toLowerCase()}s</p>
        {complet && <h2 class="rubrique">{L.modeEmploi}</h2>}
        {complet && <p><Texte t={c.introduction} /></p>}
        {complet && <p class="small legende-niveaux">{(['bases', 'application', 'approfondissement'] as const).map((n) => <span key={n} class={`exo-niveau niv-${n}`}>{L.niveauxCahier[n]}</span>)}</p>}
        {complet && <h2 class="rubrique">{L.sommaire}</h2>}
        {complet && <ol class="sommaire-cahier">{c.sections.map((s) => <li key={s.id}><span>{s.titre}</span><span class="muted">{s.exercices.map((e) => numeros.get(e.id)).join(', ')}</span></li>)}</ol>}
        <p class="small muted" lang="fr">Exercices rédigés pour l’application à partir des fiches du cours ; les situations marquées « fictive » sont inventées. En cas de différence avec le cours de l’enseignant, c’est le cours qui fait foi.</p>
      </section>

      {c.sections.map((s, i) => (
        <section class="cahier-partie" key={s.id}>
          <h2 class="partie-titre"><span>{L.partieCahier} {i + 1}</span>{s.titre}</h2>
          {s.rappel.length > 0 && <div class="a-retenir"><strong>{L.aRetenir}</strong><ul>{s.rappel.map((r, k) => <li key={k}><Texte t={r} /></li>)}</ul></div>}
          {s.exercices.map((e) => <Exercice key={e.id} e={e} num={numeros.get(e.id)!} L={L} matiereId={m.id} />)}
        </section>
      ))}

      <section class="corriges">
        <h2 class="partie-titre"><span>{c.titre}</span>{L.corriges}</h2>
        {c.sections.map((s) => s.exercices.map((e) => (
          <article class="corrige" key={e.id}>
            <h3>{L.exerciceCahier} {numeros.get(e.id)} · {e.titre}</h3>
            <ol>{e.corrige.map((x, k) => <li key={k}><Texte t={x} /></li>)}</ol>
            {e.erreurs?.length ? <p class="small"><strong>{L.pieges} : </strong>{e.erreurs.join(' · ')}</p> : null}
          </article>
        )))}
      </section>
    </div>
  );
}

export function Cahier({ id, params }: { id: string; params?: URLSearchParams }) {
  const complet = params?.get('format') === 'complet';
  const m = matiere(id);
  const c = useAsync(() => chargerCahier(id), [id]);
  if (!m) return <div class="vide">Matière introuvable.</div>;
  return (
    <>
      <div class="ecran-seul"><Fil elements={[{ label: 'Étudier', href: '#/etudier' }, { label: 'Cahiers d’exercices', href: '#/cahiers' }, { label: m.titre }]} /></div>
      {m.completude === 'absente'
        ? <div class="encadre attention"><p>{m.noteCompletude}</p></div>
        : <Charge c={c}>{(x) => <Rendu c={complet ? x : versionExpress(x)} complet={complet} key={String(complet)} />}</Charge>}
    </>
  );
}
