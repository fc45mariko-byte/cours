# Phase 4 — Spécification pédagogique et technique

## 1. La fiche-notion

Une notion = une fiche, étudiable seule. Les rubriques sont **optionnelles** : on n'affiche que celles qui sont pertinentes pour la notion.

| # | Rubrique | Repère visuel | Règle |
|---|---|---|---|
| 1 | Question centrale | ❓ | Une phrase : quel problème la notion résout |
| 2 | Définition | 📌 | Formulation rigoureuse, 1 à 3 phrases |
| 3 | En clair | — | Explication simple, sans jargon |
| 4 | Fonctionnement | ⚙️ | Étapes, conditions, exceptions ; schéma si utile |
| 5 | Terminologie | 🔤 | Termes, traductions EN / ES, distinctions avec les termes voisins |
| 6 | Exemple | 💡 | Situation précise et chiffrée. Badge **« exemple fictif »** ou **source** si l'exemple est réel |
| 7 | Contre-exemple | ↔️ | Cas où l'intuition se trompe |
| 8 | Confusions fréquentes | ⚠️ | Paires de notions souvent mélangées |
| 9 | Mise en pratique | ✏️ | Lien vers les exercices de la notion |
| 10 | Vérifier sa compréhension | 🧠 | 2 ou 3 questions ouvertes, sans aide |
| 11 | Références | 📚 | Sources avec date de vérification |

**En-tête de chaque fiche** : matière, chapitre, niveau (P / F / A), prérequis cliquables, notions connexes, état de maîtrise.

**Rédaction** : phrases courtes, aucune information non vérifiée présentée comme un fait, et date de vérification pour tout ce qui peut changer (taux, membres d'un accord, réglementations).

## 2. Modèle de données

Les fichiers JSON sont rangés dans `content/`, un dossier par matière. Toutes les relations passent par des identifiants stables.

```jsonc
// content/tci/matiere.json
{ "id": "tci", "titre": "Techniques du commerce international", "statut": "ORL",
  "semestres": ["S5","S6"], "enseignant": "Isabelle Noël", "couleur": "peach",
  "chapitres": [{ "id": "tci.incoterms", "titre": "Incoterms® 2020",
                  "notions": ["tci.incoterms.fonction", "..."] }] }

// content/tci/notions/tci.incoterms.transfert-risque.json
{ "id": "tci.incoterms.transfert-risque", "titre": "…", "niveau": "F",
  "prerequis": ["tci.incoterms.familles"], "connexes": ["tci.assurance.transport"],
  "question": "…", "definition": "…", "explication": "…",
  "fonctionnement": [{ "type": "etapes|tableau|schema|texte", "...": "…" }],
  "termes": [{ "fr": "…", "en": "…", "es": "…", "definition": "…", "distinction": "…" }],
  "exemple": { "fictif": true, "texte": "…" }, "contreExemple": "…",
  "confusions": [{ "a": "…", "b": "…", "explication": "…" }],
  "verification": ["…"], "sources": ["src.icc-incoterms-2020"],
  "verifieLe": "2026-10-15", "statutVerification": "verifie|a-verifier" }
```

Les autres objets suivent le même principe.

**`questions`** (QCM)

```jsonc
{ "id": "q.tci.incoterms.003", "notion": "tci.incoterms.transfert-risque",
  "format": "unique|multiple|vrai-faux|document",
  "niveau": 1-3, "competence": "memoriser|comprendre|distinguer|appliquer|interpreter|resoudre|analyser-cas|detecter-erreur",
  "support": { "type": "texte|tableau|image", "contenu": "…" },   // optionnel
  "enonce": "…",
  "choix": [{ "id": "a", "texte": "…", "correct": true,  "explication": "…" },
            { "id": "b", "texte": "…", "correct": false, "explication": "pourquoi ce distracteur est faux" }],
  "explicationGenerale": "…" }
```

**`flashcards`** (questions ouvertes)

```jsonc
{ "id": "f.gfi.rentabilite-liquidite", "notions": ["gfi.equilibre.rentabilite-vs-liquidite"],
  "question": "Pourquoi une entreprise rentable peut-elle manquer de trésorerie ?",
  "reponseReference": "…",
  "indispensables": ["…", "…"],        // critères d'autoévaluation
  "complementaires": ["…"],
  "erreursAEviter": ["…"],
  "relance": "…" }                     // proposée si un élément indispensable manque
```

**`exercices`**

```jsonc
{ "id": "e.cpt.amort-lineaire.01", "notions": ["cpt.investissements.amortissement-lineaire"],
  "type": "calcul|ecriture|cas|traduction|redaction|analyse-document",
  "enonce": "…", "donnees": { },
  "questions": [{ "id": "1", "consigne": "…",
     "reponse": { "type": "nombre", "valeur": 12000, "tolerance": 0.5, "unite": "€" }
               | { "type": "ecriture", "lignes": [{ "compte": "6811", "debit": 12000 }, "…"] }
               | { "type": "libre", "criteres": ["…"] },
     "correction": [{ "etape": "…", "calcul": "50 000 × 20 % = 10 000 €" }],
     "erreursPossibles": ["…"] }] }
```

**`glossaire`** : terme, définition, distinctions, traductions EN / ES, exemple d'emploi, notion liée.

**`sources`** : identifiant, titre, auteur ou organisme, URL, date de consultation, pertinence, niveau de vérification.

## 3. Système de QCM

- **Formats** :
  - réponse unique ;
  - réponses multiples (annoncé dans l'énoncé : « plusieurs réponses possibles ») ;
  - vrai / faux justifié ;
  - questions sur un **support** (texte, tableau, document commercial, extrait de bilan).
- **Niveaux** : 1 (mémoriser), 2 (comprendre ou appliquer), 3 (analyser un cas, interpréter des données, détecter une erreur).
- **Validation** : rien n'est révélé avant le clic sur « Valider ». Ensuite s'affichent, pour chaque choix, s'il est correct ou non, avec l'explication de la bonne réponse et des distracteurs, et le lien vers la fiche.
- **Score aux réponses multiples** : la question est juste seulement si l'ensemble coché est exact. Le détail (choix justes ou faux) reste affiché.
- **Ordre des choix** mélangé à chaque tirage, sauf pour les choix du type « Aucune de ces réponses ».
- **Mode examen** :
  - série paramétrable (matière, chapitres, nombre de questions, chronomètre facultatif) ;
  - navigation libre entre les questions, marquage « à revoir » ;
  - aucune correction pendant l'épreuve ;
  - bilan final : score, temps, réussite par notion et par compétence, revue question par question ;
  - session reprise si la page est fermée.
- **Contrôles qualité automatisés** :
  - au moins une réponse correcte ;
  - une explication pour chaque choix ;
  - notion existante ;
  - aucun choix dupliqué.

## 4. Flashcards et répétition espacée

1. La question ouverte s'affiche. L'étudiante écrit sa réponse (champ libre, facultatif) ou la formule mentalement.
2. Le bouton « Voir la réponse » affiche la réponse de référence et les **critères indispensables**, sous forme de cases à cocher.
3. **Autoévaluation honnête** : l'étudiante coche les éléments présents dans sa réponse, puis choisit « À revoir », « Difficile », « Correct » ou « Facile ». Si un élément indispensable n'est pas coché, l'application propose la **question de relance**.
4. **Aucune analyse automatique** de la réponse libre n'est faite, et l'interface le dit explicitement.
5. **Algorithme** : SM-2 simplifié.
   - Facteur de facilité initial à 2,5, borné entre 1,3 et 2,8.
   - Intervalles successifs : 1 jour, 3 jours, puis intervalle × facilité.
   - « À revoir » remet la carte à 0 et la fait revenir dans la même session.
   - Les cartes dues sont présentées en priorité.

## 5. Exercices

- **Calculs** : saisie numérique avec tolérance et unité. La correction détaille chaque étape et liste les erreurs typiques (par exemple, oublier de passer au HT).
- **Écritures comptables** : grille compte / débit / crédit. Vérification de l'équilibre et des comptes attendus. Les écritures équivalentes sont acceptées si elles sont listées comme variantes.
- **Études de cas, rédaction, traduction** : réponse libre, corrigé type et grille de critères en autoévaluation.

## 6. Mesure de la maîtrise

Ouvrir une fiche ne compte pas.

La maîtrise d'une notion est un score de 0 à 100, calculé à partir :

- des **QCM** : moyenne pondérée des 10 dernières réponses, les plus récentes comptant davantage. Une question de niveau 3 pèse plus qu'une question de niveau 1 ;
- des **exercices** : réussite à la première tentative ;
- des **flashcards** : autoévaluations récentes. La pondération est plus faible, car il s'agit d'une autoévaluation.

| Score | Libellé |
|---|---|
| Moins de 40 | **Fragile** |
| 40 à 74 | **En cours** |
| 75 et plus | **Maîtrisée** — exige au moins une réussite de niveau ≥ 2 et une activité datant de moins de 30 jours |

Le score baisse lentement sans révision. Un chapitre ou une matière affiche la moyenne de ses notions et la liste de ses notions fragiles.

**Historique des erreurs** : chaque question ou exercice raté est enregistré avec sa date. Le mode *Réviser* les repropose jusqu'à deux réussites consécutives.

## 7. Les modes

| Mode | Contenu |
|---|---|
| **Apprendre** | Parcours matière → chapitre → fiche, dans l'ordre des prérequis |
| **S'entraîner** | QCM et exercices filtrés par matière, chapitre, difficulté et type |
| **Flashcards** | Cartes dues, puis nouvelles cartes |
| **Approfondir** | Confusions, contre-exemples, questions de niveau 3, études de cas |
| **Réviser** | Notions fragiles, erreurs passées |
| **Examen** | Série chronométrée, sans aide |
| **Explorer** | Graphe des notions liées, recherche globale, glossaire |

## 8. Architecture technique

- **Pile** : **Vite, TypeScript et Preact** (environ 4 Ko), avec un routeur par hash.
  - Le site reste statique, donc compatible avec GitHub Pages.
  - Aucun serveur, aucune clé API.
- **Séparation** :
  - `content/` : données pédagogiques en JSON ;
  - `src/core/` : logique pure et testée (score, maîtrise, répétition espacée, correction des calculs, recherche) ;
  - `src/ui/` : composants ;
  - `src/styles/tokens.css` : jetons de design.
- **Recherche** : index plein texte construit au build (titres, définitions, termes, glossaire), insensible aux accents.
- **Persistance** :
  - `localStorage` versionné, avec gestion d'erreur : l'application fonctionne même si le stockage est indisponible ;
  - export / import JSON de la progression ;
  - session d'examen sauvegardée en continu.
- **États d'interface** : chargement, erreur, contenu indisponible (« notion en cours de rédaction »).
- **Accessibilité** :
  - navigation au clavier, focus visible ;
  - `aria-live` pour les corrections ;
  - texte alternatif pour les schémas ;
  - contraste AA ;
  - respect de `prefers-reduced-motion`.
- **Tests** :
  - validation des données (schémas, identifiants uniques, liens non cassés, au moins une bonne réponse) ;
  - tests unitaires de la logique (Vitest) ;
  - parcours de bout en bout dans Chromium (Playwright) : fiche, QCM, examen, flashcard, persistance, mobile.
- **Déploiement** : workflow GitHub Actions qui teste, construit et publie sur Pages. Il faudra régler « Source = GitHub Actions » dans les paramètres Pages du dépôt.

## 9. Système de design (inspiré de la maquette fournie)

Tous les choix visuels sont dans `tokens.css`. Le design peut être changé sans toucher au reste.

| Jeton | Valeur | Origine dans l'image |
|---|---|---|
| `--bg-page` | `#F7F3EE` (crème) | fond de l'application |
| `--bg-panel` | `#EFE9E3` | barre latérale et panneau de droite |
| `--surface` | `#FFFFFF` | puces d'icônes, badges, cartes blanches |
| `--ink` | `#1C1C1E` | texte, bouton actif noir |
| `--muted` | `#6E6A66` | libellés secondaires |
| `--pastel-pink` | `#F5C9C9` | carte IT & Software |
| `--pastel-peach` | `#F9DCBF` | carte Business |
| `--pastel-lilac` | `#D7D3FA` | carte Media Training |
| `--pastel-mint` | `#C4EBD8` | carte Interior |
| `--pastel-sky`, `--pastel-butter` | `#CFE6F7`, `#F6EBB5` | variantes pour les autres matières |
| `--radius-card` / `--radius-pill` | 22 px / 999 px | cartes et puces |
| `--font` | DM Sans (Google Fonts) | typographie de l'image |
| `--title-size` | `clamp(2.2rem, 5vw, 3.6rem)` | « Invest in your education » |

**Mise en page reprise de l'image** :

- barre latérale d'icônes rondes (accueil, réviser, apprendre, explorer, réglages), avec le bouton actif en noir ;
- grand titre, puis rangée de puces de filtre (icône dans une pastille blanche, puce active noire) ;
- grille de cartes de matières aux couleurs pastel, avec une étiquette de catégorie, un badge blanc (maîtrise en %) et un compteur de notions ;
- panneau de droite : profil local, graphique d'activité en barres empilées par matière, « Mes notions fragiles » et « À réviser aujourd'hui ».

**Sur mobile** : la barre latérale devient une barre d'onglets en bas de l'écran, et le panneau de droite passe sous la grille.

**Thème sombre** : jetons redéfinis selon `prefers-color-scheme`.
