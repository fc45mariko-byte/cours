import { useProgression } from '../hooks';
import { index, maitriseNotion, matiereDe } from '../data';
import { estDue } from '../core/srs';
import { Icone } from './Icone';
import type { Couleur } from '../types';

const JOURS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
const ACCENT: Record<Couleur, string> = {
  pink: 'var(--accent-pink)', peach: 'var(--accent-peach)', lilac: 'var(--accent-lilac)',
  mint: 'var(--accent-mint)', sky: 'var(--accent-sky)', butter: 'var(--accent-butter)',
};

export function Panneau() {
  const p = useProgression();
  const aRevoir = index.flashcards.filter((f) => p.cartes[f.id] && estDue(p.cartes[f.id])).length;
  const jamaisVues = index.flashcards.filter((f) => !p.cartes[f.id]).length;
  const erreurs = Object.keys(p.erreurs).length;
  const commencees = Object.keys(index.notions).filter((n) => index.notions[n].redigee)
    .map((id) => ({ id, m: maitriseNotion(id, p) })).filter((x) => x.m.etat !== 'nouvelle');
  const fragiles = commencees.filter((x) => x.m.etat === 'fragile').sort((a, b) => a.m.score - b.m.score).slice(0, 5);
  const maitrisees = commencees.filter((x) => x.m.etat === 'maitrisee').length;

  // Activité des 7 derniers jours, empilée par couleur de matière.
  const jours = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const cle = d.toISOString().slice(0, 10);
    const parCouleur: Partial<Record<Couleur, number>> = {};
    for (const [mat, n] of Object.entries(p.activite[cle] ?? {})) {
      const c = index.matieres.find((m) => m.id === mat)?.couleur ?? 'sky';
      parCouleur[c] = (parCouleur[c] ?? 0) + n;
    }
    return { cle, label: JOURS[d.getDay()], parCouleur, total: Object.values(parCouleur).reduce((s, n) => s + (n ?? 0), 0) };
  });
  const max = Math.max(5, ...jours.map((j) => j.total));
  const semaine = jours.reduce((s, j) => s + j.total, 0);

  return (
    <>
      <div class="profil">
        <div class="avatar" aria-hidden="true">L3</div>
        <div style={{ fontWeight: 700, fontSize: '1.15rem' }}>Mon espace</div>
        <div class="small muted">Progression enregistrée sur cet appareil</div>
      </div>
      <a class="ligne-stat" href="#/flashcards"><span>🃏 Flashcards à revoir</span><span>{aRevoir}</span></a>
      <a class="ligne-stat" href="#/flashcards"><span>✨ Flashcards jamais vues</span><span>{jamaisVues}</span></a>
      <a class="ligne-stat" href="#/reviser"><span>⚠️ Erreurs à retravailler</span><span>{erreurs}</span></a>
      <a class="ligne-stat" href="#/reviser"><span>✅ Notions maîtrisées</span><span>{maitrisees}</span></a>
      {p.examen && !p.examen.terminee && <a class="btn" href="#/examen/session">Reprendre l'examen en cours</a>}

      <div class="bloc">
        <div class="entre"><strong class="small">Activité · 7 jours</strong><span class="small muted">{semaine} réponses</span></div>
        <div class="graph" role="img" aria-label={`Activité des sept derniers jours : ${jours.map((j) => `${j.label} ${j.total}`).join(', ')}`}>
          {jours.map((j, i) => (
            <div class="col" key={j.cle}>
              <div class={`pile${i === 6 ? ' aujourdhui' : ''}`} style={{ height: `${Math.max(6, (j.total / max) * 100)}%` }}>
                {(Object.entries(j.parCouleur) as [Couleur, number][]).map(([c, n]) => (
                  <span key={c} style={{ height: `${(n / j.total) * 100}%`, background: ACCENT[c] }} />
                ))}
              </div>
              <span class="jour">{j.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div class="section-titre" style={{ margin: '0 0 8px' }}>Mes notions fragiles</div>
        {fragiles.length === 0
          ? <p class="small muted">Aucune pour l'instant. Les notions deviennent « fragiles » après des erreurs aux QCM ou aux exercices.</p>
          : fragiles.map((f) => {
            const mat = matiereDe(f.id)!;
            return (
              <a key={f.id} class={`carte bg-${mat.couleur}`} style={{ minHeight: 0, marginBottom: 8 }} href={`#/notion/${f.id}`}>
                <div class="haut"><span class="cat"><span class="ico"><Icone nom="reviser" taille={16} /></span>{mat.titre}</span><span class="badge">{f.m.score} %</span></div>
                <strong>{index.notions[f.id].titre}</strong>
              </a>
            );
          })}
      </div>
    </>
  );
}
