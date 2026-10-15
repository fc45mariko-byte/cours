import { useEffect, useState } from 'preact/hooks';
import { store, type Progression } from './core/store';
import { chargerChapitre } from './data';
import type { FichierChapitre } from './types';

export function useProgression(): Progression {
  const [p, setP] = useState(store.etat);
  useEffect(() => store.abonner(() => setP(store.etat)), []);
  return p;
}

export type Chargement<T> = { etat: 'chargement' } | { etat: 'erreur'; message: string } | { etat: 'ok'; data: T };

export function useAsync<T>(f: () => Promise<T>, deps: unknown[]): Chargement<T> {
  const [r, setR] = useState<Chargement<T>>({ etat: 'chargement' });
  useEffect(() => {
    let actif = true;
    setR({ etat: 'chargement' });
    f().then((data) => actif && setR({ etat: 'ok', data }))
      .catch((e: unknown) => actif && setR({ etat: 'erreur', message: e instanceof Error ? e.message : String(e) }));
    return () => { actif = false; };
  }, deps);
  return r;
}

export const useChapitre = (id: string) => useAsync<FichierChapitre>(() => chargerChapitre(id), [id]);

/** Route courante, lue dans le fragment d'URL (#/chemin?param=valeur). */
export function useRoute() {
  const lire = () => {
    const h = location.hash.replace(/^#/, '') || '/';
    const [chemin, qs] = h.split('?');
    return { chemin, params: new URLSearchParams(qs ?? ''), brut: h };
  };
  const [r, setR] = useState(lire);
  useEffect(() => {
    const f = () => { setR(lire()); window.scrollTo(0, 0); };
    addEventListener('hashchange', f);
    return () => removeEventListener('hashchange', f);
  }, []);
  return r;
}

export const aller = (h: string) => { location.hash = h; };
