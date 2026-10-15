import { useMemo, useState } from 'preact/hooks';
import { index, matiereDe } from '../data';
import { aller } from '../hooks';
import { rechercher, normaliser, type Document } from '../core/recherche';
import { Icone } from '../ui/Icone';
import { LienNotion, Texte } from '../ui/communs';

const documents: Document[] = [
  ...Object.values(index.notions).map((n) => ({
    id: n.id, type: 'notion' as const, titre: n.titre, lien: `#/notion/${n.id}`,
    sousTitre: `${matiereDe(n.id)?.titre}${n.redigee ? '' : ' · en rédaction'}`,
    champs: [{ texte: n.titre, poids: 4 }, { texte: n.definition ?? '', poids: 1 }],
  })),
  ...index.glossaire.map((t, i) => ({
    id: `g${i}`, type: 'terme' as const, titre: t.fr, lien: `#/notion/${t.notion}`,
    sousTitre: [t.en && `EN ${t.en}`, t.es && `ES ${t.es}`].filter(Boolean).join(' · '),
    champs: [{ texte: t.fr, poids: 4 }, { texte: `${t.en ?? ''} ${t.es ?? ''}`, poids: 3 }, { texte: t.definition, poids: 1 }],
  })),
];

export function Explorer({ params }: { params: URLSearchParams }) {
  const [q, setQ] = useState(params.get('q') ?? '');
  const res = useMemo(() => rechercher(documents, q), [q]);
  const [centre, setCentre] = useState(params.get('n') ?? '');
  const n = index.notions[centre];
  const dependants = n ? Object.values(index.notions).filter((x) => x.prerequis.includes(centre) || x.connexes.includes(centre)) : [];

  return (
    <>
      <h1 class="titre-page">Explorer</h1>
      <div class="recherche" role="search">
        <Icone nom="recherche" />
        <input type="search" placeholder="Rechercher une notion, un terme (français, anglais ou espagnol)…" aria-label="Rechercher"
          value={q} onInput={(e) => setQ((e.target as HTMLInputElement).value)} autoFocus />
      </div>
      <div class="ligne" style={{ margin: '12px 0' }}><a class="btn secondaire petit" href="#/glossaire">Glossaire complet</a></div>
      {q.trim().length >= 2 && (
        <div class="bloc" aria-live="polite">
          <div class="small muted">{res.length} résultat{res.length > 1 ? 's' : ''}</div>
          <ul class="notions">{res.map((r) => (
            <li key={r.doc.id}><a href={r.doc.lien} onClick={(e) => { if (r.doc.type === 'notion') { e.preventDefault(); setCentre(r.doc.id); aller(r.doc.lien); } }}>
              <span>{r.doc.type === 'terme' ? '🔤 ' : ''}{r.doc.titre}</span><span class="small muted">{r.doc.sousTitre}</span></a></li>
          ))}</ul>
        </div>
      )}

      <h2>Carte d'une notion</h2>
      <label class="champ" style={{ maxWidth: 520 }}>Choisir une notion rédigée
        <select value={centre} onChange={(e) => setCentre((e.target as HTMLSelectElement).value)}>
          <option value="">—</option>
          {index.matieres.map((m) => {
            const ns = Object.values(index.notions).filter((x) => x.matiere === m.id && x.redigee);
            return ns.length ? <optgroup key={m.id} label={m.titre}>{ns.map((x) => <option key={x.id} value={x.id}>{x.titre}</option>)}</optgroup> : null;
          })}
        </select>
      </label>
      {n && (
        <div class="graphe-notion" style={{ marginTop: 16 }}>
          <div class="bloc"><strong class="small">Prérequis</strong><div>{n.prerequis.length ? n.prerequis.map((x) => <LienNotion key={x} id={x} />) : <span class="small muted">aucun</span>}</div></div>
          <a class="centre" href={`#/notion/${n.id}`}>{n.titre}<div class="small" style={{ fontWeight: 400 }}>{matiereDe(n.id)?.titre}</div></a>
          <div class="bloc"><strong class="small">Connexes et notions dépendantes</strong><div>{[...new Set([...n.connexes, ...dependants.map((d) => d.id)])].map((x) => <LienNotion key={x} id={x} />)}</div></div>
        </div>
      )}
    </>
  );
}

export function Glossaire() {
  const [filtre, setFiltre] = useState('');
  const [mat, setMat] = useState('');
  const termes = index.glossaire.filter((t) => (!mat || t.matiere === mat) &&
    (!filtre || normaliser(`${t.fr} ${t.en ?? ''} ${t.es ?? ''}`).includes(normaliser(filtre))));
  return (
    <>
      <h1 class="titre-page">Glossaire</h1>
      <div class="grille" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <label class="champ">Filtrer<input type="search" value={filtre} onInput={(e) => setFiltre((e.target as HTMLInputElement).value)} placeholder="terme en FR, EN ou ES" /></label>
        <label class="champ">Matière
          <select value={mat} onChange={(e) => setMat((e.target as HTMLSelectElement).value)}>
            <option value="">Toutes</option>
            {index.matieres.filter((m) => index.glossaire.some((t) => t.matiere === m.id)).map((m) => <option key={m.id} value={m.id}>{m.titre}</option>)}
          </select>
        </label>
      </div>
      <p class="small muted">{termes.length} terme{termes.length > 1 ? 's' : ''}</p>
      <div class="termes">{termes.map((t, i) => (
        <div class="terme" key={i}>
          <div class="entre"><strong>{t.fr}</strong><a class="small" href={`#/notion/${t.notion}`}>{index.notions[t.notion]?.titre}</a></div>
          {(t.en || t.es) && <div class="trad">{t.en && <>EN <em lang="en">{t.en}</em></>}{t.en && t.es && ' · '}{t.es && <>ES <em lang="es">{t.es}</em></>}</div>}
          <div><Texte t={t.definition} /></div>
          {t.distinction && <div class="small muted">↔ {t.distinction}</div>}
          {t.exemple && <div class="small"><em>{t.exemple}</em></div>}
        </div>
      ))}</div>
    </>
  );
}
