import { useMemo, useState } from 'preact/hooks';
import type { Question } from '../types';
import { corrigerQcm, type EtatChoix } from '../core/correction';
import { melangerChoix } from '../core/hasard';
import { index } from '../data';
import { Texte } from './communs';

export const LIBELLE_COMPETENCE: Record<string, string> = {
  memoriser: 'Mémoriser', comprendre: 'Comprendre', distinguer: 'Distinguer des notions proches', appliquer: 'Appliquer une règle',
  interpreter: 'Interpréter des données', resoudre: 'Résoudre un problème', 'analyser-cas': 'Analyser un cas', 'detecter-erreur': 'Détecter une erreur',
};

export function Support({ q }: { q: Question }) {
  if (!q.support) return null;
  return (
    <div class="bloc plat" style={{ padding: 16 }}>
      <div class="small muted" style={{ marginBottom: 6 }}>Document</div>
      {q.support.texte && <p><Texte t={q.support.texte} /></p>}
      {q.support.entetes && (
        <div class="tableau-wrap"><table>
          <thead><tr>{q.support.entetes.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{q.support.lignes!.map((l, i) => <tr key={i}>{l.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
        </table></div>
      )}
    </div>
  );
}

/** Une question de QCM en mode entraînement : rien n'est révélé avant la validation. */
export function QuestionQcm({ q, graine, onRepondu, numero }: {
  q: Question; graine: number; numero?: string;
  onRepondu: (juste: boolean, selection: string[]) => void;
}) {
  const choix = useMemo(() => melangerChoix(q.choix, graine), [q.id, graine]);
  const [sel, setSel] = useState<string[]>([]);
  const [res, setRes] = useState<{ juste: boolean; detail: Record<string, EtatChoix> } | null>(null);
  const multiple = q.format === 'multiple';
  const n = index.notions[q.notion];

  const basculer = (id: string) => {
    if (res) return;
    setSel(multiple ? (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]) : [id]);
  };
  const valider = () => {
    const r = corrigerQcm(q, sel);
    setRes(r);
    onRepondu(r.juste, sel);
  };

  return (
    <div class="bloc">
      <div class="entre small muted">
        <span>{numero} {LIBELLE_COMPETENCE[q.competence]} · niveau {q.niveau}</span>
        <span>{n?.titre}</span>
      </div>
      <Support q={q} />
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 600, fontSize: '1.1rem', margin: '12px 0 4px' }}><Texte t={q.enonce} /></legend>
        <div class="small muted">{multiple ? 'Plusieurs réponses possibles : cochez toutes les bonnes réponses.' : 'Une seule réponse.'}</div>
        <ul class="qcm-choix">
          {choix.map((c) => (
            <li key={c.id}>
              <label class={`choix ${res ? res.detail[c.id] : ''}`}>
                <input type={multiple ? 'checkbox' : 'radio'} name={`q-${q.id}`} checked={sel.includes(c.id)} disabled={!!res} onChange={() => basculer(c.id)} />
                <span>
                  <Texte t={c.texte} />
                  {res && (res.detail[c.id] !== 'fausse-ignoree' || c.correct) && (
                    <span class="expl">
                      <strong>{res.detail[c.id] === 'bonne-cochee' ? '✔ Bonne réponse. ' : res.detail[c.id] === 'bonne-oubliee' ? '✔ Bonne réponse oubliée. ' : '✘ Mauvaise réponse. '}</strong>
                      <Texte t={c.explication} />
                    </span>
                  )}
                  {res && res.detail[c.id] === 'fausse-ignoree' && <span class="expl muted"><Texte t={c.explication} /></span>}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <div aria-live="polite">
        {res && (
          <>
            <div class={`verdict ${res.juste ? 'ok' : 'ko'}`}>{res.juste ? '✔ Juste' : '✘ Pas tout à fait'}</div>
            {q.explication && <p style={{ marginTop: 10 }}><Texte t={q.explication} /></p>}
            <p class="small" style={{ marginTop: 10 }}>Revoir la fiche : <a href={`#/notion/${q.notion}`}>{n?.titre}</a></p>
          </>
        )}
      </div>
      {!res && <button class="btn" disabled={!sel.length} onClick={valider}>Valider</button>}
    </div>
  );
}
