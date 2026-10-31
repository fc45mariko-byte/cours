# Rapport de réalisation, phase par phase

Refonte « LEA — The Learning Journal », branche `claude/learning-journal`, 31 octobre 2026.
Point de départ : commit `ba59873` (branche `claude/commit-ewmdsd`, toujours intacte) ; tag local `avant-learning-journal`.

## Contrôle d'intégrité du contenu (vaut pour toutes les phases)

`tests/unit/integrite.test.ts` compare le contenu à la référence établie avant toute modification : **22 matières d'origine, 111 chapitres, 394 notions, 577 QCM, 169 flashcards, 292 exercices et sous-questions, tous présents**. La seule entrée ajoutée au catalogue est la matière « Introduction au tourisme international », déclarée absente, sans chapitre. Aucune suppression, aucun renommage d'identifiant.

## Phase 0 — Audit et point de départ

- **Changements** : documents d'audit, test d'intégrité, correctif de la sauvegarde illisible (elle était écrasée par une progression vide).
- **Fichiers** : `docs/learning-journal/*.md`, `scripts/inventaire.mjs`, `tests/reference/inventaire-contenu.json`, `tests/unit/integrite.test.ts`, `app/src/core/store.ts`, `app/src/pages/Reglages.tsx`.
- **Tests** : 42 unitaires ; mutation vérifiée (une suppression simulée fait échouer le test).
- **Non résolu** : le tag `avant-learning-journal` n'a pas pu être poussé (refus 403 du serveur) ; il existe localement.

## Phase de contenu — langue d'enseignement

- **Changements** : aec, cea, cvb, cva réécrites en anglais ; eec, cve, cvl en espagnol (fiches, QCM, explications de chaque choix, flashcards, exercices, corrigés) ; titres reportés au catalogue.
- **Fichiers** : `content/{aec,cea,cvb,cva,eec,cve,cvl}/*.json`, `content/catalogue.json`.
- **Tests** : identifiants, bonnes réponses, niveaux, sources et exemples comparés fichier par fichier avant / après ; `tests/unit/langue.test.ts` (111 chapitres).
- **Non résolu** : confirmation de la langue d'enseignement de dcl, cvb, cva, cve, cvl par les supports de cours (voir COURSE_LANGUAGE_AUDIT.md).

## Phase 1 — Modèle de données

- **Changements** : `langue`, `annee`, `completude` par matière ; progression v2 (marques lu / compris / à revoir, enregistrements, historique, positions de lecture, chapitres ouverts et terminés, journal d'XP, badges, dissertations, préférences) ; migration additive avec copie brute de la v1 (`cours-l3-lea:progression:v1`) et conservation des champs inconnus ; index de démarrage allégé (glossaire et fil chargés à la demande).
- **Fichiers** : `app/src/core/store.ts`, `app/src/core/statut.ts`, `app/src/types.ts`, `app/src/data.ts`, `scripts/build-index.mjs`, `scripts/feed.mjs`.
- **Tests** : migration v1 → v2 (données conservées, copie, champ inconnu gardé), réparation de champs corrompus, relecture v2 ; test de bout en bout de migration dans le navigateur.

## Phase 2 — Design system

- **Changements** : jetons de couleur (ivoire, anthracite, bleu nuit ; bleu sourd, sauge, terre cuite, bordeaux, ocre, prune par discipline), Newsreader pour les titres et DM Sans pour le texte, échelle typographique, espacements, points de rupture (700 et 1 100 px), thème sombre, réduction des animations. Motifs de couverture dessinés à partir de la discipline (aucune image décorative).
- **Fichiers** : `app/src/styles/tokens.css`, `app/src/styles/app.css`, `app/src/ui/visuels.tsx`, `app/index.html`.
- **Note** : les teintes de discipline ont été testées avec le validateur de palettes ; elles ne conviennent pas comme palette de graphique (trop proches). Tous les graphiques sont donc à une seule série, d'une seule couleur, avec étiquettes et tableau de données.

## Phase 3 — Structure

- **Changements** : cinq destinations (Accueil, Fil, Bibliothèque, Étudier, Progrès), barre latérale éditoriale sur ordinateur, barre du bas sur mobile, recherche et réglages accessibles partout ; toutes les anciennes adresses restent valides (`#/reviser`, `#/explorer`, `#/entrainer`, `#/flashcards`, `#/examen`, `#/approfondir`, `#/notion/…`, `#/matiere/…`). Accueil éditorial (à la une, reprendre, concepts recommandés, chapitres récents, quêtes du jour, enregistrés, aperçu de progression). Bibliothèque : L3 → semestre → matière → chapitre → notions, couvertures, filtre de langue.
- **Fichiers** : `app/src/App.tsx`, `app/src/ui/Layout.tsx`, `app/src/pages/Accueil.tsx`, `Bibliotheque.tsx`, `Matiere.tsx`.
- **Tests** : navigation sur bureau et mobile, anciennes adresses, absence de défilement horizontal sur dix écrans.

## Phase 4 — Fil

- **Changements** : 1 607 publications dérivées des cours au build, par référence (concept, dossier, infographie, chronologie, comparaison, débat, quiz, langue, étude de cas, exercice, sujet de dissertation) + 8 articles éditoriaux ; onglets Pour vous, Mes matières, Monde et économie, Enregistrés, Déjà lus ; filtres matière, format, difficulté, langue ; enregistrer, compris, à revoir, ouvrir le chapitre, partager ; chargement par lots de 10 ; reprise de la position de lecture ; ordre figé pendant la lecture ; cartes de progression (quêtes, défi de révision, badge) insérées de loin en loin.
- **Fichiers** : `scripts/feed.mjs`, `app/src/classement.ts`, `app/src/pages/Fil.tsx`, `app/src/ui/Publication.tsx`.
- **Tests** : chaque publication renvoie à un contenu existant ; chaque chapitre a son dossier ; langue conservée ; chaque format s'affiche ; enregistrement et « compris » conservés après rechargement ; filtre de langue sans mélange.

## Phase 5 — Lecteur de chapitre

- **Changements** : couverture, introduction, objectifs (questions centrales), concepts clés, explications détaillées, schémas de procédure et frises, exemples sourcés, études de cas, synthèse, contrôle des connaissances (QCM du chapitre), références ; compositions différentes selon la discipline (chronologies d'abord en civilisation, terminologie d'abord en langues) ; reprise de lecture ; chapitre « terminé ». Rubriques dans la langue de la matière.
- **Fichiers** : `app/src/pages/Chapitre.tsx`, `app/src/pages/Notion.tsx`, `app/src/i18n.ts`.
- **Tests** : les 111 chapitres s'affichent avec l'attribut de langue de leur matière ; rubriques anglaises et espagnoles vérifiées ; chapitre terminé conservé.

## Phase 6 — Étudier

- **Changements** : espace Étudier (sessions de révision par matière ou chapitre avec questions, réponses, corrections, explications, renvoi au cours, recommandation ; QCM ; flashcards et questions courtes ; exercices ; traduction ; grammaire ; vocabulaire trilingue ; comptabilité ; examen blanc ; erreurs ; atelier de dissertation). Les outils existants sont conservés tels quels. Sujets générés à partir des questions réelles des fiches, toujours signalés « généré, hors cours ».
- **Fichiers** : `app/src/pages/Etudier.tsx`, `Dissertation.tsx`, `app/src/sujets.ts`, `Flashcards.tsx`, `Exercice.tsx`, `app/src/ui/Qcm.tsx`.
- **Tests** : session complète jusqu'au bilan ; dissertation enregistrée automatiquement et retrouvée après rechargement ; sujet issu d'une question réelle.

## Phase 7 — Monde et économie

- **Changements** : 8 articles (BCE et euro ; change et exportateur ; canal de Suez et mer Rouge ; Zara ; relocalisation ; véhicules électriques chinois ; Ricardo en chiffres ; Brexit et frontière), chacun daté, avec sa portée (historique, actuel, mécanisme durable), faits et analyse séparés, sources, notions de cours liées, mention « hors cours ». Aucune statistique inventée : les seules données chiffrées sont celles de Ricardo (1817) et un cas explicitement fictif.
- **Fichiers** : `content/publications/monde.json`, `content/sources.json`.
- **Tests** : validation au build (date, portée, sources, faits, notions) ; affichage des faits et des sources.
- **Non résolu** : pas de flux d'actualité en direct (aucun service externe) ; les articles portent une mention « à vérifier » pour les éléments susceptibles d'évoluer.

## Phase 8 — Progrès et gamification

- **Changements** : six statuts (non exploré, découvert, en apprentissage, pratiqué, compris, maîtrisé), « maîtrisé » seulement après évaluation ; XP dérivée d'activités vérifiables avec clé unique (aucun double comptage, rien pour une simple ouverture) ; niveaux progressifs ; quatre quêtes quotidiennes et cinq hebdomadaires tirées du contenu ; douze badges ; série tolérant un jour de pause ; calendrier de seize semaines ; arbres de compétences par matière à partir des chapitres et des prérequis réels ; annonces discrètes des gains.
- **Fichiers** : `app/src/jeu.ts`, `app/src/ui/Gains.tsx`, `app/src/pages/Progres.tsx`.
- **Tests** : XP unique par action, rien pour une ouverture, seuils de niveau, six statuts, série, quêtes, badges ; XP conservée après rechargement.

## Phase 9 — Recette

- **Tests** : 173 tests unitaires, 45 tests de bout en bout (bureau et mobile ; le parcours exhaustif des 111 chapitres est exécuté une fois, sur ordinateur). Construction et publication vérifiées ; CI inchangée (contenu, types, tests, fraîcheur du site publié, bout en bout).
- **PWA** : manifeste, icônes, service worker écrit à la main (réseau d'abord pour la page, cache d'abord pour les fichiers construits) : les chapitres déjà ouverts restent lisibles hors connexion.

## Problèmes non résolus

1. **Matière « Introduction au tourisme international »** : absente, aucune source ; document source à fournir.
2. **Confirmation des langues d'enseignement** de dcl, cvb, cva, cve, cvl.
3. **Exercices** encore rares dans les matières de langue et de civilisation (cea : aucun).
4. **Diagrammes interactifs** : les schémas de procédure et les frises sont dessinés à partir des données mais ne sont pas manipulables.
5. **Poids du démarrage** : le script principal (index compris) pèse environ 600 Ko non compressés ; le fil (465 Ko) et le glossaire (220 Ko) sont chargés à la demande.
6. **Publication** : GitHub Pages sert la branche `claude/commit-ewmdsd` ; la nouvelle version y est intégrée en fin de refonte (voir le rapport final).
