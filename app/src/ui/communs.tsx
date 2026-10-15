import type { ComponentChildren } from 'preact';
import { LIBELLE_ETAT, type Maitrise } from '../core/maitrise';
import { index } from '../data';
import type { Chargement } from '../hooks';

export function EtatMaitrise({ m }: { m: Maitrise }) {
  return <span class={`etat etat-${m.etat}`}>{LIBELLE_ETAT[m.etat]}{m.etat !== 'nouvelle' ? ` · ${m.score} %` : ''}</span>;
}

export function Jauge({ valeur, label }: { valeur: number; label: string }) {
  return (
    <div class="jauge" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={valeur} aria-label={label}>
      <span style={{ width: `${Math.max(0, Math.min(100, valeur))}%` }} />
    </div>
  );
}

export function Charge<T>({ c, children }: { c: Chargement<T>; children: (d: T) => ComponentChildren }) {
  if (c.etat === 'chargement') return <div class="chargement" role="status">Chargement…</div>;
  if (c.etat === 'erreur') return <div class="erreur-box" role="alert">Impossible de charger ce contenu : {c.message}</div>;
  return <>{children(c.data)}</>;
}

export function LienNotion({ id }: { id: string }) {
  const n = index.notions[id];
  if (!n) return <span class="lien-notion inactif">{id}</span>;
  if (!n.redigee) return <span class="lien-notion inactif" title="Notion en cours de rédaction">{n.titre}</span>;
  return <a class="lien-notion" href={`#/notion/${id}`}>{n.titre}</a>;
}

export function Fil({ elements }: { elements: { label: string; href?: string }[] }) {
  return (
    <nav class="fil" aria-label="Fil d'Ariane">
      {elements.map((e, i) => (
        <span key={i}>
          {i > 0 && <span aria-hidden="true"> / </span>}
          {e.href ? <a href={e.href}>{e.label}</a> : <span aria-current="page">{e.label}</span>}
        </span>
      ))}
    </nav>
  );
}

export const STATUT_MATIERE: Record<string, string> = {
  ORL: 'Maquette Orléans', 'ORL?': 'Maquette Orléans · à confirmer', COMP: 'Complément hors maquette',
};

/** Rend le texte en préservant les retours à la ligne et un gras minimal (**texte**). */
export function Texte({ t }: { t: string }) {
  const parties = t.split(/(\*\*[^*]+\*\*)/g);
  return <>{parties.map((p, i) => (p.startsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : p))}</>;
}
