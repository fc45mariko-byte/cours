# Apprendre vite : synthèses, exercices express, plan 14 jours

Objectif : acquérir le contenu du semestre en deux semaines.

## Synthèses (`content/syntheses/<matière>.json`, `#/syntheses`, `#/synthese/<matière>`)
- Une par matière (22), dans la langue d'enseignement de la matière ; validées par `scripts/syntheses.mjs` (longueurs plafonnées, tous les chapitres couverts dans l'ordre du catalogue).
- Par chapitre : idée clé, 4 à 7 points, formules, dates, distinctions, moyen mnémotechnique, 2 à 4 questions de récitation. Par matière : « par cœur » (8-12) et pièges (3-6).
- Mode récitation (`?reciter=1`) : seuls les titres et les questions restent, réponses repliées ; « Je sais » / « À revoir » enregistrés dans `marques['synth:<chapitre>']`.
- Filtre de chapitres `?ch=a,b` (utilisé par le plan). Pages `#/syntheses/parcoeur` et `#/syntheses/imprimer` (toutes les matières de l'emploi du temps).
- PDF : `imprimables/syntheses/<matière>.pdf` (2 à 5 pages) et `imprimables/syntheses/semestre.pdf`.
- Les moyens mnémotechniques sont des aides à la mémoire rédigées pour l'application ; les faits, chiffres et dates viennent des fiches du cours.

## Exercices express (`#/cahier/<matière>`)
- Par défaut : un exercice par partie (de préférence d'application), sans rappel ni méthode guidée, 3 lignes de réponse, corrigé en fin de document. `?format=complet` : cahier complet.
- PDF : `imprimables/<matière>.pdf` (express, 3 à 10 pages) et `imprimables/complet/<matière>.pdf`.

## Plan 14 jours (`#/plan`, `app/src/plan.ts`)
- Matières de l'emploi du temps ayant du contenu, en deux pistes (techniques ; langues et civilisations) réparties chacune sur les jours 1 à 10 par volume de notions : chaque jour mêle les deux.
- Chaque jour : lire la synthèse des chapitres du jour, réciter sans regarder, un exercice express, flashcards ; révisions des chapitres appris à J-1, J-3 et J-7 (récitation).
- Jours 11-12 : par cœur, récitation complète et examen blanc (piste technique puis langues). Jours 13-14 : chapitres « À revoir », erreurs, récitation finale.
- Début enregistré dans `preferences.planDebut` ; cases cochées dans `marques['plan:<jour>:<tâche>']`.

## Notes estimées (`#/notes`, `app/src/notes.ts`)
- Pour chaque matière de l'emploi du temps : note /20 probable si l'examen avait lieu maintenant, fourchette, fiabilité, chapitres les plus faibles.
- Niveau par notion : maîtrise mesurée (QCM, exercices, flashcards) ; sinon indices déclaratifs plafonnés (« Je sais » 0,5, « compris » 0,45, « lu » 0,25, chapitre terminé 0,25, fiche ouverte 0,1). Les notions jamais travaillées comptent 0.
- Un examen blanc sur toute la matière (moins de 21 jours, au moins 5 questions) sert de niveau aux notions non interrogées et compte pour moitié.
- Note = 20 × moyenne, arrondie au demi-point ; fourchette ± (1,5 + 5 × part non mesurée, − 1,5 avec examen), au moins ± 1.
- Pas de données : pas de note (invitation à un test rapide). Tourisme : indisponible tant que les supports manquent.
- Moyenne indicative non pondérée (coefficients absents). L'expression écrite et orale n'est pas évaluée (signalé pour les matières de langue, traduction et rédaction).
