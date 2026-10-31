# Audit du projet (PROJECT_AUDIT)

Établi le 31 octobre 2026, avant la refonte « LEA — The Learning Journal ».
Point de départ figé : tag `avant-learning-journal` (commit `ba59873`, branche `claude/commit-ewmdsd`). Travaux de refonte : branche `claude/learning-journal`.

Ce document distingue ce qui **existe** de ce qui **reste à créer** (voir REFACTOR_PLAN.md).

## 1. Pile technique (existe)

| Élément | Version / détail |
|---|---|
| Construction | Vite 6.4.4, racine `app/`, `base: './'` (chemins relatifs) |
| Interface | Preact 10.29.8 (seule dépendance d'exécution) |
| Langage | TypeScript 5.9.3 strict (`tsconfig.json`, périmètre `app/src`) |
| Tests | Vitest 3.2.7 (unitaires), Playwright 1.56.1 (bout en bout, bureau 1400×900 et Pixel 7) |
| Routage | Maison, par fragment d'URL `#/chemin?params` (`app/src/hooks.ts`) |
| Style | CSS à jetons (`app/src/styles/tokens.css`, `app.css`), police DM Sans, thème clair / sombre |
| Code | Environ 3 000 lignes (`app/src`, `scripts`, `tests`) |

Absents : manifeste PWA, service worker, images, internationalisation de l'interface (textes français en dur), métadonnée de langue des matières.

## 2. Routes et écrans (existent)

| Route | Fichier | Fonction |
|---|---|---|
| `#/` | `pages/Accueil.tsx` | Grille des matières (cartes pastel), filtres par catégorie, maîtrise moyenne |
| `#/matiere/:id` | `pages/Matiere.tsx` | Chapitres et notions d'une matière |
| `#/notion/:id` | `pages/Notion.tsx` | Fiche : question, définition, explication, fonctionnement, terminologie FR/EN/ES, exemple, contre-exemple, confusions, vérification, sources, prérequis, connexes |
| `#/entrainer`, `#/entrainer/qcm` | `pages/Entrainer.tsx`, `ui/Qcm.tsx` | Sélection du périmètre et du niveau, série de QCM, bilan |
| `#/exercice/:id` | `pages/Exercice.tsx` | Exercices : nombre (saisie à la française), écriture comptable, choix, réponse libre à critères |
| `#/flashcards` | `pages/Flashcards.tsx` | Autoévaluation, répétition espacée |
| `#/reviser` | `pages/Reviser.tsx` | Erreurs à retravailler, notions fragiles, fiches lues mais jamais testées |
| `#/examen`, `#/examen/session` | `pages/Examen.tsx` | Examen chronométré ou non, sans correction, reprise après rechargement, bilan par notion et compétence |
| `#/approfondir` | `pages/Approfondir.tsx` | Confusions, contre-exemples, questions de niveau 3, études de cas |
| `#/explorer`, `#/glossaire` | `pages/Explorer.tsx` | Recherche insensible aux accents, glossaire trilingue |
| `#/reglages` | `pages/Reglages.tsx` | Export / import / effacement de la progression, thème |

Mise en page : `ui/Layout.tsx` (barre latérale d'icônes, barre du bas sur mobile limitée à 5 entrées), `ui/Panneau.tsx` (panneau de progression : flashcards dues, erreurs, activité sur 7 jours, notions fragiles).

## 3. Données pédagogiques (existent)

| Fichier | Rôle |
|---|---|
| `content/catalogue.json` | 22 matières → 111 chapitres → 394 notions (id, titre, niveau P / F / A), statut ORL / ORL? / COMP, semestres, enseignant, couleur, catégorie |
| `content/<matière>/<chapitre>.json` (111 fichiers) | Notions complètes, QCM, flashcards, exercices |
| `content/sources.json` | 104 sources (accès : lu, extrait, référence) |
| `scripts/build-index.mjs` | Validation (identifiants, liens, niveaux, une bonne réponse et une explication par choix, écritures équilibrées, exemple réel sourcé) et génération de `app/src/generated/index.json` (810 Ko, chargé au démarrage) |
| `app/src/data.ts` | Chargement paresseux des chapitres (`import.meta.glob`), calcul de maîtrise |
| `app/src/types.ts` | Types : `Notion`, `Bloc` (texte, étapes, liste, tableau, formule, calcul, attention), `Question`, `Flashcard`, `Exercice`, `Source` |

Identifiants stables : `matière.chapitre.notion`, `q.<chapitre>.NNN`, `f.<chapitre>.NNN`, `e.<chapitre>.NN/<sous-question>`. **La progression enregistrée repose sur eux.**

Origine du contenu : rédigé pour l'application (45 commits) à partir des descriptifs officiels des EC et des connaissances standard des disciplines. Aucun support d'enseignant n'a été lu. Détails : COURSE_INVENTORY.md, COURSE_LANGUAGE_AUDIT.md, COURSE_COMPLETENESS_REPORT.md.

## 4. Persistance (existe)

| Clé `localStorage` | Contenu |
|---|---|
| `cours-l3-lea:progression` | Version 1 : `qcm` et `exercices` (10 dernières tentatives), `cartes` (état SM-2), `erreurs`, `examen` en cours, `examensPasses`, `vues` (fiches ouvertes), `activite` (jour → matière → nombre) |
| `cours-l3-lea:theme` | `auto`, `light` ou `dark` |
| `cours-l3-lea:progression:illisible:<horodatage>` | Nouveau (phase 0) : copie d'une sauvegarde illisible trouvée au démarrage |

Fonctionnement : `core/store.ts` (classe `Store`, `migrer()`), export / import JSON, fonctionnement en mémoire si le stockage est indisponible.

Défaut corrigé en phase 0 : une sauvegarde illisible était écrasée par une progression vide à la première action. Elle est désormais copiée sous une clé de secours avant toute écriture ; si la copie échoue, plus rien n'est écrit.

## 5. Logique testée (existe)

`core/correction.ts` (QCM, nombres à la française, écritures comptables), `core/srs.ts` (SM-2 simplifié), `core/maitrise.ts` (maîtrise fondée sur les résultats uniquement : états nouvelle, fragile, en cours, maîtrisée ; oubli après 30 jours), `core/examen.ts`, `core/recherche.ts`, `core/hasard.ts` (mélange reproductible).

Tests : 42 unitaires (dont 6 d'intégrité du contenu et 2 de sauvegarde illisible ajoutés en phase 0) ; 10 scénarios Playwright exécutés sur bureau et mobile.

## 6. Déploiement (existe)

- GitHub Pages en mode « branche », depuis la racine de `claude/commit-ewmdsd`.
- `npm run build` : index → `tsc` → `vite build` → `scripts/publish.mjs` copie `dist/index.html` et `dist/assets/` à la racine et écrit `.nojekyll`.
- `archive/ancien-site/` est publié tel quel.
- CI `.github/workflows/verifier.yml` : contenu, types, tests unitaires, construction, fraîcheur du site publié, tests de bout en bout.

## 7. Limites techniques

1. Index de 810 Ko chargé au démarrage : coûteux sur mobile, à découper avant le fil.
2. Maîtrise à 4 états ; pas d'état « vu / lu / compris », pas de contenus enregistrés ni de position de lecture.
3. `migrer()` ne conserve que les champs connus : tout nouveau champ doit y être ajouté, sinon il est effacé au chargement.
4. Aucune langue déclarée par matière ; interface et contenu non distingués.
5. Aucun visuel (images, schémas, graphiques) dans le contenu.
6. Pas de PWA ni de lecture hors ligne.
7. Design actuel (pastels, cartes arrondies, icônes) contraire à la direction éditoriale demandée.

## 8. Risques de perte de données

| Risque | Mesure |
|---|---|
| Écrasement d'une sauvegarde illisible | Corrigé en phase 0 (copie de secours) |
| Champs nouveaux effacés par `migrer()` | Migration v1 → v2 additive, conservation des champs inconnus, copie brute v1 sous une clé de secours avant migration |
| Identifiant renommé ou supprimé | Test d'intégrité (phase 0) |
| Énoncé réécrit (langue) avec tentatives anciennes | Identifiant conservé ; changement signalé dans le rapport de phase |
| Liens enregistrés vers les anciennes routes | Redirections permanentes des anciennes routes |
| Publication cassée (chemins, archive) | Chemins relatifs conservés, `archive/` et `.nojekyll` conservés, test des URL directes |
