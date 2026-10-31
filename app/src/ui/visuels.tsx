// Composants visuels produits à partir des données : motifs de couverture, schémas, frises, graphiques.
// Aucune image décorative : chaque visuel est construit à partir du contenu ou de la discipline.
import { hacher } from '../core/hasard';

/** Motif de couverture propre à chaque famille de disciplines (traits fins, couleur de la discipline). */
export function Motif({ categorie, graine }: { categorie: string; graine: string }) {
  const h = hacher(graine);
  const r = (n: number) => ((h >> (n % 24)) & 0xff) / 255;
  const traits: string[] = [];
  switch (categorie) {
    case 'Commerce international': // méridiens et parallèles
      for (let i = 0; i < 9; i++) traits.push(`M${200 + 260 * Math.cos(i * 0.35 + r(i))},0 Q${200 + 40 * (i - 4)},150 ${200 + 260 * Math.cos(i * 0.35 + r(i))},300`);
      for (let i = 1; i < 7; i++) traits.push(`M0,${i * 45 + r(i) * 6} Q200,${i * 45 - 20} 400,${i * 45 + r(i + 3) * 6}`);
      break;
    case 'Gestion': // barres et grille comptable
      for (let i = 0; i < 12; i++) { const x = 24 + i * 32, hb = 40 + r(i) * 200; traits.push(`M${x},300 V${300 - hb}`); }
      for (let i = 1; i < 6; i++) traits.push(`M0,${i * 50} H400`);
      break;
    case 'Droit': // colonnes et fronton
      for (let i = 0; i < 6; i++) { const x = 40 + i * 64; traits.push(`M${x},300 V110 M${x + 18},300 V110`); }
      traits.push('M10,105 L200,30 L390,105 Z', 'M0,300 H400');
      break;
    case 'Management': // réseau de nœuds
      for (let i = 0; i < 14; i++) for (let j = i + 1; j < 14; j++) if (((h >> ((i * 7 + j) % 28)) & 7) === 0) {
        traits.push(`M${30 + r(i) * 340},${20 + r(i + 9) * 260} L${30 + r(j) * 340},${20 + r(j + 9) * 260}`);
      }
      break;
    case 'Anglais': case 'Espagnol': // lignes d'écriture et guillemets
      for (let i = 0; i < 11; i++) { const w = 120 + r(i) * 240; traits.push(`M20,${24 + i * 25} H${20 + w}`); }
      break;
    case 'Civilisations': // horizon et soleil
      for (let i = 0; i < 9; i++) traits.push(`M0,${180 + i * 14} Q200,${170 + i * 14 - r(i) * 20} 400,${180 + i * 14}`);
      for (let i = 1; i < 5; i++) traits.push(`M${200 - i * 30},180 A${i * 30},${i * 30} 0 0 1 ${200 + i * 30},180`);
      break;
    case 'Méthodologie': // marges et paragraphes
      traits.push('M60,0 V300');
      for (let i = 0; i < 12; i++) traits.push(`M76,${20 + i * 23} H${180 + r(i) * 200}`);
      break;
    default: // compléments : courbes de données
      for (let k = 0; k < 4; k++) {
        let d = `M0,${200 - k * 30}`;
        for (let i = 1; i <= 10; i++) d += ` L${i * 40},${200 - k * 30 - r(i + k) * 60 + i * 3}`;
        traits.push(d);
      }
  }
  return (
    <svg class="motif" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {traits.map((d, i) => <path key={i} d={d} fill="none" stroke="currentColor" stroke-width="1.2" vector-effect="non-scaling-stroke" />)}
    </svg>
  );
}

/** Graphique en barres horizontales, une seule série : titre, valeurs étiquetées, info-bulle et tableau. */
export function Barres({ titre, series, unite, source, note }: { titre: string; series: { label: string; valeur: number }[]; unite: string; source?: string; note?: string }) {
  const max = Math.max(...series.map((s) => s.valeur), 0) || 1;
  const hLigne = 34, gauche = 132, largeur = 520, hauteur = series.length * hLigne + 8;
  const fmt = (v: number) => `${v.toLocaleString('fr-FR')}${unite ? ' ' + unite : ''}`;
  return (
    <figure class="graphique">
      <svg viewBox={`0 0 ${largeur} ${hauteur}`} role="img" aria-label={`${titre} : ${series.map((s) => `${s.label} ${fmt(s.valeur)}`).join(', ')}`}>
        <line class="axe" x1={gauche} x2={gauche} y1={0} y2={hauteur} />
        {series.map((s, i) => {
          const w = Math.max(2, ((largeur - gauche - 90) * s.valeur) / max);
          const y = i * hLigne + 8;
          return (
            <g key={s.label}>
              <title>{`${s.label} : ${fmt(s.valeur)}`}</title>
              <text x={gauche - 8} y={y + 12} text-anchor="end">{s.label.length > 20 ? s.label.slice(0, 19) + '…' : s.label}</text>
              <path class="barre-donnee" d={`M${gauche},${y} h${w - 4} a4,4 0 0 1 4,4 v10 a4,4 0 0 1 -4,4 h${-(w - 4)} z`} />
              <text class="valeur" x={gauche + w + 6} y={y + 13}>{fmt(s.valeur)}</text>
            </g>
          );
        })}
      </svg>
      <figcaption>{titre}{note ? ` — ${note}` : ''}{source ? ` · Source : ${source}` : ''}</figcaption>
      <details class="small"><summary>Voir les données en tableau</summary>
        <div class="tableau-wrap"><table><thead><tr><th scope="col">Élément</th><th scope="col">Valeur</th></tr></thead>
          <tbody>{series.map((s) => <tr key={s.label}><th scope="row">{s.label}</th><td>{fmt(s.valeur)}</td></tr>)}</tbody></table></div>
      </details>
    </figure>
  );
}

/** Anneau de progression (niveau). */
export function Anneau({ part, libelle }: { part: number; libelle: string }) {
  const r = 56, c = 2 * Math.PI * r;
  return (
    <svg class="anneau" viewBox="0 0 132 132" role="img" aria-label={libelle}>
      <circle class="fond" cx="66" cy="66" r={r} fill="none" stroke-width="5" />
      <circle class="val" cx="66" cy="66" r={r} fill="none" stroke-width="5" stroke-linecap="round"
        stroke-dasharray={c} stroke-dashoffset={c * (1 - Math.max(0, Math.min(1, part)))} transform="rotate(-90 66 66)" />
    </svg>
  );
}
