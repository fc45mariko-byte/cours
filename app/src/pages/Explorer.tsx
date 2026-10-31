import { useMemo, useState } from 'preact/hooks';
import { chargerFil, chargerGlossaire, index, LIBELLE_LANGUE, matiereDe, matieresDisponibles } from '../data';
import { aller, useAsync } from '../hooks';
import { rechercher, normaliser, type Document } from '../core/recherche';
import { Icone } from '../ui/Icone';
import { Charge, LienNotion, Texte } from '../ui/communs';
import { LIBELLE_TYPE } from '../ui/Publication';
import type { IndexGlossaire, Langue, Publication } from '../types';

function documents(glossaire: IndexGlossaire[], fil: Publication[]): (Document & { langue: Langue })[] {
  return [
    ...Object.values(index.notions).map((n) => ({
      id: n.id, type: 'notion' as const, titre: n.titre, lien: `#/notion/${n.id}`, langue: matiereDe(n.id)?.langue ?? 'fr',
      sousTitre: `Notion · ${matiereDe(n.id)?.titre}`,
      champs: [{ texte: n.titre, poids: 4 }, { texte: n.definition ?? '', poids: 1 }],
    })),
    ...glossaire.map((t, i) => ({
      id: `g${i}`, type: 'terme' as const, titre: t.fr, lien: `#/notion/${t.notion}`, langue: matiereDe(t.notion)?.langue ?? 'fr',
      sousTitre: ['Terme', t.en && `EN ${t.en}`, t.es && `ES ${t.es}`].filter(Boolean).join(' · '),
      champs: [{ texte: t.fr, poids: 4 }, { texte: `${t.en ?? ''} ${t.es ?? ''}`, poids: 3 }, { texte: t.definition, poids: 1 }],
    })),
    ...fil.filter((x) => x.edito || x.type === 'dossier' || x.type === 'cas').map((x) => ({
      id: x.id, type: 'notion' as const, titre: x.t, lien: `#/pub/${encodeURIComponent(x.id)}`, langue: x.l,
      sousTitre: `${LIBELLE_TYPE[x.type]}${x.edito ? ' · hors cours' : ''}`,
      champs: [{ texte: x.t, poids: 3 }, { texte: x.x, poids: 1 }],
    })),
  ];
}

export function Explorer({ params }: { params: URLSearchParams }) {
  const c = useAsync(() => Promise.all([chargerGlossaire(), chargerFil()]), []);
  return (
    <>
      <p class="surtitre">Notions, termes trilingues, dossiers</p>
      <h1 class="titre-page">Rechercher</h1>
      <Charge c={c}>{([g, f]) => <Recherche docs={documents(g, f)} initiale={params.get('q') ?? ''} centreInitial={params.get('n') ?? ''} />}</Charge>
    </>
  );
}

function Recherche({ docs, initiale, centreInitial }: { docs: (Document & { langue: Langue })[]; initiale: string; centreInitial: string }) {
  const [q, setQ] = useState(initiale);
  const [langue, setLangue] = useState<'' | Langue>('');
  const res = useMemo(() => rechercher(docs.filter((d) => !langue || d.langue === langue), q, 60), [q, langue]);
  const [centre, setCentre] = useState(centreInitial);
  const n = index.notions[centre];
  const dependants = n ? Object.values(index.notions).filter((x) => x.prerequis.includes(centre) || x.connexes.includes(centre)) : [];
  return (
    <>
      <div class="recherche" role="search">
        <Icone nom="recherche" />
        <input type="search" placeholder="Une notion, un terme en français, anglais ou espagnol…" aria-label="Rechercher"
          value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} autoFocus />
      </div>
      <div class="puces" role="group" aria-label="Langue du cours" style={{ marginTop: 12 }}>
        {([['', 'Toutes les langues'], ['fr', 'Français'], ['en', 'English'], ['es', 'Español']] as const).map(([v, l]) => (
          <button key={v} class="puce" aria-pressed={langue === v} onClick={() => setLangue(v)}>{l}</button>
        ))}
        <a class="puce" href="#/glossaire">Glossaire complet</a>
      </div>
      {q.trim().length >= 2 && (
        <div aria-live="polite" style={{ marginTop: 16 }}>
          <div class="small muted">{res.length} résultat{res.length > 1 ? 's' : ''}</div>
          <ul class="notions">{res.map((r) => (
            <li key={r.doc.id}><a href={r.doc.lien} onClick={(e) => { if (index.notions[r.doc.id]) { e.preventDefault(); setCentre(r.doc.id); aller(r.doc.lien); } }}>
              <span lang={(r.doc as { langue?: string }).langue}>{r.doc.titre}</span><span class="small muted">{r.doc.sousTitre}</span></a></li>
          ))}</ul>
        </div>
      )}
      <div class="section-titre"><h2>Carte d’une notion</h2></div>
      <label class="champ" style={{ maxWidth: 520 }}>Choisir une notion
        <select value={centre} onChange={(e) => setCentre((e.target as HTMLSelectElement).value)}>
          <option value="">—</option>
          {matieresDisponibles().map((m) => {
            const ns = Object.values(index.notions).filter((x) => x.matiere === m.id && x.redigee);
            return ns.length ? <optgroup key={m.id} label={m.titre}>{ns.map((x) => <option key={x.id} value={x.id}>{x.titre}</option>)}</optgroup> : null;
          })}
        </select>
      </label>
      {n && (
        <div class="faits-analyse" style={{ marginTop: 16 }}>
          <div><h4>Prérequis</h4>{n.prerequis.length ? n.prerequis.map((x) => <LienNotion key={x} id={x} />) : <span class="small muted">aucun</span>}</div>
          <div><h4><a href={`#/notion/${n.id}`}>{n.titre}</a> · liens</h4>{[...new Set([...n.connexes, ...dependants.map((d) => d.id)])].map((x) => <LienNotion key={x} id={x} />)}</div>
        </div>
      )}
    </>
  );
}

export function Glossaire() {
  const c = useAsync(() => chargerGlossaire(), []);
  const [filtre, setFiltre] = useState('');
  const [mat, setMat] = useState('');
  return (
    <>
      <p class="surtitre">Français · English · Español</p>
      <h1 class="titre-page">Glossaire</h1>
      <Charge c={c}>{(glossaire) => {
        const termes = glossaire.filter((t) => (!mat || t.matiere === mat) &&
          (!filtre || normaliser(`${t.fr} ${t.en ?? ''} ${t.es ?? ''}`).includes(normaliser(filtre))));
        return (
          <>
            <div class="filtres">
              <label class="champ">Filtrer<input type="search" value={filtre} onInput={(e) => setFiltre((e.target as HTMLInputElement).value)} placeholder="terme en FR, EN ou ES" /></label>
              <label class="champ">Matière
                <select value={mat} onChange={(e) => setMat((e.target as HTMLSelectElement).value)}>
                  <option value="">Toutes</option>
                  {matieresDisponibles().filter((m) => glossaire.some((t) => t.matiere === m.id)).map((m) => <option key={m.id} value={m.id}>{m.titre} ({LIBELLE_LANGUE[m.langue]})</option>)}
                </select>
              </label>
            </div>
            <p class="small muted">{termes.length} terme{termes.length > 1 ? 's' : ''}</p>
            <div class="termes">{termes.slice(0, 400).map((t, i) => (
              <div class="terme" key={i}>
                <div class="entre"><strong lang="fr">{t.fr}</strong><a class="small" href={`#/notion/${t.notion}`}>{index.notions[t.notion]?.titre}</a></div>
                {(t.en || t.es) && <div class="trad">{t.en && <>EN <em lang="en">{t.en}</em></>}{t.en && t.es && ' · '}{t.es && <>ES <em lang="es">{t.es}</em></>}</div>}
                <div lang={matiereDe(t.notion)?.langue}><Texte t={t.definition} /></div>
                {t.distinction && <div class="small muted">↔ {t.distinction}</div>}
              </div>
            ))}</div>
            {termes.length > 400 && <p class="small muted">Affinez le filtre pour voir les {termes.length - 400} autres termes.</p>}
          </>
        );
      }}</Charge>
    </>
  );
}
