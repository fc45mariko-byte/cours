import { useEffect } from 'preact/hooks';
import { useRoute } from './hooks';
import { Layout } from './ui/Layout';
import { Panneau } from './ui/Panneau';
import { Accueil } from './pages/Accueil';
import { Matiere } from './pages/Matiere';
import { Notion } from './pages/Notion';
import { Entrainer, SerieQcm } from './pages/Entrainer';
import { Exercice } from './pages/Exercice';
import { Flashcards } from './pages/Flashcards';
import { ExamenConfig, ExamenSession } from './pages/Examen';
import { Reviser } from './pages/Reviser';
import { Approfondir } from './pages/Approfondir';
import { Explorer, Glossaire } from './pages/Explorer';
import { Reglages } from './pages/Reglages';
import { index } from './data';

export function App() {
  const { chemin, params } = useRoute();
  const [, racine, arg] = chemin.split('/');

  useEffect(() => {
    const titre = racine === 'notion' ? index.notions[arg]?.titre : racine === 'matiere' ? index.matieres.find((m) => m.id === arg)?.titre : '';
    document.title = titre ? `${titre} · L3 LEA` : 'L3 LEA Commerce international';
  }, [chemin]);

  switch (racine) {
    case '':
      return <Layout section="accueil" panneau={<Panneau />}><Accueil /></Layout>;
    case 'matiere':
      return <Layout section="accueil" panneau={<Panneau />}><Matiere id={arg} key={arg} /></Layout>;
    case 'notion':
      return <Layout section="accueil"><Notion id={arg} key={arg} /></Layout>;
    case 'entrainer':
      return <Layout section="entrainer">{arg === 'qcm' ? <SerieQcm key={params.toString()} params={params} /> : <Entrainer key={params.toString()} params={params} />}</Layout>;
    case 'exercice':
      return <Layout section="entrainer"><Exercice id={arg} key={arg} /></Layout>;
    case 'flashcards':
      return <Layout section="flashcards"><Flashcards key={params.toString()} params={params} /></Layout>;
    case 'examen':
      return <Layout section="examen">{arg === 'session' ? <ExamenSession /> : <ExamenConfig params={params} />}</Layout>;
    case 'reviser':
      return <Layout section="reviser" panneau={<Panneau />}><Reviser /></Layout>;
    case 'approfondir':
      return <Layout section="approfondir"><Approfondir params={params} /></Layout>;
    case 'explorer':
      return <Layout section="explorer"><Explorer params={params} /></Layout>;
    case 'glossaire':
      return <Layout section="explorer"><Glossaire /></Layout>;
    case 'reglages':
      return <Layout section="reglages"><Reglages /></Layout>;
    default:
      return <Layout section=""><div class="vide"><h1 class="titre-page">Page introuvable</h1><a class="btn" href="#/">Retour à l'accueil</a></div></Layout>;
  }
}
