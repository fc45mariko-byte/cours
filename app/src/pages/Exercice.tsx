import { useState } from 'preact/hooks';
import { chargerExercice, index, matiereDe } from '../data';
import { useAsync } from '../hooks';
import { corrigerEcriture, corrigerNombre, type LigneSaisie } from '../core/correction';
import { store } from '../core/store';
import { Charge, Fil, LienNotion, Texte } from '../ui/communs';
import type { Exercice as Ex, SousQuestion } from '../types';

function Correction({ sq, juste, details }: { sq: SousQuestion; juste: boolean | null; details?: string[] }) {
  return (
    <div aria-live="polite" style={{ marginTop: 10 }}>
      {juste !== null && <div class={`verdict ${juste ? 'ok' : 'ko'}`}>{juste ? '✔ Juste' : '✘ À revoir'}</div>}
      {details?.map((d, i) => <p key={i} class="small" style={{ marginTop: 6 }}>{d}</p>)}
      <div class="encadre verif">
        <strong>Corrigé</strong>
        <ol style={{ margin: '6px 0 0' }}>{sq.correction.map((c, i) => <li key={i}><Texte t={c} /></li>)}</ol>
        {sq.erreurs?.length ? <><strong>Erreurs fréquentes</strong><ul style={{ margin: '6px 0 0' }}>{sq.erreurs.map((e, i) => <li key={i}><Texte t={e} /></li>)}</ul></> : null}
      </div>
    </div>
  );
}

function SousQ({ ex, sq, numero }: { ex: Ex; sq: SousQuestion; numero: number }) {
  const [saisie, setSaisie] = useState('');
  const [lignes, setLignes] = useState<LigneSaisie[]>(() => Array.from({ length: Math.max(3, (sq.reponse.type === 'ecriture' ? sq.reponse.lignes.length : 0) + 1) }, () => ({ compte: '', debit: '', credit: '' })));
  const [choix, setChoix] = useState<number | null>(null);
  const [coches, setCoches] = useState<boolean[]>([]);
  const [fini, setFini] = useState<{ juste: boolean | null; details?: string[] } | null>(null);
  const cle = `${ex.id}/${sq.id}`;
  const notion = ex.notions[0];
  const enregistrer = (juste: boolean) => store.repondreExercice(cle, notion, notion.split('.')[0], juste);

  const valider = () => {
    const r = sq.reponse;
    if (r.type === 'nombre') {
      const c = corrigerNombre(r, saisie);
      setFini({ juste: c.juste, details: c.lu === null ? ['Votre saisie n’est pas un nombre lisible.'] : [`Réponse attendue : ${r.valeur.toLocaleString('fr-FR')}${r.unite ? ' ' + r.unite : ''}.`] });
      enregistrer(c.juste);
    } else if (r.type === 'ecriture') {
      const c = corrigerEcriture(r, lignes);
      const d: string[] = [];
      if (!c.equilibree) d.push('Votre écriture n’est pas équilibrée : total des débits ≠ total des crédits.');
      if (c.manquantes.length) d.push(`Lignes attendues non trouvées : ${c.manquantes.join(' ; ')}.`);
      if (c.enTrop.length) d.push(`Lignes en trop ou erronées : ${c.enTrop.join(' ; ')}.`);
      setFini({ juste: c.juste, details: d });
      enregistrer(c.juste);
    } else if (r.type === 'choix') {
      const juste = choix === r.correcte;
      setFini({ juste, details: [`Réponse attendue : ${r.options[r.correcte]}.`] });
      enregistrer(juste);
    } else {
      setFini({ juste: null });
    }
  };
  const autoEval = () => {
    const r = sq.reponse;
    if (r.type !== 'libre') return;
    const juste = coches.filter(Boolean).length === r.criteres.length;
    enregistrer(juste);
    setFini({ juste, details: [juste ? 'Tous les critères sont présents.' : 'Un ou plusieurs critères manquent : reprenez le corrigé.'] });
  };

  const r = sq.reponse;
  return (
    <div class="bloc">
      <p><strong>{numero}. </strong><Texte t={sq.consigne} /></p>
      {r.type === 'nombre' && (
        <label class="champ" style={{ maxWidth: 320 }}>Votre réponse{r.unite ? ` (${r.unite})` : ''}
          <input type="text" inputMode="decimal" value={saisie} disabled={!!fini} onInput={(e) => setSaisie((e.target as HTMLInputElement).value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && saisie) valider(); }} />
        </label>
      )}
      {r.type === 'ecriture' && (
        <div class="ecriture-grille" role="group" aria-label="Écriture comptable">
          <span class="entete">Compte</span><span class="entete">Débit</span><span class="entete">Crédit</span>
          {lignes.map((l, i) => (
            ['compte', 'debit', 'credit'] as const).map((k) => (
              <input key={`${i}-${k}`} type="text" inputMode={k === 'compte' ? 'numeric' : 'decimal'} aria-label={`Ligne ${i + 1}, ${k === 'compte' ? 'compte' : k === 'debit' ? 'débit' : 'crédit'}`}
                value={l[k]} disabled={!!fini} onInput={(e) => { const v = [...lignes]; v[i] = { ...v[i], [k]: (e.target as HTMLInputElement).value }; setLignes(v); }} />
            )))}
          {!fini && <button class="btn petit secondaire" style={{ gridColumn: '1 / -1', justifySelf: 'start' }} onClick={() => setLignes([...lignes, { compte: '', debit: '', credit: '' }])}>+ Ajouter une ligne</button>}
        </div>
      )}
      {r.type === 'choix' && (
        <div class="qcm-choix" role="radiogroup">
          {r.options.map((o, i) => (
            <label key={i} class={`choix ${fini ? (i === r.correcte ? 'bonne-cochee' : i === choix ? 'fausse-cochee' : '') : ''}`}>
              <input type="radio" name={`${cle}`} checked={choix === i} disabled={!!fini} onChange={() => setChoix(i)} /><span>{o}</span>
            </label>
          ))}
        </div>
      )}
      {r.type === 'libre' && (
        <>
          <label class="champ">Votre réponse (facultatif : elle n'est pas analysée automatiquement)
            <textarea value={saisie} onInput={(e) => setSaisie((e.target as HTMLTextAreaElement).value)} />
          </label>
          {fini?.juste === null && (
            <div class="bloc plat" style={{ marginTop: 12 }}>
              <strong>Corrigé type</strong><p style={{ whiteSpace: 'pre-line' }}><Texte t={r.corrige} /></p>
              <strong>Autoévaluation : cochez les éléments présents dans votre réponse</strong>
              <div class="criteres">{r.criteres.map((c, i) => (
                <label key={i}><input type="checkbox" checked={!!coches[i]} onChange={() => { const v = [...coches]; v[i] = !v[i]; setCoches(v); }} />{c}</label>
              ))}</div>
              <button class="btn petit" onClick={autoEval}>Enregistrer mon autoévaluation</button>
            </div>
          )}
        </>
      )}
      {!fini && (
        <button class="btn" style={{ marginTop: 12 }} onClick={valider}
          disabled={(r.type === 'nombre' && !saisie.trim()) || (r.type === 'choix' && choix === null)}>
          {r.type === 'libre' ? 'Voir le corrigé' : 'Valider'}
        </button>
      )}
      {fini && (fini.juste !== null || r.type !== 'libre') && <Correction sq={sq} juste={fini.juste} details={fini.details} />}
      {fini && fini.juste === null && r.type === 'libre' && <Correction sq={sq} juste={null} />}
    </div>
  );
}

export function Exercice({ id }: { id: string }) {
  const c = useAsync(() => chargerExercice(id).then((e) => { if (!e) throw new Error('exercice introuvable'); return e; }), [id]);
  const meta = index.exercices.find((e) => e.id === id);
  const mat = meta ? matiereDe(meta.notions[0]) : undefined;
  return (
    <>
      <Fil elements={[{ label: "S'entraîner", href: '#/entrainer?onglet=exercices' }, ...(mat ? [{ label: mat.titre, href: `#/entrainer?p=${mat.id}&onglet=exercices` }] : []), { label: meta?.titre ?? 'Exercice' }]} />
      <Charge c={c}>{(ex) => (
        <>
          <h1 class="titre-page">{ex.titre}</h1>
          <p class="small muted">Niveau {ex.niveau}{ex.fictif && <span class="tag-fictif">situation fictive</span>} · Notions : {ex.notions.map((n) => <LienNotion key={n} id={n} />)}</p>
          <div class="bloc plat">
            <p><Texte t={ex.enonce} /></p>
            {ex.donnees && (
              <div class="tableau-wrap"><table>
                <thead><tr>{ex.donnees.entetes.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>{ex.donnees.lignes.map((l, i) => <tr key={i}>{l.map((v, j) => <td key={j} style={j > 0 ? { textAlign: 'right' } : undefined}>{v}</td>)}</tr>)}</tbody>
              </table></div>
            )}
          </div>
          {ex.questions.map((sq, i) => <SousQ key={sq.id} ex={ex} sq={sq} numero={i + 1} />)}
        </>
      )}</Charge>
    </>
  );
}
