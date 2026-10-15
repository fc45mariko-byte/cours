// Jeu d'icônes au trait (24 × 24), décoratives : toujours accompagnées d'un texte visible ou masqué.
const P: Record<string, string> = {
  accueil: 'M3 11.5 12 4l9 7.5M5.5 9.8V20h13V9.8',
  apprendre: 'M4 5.5A2 2 0 0 1 6 4h5v15H6a2 2 0 0 0-2 2zM20 5.5A2 2 0 0 0 18 4h-5v15h5a2 2 0 0 1 2 2zM4 5.5V21M20 5.5V21',
  entrainer: 'M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 11a1 1 0 1 0 1 1M21 3l-8 8M17 3h4v4',
  cartes: 'M7 4h12a1 1 0 0 1 1 1v12M4 8h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z',
  reviser: 'M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4M12 8v4l3 2',
  examen: 'M9 4h6l1 2h3v14H5V6h3zM9 11l2 2 4-4M9 17h6',
  explorer: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
  glossaire: 'M5 4h11l3 3v13H5zM9 9h6M9 13h6M9 17h3',
  reglages: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 15H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.7 4.6V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z',
  recherche: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  approfondir: 'M12 3v18M5 10l7-7 7 7M5 21h14',
  grille: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  commerce: 'M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z',
  gestion: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  droit: 'M12 4v16M5 20h14M6 8h12M6 8l-3 6a3 3 0 0 0 6 0zM18 8l-3 6a3 3 0 0 0 6 0z',
  management: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 20a6 6 0 0 1 12 0M10 20a6 6 0 0 1 12 0',
  langue: 'M4 5h16v11H9l-5 4zM8 9h8M8 12h5',
  civilisation: 'M3 21h18M5 21V10M19 21V10M9 21V10M15 21V10M12 3l9 5H3z',
  methode: 'M4 4h12l4 4v12H4zM8 12h8M8 16h5M8 8h4',
  complement: 'M12 5v14M5 12h14',
  check: 'M5 12l5 5 9-10',
  croix: 'M6 6l12 12M18 6 6 18',
  horloge: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  fleche: 'M5 12h14M13 6l6 6-6 6',
  retour: 'M19 12H5M11 6l-6 6 6 6',
  etoile: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
};

export function Icone({ nom, taille = 20 }: { nom: string; taille?: number }) {
  return (
    <svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      <path d={P[nom] ?? P.grille} />
    </svg>
  );
}

export const ICONE_CATEGORIE: Record<string, string> = {
  'Commerce international': 'commerce', Gestion: 'gestion', Droit: 'droit', Management: 'management',
  Anglais: 'langue', Espagnol: 'langue', Civilisations: 'civilisation', Méthodologie: 'methode', Compléments: 'complement',
};
