# Plan de refonte (REFACTOR_PLAN)

Établi le 31 octobre 2026. Fondé sur PROJECT_AUDIT.md.

## Principes

- On garde Vite, Preact, TypeScript, le routage par fragment d'URL et GitHub Pages. Aucun nouveau framework ; toute nouvelle dépendance est justifiée et signalée.
- **Une seule source de contenu** : les fichiers `content/<matière>/<chapitre>.json`. Le fil, le lecteur de chapitre, la bibliothèque et l'espace de révision en sont des **vues**. Aucune copie de texte.
- Aucun identifiant de contenu n'est supprimé ni renommé (test d'intégrité).
- Interface en français ; contenu dans la langue d'enseignement de chaque matière (COURSE_LANGUAGE_AUDIT.md).
- Tout contenu ajouté qui n'appartient pas au cours (éditorial, sujets générés) est marqué comme tel.
- Pas de réseau social, pas de classement, pas de comparaison entre personnes, pas d'IA requise.

## Architecture cible

| Couche | Existe | À créer |
|---|---|---|
| Contenu de cours | Fichiers de chapitre JSON | — (seule source) |
| Métadonnées de matière | `catalogue.json` | `langue` (`fr`, `en`, `es`, ou bilingue pour la traduction), `annee`, `couverture` (composition visuelle), `completude` (`complete`, `incomplete`, `absente`) |
| Publications du fil | — | Générées au build dans un index séparé : chaque publication **référence** un contenu existant (fiche → concept ; confusions → comparaison ; tableau daté → frise ; termes → language bite ; exercice de cas → étude de cas ; QCM → quiz ; notions connexes → sujet de dissertation). Champs : id, type, matière, chapitre, langue, temps de lecture, référence. |
| Contenu éditorial hors cours | — | `content/publications/*.json` (World & Economy, deep dives, data stories) : date de publication, sources, séparation faits / analyse, liens vers les notions, mention « hors cours » |
| Lecteur de chapitre | Fiches isolées | Assemblage par chapitre : couverture, introduction, objectifs (questions centrales), concepts, explications, schémas, exemples, cas, exercices, synthèse (définitions), vérification, références |
| Index | 810 Ko au démarrage | Index de navigation léger + index du fil chargé par pages + index de recherche chargé à la demande |
| Progression | v1 | v2 additive : statut par contenu (vu, lu, pratiqué, compris, maîtrisé), enregistrés et collections, position de lecture, historique du fil, journal d'XP avec clé anti-doublon, quêtes, badges, calendrier de régularité non punitif |
| Maîtrise (6 états) | 4 états calculés sur les résultats | Non exploré (aucune trace) · Découvert (ouvert) · En apprentissage (lu ou premiers essais) · Pratiqué (essais, score < 75 %) · Compris (≥ 75 %) · Maîtrisé (≥ 75 %, réussite de niveau ≥ 2, rappel réussi à intervalle espacé) |
| Arbres de compétences | Champs `prerequis` et `connexes` | Visualisation par matière à partir de ces liens réels et de l'ordre des chapitres |
| Visuels | — | Schémas SVG produits à partir des données (frises, comparaisons, graphiques, cartes de processus) |
| PWA | — | Manifeste, service worker écrit à la main, lecture hors ligne des contenus enregistrés |

## Phases

Chaque phase se termine par un rapport : changements, fichiers créés ou modifiés, tests, problèmes non résolus, confirmation d'intégrité du contenu.

| Phase | Contenu | Livrables vérifiables |
|---|---|---|
| **0. Point de départ** (faite) | Tag `avant-learning-journal`, branche `claude/learning-journal`, documents d'audit, test d'intégrité, correctif de la sauvegarde illisible | 42 tests unitaires verts |
| **1. Modèle de données** | Métadonnées de langue, année et complétude ; migration de la progression vers la v2 avec copie de secours ; découpage de l'index ; test de langue par matière | Tests de migration (v1 → v2 sans perte), test de langue |
| **2. Design system** | Jetons : ivoire, anthracite, bleu nuit, accents bleu, sauge, terre cuite, bordeaux par discipline ; serif éditoriale pour les titres et sans-serif pour le texte ; espacements, grille, points de rupture ; composants de base | Page de référence interne des composants |
| **3. Structure** | Navigation à 5 destinations (Accueil, Fil, Bibliothèque, Étudier, Progrès), barre du bas sur mobile, barre latérale sur ordinateur, redirection des anciennes routes, pages Accueil et Bibliothèque (année → semestre → matière → chapitre) | Tests e2e : navigation, URL directes, anciennes routes |
| **4. Fil** | Modèles visuels par type de publication, onglets Pour vous / Mes matières / Monde et économie, filtres matière, type, difficulté, langue ; enregistrer, compris, à revoir, ouvrir le chapitre, partager ; reprise de lecture ; chargement progressif | Tests e2e des interactions, persistance après rechargement |
| **5. Lecteur de chapitre** | Compositions par discipline, blocs riches, schémas SVG | Les 111 chapitres s'affichent sans erreur (test exhaustif) |
| **6. Étudier** | Outils actuels intégrés (QCM, exercices, flashcards, examen, erreurs), sessions de révision par matière, sujets de dissertation générés (marqués), espace de plan et de rédaction | Tests e2e, aucune fonction actuelle perdue |
| **7. Monde et économie** | Articles curatés, datés et sourcés, faits et analyse séparés, liens vers les notions ; aucune actualité en direct simulée | Validation : date et source obligatoires |
| **8. Progrès et gamification** | Statuts, analyses, XP non cumulable sur une même action, niveaux, quêtes quotidiennes et hebdomadaires tirées du contenu, arbres de compétences, badges, régularité non punitive, réduction des animations | Tests unitaires anti-doublon, persistance |
| **9. Recette** | Préservation des cours, navigation mobile et bureau, fil, chapitres, recherche, persistance, rechargement, URL directes, chemins Pages, construction et déploiement | CI verte, rapport final |

## Chantiers de contenu (séparés du code)

| Chantier | Dépend de | Règle |
|---|---|---|
| Réécriture en anglais : aec, cea, cvb, cva | Accord donné (« sauf quand il faut que ce soit une autre langue ») ; confirmation de la langue de cvb et cva | Mêmes identifiants, même profondeur, aucune notion retirée |
| Réécriture en espagnol : eec, cve, cvl | Idem ; confirmation pour cve et cvl | Idem |
| Introduction au tourisme international | **Document source à fournir** | Rien n'est rédigé sans source ; la matière est affichée « absente : source attendue » |
| Exercices manquants (cea : aucun ; red, eec, cvb, cva, cvl : un seul) | — | Exercices nouveaux marqués « créés pour l'application » |

## Décisions en attente

1. Document source de la matière tourisme international.
2. Confirmation de la langue d'enseignement de dcl (proposé : français), cvb et cva (proposé : anglais), cve et cvl (proposé : espagnol).
3. Bascule de GitHub Pages vers la branche `claude/learning-journal` en fin de refonte (réglage du dépôt, à faire par le propriétaire).
4. Visuels : schémas SVG seulement, ou aussi photographies libres de droits (Wikimedia Commons) avec attribution.
5. Monde et économie : articles curatés et datés, sans service d'actualités (accès réseau limité dans l'environnement de travail).
