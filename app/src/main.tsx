import { render } from 'preact';
import { App } from './App';
import './styles/tokens.css';
import './styles/app.css';

try {
  const t = localStorage.getItem('cours-l3-lea:theme');
  if (t === 'light' || t === 'dark') document.documentElement.setAttribute('data-theme', t);
} catch { /* stockage indisponible : thème automatique */ }

render(<App />, document.getElementById('app')!);

// Lecture hors ligne : le service worker n'est enregistré que sur le site construit.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => { /* hors ligne indisponible */ }); });
}
