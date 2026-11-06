# Rapport de complétude des cours (COURSE_COMPLETENESS_REPORT)

Établi le 31 octobre 2026.

## 1. Introduction au tourisme international : matière absente

**Constat : la matière n'existe pas dans le dépôt.** Il ne manque pas un chapitre, il manque la matière entière, et aucune source n'est disponible pour la reconstituer.

Recherches effectuées (mot-clé « touris », toutes casses) :

| Emplacement | Résultat |
|---|---|
| `content/catalogue.json` (22 matières, 111 chapitres) | Aucune matière, aucun chapitre |
| 111 fichiers de chapitre `content/**` | Seulement des mentions incidentes (tourisme espagnol dans eec et cve, touristification à Medellín dans cvl, exemple d’achat touristique dans dai.cvim) |
| `archive/ancien-site/` (19 fiches + master plan) | Aucune matière ; une mention incidente (« blogs de tourisme ») |
| Historique Git, branches `claude/commit-ewmdsd` et `archive/master-plans` (45 + 15 commits) | Aucun fichier ni message de commit |
| Livret de stage L3 LEA 2021-2022 (seul document de cours fourni) | Aucune mention |
| Dossiers de l'ordinateur connectables à la session | Aucun dossier partagé |
| `docs/refonte/phase-2-recherche.md`, ligne 72 | Seule trace : la maquette 2025-26 mentionnerait, « d'après un extrait peu fiable », un enseignement de tourisme international. Non vérifié. |

**Conséquence** : la matière figure au catalogue avec le statut « absente » et une explication, sans aucun chapitre. Aucun contenu générique de remplacement n'a été rédigé.

**Document nécessaire** : le syllabus, le plan de cours ou les supports de l'EC « Introduction au tourisme international » (intitulé exact, semestre, enseignant, liste et ordre des chapitres, contenu). À réception, la matière sera ajoutée au catalogue dans l'ordre et la terminologie d'origine, avec la mention de la source.

### Mise à jour du 6 novembre 2026

- **L'emploi du temps du semestre 5** (captures d'écran fournies) confirme la matière : « Intro international tourism », CM et TD le lundi (9 h - 11 h, salle 257). Elle est désormais rattachée au S5 et au statut « maquette d'Orléans ».
- **Les quatre fichiers transmis** (« Gestion du projet.pptx », « Gestion de projet.docx », « CM Compta CH1.pptx », « PLAN LECTURE 1 THE BRITISH SYSTEM OF GOVERNMENT.docx ») ne contiennent pas les documents : ce sont des pages HTML de connexion à Celene (« Les visiteurs anonymes ne peuvent pas accéder à ce cours »). Ils ont seulement permis de relever les enseignantes et les codes : Comptabilité générale (LLA5J6A) et Gestion de projet (LAL5J3D), Izabela Jankiewicz ; Civilisation britannique, LEA 3 semestre 5 (LLF5J30), Nora Vouteau.
- Le contenu du cours de tourisme reste donc **absent**. Pour le rédiger, il faut les supports téléchargés en étant connecté à Celene (fichiers .pptx, .docx ou .pdf réels).

## 2. Complétude des matières existantes

Toutes les notions cartographiées sont rédigées. La cartographie elle-même repose sur les intitulés et descriptifs officiels des EC (pages S5 et S6 de l'université, consultées par extrait) : **aucun syllabus détaillé ni support d'enseignant n'a été lu**. La complétude ci-dessous est donc relative au catalogue de l'application, pas au cours réellement dispensé.

| Code | Matière | Notions rédigées | Exercices | Points ouverts |
|---|---|---|---|---|
| tci | Techniques du commerce international | 66 / 66 | 9 | — |
| ici | Introduction au commerce international | 24 / 24 | 3 | Aucun descriptif officiel trouvé |
| dai | Droit des affaires internationales | 21 / 21 | 2 | Aucun descriptif officiel trouvé |
| dcl | Droit des contrats de la Common law | 23 / 23 | 3 | — |
| cpt | Comptabilité générale | 32 / 32 | 15 | — |
| gfi | Gestion financière | 18 / 18 | 9 | — |
| odg | Outils de gestion | 17 / 17 | 8 | — |
| mgi | Management interculturel | 13 / 13 | 2 | — |
| gdp | Gestion de projet | 18 / 18 | 2 | Aucun descriptif officiel trouvé |
| red | Rédaction de documents universitaires | 10 / 10 | 1 | Aucun descriptif officiel trouvé |
| aec | Anglais économique et commercial | 22 / 22 | 2 | Réécrite en anglais |
| tra | Traduction anglaise | 15 / 15 | 2 | — |
| cea | Compréhension et expression anglaises | 8 / 8 | **0** | Réécrite en anglais ; aucun exercice |
| eec | Espagnol économique et commercial | 15 / 15 | 1 | Réécrite en espagnol |
| tve | Thème et version espagnols | 15 / 15 | 2 | — |
| cvb | Civilisation britannique | 19 / 19 | 1 | Réécrite en anglais ; présence en S5 dans la maquette 2025-26 non confirmée |
| cve | Civilisation espagnole | 14 / 14 | 2 | Réécrite en espagnol |
| cva | Civilisation américaine | 10 / 10 | 1 | Réécrite en anglais |
| cvl | Civilisation latino-américaine | 10 / 10 | 1 | Réécrite en espagnol ; **présence dans la maquette non confirmée (ORL?)** |
| stg | Stage et rapport de stage | 10 / 10 | 3 | Règles issues du livret 2021-2022 ; livret en vigueur non consulté |
| eco | Économie internationale | 10 / 10 | 3 | Complément hors maquette |
| mks | Marketing international et supply chain | 4 / 4 | 2 | Complément hors maquette |

57 notions portent une mention « à vérifier » (données susceptibles d'évoluer) : liste dans `docs/refonte/phase-8-bilan.md`, section 4.

## 3. Contrôle automatique

- `tests/unit/integrite.test.ts` compare le contenu à `tests/reference/inventaire-contenu.json` (22 matières, 111 chapitres, 394 notions, 577 QCM, 169 flashcards, 292 exercices et sous-questions). Toute disparition ou tout renommage fait échouer les tests et la CI. Un ajout est accepté ; la référence se met à jour avec `node scripts/inventaire.mjs --ecrire`, uniquement après un ajout volontaire.
- Chaque matière porte un champ `completude` (`complete`, `incomplete`, `absente`), contrôlé au build : une matière sans chapitre doit être déclarée absente et expliquée.
- La matière tourisme apparaît dans la bibliothèque sous « À compléter », avec la mention « Source attendue », et sa page indique qu'aucun chapitre n'a été inventé (test de bout en bout `matière absente`).
