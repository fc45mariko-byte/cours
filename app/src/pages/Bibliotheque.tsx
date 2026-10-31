import { useState } from 'preact/hooks';
import { index, LIBELLE_LANGUE } from '../data';
import { useProgression } from '../hooks';
import { Jauge } from '../ui/communs';
import { Motif } from '../ui/visuels';
import { statutsPerimetre } from '../jeu';
import type { Langue, MatiereCatalogue } from '../types';

export function Couverture({ m }: { m: MatiereCatalogue }) {
  const p = useProgression();
  if (m.completude === 'absente') {
    return (
      <a class="couverture absente ton-mint" href={`#/matiere/${m.id}`}>
        <span class="couv-meta"><span>{m.categorie}</span><span>Source attendue</span></span>
        <span class="couv-titre" lang={m.langue}>{m.titre}</span>
        <span class="couv-meta"><span>Matière absente du dépôt</span></span>
      </a>
    );
  }
  const s = statutsPerimetre(m.id, p);
  const acquis = s.parStatut.compris.length + s.parStatut.maitrise.length;
  return (
    <a class={`couverture ton-${m.couleur}`} href={`#/matiere/${m.id}`}>
      <Motif categorie={m.categorie} graine={m.id} />
      <span class="couv-meta"><span>{m.categorie}</span><span>{m.semestres.join(' · ') || 'Complément'}</span></span>
      <span>
        <span class="couv-titre" style={{ display: 'block' }} lang="fr">{m.titre}</span>
        <span class="couv-meta" style={{ marginBottom: 8 }}><span>{m.chapitres.length} chapitres · {s.ids.length} notions</span><span>{m.langue !== 'fr' ? LIBELLE_LANGUE[m.langue] : ''}</span></span>
        <Jauge valeur={s.ids.length ? (acquis / s.ids.length) * 100 : 0} label={`${acquis} notions comprises sur ${s.ids.length}`} />
      </span>
    </a>
  );
}

export function Bibliotheque() {
  const [langue, setLangue] = useState<'' | Langue>('');
  const ms = index.matieres.filter((m) => !langue || m.langue === langue);
  const groupes: { titre: string; texte: string; liste: MatiereCatalogue[] }[] = [
    { titre: 'Semestre 5', texte: 'Premier semestre de la L3', liste: ms.filter((m) => m.semestres.includes('S5')) },
    { titre: 'Semestre 6', texte: 'Second semestre, avec le stage', liste: ms.filter((m) => m.semestres.includes('S6')) },
    { titre: 'Compléments', texte: 'Hors maquette d’Orléans, signalés comme tels', liste: ms.filter((m) => m.statut === 'COMP') },
    { titre: 'À compléter', texte: 'Matières attendues dont le contenu manque', liste: ms.filter((m) => m.completude === 'absente') },
  ];
  return (
    <>
      <p class="surtitre">Licence 3 · LEA anglais-espagnol · parcours commerce international</p>
      <h1 class="titre-page">Bibliothèque</h1>
      <p class="chapeau">{index.matieres.filter((m) => m.completude !== 'absente').length} matières, {index.matieres.reduce((s, m) => s + m.chapitres.length, 0)} chapitres, {Object.keys(index.notions).length} notions. Chaque matière s’affiche dans sa langue d’enseignement.</p>
      <div class="ligne" style={{ margin: '16px 0 8px' }}>
        <form class="recherche" style={{ flex: '1 1 260px' }} action="#/recherche" onSubmit={(e) => { e.preventDefault(); const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value; location.hash = `#/recherche?q=${encodeURIComponent(q)}`; }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4" /></svg>
          <input type="search" name="q" placeholder="Rechercher une notion, un terme (FR, EN, ES)…" aria-label="Rechercher dans la bibliothèque" />
        </form>
      </div>
      <div class="puces" role="group" aria-label="Filtrer par langue d’enseignement">
        {([['', 'Toutes les langues'], ['fr', 'Français'], ['en', 'English'], ['es', 'Español']] as const).map(([v, l]) => (
          <button key={v} class="puce" aria-pressed={langue === v} onClick={() => setLangue(v)}>{l}</button>
        ))}
      </div>
      {groupes.filter((g) => g.liste.length).map((g) => (
        <section key={g.titre}>
          <div class="section-titre"><h2>{g.titre}</h2><span class="meta">{g.texte} · {g.liste.length}</span></div>
          <div class="bibliotheque">{g.liste.map((m) => <Couverture key={m.id} m={m} />)}</div>
        </section>
      ))}
    </>
  );
}
