// Modèle de données pédagogiques. Voir docs/refonte/phase-4-specification.md.

export type Niveau = 'P' | 'F' | 'A';
export type Couleur = 'pink' | 'peach' | 'lilac' | 'mint' | 'sky' | 'butter';

export interface NotionStub { id: string; titre: string; niveau: Niveau }
export interface ChapitreCatalogue { id: string; titre: string; notions: NotionStub[] }
export interface MatiereCatalogue {
  id: string; titre: string; statut: 'ORL' | 'ORL?' | 'COMP';
  semestres: string[]; enseignant: string; couleur: Couleur; categorie: string;
  chapitres: ChapitreCatalogue[];
}

/** Bloc de contenu du « fonctionnement » d'une fiche. */
export type Bloc =
  | { type: 'texte'; texte: string }
  | { type: 'etapes'; titre?: string; etapes: string[] }
  | { type: 'liste'; titre?: string; items: string[] }
  | { type: 'tableau'; titre?: string; entetes: string[]; lignes: string[][] }
  | { type: 'formule'; titre?: string; formule: string; legende?: string }
  | { type: 'calcul'; titre?: string; lignes: { libelle: string; valeur: string }[] }
  | { type: 'attention'; texte: string };

export interface Terme { fr: string; en?: string; es?: string; definition: string; distinction?: string; exemple?: string }

export interface Notion {
  id: string; titre: string; niveau: Niveau;
  prerequis?: string[]; connexes?: string[];
  question?: string; definition?: string; explication?: string;
  fonctionnement?: Bloc[];
  termes?: Terme[];
  exemple?: { fictif: boolean; texte: string; source?: string };
  contreExemple?: string;
  confusions?: { a: string; b: string; explication: string }[];
  verification?: string[];
  sources?: string[];
  verifieLe?: string;
  aVerifier?: string;
}

export type Competence =
  | 'memoriser' | 'comprendre' | 'distinguer' | 'appliquer'
  | 'interpreter' | 'resoudre' | 'analyser-cas' | 'detecter-erreur';

export interface Choix { id: string; texte: string; correct: boolean; explication: string }
export interface Question {
  id: string; notion: string;
  format: 'unique' | 'multiple' | 'vrai-faux';
  niveau: 1 | 2 | 3; competence: Competence;
  support?: { type: 'texte' | 'tableau'; texte?: string; entetes?: string[]; lignes?: string[][] };
  enonce: string; choix: Choix[]; explication?: string;
}

export interface Flashcard {
  id: string; notions: string[]; question: string;
  reponse: string; indispensables: string[]; complementaires?: string[];
  erreurs?: string[]; relance?: string;
}

export type ReponseAttendue =
  | { type: 'nombre'; valeur: number; tolerance?: number; unite?: string }
  | { type: 'ecriture'; lignes: { compte: string; libelle?: string; debit?: number; credit?: number }[] }
  | { type: 'choix'; options: string[]; correcte: number }
  | { type: 'libre'; criteres: string[]; corrige: string };

export interface SousQuestion {
  id: string; consigne: string; reponse: ReponseAttendue;
  correction: string[]; erreurs?: string[];
}
export interface Exercice {
  id: string; notions: string[];
  type: 'calcul' | 'ecriture' | 'cas' | 'traduction' | 'redaction' | 'analyse';
  titre: string; niveau: 1 | 2 | 3; enonce: string;
  donnees?: { entetes: string[]; lignes: string[][] };
  fictif?: boolean;
  questions: SousQuestion[];
}

export interface FichierChapitre {
  chapitre: string;
  notions: Notion[];
  questions?: Question[];
  flashcards?: Flashcard[];
  exercices?: Exercice[];
}

export interface Source {
  id: string; titre: string; auteur: string; url?: string;
  consulte?: string; acces: 'lu' | 'extrait' | 'reference'; pertinence: string;
}

/** Index généré au build par scripts/build-index.mjs. */
export interface IndexNotion extends NotionStub {
  matiere: string; chapitre: string; redigee: boolean;
  prerequis: string[]; connexes: string[];
  nbQuestions: number; nbFlashcards: number; nbExercices: number;
  definition?: string;
}
export interface IndexGlossaire extends Terme { notion: string; matiere: string }
export interface IndexGenere {
  genereLe: string;
  matieres: MatiereCatalogue[];
  notions: Record<string, IndexNotion>;
  questionsParNotion: Record<string, string[]>;
  flashcards: { id: string; notions: string[]; chapitre: string }[];
  exercices: { id: string; notions: string[]; chapitre: string; titre: string; niveau: number; type: string }[];
  questions: { id: string; notion: string; chapitre: string; niveau: number; competence: string }[];
  glossaire: IndexGlossaire[];
  sources: Source[];
}
