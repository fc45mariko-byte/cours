import { useEffect, useState } from 'preact/hooks';
import { chargerQuestions, index } from '../data';
import { aller, useAsync, useProgression } from '../hooks';
import { melanger, melangerChoix } from '../core/hasard';
import { store } from '../core/store';
import { bilanExamen } from '../core/examen';
import { corrigerQcm } from '../core/correction';
import { Charge, Texte } from '../ui/communs';
import { LIBELLE_COMPETENCE, Support } from '../ui/Qcm';
import { SelecteurPerimetre, questionsDuPerimetre } from './Entrainer';
import type { Question } from '../types';

export function ExamenConfig({ params }: { params: URLSearchParams }) {
  const p = useProgression();
  const [perimetre, setPerimetre] = useState(params.get('p') ?? '');
  const [nombre, setNombre] = useState('20');
  const [duree, setDuree] = useState('20');
  const dispo = questionsDuPerimetre(perimetre, '');
  const enCours = p.examen && !p.examen.terminee;

  const lancer = () => {
    const graine = Date.now() % 1_000_000;
    const ids = melanger(dispo.map((q) => q.id), graine).slice(0, Number(nombre));
    store.modifier((x) => {
      x.examen = { id: `ex-${Date.now()}`, debut: Date.now(), dureeMax: duree === '0' ? null : Number(duree) * 60, questions: ids, graine, reponses: {}, aRevoir: [], courante: 0, terminee: false, filtre: perimetre || 'toutes matières' };
    });
    aller('#/examen/session');
  };
  return (
    <>
      <h1 class="titre-page">Mode examen</h1>
      <p class="muted">Série sans correction pendant l'épreuve. Vous pouvez naviguer entre les questions et marquer celles à revoir. Le bilan détaillé s'affiche à la fin. Une session interrompue peut être reprise.</p>
      {enCours && (
        <div class="encadre attention entre"><span>Un examen est en cours ({p.examen!.questions.length} questions).</span>
          <a class="btn petit" href="#/examen/session">Reprendre</a></div>
      )}
      <div class="bloc">
        <SelecteurPerimetre valeur={perimetre} onChange={setPerimetre} />
        <div class="grille" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginTop: 12 }}>
          <label class="champ">Nombre de questions
            <select value={nombre} onChange={(e) => setNombre((e.target as HTMLSelectElement).value)}>{['10', '20', '30', '50'].map((n) => <option key={n}>{n}</option>)}</select>
          </label>
          <label class="champ">Chronomètre
            <select value={duree} onChange={(e) => setDuree((e.target as HTMLSelectElement).value)}>
              <option value="0">Sans limite</option>{['10', '20', '30', '45', '60'].map((n) => <option key={n} value={n}>{n} minutes</option>)}
            </select>
          </label>
        </div>
      </div>
      <div class="entre">
        <span class="muted">{dispo.length} questions disponibles · la série en contiendra {Math.min(dispo.length, Number(nombre))}</span>
        <button class="btn" disabled={!dispo.length} onClick={lancer}>{enCours ? 'Abandonner et lancer un nouvel examen' : "Commencer l'examen"}</button>
      </div>
      {p.examensPasses.length > 0 && (
        <>
          <h2>Examens passés</h2>
          <ul class="notions">{[...p.examensPasses].reverse().slice(0, 10).map((e) => (
            <li key={e.id}><span class="non-redigee" style={{ color: 'inherit' }}><span>{new Date(e.t).toLocaleString('fr-FR')} · {e.filtre}</span><strong>{e.score}/{e.total}</strong></span></li>
          ))}</ul>
        </>
      )}
    </>
  );
}

function Chrono({ fin, onFin }: { fin: number; onFin: () => void }) {
  const [reste, setReste] = useState(Math.max(0, fin - Date.now()));
  useEffect(() => {
    const t = setInterval(() => {
      const r = Math.max(0, fin - Date.now());
      setReste(r);
      if (r === 0) { clearInterval(t); onFin(); }
    }, 1000);
    return () => clearInterval(t);
  }, [fin]);
  const m = Math.floor(reste / 60000), s = Math.floor((reste % 60000) / 1000);
  return <span class="badge contour" role="timer" aria-live={m === 0 ? 'polite' : 'off'}>⏱ {m}:{String(s).padStart(2, '0')}</span>;
}

function terminer(qs: Question[]) {
  const ex = store.etat.examen;
  if (!ex || ex.terminee) return;
  const b = bilanExamen(qs, ex.reponses);
  const t = Date.now();
  // Les réponses d'examen comptent pour la maîtrise, comme en entraînement.
  for (const q of qs) {
    const sel = ex.reponses[q.id];
    if (sel?.length) store.repondreQcm(q.id, q.notion, q.notion.split('.')[0], corrigerQcm(q, sel).juste, t);
  }
  store.modifier((x) => {
    if (!x.examen) return;
    x.examen.terminee = true; x.examen.fin = t;
    x.examensPasses.push({ id: x.examen.id, t, score: b.score, total: b.total, filtre: x.examen.filtre });
  });
}

export function ExamenSession() {
  const p = useProgression();
  const ex = p.examen;
  const c = useAsync(() => chargerQuestions(ex?.questions ?? []), [ex?.id]);
  if (!ex) return <div class="vide">Aucun examen en cours. <a href="#/examen">Configurer un examen</a></div>;
  return <Charge c={c}>{(qs) => (ex.terminee ? <Bilan qs={qs} /> : <Epreuve qs={qs} />)}</Charge>;
}

function Epreuve({ qs }: { qs: Question[] }) {
  const p = useProgression();
  const ex = p.examen!;
  const i = Math.min(ex.courante, qs.length - 1);
  const q = qs[i];
  const sel = ex.reponses[q.id] ?? [];
  const choix = melangerChoix(q.choix, ex.graine + i);
  const multiple = q.format === 'multiple';
  const fin = ex.dureeMax ? ex.debut + ex.dureeMax * 1000 : null;
  const repondues = qs.filter((x) => (ex.reponses[x.id] ?? []).length).length;
  const aller_ = (k: number) => store.modifier((x) => { x.examen!.courante = k; });
  const choisir = (id: string) => store.modifier((x) => {
    const cur = x.examen!.reponses[q.id] ?? [];
    x.examen!.reponses[q.id] = multiple ? (cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id]) : [id];
  });
  const marquer = () => store.modifier((x) => {
    const a = x.examen!.aRevoir;
    x.examen!.aRevoir = a.includes(q.id) ? a.filter((y) => y !== q.id) : [...a, q.id];
  });
  return (
    <>
      <div class="entre">
        <h1 class="titre-page" style={{ margin: 0 }}>Examen</h1>
        <div class="ligne">{fin && <Chrono fin={fin} onFin={() => terminer(qs)} />}<span class="badge contour">{repondues}/{qs.length} répondues</span></div>
      </div>
      <nav class="progression-barre" aria-label="Questions de l'examen" style={{ margin: '12px 0' }}>
        {qs.map((x, k) => (
          <button key={x.id} onClick={() => aller_(k)} aria-current={k === i ? 'step' : undefined}
            aria-label={`Question ${k + 1}${(ex.reponses[x.id] ?? []).length ? ', répondue' : ''}${ex.aRevoir.includes(x.id) ? ', marquée à revoir' : ''}`}
            class={`${k === i ? 'courante' : (ex.reponses[x.id] ?? []).length ? 'repondue' : ''} ${ex.aRevoir.includes(x.id) ? 'revoir' : ''}`}>{k + 1}</button>
        ))}
      </nav>
      <div class="bloc">
        <div class="small muted">Question {i + 1} · niveau {q.niveau}</div>
        <Support q={q} />
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontWeight: 600, fontSize: '1.1rem', margin: '12px 0 4px' }}><Texte t={q.enonce} /></legend>
          <div class="small muted">{multiple ? 'Plusieurs réponses possibles.' : 'Une seule réponse.'}</div>
          <ul class="qcm-choix">
            {choix.map((c) => (
              <li key={c.id}><label class="choix">
                <input type={multiple ? 'checkbox' : 'radio'} name={`ex-${q.id}`} checked={sel.includes(c.id)} onChange={() => choisir(c.id)} />
                <span><Texte t={c.texte} /></span>
              </label></li>
            ))}
          </ul>
        </fieldset>
        <div class="entre">
          <button class="btn discret petit" onClick={marquer}>{ex.aRevoir.includes(q.id) ? '★ Marquée à revoir' : '☆ Marquer à revoir'}</button>
          <div class="ligne">
            <button class="btn secondaire" disabled={i === 0} onClick={() => aller_(i - 1)}>← Précédente</button>
            {i < qs.length - 1 && <button class="btn" onClick={() => aller_(i + 1)}>Suivante →</button>}
          </div>
        </div>
      </div>
      <div class="entre">
        <a class="btn discret" href="#/examen">Pause (reprendre plus tard)</a>
        <button class="btn" onClick={() => {
          if (repondues < qs.length && !confirm(`${qs.length - repondues} question(s) sans réponse. Terminer quand même ?`)) return;
          terminer(qs);
        }}>Terminer et voir le bilan</button>
      </div>
    </>
  );
}

function Bilan({ qs }: { qs: Question[] }) {
  const p = useProgression();
  const ex = p.examen!;
  const b = bilanExamen(qs, ex.reponses);
  const duree = ex.fin ? Math.round((ex.fin - ex.debut) / 60000) : 0;
  return (
    <>
      <h1 class="titre-page">Bilan de l'examen</h1>
      <div class="grille">
        <div class="bloc" style={{ margin: 0 }}><strong style={{ fontSize: '2.4rem' }}>{b.score}/{b.total}</strong><div class="muted">{b.pourcentage} % de réussite</div></div>
        <div class="bloc" style={{ margin: 0 }}><strong style={{ fontSize: '2.4rem' }}>{duree} min</strong><div class="muted">durée</div></div>
      </div>
      <h2>Par notion</h2>
      <ul class="notions">{Object.entries(b.parNotion).sort((a, c) => a[1].justes / a[1].total - c[1].justes / c[1].total).map(([n, r]) => (
        <li key={n}><a href={`#/notion/${n}`}><span>{index.notions[n]?.titre}</span><strong>{r.justes}/{r.total}</strong></a></li>
      ))}</ul>
      <h2>Par compétence</h2>
      <ul class="notions">{Object.entries(b.parCompetence).map(([c, r]) => (
        <li key={c}><span class="non-redigee" style={{ color: 'inherit' }}><span>{LIBELLE_COMPETENCE[c] ?? c}</span><strong>{r.justes}/{r.total}</strong></span></li>
      ))}</ul>
      <h2>Correction détaillée</h2>
      {qs.map((q, k) => {
        const sel = ex.reponses[q.id] ?? [];
        const d = corrigerQcm(q, sel).detail;
        return (
          <details class="chapitre" key={q.id}>
            <summary><span>{b.resultats[k].juste ? '✔' : '✘'} {k + 1}. {q.enonce.slice(0, 100)}{q.enonce.length > 100 ? '…' : ''}</span></summary>
            <Support q={q} />
            <p style={{ marginTop: 10 }}><Texte t={q.enonce} /></p>
            <ul class="qcm-choix">{q.choix.map((c) => (
              <li key={c.id}><div class={`choix ${d[c.id]}`}><span>{sel.includes(c.id) ? '☑' : '☐'} <Texte t={c.texte} /><span class="expl"><Texte t={c.explication} /></span></span></div></li>
            ))}</ul>
            <a class="small" href={`#/notion/${q.notion}`}>Revoir la fiche « {index.notions[q.notion]?.titre} »</a>
          </details>
        );
      })}
      <div class="ligne" style={{ marginTop: 16 }}>
        <a class="btn" href="#/examen">Nouvel examen</a>
        <a class="btn secondaire" href="#/reviser">Réviser mes erreurs</a>
      </div>
    </>
  );
}
