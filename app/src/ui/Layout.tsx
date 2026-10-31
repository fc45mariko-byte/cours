import type { ComponentChildren } from 'preact';
import { Icone } from './Icone';
import { useProgression } from '../hooks';
import { index } from '../data';
import { estDue } from '../core/srs';
import { niveau, xpTotale } from '../jeu';
import { Jauge } from './communs';

export const NAV = [
  { href: '#/', id: 'accueil', label: 'Accueil', icone: 'accueil' },
  { href: '#/fil', id: 'fil', label: 'Fil', icone: 'fil' },
  { href: '#/bibliotheque', id: 'bibliotheque', label: 'Bibliothèque', icone: 'bibliotheque' },
  { href: '#/etudier', id: 'etudier', label: 'Étudier', icone: 'etudier' },
  { href: '#/progres', id: 'progres', label: 'Progrès', icone: 'progres' },
];

export function Layout({ section, lecture, children }: { section: string; lecture?: boolean; children: ComponentChildren }) {
  const p = useProgression();
  const dues = index.flashcards.filter((f) => p.cartes[f.id] && estDue(p.cartes[f.id])).length + Object.keys(p.erreurs).length;
  const nv = niveau(xpTotale(p));
  return (
    <div class={p.preferences.animations ? '' : 'sans-animation'}>
      <a class="skip" href="#contenu" onClick={(e) => { e.preventDefault(); document.getElementById('contenu')?.focus(); }}>Aller au contenu</a>
      <header class="entete-mobile">
        <a class="marque" href="#/" aria-label="LEA, The Learning Journal : accueil"><b>LEA</b><span>The Learning Journal</span></a>
        <div class="icones">
          <a href="#/recherche" aria-label="Rechercher" aria-current={section === 'recherche' ? 'page' : undefined}><Icone nom="recherche" taille={22} /></a>
          <a href="#/reglages" aria-label="Réglages" aria-current={section === 'reglages' ? 'page' : undefined}><Icone nom="reglages" taille={22} /></a>
        </div>
      </header>
      <div class="shell">
        <aside class="barre" aria-label="Navigation principale">
          <a class="marque" href="#/"><b>LEA</b><span>The Learning Journal</span></a>
          <nav>
            {NAV.map((n, i) => (
              <a key={n.id} class="lien-nav" href={n.href} aria-current={section === n.id ? 'page' : undefined}>
                <span class="num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{n.label}
                {n.id === 'etudier' && dues > 0 && <span class="compte" title="Cartes et erreurs à revoir">{dues}</span>}
              </a>
            ))}
          </nav>
          <div class="outils">
            <a href="#/recherche" aria-current={section === 'recherche' ? 'page' : undefined}><Icone nom="recherche" taille={16} />Rechercher</a>
            <a href="#/glossaire" aria-current={section === 'glossaire' ? 'page' : undefined}><Icone nom="glossaire" taille={16} />Glossaire</a>
            <a href="#/reglages" aria-current={section === 'reglages' ? 'page' : undefined}><Icone nom="reglages" taille={16} />Réglages et sauvegarde</a>
            <a class="niveau-mini" href="#/progres">Niveau {nv.niveau} · {nv.xp} XP
              <Jauge valeur={(nv.depuis / nv.pour) * 100} label={`${nv.depuis} XP sur ${nv.pour} pour le niveau suivant`} /></a>
          </div>
        </aside>
        <main id="contenu" tabIndex={-1}><div class={`page${lecture ? ' lecture' : ''}`}>{children}</div></main>
      </div>
      <nav class="nav-mobile" aria-label="Navigation principale">
        {NAV.map((n) => (
          <a key={n.id} href={n.href} aria-current={section === n.id ? 'page' : undefined}>
            <Icone nom={n.icone} taille={22} />{n.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
