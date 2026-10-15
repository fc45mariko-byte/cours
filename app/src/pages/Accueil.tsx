import { useState } from 'preact/hooks';
import { CATEGORIES, index, maitrisePerimetre } from '../data';
import { useProgression } from '../hooks';
import { Icone, ICONE_CATEGORIE } from '../ui/Icone';
import { STATUT_MATIERE } from '../ui/communs';

export function Accueil() {
  const p = useProgression();
  const [cat, setCat] = useState<string>('Toutes');
  const matieres = index.matieres.filter((m) => cat === 'Toutes' || m.categorie === cat);
  const total = Object.values(index.notions);
  const redigees = total.filter((n) => n.redigee).length;

  return (
    <>
      <h1 class="titre">Réussir sa L3 LEA<br />Commerce international</h1>
      <div class="puces" role="group" aria-label="Filtrer les matières par domaine">
        {['Toutes', ...CATEGORIES].map((c) => (
          <button key={c} class="puce" aria-pressed={cat === c} onClick={() => setCat(c)}>
            <span class="ico"><Icone nom={c === 'Toutes' ? 'grille' : ICONE_CATEGORIE[c]} taille={18} /></span>{c}
          </button>
        ))}
      </div>

      <div class="section-titre">
        {cat === 'Toutes' ? 'Toutes les matières' : cat} · {redigees} fiches rédigées sur {total.length} notions cartographiées
      </div>
      <div class="grille">
        {matieres.map((m) => {
          const mp = maitrisePerimetre(m.id, p);
          return (
            <a key={m.id} class={`carte bg-${m.couleur}`} href={`#/matiere/${m.id}`}>
              <div class="haut">
                <span class="cat"><span class="ico"><Icone nom={ICONE_CATEGORIE[m.categorie]} taille={18} /></span>{m.categorie}</span>
                {mp.redigees > 0
                  ? <span class="badge" title="Maîtrise moyenne des notions rédigées">★ {mp.score} %</span>
                  : <span class="badge">En rédaction</span>}
              </div>
              <h3>{m.titre}</h3>
              <div class="bas">
                <span>{mp.redigees}/{mp.total} notions{m.semestres.length ? ` · ${m.semestres.join(' + ')}` : ''}</span>
                <span>{STATUT_MATIERE[m.statut]}</span>
              </div>
            </a>
          );
        })}
      </div>

      <h2>Comment travailler</h2>
      <div class="grille">
        {[
          ['#/entrainer', 'entrainer', "S'entraîner", 'QCM corrigés et exercices ciblés, par matière, chapitre ou difficulté.'],
          ['#/flashcards', 'cartes', 'Flashcards', 'Questions ouvertes, autoévaluation par critères, répétition espacée.'],
          ['#/reviser', 'reviser', 'Réviser', 'Notions fragiles et erreurs passées, jusqu’à deux réussites consécutives.'],
          ['#/examen', 'examen', 'Mode examen', 'Série chronométrée, sans aide, avec bilan par notion.'],
          ['#/approfondir', 'approfondir', 'Approfondir', 'Confusions, contre-exemples, questions et cas difficiles.'],
          ['#/explorer', 'explorer', 'Explorer', 'Recherche, glossaire FR/EN/ES et liens entre notions.'],
        ].map(([href, ic, t, d]) => (
          <a key={href} class="bloc" style={{ textDecoration: 'none', margin: 0 }} href={href}>
            <div class="ligne"><span class="nav-btn" style={{ width: 40, height: 40 }} aria-hidden="true"><Icone nom={ic} /></span><strong>{t}</strong></div>
            <p class="small muted" style={{ marginTop: 8 }}>{d}</p>
          </a>
        ))}
      </div>
    </>
  );
}
