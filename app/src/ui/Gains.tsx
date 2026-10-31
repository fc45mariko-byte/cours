import { useEffect, useState } from 'preact/hooks';
import { store } from '../core/store';
import { synchroniser, BADGES } from '../jeu';

/** Enregistre les gains (XP, quêtes, badges) après chaque activité et les annonce discrètement. */
export function Gains() {
  const [annonce, setAnnonce] = useState<{ texte: string; xp: number } | null>(null);
  useEffect(() => {
    synchroniser(); // rattrape l'historique existant, sans annonce
    let minuterie: ReturnType<typeof setTimeout> | undefined;
    let fermeture: ReturnType<typeof setTimeout> | undefined;
    const desabonner = store.abonner(() => {
      clearTimeout(minuterie);
      minuterie = setTimeout(() => {
        const g = synchroniser();
        if (!g.xp && !g.badges.length) return;
        const badge = g.badges.length ? BADGES.find((b) => b.id === g.badges[0])?.titre : '';
        setAnnonce({ xp: g.xp, texte: badge ? `Badge obtenu : ${badge}` : 'Progression enregistrée' });
        clearTimeout(fermeture);
        fermeture = setTimeout(() => setAnnonce(null), 3200);
      }, 250);
    });
    return () => { desabonner(); clearTimeout(minuterie); clearTimeout(fermeture); };
  }, []);
  return (
    <div aria-live="polite" class="sr-annonce">
      {annonce && (
        <div class="toast" role="status">
          {annonce.xp > 0 && <span class="xp">+{annonce.xp} XP</span>}
          <span>{annonce.texte}</span>
          <a href="#/progres" style={{ color: 'inherit' }}>Voir</a>
        </div>
      )}
    </div>
  );
}
