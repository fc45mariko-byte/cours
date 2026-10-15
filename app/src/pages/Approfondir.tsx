import { useState } from 'preact/hooks';
import { chargerChapitre, index, notionsDuPerimetre, chapitreExiste } from '../data';
import { useAsync } from '../hooks';
import { Charge, Texte } from '../ui/communs';
import { SelecteurPerimetre, questionsDuPerimetre } from './Entrainer';

export function Approfondir({ params }: { params: URLSearchParams }) {
  const [perimetre, setPerimetre] = useState(params.get('p') ?? '');
  const notions = notionsDuPerimetre(perimetre ? [perimetre] : []).filter((n) => index.notions[n].redigee);
  const chapitres = [...new Set(notions.map((n) => index.notions[n].chapitre))].filter(chapitreExiste);
  const c = useAsync(() => Promise.all(chapitres.map(chargerChapitre)), [chapitres.join()]);
  const difficiles = questionsDuPerimetre(perimetre, '3');
  const ens = new Set(notions);
  const cas = index.exercices.filter((e) => e.niveau === 3 && e.notions.some((n) => ens.has(n)));

  return (
    <>
      <h1 class="titre-page">Approfondir</h1>
      <p class="muted">Pour dépasser la mémorisation : distinguer les notions voisines, repérer où l'intuition se trompe, résoudre des cas complexes.</p>
      <div class="bloc"><SelecteurPerimetre valeur={perimetre} onChange={setPerimetre} /></div>
      <div class="ligne">
        <a class={`btn${difficiles.length ? '' : ' secondaire'}`} href={`#/entrainer/qcm?p=${perimetre}&niveau=3&n=20&g=${Date.now() % 1000}&titre=Questions difficiles`}>Questions de niveau 3 ({difficiles.length})</a>
      </div>
      {cas.length > 0 && (
        <><h2>Études de cas</h2>
          <ul class="notions bloc">{cas.map((e) => <li key={e.id}><a href={`#/exercice/${e.id}`}><span>{e.titre}</span><span class="small">Résoudre →</span></a></li>)}</ul></>
      )}
      <Charge c={c}>{(fichiers) => {
        const ns = fichiers.flatMap((f) => f.notions).filter((n) => ens.has(n.id));
        const confusions = ns.flatMap((n) => (n.confusions ?? []).map((x) => ({ ...x, n })));
        const contres = ns.filter((n) => n.contreExemple);
        return (
          <>
            <h2>⚠️ Ne pas confondre ({confusions.length})</h2>
            {confusions.map((x, i) => (
              <div class="bloc" key={i} style={{ padding: 16 }}>
                <div class="confusion"><span>{x.a}</span><span aria-label="à ne pas confondre avec">≠</span><span>{x.b}</span></div>
                <p class="small" style={{ margin: '8px 0 4px' }}><Texte t={x.explication} /></p>
                <a class="small" href={`#/notion/${x.n.id}`}>{x.n.titre}</a>
              </div>
            ))}
            <h2>↔️ Contre-exemples ({contres.length})</h2>
            {contres.map((n) => (
              <div class="bloc" key={n.id} style={{ padding: 16 }}>
                <a href={`#/notion/${n.id}`}><strong>{n.titre}</strong></a>
                <p class="small" style={{ margin: '6px 0 0' }}><Texte t={n.contreExemple!} /></p>
              </div>
            ))}
          </>
        );
      }}</Charge>
    </>
  );
}
