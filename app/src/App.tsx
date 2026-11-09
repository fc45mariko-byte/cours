import { useEffect } from 'preact/hooks';
import { useRoute } from './hooks';
import { Layout } from './ui/Layout';
import { Gains } from './ui/Gains';
import { PagePublication } from './ui/Publication';
import { Accueil } from './pages/Accueil';
import { Fil } from './pages/Fil';
import { Bibliotheque } from './pages/Bibliotheque';
import { Matiere } from './pages/Matiere';
import { Chapitre } from './pages/Chapitre';
import { Notion } from './pages/Notion';
import { Etudier, Session, Vocabulaire } from './pages/Etudier';
import { Dissertation } from './pages/Dissertation';
import { Cahier, Cahiers } from './pages/Cahier';
import { Synthese, Syntheses, SynthesesSemestre, ParCoeur } from './pages/Synthese';
import { Plan } from './pages/Plan';
import { Progres, Arbre } from './pages/Progres';
import { Entrainer, SerieQcm } from './pages/Entrainer';
import { Exercice } from './pages/Exercice';
import { Flashcards } from './pages/Flashcards';
import { ExamenConfig, ExamenSession } from './pages/Examen';
import { Reviser } from './pages/Reviser';
import { Approfondir } from './pages/Approfondir';
import { Explorer, Glossaire } from './pages/Explorer';
import { Reglages } from './pages/Reglages';
import { index, chapitreCatalogue } from './data';

function Page() {
  const { chemin, params } = useRoute();
  const [, racine, arg, arg2] = chemin.split('/');
  const id = arg ? decodeURIComponent(arg) : '';

  useEffect(() => {
    const titre = racine === 'notion' ? index.notions[id]?.titre : racine === 'matiere' ? index.matieres.find((m) => m.id === id)?.titre
      : racine === 'chapitre' ? chapitreCatalogue(id)?.titre : '';
    document.title = titre ? `${titre} · LEA, The Learning Journal` : 'LEA, The Learning Journal';
  }, [chemin]);

  switch (racine) {
    case '': return <Layout section="accueil"><Accueil /></Layout>;
    case 'fil': return <Layout section="fil"><Fil params={params} /></Layout>;
    case 'monde': return <Layout section="fil"><Fil params={new URLSearchParams('onglet=monde')} /></Layout>;
    case 'pub': return <Layout section="fil" lecture><PagePublication id={id} key={id} /></Layout>;
    case 'bibliotheque': return <Layout section="bibliotheque"><Bibliotheque /></Layout>;
    case 'matiere': return <Layout section="bibliotheque"><Matiere id={id} key={id} /></Layout>;
    case 'chapitre': return <Layout section="bibliotheque" lecture><Chapitre id={id} key={id} params={params} /></Layout>;
    case 'notion': return <Layout section="bibliotheque" lecture><Notion id={id} key={id} /></Layout>;
    case 'etudier':
      if (id === 'session') return <Layout section="etudier"><Session params={params} key={params.toString()} /></Layout>;
      if (id === 'dissertation') return <Layout section="etudier"><Dissertation params={params} key={params.toString()} /></Layout>;
      if (id === 'vocabulaire') return <Layout section="etudier"><Vocabulaire params={params} key={params.toString()} /></Layout>;
      return <Layout section="etudier"><Etudier /></Layout>;
    case 'cahiers': return <Layout section="etudier"><Cahiers /></Layout>;
    case 'cahier': return <Layout section="etudier" lecture><Cahier id={id} key={id + params.toString()} params={params} /></Layout>;
    case 'syntheses':
      if (id === 'imprimer') return <Layout section="etudier" lecture><SynthesesSemestre /></Layout>;
      if (id === 'parcoeur') return <Layout section="etudier"><ParCoeur /></Layout>;
      return <Layout section="etudier"><Syntheses /></Layout>;
    case 'synthese': return <Layout section="etudier" lecture><Synthese id={id} key={id + params.toString()} params={params} /></Layout>;
    case 'plan': return <Layout section="etudier"><Plan /></Layout>;
    case 'entrainer':
      return <Layout section="etudier">{id === 'qcm' ? <SerieQcm key={params.toString()} params={params} /> : <Entrainer key={params.toString()} params={params} />}</Layout>;
    case 'exercice': return <Layout section="etudier" lecture><Exercice id={id} key={id} /></Layout>;
    case 'flashcards': return <Layout section="etudier"><Flashcards key={params.toString()} params={params} /></Layout>;
    case 'examen': return <Layout section="etudier">{id === 'session' ? <ExamenSession /> : <ExamenConfig params={params} />}</Layout>;
    case 'reviser': return <Layout section="etudier"><Reviser /></Layout>;
    case 'approfondir': return <Layout section="etudier"><Approfondir params={params} /></Layout>;
    case 'progres':
      if (id === 'arbre' && arg2) return <Layout section="progres"><Arbre id={arg2} key={arg2} /></Layout>;
      return <Layout section="progres"><Progres /></Layout>;
    case 'recherche': case 'explorer': return <Layout section="recherche"><Explorer params={params} key={params.get('q') ?? ''} /></Layout>;
    case 'glossaire': return <Layout section="glossaire"><Glossaire /></Layout>;
    case 'reglages': return <Layout section="reglages"><Reglages /></Layout>;
    default:
      return <Layout section=""><div class="vide"><h1 class="titre-page">Page introuvable</h1><a class="btn" href="#/">Retour à l’accueil</a></div></Layout>;
  }
}

export function App() {
  return <><Page /><Gains /></>;
}
