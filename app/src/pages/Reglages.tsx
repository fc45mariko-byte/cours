import { useState } from 'preact/hooks';
import { store } from '../core/store';
import { useProgression } from '../hooks';
import { index } from '../data';

export function Reglages() {
  useProgression();
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('cours-l3-lea:theme') ?? 'auto'; } catch { return 'auto'; } });

  const exporter = () => {
    const blob = new Blob([store.exporter()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `progression-l3-lea-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setMessage('Fichier de sauvegarde téléchargé.');
  };
  const importer = async (e: Event) => {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    try { store.importer(await f.text()); setMessage('Progression importée.'); }
    catch (err) { setMessage(`Import impossible : ${err instanceof Error ? err.message : err}`); }
  };
  const changerTheme = (t: string) => {
    setTheme(t);
    try { localStorage.setItem('cours-l3-lea:theme', t); } catch { /* stockage indisponible */ }
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  };

  return (
    <>
      <h1 class="titre-page">Réglages et sauvegarde</h1>
      <div class="bloc">
        <h2 style={{ marginTop: 0 }}>Sauvegarde de la progression</h2>
        <p>{store.persistant
          ? 'Votre progression est enregistrée automatiquement dans ce navigateur, sur cet appareil.'
          : '⚠️ Le stockage du navigateur est indisponible (navigation privée ou réglages) : la progression sera perdue à la fermeture. Exportez-la régulièrement.'}</p>
        <p class="small muted">Elle n'est envoyée nulle part. Pour la transférer sur un autre appareil ou la mettre à l'abri, exportez-la puis importez le fichier.</p>
        <div class="ligne">
          <button class="btn" onClick={exporter}>Exporter (fichier JSON)</button>
          <label class="btn secondaire">Importer un fichier<input type="file" accept="application/json,.json" class="sr-only" onChange={importer} /></label>
          <button class="btn discret" onClick={() => { if (confirm('Effacer toute la progression de cet appareil ? Cette action est irréversible.')) { store.reinitialiser(); setMessage('Progression effacée.'); } }}>Tout effacer</button>
        </div>
        <p role="status" aria-live="polite" class="small" style={{ marginTop: 10 }}>{message}</p>
      </div>
      <div class="bloc">
        <h2 style={{ marginTop: 0 }}>Apparence</h2>
        <div class="puces" role="radiogroup" aria-label="Thème">
          {[['auto', 'Automatique'], ['light', 'Clair'], ['dark', 'Sombre']].map(([v, l]) => (
            <button key={v} class="puce simple" role="radio" aria-checked={theme === v} aria-pressed={theme === v} onClick={() => changerTheme(v)}>{l}</button>
          ))}
        </div>
      </div>
      <div class="bloc">
        <h2 style={{ marginTop: 0 }}>À propos du contenu</h2>
        <p class="small">Programme cartographié d'après la maquette de la L3 LEA anglais-espagnol, parcours Commerce international, de l'Université d'Orléans. Les fiches indiquent leurs sources et leur date de vérification. Les exemples inventés sont signalés « exemple fictif ».</p>
        <p class="small muted">Dernière vérification de contenu : {index.genereLe}.</p>
      </div>
    </>
  );
}
