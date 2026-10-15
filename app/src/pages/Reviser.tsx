import { index, maitriseNotion, matiereDe } from '../data';
import { useProgression } from '../hooks';
import { EtatMaitrise } from '../ui/communs';

export function Reviser() {
  const p = useProgression();
  const travaillees = Object.keys(index.notions).filter((n) => index.notions[n].redigee)
    .map((id) => ({ id, m: maitriseNotion(id, p) })).filter((x) => x.m.etat !== 'nouvelle');
  const aRevoir = travaillees.filter((x) => x.m.etat === 'fragile' || x.m.etat === 'en-cours').sort((a, b) => a.m.score - b.m.score);
  const erreurs = Object.entries(p.erreurs);
  const qcmRates = erreurs.filter(([, e]) => e.type === 'qcm').map(([id]) => id).filter((id) => index.questions.some((q) => q.id === id));
  const exRates = [...new Set(erreurs.filter(([, e]) => e.type === 'exercice').map(([k]) => k.split('/')[0]))]
    .map((id) => index.exercices.find((e) => e.id === id)).filter(Boolean);
  const vues = Object.entries(p.vues).filter(([n]) => index.notions[n] && !travaillees.some((t) => t.id === n))
    .sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <>
      <h1 class="titre-page">Réviser</h1>
      <p class="muted">Vos erreurs restent ici jusqu'à deux réussites consécutives. La maîtrise est calculée uniquement à partir de vos résultats : ouvrir une fiche ne suffit pas.</p>

      <h2>Erreurs à retravailler</h2>
      {qcmRates.length === 0 && exRates.length === 0 && <div class="bloc vide">Aucune erreur enregistrée. Faites des QCM ou des exercices : les questions ratées apparaîtront ici.</div>}
      <div class="ligne">
        {qcmRates.length > 0 && <a class="btn" href={`#/entrainer/qcm?ids=${qcmRates.join(',')}&g=${Date.now() % 1000}&titre=Mes erreurs`}>Rejouer mes {qcmRates.length} QCM ratés</a>}
      </div>
      {exRates.length > 0 && (
        <ul class="notions">{exRates.map((e) => <li key={e!.id}><a href={`#/exercice/${e!.id}`}><span>✏️ {e!.titre}</span><span class="small muted">{matiereDe(e!.notions[0])?.titre}</span></a></li>)}</ul>
      )}

      <h2>Notions fragiles ou en cours</h2>
      {aRevoir.length === 0 ? <p class="muted">Rien à signaler pour l'instant.</p> : (
        <ul class="notions bloc">{aRevoir.map((x) => (
          <li key={x.id}><a href={`#/notion/${x.id}`}><span>{index.notions[x.id].titre} <span class="small muted">· {matiereDe(x.id)?.titre}</span></span><EtatMaitrise m={x.m} /></a></li>
        ))}</ul>
      )}

      {vues.length > 0 && (
        <>
          <h2>Fiches lues mais jamais testées</h2>
          <p class="small muted">Lire n'est pas maîtriser : testez-vous sur ces notions.</p>
          <ul class="notions bloc">{vues.map(([n]) => (
            <li key={n}><a href={`#/entrainer/qcm?p=${n}&n=5&g=${Date.now() % 1000}`}><span>{index.notions[n].titre}</span><span class="small">Tester →</span></a></li>
          ))}</ul>
        </>
      )}
    </>
  );
}
