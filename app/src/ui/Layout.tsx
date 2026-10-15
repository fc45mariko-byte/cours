import type { ComponentChildren } from 'preact';
import { Icone } from './Icone';
import { useProgression } from '../hooks';
import { index } from '../data';
import { estDue } from '../core/srs';

export const NAV = [
  { href: '#/', id: 'accueil', label: 'Accueil', icone: 'accueil' },
  { href: '#/entrainer', id: 'entrainer', label: "S'entraîner", icone: 'entrainer' },
  { href: '#/flashcards', id: 'flashcards', label: 'Flashcards', icone: 'cartes' },
  { href: '#/reviser', id: 'reviser', label: 'Réviser', icone: 'reviser' },
  { href: '#/examen', id: 'examen', label: 'Examen', icone: 'examen' },
  { href: '#/approfondir', id: 'approfondir', label: 'Approfondir', icone: 'approfondir' },
  { href: '#/explorer', id: 'explorer', label: 'Explorer', icone: 'explorer' },
];
const MOBILE = ['accueil', 'entrainer', 'flashcards', 'reviser', 'explorer'];

export function Layout({ section, panneau, children }: { section: string; panneau?: ComponentChildren; children: ComponentChildren }) {
  const p = useProgression();
  const dues = index.flashcards.filter((f) => p.cartes[f.id] && estDue(p.cartes[f.id])).length;
  const erreurs = Object.keys(p.erreurs).length;
  const pastille = (id: string) => (id === 'flashcards' && dues ? dues : id === 'reviser' && erreurs ? erreurs : 0);
  return (
    <>
      <a class="skip" href="#contenu" onClick={(e) => { e.preventDefault(); document.getElementById('contenu')?.focus(); }}>Aller au contenu</a>
      <div class={`shell${panneau ? '' : ' sans-panneau'}`}>
        <aside class="sidebar" aria-label="Navigation principale">
          <a class="logo" href="#/" aria-label="Accueil">L3·LEA</a>
          <nav>
            {NAV.map((n) => (
              <a key={n.id} class="nav-btn" href={n.href} aria-current={section === n.id ? 'page' : undefined} aria-label={n.label}>
                <Icone nom={n.icone} />
                {pastille(n.id) > 0 && <span class="pastille" aria-hidden="true">{pastille(n.id)}</span>}
                <span class="info" aria-hidden="true">{n.label}</span>
              </a>
            ))}
          </nav>
          <a class="nav-btn" href="#/reglages" aria-current={section === 'reglages' ? 'page' : undefined} aria-label="Réglages et sauvegarde">
            <Icone nom="reglages" /><span class="info" aria-hidden="true">Réglages</span>
          </a>
        </aside>
        <main id="contenu" tabIndex={-1}>{children}</main>
        {panneau && <aside class="panneau" aria-label="Ma progression">{panneau}</aside>}
      </div>
      <nav class="mobile-nav" aria-label="Navigation">
        {NAV.filter((n) => MOBILE.includes(n.id)).map((n) => (
          <a key={n.id} href={n.href} aria-current={section === n.id ? 'page' : undefined}>
            <Icone nom={n.icone} taille={22} />{n.label}
          </a>
        ))}
      </nav>
    </>
  );
}
